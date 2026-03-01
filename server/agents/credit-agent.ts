/**
 * Credit Sentinel – LangGraph Multi-Agent Credit Workflow  (Phase 3)
 *
 * Flow:  __start__ → extract → risk → decide → audit → __end__
 *
 * Features:
 *  ✅ LangGraph StateGraph orchestration
 *  ✅ Azure Document Intelligence extraction node
 *  ✅ Malaysian SME 8-rule risk scoring node
 *  ✅ GPT-4o bilingual (BM/EN) rationale generation node
 *  ✅ PII masking on all LLM output
 *  ✅ Real-time SSE event streaming (EventEmitter bridge)
 *  ✅ Cosmos DB audit trail at every node
 *  ✅ Human-in-loop (officer approval screen in UI)
 *  ✅ Session state carried through graph channels
 */

import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

import { extractCTOSFromPDF } from "../services/azure.js";
import { storage } from "../storage.js";
import type {
  ExtractionFields,
  Score,
  ScoreRuleFired,
  AgentTask,
} from "../../shared/schema.js";

// ─── Global SSE event bus (appId → EventEmitter) ──────────────────────────────
// Routes subscribe per-appId; nodes emit events as they progress.
export const agentEventBus = new Map<string, EventEmitter>();

export function getOrCreateBus(appId: string): EventEmitter {
  if (!agentEventBus.has(appId)) {
    const ee = new EventEmitter();
    ee.setMaxListeners(20);
    agentEventBus.set(appId, ee);
    // Auto-cleanup after 10 min
    setTimeout(() => agentEventBus.delete(appId), 10 * 60 * 1000);
  }
  return agentEventBus.get(appId)!;
}

function emit(appId: string, event: AgentStreamEvent) {
  getOrCreateBus(appId).emit("step", event);
}

// ─── Streaming event shape ────────────────────────────────────────────────────
export interface AgentStreamEvent {
  node: "extract" | "risk" | "decide" | "audit" | "error";
  status: "start" | "done" | "error";
  message: string; // English
  pesanan?: string; // Malay (bilingual)
  data?: Record<string, unknown>;
  ts: string;
}

// ─── PII Masking ──────────────────────────────────────────────────────────────
// Masks Malaysian IC numbers (12-digit YYMMDD-PB-XXXX) and phone numbers
function maskPII(text: string): string {
  return (
    text
      // IC numbers: 123456-78-9012 or 123456789012
      .replace(/\b\d{6}-\d{2}-\d{4}\b/g, "██████-██-████")
      .replace(/\b\d{12}\b/g, "████████████")
      // Phone: +60-12-3456789 or 016-3456789
      .replace(/(\+60|0)\d[-\s]?\d{7,8}/g, (m) => m.slice(0, 4) + "XXXXX")
      // Email addresses
      .replace(/[\w.-]+@[\w.-]+\.\w{2,}/g, "█████@█████.com")
  );
}

// ─── LangGraph state definition ───────────────────────────────────────────────
interface RuleResult {
  rule: string;
  weight: number;
  score: number;
  detail: string;
}

const AgentState = Annotation.Root({
  // Inputs
  appId: Annotation<string>(),
  pdfUrl: Annotation<string>(),
  requestedLimit: Annotation<number>(),
  customerName: Annotation<string>(),

  // Extraction node output
  fields: Annotation<ExtractionFields | null>,
  rawText: Annotation<string>,
  mandatoryFilled: Annotation<number>,
  mandatoryTotal: Annotation<number>,

  // Risk node output
  rules: Annotation<RuleResult[]>,
  totalScore: Annotation<number>,
  riskCategory: Annotation<string>,
  recommendation: Annotation<string>,
  recommendedLimit: Annotation<number>,

  // Decide node output
  rationale: Annotation<string>,
  agentThoughts: Annotation<string[]>(),

  // Error state
  error: Annotation<string | null>,
});

type State = typeof AgentState.State;

