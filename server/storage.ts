import { CosmosClient, Container, Database } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
import type {
  Application,
  Extraction,
  Score,
  AgentTask,
  AuditLog,
  Decision,
  User,
  InsertUser,
  InsertApplication,
} from "../shared/schema.js";

// ─── Cosmos DB setup ──────────────────────────────────────────────────────────

const DB_NAME = "CreditSentinelDB";
const CONTAINERS = {
  applications: "applications",
  extractions: "extractions",
  scores: "scores",
  agentTasks: "agent_tasks",
  auditLogs: "audit_logs",
  decisions: "decisions",
  users: "users",
} as const;

let _client: CosmosClient | null = null;
let _db: Database | null = null;

function getClient(): CosmosClient {
  if (_client) return _client;
  const connStr = process.env.COSMOSDB_CONNECTION_STRING;
  const endpoint = process.env.COSMOSDB_ENDPOINT;
  const key = process.env.COSMOSDB_KEY;
  if (connStr) {
    _client = new CosmosClient(connStr);
  } else if (endpoint && key) {
    _client = new CosmosClient({ endpoint, key });
  } else {
    throw new Error("No Cosmos DB credentials found in environment");
  }
  return _client;
}

async function getDB(): Promise<Database> {
  if (_db) return _db;
  const client = getClient();
  const { database } = await client.databases.createIfNotExists({
    id: DB_NAME,
  });
  _db = database;
  return _db;
}

async function getContainer(name: string): Promise<Container> {
  const db = await getDB();
  const { container } = await db.containers.createIfNotExists({
    id: name,
    partitionKey: { paths: ["/id"] },
  });
  return container;
}

async function upsertDoc<T extends { id: string }>(
  containerName: string,
  doc: T,
): Promise<T> {
  const container = await getContainer(containerName);
  const { resource } = await container.items.upsert<T>(doc);
  if (!resource) throw new Error(`Failed to upsert into ${containerName}`);
  return resource;
}

async function readDoc<T>(
  containerName: string,
  id: string,
): Promise<T | undefined> {
  const container = await getContainer(containerName);
  const { resource } = await container.item(id, id).read<any>();
  return (resource ?? undefined) as T | undefined;
}

async function queryDocs<T>(
  containerName: string,
  query: string,
  params?: { name: string; value: any }[],
): Promise<T[]> {
  const container = await getContainer(containerName);
  const { resources } = await container.items
    .query<T>({ query, parameters: params ?? [] })
    .fetchAll();
  return resources;
}

// ─── IStorage interface ───────────────────────────────────────────────────────

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createApplication(
    data: InsertApplication & {
      officerId: string;
      pdfUrl: string;
      pdfBlobName: string;
    },
  ): Promise<Application>;
  getApplication(id: string): Promise<Application | undefined>;
  listApplications(): Promise<Application[]>;
  updateApplicationStatus(
    id: string,
    status: Application["status"],
    agentStage?: string,
  ): Promise<Application>;

  saveExtraction(
    data: Omit<Extraction, "id" | "createdAt">,
  ): Promise<Extraction>;
  getExtraction(appId: string): Promise<Extraction | undefined>;

  saveScore(score: Score): Promise<Score>;
  getScore(appId: string): Promise<Score | undefined>;

  createAgentTask(
    data: Omit<AgentTask, "id" | "createdAt" | "updatedAt">,
  ): Promise<AgentTask>;
  updateAgentTask(
    id: string,
    status: AgentTask["status"],
    detail?: string,
  ): Promise<AgentTask>;
  listAgentTasks(): Promise<AgentTask[]>;

  saveDecision(decision: Omit<Decision, "id">): Promise<Decision>;
  getDecision(appId: string): Promise<Decision | undefined>;

  addAuditLog(data: Omit<AuditLog, "id">): Promise<AuditLog>;
  getAuditLogs(appId: string): Promise<AuditLog[]>;
}

// ─── Cosmos DB implementation ─────────────────────────────────────────────────

