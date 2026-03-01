# TypeScript Backend (ARCHIVED)

> ⚠️ **This backend is no longer in use for production.**  
> The project has migrated to **Python FastAPI** (`backend-python/`) for production deployment.

---

## Why This Was Archived

The TypeScript Express backend was the initial implementation, but we switched to Python for:

- ✅ **Native LangGraph Support** — Python is the primary runtime for LangGraph (v0.3+)
- ✅ **Azure SDK Maturity** — Official Python SDKs for Cosmos DB, Blob Storage, Document Intelligence
- ✅ **Production Scalability** — Better async I/O, Gunicorn workers, container deployments
- ✅ **AI/ML Ecosystem** — Industry standard for AI-powered applications
- ✅ **Team Handoff** — Easier for AI/ML engineers to maintain

---

## What's Here (Reference Only)

This folder contains the original TypeScript implementation:

- **[agents/credit-agent.ts](agents/credit-agent.ts)** — LangGraph workflow (649 lines)

  - Extract → Risk → Decision → Audit nodes
  - Azure Document Intelligence integration
  - 8-rule Malaysian SME scoring
  - GPT-4o bilingual rationale generation
  - SSE event streaming

- **[routes.ts](routes.ts)** — Express API endpoints (302 lines)
- **[storage.ts](storage.ts)** — Cosmos DB wrapper (451 lines)
- **[services/azure.ts](services/azure.ts)** — Azure SDK integration
- **[index.ts](index.ts)** — Express app entry point

---

## Migration Notes

If you need to reference the TypeScript implementation:

| TypeScript (Old)                | Python (New)                                  |
| ------------------------------- | --------------------------------------------- |
| `server/agents/credit-agent.ts` | `backend-python/agents/credit_graph.py`       |
| `server/routes.ts`              | `backend-python/main.py` (FastAPI routes)     |
| `server/storage.ts`             | `backend-python/services/cosmos.py`           |
| `server/services/azure.ts`      | `backend-python/services/blob.py`             |
|                                 | `backend-python/services/doc_intelligence.py` |

---

## Can I Still Run This?

**Technically yes**, but **not recommended**:

```bash
# Install dependencies (if not already done)
npm install

# Start TypeScript backend
npm run dev:old  # or: tsx server/index.ts
```

**Issues:**

- Port conflict with Python backend (both use 5000)
- Frontend proxy now points to Python (port 8000)
- No longer maintained or tested

---

## For Contributors

If you want to study the TypeScript implementation for learning purposes:

1. **LangGraph Pattern:** See how StateGraph is defined in TypeScript
2. **Azure SDK Usage:** Examples of Cosmos DB and Blob Storage clients
3. **SSE Streaming:** Event-driven architecture with EventEmitter
4. **PII Masking:** Regex patterns for Malaysian IC numbers

---

## Questions?

See the **Python backend** for production code:

- 📂 `backend-python/` — All production code
- 📄 `backend-python/README.md` — API documentation
- 📄 `PRODUCTION_DEPLOY.md` — Deployment guide

**The future is Python! 🐍**
