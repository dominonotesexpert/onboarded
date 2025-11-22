## FlowForge – Visual Workflow Automation Engine

FlowForge is a Remix + React Flow visual builder backed by a Prisma data model and an Effect-powered execution engine. It lets you drag-and-drop workflows, run them with retries/timeouts, and monitor executions in real time with SSE updates.

### Features

#### 🎨 Visual Workflow Builder
- **Drag-and-drop interface** powered by React Flow with intuitive node-based editing
- **Comprehensive node library**: Start/End, Email, Slack, HTTP, Delay, Conditional, Transform, and Webhook
- **Smart layout tools**: Auto-layout, undo/redo, and darg-drop node placement for clean workflow diagrams
- **Live validation**: Real-time feedback on node configuration and workflow structure
- **Template support**: Use `{{ variable }}` syntax in email addresses, URLs, and message bodies

#### ⚙️ Workflow Management
- **Draft & publish workflow**: Save work-in-progress drafts or publish production-ready workflows
- **Version control**: Track workflow versions with full edit history
- **Cycle detection**: Prevents invalid workflows with built-in DAG validation
- **Custom node configuration**: Configure each node with JSON-based settings
- **Persistent storage**: All workflows stored in PostgreSQL with Prisma ORM

#### 🚀 Powerful Execution Engine
- **DAG-based traversal**: Executes workflows as directed acyclic graphs
- **Parallel & sequential execution**: Smart branching with automatic sibling detection
- **Retry mechanism**: Configurable retries per node (default: 3 attempts)
- **Timeout protection**: Per-node timeout settings (default: 30 seconds)
- **Task prioritization**: Priority-based execution ordering
- **Comprehensive logging**: Detailed execution logs with timestamps and metadata

#### 📊 Real-time Monitoring
- **Live execution dashboard**: Monitor all running workflows in real-time
- **Server-Sent Events (SSE)**: Stream execution updates without polling
- **Task status tracking**: Visual indicators for pending, running, success, failed, and timeout states
- **Execution history**: Full audit trail of all workflow runs with filtering
- **Error reporting**: Detailed error messages and stack traces for failed tasks

#### 📧 Built-in Integrations
- **Email**: SMTP integration with AWS SES compatibility, template support, and HTML rendering
- **HTTP**: REST API calls with configurable methods, headers, and request bodies
- **Slack**: Message notifications to channels (mock handler for demo)
- **Webhooks**: Trigger external services with POST requests
- **Conditional logic**: Branch workflows based on expression evaluation (using secure expr-eval parser)
- **Data transformation**: Map and transform data between workflow steps

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

#### Validation Rules
- **Email nodes**: Require valid `to` email address and `subject` field (templates with `{{ }}` are allowed)
- **HTTP nodes**: Must use `http://` or `https://` protocol (templates allowed)
- **Slack nodes**: Require a `channel` field
- **Delay nodes**: Require `durationMs` field (milliseconds)
- **Conditional nodes**: Require an `expression` field for branching logic
- **Workflow structure**: Must be a valid DAG (no cycles allowed)

#### Retry & Timeout Configuration
- **Default retries**: 3 attempts per node (configurable per node)
- **Default timeout**: 30 seconds per node (configurable per node)
- **Email nodes**: Use 0 retries by default to prevent duplicate emails
- **Custom settings**: Adjust `retries`, `timeout`, and `priority` in node config panel

#### Security Features
- **Safe expression evaluation**: Conditional nodes use `expr-eval` library (prevents code injection)
- **Template rendering**: Supports `{{ variable }}` syntax for dynamic content
- **Error handling**: Comprehensive try-catch blocks in all API routes
- **Database integrity**: Cascade deletes prevent orphaned execution records

#### Best Practices
- **Save frequently**: Use "Save Draft" to preserve work without publishing
- **Test workflows**: Run test executions before publishing to production
- **Monitor executions**: Check the dashboard for real-time execution status
- **Review logs**: Examine execution logs to debug failed workflows
- **Use templates**: Leverage `{{ context.field }}` for dynamic email/HTTP content
