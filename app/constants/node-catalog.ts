export interface NodeCatalogItem {
  type: string;
  label: string;
  description: string;
  accent: string;
  icon: string;
  config: Record<string, unknown>;
  executionMode?: "sequential" | "parallel";
}

export const nodeCatalog: NodeCatalogItem[] = [
  {
    type: "EMAIL",
    label: "Email",
    description: "Send transactional or notification emails",
    accent: "from-sky-400 to-blue-500",
    icon: "📧",
    config: {
      to: "{{email}}",
      subject: "Hello from FlowForge",
      body: "Magic workflows ✨"
    },
    executionMode: "sequential"
  },
  {
    type: "SLACK",
    label: "Slack",
    description: "Post message to any Slack channel",
    accent: "from-purple-400 to-indigo-500",
    icon: "💬",
    config: {
      channel: "#general",
      message: "Workflow step completed"
    },
    executionMode: "sequential"
  },
  {
    type: "HTTP",
    label: "HTTP Request",
    description: "Call webhooks or REST APIs",
    accent: "from-emerald-400 to-cyan-400",
    icon: "🌐",
    config: {
      method: "POST",
      url: "https://api.example.com",
      body: {}
    },
    executionMode: "parallel"
  },
  {
    type: "DELAY",
    label: "Delay",
    description: "Pause execution for a duration",
    accent: "from-amber-400 to-orange-500",
    icon: "⏱️",
    config: {
      durationMs: 60000
    },
    executionMode: "sequential"
  },
  {
    type: "CONDITIONAL",
    label: "Condition",
    description: "Branch logic with expressions",
    accent: "from-rose-400 to-pink-500",
    icon: "🧠",
    config: {
      expression: "context.score > 70",
      branchTrue: "true",
      branchFalse: "false"
    },
    executionMode: "parallel"
  },
  {
    type: "TRANSFORM",
    label: "Transform",
    description: "Map fields or shape payloads",
    accent: "from-lime-400 to-teal-400",
    icon: "🧩",
    config: {
      mapper: {
        field: "{{context.someValue}}"
      }
    },
    executionMode: "sequential"
  }
];