export class CosmosStorage implements IStorage {
  async getUser(id: string) {
    return readDoc<User>(CONTAINERS.users, id);
  }
  async getUserByUsername(username: string) {
    const r = await queryDocs<User>(
      CONTAINERS.users,
      "SELECT * FROM c WHERE c.username = @u",
      [{ name: "@u", value: username }],
    );
    return r[0];
  }
  async createUser(user: InsertUser): Promise<User> {
    return upsertDoc(CONTAINERS.users, { id: uuidv4(), ...user });
  }

  async createApplication(
    data: InsertApplication & {
      officerId: string;
      pdfUrl: string;
      pdfBlobName: string;
    },
  ): Promise<Application> {
    const now = new Date().toISOString();
    return upsertDoc<Application>(CONTAINERS.applications, {
      id: uuidv4(),
      ...data,
      status: "new",
      agentStage: "Queued",
      createdAt: now,
      updatedAt: now,
    });
  }
  async getApplication(id: string) {
    return readDoc<Application>(CONTAINERS.applications, id);
  }
  async listApplications() {
    return queryDocs<Application>(
      CONTAINERS.applications,
      "SELECT * FROM c ORDER BY c.createdAt DESC",
    );
  }
  async updateApplicationStatus(
    id: string,
    status: Application["status"],
    agentStage?: string,
  ): Promise<Application> {
    const app = await this.getApplication(id);
    if (!app) throw new Error(`Application ${id} not found`);
    return upsertDoc<Application>(CONTAINERS.applications, {
      ...app,
      status,
      agentStage: agentStage ?? app.agentStage,
      updatedAt: new Date().toISOString(),
    });
  }

  async saveExtraction(
    data: Omit<Extraction, "id" | "createdAt">,
  ): Promise<Extraction> {
    return upsertDoc<Extraction>(CONTAINERS.extractions, {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    });
  }
  async getExtraction(appId: string) {
    const r = await queryDocs<Extraction>(
      CONTAINERS.extractions,
      "SELECT * FROM c WHERE c.appId = @a",
      [{ name: "@a", value: appId }],
    );
    return r[0];
  }

  async saveScore(score: Score) {
    return upsertDoc<Score>(CONTAINERS.scores, score);
  }
  async getScore(appId: string) {
    const r = await queryDocs<Score>(
      CONTAINERS.scores,
      "SELECT * FROM c WHERE c.appId = @a",
      [{ name: "@a", value: appId }],
    );
    return r[0];
  }

