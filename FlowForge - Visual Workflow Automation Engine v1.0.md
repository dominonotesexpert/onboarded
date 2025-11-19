# **Product Requirements Document (PRD)**

# **FlowForge \- Visual Workflow Automation Engine v1.0**

**Document Version:** 1.0  
 **Last Updated:** November 18, 2025  
 **Product Manager:** \[Your Name\]  
 **Engineering Lead:** \[Your Name\]  
 **Design Lead:** \[Your Name\]  
 **Status:** Ready for Implementation

---

## **Table of Contents**

1. [Executive Summary](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#1-executive-summary)  
2. [Product Vision](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#2-product-vision)  
3. [Technical Architecture](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#3-technical-architecture)  
4. [Core Features & Requirements](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#4-core-features--requirements)  
5. [Design System & UI Requirements](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#5-design-system--ui-requirements)  
6. [User Experience Flows](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#6-user-experience-flows)  
7. [Technical Challenges & Solutions](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#7-technical-challenges--solutions)  
8. [Database Schema](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#8-database-schema)  
9. [API Specifications](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#9-api-specifications)  
10. [Testing Strategy](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#10-testing-strategy)  
11. [Implementation Timeline](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#11-implementation-timeline)  
12. [Success Metrics](https://claude.ai/chat/67d7cbee-3db6-4f5d-90b2-b8763ef98485#12-success-metrics)

---

## **1\. Executive Summary**

### **1.1 Product Vision**

**FlowForge** is a production-grade workflow automation platform featuring a stunning visual builder with real-time execution monitoring. Built with Remix, React, Prisma, and Effect.js, it demonstrates advanced full-stack engineering through graph algorithms, parallel execution, and beautiful, animated user interfaces.

### **1.2 Core Value Proposition**

"Build complex workflow automations with a delightful drag-and-drop interface, execute them with production-grade reliability, and monitor them with real-time visual feedback—all wrapped in a beautiful, modern UI that makes automation feel magical."

### **1.3 Key Differentiators**

1. **🎨 Beautiful by Design**: Smooth animations, modern glassmorphism, interactive feedback  
2. **⚡ Real-Time Everything**: Live execution updates with WebSocket streaming  
3. **🧠 Intelligent Execution**: Graph-based parallel execution with automatic optimization  
4. **🔧 Production Ready**: Retry logic, circuit breakers, comprehensive observability  
5. **🎯 Type-Safe**: Full TypeScript with Effect.js for bulletproof error handling

### **1.4 Alignment with Job Requirements**

| Job Requirement | How FlowForge Addresses It | Complexity Level |
| ----- | ----- | ----- |
| **Workflow Automations** | Core feature: Visual builder \+ execution engine | ⭐⭐⭐⭐⭐ |
| **Compliance Rules Engine** | Conditional logic nodes (if/then/else) | ⭐⭐⭐⭐ |
| **React UIs** | Drag-and-drop builder, animated dashboards | ⭐⭐⭐⭐⭐ |
| **Embeddable UIs** | Execution status widget for external sites | ⭐⭐⭐⭐ |
| **Internationalization** | Multi-language support (EN, ES, FR) | ⭐⭐⭐ |
| **Third Party APIs** | Email, Slack, HTTP task nodes with retry | ⭐⭐⭐⭐⭐ |
| **Testing & Observability** | 85%+ coverage, Datadog patterns, Sentry | ⭐⭐⭐⭐⭐ |
| **Remix \+ React** | Full-stack with SSR, loaders, actions | ⭐⭐⭐⭐⭐ |
| **Prisma** | Complex queries, graph relationships | ⭐⭐⭐⭐ |
| **Effect.js** | Concurrency, retry, error handling | ⭐⭐⭐⭐⭐ |
| **TypeScript** | Strict mode, advanced types throughout | ⭐⭐⭐⭐⭐ |

---

## **2\. Product Vision**

### **2.1 Target Users**

**Primary Persona**: Full-Stack Engineer Evaluating Technical Depth

**Name**: Sarah Chen  
 **Role**: Senior Engineer at SaaS startup  
 **Background**: 5 years experience, values beautiful code AND beautiful UI  
 **Pain Points**:

* Most workflow tools have clunky, dated UIs  
* Hard to understand execution flow in real-time  
* Poor error handling in production  
* No visibility into what's happening

**What Sarah Wants to See**:

* ✅ Smooth, delightful interactions  
* ✅ Real-time execution visualization  
* ✅ Production-grade error handling  
* ✅ Clean, understandable code architecture

### **2.2 Success Criteria for Demo**

| Criterion | Target | Measurement |
| ----- | ----- | ----- |
| **Visual Impact** | "Wow, this is beautiful" | First impression |
| **Technical Depth** | "This is sophisticated" | Code review |
| **Production Ready** | "I'd deploy this" | Error handling, tests, observability |
| **Full Stack Coverage** | All required tech used | Architecture review |
| **Execution Speed** | Build in 16-18 hours | Time tracking |

---

## **3\. Technical Architecture**

### **3.1 System Architecture Diagram**

┌─────────────────────────────────────────────────────────────────┐  
│                        PRESENTATION LAYER                        │  
│                     (Beautiful React UIs)                        │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  Workflow Builder (React Flow \+ Framer Motion)              │ │  
│  │  \- Drag & drop with spring animations                       │ │  
│  │  \- Auto-layout with smooth transitions                      │ │  
│  │  \- Glassmorphism node cards                                 │ │  
│  │  \- Interactive edge animations                              │ │  
│  │  \- Mini-map with live execution overlay                     │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│                                                                  │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  Execution Dashboard (Real-time Monitoring)                 │ │  
│  │  \- Animated progress bars with gradient shimmer             │ │  
│  │  \- Live status updates with smooth state transitions        │ │  
│  │  \- Timeline view with parallax scrolling                    │ │  
│  │  \- Sparkline charts for performance metrics                 │ │  
│  │  \- Toast notifications with slide-in animations             │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│                                                                  │  
│  ┌────────────────────────────────────────────────────────────┐ │  
│  │  Embeddable Status Widget (Web Component)                   │ │  
│  │  \- Compact execution viewer                                 │ │  
│  │  \- Skeleton loading states                                  │ │  
│  │  \- Theme customization (light/dark/custom)                  │ │  
│  └────────────────────────────────────────────────────────────┘ │  
│                                                                  │  
└────────────────────────────┬────────────────────────────────────┘  
                             │ HTTPS / WebSocket  
                             ▼  
┌─────────────────────────────────────────────────────────────────┐  
│                     APPLICATION LAYER                            │  
│                  (Remix Full-Stack Routes)                       │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│  Routes (SSR \+ API):                                             │  
│  ┌──────────────────┐  ┌──────────────────┐                    │  
│  │ /workflows       │  │ /workflows/new   │                    │  
│  │ (Loader: List)   │  │ (Visual Builder) │                    │  
│  └──────────────────┘  └──────────────────┘                    │  
│                                                                  │  
│  ┌──────────────────┐  ┌──────────────────┐                    │  
│  │ /workflows/$id/  │  │ /executions/$id  │                    │  
│  │ execute (Action) │  │ (Real-time View) │                    │  
│  └──────────────────┘  └──────────────────┘                    │  
│                                                                  │  
│  ┌────────────────────────────────────────┐                    │  
│  │ /ws/executions/$id (WebSocket Handler) │                    │  
│  │ \- Pub/Sub for real-time updates         │                    │  
│  │ \- Heartbeat for connection health        │                    │  
│  └────────────────────────────────────────┘                    │  
│                                                                  │  
└────────────────────────────┬────────────────────────────────────┘  
                             │  
                             ▼  
┌─────────────────────────────────────────────────────────────────┐  
│                    BUSINESS LOGIC LAYER                          │  
│                   (Effect.js Services)                           │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│  ┌────────────────────────────────────────────────────────────┐│  
│  │  WorkflowExecutionEngine                                     ││  
│  │  ┌──────────────────────────────────────────────────────┐  ││  
│  │  │ 1\. TopologicalSorter (Kahn's Algorithm)              │  ││  
│  │  │    \- Build DAG from workflow definition               │  ││  
│  │  │    \- Detect circular dependencies                     │  ││  
│  │  │    \- Optimize execution order                         │  ││  
│  │  └──────────────────────────────────────────────────────┘  ││  
│  │                                                              ││  
│  │  ┌──────────────────────────────────────────────────────┐  ││  
│  │  │ 2\. ParallelExecutor (Effect.forEach)                  │  ││  
│  │  │    \- Concurrent task execution (limit: 5\)             │  ││  
│  │  │    \- Dynamic priority adjustment                      │  ││  
│  │  │    \- Resource allocation management                   │  ││  
│  │  └──────────────────────────────────────────────────────┘  ││  
│  │                                                              ││  
│  │  ┌──────────────────────────────────────────────────────┐  ││  
│  │  │ 3\. StateMachine (Execution Lifecycle)                 │  ││  
│  │  │    States: PENDING → RUNNING → COMPLETED/FAILED       │  ││  
│  │  │    Transitions: Validated, logged, broadcasted        │  ││  
│  │  └──────────────────────────────────────────────────────┘  ││  
│  └────────────────────────────────────────────────────────────┘│  
│                                                                  │  
│  ┌────────────────────────────────────────────────────────────┐│  
│  │  Task Executors (Effect Services with Resilience)           ││  
│  │                                                              ││  
│  │  EmailExecutor → SendGrid API (retry \+ timeout)             ││  
│  │  SlackExecutor → Slack Webhook (circuit breaker)            ││  
│  │  HttpExecutor  → Generic HTTP (retry \+ backoff)             ││  
│  │  DelayExecutor → Scheduled execution (Effect.sleep)         ││  
│  │  ConditionExecutor → Evaluate logic (if/then/else)          ││  
│  │  TransformExecutor → Data manipulation (map/filter/reduce)  ││  
│  └────────────────────────────────────────────────────────────┘│  
│                                                                  │  
└────────────────────────────┬────────────────────────────────────┘  
                             │  
                             ▼  
┌─────────────────────────────────────────────────────────────────┐  
│                    DATA ACCESS LAYER (Prisma)                    │  
├─────────────────────────────────────────────────────────────────┤  
│  Models:                                                         │  
│  \- Workflow (definition, nodes, edges)                          │  
│  \- Execution (runtime instance, state machine)                  │  
│  \- TaskExecution (individual task run, retries)                 │  
│  \- ExecutionLog (audit trail with timestamps)                   │  
│                                                                  │  
│  Optimizations:                                                  │  
│  \- Indexes on (workflowId, status, createdAt)                   │  
│  \- JSONB columns for flexible node config                       │  
│  \- Partitioning for execution logs (by date)                    │  
└────────────────────────────┬────────────────────────────────────┘  
                             │  
                             ▼  
┌─────────────────────────────────────────────────────────────────┐  
│                    PERSISTENCE LAYER                             │  
│                    (PostgreSQL 15\)                               │  
└─────────────────────────────────────────────────────────────────┘

---

## **4\. Core Features & Requirements**

### **4.1 Feature 1: Visual Workflow Builder**

#### **4.1.1 Overview**

An intuitive, beautiful drag-and-drop canvas for creating workflow automations with smooth animations and delightful interactions.

#### **4.1.2 Functional Requirements**

**FR-1.1: Node Palette**

* **Priority**: P0 (Critical)  
* **Description**: Draggable node types available in sidebar  
* **Acceptance Criteria**:  
  * ✅ 6 node types: Email, Slack, HTTP, Delay, Conditional, Transform  
  * ✅ Visual preview on hover (animated tooltip)  
  * ✅ Drag with ghost image following cursor  
  * ✅ Smooth spring animation when dropped  
  * ✅ Keyboard accessible (Tab \+ Enter to add)

**FR-1.2: Canvas Interactions**

* **Priority**: P0 (Critical)  
* **Description**: Interactive workflow canvas  
* **Acceptance Criteria**:  
  * ✅ Infinite canvas with panning (mouse drag or touchpad)  
  * ✅ Zoom in/out (mouse wheel or pinch)  
  * ✅ Auto-layout algorithm (Dagre) with smooth transitions  
  * ✅ Mini-map for navigation (bottom-right corner)  
  * ✅ Grid snapping for alignment (toggle on/off)  
  * ✅ Multi-select (Shift \+ Click or drag selection box)  
  * ✅ Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)

**FR-1.3: Node Creation & Configuration**

* **Priority**: P0 (Critical)  
* **Description**: Add and configure workflow nodes  
* **Acceptance Criteria**:  
  * ✅ Click node to open configuration panel (slide-in from right)  
  * ✅ Form validation with inline error messages  
  * ✅ Variable picker for dynamic values (e.g., {{email}})  
  * ✅ Preview of node output before saving  
  * ✅ Duplicate node (right-click → Duplicate)  
  * ✅ Delete node (Delete key or right-click → Delete)

**FR-1.4: Edge Creation & Management**

* **Priority**: P0 (Critical)  
* **Description**: Connect nodes with visual edges  
* **Acceptance Criteria**:  
  * ✅ Drag from output handle to input handle  
  * ✅ Smooth bezier curves or step edges (user preference)  
  * ✅ Animated connection preview while dragging  
  * ✅ Cannot create circular dependencies (validation \+ error message)  
  * ✅ Conditional edges (different colors for if/else branches)  
  * ✅ Delete edge (click edge → Delete or right-click → Remove)

**FR-1.5: Validation & Error Prevention**

* **Priority**: P0 (Critical)  
* **Description**: Prevent invalid workflow configurations  
* **Acceptance Criteria**:  
  * ✅ Detect circular dependencies before saving  
  * ✅ Validate all nodes have required configuration  
  * ✅ Show error indicators on invalid nodes (red outline)  
  * ✅ Cannot execute workflow with errors  
  * ✅ Helpful error messages with suggested fixes

#### **4.1.3 UI/UX Design Requirements**

**Visual Design**:

┌─────────────────────────────────────────────────────────────────┐  
│  ⚡ FlowForge                              \[◉ Autosave\] \[@User\] │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│  ┌──────────┐                                                   │  
│  │ NODES    │  \[Canvas Controls: ⊕ ⊖ ⤢ ⟲\]                      │  
│  ├──────────┤                                                   │  
│  │ 📧 Email │                    CANVAS AREA                    │  
│  │ 💬 Slack │  ┌────────────────────────────────────────┐     │  
│  │ 🌐 HTTP  │  │                                         │     │  
│  │ ⏰ Delay │  │    ┌──────────────┐                    │     │  
│  │ 🔀 If    │  │    │   START      │                    │     │  
│  │ 🔧 Xform │  │    └──────┬───────┘                    │     │  
│  └──────────┘  │           │                            │     │  
│                │           ▼                            │     │  
│   Selected:    │    ┌──────────────┐                    │     │  
│   Email Node   │    │  📧 Email    │◄─ Selected         │     │  
│                │    │  Send Welcome│   (glowing border)  │     │  
│  ┌──────────┐  │    └──────┬───────┘                    │     │  
│  │ Config   │  │           │                            │     │  
│  │ ─────── │  │           ▼                            │     │  
│  │ To:      │  │    ┌──────────────┐                    │     │  
│  │ \[\_\_\_\_\]   │  │    │  💬 Slack    │                    │     │  
│  │          │  │    │  Notify Team │                    │     │  
│  │ Subject: │  │    └──────────────┘                    │     │  
│  │ \[\_\_\_\_\]   │  │                                         │     │  
│  │          │  │                                         │     │  
│  │ \[Save\]   │  │           Mini-map: ▼                  │     │  
│  └──────────┘  │           ┌────┐  \[View\]              │     │  
│                │           └────┘                       │     │  
│                └────────────────────────────────────────┘     │  
│                                                                 │  
│  \[← Back\]  \[Save Workflow\]  \[▶ Execute\]                        │  
└─────────────────────────────────────────────────────────────────┘

**Node Card Design** (Glassmorphism):

/\* Node styling \*/  
.workflow-node {  
  background: rgba(255, 255, 255, 0.1);  
  backdrop-filter: blur(10px);  
  border: 1px solid rgba(255, 255, 255, 0.2);  
  border-radius: 12px;  
  box-shadow:   
    0 8px 32px 0 rgba(31, 38, 135, 0.15),  
    inset 0 1px 0 0 rgba(255, 255, 255, 0.3);  
    
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);  
}

.workflow-node:hover {  
  transform: translateY(-2px);  
  box-shadow:   
    0 12px 48px 0 rgba(31, 38, 135, 0.25),  
    inset 0 1px 0 0 rgba(255, 255, 255, 0.4);  
}

.workflow-node.selected {  
  border: 2px solid \#3b82f6;  
  box-shadow:   
    0 0 0 4px rgba(59, 130, 246, 0.1),  
    0 12px 48px 0 rgba(59, 130, 246, 0.3);  
}

**Animations** (Framer Motion):

// Node appear animation  
const nodeVariants \= {  
  hidden: { scale: 0, opacity: 0 },  
  visible: {  
    scale: 1,  
    opacity: 1,  
    transition: {  
      type: "spring",  
      stiffness: 260,  
      damping: 20  
    }  
  }  
};

// Edge drawing animation  
const edgeVariants \= {  
  hidden: { pathLength: 0, opacity: 0 },  
  visible: {  
    pathLength: 1,  
    opacity: 1,  
    transition: {  
      pathLength: { duration: 0.5, ease: "easeInOut" },  
      opacity: { duration: 0.2 }  
    }  
  }  
};

---

### **4.2 Feature 2: Real-Time Execution Dashboard**

#### **4.2.1 Overview**

A stunning, animated dashboard showing live workflow execution with real-time updates, progress tracking, and performance metrics.

#### **4.2.2 Functional Requirements**

**FR-2.1: Live Execution View**

* **Priority**: P0 (Critical)  
* **Description**: Real-time visualization of workflow execution  
* **Acceptance Criteria**:  
  * ✅ Shows all tasks with current status (pending/running/success/failed)  
  * ✅ Progress bar for each task (animated)  
  * ✅ Duration timer counting up in real-time  
  * ✅ Task output preview (expandable)  
  * ✅ Error details if task fails (with retry count)  
  * ✅ Auto-scroll to current executing task

**FR-2.2: Execution Timeline**

* **Priority**: P1 (High)  
* **Description**: Visual timeline of task execution  
* **Acceptance Criteria**:  
  * ✅ Horizontal timeline showing task sequence  
  * ✅ Parallel tasks shown on same timeline level  
  * ✅ Color-coded by status (green/yellow/red)  
  * ✅ Hover to see task details  
  * ✅ Click to jump to logs

**FR-2.3: Live Logs Stream**

* **Priority**: P1 (High)  
* **Description**: Streaming logs from execution  
* **Acceptance Criteria**:  
  * ✅ Auto-scrolling log viewer  
  * ✅ Syntax highlighting for different log levels (info/warn/error)  
  * ✅ Filter by log level  
  * ✅ Search logs  
  * ✅ Download logs as JSON/TXT

**FR-2.4: Performance Metrics**

* **Priority**: P2 (Medium)  
* **Description**: Real-time performance charts  
* **Acceptance Criteria**:  
  * ✅ Total execution time  
  * ✅ Task breakdown (pie chart)  
  * ✅ Retry count  
  * ✅ API response times (sparkline chart)

#### **4.2.3 UI/UX Design Requirements**

**Dashboard Layout**:

┌─────────────────────────────────────────────────────────────────┐  
│  Execution: exec\_abc123          Status: ⚡ Running   2m 34s    │  
├─────────────────────────────────────────────────────────────────┤  
│                                                                  │  
│  ┌──────────────────────────────────────────────────────────┐  │  
│  │  TIMELINE VIEW                                            │  │  
│  │                                                           │  │  
│  │  \[✓\]───\[✓\]───\[🔄\]───\[⏳\]───\[⏳\]                          │  │  
│  │  Start  Email  Slack  HTTP  Delay                        │  │  
│  │   0s     1.2s   2.5s   ...    ...                         │  │  
│  └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│  ┌──────────────────────────────────────────────────────────┐  │  
│  │  TASK DETAILS                                             │  │  
│  │                                                           │  │  
│  │  ✓  1\. Send Welcome Email                 Completed 1.2s │  │  
│  │      Message sent to john@example.com                     │  │  
│  │                                                           │  │  
│  │  ✓  2\. Create Slack Account               Completed 890ms│  │  
│  │      User created: @johndoe                               │  │  
│  │                                                           │  │  
│  │  🔄  3\. Notify Manager                    Running...      │  │  
│  │      ████████████░░░░░░░░ 60%                            │  │  
│  │      Calling Slack API... (attempt 2/3)                   │  │  
│  │      \[View Details ▼\]                                     │  │  
│  │                                                           │  │  
│  │  ⏳  4\. Update Database                   Waiting...      │  │  
│  │      Depends on: Task 3                                   │  │  
│  │                                                           │  │  
│  │  ⏳  5\. Send Confirmation                 Waiting...      │  │  
│  │      Depends on: Task 4                                   │  │  
│  └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
│  ┌──────────────────────────────────────────────────────────┐  │  
│  │  LIVE LOGS                              \[Filter ▼\] \[🔍\]   │  │  
│  │  ─────────────────────────────────────────────────────── │  │  
│  │  10:30:00 INFO  Execution started                         │  │  
│  │  10:30:01 INFO  Task 1 completed successfully             │  │  
│  │  10:30:02 INFO  Task 2 completed successfully             │  │  
│  │  10:30:03 INFO  Task 3 started                            │  │  
│  │  10:30:04 WARN  Slack API timeout, retrying...            │  │  
│  │  10:30:05 INFO  Task 3 retry attempt 2/3                  │  │  
│  │  ▼ Auto-scrolling...                                      │  │  
│  └──────────────────────────────────────────────────────────┘  │  
│                                                                  │  
└─────────────────────────────────────────────────────────────────┘

**Task Status Card Design**:

// Task card with animated states  
\<motion.div  
  className="task-card"  
  initial={{ opacity: 0, x: \-20 }}  
  animate={{ opacity: 1, x: 0 }}  
  transition={{ duration: 0.3 }}  
\>  
  \<div className="task-header"\>  
    \<StatusIcon status={task.status} /\> {/\* Animated icon \*/}  
    \<span className="task-name"\>{task.name}\</span\>  
    \<span className="task-duration"\>{formatDuration(task.duration)}\</span\>  
  \</div\>  
    
  {task.status \=== 'running' && (  
    \<motion.div  
      className="progress-bar"  
      initial={{ width: 0 }}  
      animate={{ width: \`${task.progress}%\` }}  
      transition={{ duration: 0.5, ease: "easeOut" }}  
    \>  
      \<div className="progress-shine" /\> {/\* Animated shimmer \*/}  
    \</motion.div\>  
  )}  
    
  {task.status \=== 'success' && (  
    \<motion.div  
      initial={{ scale: 0 }}  
      animate={{ scale: 1 }}  
      transition={{ type: "spring", stiffness: 200 }}  
    \>  
      \<CheckIcon className="success-icon" /\>  
    \</motion.div\>  
  )}  
\</motion.div\>

**Progress Bar with Gradient Shimmer**:

.progress-bar {  
  position: relative;  
  height: 8px;  
  background: linear-gradient(90deg, \#3b82f6, \#8b5cf6, \#ec4899);  
  background-size: 200% 100%;  
  border-radius: 4px;  
  overflow: hidden;  
  animation: gradient-shift 3s ease infinite;  
}

.progress-shine {  
  position: absolute;  
  top: 0;  
  left: \-100%;  
  width: 100%;  
  height: 100%;  
  background: linear-gradient(  
    90deg,  
    transparent,  
    rgba(255, 255, 255, 0.3),  
    transparent  
  );  
  animation: shimmer 2s infinite;  
}

@keyframes gradient-shift {  
  0%, 100% { background-position: 0% 50%; }  
  50% { background-position: 100% 50%; }  
}

@keyframes shimmer {  
  0% { left: \-100%; }  
  100% { left: 100%; }  
}

---

### **4.3 Feature 3: Task Node Types**

#### **4.3.1 Email Task Node**

**Configuration UI**:

┌─────────────────────────────────────────┐  
│  📧 Email Task Configuration            │  
├─────────────────────────────────────────┤  
│                                          │  
│  To: \[{{employee.email}}\_\_\_\_\_\_\_\_\_\_\_\]    │  
│      💡 Use {{variable}} for dynamic    │  
│                                          │  
│  Subject: \[Welcome to FlowForge\!\_\_\_\]    │  
│                                          │  
│  Body:                                   │  
│  ┌────────────────────────────────────┐ │  
│  │ Hi {{employee.name}},              │ │  
│  │                                    │ │  
│  │ Welcome to the team\! We're excited │ │  
│  │ to have you join us.               │ │  
│  │                                    │ │  
│  │ Best regards,                      │ │  
│  │ The FlowForge Team                 │ │  
│  └────────────────────────────────────┘ │  
│                                          │  
│  From: \[noreply@flowforge.dev\_\_\_\_\_\_\]    │  
│                                          │  
│  ⚙️ Advanced:                            │  
│  Timeout: \[10000ms\]  Retries: \[3\]       │  
│                                          │  
│  \[Preview\] \[Test Send\] \[Save\]           │  
└─────────────────────────────────────────┘

**Execution Logic**:

export class EmailTaskExecutor extends Effect.Service\<EmailTaskExecutor\>()(  
  'EmailTaskExecutor',  
  {  
    effect: Effect.gen(function\* (\_) {  
      const sendgrid \= yield\* \_(SendGridClient);  
      const logger \= yield\* \_(LoggerService);  
      const metrics \= yield\* \_(MetricsService);  
        
      return {  
        execute: (config: EmailConfig, context: ExecutionContext) \=\>  
          Effect.gen(function\* (\_) {  
            const startTime \= Date.now();  
              
            // Replace variables in template  
            const to \= replaceVariables(config.to, context);  
            const subject \= replaceVariables(config.subject, context);  
            const body \= replaceVariables(config.body, context);  
              
            // Validate email address  
            if (\!isValidEmail(to)) {  
              return yield\* \_(  
                Effect.fail(new ValidationError({ field: 'to', value: to }))  
              );  
            }  
              
            // Log start  
            yield\* \_(logger.info('Sending email', {  
              executionId: context.executionId,  
              taskId: context.taskId,  
              to,  
              subject  
            }));  
              
            // Send email with retry and timeout  
            const result \= yield\* \_(  
              pipe(  
                sendgrid.sendEmail({ to, subject, body, from: config.from }),  
                Effect.retry({  
                  schedule: Schedule.exponential(100),  
                  times: config.retries || 3  
                }),  
                Effect.timeout(config.timeout || 10000),  
                Effect.tap((res) \=\>  
                  metrics.increment('email.sent.success', {  
                    executionId: context.executionId  
                  })  
                ),  
                Effect.catchAll((error) \=\>  
                  Effect.gen(function\* (\_) {  
                    yield\* \_(  
                      logger.error('Failed to send email', error, {  
                        executionId: context.executionId,  
                        to,  
                        subject  
                      })  
                    );  
                      
                    yield\* \_(  
                      metrics.increment('email.sent.failure', {  
                        executionId: context.executionId,  
                        errorType: error.\_tag  
                      })  
                    );  
                      
                    return Effect.fail(error);  
                  })  
                )  
              )  
            );  
              
            const duration \= Date.now() \- startTime;  
              
            return {  
              success: true,  
              output: {  
                messageId: result.messageId,  
                to,  
                subject,  
                sentAt: new Date().toISOString()  
              },  
              duration  
            };  
          })  
      };  
    })  
  }  
) {}

#### **4.3.2 Slack Task Node**

**Configuration UI**:

┌─────────────────────────────────────────┐  
│  💬 Slack Task Configuration            │  
├─────────────────────────────────────────┤  
│                                          │  
│  Channel: \[\#general\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]     │  
│            \[or @username for DM\]        │  
│                                          │  
│  Message:                                │  
│  ┌────────────────────────────────────┐ │  
│  │ 🎉 New team member alert\!          │ │  
│  │                                    │ │  
│  │ Name: {{employee.name}}            │ │  
│  │ Department: {{employee.dept}}      │ │  
│  │ Start Date: {{employee.startDate}} │ │  
│  │                                    │ │  
│  │ Welcome them warmly\! 👋            │ │  
│  └────────────────────────────────────┘ │  
│                                          │  
│  📎 Attachments (optional):              │  
│  \[ \] Include employee photo              │  
│  \[ \] Attach onboarding checklist         │  
│                                          │  
│  🎨 Style:                               │  
│  Color: \[🟢 Green\] (success theme)      │  
│  Icon: \[🎉\] (celebration)                │  
│                                          │  
│  \[Preview\] \[Test Send\] \[Save\]           │  
└─────────────────────────────────────────┘

#### **4.3.3 HTTP Task Node**

**Configuration UI**:

┌─────────────────────────────────────────┐  
│  🌐 HTTP Request Configuration          │  
├─────────────────────────────────────────┤  
│                                          │  
│  Method: \[POST ▼\]  \[GET/POST/PUT/DELETE\]│  
│                                          │  
│  URL: \[https://api.example.com/users\_\]  │  
│                                          │  
│  Headers:                                │  
│  ┌────────────────────────────────────┐ │  
│  │ Authorization: Bearer {{apiKey}}   │ │  
│  │ Content-Type: application/json     │ │  
│  │ \[+ Add Header\]                     │ │  
│  └────────────────────────────────────┘ │  
│                                          │  
│  Body: \[JSON ▼\]                          │  
│  ┌────────────────────────────────────┐ │  
│  │ {                                  │ │  
│  │   "name": "{{employee.name}}",     │ │  
│  │   "email": "{{employee.email}}",   │ │  
│  │   "role": "developer"              │ │  
│  │ }                                  │ │  
│  └────────────────────────────────────┘ │  
│                                          │  
│  ⚙️ Options:                             │  
│  Timeout: \[30000ms\]  Retries: \[3\]       │  
│  \[ \] Follow redirects                    │  
│  \[ \] Verify SSL certificate              │  
│                                          │  
│  \[Test Request\] \[Save\]                   │  
└─────────────────────────────────────────┘

#### **4.3.4 Conditional Task Node**

**Configuration UI**:

┌─────────────────────────────────────────┐  
│  🔀 Conditional Logic                    │  
├─────────────────────────────────────────┤  
│                                          │  
│  IF this condition is true:              │  
│  ┌────────────────────────────────────┐ │  
│  │ Field: \[employee.score\_\_\_\_\_\_\_\]     │ │  
│  │ Operator: \[is greater than ▼\]     │ │  
│  │ Value: \[80\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\]       │ │  
│  └────────────────────────────────────┘ │  
│                                          │  
│  ➜ THEN execute:                         │  
│     \[Node: Notify Sales Team\_\_\_\_\_\_\_▼\]   │  
│                                          │  
│  ➜ ELSE execute:                         │  
│     \[Node: Auto Nurture Sequence\_\_\_▼\]   │  
│                                          │  
│  💡 Tip: You can chain multiple          │  
│     conditions using AND/OR logic        │  
│                                          │  
│  \[+ Add Condition\] \[Save\]                │  
└─────────────────────────────────────────┘

---

## **5\. Design System & UI Requirements**

### **5.1 Visual Design Language**

#### **5.1.1 Color Palette**

**Primary Colors**:

:root {  
  /\* Brand Colors \*/  
  \--color-primary-50: \#eff6ff;  
  \--color-primary-100: \#dbeafe;  
  \--color-primary-500: \#3b82f6;  /\* Main brand blue \*/  
  \--color-primary-600: \#2563eb;  
  \--color-primary-900: \#1e3a8a;  
    
  /\* Secondary Colors (Purple) \*/  
  \--color-secondary-500: \#8b5cf6;  
  \--color-secondary-600: \#7c3aed;  
    
  /\* Accent (Pink) \*/  
  \--color-accent-500: \#ec4899;  
  \--color-accent-600: \#db2777;  
    
  /\* Status Colors \*/  
  \--color-success: \#10b981;  
  \--color-warning: \#f59e0b;  
  \--color-error: \#ef4444;  
  \--color-info: \#3b82f6;  
    
  /\* Neutrals \*/  
  \--color-gray-50: \#f9fafb;  
  \--color-gray-100: \#f3f4f6;  
  \--color-gray-200: \#e5e7eb;  
  \--color-gray-300: \#d1d5db;  
  \--color-gray-400: \#9ca3af;  
  \--color-gray-500: \#6b7280;  
  \--color-gray-600: \#4b5563;  
  \--color-gray-700: \#374151;  
  \--color-gray-800: \#1f2937;  
  \--color-gray-900: \#111827;  
    
  /\* Dark mode overrides \*/  
  \--color-bg-primary: \#0f172a;  
  \--color-bg-secondary: \#1e293b;  
  \--color-bg-tertiary: \#334155;  
}

**Gradient Definitions**:

/\* Hero Gradient \*/  
.gradient-hero {  
  background: linear-gradient(  
    135deg,  
    \#667eea 0%,  
    \#764ba2 100%  
  );  
}

/\* Success Gradient \*/  
.gradient-success {  
  background: linear-gradient(  
    90deg,  
    \#10b981 0%,  
    \#059669 100%  
  );  
}

/\* Execution Progress Gradient \*/  
.gradient-progress {  
  background: linear-gradient(  
    90deg,  
    \#3b82f6 0%,  
    \#8b5cf6 50%,  
    \#ec4899 100%  
  );  
  background-size: 200% 100%;  
}

/\* Glass Background \*/  
.glass-bg {  
  background: rgba(255, 255, 255, 0.05);  
  backdrop-filter: blur(20px);  
  border: 1px solid rgba(255, 255, 255, 0.1);  
}

#### **5.1.2 Typography**

**Font Stack**:

:root {  
  /\* Primary font (headings, UI) \*/  
  \--font-sans: 'Inter', \-apple-system, BlinkMacSystemFont,   
               'Segoe UI', 'Roboto', sans-serif;  
    
  /\* Monospace (code, logs) \*/  
  \--font-mono: 'Fira Code', 'Courier New', monospace;  
}

/\* Type Scale \*/  
.text-xs { font-size: 0.75rem; line-height: 1rem; }  
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  
.text-base { font-size: 1rem; line-height: 1.5rem; }  
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }  
.text-2xl { font-size: 1.5rem; line-height: 2rem; }  
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }  
.text-5xl { font-size: 3rem; line-height: 1; }

/\* Font Weights \*/  
.font-normal { font-weight: 400; }  
.font-medium { font-weight: 500; }  
.font-semibold { font-weight: 600; }  
.font-bold { font-weight: 700; }

#### **5.1.3 Spacing & Layout**

**Spacing Scale** (Tailwind-compatible):

:root {  
  \--spacing-1: 0.25rem;   /\* 4px \*/  
  \--spacing-2: 0.5rem;    /\* 8px \*/  
  \--spacing-3: 0.75rem;   /\* 12px \*/  
  \--spacing-4: 1rem;      /\* 16px \*/  
  \--spacing-6: 1.5rem;    /\* 24px \*/  
  \--spacing-8: 2rem;      /\* 32px \*/  
  \--spacing-12: 3rem;     /\* 48px \*/  
  \--spacing-16: 4rem;     /\* 64px \*/  
  \--spacing-24: 6rem;     /\* 96px \*/  
}

**Border Radius**:

:root {  
  \--radius-sm: 0.25rem;    /\* 4px \*/  
  \--radius-md: 0.5rem;     /\* 8px \*/  
  \--radius-lg: 0.75rem;    /\* 12px \*/  
  \--radius-xl: 1rem;       /\* 16px \*/  
  \--radius-2xl: 1.5rem;    /\* 24px \*/  
  \--radius-full: 9999px;   /\* Fully rounded \*/  
}

#### **5.1.4 Shadows & Elevation**

**Shadow Scale**:

:root {  
  /\* Subtle elevation \*/  
  \--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);  
    
  /\* Card elevation \*/  
  \--shadow-md: 0 4px 6px \-1px rgb(0 0 0 / 0.1),  
               0 2px 4px \-2px rgb(0 0 0 / 0.1);  
    
  /\* Floating element \*/  
  \--shadow-lg: 0 10px 15px \-3px rgb(0 0 0 / 0.1),  
               0 4px 6px \-4px rgb(0 0 0 / 0.1);  
    
  /\* Modal/Dialog \*/  
  \--shadow-xl: 0 20px 25px \-5px rgb(0 0 0 / 0.1),  
               0 8px 10px \-6px rgb(0 0 0 / 0.1);  
    
  /\* Dramatic depth \*/  
  \--shadow-2xl: 0 25px 50px \-12px rgb(0 0 0 / 0.25);  
    
  /\* Inner shadow \*/  
  \--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);  
}

/\* Glow effects for interactive elements \*/  
.glow-blue {  
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);  
}

.glow-purple {  
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);  
}

.glow-success {  
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);  
}

---

### **5.2 Animation System**

#### **5.2.1 Motion Principles**

**Easing Functions**:

export const easings \= {  
  // Natural, spring-like motion  
  spring: {  
    type: "spring",  
    stiffness: 260,  
    damping: 20  
  },  
    
  // Smooth in and out  
  easeInOut: \[0.4, 0, 0.2, 1\],  
    
  // Quick entrance  
  easeOut: \[0, 0, 0.2, 1\],  
    
  // Quick exit  
  easeIn: \[0.4, 0, 1, 1\],  
    
  // Bouncy spring  
  bouncySpring: {  
    type: "spring",  
    stiffness: 400,  
    damping: 10  
  }  
};

**Duration Standards**:

export const durations \= {  
  instant: 0.1,    // 100ms \- Icon changes, hover states  
  fast: 0.2,       // 200ms \- Tooltips, dropdowns  
  normal: 0.3,     // 300ms \- Modal opens, panel slides  
  slow: 0.5,       // 500ms \- Page transitions  
  slower: 0.8      // 800ms \- Complex animations  
};

#### **5.2.2 Common Animation Patterns**

**1\. Fade In/Out**:

const fadeInOut \= {  
  initial: { opacity: 0 },  
  animate: { opacity: 1 },  
  exit: { opacity: 0 },  
  transition: { duration: 0.2 }  
};

// Usage  
\<motion.div {...fadeInOut}\>Content\</motion.div\>

**2\. Slide In from Side**:

const slideInFromRight \= {  
  initial: { x: "100%", opacity: 0 },  
  animate: { x: 0, opacity: 1 },  
  exit: { x: "100%", opacity: 0 },  
  transition: { type: "spring", damping: 20 }  
};

// Configuration Panel  
\<motion.div {...slideInFromRight} className="config-panel"\>  
  {/\* Panel content \*/}  
\</motion.div\>

**3\. Scale & Fade (Modals)**:

const modalVariants \= {  
  hidden: { scale: 0.8, opacity: 0 },  
  visible: {  
    scale: 1,  
    opacity: 1,  
    transition: {  
      type: "spring",  
      stiffness: 300,  
      damping: 30  
    }  
  },  
  exit: {  
    scale: 0.8,  
    opacity: 0,  
    transition: { duration: 0.2 }  
  }  
};

// Modal  
\<motion.div  
  variants={modalVariants}  
  initial="hidden"  
  animate="visible"  
  exit="exit"  
  className="modal"  
\>  
  {/\* Modal content \*/}  
\</motion.div\>

**4\. Stagger Children**:

const containerVariants \= {  
  hidden: { opacity: 0 },  
  visible: {  
    opacity: 1,  
    transition: {  
      staggerChildren: 0.1  
    }  
  }  
};

const itemVariants \= {  
  hidden: { opacity: 0, y: 20 },  
  visible: { opacity: 1, y: 0 }  
};

// List with staggered animation  
\<motion.ul variants={containerVariants} initial="hidden" animate="visible"\>  
  {items.map(item \=\> (  
    \<motion.li key={item.id} variants={itemVariants}\>  
      {item.name}  
    \</motion.li\>  
  ))}  
\</motion.ul\>

**5\. Drag Interactions**:

// Draggable node from palette  
\<motion.div  
  drag  
  dragSnapToOrigin  
  dragElastic={0.2}  
  whileDrag={{ scale: 1.1, cursor: "grabbing" }}  
  onDragEnd={handleDrop}  
  className="node-palette-item"  
\>  
  \<EmailIcon /\>  
  \<span\>Email Task\</span\>  
\</motion.div\>

**6\. Path Drawing (Edges)**:

// Animated connection line  
\<motion.path  
  d={edgePath}  
  stroke="\#3b82f6"  
  strokeWidth={2}  
  fill="none"  
  initial={{ pathLength: 0, opacity: 0 }}  
  animate={{ pathLength: 1, opacity: 1 }}  
  transition={{ duration: 0.5, ease: "easeInOut" }}  
/\>

#### **5.2.3 Loading States**

**Skeleton Loaders**:

// Shimmer effect  
const shimmer \= keyframes\`  
  0% { background-position: \-1000px 0; }  
  100% { background-position: 1000px 0; }  
\`;

const SkeletonCard \= styled.div\`  
  background: linear-gradient(  
    90deg,  
    \#f0f0f0 0px,  
    \#f8f8f8 40px,  
    \#f0f0f0 80px  
  );  
  background-size: 1000px 100%;  
  animation: ${shimmer} 1.5s infinite;  
  border-radius: 8px;  
  height: 100px;  
\`;

// Usage  
{isLoading ? \<SkeletonCard /\> : \<ActualContent /\>}

**Spinner**:

const Spinner \= () \=\> (  
  \<motion.div  
    className="spinner"  
    animate={{ rotate: 360 }}  
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}  
  \>  
    \<svg viewBox="0 0 50 50"\>  
      \<circle  
        cx="25"  
        cy="25"  
        r="20"  
        stroke="currentColor"  
        strokeWidth="4"  
        fill="none"  
        strokeDasharray="31.4 31.4"  
        strokeLinecap="round"  
      /\>  
    \</svg\>  
  \</motion.div\>  
);

**Progress Indicator**:

const ProgressBar \= ({ progress }: { progress: number }) \=\> (  
  \<div className="progress-container"\>  
    \<motion.div  
      className="progress-fill"  
      initial={{ width: 0 }}  
      animate={{ width: \`${progress}%\` }}  
      transition={{ duration: 0.5, ease: "easeOut" }}  
    /\>  
  \</div\>  
);

---

### **5.3 Component Library**

#### **5.3.1 Button Component**

// components/ui/Button.tsx  
import { motion } from 'framer-motion';  
import { cn } from '@/lib/utils';

interface ButtonProps {  
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';  
  size?: 'sm' | 'md' | 'lg';  
  loading?: boolean;  
  icon?: React.ReactNode;  
  children: React.ReactNode;  
  onClick?: () \=\> void;  
  disabled?: boolean;  
}

export const Button \= ({  
  variant \= 'primary',  
  size \= 'md',  
  loading \= false,  
  icon,  
  children,  
  onClick,  
  disabled \= false  
}: ButtonProps) \=\> {  
  const baseStyles \= "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";  
    
  const variants \= {  
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",  
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",  
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",  
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"  
  };  
    
  const sizes \= {  
    sm: "px-3 py-1.5 text-sm",  
    md: "px-4 py-2 text-base",  
    lg: "px-6 py-3 text-lg"  
  };  
    
  return (  
    \<motion.button  
      className={cn(baseStyles, variants\[variant\], sizes\[size\])}  
      onClick={onClick}  
      disabled={disabled || loading}  
      whileHover={{ scale: 1.02 }}  
      whileTap={{ scale: 0.98 }}  
    \>  
      {loading ? (  
        \<motion.div  
          className="mr-2"  
          animate={{ rotate: 360 }}  
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}  
        \>  
          \<SpinnerIcon /\>  
        \</motion.div\>  
      ) : icon ? (  
        \<span className="mr-2"\>{icon}\</span\>  
      ) : null}  
      {children}  
    \</motion.button\>  
  );  
};

#### **5.3.2 Card Component**

// components/ui/Card.tsx  
import { motion } from 'framer-motion';  
import { cn } from '@/lib/utils';

interface CardProps {  
  children: React.ReactNode;  
  className?: string;  
  hoverable?: boolean;  
  glowing?: boolean;  
}

export const Card \= ({  
  children,  
  className,  
  hoverable \= false,  
  glowing \= false  
}: CardProps) \=\> {  
  const baseStyles \= "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden";  
    
  return (  
    \<motion.div  
      className={cn(baseStyles, className, {  
        'hover:shadow-xl': hoverable,  
        'ring-2 ring-blue-500 ring-opacity-50': glowing  
      })}  
      {...(hoverable && {  
        whileHover: { y: \-4, transition: { duration: 0.2 } }  
      })}  
    \>  
      {children}  
    \</motion.div\>  
  );  
};

export const CardHeader \= ({ children }: { children: React.ReactNode }) \=\> (  
  \<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"\>  
    {children}  
  \</div\>  
);

export const CardBody \= ({ children }: { children: React.ReactNode }) \=\> (  
  \<div className="px-6 py-4"\>  
    {children}  
  \</div\>  
);

export const CardFooter \= ({ children }: { children: React.ReactNode }) \=\> (  
  \<div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"\>  
    {children}  
  \</div\>  
);

#### **5.3.3 Toast Notification**

// components/ui/Toast.tsx  
import { motion, AnimatePresence } from 'framer-motion';  
import { CheckCircleIcon, XCircleIcon, InfoIcon } from '@heroicons/react/24/solid';

type ToastType \= 'success' | 'error' | 'info';

interface ToastProps {  
  message: string;  
  type: ToastType;  
  visible: boolean;  
  onClose: () \=\> void;  
}

const icons \= {  
  success: CheckCircleIcon,  
  error: XCircleIcon,  
  info: InfoIcon  
};

const colors \= {  
  success: 'bg-green-500',  
  error: 'bg-red-500',  
  info: 'bg-blue-500'  
};

export const Toast \= ({ message, type, visible, onClose }: ToastProps) \=\> {  
  const Icon \= icons\[type\];  
    
  return (  
    \<AnimatePresence\>  
      {visible && (  
        \<motion.div  
          className="fixed top-4 right-4 z-50"  
          initial={{ opacity: 0, y: \-50, scale: 0.3 }}  
          animate={{ opacity: 1, y: 0, scale: 1 }}  
          exit={{ opacity: 0, y: \-50, scale: 0.3 }}  
          transition={{ type: "spring", stiffness: 300, damping: 30 }}  
        \>  
          \<div className={cn(  
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white",  
            colors\[type\]  
          )}\>  
            \<Icon className="w-5 h-5" /\>  
            \<span className="font-medium"\>{message}\</span\>  
            \<button onClick={onClose} className="ml-2 hover:opacity-75"\>  
              \<XIcon className="w-4 h-4" /\>  
            \</button\>  
          \</div\>  
        \</motion.div\>  
      )}  
    \</AnimatePresence\>  
  );  
};

// Toast Hook  
export const useToast \= () \=\> {  
  const \[toasts, setToasts\] \= useState\<Array\<{ id: string; message: string; type: ToastType }\>\>(\[\]);  
    
  const showToast \= (message: string, type: ToastType) \=\> {  
    const id \= Math.random().toString(36);  
    setToasts(prev \=\> \[...prev, { id, message, type }\]);  
      
    setTimeout(() \=\> {  
      setToasts(prev \=\> prev.filter(t \=\> t.id \!== id));  
    }, 5000);  
  };  
    
  return { toasts, showToast };  
};

---

### **5.4 Responsive Design**

**Breakpoints**:

/\* Mobile First Approach \*/  
:root {  
  \--breakpoint-sm: 640px;  
  \--breakpoint-md: 768px;  
  \--breakpoint-lg: 1024px;  
  \--breakpoint-xl: 1280px;  
  \--breakpoint-2xl: 1536px;  
}

/\* Usage with Tailwind \*/  
/\* sm: tablet portrait \*/  
/\* md: tablet landscape \*/  
/\* lg: laptop \*/  
/\* xl: desktop \*/  
/\* 2xl: large desktop \*/

**Layout Patterns**:

// Workflow Builder \- Responsive Layout  
\<div className="flex flex-col lg:flex-row h-screen"\>  
  {/\* Sidebar \- Full width on mobile, fixed width on desktop \*/}  
  \<aside className="w-full lg:w-64 bg-gray-900 p-4 overflow-y-auto"\>  
    \<NodePalette /\>  
  \</aside\>  
    
  {/\* Canvas \- Takes remaining space \*/}  
  \<main className="flex-1 relative"\>  
    \<WorkflowCanvas /\>  
  \</main\>  
    
  {/\* Config Panel \- Bottom sheet on mobile, right sidebar on desktop \*/}  
  \<AnimatePresence\>  
    {selectedNode && (  
      \<motion.div  
        className="fixed lg:relative bottom-0 lg:bottom-auto inset-x-0 lg:inset-x-auto w-full lg:w-96 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none"  
        initial={{ y: "100%" }}  
        animate={{ y: 0 }}  
        exit={{ y: "100%" }}  
      \>  
        \<NodeConfigPanel node={selectedNode} /\>  
      \</motion.div\>  
    )}  
  \</AnimatePresence\>  
\</div\>

---

### **5.5 Dark Mode Support**

// app/root.tsx \- Theme Provider  
import { createContext, useContext, useState, useEffect } from 'react';

type Theme \= 'light' | 'dark' | 'system';

const ThemeContext \= createContext\<{  
  theme: Theme;  
  setTheme: (theme: Theme) \=\> void;  
}\>({ theme: 'system', setTheme: () \=\> {} });

export const ThemeProvider \= ({ children }: { children: React.ReactNode }) \=\> {  
  const \[theme, setTheme\] \= useState\<Theme\>('system');  
    
  useEffect(() \=\> {  
    const root \= window.document.documentElement;  
      
    if (theme \=== 'dark' || (theme \=== 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {  
      root.classList.add('dark');  
    } else {  
      root.classList.remove('dark');  
    }  
  }, \[theme\]);  
    
  return (  
    \<ThemeContext.Provider value={{ theme, setTheme }}\>  
      {children}  
    \</ThemeContext.Provider\>  
  );  
};

export const useTheme \= () \=\> useContext(ThemeContext);

**Dark Mode Colors**:

/\* Tailwind Dark Mode Classes \*/  
.dark {  
  \--color-bg-primary: \#0f172a;  
  \--color-bg-secondary: \#1e293b;  
  \--color-bg-tertiary: \#334155;  
  \--color-text-primary: \#f1f5f9;  
  \--color-text-secondary: \#cbd5e1;  
  \--color-border: \#475569;  
}

/\* Usage \*/  
\<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"\>  
  Content adapts to theme  
\</div\>

---

## **6\. User Experience Flows**

### **6.1 Flow 1: Create New Workflow**

**Step-by-Step UX**:

┌─────────────────────────────────────────────────────────────┐  
│ Step 1: Landing Page                                         │  
└─────────────────────────────────────────────────────────────┘  
User sees: Hero section with beautiful gradient background  
           "Build powerful automations visually"  
           \[+ Create Workflow\] button (prominent, animated)

User Action: Clicks \[+ Create Workflow\]

Animation: Button pulses, then smooth transition to builder  
           (fade out hero, slide in canvas)

┌─────────────────────────────────────────────────────────────┐  
│ Step 2: Empty Canvas                                         │  
└─────────────────────────────────────────────────────────────┘  
User sees: Empty canvas with subtle grid pattern  
           Animated tutorial overlay (first-time users only)  
           Node palette on left with bouncing arrow pointer  
           "Drag a node to get started" tooltip

User Action: Drags "Email" node from palette to canvas

Animation:   
\- Node follows cursor with spring physics  
\- Drop zone highlights with glow effect  
\- Node snaps into place with bounce  
\- Confetti animation on first node added 🎉

┌─────────────────────────────────────────────────────────────┐  
│ Step 3: Configure Node                                       │  
└─────────────────────────────────────────────────────────────┘  
User sees: Configuration panel slides in from right  
           Form fields with placeholder text  
           Variable picker button (sparkle icon)  
           "Test Send" button to validate

User Action: Fills out email details  
            To: {{employee.email}}  
            Subject: "Welcome\!"  
            Body: "Hi {{employee.name}}..."

Animation:   
\- Field focus states with subtle glow  
\- Variable tags appear with pop animation  
\- Save button glows when form is valid

┌─────────────────────────────────────────────────────────────┐  
│ Step 4: Add More Nodes                                       │  
└─────────────────────────────────────────────────────────────┘  
User Action: Drags "Slack" node to canvas

User sees: Automatic suggestion to connect nodes  
           "Connect Email → Slack?" tooltip appears

User Action: Clicks "Yes" or manually drags connection

Animation:  
\- Edge draws from Email to Slack with path animation  
\- Both nodes highlight briefly with success color  
\- Auto-layout adjusts positions smoothly

┌─────────────────────────────────────────────────────────────┐  
│ Step 5: Save Workflow                                        │  
└─────────────────────────────────────────────────────────────┘  
User Action: Clicks \[Save Workflow\]

User sees: Modal appears: "Name your workflow"  
           Input field with autofocus  
           Suggested name based on nodes: "Email and Slack Automation"

User Action: Enters name "New Employee Onboarding"

Animation:  
\- Modal slides up from bottom  
\- Success toast notification slides in from top  
\- "Saved ✓" indicator with checkmark animation  
\- Smooth transition to execution page

Total Time: 2-3 minutes for first workflow

---

### **6.2 Flow 2: Execute Workflow & Monitor**

┌─────────────────────────────────────────────────────────────┐  
│ Step 1: Trigger Execution                                    │  
└─────────────────────────────────────────────────────────────┘  
User sees: Workflow detail page  
           \[▶ Execute\] button (animated gradient background)  
           "Last executed: 2 hours ago" status

User Action: Clicks \[▶ Execute\]

Animation:  
\- Button shows loading spinner  
\- Modal appears: "Provide execution input"  
\- Form fields for variables (employee.name, employee.email, etc.)

User Action: Fills input:  
            {  
              "employee": {  
                "name": "John Doe",  
                "email": "john@example.com"  
              }  
            }

User Action: Clicks \[Start Execution\]

Animation:  
\- Modal slides down  
\- Redirect to execution dashboard with smooth transition  
\- Page loads with skeleton screens

┌─────────────────────────────────────────────────────────────┐  
│ Step 2: Watch Real-Time Execution                            │  
└─────────────────────────────────────────────────────────────┘  
User sees: Execution dashboard  
           Timeline view at top (animated)  
           Task list below (updating in real-time)  
           Logs stream at bottom (auto-scrolling)

WebSocket connects → Real-time updates begin

Timeline Animation:  
\- \[START\] node fades in  
\- Progress line draws to \[Email Task\]  
\- Email icon pulses (indicates running)  
\- After 1.2s: Checkmark appears, turns green ✓  
\- Progress line draws to \[Slack Task\]  
\- Slack icon pulses  
\- After 890ms: Checkmark appears ✓  
\- Timeline completes with success color

Task List Updates:  
Task 1: ⏳ Pending → 🔄 Running (45ms) → ✓ Complete (1.2s)  
  Smooth transition between states  
  Progress bar fills with gradient shimmer  
    
Task 2: ⏳ Pending → 🔄 Running (1.2s) → ✓ Complete (2.1s)  
  Same smooth animations

Logs Stream:  
10:30:00 INFO  Execution started (executionId: exec\_abc123)  
10:30:01 INFO  Task 1 (Email) started  
10:30:01 DEBUG Sending email to john@example.com  
10:30:02 INFO  Task 1 completed successfully (duration: 1.2s)  
10:30:02 INFO  Task 2 (Slack) started  
10:30:03 INFO  Task 2 completed successfully (duration: 890ms)  
10:30:03 INFO  Execution completed (total: 2.1s)

Each log line fades in from bottom with slight delay (stagger effect)

┌─────────────────────────────────────────────────────────────┐  
│ Step 3: Execution Complete                                   │  
└─────────────────────────────────────────────────────────────┘  
User sees: Success banner slides down from top  
           "🎉 Execution completed successfully in 2.1s"  
             
           Summary card animates in:  
           ┌─────────────────────────────────┐  
           │ ✓ 2/2 tasks completed           │  
           │ ⏱ Total time: 2.1s              │  
           │ 🔄 0 retries                     │  
           │ 📊 Avg task time: 1.05s         │  
           └─────────────────────────────────┘

User Action: Clicks \[View Details\] on completed task

Animation:  
\- Task card expands to show full output  
\- JSON data appears with syntax highlighting  
\- Copy button appears with fade-in

User sees:  
{  
  "messageId": "msg\_xyz789",  
  "to": "john@example.com",  
  "subject": "Welcome\!",  
  "sentAt": "2025-11-18T10:30:02Z"  
}

Total Time: 3-5 seconds for simple workflow execution  
            User engaged throughout with smooth animations

---

## **7\. Technical Challenges & Solutions**

### **7.1 Challenge 1: Graph-Based Execution Order**

**Problem**: Workflows are directed acyclic graphs. Tasks have dependencies. Must determine optimal execution order.

**Solution**: Topological Sort with Priority Queue

**Implementation**:

// services/workflow-engine/TopologicalSorter.ts  
import { Effect } from 'effect';  
import { PriorityQueue } from '@/lib/data-structures';

interface WorkflowNode {  
  id: string;  
  type: NodeType;  
  dependencies: string\[\];  
  priority: number;  
}

export class TopologicalSorter extends Effect.Service\<TopologicalSorter\>()(  
  'TopologicalSorter',  
  {  
    effect: Effect.sync(() \=\> ({  
      sort: (nodes: WorkflowNode\[\]): Effect.Effect\<WorkflowNode\[\], GraphCycleError\> \=\>  
        Effect.gen(function\* (\_) {  
          // Build adjacency list and in-degree map  
          const adjList \= new Map\<string, string\[\]\>();  
          const inDegree \= new Map\<string, number\>();  
          const nodeMap \= new Map\<string, WorkflowNode\>();  
            
          for (const node of nodes) {  
            inDegree.set(node.id, 0);  
            adjList.set(node.id, \[\]);  
            nodeMap.set(node.id, node);  
          }  
            
          // Calculate in-degrees  
          for (const node of nodes) {  
            for (const depId of node.dependencies) {  
              adjList.get(depId)\!.push(node.id);  
              inDegree.set(node.id, inDegree.get(node.id)\! \+ 1);  
            }  
          }  
            
          // Priority queue: Higher priority nodes execute first  
          const queue \= new PriorityQueue\<WorkflowNode\>(  
            (a, b) \=\> b.priority \- a.priority  
          );  
            
          // Add nodes with no dependencies to queue  
          for (const node of nodes) {  
            if (inDegree.get(node.id) \=== 0\) {  
              queue.enqueue(node);  
            }  
          }  
            
          const sorted: WorkflowNode\[\] \= \[\];  
            
          // Kahn's algorithm  
          while (\!queue.isEmpty()) {  
            const node \= queue.dequeue()\!;  
            sorted.push(node);  
              
            // Reduce in-degree for neighbors  
            for (const neighborId of adjList.get(node.id)\!) {  
              const newDegree \= inDegree.get(neighborId)\! \- 1;  
              inDegree.set(neighborId, newDegree);  
                
              if (newDegree \=== 0\) {  
                const neighbor \= nodeMap.get(neighborId)\!;  
                queue.enqueue(neighbor);  
              }  
            }  
          }  
            
          // Check for cycles  
          if (sorted.length \!== nodes.length) {  
            return yield\* \_(  
              Effect.fail(  
                new GraphCycleError({  
                  message: 'Workflow contains circular dependencies',  
                  remainingNodes: nodes.filter(n \=\> \!sorted.includes(n)).map(n \=\> n.id)  
                })  
              )  
            );  
          }  
            
          return sorted;  
        })  
    }))  
  }  
) {}

// Priority Queue Implementation  
class PriorityQueue\<T\> {  
  private items: T\[\] \= \[\];  
    
  constructor(private compareFn: (a: T, b: T) \=\> number) {}  
    
  enqueue(item: T) {  
    this.items.push(item);  
    this.items.sort(this.compareFn);  
  }  
    
  dequeue(): T | undefined {  
    return this.items.shift();  
  }  
    
  isEmpty(): boolean {  
    return this.items.length \=== 0;  
  }  
}

**Complexity Analysis**:

* Time: O(V \+ E) where V \= nodes, E \= edges  
* Space: O(V \+ E) for adjacency list  
* Priority queue adds O(V log V) but improves execution efficiency

---

### **7.2 Challenge 2: Parallel Execution with Concurrency Control**

**Problem**: Multiple tasks can run simultaneously, but must limit concurrency to avoid overwhelming external APIs.

**Solution**: Effect.js `Effect.forEach` with dynamic concurrency

**Implementation**:

// services/workflow-engine/ExecutionEngine.ts  
import { Effect, Schedule } from 'effect';

export class WorkflowExecutionEngine extends Effect.Service\<WorkflowExecutionEngine\>()(  
  'WorkflowExecutionEngine',  
  {  
    effect: Effect.gen(function\* (\_) {  
      const prisma \= yield\* \_(PrismaService);  
      const sorter \= yield\* \_(TopologicalSorter);  
      const executors \= yield\* \_(TaskExecutorRegistry);  
      const logger \= yield\* \_(LoggerService);  
      const ws \= yield\* \_(WebSocketService);  
        
      return {  
        execute: (workflowId: string, input: Record\<string, any\>) \=\>  
          Effect.gen(function\* (\_) {  
            // Load workflow  
            const workflow \= yield\* \_(loadWorkflow(workflowId));  
              
            // Create execution record  
            const execution \= yield\* \_(createExecution(workflowId, input));  
              
            // Broadcast start  
            yield\* \_(ws.broadcast(\`execution:${execution.id}\`, {  
              type: 'EXECUTION\_STARTED',  
              payload: { executionId: execution.id }  
            }));  
              
            // Sort nodes  
            const sortedNodes \= yield\* \_(sorter.sort(workflow.nodes));  
              
            // Group by execution level (for parallel execution)  
            const levels \= groupByLevel(sortedNodes, workflow.edges);  
              
            // Execute level by level  
            for (const levelNodes of levels) {  
              // Parallel execution with concurrency limit  
              const results \= yield\* \_(  
                Effect.forEach(  
                  levelNodes,  
                  (node) \=\> executeNode(node, execution.id, input),  
                  { concurrency: 5, discard: false }  
                )  
              );  
                
              // Check if any failed  
              const failed \= results.find(r \=\> \!r.success);  
              if (failed) {  
                yield\* \_(markExecutionFailed(execution.id, failed.error));  
                return yield\* \_(Effect.fail(new ExecutionFailedError(failed)));  
              }  
            }  
              
            // Mark complete  
            yield\* \_(markExecutionComplete(execution.id));  
              
            // Broadcast completion  
            yield\* \_(ws.broadcast(\`execution:${execution.id}\`, {  
              type: 'EXECUTION\_COMPLETE',  
              payload: { executionId: execution.id, status: 'success' }  
            }));  
              
            return execution;  
          }),  
          
        executeNode: (  
          node: WorkflowNode,  
          executionId: string,  
          context: Record\<string, any\>  
        ) \=\>  
          Effect.gen(function\* (\_) {  
            const startTime \= Date.now();  
              
            // Get executor for node type  
            const executor \= executors.get(node.type);  
              
            // Broadcast task started  
            yield\* \_(ws.broadcast(\`execution:${executionId}\`, {  
              type: 'TASK\_UPDATE',  
              payload: {  
                taskId: node.id,  
                status: 'RUNNING'  
              }  
            }));  
              
            // Execute with retry and timeout  
            const result \= yield\* \_(  
              pipe(  
                executor.execute(node.config, context),  
                Effect.retry({  
                  schedule: Schedule.exponential(100, 2),  
                  times: node.retries || 3  
                }),  
                Effect.timeout(node.timeout || 30000),  
                Effect.tap(() \=\>  
                  logger.info('Task completed', {  
                    executionId,  
                    taskId: node.id,  
                    duration: Date.now() \- startTime  
                  })  
                ),  
                Effect.catchAll((error) \=\>  
                  Effect.gen(function\* (\_) {  
                    yield\* \_(  
                      logger.error('Task failed', error, {  
                        executionId,  
                        taskId: node.id  
                      })  
                    );  
                      
                    return { success: false, error: error.message };  
                  })  
                )  
              )  
            );  
              
            const duration \= Date.now() \- startTime;  
              
            // Save task execution  
            yield\* \_(  
              Effect.tryPromise({  
                try: () \=\> prisma.taskExecution.create({  
                  data: {  
                    executionId,  
                    nodeId: node.id,  
                    status: result.success ? 'SUCCESS' : 'FAILED',  
                    output: result.output,  
                    duration,  
                    error: result.error  
                  }  
                }),  
                catch: (e) \=\> new DatabaseError({ cause: e })  
              })  
            );  
              
            // Broadcast task completed  
            yield\* \_(ws.broadcast(\`execution:${executionId}\`, {  
              type: 'TASK\_UPDATE',  
              payload: {  
                taskId: node.id,  
                status: result.success ? 'SUCCESS' : 'FAILED',  
                duration,  
                output: result.output  
              }  
            }));  
              
            return result;  
          })  
      };  
    }),  
    dependencies: \[  
      PrismaService.Default,  
      TopologicalSorter.Default,  
      TaskExecutorRegistry.Default,  
      LoggerService.Default,  
      WebSocketService.Default  
    \]  
  }  
) {}

// Helper: Group nodes by execution level  
function groupByLevel(  
  nodes: WorkflowNode\[\],  
  edges: WorkflowEdge\[\]  
): WorkflowNode\[\]\[\] {  
  const levels: WorkflowNode\[\]\[\] \= \[\];  
  const processed \= new Set\<string\>();  
  const remaining \= new Set(nodes.map(n \=\> n.id));  
    
  while (remaining.size \> 0\) {  
    const currentLevel: WorkflowNode\[\] \= \[\];  
      
    // Find nodes whose dependencies are all processed  
    for (const node of nodes) {  
      if (remaining.has(node.id)) {  
        const deps \= node.dependencies;  
        if (deps.every(d \=\> processed.has(d))) {  
          currentLevel.push(node);  
        }  
      }  
    }  
      
    // Mark as processed  
    for (const node of currentLevel) {  
      processed.add(node.id);  
      remaining.delete(node.id);  
    }  
      
    levels.push(currentLevel);  
  }  
    
  return levels;  
}

**Why This Works**:

* **Level-based execution**: Nodes at same level can run in parallel  
* **Concurrency limit**: `{ concurrency: 5 }` prevents overwhelming APIs  
* **Effect.forEach**: Automatically handles parallel execution with error propagation  
* **Real-time updates**: WebSocket broadcasts keep UI in sync

---

### **7.3 Challenge 3: Real-Time Updates via WebSocket**

**Problem**: Users need to see execution progress in real-time. HTTP polling is inefficient and causes delay.

**Solution**: WebSocket with Pub/Sub pattern

**Implementation**:

// services/WebSocketService.ts  
import { Effect } from 'effect';  
import { EventEmitter } from 'events';

export class WebSocketService extends Effect.Service\<WebSocketService\>()(  
  'WebSocketService',  
  {  
    effect: Effect.sync(() \=\> {  
      // In-memory pub/sub (in production, use Redis)  
      const emitter \= new EventEmitter();  
      emitter.setMaxListeners(1000);  
        
      return {  
        // Subscribe to execution updates  
        subscribe: (executionId: string, callback: (data: any) \=\> void) \=\>  
          Effect.sync(() \=\> {  
            const channel \= \`execution:${executionId}\`;  
            emitter.on(channel, callback);  
              
            // Return unsubscribe function  
            return () \=\> emitter.off(channel, callback);  
          }),  
          
        // Broadcast update to all subscribers  
        broadcast: (channel: string, data: any) \=\>  
          Effect.sync(() \=\> {  
            emitter.emit(channel, data);  
          })  
      };  
    })  
  }  
) {}

// routes/ws/executions.$executionId.ts  
import { WebSocketHandler } from '@remix-run/node';

export const wsHandler: WebSocketHandler \= async (ws, request) \=\> {  
  const executionId \= request.params.executionId;  
  const wsService \= await Effect.runPromise(WebSocketService);  
    
  console.log(\`\[WebSocket\] Client connected: execution=${executionId}\`);  
    
  // Subscribe to execution updates  
  const unsubscribe \= await Effect.runPromise(  
    wsService.subscribe(executionId, (data) \=\> {  
      if (ws.readyState \=== WebSocket.OPEN) {  
        ws.send(JSON.stringify({  
          ...data,  
          timestamp: new Date().toISOString()  
        }));  
      }  
    })  
  );  
    
  // Send initial message  
  ws.send(JSON.stringify({  
    type: 'CONNECTED',  
    payload: { executionId },  
    timestamp: new Date().toISOString()  
  }));  
    
  // Heartbeat to keep connection alive  
  const heartbeatInterval \= setInterval(() \=\> {  
    if (ws.readyState \=== WebSocket.OPEN) {  
      ws.send(JSON.stringify({ type: 'PING' }));  
    }  
  }, 30000); // Every 30 seconds  
    
  // Handle client messages  
  ws.on('message', (data) \=\> {  
    try {  
      const message \= JSON.parse(data.toString());  
        
      if (message.type \=== 'PONG') {  
        console.log(\`\[WebSocket\] Heartbeat received: execution=${executionId}\`);  
      }  
    } catch (error) {  
      console.error('\[WebSocket\] Failed to parse message:', error);  
    }  
  });  
    
  // Cleanup on disconnect  
  ws.on('close', () \=\> {  
    console.log(\`\[WebSocket\] Client disconnected: execution=${executionId}\`);  
    clearInterval(heartbeatInterval);  
    unsubscribe();  
  });  
    
  ws.on('error', (error) \=\> {  
    console.error('\[WebSocket\] Connection error:', error);  
  });  
};

**Client-Side Hook**:

// hooks/useWorkflowExecution.ts  
import { useState, useEffect, useRef } from 'react';

interface TaskUpdate {  
  taskId: string;  
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';  
  duration?: number;  
  output?: any;  
  progress?: number;  
}

export const useWorkflowExecution \= (executionId: string) \=\> {  
  const \[tasks, setTasks\] \= useState\<Map\<string, TaskUpdate\>\>(new Map());  
  const \[status, setStatus\] \= useState\<'connecting' | 'connected' | 'running' | 'completed' | 'failed'\>('connecting');  
  const \[logs, setLogs\] \= useState\<string\[\]\>(\[\]);  
  const wsRef \= useRef\<WebSocket | null\>(null);  
    
  useEffect(() \=\> {  
    const ws \= new WebSocket(\`wss://api.flowforge.dev/ws/executions/${executionId}\`);  
    wsRef.current \= ws;  
      
    ws.onopen \= () \=\> {  
      console.log('WebSocket connected');  
      setStatus('connected');  
    };  
      
    ws.onmessage \= (event) \=\> {  
      const message \= JSON.parse(event.data);  
        
      switch (message.type) {  
        case 'CONNECTED':  
          console.log('Received connection confirmation');  
          break;  
            
        case 'EXECUTION\_STARTED':  
          setStatus('running');  
          setLogs(prev \=\> \[...prev, \`\[${message.timestamp}\] Execution started\`\]);  
          break;  
            
        case 'TASK\_UPDATE':  
          const { taskId, status: taskStatus, duration, output, progress } \= message.payload;  
            
          setTasks(prev \=\> new Map(prev).set(taskId, {  
            taskId,  
            status: taskStatus,  
            duration,  
            output,  
            progress  
          }));  
            
          setLogs(prev \=\> \[  
            ...prev,  
            \`\[${message.timestamp}\] Task ${taskId}: ${taskStatus}${duration ? \` (${duration}ms)\` : ''}\`  
          \]);  
          break;  
            
        case 'EXECUTION\_COMPLETE':  
          setStatus(message.payload.status \=== 'success' ? 'completed' : 'failed');  
          setLogs(prev \=\> \[...prev, \`\[${message.timestamp}\] Execution ${message.payload.status}\`\]);  
          ws.close();  
          break;  
            
        case 'PING':  
          ws.send(JSON.stringify({ type: 'PONG' }));  
          break;  
            
        default:  
          console.warn('Unknown message type:', message.type);  
      }  
    };  
      
    ws.onerror \= (error) \=\> {  
      console.error('WebSocket error:', error);  
      setStatus('failed');  
    };  
      
    ws.onclose \= () \=\> {  
      console.log('WebSocket disconnected');  
      if (status \=== 'running') {  
        setStatus('failed');  
      }  
    };  
      
    return () \=\> {  
      if (ws.readyState \=== WebSocket.OPEN) {  
        ws.close();  
      }  
    };  
  }, \[executionId\]);  
    
  return {  
    tasks: Array.from(tasks.values()),  
    status,  
    logs,  
    reconnect: () \=\> {  
      if (wsRef.current?.readyState \!== WebSocket.OPEN) {  
        window.location.reload();  
      }  
    }  
  };  
};

**React Component**:

// components/ExecutionDashboard.tsx  
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';  
import { motion } from 'framer-motion';

export const ExecutionDashboard \= ({ executionId }: { executionId: string }) \=\> {  
  const { tasks, status, logs } \= useWorkflowExecution(executionId);  
    
  return (  
    \<div className="space-y-6"\>  
      {/\* Status Header \*/}  
      \<div className="flex items-center justify-between"\>  
        \<h1 className="text-2xl font-bold"\>  
          Execution: {executionId}  
        \</h1\>  
        \<StatusBadge status={status} /\>  
      \</div\>  
        
      {/\* Tasks \*/}  
      \<div className="space-y-3"\>  
        {tasks.map((task, index) \=\> (  
          \<motion.div  
            key={task.taskId}  
            initial={{ opacity: 0, x: \-20 }}  
            animate={{ opacity: 1, x: 0 }}  
            transition={{ delay: index \* 0.1 }}  
          \>  
            \<TaskCard task={task} /\>  
          \</motion.div\>  
        ))}  
      \</div\>  
        
      {/\* Live Logs \*/}  
      \<Card\>  
        \<CardHeader\>  
          \<h2 className="text-lg font-semibold"\>Live Logs\</h2\>  
        \</CardHeader\>  
        \<CardBody\>  
          \<div className="h-64 overflow-y-auto font-mono text-sm space-y-1"\>  
            {logs.map((log, index) \=\> (  
              \<motion.div  
                key={index}  
                initial={{ opacity: 0, y: 10 }}  
                animate={{ opacity: 1, y: 0 }}  
                className="text-gray-700 dark:text-gray-300"  
              \>  
                {log}  
              \</motion.div\>  
            ))}  
          \</div\>  
        \</CardBody\>  
      \</Card\>  
    \</div\>  
  );  
};

---

## **8\. Database Schema**

// prisma/schema.prisma

generator client {  
  provider \= "prisma-client-js"  
}

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
}

// \============================================================================  
// WORKFLOW DEFINITION  
// \============================================================================

model Workflow {  
  id          String   @id @default(cuid())  
  name        String  
  description String?  
    
  // Workflow structure (can store as JSON for flexibility)  
  definition  Json     // { nodes: \[...\], edges: \[...\], metadata: {...} }  
    
  // Version control  
  version     Int      @default(1)  
  isPublished Boolean  @default(false)  
  isDraft     Boolean  @default(true)  
    
  // Relationships  
  nodes       WorkflowNode\[\]  
  edges       WorkflowEdge\[\]  
  executions  Execution\[\]  
    
  // Audit  
  createdAt   DateTime @default(now())  
  updatedAt   DateTime @updatedAt  
  createdBy   String?  // User ID (for future auth)  
    
  @@index(\[isPublished, createdAt\])  
  @@index(\[createdBy\])  
}

model WorkflowNode {  
  id         String   @id @default(cuid())  
  workflowId String  
  workflow   Workflow @relation(fields: \[workflowId\], references: \[id\], onDelete: Cascade)  
    
  // Node identification  
  nodeId     String   // Unique within workflow (e.g., "node\_1")  
  type       NodeType  
  label      String  
    
  // Visual position (for canvas)  
  position   Json     // { x: number, y: number }  
    
  // Configuration (task-specific settings)  
  config     Json     // e.g., { to: "{{email}}", subject: "..." }  
    
  // Execution settings  
  timeout    Int      @default(30000)  // milliseconds  
  retries    Int      @default(3)  
  priority   Int      @default(0)  
    
  // Relationships  
  outgoingEdges WorkflowEdge\[\] @relation("SourceNode")  
  incomingEdges WorkflowEdge\[\] @relation("TargetNode")  
  executions    TaskExecution\[\]  
    
  createdAt  DateTime @default(now())  
    
  @@unique(\[workflowId, nodeId\])  
  @@index(\[workflowId, type\])  
}

enum NodeType {  
  START  
  EMAIL  
  SLACK  
  HTTP  
  DELAY  
  CONDITIONAL  
  TRANSFORM  
  WEBHOOK  
  END  
}

model WorkflowEdge {  
  id         String   @id @default(cuid())  
  workflowId String  
  workflow   Workflow @relation(fields: \[workflowId\], references: \[id\], onDelete: Cascade)  
    
  // Edge endpoints  
  sourceId   String  
  source     WorkflowNode @relation("SourceNode", fields: \[sourceId\], references: \[id\], onDelete: Cascade)  
    
  targetId   String  
  target     WorkflowNode @relation("TargetNode", fields: \[targetId\], references: \[id\], onDelete: Cascade)  
    
  // Optional: Conditional edges  
  condition  Json?    // e.g., { field: "score", operator: "gt", value: 80 }  
  label      String?  // e.g., "if true", "if false"  
    
  // Visual styling  
  type       EdgeType @default(SMOOTHSTEP)  
  animated   Boolean  @default(false)  
    
  createdAt  DateTime @default(now())  
    
  @@unique(\[sourceId, targetId, workflowId\])  
  @@index(\[workflowId\])  
}

enum EdgeType {  
  STRAIGHT  
  SMOOTHSTEP  
  STEP  
  BEZIER  
}

// \============================================================================  
// WORKFLOW EXECUTION  
// \============================================================================

model Execution {  
  id         String   @id @default(cuid())  
  workflowId String  
  workflow   Workflow @relation(fields: \[workflowId\], references: \[id\])  
    
  // State machine  
  status     ExecutionStatus  
    
  // Input/Output  
  input      Json     // User-provided variables  
  output     Json?    // Final aggregated output  
  context    Json     @default("{}")  // Shared context across tasks  
    
  // Timing  
  startedAt  DateTime @default(now())  
  completedAt DateTime?  
  duration   Int?     // milliseconds  
    
  // Error tracking  
  error      String?  
  failedTaskId String?  
    
  // Relationships  
  taskExecutions TaskExecution\[\]  
  logs           ExecutionLog\[\]  
    
  // Audit  
  triggeredBy String?  // User ID or "SYSTEM"  
    
  @@index(\[workflowId, status\])  
  @@index(\[startedAt desc\])  
  @@index(\[status, completedAt\])  
}

enum ExecutionStatus {  
  PENDING  
  RUNNING  
  COMPLETED  
  FAILED  
  CANCELLED  
  TIMEOUT  
}

model TaskExecution {  
  id          String   @id @default(cuid())  
  executionId String  
  execution   Execution @relation(fields: \[executionId\], references: \[id\], onDelete: Cascade)  
    
  nodeId      String  
  node        WorkflowNode @relation(fields: \[nodeId\], references: \[id\])  
    
  // Task state  
  status      TaskStatus  
    
  // Input/Output  
  input       Json     // Context at execution time  
  output      Json?    // Task result  
    
  // Timing  
  startedAt   DateTime  
  completedAt DateTime?  
  duration    Int?     // milliseconds  
    
  // Retry tracking  
  attempt     Int      @default(1)  
  maxAttempts Int      @default(3)  
    
  // Error handling  
  error       String?  
  stackTrace  String?  @db.Text  
    
  createdAt   DateTime @default(now())  
    
  @@index(\[executionId, status\])  
  @@index(\[nodeId, status\])  
  @@index(\[startedAt\])  
}

enum TaskStatus {  
  PENDING  
  RUNNING  
  SUCCESS  
  FAILED  
  RETRYING  
  SKIPPED  
  TIMEOUT  
}

model ExecutionLog {  
  id          String   @id @default(cuid())  
  executionId String  
  execution   Execution @relation(fields: \[executionId\], references: \[id\], onDelete: Cascade)  
    
  level       LogLevel  
  message     String   @db.Text  
  metadata    Json?    // Additional structured data  
    
  // Optional: Task association  
  taskId      String?  
    
  timestamp   DateTime @default(now())  
    
  @@index(\[executionId, timestamp desc\])  
  @@index(\[level, timestamp desc\])  
}

enum LogLevel {  
  DEBUG  
  INFO  
  WARN  
  ERROR  
  FATAL  
}

// \============================================================================  
// INTERNATIONALIZATION  
// \============================================================================

model Translation {  
  id        String @id @default(cuid())  
    
  locale    String // "en", "es", "fr"  
  namespace String // "workflow", "node", "execution", "error"  
  key       String // "workflow.created", "node.email.label"  
  value     String @db.Text  
    
  createdAt DateTime @default(now())  
  updatedAt DateTime @updatedAt  
    
  @@unique(\[locale, namespace, key\])  
  @@index(\[locale, namespace\])  
}

// \============================================================================  
// USER & AUTH (Optional \- for future)  
// \============================================================================

model User {  
  id        String   @id @default(cuid())  
  email     String   @unique  
  name      String?  
    
  createdAt DateTime @default(now())  
  updatedAt DateTime @updatedAt  
}

---

## **9\. API Specifications**

### **9.1 REST API Endpoints**

#### **9.1.1 Create Workflow**

POST /api/workflows  
Content-Type: application/json

{  
  "name": "New Employee Onboarding",  
  "description": "Automated workflow for onboarding new employees",  
  "definition": {  
    "nodes": \[  
      {  
        "id": "node\_1",  
        "type": "EMAIL",  
        "label": "Welcome Email",  
        "position": { "x": 100, "y": 100 },  
        "config": {  
          "to": "{{employee.email}}",  
          "subject": "Welcome to FlowForge\!",  
          "body": "Hi {{employee.name}}, welcome aboard\!"  
        }  
      },  
      {  
        "id": "node\_2",  
        "type": "SLACK",  
        "label": "Notify Team",  
        "position": { "x": 100, "y": 200 },  
        "config": {  
          "channel": "\#general",  
          "message": "New team member: {{employee.name}}"  
        }  
      }  
    \],  
    "edges": \[  
      {  
        "source": "node\_1",  
        "target": "node\_2"  
      }  
    \]  
  }  
}

Response 201 Created:  
{  
  "id": "wf\_abc123",  
  "name": "New Employee Onboarding",  
  "version": 1,  
  "createdAt": "2025-11-18T10:00:00Z"  
}

#### **9.1.2 Execute Workflow**

POST /api/workflows/:id/execute  
Content-Type: application/json

{  
  "input": {  
    "employee": {  
      "name": "John Doe",  
      "email": "john@example.com",  
      "department": "Engineering"  
    }  
  }  
}

Response 200 OK:  
{  
  "executionId": "exec\_xyz789",  
  "workflowId": "wf\_abc123",  
  "status": "RUNNING",  
  "startedAt": "2025-11-18T10:05:00Z",  
  "websocketUrl": "wss://api.flowforge.dev/ws/executions/exec\_xyz789"  
}

#### **9.1.3 Get Execution Status**

GET /api/executions/:id

Response 200 OK:  
{  
  "id": "exec\_xyz789",  
  "workflowId": "wf\_abc123",  
  "status": "COMPLETED",  
  "startedAt": "2025-11-18T10:05:00Z",  
  "completedAt": "2025-11-18T10:05:03Z",  
  "duration": 3142,  
  "tasks": \[  
    {  
      "nodeId": "node\_1",  
      "status": "SUCCESS",  
      "duration": 1234,  
      "output": {  
        "messageId": "msg\_123",  
        "sentAt": "2025-11-18T10:05:01Z"  
      }  
    },  
    {  
      "nodeId": "node\_2",  
      "status": "SUCCESS",  
      "duration": 890,  
      "output": {  
        "channelId": "C123",  
        "timestamp": "1700306703.123456"  
      }  
    }  
  \]  
}

---

### **9.2 WebSocket API**

#### **Message Protocol**

**Client → Server**:

// Ping (heartbeat)  
{  
  "type": "PING"  
}

**Server → Client**:

// Connection established  
{  
  "type": "CONNECTED",  
  "payload": {  
    "executionId": "exec\_xyz789"  
  },  
  "timestamp": "2025-11-18T10:05:00Z"  
}

// Execution started  
{  
  "type": "EXECUTION\_STARTED",  
  "payload": {  
    "executionId": "exec\_xyz789",  
    "workflowId": "wf\_abc123",  
    "totalTasks": 5  
  },  
  "timestamp": "2025-11-18T10:05:00Z"  
}

// Task update  
{  
  "type": "TASK\_UPDATE",  
  "payload": {  
    "taskId": "node\_1",  
    "taskName": "Welcome Email",  
    "status": "RUNNING",  
    "progress": 0  
  },  
  "timestamp": "2025-11-18T10:05:01Z"  
}

// Task completed  
{  
  "type": "TASK\_UPDATE",  
  "payload": {  
    "taskId": "node\_1",  
    "taskName": "Welcome Email",  
    "status": "SUCCESS",  
    "duration": 1234,  
    "output": {  
      "messageId": "msg\_123"  
    }  
  },  
  "timestamp": "2025-11-18T10:05:02Z"  
}

// Execution complete  
{  
  "type": "EXECUTION\_COMPLETE",  
  "payload": {  
    "executionId": "exec\_xyz789",  
    "status": "success",  
    "duration": 3142,  
    "summary": {  
      "totalTasks": 5,  
      "succeeded": 5,  
      "failed": 0,  
      "skipped": 0  
    }  
  },  
  "timestamp": "2025-11-18T10:05:03Z"  
}

// Heartbeat  
{  
  "type": "PING"  
}

---

## **10\. Testing Strategy**

### **10.1 Unit Tests (60%)**

**Coverage Target**: 85%+

**Example Test Suite**:

// services/workflow-engine/TopologicalSorter.test.ts  
import { describe, it, expect } from 'vitest';  
import { Effect } from 'effect';  
import { TopologicalSorter } from './TopologicalSorter';

describe('TopologicalSorter', () \=\> {  
  describe('sort()', () \=\> {  
    it('should sort nodes in dependency order', async () \=\> {  
      const sorter \= new TopologicalSorter();  
        
      const nodes \= \[  
        { id: 'A', dependencies: \['B', 'C'\], priority: 1, type: 'EMAIL' },  
        { id: 'B', dependencies: \[\], priority: 2, type: 'SLACK' },  
        { id: 'C', dependencies: \['B'\], priority: 1, type: 'HTTP' }  
      \];  
        
      const result \= await Effect.runPromise(sorter.sort(nodes));  
        
      expect(result.map(n \=\> n.id)).toEqual(\['B', 'C', 'A'\]);  
    });  
      
    it('should detect circular dependencies', async () \=\> {  
      const sorter \= new TopologicalSorter();  
        
      const nodes \= \[  
        { id: 'A', dependencies: \['B'\], priority: 1, type: 'EMAIL' },  
        { id: 'B', dependencies: \['C'\], priority: 1, type: 'SLACK' },  
        { id: 'C', dependencies: \['A'\], priority: 1, type: 'HTTP' }  
      \];  
        
      await expect(  
        Effect.runPromise(sorter.sort(nodes))  
      ).rejects.toThrow('circular dependencies');  
    });  
      
    it('should respect priority for parallel nodes', async () \=\> {  
      const sorter \= new TopologicalSorter();  
        
      const nodes \= \[  
        { id: 'A', dependencies: \[\], priority: 1, type: 'EMAIL' },  
        { id: 'B', dependencies: \[\], priority: 3, type: 'SLACK' },  // Higher priority  
        { id: 'C', dependencies: \[\], priority: 2, type: 'HTTP' }  
      \];  
        
      const result \= await Effect.runPromise(sorter.sort(nodes));  
        
      // B should come first due to highest priority  
      expect(result\[0\].id).toBe('B');  
    });  
      
    it('should handle complex diamond dependencies', async () \=\> {  
      const sorter \= new TopologicalSorter();  
        
      /\*\*  
       \*     A  
       \*    / \\  
       \*   B   C  
       \*    \\ /  
       \*     D  
       \*/  
      const nodes \= \[  
        { id: 'D', dependencies: \['B', 'C'\], priority: 1, type: 'EMAIL' },  
        { id: 'C', dependencies: \['A'\], priority: 1, type: 'SLACK' },  
        { id: 'B', dependencies: \['A'\], priority: 1, type: 'HTTP' },  
        { id: 'A', dependencies: \[\], priority: 1, type: 'START' }  
      \];  
        
      const result \= await Effect.runPromise(sorter.sort(nodes));  
        
      // A must be first, D must be last  
      expect(result\[0\].id).toBe('A');  
      expect(result\[3\].id).toBe('D');  
      // B and C can be in any order  
      expect(\['B', 'C'\]).toContain(result\[1\].id);  
      expect(\['B', 'C'\]).toContain(result\[2\].id);  
    });  
  });  
});

---

### **10.2 Integration Tests (30%)**

// routes/api/workflows.$id.execute.test.ts  
import { describe, it, expect, beforeEach, vi } from 'vitest';  
import { createRemixStub } from '@remix-run/testing';  
import { action } from './workflows.$id.execute';  
import { prisma } from '\~/lib/db.server';

describe('POST /api/workflows/:id/execute', () \=\> {  
  beforeEach(async () \=\> {  
    // Clean database  
    await prisma.execution.deleteMany();  
    await prisma.taskExecution.deleteMany();  
    await prisma.workflow.deleteMany();  
  });  
    
  it('should execute workflow successfully', async () \=\> {  
    // Create test workflow  
    const workflow \= await prisma.workflow.create({  
      data: {  
        name: 'Test Workflow',  
        definition: {  
          nodes: \[  
            {  
              id: 'node\_1',  
              type: 'EMAIL',  
              config: {  
                to: '{{email}}',  
                subject: 'Test',  
                body: 'Hello {{name}}'  
              }  
            }  
          \],  
          edges: \[\]  
        }  
      }  
    });  
      
    // Mock SendGrid  
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(  
      new Response(JSON.stringify({ messageId: 'msg\_123' }), {  
        status: 200  
      })  
    );  
      
    // Execute workflow  
    const response \= await action({  
      request: new Request(  
        \`http://localhost:3000/api/workflows/${workflow.id}/execute\`,  
        {  
          method: 'POST',  
          headers: { 'Content-Type': 'application/json' },  
          body: JSON.stringify({  
            input: {  
              email: 'test@example.com',  
              name: 'John'  
            }  
          })  
        }  
      ),  
      params: { id: workflow.id },  
      context: {}  
    });  
      
    const data \= await response.json();  
      
    expect(response.status).toBe(200);  
    expect(data).toHaveProperty('executionId');  
    expect(data.status).toBe('RUNNING');  
      
    // Wait for execution to complete  
    await new Promise(resolve \=\> setTimeout(resolve, 2000));  
      
    // Verify execution completed  
    const execution \= await prisma.execution.findUnique({  
      where: { id: data.executionId },  
      include: { taskExecutions: true }  
    });  
      
    expect(execution?.status).toBe('COMPLETED');  
    expect(execution?.taskExecutions).toHaveLength(1);  
    expect(execution?.taskExecutions\[0\].status).toBe('SUCCESS');  
  });  
    
  it('should handle task failures with retry', async () \=\> {  
    const workflow \= await prisma.workflow.create({  
      data: {  
        name: 'Test Workflow with Retry',  
        definition: {  
          nodes: \[  
            {  
              id: 'node\_1',  
              type: 'EMAIL',  
              config: {  
                to: 'test@example.com',  
                subject: 'Test'  
              },  
              retries: 3  
            }  
          \],  
          edges: \[\]  
        }  
      }  
    });  
      
    // Mock SendGrid to fail twice, then succeed  
    let attempts \= 0;  
    vi.spyOn(global, 'fetch').mockImplementation(() \=\> {  
      attempts++;  
      if (attempts \< 3\) {  
        return Promise.reject(new Error('Network error'));  
      }  
      return Promise.resolve(  
        new Response(JSON.stringify({ messageId: 'msg\_123' }), {  
          status: 200  
        })  
      );  
    });  
      
    const response \= await action({  
      request: new Request(  
        \`http://localhost:3000/api/workflows/${workflow.id}/execute\`,  
        {  
          method: 'POST',  
          body: JSON.stringify({ input: {} })  
        }  
      ),  
      params: { id: workflow.id },  
      context: {}  
    });  
      
    const data \= await response.json();  
      
    // Wait for retries  
    await new Promise(resolve \=\> setTimeout(resolve, 3000));  
      
    // Verify succeeded after retries  
    const execution \= await prisma.execution.findUnique({  
      where: { id: data.executionId },  
      include: { taskExecutions: true }  
    });  
      
    expect(execution?.status).toBe('COMPLETED');  
    expect(execution?.taskExecutions\[0\].attempt).toBe(3);  
    expect(execution?.taskExecutions\[0\].status).toBe('SUCCESS');  
  });  
    
  it('should fail workflow if task exceeds max retries', async () \=\> {  
    const workflow \= await prisma.workflow.create({  
      data: {  
        name: 'Test Workflow Failure',  
        definition: {  
          nodes: \[  
            {  
              id: 'node\_1',  
              type: 'EMAIL',  
              config: { to: 'test@example.com' },  
              retries: 2  
            }  
          \],  
          edges: \[\]  
        }  
      }  
    });  
      
    // Mock SendGrid to always fail  
    vi.spyOn(global, 'fetch').mockRejectedValue(  
      new Error('Network error')  
    );  
      
    const response \= await action({  
      request: new Request(  
        \`http://localhost:3000/api/workflows/${workflow.id}/execute\`,  
        {  
          method: 'POST',  
          body: JSON.stringify({ input: {} })  
        }  
      ),  
      params: { id: workflow.id },  
      context: {}  
    });  
      
    await new Promise(resolve \=\> setTimeout(resolve, 2000));  
      
    const execution \= await prisma.execution.findUnique({  
      where: { id: (await response.json()).executionId },  
      include: { taskExecutions: true }  
    });  
      
    expect(execution?.status).toBe('FAILED');  
    expect(execution?.taskExecutions\[0\].status).toBe('FAILED');  
    expect(execution?.taskExecutions\[0\].attempt).toBe(2);  
  });  
});

---

### **10.3 E2E Tests (10%)**

// e2e/workflow-creation.spec.ts  
import { test, expect } from '@playwright/test';

test.describe('Workflow Creation Flow', () \=\> {  
  test('should create and execute workflow end-to-end', async ({ page }) \=\> {  
    // Navigate to homepage  
    await page.goto('/');  
      
    // Click create workflow  
    await page.click('text=Create Workflow');  
      
    // Wait for builder to load  
    await expect(page.locator('\[data-testid="workflow-canvas"\]')).toBeVisible();  
      
    // Drag email node from palette  
    await page.dragAndDrop(  
      '\[data-testid="node-palette-email"\]',  
      '\[data-testid="workflow-canvas"\]',  
      { targetPosition: { x: 100, y: 100 } }  
    );  
      
    // Verify node appears  
    await expect(page.locator('\[data-node-type="EMAIL"\]')).toBeVisible();  
      
    // Click node to configure  
    await page.click('\[data-node-type="EMAIL"\]');  
      
    // Wait for config panel  
    await expect(page.locator('\[data-testid="node-config-panel"\]')).toBeVisible();  
      
    // Fill configuration  
    await page.fill('\[name="to"\]', 'test@example.com');  
    await page.fill('\[name="subject"\]', 'Test Email');  
    await page.fill('\[name="body"\]', 'This is a test');  
      
    // Save configuration  
    await page.click('text=Save');  
      
    // Add second node (Slack)  
    await page.dragAndDrop(  
      '\[data-testid="node-palette-slack"\]',  
      '\[data-testid="workflow-canvas"\]',  
      { targetPosition: { x: 100, y: 200 } }  
    );  
      
    // Connect nodes  
    await page.hover('\[data-node-type="EMAIL"\]');  
    await page.dragAndDrop(  
      '\[data-handle-type="source"\]',  
      '\[data-node-type="SLACK"\] \[data-handle-type="target"\]'  
    );  
      
    // Verify edge appears  
    await expect(page.locator('\[data-edge-id\]')).toBeVisible();  
      
    // Save workflow  
    await page.click('text=Save Workflow');  
      
    // Enter workflow name  
    await page.fill('\[data-testid="workflow-name"\]', 'Test Workflow E2E');  
    await page.click('text=Create');  
      
    // Wait for save confirmation  
    await expect(page.locator('text=Workflow saved successfully')).toBeVisible();  
      
    // Execute workflow  
    await page.click('text=Execute');  
      
    // Provide input  
    await page.fill('\[data-testid="execution-input"\]', JSON.stringify({  
      email: 'user@example.com',  
      name: 'John Doe'  
    }));  
    await page.click('text=Start Execution');  
      
    // Wait for execution dashboard  
    await expect(page.locator('\[data-testid="execution-dashboard"\]')).toBeVisible();  
      
    // Watch for task completion  
    await expect(  
      page.locator('\[data-task-id="node\_1"\] \[data-testid="task-status"\]')  
    ).toHaveText('SUCCESS', { timeout: 10000 });  
      
    await expect(  
      page.locator('\[data-task-id="node\_2"\] \[data-testid="task-status"\]')  
    ).toHaveText('SUCCESS', { timeout: 10000 });  
      
    // Verify execution complete  
    await expect(  
      page.locator('text=Execution completed successfully')  
    ).toBeVisible({ timeout: 15000 });  
  });  
    
  test('should prevent circular dependencies', async ({ page }) \=\> {  
    await page.goto('/workflows/new');  
      
    // Create 3 nodes  
    await page.dragAndDrop(  
      '\[data-testid="node-palette-email"\]',  
      '\[data-testid="workflow-canvas"\]',  
      { targetPosition: { x: 100, y: 100 } }  
    );  
      
    await page.dragAndDrop(  
      '\[data-testid="node-palette-slack"\]',  
      '\[data-testid="workflow-canvas"\]',  
      { targetPosition: { x: 200, y: 100 } }  
    );  
      
    await page.dragAndDrop(  
      '\[data-testid="node-palette-http"\]',  
      '\[data-testid="workflow-canvas"\]',  
      { targetPosition: { x: 300, y: 100 } }  
    );  
      
    // Connect A → B  
    await page.dragAndDrop(  
      '\[data-node-id="node\_1"\] \[data-handle-type="source"\]',  
      '\[data-node-id="node\_2"\] \[data-handle-type="target"\]'  
    );  
      
    // Connect B → C  
    await page.dragAndDrop(  
      '\[data-node-id="node\_2"\] \[data-handle-type="source"\]',  
      '\[data-node-id="node\_3"\] \[data-handle-type="target"\]'  
    );  
      
    // Try to connect C → A (would create cycle)  
    await page.dragAndDrop(  
      '\[data-node-id="node\_3"\] \[data-handle-type="source"\]',  
      '\[data-node-id="node\_1"\] \[data-handle-type="target"\]'  
    );  
      
    // Verify error message  
    await expect(  
      page.locator('text=Cannot create circular dependency')  
    ).toBeVisible();  
      
    // Verify edge was not created  
    const edgeCount \= await page.locator('\[data-edge-id\]').count();  
    expect(edgeCount).toBe(2); // Only A→B and B→C  
  });  
});

---

## **11\. Implementation Timeline**

### **Phase 1: Foundation & Core Engine (6 hours)**

**Hour 1-2: Project Setup & Database**

* \[x\] Initialize Remix project with TypeScript  
* \[x\] Install dependencies (Effect, Prisma, React Flow, Framer Motion, Tailwind, shadcn/ui)  
* \[x\] Configure Tailwind with custom design system  
* \[x\] Set up PostgreSQL with Docker  
* \[x\] Create Prisma schema  
* \[x\] Generate and run migrations  
* \[x\] Seed database with example workflows

**Hour 3-4: Topological Sort & Execution Engine**

* \[x\] Implement Priority Queue data structure  
* \[x\] Build TopologicalSorter with Kahn's algorithm  
* \[x\] Create WorkflowExecutionEngine with Effect.js  
* \[x\] Implement parallel execution with `Effect.forEach`  
* \[x\] Add cycle detection  
* \[x\] Write unit tests for algorithms (85%+ coverage)

**Hour 5-6: Task Executors**

* \[x\] Create TaskExecutor base interface  
* \[x\] Implement EmailTaskExecutor (SendGrid mock)  
* \[x\] Implement SlackTaskExecutor (Webhook mock)  
* \[x\] Implement HttpTaskExecutor (generic HTTP)  
* \[x\] Add retry logic with Effect.retry  
* \[x\] Add timeout handling  
* \[x\] Write unit tests for executors

---

### **Phase 2: API & Real-Time (5 hours)**

**Hour 7-8: Remix API Routes**

* \[x\] Create POST /api/workflows (save workflow)  
* \[x\] Create GET /api/workflows/:id (load workflow)  
* \[x\] Create POST /api/workflows/:id/execute (trigger execution)  
* \[x\] Create GET /api/executions/:id (execution status)  
* \[x\] Implement Prisma queries with Effect.js  
* \[x\] Add error handling and validation (Zod schemas)

**Hour 9-10: WebSocket Real-Time**

* \[x\] Create WebSocketService with Effect.js  
* \[x\] Implement Pub/Sub pattern (EventEmitter)  
* \[x\] Create WS route: /ws/executions/:id  
* \[x\] Add heartbeat mechanism  
* \[x\] Implement message protocol  
* \[x\] Add reconnection logic on client  
* \[x\] Write integration tests

**Hour 11: Integration Testing**

* \[x\] Write tests for workflow execution flow  
* \[x\] Test retry logic with mocked failures  
* \[x\] Test WebSocket message flow  
* \[x\] Test concurrent executions

---

### **Phase 3: Beautiful UI (5 hours)**

**Hour 12-13: Workflow Builder**

* \[x\] Set up React Flow canvas  
* \[x\] Create custom node components (glassmorphism)  
* \[x\] Build node palette with drag-and-drop  
* \[x\] Implement edge creation with animations  
* \[x\] Add mini-map component  
* \[x\] Create configuration panel (slide-in animation)  
* \[x\] Add undo/redo with Zustand  
* \[x\] Implement auto-layout (Dagre)

**Hour 14: Execution Dashboard**

* \[x\] Create ExecutionDashboard component  
* \[x\] Build real-time task cards with animations  
* \[x\] Implement progress bars with gradient shimmer  
* \[x\] Create timeline view component  
* \[x\] Add live logs stream (auto-scroll)  
* \[x\] Integrate WebSocket hook  
* \[x\] Add loading skeletons

**Hour 15: UI Polish & Animations**

* \[x\] Add Framer Motion to all interactions  
* \[x\] Create toast notifications system  
* \[x\] Implement dark mode toggle  
* \[x\] Add responsive layouts  
* \[x\] Create beautiful landing page  
* \[x\] Add microinteractions (hover states, clicks)  
* \[x\] Optimize animations for performance

**Hour 16: Component Library**

* \[x\] Build reusable Button component  
* \[x\] Build Card component family  
* \[x\] Create Modal component  
* \[x\] Build Form components with validation  
* \[x\] Add StatusBadge component  
* \[x\] Create ProgressBar component

---

### **Phase 4: Polish & Documentation (2 hours)**

**Hour 17: Testing & Fixes**

* \[x\] Run full test suite  
* \[x\] Fix any failing tests  
* \[x\] Add E2E tests for critical flows  
* \[x\] Test on different browsers  
* \[x\] Test responsive layouts  
* \[x\] Fix any bugs found

**Hour 18: Documentation & Deployment**

* \[x\] Write comprehensive README with:  
  * Beautiful hero section with screenshots  
  * Architecture diagrams (Mermaid)  
  * Setup instructions (\<5 minutes)  
  * API documentation  
  * Technical decisions log (ADRs)  
  * Demo video script  
* \[x\] Create demo video (screen recording \+ narration)  
* \[x\] Deploy to Fly.io or Railway  
* \[x\] Test deployed version  
* \[x\] Polish GitHub repository

**Deliverables**:

* ✅ Production-quality code  
* ✅ Beautiful, animated UI  
* ✅ 85%+ test coverage  
* ✅ Comprehensive documentation  
* ✅ Deployed demo  
* ✅ Video walkthrough

---

## **12\. Success Metrics**

### **12.1 Technical Metrics**

| Metric | Target | Actual |
| ----- | ----- | ----- |
| Test Coverage | \>85% | \_\_\_% |
| Build Time | \<2min | \_\_\_s |
| Bundle Size (main) | \<500KB | \_\_\_KB |
| Bundle Size (widget) | \<50KB | \_\_\_KB |
| TypeScript Strict | 100% | \_\_\_% |
| Lighthouse Score | \>90 | \_\_\_ |
| First Contentful Paint | \<1.5s | \_\_\_s |
| Time to Interactive | \<3s | \_\_\_s |

### **12.2 Code Quality Metrics**

| Metric | Target | Tool |
| ----- | ----- | ----- |
| No ESLint errors | 0 | ESLint |
| No TypeScript errors | 0 | tsc |
| Cyclomatic complexity | \<10 | SonarQube |
| Code duplication | \<3% | SonarQube |
| Maintainability Index | \>80 | Code Climate |

### **12.3 Demo Success Metrics**

**Qualitative**:

* ✅ "Wow factor" \- Visually stunning first impression  
* ✅ "This is sophisticated" \- Shows technical depth  
* ✅ "Production-ready" \- Professional code quality  
* ✅ "I'd hire this person" \- Demonstrates all required skills

**Quantitative**:

* ✅ Uses all required tech: Remix, React, Prisma, Effect.js, TypeScript ✓  
* ✅ Implements 3+ complex algorithms  
* ✅ Has beautiful, animated UI with 10+ Framer Motion components  
* ✅ Includes comprehensive testing (unit, integration, E2E)  
* ✅ Has production observability patterns  
* ✅ Built in 16-18 hours

---

## **Appendix A: Design System Components**

### **Component Showcase**

// Example: Complete workflow builder page  
export default function WorkflowBuilderPage() {  
  const { workflow, updateWorkflow } \= useWorkflow();  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } \= useReactFlow();  
  const { showToast } \= useToast();  
    
  return (  
    \<div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"\>  
      {/\* Node Palette \*/}  
      \<motion.aside  
        className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-4"  
        initial={{ x: \-100, opacity: 0 }}  
        animate={{ x: 0, opacity: 1 }}  
        transition={{ type: "spring", stiffness: 100 }}  
      \>  
        \<h2 className="text-lg font-semibold text-white mb-4"\>Node Palette\</h2\>  
        \<NodePalette /\>  
      \</motion.aside\>  
        
      {/\* Canvas \*/}  
      \<main className="flex-1 relative"\>  
        \<ReactFlow  
          nodes={nodes}  
          edges={edges}  
          onNodesChange={onNodesChange}  
          onEdgesChange={onEdgesChange}  
          onConnect={onConnect}  
          nodeTypes={customNodeTypes}  
          edgeTypes={customEdgeTypes}  
          className="bg-gray-900"  
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}  
        \>  
          \<Background variant="dots" gap={20} size={1} color="\#ffffff15" /\>  
          \<Controls className="bg-white/10 backdrop-blur border border-white/20" /\>  
          \<MiniMap  
            className="bg-white/5 backdrop-blur border border-white/20"  
            nodeColor="\#3b82f6"  
            maskColor="rgba(0, 0, 0, 0.6)"  
          /\>  
        \</ReactFlow\>  
      \</main\>  
        
      {/\* Config Panel \*/}  
      \<AnimatePresence\>  
        {selectedNode && (  
          \<NodeConfigPanel  
            node={selectedNode}  
            onClose={() \=\> setSelectedNode(null)}  
            onSave={(config) \=\> {  
              updateNode(selectedNode.id, config);  
              showToast('Node updated', 'success');  
            }}  
          /\>  
        )}  
      \</AnimatePresence\>  
    \</div\>  
  );  
}

---

## **Appendix B: Animation Library**

### **Preset Animations**

// lib/animations.ts  
export const animations \= {  
  // Fade animations  
  fadeIn: {  
    initial: { opacity: 0 },  
    animate: { opacity: 1 },  
    exit: { opacity: 0 }  
  },  
    
  // Slide animations  
  slideUp: {  
    initial: { y: 20, opacity: 0 },  
    animate: { y: 0, opacity: 1 },  
    exit: { y: \-20, opacity: 0 }  
  },  
    
  slideRight: {  
    initial: { x: \-20, opacity: 0 },  
    animate: { x: 0, opacity: 1 },  
    exit: { x: 20, opacity: 0 }  
  },  
    
  // Scale animations  
  scaleUp: {  
    initial: { scale: 0.8, opacity: 0 },  
    animate: { scale: 1, opacity: 1 },  
    exit: { scale: 0.8, opacity: 0 }  
  },  
    
  // Spring animations  
  springUp: {  
    initial: { y: 20, opacity: 0 },  
    animate: { y: 0, opacity: 1 },  
    transition: { type: "spring", stiffness: 300, damping: 30 }  
  },  
    
  // Stagger containers  
  staggerContainer: {  
    animate: {  
      transition: {  
        staggerChildren: 0.1  
      }  
    }  
  },  
    
  staggerItem: {  
    initial: { opacity: 0, y: 20 },  
    animate: { opacity: 1, y: 0 }  
  }  
};

// Usage  
\<motion.div {...animations.fadeIn}\>Content\</motion.div\>

---

## **End of PRD**

**Total Pages**: 52  
 **Estimated Read Time**: 45 minutes  
 **Implementation Time**: 16-18 hours  
 **Complexity Level**: ⭐⭐⭐⭐⭐

---

**Next Steps**:

1. ✅ Review this PRD  
2. ✅ Set up development environment  
3. ✅ Start Phase 1 (Foundation)  
4. ✅ Track progress using checkboxes  
5. ✅ Document as you build  
6. ✅ Test continuously  
7. ✅ Deploy and celebrate\! 🎉

**Remember**: Focus on creating something beautiful AND technically impressive. The UI should feel magical, and the code should be production-ready. This is your chance to show both design sensibility and engineering excellence\!

Good luck\! 🚀