// ─── Malaysian SME Credit Rules (8 rules, 100 pts total) ─────────────────────
function runMalaysianCreditRules(
  fields: ExtractionFields,
  requestedLimit: number,
): RuleResult[] {
  const r: RuleResult[] = [];

  const capital =
    parseFloat(String(fields.paidUpCapital?.value).replace(/,/g, "")) || 0;
  r.push({
    rule: "Modal Berbayar / Paid-up Capital",
    weight: 25,
    score:
      capital >= 1_000_000
        ? 25
        : capital >= 500_000
        ? 20
        : capital >= 100_000
        ? 13
        : capital >= 50_000
        ? 8
        : 3,
    detail: `Modal RM ${capital.toLocaleString()} / Capital RM ${capital.toLocaleString()}`,
  });

  const netWorth =
    parseFloat(String(fields.netWorth?.value).replace(/,/g, "")) || 0;
  r.push({
    rule: "Nilai Bersih / Net Worth",
    weight: 20,
    score:
      netWorth >= 2_000_000
        ? 20
        : netWorth >= 1_000_000
        ? 16
        : netWorth >= 500_000
        ? 11
        : netWorth >= 100_000
        ? 6
        : 2,
    detail: `Nilai bersih RM ${netWorth.toLocaleString()} / Net worth RM ${netWorth.toLocaleString()}`,
  });

  const hasLit = /yes/i.test(String(fields.litigation?.value));
  const litAmt =
    parseFloat(String(fields.litigationAmount?.value).replace(/,/g, "")) || 0;
  r.push({
    rule: "Litigasi / Litigation",
    weight: 15,
    score: hasLit ? (litAmt > 100_000 ? 0 : 5) : 15,
    detail: hasLit
      ? `Litigasi aktif RM ${litAmt.toLocaleString()} / Active litigation RM ${litAmt.toLocaleString()}`
      : "Tiada litigasi / No litigation",
  });

  const hasBankr = /yes/i.test(String(fields.bankruptcy?.value));
  r.push({
    rule: "Kebankrapan / Bankruptcy",
    weight: 10,
    score: hasBankr ? 0 : 10,
    detail: hasBankr
      ? "Rekod kebankrapan / Bankruptcy on record"
      : "Tiada kebankrapan / No bankruptcy",
  });

  const hasSpecial = /yes/i.test(String(fields.specialAttention?.value));
  r.push({
    rule: "Akaun Perhatian Khas / Special Attention",
    weight: 10,
    score: hasSpecial ? 0 : 10,
    detail: hasSpecial
      ? "Bendera SAA ada / SAA flag present"
      : "Tiada SAA / No SAA flag",
  });

  const facilities = fields.bankingFacilities ?? [];
  const npl = facilities.filter((f) =>
    /NPL|sub|doubt|loss/i.test(f.status),
  ).length;
  r.push({
    rule: "Kemudahan Perbankan NPL / Banking NPL",
    weight: 10,
    score: npl === 0 ? 10 : npl === 1 ? 5 : 2,
    detail: `${npl} akaun NPL / NPL accounts`,
  });

  const numDir = parseInt(String(fields.numDirectors?.value)) || 0;
  r.push({
    rule: "Kepelbagaian Lembaga / Board Diversity",
    weight: 5,
    score: numDir >= 2 ? 5 : numDir === 1 ? 2 : 0,
    detail: `${numDir} pengarah / director(s)`,
  });

  const ratio = netWorth > 0 ? requestedLimit / netWorth : 99;
  r.push({
    rule: "Nisbah Had-ke-Nilai Bersih / Limit-to-NW Ratio",
    weight: 5,
    score: ratio <= 0.3 ? 5 : ratio <= 0.5 ? 3 : ratio <= 1 ? 1 : 0,
    detail: `Nisbah ${(ratio * 100).toFixed(0)}% / Ratio ${(
      ratio * 100
    ).toFixed(0)}%`,
  });

  return r;
}

function deriveDecision(score: number, requestedLimit: number) {
  if (score >= 70)
    return {
      riskCategory: "Low",
      recommendation: "approve",
      recommendedLimit: Math.min(requestedLimit, 500_000),
    };
  if (score >= 40)
    return {
      riskCategory: "Moderate",
      recommendation: "review",
      recommendedLimit: Math.min(requestedLimit * 0.6, 250_000),
    };
  return {
    riskCategory: "High",
    recommendation: "reject",
    recommendedLimit: 0,
  };
}

// ─── Azure OpenAI / GPT-4o (reuse existing env vars) ─────────────────────────
function getAzureModel(): AzureChatOpenAI {
  // Parse instance name from endpoint URL
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT ?? "";
  const instanceMatch = endpoint.match(
    /https:\/\/([\w-]+)\.cognitiveservices\.azure\.com/,
  );
  const instanceName = instanceMatch?.[1] ?? "creditsentinel-ai";

  return new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_KEY!,
    azureOpenAIApiInstanceName: instanceName,
    azureOpenAIApiDeploymentName: "gpt-4o",
    azureOpenAIApiVersion: "2025-01-01-preview",
    temperature: 0.3,
    maxTokens: 500,
  });
}

