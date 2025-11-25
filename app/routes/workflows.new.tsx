/**
 * Workflow Builder Route (New Workflow)
 *
 * Visual workflow builder for creating new automation workflows.
 * Provides drag-and-drop interface with real-time validation.
 *
 * Features:
 * - Drag-and-drop node palette
 * - Visual workflow canvas powered by React Flow
 * - Node configuration panel with JSON editor
 * - Real-time validation with error highlighting
 * - Auto-layout for clean diagrams
 * - Save as draft or publish workflow
 * - Starts with demo workflow template
 *
 * Validation:
 * - Validates workflow structure before publishing
 * - Checks for cycles (DAG requirement)
 * - Validates node-specific configs (email addresses, URLs, etc.)
 *
 * @module routes/workflows.new
 */

import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { definitionToReactFlow, reactFlowToDefinition } from "~/utils/workflow-transform";
import { demoWorkflows } from "~/data/demo-workflows";
import { FlowBuilder } from "~/components/builder/FlowBuilder";
import { useEffect, useMemo, useRef, useState } from "react";
import { createWorkflow } from "~/services/workflows/workflow.server";
import { ClientOnly } from "~/components/common/ClientOnly";
import type { WorkflowDefinition } from "~/types/workflow";
import { getValidationIssues } from "~/utils/workflow-validation";
import { useToast } from "~/components/common/Toaster";

/**
 * Loader function - provides demo workflow template
 */
export async function loader() {
  const template = demoWorkflows[0];
  return json({
    workflow: template
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const parsed = JSON.parse(String(formData.get("definition") ?? "{}"));
  const definition = reactFlowToDefinition(parsed.nodes ?? [], parsed.edges ?? []);
  const intent = String(formData.get("action") ?? "draft");

  try {
    if (intent === "publish") {
      const issues = getValidationIssues(definition as WorkflowDefinition);
      if (issues.length > 0) {
        return json(
          { error: issues[0]?.message ?? "Workflow validation failed", issues },
          { status: 400 }
        );
      }
    }

    const workflow = await createWorkflow({
      name: String(formData.get("name") ?? "Untitled Workflow"),
      description: String(formData.get("description") ?? ""),
      definition,
      isDraft: intent !== "publish",
      isPublished: intent === "publish"
    });

    if (intent === "publish") {
      return redirect(`/workflows/${workflow.id}?status=published`);
    }

    return json({ workflow }, { status: 201 });
  } catch (error) {
    console.error("Workflow creation error:", error);
    const message = (error as Error)?.message ?? "Failed to save workflow";
    return json({
      error: message,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { status: 400 });
  }
}

export default function NewWorkflowRoute() {
  const { workflow } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { pushToast } = useToast();
  const lastErrorRef = useRef<string | null>(null);
  const workflowDefinition = useMemo<WorkflowDefinition>(
    () =>
      (workflow.definition ?? { nodes: [], edges: [] }) as unknown as WorkflowDefinition,
    [workflow.definition]
  );
  const [definition, setDefinition] = useState(() => definitionToReactFlow(workflowDefinition));

  useEffect(() => {
    if (actionData && "error" in actionData) {
      const message = (actionData as { error: string }).error;
      if (message !== lastErrorRef.current) {
        lastErrorRef.current = message;
        pushToast({
          title: "Publish failed",
          description: message
        });
      }
    }
  }, [actionData, pushToast]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <Form method="post" className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            {/* <p className="text-xs uppercase tracking-[0.4em] text-white/50">Builder</p>
            <h2 className="text-3xl font-semibold text-white">Create Workflow</h2> */}
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary" type="submit" name="action" value="draft">
              Save Draft
            </button>
            <button className="btn-primary" type="submit" name="action" value="publish">
              Publish
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Name</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
              name="name"
              defaultValue="New Workflow"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">Description</span>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
              name="description"
              placeholder="Describe the automation"
            />
          </label>
        </div>

        <input
          type="hidden"
          name="definition"
          value={JSON.stringify({
            nodes: definition.nodes,
            edges: definition.edges
          })}
        />
      </Form>

      {actionData && "workflow" in actionData ? (
        <div className="card border-emerald-400/40">
          <p className="text-sm text-emerald-300">
            Workflow saved (id: {(actionData as { workflow: { id: string } }).workflow.id}). Continue
            editing whenever you&apos;re ready.
          </p>
        </div>
      ) : null}
      <ClientOnly fallback={<div className="h-[640px] bg-white/5 rounded-3xl animate-pulse" />}>
        {() => (
          <FlowBuilder
            key="new-workflow-builder"
            initialNodes={definition.nodes}
            initialEdges={definition.edges}
            onChange={(payload) => setDefinition(payload)}
          />
        )}
      </ClientOnly>
    </div>
  );
}
