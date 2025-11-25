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
import { Button } from "~/components/common/Button";
import { Card } from "~/components/common/Card";

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
          description: message,
          variant: "error"
        });
      }
    }
  }, [actionData, pushToast]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <Form method="post" reloadDocument className="space-y-6 sm:space-y-8">
        <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-blue-400 font-medium mb-1 sm:mb-2">Builder</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Workflow</h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <Button variant="secondary" type="submit" name="action" value="draft" className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Draft</span>
            </Button>
            <Button type="submit" name="action" value="publish" rightIcon={<span>→</span>} className="flex-1 sm:flex-none">
              Publish
            </Button>
          </div>
        </header>

        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">Name</span>
            <input
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              name="name"
              defaultValue="New Workflow"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">Description</span>
            <input
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              name="description"
              placeholder="Describe the automation"
            />
          </label>
        </Card>

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
        <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>
            Workflow saved (id: {(actionData as { workflow: { id: string } }).workflow.id}). Continue
            editing whenever you&apos;re ready.
          </span>
        </div>
      ) : null}

      <div className="h-[400px] sm:h-[500px] lg:h-[640px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-sm">
        <ClientOnly fallback={<div className="h-full w-full bg-white/5 animate-pulse" />}>
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
    </div>
  );
}