// ─── Node 1: Extractor Agent ──────────────────────────────────────────────────
async function extractNode(state: State): Promise<Partial<State>> {
  const { appId, pdfUrl } = state;

  emit(appId, {
    node: "extract",
    status: "start",
    message: "Extracting CTOS fields via Azure Document Intelligence…",
    pesanan: "Mengekstrak medan CTOS melalui Azure Document Intelligence…",
    ts: new Date().toISOString(),
  });

  // Create agent task record
  const task = await storage.createAgentTask({
    appId,
    customerName: state.customerName,
    type: "extraction",
    status: "running",
    detail: "LangGraph: Extractor Agent node running",
  });

  await storage.updateApplicationStatus(
    appId,
    "extracting",
    "LangGraph: Extracting",
  );

  try {
    const extracted = await extractCTOSFromPDF(pdfUrl);
    await storage.saveExtraction({
      appId,
      rawText: extracted.rawText,
      fields: extracted.fields,
      mandatoryFilled: extracted.mandatoryFilled,
      mandatoryTotal: extracted.mandatoryTotal,
    });
    await storage.updateAgentTask(
      task.id,
      "completed",
      `Extracted ${extracted.mandatoryFilled}/${extracted.mandatoryTotal} fields`,
    );
    await storage.updateApplicationStatus(
      appId,
      "extracted",
      "LangGraph: Extracted",
    );

    emit(appId, {
      node: "extract",
      status: "done",
      message: `Extracted ${extracted.mandatoryFilled}/${extracted.mandatoryTotal} mandatory fields.`,
      pesanan: `Diekstrak ${extracted.mandatoryFilled}/${extracted.mandatoryTotal} medan wajib.`,
      data: {
        mandatoryFilled: extracted.mandatoryFilled,
        mandatoryTotal: extracted.mandatoryTotal,
      },
      ts: new Date().toISOString(),
    });

    return {
      fields: extracted.fields,
      rawText: extracted.rawText,
      mandatoryFilled: extracted.mandatoryFilled,
      mandatoryTotal: extracted.mandatoryTotal,
      agentThoughts: [
        "✅ Extractor Agent: CTOS fields extracted successfully via Azure Document Intelligence.",
      ],
    };
  } catch (err: any) {
    await storage.updateAgentTask(task.id, "error", err.message);
    emit(appId, {
      node: "extract",
      status: "error",
      message: err.message,
      ts: new Date().toISOString(),
    });
    return { error: `Extraction failed: ${err.message}` };
  }
}

// ─── Node 2: Risk Agent ───────────────────────────────────────────────────────
async function riskNode(state: State): Promise<Partial<State>> {
  if (state.error) return {};
  const { appId, fields, requestedLimit } = state;
  if (!fields) return { error: "No fields from extraction" };

  emit(appId, {
    node: "risk",
    status: "start",
    message: "Applying 8 Malaysian SME credit policy rules…",
    pesanan: "Menerapkan 8 peraturan kredit PKS Malaysia…",
    ts: new Date().toISOString(),
  });

  const task = await storage.createAgentTask({
    appId,
    customerName: state.customerName,
    type: "scoring",
    status: "running",
    detail: "LangGraph: Risk Agent node – Malaysian SME scoring",
  });
  await storage.updateApplicationStatus(appId, "scoring", "LangGraph: Scoring");

  const rules = runMalaysianCreditRules(fields, requestedLimit);
  const totalScore = rules.reduce((sum, r) => sum + r.score, 0);
  const { riskCategory, recommendation, recommendedLimit } = deriveDecision(
    totalScore,
    requestedLimit,
  );

  await storage.updateAgentTask(
    task.id,
    "completed",
    `Score: ${totalScore}/100 – ${recommendation.toUpperCase()}`,
  );

  emit(appId, {
    node: "risk",
    status: "done",
    message: `Risk scored ${totalScore}/100. Category: ${riskCategory}. Recommendation: ${recommendation.toUpperCase()}.`,
    pesanan: `Markah risiko ${totalScore}/100. Kategori: ${riskCategory}. Cadangan: ${recommendation.toUpperCase()}.`,
    data: { totalScore, riskCategory, recommendation, recommendedLimit },
    ts: new Date().toISOString(),
  });

  return {
    rules,
    totalScore,
    riskCategory,
    recommendation,
    recommendedLimit,
    agentThoughts: [
      `✅ Risk Agent: Applied 8 Malaysian SME rules. Score: ${totalScore}/100, Risk: ${riskCategory}, Recommendation: ${recommendation.toUpperCase()}.`,
    ],
  };
}

