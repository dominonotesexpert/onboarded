import { Prisma } from "@prisma/client";
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
    const exists = demoWorkflows.some((wf) => wf.name === data.name);
    if (exists) {
      throw new Error("A workflow with this name already exists. Please choose another name.");
    }
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

  const existing = await prisma.workflow.findFirst({ where: { name: data.name } });
  if (existing) {
    throw new Error("A workflow with this name already exists. Please choose another name.");
  }

  const { definition, ...rest } = data;
  return prisma.workflow.create({
    data: {
      ...rest,
      definition: definition as unknown as Prisma.InputJsonValue
    }
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

  const { definition, ...rest } = data;
  const prismaData: Prisma.WorkflowUpdateInput = {
    ...rest,
    ...(definition ? { definition: definition as unknown as Prisma.InputJsonValue } : {})
  };

  return prisma.workflow.update({
    where: { id },
    data: prismaData
  });
}

export async function deleteWorkflow(id: string) {
  if (isDemoMode()) {
    const idx = demoWorkflows.findIndex((wf) => wf.id === id);
    if (idx >= 0) {
      demoWorkflows.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.$transaction(async (tx) => {
    const executions = await tx.execution.findMany({
      where: { workflowId: id },
      select: { id: true }
    });
    const executionIds = executions.map((e) => e.id);

    if (executionIds.length > 0) {
      await tx.taskExecution.deleteMany({
        where: { executionId: { in: executionIds } }
      });
      await tx.execution.deleteMany({
        where: { id: { in: executionIds } }
      });
    }

    await tx.workflow.delete({ where: { id } });
  });
  return true;
}
