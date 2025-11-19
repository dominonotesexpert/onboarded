import "/build/_shared/chunk-Y2XMVLKO.js";
import {
  ClientOnly,
  FlowBuilder,
  definitionToReactFlow
} from "/build/_shared/chunk-CX3GXNCI.js";
import "/build/_shared/chunk-ECSGXRMK.js";
import "/build/_shared/chunk-Y6RJRNBS.js";
import {
  require_workflow
} from "/build/_shared/chunk-4U6EKPII.js";
import {
  require_node
} from "/build/_shared/chunk-NBEH4DGX.js";
import {
  Form,
  useActionData,
  useLoaderData
} from "/build/_shared/chunk-VV5A4Y7F.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  createHotContext
} from "/build/_shared/chunk-M7AEJR4O.js";
import "/build/_shared/chunk-JR22VO6P.js";
import "/build/_shared/chunk-PLT55Z5M.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/workflows.new.tsx
var import_node = __toESM(require_node(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_workflow = __toESM(require_workflow(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/workflows.new.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/workflows.new.tsx"
  );
  import.meta.hot.lastModified = "1763421123766.2278";
}
function NewWorkflowRoute() {
  _s();
  const {
    workflow
  } = useLoaderData();
  const actionData = useActionData();
  const [definition, setDefinition] = (0, import_react2.useState)(() => definitionToReactFlow(workflow.definition));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "px-8 py-10 space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", className: "space-y-6", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-1 min-w-[240px]", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.4em] text-white/50", children: "Builder" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 64,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-3xl font-semibold text-white", children: "Create Workflow" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 65,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/workflows.new.tsx",
          lineNumber: 63,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "btn-secondary", type: "submit", name: "action", value: "draft", children: "Save Draft" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 68,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "btn-primary", type: "submit", name: "action", value: "publish", children: "Publish" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 71,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/workflows.new.tsx",
          lineNumber: 67,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/workflows.new.tsx",
        lineNumber: 62,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-xs uppercase tracking-[0.3em] text-white/60", children: "Name" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 79,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white", name: "name", defaultValue: "New Workflow" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 80,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/workflows.new.tsx",
          lineNumber: 78,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-xs uppercase tracking-[0.3em] text-white/60", children: "Description" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 83,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white", name: "description", placeholder: "Describe the automation" }, void 0, false, {
            fileName: "app/routes/workflows.new.tsx",
            lineNumber: 84,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/workflows.new.tsx",
          lineNumber: 82,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/workflows.new.tsx",
        lineNumber: 77,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "definition", value: JSON.stringify({
        nodes: definition.nodes,
        edges: definition.edges
      }) }, void 0, false, {
        fileName: "app/routes/workflows.new.tsx",
        lineNumber: 88,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/workflows.new.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this),
    actionData?.workflow ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card border-emerald-400/40", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-emerald-300", children: [
      "Workflow saved (id: ",
      actionData.workflow.id,
      "). Continue editing whenever you're ready."
    ] }, void 0, true, {
      fileName: "app/routes/workflows.new.tsx",
      lineNumber: 95,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/workflows.new.tsx",
      lineNumber: 94,
      columnNumber: 31
    }, this) : null,
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-[640px] bg-white/5 rounded-3xl animate-pulse" }, void 0, false, {
      fileName: "app/routes/workflows.new.tsx",
      lineNumber: 100,
      columnNumber: 29
    }, this), children: () => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FlowBuilder, { initialNodes: definition.nodes, initialEdges: definition.edges, onChange: (payload) => setDefinition(payload) }, "new-workflow-builder", false, {
      fileName: "app/routes/workflows.new.tsx",
      lineNumber: 101,
      columnNumber: 16
    }, this) }, void 0, false, {
      fileName: "app/routes/workflows.new.tsx",
      lineNumber: 100,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/workflows.new.tsx",
    lineNumber: 60,
    columnNumber: 10
  }, this);
}
_s(NewWorkflowRoute, "X5awCmP018zm17B16DqqaDBBVcQ=", false, function() {
  return [useLoaderData, useActionData];
});
_c = NewWorkflowRoute;
var _c;
$RefreshReg$(_c, "NewWorkflowRoute");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  NewWorkflowRoute as default
};
//# sourceMappingURL=/build/routes/workflows.new-GUNC3EW6.js.map