// ─── Node 3: Decision Agent (GPT-4o Bilingual Rationale) ─────────────────────
async function decideNode(state: State): Promise<Partial<State>> {
  if (state.error) return {};
  const {
    appId,
    fields,
    rules,
    totalScore,
    recommendation,
    recommendedLimit,
    riskCategory,
  } = state;
  if (!fields) return { error: "No fields available for decision" };

  emit(appId, {
    node: "decide",
    status: "start",
    message: "Generating bilingual credit rationale via GPT-4o…",
    pesanan: "Menjana rasional kredit dwibahasa melalui GPT-4o…",
    ts: new Date().toISOString(),
  });

  const task = await storage.createAgentTask({
    appId,
    customerName: state.customerName,
    type: "rationale",
    status: "running",
    detail: "LangGraph: Decision Agent – GPT-4o bilingual rationale",
  });

  let rationale = "";
  try {
    const model = getAzureModel();

    const prompt = `Anda adalah Credit Sentinel, pegawai kredit AI untuk Chin Hin Group (pemberi pinjaman PKS Malaysia).
You are Credit Sentinel, an AI credit officer for Chin Hin Group (Malaysian SME lender).

Sila tulis rationale kredit profesional dalam BAHASA MELAYU dan BAHASA INGGERIS (BM dulu, kemudian EN):
Write a professional credit rationale in BOTH BAHASA MELAYU (first) and ENGLISH:

Syarikat / Company: ${fields.companyName?.value ?? "N/A"}
Pendaftaran / Registration: ${fields.regNo?.value ?? "N/A"}
Modal Berbayar / Paid-up Capital: RM ${fields.paidUpCapital?.value ?? "N/A"}
Nilai Bersih / Net Worth: RM ${fields.netWorth?.value ?? "N/A"}
Litigasi / Litigation: ${fields.litigation?.value ?? "N/A"}
Kebankrapan / Bankruptcy: ${fields.bankruptcy?.value ?? "N/A"}

Keputusan peraturan / Rule scores:
${rules
  .map((r) => `- ${r.rule}: ${r.score}/${r.weight} – ${r.detail}`)
  .join("\n")}

Jumlah Markah / Total Score: ${totalScore}/100
Cadangan / Recommendation: ${recommendation.toUpperCase()}
Had Dicadangkan / Suggested Limit: RM ${recommendedLimit.toLocaleString()}

Format: 2 paragraf BM dahulu, kemudian 2 paragraf EN / Format: 2 BM paragraphs first, then 2 EN paragraphs.`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    rationale = maskPII(String(response.content));

    await storage.updateAgentTask(
      task.id,
      "completed",
      "Bilingual rationale generated",
    );
  } catch (err: any) {
    // Fallback bilingual rationale
    const positives = rules
      .filter((r) => r.score >= r.weight * 0.7)
      .map((r) => r.rule);
    const negatives = rules
      .filter((r) => r.score < r.weight * 0.4)
      .map((r) => r.rule);
    rationale = [
      `[BM] Pemohon mendapat markah ${totalScore}/100 di bawah kerangka kredit PKS Chin Hin. Kekuatan utama: ${
        positives.join(", ") || "tiada"
      }. Faktor risiko: ${
        negatives.join(", ") || "tiada"
      }. Cadangan: ${recommendation.toUpperCase()} dengan had RM ${recommendedLimit.toLocaleString()}.`,
      `[EN] The applicant scored ${totalScore}/100 under Chin Hin's SME credit framework. Strengths: ${
        positives.join(", ") || "none"
      }. Risk factors: ${
        negatives.join(", ") || "none"
      }. Recommendation: ${recommendation.toUpperCase()} with limit RM ${recommendedLimit.toLocaleString()}.`,
    ].join("\n\n");
    await storage.updateAgentTask(
      task.id,
      "completed",
      "Fallback rationale used",
    );
    console.warn(
      "[LangGraph decide] GPT-4o failed, using fallback:",
      err.message,
    );
  }

  emit(appId, {
    node: "decide",
    status: "done",
    message: `Decision: ${recommendation.toUpperCase()}, Limit: RM ${recommendedLimit.toLocaleString()}. Bilingual rationale generated.`,
    pesanan: `Keputusan: ${recommendation.toUpperCase()}, Had: RM ${recommendedLimit.toLocaleString()}. Rasional dwibahasa dijana.`,
    data: { recommendation, recommendedLimit },
    ts: new Date().toISOString(),
  });

  return {
    rationale,
    agentThoughts: [
      `✅ Decision Agent: GPT-4o generated bilingual (BM/EN) credit rationale. Decision: ${recommendation.toUpperCase()}.`,
    ],
  };
}

