import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";

// ─── Blob Storage ─────────────────────────────────────────────────────────────

function getBlobClient() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error("AZURE_STORAGE_CONNECTION_STRING not set");
  return BlobServiceClient.fromConnectionString(connStr);
}

const CONTAINER_NAME = "ctos-pdfs";

export async function ensureContainer(): Promise<void> {
  const client = getBlobClient();
  const container = client.getContainerClient(CONTAINER_NAME);
  await container.createIfNotExists({ access: "blob" });
}

export async function uploadPDFToBlob(
  buffer: Buffer,
  originalName: string,
): Promise<{ url: string; blobName: string }> {
  const blobName = `${uuidv4()}-${originalName.replace(
    /[^a-zA-Z0-9.\-_]/g,
    "_",
  )}`;
  const client = getBlobClient();
  const container = client.getContainerClient(CONTAINER_NAME);
  await container.createIfNotExists({ access: "blob" });

  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });

  const url = blockBlob.url;
  return { url, blobName };
}

export async function deletePDFFromBlob(blobName: string): Promise<void> {
  const client = getBlobClient();
  const container = client.getContainerClient(CONTAINER_NAME);
  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.deleteIfExists();
}

// ─── Document Intelligence ────────────────────────────────────────────────────

export interface ExtractedCTOSData {
  rawText: string;
  fields: {
    companyName: { value: string; confidence: "high" | "medium" | "low" };
    regNo: { value: string; confidence: "high" | "medium" | "low" };
    incDate: { value: string; confidence: "high" | "medium" | "low" };
    address: { value: string; confidence: "high" | "medium" | "low" };
    natureOfBusiness: { value: string; confidence: "high" | "medium" | "low" };
    paidUpCapital: { value: string; confidence: "high" | "medium" | "low" };
    netWorth: { value: string; confidence: "high" | "medium" | "low" };
    litigation: { value: string; confidence: "high" | "medium" | "low" };
    litigationAmount: { value: string; confidence: "high" | "medium" | "low" };
    specialAttention: { value: string; confidence: "high" | "medium" | "low" };
    bankruptcy: { value: string; confidence: "high" | "medium" | "low" };
    numDirectors: { value: string; confidence: "high" | "medium" | "low" };
    directors: Array<{ name: string; id: string; age: number; share: string }>;
    bankingFacilities: Array<{
      bank: string;
      facility: string;
      limit: string;
      outstanding: string;
      status: string;
    }>;
  };
  mandatoryFilled: number;
  mandatoryTotal: number;
}

