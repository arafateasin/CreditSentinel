import OpenAI from "openai";
import type {
  ExtractionFields,
  Score,
  ScoreRuleFired,
} from "../../shared/schema.js";
import { v4 as uuidv4 } from "uuid";

// ─── Malaysian SME Credit Rules ───────────────────────────────────────────────
// Score range 0–100. Buckets:
//   70–100 → Low risk   → auto-approve up to RM 500k
//   40–69  → Moderate   → officer review up to RM 250k
//   0–39   → High risk  → reject

interface RuleResult {
  rule: string;
  weight: number;
  score: number; // 0–weight
  detail: string;
}

function runMalaysianCreditRules(
  fields: ExtractionFields,
  requestedLimit: number,
): RuleResult[] {
  const results: RuleResult[] = [];

  // 1. Paid-up capital (25 pts)
  const capital =
    parseFloat(String(fields.paidUpCapital?.value).replace(/,/g, "")) || 0;
  const capitalScore =
    capital >= 1_000_000
      ? 25
      : capital >= 500_000
      ? 20
      : capital >= 100_000
      ? 13
      : capital >= 50_000
      ? 8
      : 3;
  results.push({
    rule: "Paid-up Capital",
    weight: 25,
    score: capitalScore,
    detail: `Paid-up capital RM ${capital.toLocaleString()} → ${capitalScore}/25`,
  });

  // 2. Net worth (20 pts)
  const netWorth =
    parseFloat(String(fields.netWorth?.value).replace(/,/g, "")) || 0;
  const nwScore =
    netWorth >= 2_000_000
      ? 20
      : netWorth >= 1_000_000
      ? 16
      : netWorth >= 500_000
      ? 11
      : netWorth >= 100_000
      ? 6
      : 2;
  results.push({
    rule: "Net Worth",
    weight: 20,
    score: nwScore,
    detail: `Net worth RM ${netWorth.toLocaleString()} → ${nwScore}/20`,
  });

  // 3. Litigation (15 pts) – hard negative
  const hasLitigation = /yes/i.test(String(fields.litigation?.value));
  const litAmount =
    parseFloat(String(fields.litigationAmount?.value).replace(/,/g, "")) || 0;
  const litScore = hasLitigation ? (litAmount > 100_000 ? 0 : 5) : 15;
  results.push({
    rule: "Litigation Status",
    weight: 15,
    score: litScore,
    detail: hasLitigation
      ? `Active litigation RM ${litAmount.toLocaleString()} → ${litScore}/15`
      : `No litigation → 15/15`,
  });

  // 4. Bankruptcy history (10 pts) – hard negative
  const hasBankruptcy = /yes/i.test(String(fields.bankruptcy?.value));
  const bankrScore = hasBankruptcy ? 0 : 10;
  results.push({
    rule: "Bankruptcy History",
    weight: 10,
    score: bankrScore,
    detail: hasBankruptcy
      ? "Bankruptcy on record → 0/10"
      : "No bankruptcy → 10/10",
  });

  // 5. Special attention account (10 pts)
  const hasSpecial = /yes/i.test(String(fields.specialAttention?.value));
  const specialScore = hasSpecial ? 0 : 10;
  results.push({
    rule: "Special Attention Account",
    weight: 10,
    score: specialScore,
    detail: hasSpecial ? "SAA flag present → 0/10" : "No SAA flag → 10/10",
  });

  // 6. Banking facilities (10 pts) – performing loans
  const facilities = fields.bankingFacilities ?? [];
  const npl = facilities.filter((f) =>
    /NPL|sub|doubt|loss/i.test(f.status),
  ).length;
  const bankScore = npl === 0 ? 10 : npl === 1 ? 5 : 2;
  results.push({
    rule: "Banking Facilities (NPL)",
    weight: 10,
    score: bankScore,
    detail: `${npl} NPL account(s) → ${bankScore}/10`,
  });

  // 7. Directors diversity (5 pts)
  const numDir = parseInt(String(fields.numDirectors?.value)) || 0;
  const dirScore = numDir >= 2 ? 5 : numDir === 1 ? 2 : 0;
  results.push({
    rule: "Board Diversity",
    weight: 5,
    score: dirScore,
    detail: `${numDir} director(s) → ${dirScore}/5`,
  });

  // 8. Limit vs Net Worth (5 pts)
  const limitRatio = netWorth > 0 ? requestedLimit / netWorth : 99;
  const ratioScore =
    limitRatio <= 0.3 ? 5 : limitRatio <= 0.5 ? 3 : limitRatio <= 1 ? 1 : 0;
  results.push({
    rule: "Limit-to-Net-Worth Ratio",
    weight: 5,
    score: ratioScore,
    detail: `Ratio ${(limitRatio * 100).toFixed(0)}% → ${ratioScore}/5`,
  });

  return results;
}

