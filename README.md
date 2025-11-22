## FlowForge – Visual Workflow Automation Engine

FlowForge is a Remix + React Flow visual builder backed by a Prisma data model and an Effect-powered execution engine. It lets you drag-and-drop workflows, run them with retries/timeouts, and monitor executions in real time with SSE updates.

### Features
- Visual workflow builder (React Flow) with node library (Start/End, Email, Slack, HTTP, Delay, Conditional, Transform/Webhook).
- Publish and re-open workflows for editing; drafts and published states stored in Postgres.
- Execution engine with DAG traversal, parallel/sequential branches, retries/timeouts per node, and persisted task logs.
- Real-time dashboards and detail pages that stream live execution events via SSE.
- Email sending over SMTP (AWS SES-compatible); HTTP/Slack mock handlers for demo, overridable by config.

### Stack
- UI: Remix (SSR), React 18, React Flow, Tailwind, Framer Motion.
- Backend: Effect-based executor, Prisma ORM with PostgreSQL.
- Realtime: Server-Sent Events (`/api/executions/:id/stream`).
- Testing/Tooling: Vitest, ESLint, TypeScript strict mode.

### Setup
1) Install deps: `npm install`  
2) Generate Prisma client: `npx prisma generate`  
3) Migrate DB: `npm run prisma:migrate` (PostgreSQL)  
4) (Optional) Seed demo data: `npm run db:seed`

### Environment
Create `.env` with:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
FLOWFORGE_DEMO_MODE=false   # true will use in-memory demo data
MAIL_SMTP_HOST=…
MAIL_SMTP_PORT=…
MAIL_SMTP_USER=…
MAIL_SMTP_PASS=…
MAIL_FROM="FlowForge <no-reply@example.com>"
```
Email nodes use SMTP; if unset they will fail. Demo mode skips persistence.

### Run / Build / Quality
- `npm run dev` – Remix dev server
- `npm run build` / `npm start` – production build/serve
- `npm run typecheck`, `npm run lint`, `npm run test`
- `npm run prisma:migrate`, `npm run db:seed`

### Key Paths
- `app/routes/_index.tsx` – landing/hero with live builder preview
- `app/routes/workflows.*` – list, create/edit builder, detail/run page
- `app/routes/dashboard.tsx` – execution dashboard with live logs
- `app/services/execution/workflow-engine.server.ts` – executor (DAG, retries, timeouts, logging)
- `app/services/execution/node-handlers.server.ts` – task handlers (Email/Slack/HTTP/Delay/etc.)
- `prisma/schema.prisma` – DB models for Workflow, Node, Edge, Execution, TaskExecution, ExecutionLog

### API (JSON)
- `GET /api/workflows` – list workflows
- `POST /api/workflows` – create workflow `{ name, description?, definition, isDraft?, isPublished? }`
- `POST /api/workflows/:workflowId/execute` – trigger execution `{ input: {...} }`
- `GET /api/executions/:executionId` – execution detail (status, tasks, logs)
- `GET /api/executions/:executionId/stream` – SSE stream of execution events

### Usage Notes
- Builder validation runs on save/publish; email nodes need `to`/`subject`; HTTP nodes need http/https URL (templates allowed).
- Run Workflow button now disables while submitting to avoid duplicate runs.
- Email nodes default to 0 retries; other nodes default to 2. Adjust per node with `retries`/`timeout` in config.
