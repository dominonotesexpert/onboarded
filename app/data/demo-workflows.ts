import type { WorkflowWithRelations, ExecutionSummary, ExecutionDetail } from "~/types/workflow";

export const demoWorkflows: WorkflowWithRelations[] = [
  {
    id: "demo-employee-onboarding",
    name: "Employee Onboarding",
    description: "Welcome email, Slack announcement, create ticket, schedule manager check-in.",
    version: 4,
    isDraft: false,
    isPublished: true,
    definition: {
      nodes: [
        {
          id: "start",
          type: "START",
          label: "Trigger",
          position: { x: 80, y: 160 },
          config: {}
        },
        {
          id: "email-welcome",
          type: "EMAIL",
          label: "Welcome Email",
          executionMode: "parallel",
          position: { x: 320, y: 60 },
          config: {
            to: "{{employee.email}}",
            subject: "Welcome to FlowForge",
            body: "Hi {{employee.name}}, thrilled to have you!"
          }
        },
        {
          id: "slack-announce",
          type: "SLACK",
          label: "Slack Announcement",
          executionMode: "parallel",
          position: { x: 320, y: 220 },
          config: {
            channel: "#welcome",
            message: "Please welcome {{employee.name}} to the team!"
          }
        },
        {
          id: "http-ticket",
          type: "HTTP",
          label: "Create IT Ticket",
          position: { x: 560, y: 160 },
          config: {
            method: "POST",
            url: "https://it.flowforge.dev/api/tickets",
            body: {
              employeeEmail: "{{employee.email}}",
              department: "{{employee.department}}"
            }
          }
        },
        {
          id: "delay-survey",
          type: "DELAY",
          label: "Wait 3 days",
          position: { x: 800, y: 160 },
          config: { durationMs: 259200000 }
        },
        {
          id: "http-survey",
          type: "HTTP",
          label: "Send NPS Survey",
          position: { x: 1040, y: 160 },
          config: { method: "POST", url: "https://surveys.flowforge.dev/nps" }
        },
        {
          id: "end",
          type: "END",
          label: "Complete",
          position: { x: 1260, y: 160 },
          config: {}
        }
      ],
      edges: [
        { source: "start", target: "email-welcome" },
        { source: "start", target: "slack-announce" },
        { source: "email-welcome", target: "http-ticket" },
        { source: "slack-announce", target: "http-ticket" },
        { source: "http-ticket", target: "delay-survey" },
        { source: "delay-survey", target: "http-survey" },
        { source: "http-survey", target: "end" }
      ]
    }
  },
  {
    id: "demo-lead-routing",
    name: "Lead Routing Engine",
    description: "Qualify inbound leads and route them to the right sales pod.",
    version: 7,
    isDraft: false,
    isPublished: true,
    definition: {
      nodes: [
        {
          id: "start",
          type: "START",
          label: "Lead Created",
          position: { x: 80, y: 120 },
          config: {}
        },
        {
          id: "transform-score",
          type: "TRANSFORM",
          label: "Compute Score",
          position: { x: 320, y: 120 },
          config: {
            mapper: {
              score: "{{lead.intent}} * 0.6 + {{lead.firmographicFit}} * 0.4"
            }
          }
        },
        {
          id: "conditional-score",
          type: "CONDITIONAL",
          label: "Enterprise?",
          position: { x: 560, y: 80 },
          config: {
            expression: "context.score >= 80",
            branchTrue: "enterprise",
            branchFalse: "velocity"
          }
        },
        {
          id: "slack-enterprise",
          type: "SLACK",
          label: "Notify Enterprise Pod",
          position: { x: 800, y: 40 },
          config: {
            channel: "#sales-enterprise",
            message: "Incoming enterprise lead: {{lead.company}}"
          }
        },
        {
          id: "slack-velocity",
          type: "SLACK",
          label: "Notify Velocity Pod",
          position: { x: 800, y: 160 },
          config: {
            channel: "#sales-velocity",
            message: "New velocity lead: {{lead.company}}"
          }
        },
        {
          id: "end",
          type: "END",
          label: "Done",
          position: { x: 1040, y: 100 },
          config: {}
        }
      ],
      edges: [
        { source: "start", target: "transform-score" },
        { source: "transform-score", target: "conditional-score" },
        { source: "conditional-score", target: "slack-enterprise", label: "enterprise" },
        { source: "conditional-score", target: "slack-velocity", label: "velocity" },
        { source: "slack-enterprise", target: "end" },
        { source: "slack-velocity", target: "end" }
      ]
    }
  }
];

export const demoExecutions: ExecutionSummary[] = [
  {
    id: "exec_1",
    workflowId: "demo-employee-onboarding",
    status: "COMPLETED",
    duration: 3825,
    startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 + 3825).toISOString(),
    metrics: { successRate: 0.98 }
  },
  {
    id: "exec_2",
    workflowId: "demo-employee-onboarding",
    status: "FAILED",
    duration: 1250,
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 30 + 1250).toISOString(),
    metrics: { failedNode: "http-ticket" }
  },
  {
    id: "exec_3",
    workflowId: "demo-lead-routing",
    status: "RUNNING",
    duration: undefined,
    startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    metrics: { successRate: 0.94 }
  }
];

export const demoExecutionDetails: ExecutionDetail[] = [
  {
    id: "exec_1",
    workflowId: "demo-employee-onboarding",
    status: "COMPLETED",
    duration: 3825,
    startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 + 3825).toISOString(),
    tasks: [
      {
        id: "task_start",
        nodeId: "start",
        label: "Trigger",
        status: "SUCCESS",
        startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 + 200).toISOString(),
        duration: 200
      },
      {
        id: "task_email",
        nodeId: "email-welcome",
        label: "Welcome Email",
        status: "SUCCESS",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 + 200).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 + 1400).toISOString(),
        duration: 1200,
        output: { messageId: "msg_123", to: "newhire@example.com" }
      },
      {
        id: "task_slack",
        nodeId: "slack-notify",
        label: "Slack Announcement",
        status: "SUCCESS",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 + 1400).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 + 2200).toISOString(),
        duration: 800,
        output: { channel: "#welcome", ts: Date.now() }
      },
      {
        id: "task_http",
        nodeId: "http-ticket",
        label: "Create IT Ticket",
        status: "SUCCESS",
        startedAt: new Date(Date.now() - 1000 * 60 * 60 + 2200).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 60 + 3825).toISOString(),
        duration: 1625,
        output: { ticketId: "IT-42" }
      }
    ]
  },
  {
    id: "exec_2",
    workflowId: "demo-employee-onboarding",
    status: "FAILED",
    duration: 1250,
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 30 + 1250).toISOString(),
    error: "HTTP request failed",
    tasks: [
      {
        id: "task_start",
        nodeId: "start",
        label: "Trigger",
        status: "SUCCESS",
        duration: 200
      },
      {
        id: "task_http",
        nodeId: "http-ticket",
        label: "Create IT Ticket",
        status: "FAILED",
        duration: 1050,
        error: "Timeout"
      }
    ]
  },
  {
    id: "exec_3",
    workflowId: "demo-lead-routing",
    status: "RUNNING",
    startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    tasks: [
      {
        id: "task_start",
        nodeId: "start",
        label: "Lead Created",
        status: "SUCCESS",
        duration: 150
      },
      {
        id: "task_transform",
        nodeId: "transform-score",
        label: "Compute Score",
        status: "RUNNING",
        output: { score: 82 }
      }
    ]
  }
];