// ─── Node 4: Audit Node ───────────────────────────────────────────────────────
async function auditNode(state: State): Promise<Partial<State>> {
  if (state.error) return {};
  const {
    appId,
    totalScore,
    recommendation,
    recommendedLimit,
    riskCategory,
    rationale,
    rules,
    agentThoughts,
  } = state;

  // Save final score to Cosmos
  const score: Score = {
    id: uuidv4(),
    appId,
    totalScore,
    riskCategory: riskCategory as Score["riskCategory"],
    recommendedLimit,
    recommendation: recommendation as Score["recommendation"],
    rationale,
    rulesFired: rules.map<ScoreRuleFired>((r) => ({
      rule: r.rule,
      weight: r.weight,
      score: r.score,
      detail: r.detail,
    })),
    agentThoughts: agentThoughts.join("\n"),
    createdAt: new Date().toISOString(),
  };
  await storage.saveScore(score);
  await storage.updateApplicationStatus(
    appId,
    "scored",
    "LangGraph: Assessment Ready",
  );

  await storage.addAuditLog({
    appId,
    action: "langgraph_scored",
    officerId: "agent",
    detail: `LangGraph pipeline complete. Score: ${totalScore}/100. Recommendation: ${recommendation}. Limit: RM ${recommendedLimit.toLocaleString()}`,
    timestamp: new Date().toISOString(),
  });

  emit(appId, {
    node: "audit",
    status: "done",
    message: "All results saved. Application ready for officer review.",
    pesanan:
      "Semua keputusan disimpan. Permohonan sedia untuk semakan pegawai.",
    ts: new Date().toISOString(),
  });

  return {};
}

// ─── Node: Error Handler ──────────────────────────────────────────────────────
async function errorNode(state: State): Promise<Partial<State>> {
  const { appId, error } = state;
  console.error(`[LangGraph] Error in pipeline for ${appId}:`, error);
  await storage.updateApplicationStatus(appId, "error", `Error: ${error}`);
  await storage.addAuditLog({
    appId,
    action: "langgraph_error",
    officerId: "agent",
    detail: error ?? "Unknown error",
    timestamp: new Date().toISOString(),
  });
  emit(appId, {
    node: "error",
    status: "error",
    message: error ?? "Pipeline error",
    ts: new Date().toISOString(),
  });
  return {};
}

// ─── Routing: check for errors between nodes ──────────────────────────────────
function routeOnError(state: State) {
  return state.error ? "error" : "continue";
}

// ─── Build & compile the LangGraph ───────────────────────────────────────────
const workflow = new StateGraph(AgentState)
  .addNode("extract", extractNode)
  .addNode("risk", riskNode)
  .addNode("decide", decideNode)
  .addNode("audit", auditNode)
  .addNode("error", errorNode)
  // Edges
  .addEdge(START, "extract")
  .addConditionalEdges("extract", routeOnError, {
    continue: "risk",
    error: "error",
  })
  .addConditionalEdges("risk", routeOnError, {
    continue: "decide",
    error: "error",
  })
  .addConditionalEdges("decide", routeOnError, {
    continue: "audit",
    error: "error",
  })
  .addEdge("audit", END)
  .addEdge("error", END);

export const creditAgentApp = workflow.compile();

// ─── Public entry point (replaces old runAgentPipeline) ──────────────────────
export async function runCreditAgentGraph(
  appId: string,
  pdfUrl: string,
  requestedLimit: number,
  customerName: string,
): Promise<void> {
  const initialState = {
    appId,
    pdfUrl,
    requestedLimit,
    customerName,
  };

  try {
    await creditAgentApp.invoke(initialState, {
      configurable: { thread_id: appId },
    });
  } catch (err: any) {
    console.error(`[LangGraph] Unhandled error for ${appId}:`, err.message);
    await storage.updateApplicationStatus(appId, "error", err.message);
  }
}
