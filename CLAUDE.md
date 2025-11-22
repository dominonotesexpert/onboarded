# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowForge is a visual workflow automation engine built with Remix, React Flow, Prisma, and Effect. It allows users to create DAG-based workflows with a drag-and-drop builder and execute them with retry/timeout policies.

## Development Commands

### Setup
```bash
npm install
npx prisma generate
```

### Development
```bash
npm run dev                # Start Remix dev server
npm run build              # Build for production
npm run start              # Run production build
```

### Database
```bash
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations (PostgreSQL required)
npm run db:seed            # Seed demo workflows
```

### Code Quality
```bash
npm run typecheck          # Run TypeScript type checking
npm run lint               # Run ESLint (max warnings: 0)
```

### Testing
```bash
npm run test               # Run all tests (Vitest)
npm run test:watch         # Run tests in watch mode
npm run coverage           # Run tests with coverage report
```

To run a single test file:
```bash
npx vitest run tests/workflow-engine.test.ts
```

## Architecture

### Core Components

**Workflow Execution Engine** (`app/services/execution/workflow-engine.server.ts`)
- Effect-based DAG executor with topological sort
- Supports both sequential and parallel node execution (max concurrency: 4)
- Implements retry policies and timeout handling
- Emits real-time execution events via SSE
- Validates workflows before execution (prevents cycles, checks node config)

**Node Handlers** (`app/services/execution/node-handlers.server.ts`)
- Each node type (START, EMAIL, SLACK, HTTP, DELAY, CONDITIONAL, TRANSFORM, WEBHOOK, END) has a dedicated Effect-based handler
- Handlers return `TaskResult` with status, data, and optional branch selection
- CONDITIONAL nodes use JavaScript expressions evaluated with shared context
- TRANSFORM nodes support template string interpolation

**Workflow Graph** (`app/utils/workflow-graph.ts`)
- Builds adjacency and reverse adjacency maps for DAG traversal
- Identifies entry nodes (zero indegree or START type)
- Used by both validation and execution engine

**Workflow Validation** (`app/utils/workflow-validation.ts`)
- Cycle detection using DFS
- Node-specific config validation (e.g., EMAIL requires "to", HTTP requires "url")
- Returns structured `ValidationIssue[]` with node context

**Event Hub** (`app/services/events/execution-hub.server.ts`)
- Node.js EventEmitter for SSE streaming
- Subscribe/publish pattern for real-time execution updates
- Used by `/api/executions/$executionId/stream` route

### Data Model

**Workflow Structure** (Prisma schema)
- `Workflow`: Stores workflow metadata and JSON definition
- `WorkflowNode`: Normalized nodes with config, timeout, retries
- `WorkflowEdge`: Edges with optional conditions for branching
- `Execution`: Tracks workflow runs with status/duration
- `TaskExecution`: Individual node execution records
- `ExecutionLog`: Structured logs with levels (DEBUG, INFO, WARN, ERROR, FATAL)

**Key Relationships**
- Workflow → WorkflowNode/WorkflowEdge (cascade delete)
- Execution → TaskExecution/ExecutionLog (cascade delete)
- WorkflowNode referenced by TaskExecution (no cascade)

### Routes

**Builder**
- `/workflows/new` - Create new workflow
- `/workflows/$workflowId` - Edit workflow with React Flow builder

**Execution**
- `/api/workflows/$workflowId/execute` - POST to trigger execution
- `/api/executions/$executionId/stream` - SSE endpoint for live updates
- `/dashboard` - Execution dashboard with live monitoring

**Demo Mode**
- Controlled by `DEMO_MODE` env var in `app/utils/env.server.ts`
- When enabled, skips database persistence for logs/executions

### UI Components

**FlowBuilder** (`app/components/builder/FlowBuilder.tsx`)
- React Flow integration with custom node types
- Valtio for client-side state management
- Node palette, config panel, and canvas

**Node System**
- `GlassNode.tsx`: Glassmorphic custom node component
- `NodePalette.tsx`: Draggable node catalog
- `NodeConfigPanel.tsx`: Dynamic config form based on node type

**Node Catalog** (`app/constants/node-catalog.ts`)
- Defines available node types, icons, categories, config schemas

### Template System

**Template Rendering** (`app/utils/templates.ts`)
- Supports `{{variable}}` syntax for interpolation
- Context resolution with dot notation (e.g., `{{user.email}}`)
- Used in EMAIL, TRANSFORM, and other dynamic nodes

### Internationalization

**i18n Setup**
- `remix-i18next` with `i18next-fs-backend`
- Server config: `app/lib/i18n.server.ts`
- Client config: `app/i18n/i18next.ts`
- Translation model in Prisma schema

## Important Patterns

### Adding New Node Types

1. Add enum to `prisma/schema.prisma` `NodeType`
2. Add type definition to `app/types/workflow.ts` `WorkflowNodeType`
3. Create handler in `app/services/execution/node-handlers.server.ts`
4. Add validation rules in `app/utils/workflow-validation.ts`
5. Add to node catalog in `app/constants/node-catalog.ts`
6. Add config UI in `app/components/builder/NodeConfigPanel.tsx`

### Workflow Execution Flow

1. Validation (`validateWorkflowDefinition`)
2. Graph construction (`buildWorkflowGraph`)
3. Topological execution with indegree tracking
4. Parallel batches (max 4 concurrent) + sequential nodes run separately
5. Edge activation based on conditions and branch labels
6. Event emission for SSE streaming
7. Database persistence (if not demo mode)

### Effect Usage

- All node handlers return `Effect.Effect<TaskResult>`
- `Effect.gen` for async operations, `Effect.sync` for pure functions
- Policies applied via `executeWithPolicies` wrapper
- Timeout via `Promise.race`, retry via while loop

### Testing Patterns

- Vitest with happy-dom environment
- Alias `~` resolves to `app/` directory
- Test files in `tests/**/*.test.ts`
- Focus on workflow-engine and validation logic
- Mock-free integration tests for core execution paths

## Common Gotchas

- **Cycles**: Workflows must be DAGs. Validation will throw if cycles detected.
- **Node IDs**: React Flow auto-generates, must match between nodes/edges arrays.
- **Branching**: CONDITIONAL nodes set `result.branch`, edges match via `label`.
- **Context**: Shared context accumulates node outputs keyed by node ID, plus merged data.
- **Prisma**: Always run `npx prisma generate` after schema changes.
- **Demo Mode**: Set `DEMO_MODE=true` to skip database writes during testing.