function confLevel(score: number): "high" | "medium" | "low" {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

export async function extractCTOSFromPDF(
  pdfUrl: string,
): Promise<ExtractedCTOSData> {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  if (!endpoint || !key)
    throw new Error("Document Intelligence env vars not set");

  // Submit analysis job
  const analyzeUrl = `${endpoint.replace(
    /\/$/,
    "",
  )}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2024-02-29-preview`;
  const submitRes = await fetch(analyzeUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urlSource: pdfUrl }),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Document Intelligence submit failed: ${err}`);
  }

  const operationLocation = submitRes.headers.get("Operation-Location");
  if (!operationLocation)
    throw new Error("No Operation-Location header returned");

  // Poll until done
  let result: any = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": key },
    });
    const data = await pollRes.json();
    if (data.status === "succeeded") {
      result = data;
      break;
    }
    if (data.status === "failed") {
      throw new Error("Document Intelligence analysis failed");
    }
  }

  if (!result) throw new Error("Document Intelligence timed out");

  // Extract raw text from pages
  const pages = result.analyzeResult?.pages ?? [];
  const rawText = pages
    .flatMap((p: any) => p.lines?.map((l: any) => l.content) ?? [])
    .join("\n");

  // Parse fields from raw text using regex patterns for CTOS PDF
  const fields = parseCTOSFields(rawText);
  const mandatoryKeys = [
    "companyName",
    "regNo",
    "incDate",
    "address",
    "natureOfBusiness",
    "paidUpCapital",
    "netWorth",
    "litigation",
    "bankruptcy",
    "numDirectors",
  ];
  const mandatoryFilled = mandatoryKeys.filter(
    (k) => (fields as any)[k]?.value && (fields as any)[k].value !== "N/A",
  ).length;

  return {
    rawText,
    fields,
    mandatoryFilled,
    mandatoryTotal: mandatoryKeys.length,
  };
}

function parseCTOSFields(text: string): ExtractedCTOSData["fields"] {
  const extract = (
    patterns: RegExp[],
    defaultVal = "N/A",
    highConf = false,
  ): { value: string; confidence: "high" | "medium" | "low" } => {
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m?.[1]?.trim()) {
        return { value: m[1].trim(), confidence: highConf ? "high" : "medium" };
      }
    }
    return { value: defaultVal, confidence: "low" };
  };

  // Company Name
  const companyName = extract(
    [
      /Company Name[:\s]+([A-Z][^\n]{5,60}(?:SDN BHD|SB|ENTERPRISE|TRADING|HOLDINGS)[^\n]*)/i,
      /^([A-Z][^\n]{5,60}(?:SDN BHD|SB|ENTERPRISE|TRADING)[^\n]*)/m,
    ],
    "N/A",
    true,
  );

  const regNo = extract(
    [
      /(?:Reg(?:istration)? No|Company No)[.:\s]+([0-9]{6,12}[-\s]?[A-Z0-9]{1,6})/i,
      /\((\d{6,12}-[A-Z])\)/,
    ],
    "N/A",
    true,
  );

  const incDate = extract(
    [
      /(?:Incorp(?:oration)? Date|Date of Incorporation)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ],
    "N/A",
  );

  const address = extract(
    [/(?:Registered Address|Address)[:\s]+([^\n]{10,120})/i],
    "N/A",
  );

  const natureOfBusiness = extract(
    [
      /(?:Nature of Business|Business Activity|Principal Activity)[:\s]+([^\n]{5,80})/i,
    ],
    "N/A",
  );

  const paidUpCapital = extract(
    [
      /(?:Paid[- ]?up Capital|Share Capital)[:\s]+(?:RM\s*)?([0-9,]+(?:\.\d{2})?)/i,
    ],
    "N/A",
  );

  const netWorth = extract(
    [
      /(?:Net Worth|Shareholders[' ]*Equity)[:\s]+(?:RM\s*)?([0-9,]+(?:\.\d{2})?)/i,
    ],
    "N/A",
  );

  const litigation = extract(
    [/(?:Legal Action|Litigation|Court Case)[:\s]+(Yes|No|None|NIL)/i],
    "No",
    true,
  );

  const litigationAmount = extract(
    [
      /(?:Litigation Amount|Claim Amount)[:\s]+(?:RM\s*)?([0-9,]+(?:\.\d{2})?)/i,
    ],
    "0",
  );

  const specialAttention = extract(
    [/(?:Special Attention|Watchlist)[:\s]+(Yes|No|None|NIL)/i],
    "No",
  );

  const bankruptcy = extract(
    [/(?:Bankruptcy|Bankrupt)[:\s]+(Yes|No|None|NIL)/i],
    "No",
    true,
  );

  // Directors
  const directorMatches = [
    ...text.matchAll(
      /([A-Z][A-Z\s]{5,40})\s+(\d{6}-\d{2}-\d{4})\s+(\d{2})\s+([\d.]+%)/g,
    ),
  ];
  const directors = directorMatches.slice(0, 5).map((m) => ({
    name: m[1].trim(),
    id: m[2],
    age: parseInt(m[3]),
    share: m[4],
  }));

  const numDirectors = {
    value: String(directors.length || 0),
    confidence: directors.length > 0 ? ("high" as const) : ("low" as const),
  };

  // Banking Facilities
  const bankPatterns =
    /(MAYBANK|PUBLIC BANK|CIMB|RHB|HONG LEONG|AMBANK|AFFIN|BSN|AGRO|STANDARD CHARTERED|HSBC|OCBC|UOB)\s+([^\n]{5,40})\s+([\d,]+)\s+([\d,]+)\s+(Performing|NPL|Sub-standard|Doubtful|Loss|N\/A)/gi;
  const bankMatches = [...text.matchAll(bankPatterns)];
  const bankingFacilities = bankMatches.slice(0, 6).map((m) => ({
    bank: m[1],
    facility: m[2].trim(),
    limit: `RM ${m[3]}`,
    outstanding: `RM ${m[4]}`,
    status: m[5],
  }));

  return {
    companyName,
    regNo,
    incDate,
    address,
    natureOfBusiness,
    paidUpCapital,
    netWorth,
    litigation,
    litigationAmount,
    specialAttention,
    bankruptcy,
    numDirectors,
    directors,
    bankingFacilities,
  };
}
