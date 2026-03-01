import { z } from "zod";

// ─── Cosmos DB document types ────────────────────────────────────────────────
// Each type maps to a Cosmos container. "id" is the Cosmos document id.

// ── Application ──────────────────────────────────────────────────────────────
export type ApplicationStatus =
  | "new"
  | "extracting"
  | "extracted"
  | "scoring"
  | "scored"
  | "error"
  | "completed";

export interface Application {
  id: string;
  officerId: string;
  customerName: string;
  requestedLimit: number;
  salesman: string;
  pdfUrl: string;
  pdfBlobName: string;
  status: ApplicationStatus;
  agentStage: string;
  createdAt: string;
  updatedAt: string;
}

export const insertApplicationSchema = z.object({
  customerName: z.string().min(1),
  requestedLimit: z.number().positive(),
  salesman: z.string().min(1),
});
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

// ── Extraction ────────────────────────────────────────────────────────────────
export interface ExtractedField {
  value: string;
  confidence: "high" | "medium" | "low";
  edited?: boolean;
  editedBy?: string;
}

export interface ExtractionDirector {
  name: string;
  id: string;
  age: number;
  share: string;
}

export interface ExtractionBankingFacility {
  bank: string;
  facility: string;
  limit: string;
  outstanding: string;
  status: string;
}

export interface ExtractionFields {
  companyName: ExtractedField;
  regNo: ExtractedField;
  incDate: ExtractedField;
  address: ExtractedField;
  natureOfBusiness: ExtractedField;
  paidUpCapital: ExtractedField;
  netWorth: ExtractedField;
  litigation: ExtractedField;
  litigationAmount: ExtractedField;
  specialAttention: ExtractedField;
  bankruptcy: ExtractedField;
  numDirectors: ExtractedField;
  directors: ExtractionDirector[];
  bankingFacilities: ExtractionBankingFacility[];
}

export interface Extraction {
  id: string;
  appId: string;
  rawText: string;
  fields: ExtractionFields;
  mandatoryFilled: number;
  mandatoryTotal: number;
  createdAt: string;
}

// ── Score ─────────────────────────────────────────────────────────────────────
export interface ScoreRuleFired {
  rule: string;
  weight: number;
  score: number;
  detail: string;
}

export interface Score {
  id: string;
  appId: string;
  totalScore: number; // 0–100
  riskCategory: "Low" | "Moderate" | "High";
  recommendedLimit: number;
  recommendation: "approve" | "review" | "reject";
  rationale: string;
  rulesFired: ScoreRuleFired[];
  agentThoughts: string;
  createdAt: string;
}

// ── Agent Task ────────────────────────────────────────────────────────────────
export type AgentTaskStatus = "queued" | "running" | "completed" | "error";
export type AgentTaskType =
  | "extraction"
  | "scoring"
  | "rationale"
  | "audit_check";

export interface AgentTask {
  id: string;
  appId: string;
  customerName: string;
  type: AgentTaskType;
  status: AgentTaskStatus;
  detail: string;
  createdAt: string;
  updatedAt: string;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  appId: string;
  action: string;
  officerId: string;
  detail: string;
  timestamp: string;
}

// ── Decision ──────────────────────────────────────────────────────────────────
export interface Decision {
  id: string;
  appId: string;
  officerDecision: "approve" | "reject" | "review";
  officerLimit: number;
  agentDecision: "approve" | "reject" | "review";
  agentLimit: number;
  isOverride: boolean;
  remarks: string;
  officerId: string;
  decidedAt: string;
}

// ── Legacy user type (kept for compatibility) ─────────────────────────────────
export interface User {
  id: string;
  username: string;
  password: string;
}
export interface InsertUser {
  username: string;
  password: string;
}
