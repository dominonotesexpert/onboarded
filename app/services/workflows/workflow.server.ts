import { prisma } from "~/lib/prisma.server";
import { isDemoMode } from "~/utils/env.server";
import { demoWorkflows } from "~/data/demo-workflows";
import type { WorkflowDefinition, WorkflowWithRelations } from "~/types/workflow";
import { z } from "zod";

const workflowSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(240).optional(),
  definition: z.custom<WorkflowDefinition>(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional()
});

export async function listWorkflows(): Promise<WorkflowWithRelations[]> {
  if (isDemoMode()) {
    return demoWorkflows;
  }

  const workflows = await prisma.workflow.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return workflows as unknown as WorkflowWithRelations[];
}

export async function getWorkflow(id: string) {
  if (isDemoMode()) {
    return demoWorkflows.find((workflow) => workflow.id === id) ?? null;
  }

  return prisma.workflow.findUnique({ where: { id } });
}

export async function createWorkflow(input: z.infer<typeof workflowSchema>) {
  const data = workflowSchema.parse(input);
  if (isDemoMode()) {
    const newWorkflow: WorkflowWithRelations = {
      id: `demo-${Date.now()}`,
      version: 1,
      isDraft: true,
      isPublished: false,
      ...data
    };
    demoWorkflows.push(newWorkflow);
    return newWorkflow;
  }

  return prisma.workflow.create({
    data
  });
}

export async function updateWorkflow(id: string, input: Partial<z.infer<typeof workflowSchema>>) {
  const data = workflowSchema.partial().parse(input);
  if (isDemoMode()) {
    const existing = demoWorkflows.find((workflow) => workflow.id === id);
    if (!existing) return null;
    Object.assign(existing, data);
    return existing;
  }

  return prisma.workflow.update({
    where: { id },
    data
  });
}
