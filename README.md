## FlowForge – Visual Workflow Automation Engine

This repository implements the FlowForge PRD: a Remix + React Flow visual builder backed by a Prisma data model and an Effect-powered workflow execution engine.

### Stack

- **Remix + React 18** for the UI and API routes
- **React Flow** for the drag-and-drop builder
- **Tailwind + Framer Motion** for the glassmorphic interface
- **Prisma + PostgreSQL schema** modelling workflows, nodes, edges, and executions
- **Effect**-driven execution engine with retry/timeout policies
- **SSE real-time monitor** with an embeddable widget placeholder

### Getting Started

```bash
npm install
npx prisma generate
npm run dev
```

- `npm run dev` – starts the Remix dev server
- `npm run test` – runs Vitest unit tests (currently focused on the execution engine)
- `npm run prisma:migrate` – run database migrations (PostgreSQL)
- `npm run db:seed` – seed demo data

### Key Paths

- `app/routes/_index.tsx` – hero page with live builder preview
- `app/routes/workflows.*` – workflow list, editor, and detail routes
- `app/routes/dashboard.tsx` – execution dashboard with live SSE stream
- `app/services/execution/workflow-engine.server.ts` – Effect-based DAG executor
- `prisma/schema.prisma` – database schema mirroring the PRD