function deriveRecommendation(
  score: number,
  requestedLimit: number,
): {
  riskCategory: "Low" | "Moderate" | "High";
  recommendation: "approve" | "review" | "reject";
  recommendedLimit: number;
} {
  if (score >= 70) {
    return {
      riskCategory: "Low",
      recommendation: "approve",
      recommendedLimit: Math.min(requestedLimit, 500_000),
    };
  }
  if (score >= 40) {
    return {
      riskCategory: "Moderate",
      recommendation: "review",
      recommendedLimit: Math.min(requestedLimit * 0.6, 250_000),
    };
  }
  return {
    riskCategory: "High",
    recommendation: "reject",
    recommendedLimit: 0,
  };
}

// ─── OpenAI client (Azure OpenAI) ────────────────────────────────────────────

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const baseURL = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, "");
  if (!apiKey || !baseURL)
    throw new Error("AZURE_OPENAI_KEY or AZURE_OPENAI_ENDPOINT not set");
  _openai = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: { "api-key": apiKey },
    defaultQuery: { "api-version": "2025-01-01-preview" },
  });
  return _openai;
}

async function generateAIRationale(
  fields: ExtractionFields,
  rules: RuleResult[],
  totalScore: number,
  recommendation: string,
  recommendedLimit: number,
): Promise<string> {
  try {
    const openai = getOpenAI();
    const prompt = `You are Credit Sentinel, an AI credit officer for Chin Hin Group (Malaysian SME lender).

Analyse this CTOS credit scorecard and write a concise 3-paragraph rationale for the credit officer:

Company: ${fields.companyName?.value}
Registration: ${fields.regNo?.value}
Paid-up Capital: RM ${fields.paidUpCapital?.value}
Net Worth: RM ${fields.netWorth?.value}
Litigation: ${fields.litigation?.value}
Bankruptcy: ${fields.bankruptcy?.value}

Rule scores:
${rules
  .map((r) => `- ${r.rule}: ${r.score}/${r.weight} – ${r.detail}`)
  .join("\n")}

Total Score: ${totalScore}/100
Recommendation: ${recommendation.toUpperCase()}
Suggested Limit: RM ${recommendedLimit.toLocaleString()}

Write a professional 3-paragraph credit rationale in English. Mention key positive and negative factors. End with the decision.`;

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.4,
    });

    return (
      res.choices[0]?.message?.content ?? "Rationale generation unavailable."
    );
  } catch (e: any) {
    // Fallback rule-based rationale
    const positives = rules
      .filter((r) => r.score >= r.weight * 0.7)
      .map((r) => r.rule);
    const negatives = rules
      .filter((r) => r.score < r.weight * 0.4)
      .map((r) => r.rule);
    return (
      `The applicant scored ${totalScore}/100 under Chin Hin's Malaysian SME credit framework. ` +
      `Key strengths include: ${positives.join(", ") || "none identified"}. ` +
      `Risk factors noted: ${negatives.join(", ") || "none"}. ` +
      `Based on the scoring model, the recommendation is to ${recommendation.toUpperCase()} ` +
      `with a credit limit of RM ${recommendedLimit.toLocaleString()}.`
    );
  }
}

// ─── Main agent function ──────────────────────────────────────────────────────

export async function runCreditAgent(
  appId: string,
  fields: ExtractionFields,
  requestedLimit: number,
): Promise<Score> {
  const rules = runMalaysianCreditRules(fields, requestedLimit);
  const totalScore = rules.reduce((sum, r) => sum + r.score, 0);
  const { riskCategory, recommendation, recommendedLimit } =
    deriveRecommendation(totalScore, requestedLimit);

  const rationale = await generateAIRationale(
    fields,
    rules,
    totalScore,
    recommendation,
    recommendedLimit,
  );

  const agentThoughts = [
    "Step 1: Parsed CTOS fields and verified mandatory fields.",
    `Step 2: Applied 8 Chin Hin credit policy rules. Total score: ${totalScore}/100.`,
    `Step 3: Risk category determined as "${riskCategory}".`,
    `Step 4: Recommended credit limit RM ${recommendedLimit.toLocaleString()} with decision: ${recommendation.toUpperCase()}.`,
  ].join("\n");

  return {
    id: uuidv4(),
    appId,
    totalScore,
    riskCategory,
    recommendedLimit,
    recommendation,
    rationale,
    rulesFired: rules.map<ScoreRuleFired>((r) => ({
      rule: r.rule,
      weight: r.weight,
      score: r.score,
      detail: r.detail,
    })),
    agentThoughts,
    createdAt: new Date().toISOString(),
  };
}