  async createAgentTask(
    data: Omit<AgentTask, "id" | "createdAt" | "updatedAt">,
  ): Promise<AgentTask> {
    const now = new Date().toISOString();
    return upsertDoc<AgentTask>(CONTAINERS.agentTasks, {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }
  async updateAgentTask(
    id: string,
    status: AgentTask["status"],
    detail?: string,
  ): Promise<AgentTask> {
    const task = await readDoc<AgentTask>(CONTAINERS.agentTasks, id);
    if (!task) throw new Error(`Task ${id} not found`);
    return upsertDoc<AgentTask>(CONTAINERS.agentTasks, {
      ...task,
      status,
      detail: detail ?? task.detail,
      updatedAt: new Date().toISOString(),
    });
  }
  async listAgentTasks() {
    return queryDocs<AgentTask>(
      CONTAINERS.agentTasks,
      "SELECT * FROM c ORDER BY c.createdAt DESC OFFSET 0 LIMIT 50",
    );
  }

  async saveDecision(decision: Omit<Decision, "id">): Promise<Decision> {
    return upsertDoc<Decision>(CONTAINERS.decisions, {
      id: uuidv4(),
      ...decision,
    });
  }
  async getDecision(appId: string) {
    const r = await queryDocs<Decision>(
      CONTAINERS.decisions,
      "SELECT * FROM c WHERE c.appId = @a",
      [{ name: "@a", value: appId }],
    );
    return r[0];
  }

  async addAuditLog(data: Omit<AuditLog, "id">): Promise<AuditLog> {
    return upsertDoc<AuditLog>(CONTAINERS.auditLogs, { id: uuidv4(), ...data });
  }
  async getAuditLogs(appId: string) {
    return queryDocs<AuditLog>(
      CONTAINERS.auditLogs,
      "SELECT * FROM c WHERE c.appId = @a ORDER BY c.timestamp ASC",
      [{ name: "@a", value: appId }],
    );
  }
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private apps = new Map<string, Application>();
  private extractions = new Map<string, Extraction>();
  private scores = new Map<string, Score>();
  private tasks = new Map<string, AgentTask>();
  private decisions = new Map<string, Decision>();
  private audits: AuditLog[] = [];

  async getUser(id: string) {
    return this.users.get(id);
  }
  async getUserByUsername(username: string) {
    return [...this.users.values()].find((u) => u.username === username);
  }
  async createUser(user: InsertUser): Promise<User> {
    const doc: User = { id: uuidv4(), ...user };
    this.users.set(doc.id, doc);
    return doc;
  }

  async createApplication(
    data: InsertApplication & {
      officerId: string;
      pdfUrl: string;
      pdfBlobName: string;
    },
  ): Promise<Application> {
    const now = new Date().toISOString();
    const doc: Application = {
      id: uuidv4(),
      ...data,
      status: "new",
      agentStage: "Queued",
      createdAt: now,
      updatedAt: now,
    };
    this.apps.set(doc.id, doc);
    return doc;
  }
  async getApplication(id: string) {
    return this.apps.get(id);
  }
  async listApplications() {
    return [...this.apps.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  async updateApplicationStatus(
    id: string,
    status: Application["status"],
    agentStage?: string,
  ): Promise<Application> {
    const app = this.apps.get(id);
    if (!app) throw new Error("Not found");
    const updated = {
      ...app,
      status,
      agentStage: agentStage ?? app.agentStage,
      updatedAt: new Date().toISOString(),
    };
    this.apps.set(id, updated);
    return updated;
  }

  async saveExtraction(
    data: Omit<Extraction, "id" | "createdAt">,
  ): Promise<Extraction> {
    const doc: Extraction = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.extractions.set(doc.appId, doc);
    return doc;
  }
  async getExtraction(appId: string) {
    return this.extractions.get(appId);
  }

  async saveScore(score: Score) {
    this.scores.set(score.appId, score);
    return score;
  }
  async getScore(appId: string) {
    return this.scores.get(appId);
  }

  async createAgentTask(
    data: Omit<AgentTask, "id" | "createdAt" | "updatedAt">,
  ): Promise<AgentTask> {
    const now = new Date().toISOString();
    const doc: AgentTask = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(doc.id, doc);
    return doc;
  }
  async updateAgentTask(
    id: string,
    status: AgentTask["status"],
    detail?: string,
  ): Promise<AgentTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Not found");
    const updated = {
      ...task,
      status,
      detail: detail ?? task.detail,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }
  async listAgentTasks() {
    return [...this.tasks.values()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);
  }

  async saveDecision(decision: Omit<Decision, "id">): Promise<Decision> {
    const doc: Decision = { id: uuidv4(), ...decision };
    this.decisions.set(doc.appId, doc);
    return doc;
  }
  async getDecision(appId: string) {
    return this.decisions.get(appId);
  }

  async addAuditLog(data: Omit<AuditLog, "id">): Promise<AuditLog> {
    const doc: AuditLog = { id: uuidv4(), ...data };
    this.audits.push(doc);
    return doc;
  }
  async getAuditLogs(appId: string) {
    return this.audits.filter((a) => a.appId === appId);
  }
}

// ─── Export singleton ─────────────────────────────────────────────────────────

function createStorage(): IStorage {
  const connStr = process.env.COSMOSDB_CONNECTION_STRING;
  const endpoint = process.env.COSMOSDB_ENDPOINT;
  if (connStr || endpoint) {
    console.log("[storage] Using Azure Cosmos DB");
    return new CosmosStorage();
  }
  console.log(
    "[storage] Using in-memory storage (no Cosmos credentials found)",
  );
  return new MemStorage();
}

export const storage = createStorage();
