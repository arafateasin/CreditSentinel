import type { Express, Request, Response, NextFunction } from "express";
import multer from "multer";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { uploadPDFToBlob } from "./services/azure.js";
import { runCreditAgentGraph, getOrCreateBus } from "./agents/credit-agent.js";
import { insertApplicationSchema } from "../shared/schema.js";

// ─── Multer (memory storage for Azure Blob upload) ────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are accepted"));
  },
});

// ─── Auth middleware (hardcoded demo token) ───────────────────────────────────
function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  // Accept Bearer token OR cookie "officer" for demo
  const VALID = ["Bearer credit-officer-token", "Bearer demo"];
  if (VALID.includes(header)) {
    (req as any).officerId = "officer-demo";
    return next();
  }
  // For hackathon demo: allow all if no auth header provided
  (req as any).officerId = "officer-demo";
  return next();
}

// ─── Background agent pipeline (LangGraph) ───────────────────────────────────
async function runAgentPipeline(
  appId: string,
  pdfUrl: string,
  fields: { requestedLimit: number },
  customerName: string,
): Promise<void> {
  await runCreditAgentGraph(appId, pdfUrl, fields.requestedLimit, customerName);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ── POST /api/applications – upload CTOS PDF + start agent ─────────────────
  app.post(
    "/api/applications",
    auth,
    upload.single("pdf"),
    async (req, res) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: "PDF file is required" });
          return;
        }

        const parsed = insertApplicationSchema.safeParse({
          customerName: req.body.customerName,
          requestedLimit: Number(req.body.requestedLimit),
          salesman: req.body.salesman,
        });
        if (!parsed.success) {
          res.status(400).json({ error: parsed.error.issues });
          return;
        }

        // Upload PDF to Blob Storage
        const { url: pdfUrl, blobName: pdfBlobName } = await uploadPDFToBlob(
          req.file.buffer,
          req.file.originalname,
        );

        // Create application record
        const app2 = await storage.createApplication({
          ...parsed.data,
          officerId: (req as any).officerId,
          pdfUrl,
          pdfBlobName,
        });

        await storage.addAuditLog({
          appId: app2.id,
          action: "application_created",
          officerId: (req as any).officerId,
          detail: `Application created for ${app2.customerName}`,
          timestamp: new Date().toISOString(),
        });

        // Start LangGraph pipeline in background (don't await)
        setImmediate(() =>
          runAgentPipeline(
            app2.id,
            pdfUrl,
            { requestedLimit: parsed.data.requestedLimit },
            app2.customerName,
          ),
        );

        res.status(201).json({
          id: app2.id,
          status: app2.status,
          message: "Agent pipeline started",
        });
      } catch (err: any) {
        console.error("[POST /api/applications]", err);
        res.status(500).json({ error: err.message });
      }
    },
  );

  // ── GET /api/applications – list all applications ──────────────────────────
  app.get("/api/applications", auth, async (req, res) => {
    try {
      const apps = await storage.listApplications();
      res.json(apps);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/applications/:id/stream – SSE real-time agent steps ──────────
  app.get("/api/applications/:id/stream", auth, (req, res) => {
    const id = req.params.id as string;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Send initial ping
    res.write(
      `data: ${JSON.stringify({
        node: "connected",
        message: "Stream connected",
        ts: new Date().toISOString(),
      })}\n\n`,
    );

    const bus = getOrCreateBus(id);
    const handler = (event: object) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    bus.on("step", handler);

    // Heartbeat every 15s to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(`: heartbeat\n\n`);
    }, 15_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      bus.off("step", handler);
    });
  });

  // ── GET /api/applications/:id – full application with extraction + score ────
  app.get("/api/applications/:id", auth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const app = await storage.getApplication(id);
      if (!app) {
        res.status(404).json({ error: "Application not found" });
        return;
      }
      const [extraction, score, decision, auditLogs] = await Promise.all([
        storage.getExtraction(id),
        storage.getScore(id),
        storage.getDecision(id),
        storage.getAuditLogs(id),
      ]);
      res.json({ app, extraction, score, decision, auditLogs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/applications/:id/decide – officer submits decision ───────────
  app.post("/api/applications/:id/decide", auth, async (req, res) => {
    try {
      const id = req.params.id as string;
      const { officerDecision, officerLimit, remarks } = req.body;
      if (
        !officerDecision ||
        !["approve", "reject", "review"].includes(officerDecision)
      ) {
        res.status(400).json({ error: "Invalid decision" });
        return;
      }

      const score = await storage.getScore(id);
      const agentDecision = score?.recommendation ?? "review";
      const agentLimit = score?.recommendedLimit ?? 0;
      const isOverride =
        officerDecision !== agentDecision ||
        Number(officerLimit) !== agentLimit;

      if (isOverride && !remarks?.trim()) {
        res.status(400).json({
          error: "Justification required when overriding agent recommendation",
        });
        return;
      }

      const decision = await storage.saveDecision({
        appId: id,
        officerDecision,
        officerLimit: Number(officerLimit),
        agentDecision,
        agentLimit,
        isOverride,
        remarks: remarks ?? "",
        officerId: (req as any).officerId,
        decidedAt: new Date().toISOString(),
      });

      await storage.updateApplicationStatus(id, "completed", "Completed");
      await storage.addAuditLog({
        appId: id,
        action: isOverride ? "officer_override" : "officer_decision",
        officerId: (req as any).officerId,
        detail: `Decision: ${officerDecision.toUpperCase()}. Limit: RM ${Number(
          officerLimit,
        ).toLocaleString()}. ${
          isOverride ? "OVERRIDE – Reason: " + remarks : "Matches agent."
        }`,
        timestamp: new Date().toISOString(),
      });

      res.json({ decision, message: "Decision saved and logged" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/agent-tasks – list background agent jobs ─────────────────────
  app.get("/api/agent-tasks", auth, async (req, res) => {
    try {
      const tasks = await storage.listAgentTasks();
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/dashboard/stats – KPIs for dashboard ─────────────────────────
  app.get("/api/dashboard/stats", auth, async (req, res) => {
    try {
      const apps = await storage.listApplications();
      const today = new Date().toDateString();
      const todayApps = apps.filter(
        (a) => new Date(a.createdAt).toDateString() === today,
      );
      const completed = apps.filter((a) => a.status === "completed");
      const decisions = await Promise.all(
        completed.map((a) => storage.getDecision(a.id)),
      );
      const overrides = decisions.filter((d) => d?.isOverride).length;
      const alignment =
        completed.length > 0
          ? Math.round(
              ((completed.length - overrides) / completed.length) * 100,
            )
          : 94;

      res.json({
        todayCount: todayApps.length,
        totalCompleted: completed.length,
        decisionAlignment: `${alignment}%`,
        avgTurnaround: "28 min",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /api/history – completed applications with decisions ───────────────
  app.get("/api/history", auth, async (req, res) => {
    try {
      const apps = await storage.listApplications();
      const completed = apps.filter((a) => a.status === "completed");
      const results = await Promise.all(
        completed.map(async (a) => {
          const [score, decision] = await Promise.all([
            storage.getScore(a.id),
            storage.getDecision(a.id),
          ]);
          return { app: a, score, decision };
        }),
      );
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
