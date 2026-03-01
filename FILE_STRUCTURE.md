# Credit-Sentinel — COMPLETE File Structure

```
Credit-Sentinel/
├── .env                                    # YOUR Azure keys (REQUIRED)
├── .env.example                            # Template with all keys
├── .gitignore
├── .replit
├── components.json                         # shadcn/ui config
├── drizzle.config.ts                       # Database config
├── package.json                            # Add langchain deps
├── package-lock.json
├── postcss.config.js
├── tsconfig.json
├── vite-plugin-meta-images.ts
├── vite.config.ts
│
├── attached_assets/                        # Design specs & docs
│   ├── Pasted-1-Product-Summary-Name-Credit-Sentinel-Autonomous-Credi_1771257877475.txt
│   ├── Pasted-A-New-End-to-End-UI-UX-Design-Agentic-Credit-Sentinel-1_1771271130134.txt
│   ├── Pasted-Complete-UI-UX-Design-Spec-for-Replit-Credit-Sentinel-C_1771521794609.txt
│   └── Pasted-text-FINAL-UI-UX-POLISH-Credit-Sentinel-Chin-Hin-Hackat_1772058234375.txt
│
├── client/                                 # Frontend (Vite + React + TypeScript)
│   ├── index.html
│   ├── public/
│   │   └── assets/
│   │       ├── favicon.png
│   │       ├── opengraph.jpg
│   │       └── pdf-preview.png
│   └── src/
│       ├── App.tsx                         # ALL routes defined here
│       ├── index.css                       # Tailwind imports
│       ├── main.tsx                        # React entry point
│       │
│       ├── components/                     # ✅ UI Components
│       │   ├── layout/
│       │   │   └── Layout.tsx              # Sidebar + header wrapper
│       │   └── ui/                         # ✅ shadcn/ui components (complete)
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── alert.tsx
│       │       ├── aspect-ratio.tsx
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── breadcrumb.tsx
│       │       ├── button-group.tsx
│       │       ├── button.tsx
│       │       ├── calendar.tsx
│       │       ├── card.tsx
│       │       ├── carousel.tsx
│       │       ├── chart.tsx
│       │       ├── checkbox.tsx
│       │       ├── collapsible.tsx
│       │       ├── command.tsx
│       │       ├── context-menu.tsx
│       │       ├── dialog.tsx
│       │       ├── drawer.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── empty.tsx
│       │       ├── field.tsx
│       │       ├── form.tsx
│       │       ├── hover-card.tsx
│       │       ├── input-group.tsx
│       │       ├── input-otp.tsx
│       │       ├── input.tsx
│       │       ├── item.tsx
│       │       ├── kbd.tsx
│       │       ├── label.tsx
│       │       ├── menubar.tsx
│       │       ├── navigation-menu.tsx
│       │       ├── pagination.tsx
│       │       ├── popover.tsx
│       │       ├── progress.tsx
│       │       ├── radio-group.tsx
│       │       ├── resizable.tsx
│       │       ├── scroll-area.tsx
│       │       ├── select.tsx
│       │       ├── separator.tsx
│       │       ├── sheet.tsx
│       │       ├── sidebar.tsx
│       │       ├── skeleton.tsx
│       │       ├── slider.tsx
│       │       ├── sonner.tsx
│       │       ├── spinner.tsx
│       │       ├── switch.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── textarea.tsx
│       │       ├── toast.tsx
│       │       ├── toaster.tsx
│       │       ├── toggle-group.tsx
│       │       ├── toggle.tsx
│       │       └── tooltip.tsx
│       │
│       ├── hooks/                          # React hooks
│       │   ├── use-mobile.tsx              # ✅ Responsive breakpoint
│       │   ├── use-toast.ts                # ✅ Toast notifications
│       │   ├── useApplications.ts          # 🔥 ADD: Real API calls
│       │   └── useAgentTasks.ts            # 🔥 ADD: Polling for agent status
│       │
│       ├── lib/                            # Utilities
│       │   ├── api.ts                      # 🔥 UPGRADE: Add backend calls
│       │   ├── queryClient.ts              # React Query config
│       │   └── utils.ts                    # cn() helper
│       │
│       └── pages/                          # ✅ 11 pages (ALL exist)
│           ├── dashboard.tsx               # Home: KPIs + charts
│           ├── applications-queue.tsx      # Table with filters
│           ├── new-application.tsx         # PDF upload + search
│           ├── agent-pack.tsx              # 🔥 Agent Config UI
│           ├── decision-approval.tsx       # Officer review queue
│           ├── agent-tasks.tsx             # Real-time task status
│           ├── history.tsx                 # All completed apps
│           ├── reports.tsx                 # Analytics page
│           ├── review-extraction.tsx       # /:id/extraction (Step 1)
│           ├── score-recommendation.tsx    # /:id/score (Step 2)
│           └── agent-assessment.tsx        # /:id/assessment (Step 3)
│
├── script/
│   └── build.ts                            # Production build script
│
├── server/                                 # Backend (Express + TypeScript)
│   ├── index.ts                            # Express app entry point
│   ├── routes.ts                           # 🔥 API route registration
│   ├── static.ts                           # Serve client/dist/
│   ├── storage.ts                          # ✅ Exists (needs upgrade)
│   ├── vite.ts                             # Dev mode HMR
│   │
│   ├── middleware/                         # 🔥 ADD: Auth & CORS
│   │   ├── auth.ts                         # Bearer token validation
│   │   └── cors.ts                         # Azure Static Web Apps
│   │
│   ├── routes/                             # 🔥 ADD: API endpoints
│   │   ├── applications.ts                 # POST/GET apps
│   │   ├── decisions.ts                    # Approve/reject
│   │   └── agent-tasks.ts                  # Queue polling
│   │
│   ├── services/                           # Azure SDK wrappers
│   │   ├── agent.ts                        # ✅ Exists (LangGraph)
│   │   ├── azure.ts                        # ✅ Exists (base config)
│   │   ├── blob.ts                         # 🔥 ADD: creditsentinel2026
│   │   ├── doc-intelligence.ts             # 🔥 ADD: doi-creditsentinel2026
│   │   ├── cosmos.ts                       # 🔥 ADD: creditsentineldb
│   │   └── scoring.ts                      # 🔥 ADD: Business rules
│   │
│   └── agents/                             # LangGraph workflow
│       ├── credit-agent.ts                 # ✅ Exists (upgrade to graph)
│       ├── graph.ts                        # 🔥 ADD: StateGraph definition
│       └── nodes/                          # 🔥 ADD: Agent nodes
│           ├── extractor.ts                # PDF → structured fields
│           ├── risk.ts                     # LLM scoring logic
│           └── decision.ts                 # RM limit calculation
│
├── db/                                     # 🔥 ADD: Database layer
│   ├── schema.ts                           # Drizzle ORM tables
│   ├── client.ts                           # Cosmos PostgreSQL connection
│   └── migrations/                         # Auto-generated by Drizzle
│
├── types/                                  # 🔥 ADD: TypeScript types
│   ├── agent-state.ts                      # LangGraph state interface
│   └── db.ts                               # Database types
│
├── shared/                                 # Shared between client/server
│   └── schema.ts                           # ✅ Exists (API contracts)
│
└── README.md                               # 🔥 ADD: Setup instructions
```

