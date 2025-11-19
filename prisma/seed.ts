import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  const workflow = await prisma.workflow.upsert({
    where: { id: "demo-workflow" },
    update: {},
    create: {
      id: "demo-workflow",
      name: "Employee Onboarding",
      description: "Send welcome email, Slack notification and schedule manager check-in.",
      definition: {
        nodes: [
          { id: "start", type: "START", position: { x: 50, y: 180 } },
          { id: "email-welcome", type: "EMAIL", position: { x: 220, y: 120 } },
          { id: "slack-notify", type: "SLACK", position: { x: 420, y: 220 } },
          { id: "delay-survey", type: "DELAY", position: { x: 640, y: 220 } },
          { id: "survey-http", type: "HTTP", position: { x: 840, y: 220 } },
          { id: "end", type: "END", position: { x: 1060, y: 180 } }
        ],
        edges: [
          { source: "start", target: "email-welcome" },
          { source: "email-welcome", target: "slack-notify" },
          { source: "slack-notify", target: "delay-survey" },
          { source: "delay-survey", target: "survey-http" },
          { source: "survey-http", target: "end" }
        ]
      },
      isDraft: false,
      isPublished: true
    }
  });

  await prisma.workflowNode.createMany({
    data: [
      {
        id: nanoid(),
        workflowId: workflow.id,
        nodeId: "email-welcome",
        label: "Welcome Email",
        type: "EMAIL",
        position: { x: 220, y: 120 },
        config: {
          to: "{{employee.email}}",
          subject: "Welcome to FlowForge ✨",
          body: "We are thrilled to have you!"
        }
      },
      {
        id: nanoid(),
        workflowId: workflow.id,
        nodeId: "slack-notify",
        label: "Slack Notification",
        type: "SLACK",
        position: { x: 420, y: 220 },
        config: {
          channel: "#welcome",
          message: "Please welcome {{employee.name}}!"
        }
      },
      {
        id: nanoid(),
        workflowId: workflow.id,
        nodeId: "delay-survey",
        label: "Delay",
        type: "DELAY",
        position: { x: 640, y: 220 },
        config: {
          durationMs: 86_400_000
        }
      },
      {
        id: nanoid(),
        workflowId: workflow.id,
        nodeId: "survey-http",
        label: "Trigger Survey",
        type: "HTTP",
        position: { x: 840, y: 220 },
        config: {
          url: "https://example.com/surveys",
          method: "POST",
          body: { employeeId: "{{employee.id}}" }
        }
      }
    ]
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
