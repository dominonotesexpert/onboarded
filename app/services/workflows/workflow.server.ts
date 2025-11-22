/**
 * Workflow Service
 *
 * This module provides the data access layer for workflow CRUD operations.
 * It serves as the bridge between API routes and the database/demo data.
 *
 * **Key Responsibilities:**
 * 1. Workflow CRUD operations (Create, Read, Update, Delete)
 * 2. Input validation using Zod schemas
 * 3. Demo mode vs production mode data handling
 * 4. Cascade deletion of workflow dependencies (executions, tasks)
 * 5. Name uniqueness validation
 *
 * **Demo Mode vs Production:**
 * - Demo mode: Uses in-memory array (demoWorkflows)
 * - Production: Persists to PostgreSQL via Prisma
 * - Controlled by FLOWFORGE_DEMO_MODE environment variable
 *
 * **Database Schema:**
 * ```
 * Workflow (1) → (N) Execution → (N) TaskExecution
 *                              → (N) ExecutionLog
 * ```
 * Deletion uses cascading to clean up all related records.
 *
 * @module workflow.server
 */

import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/prisma.server";
import { isDemoMode } from "~/utils/env.server";
import { demoWorkflows } from "~/data/demo-workflows";
import type { WorkflowDefinition, WorkflowWithRelations } from "~/types/workflow";
import { z } from "zod";

/**
 * Zod validation schema for workflow input data.
 *
 * **Validation Rules:**
 * - name: Required, 1-80 characters (must be unique)
 * - description: Optional, max 240 characters
 * - definition: WorkflowDefinition object (nodes + edges)
 * - isPublished: Optional boolean (default: false)
 * - isDraft: Optional boolean (default: true)
 *
 * This schema is used by both createWorkflow() and updateWorkflow().
 */
const workflowSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(240).optional(),
  definition: z.custom<WorkflowDefinition>(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional()
});

/**
 * List all workflows ordered by most recently updated.
 *
 * **Query Behavior:**
 * - Returns all workflows in the system
 * - Ordered by updatedAt DESC (most recent first)
 * - No pagination (consider adding for large datasets)
 *
 * **Demo Mode:**
 * - Returns in-memory demoWorkflows array
 * - Useful for testing without database setup
 *
 * **Production Mode:**
 * - Queries PostgreSQL via Prisma
 * - Includes all workflow metadata (name, description, published status, etc.)
 *
 * @returns Array of workflows with metadata
 *
 * @example
 * ```typescript
 * const workflows = await listWorkflows();
 * console.log(`Found ${workflows.length} workflows`);
 * workflows.forEach(wf => console.log(`- ${wf.name} (${wf.id})`));
 * ```
 */
export async function listWorkflows(): Promise<WorkflowWithRelations[]> {
  if (isDemoMode()) {
    return demoWorkflows;
  }

  const workflows = await prisma.workflow.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return workflows as unknown as WorkflowWithRelations[];
}

/**
 * Get a single workflow by ID.
 *
 * **Lookup Behavior:**
 * - Returns workflow with all metadata if found
 * - Returns null if workflow doesn't exist
 *
 * **Demo Mode:**
 * - Searches in-memory demoWorkflows array
 * - Returns first match or null
 *
 * **Production Mode:**
 * - Queries PostgreSQL via Prisma findUnique
 * - Uses indexed lookup on primary key (fast)
 *
 * @param id - Workflow ID to look up
 * @returns Workflow object or null if not found
 *
 * @example
 * ```typescript
 * const workflow = await getWorkflow('wf_123');
 * if (workflow) {
 *   console.log(`Found: ${workflow.name}`);
 *   console.log(`Nodes: ${workflow.definition.nodes.length}`);
 * } else {
 *   console.log('Workflow not found');
 * }
 * ```
 */
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