---

## 🔥 Required Environment Variables (.env)

```bash
# Azure Storage (creditsentinel2026)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=creditsentinel2026;AccountKey=...;EndpointSuffix=core.windows.net

# Document Intelligence (doi-creditsentinel2026)
DOC_INTELLIGENCE_ENDPOINT=https://doi-creditsentinel2026.cognitiveservices.azure.com/
DOC_INTELLIGENCE_KEY=your-key-here

# Cosmos DB (creditsentineldb)
COSMOS_CONNECTION=AccountEndpoint=https://creditsentineldb.documents.azure.com:443/;AccountKey=...;Database=creditsentineldb

# OpenAI for LangGraph
OPENAI_API_KEY=sk-...

# App Config
PORT=3001
NODE_ENV=production
```

---

## 📦 Dependencies to Add (package.json)

```json
{
  "dependencies": {
    "@langchain/langgraph": "^0.0.20",
    "@langchain/openai": "^0.0.14",
    "@azure/storage-blob": "^12.17.0",
    "@azure/ai-form-recognizer": "^5.0.0",
    "@azure/cosmos": "^4.0.0",
    "drizzle-orm": "^0.29.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.9"
  }
}
```

---

## 🚀 Business Logic Rules

- **Score > 0.7** → Auto-approve (RM 250k limit)
- **Score 0.4-0.7** → Officer review required
- **Score < 0.4** → Auto-reject

---

## 🎯 Deployment Targets

- **Frontend**: dashboard-creditsentinel2026 (Azure Static Web Apps)
- **Backend**: api-creditsentinel2026 (Azure Functions/App Service)
- **Database**: creditsentineldb (Cosmos PostgreSQL)
- **Storage**: creditsentinel2026 (Blob Storage)
- **AI**: doi-creditsentinel2026 (Document Intelligence)

---

**✅ STATUS**: 11 pages complete | 🔥 Backend integration needed | Ready for LangGraph!
