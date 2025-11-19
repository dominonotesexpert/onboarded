import {
  ClientOnly,
  FlowBuilder,
  definitionToReactFlow
} from "/build/_shared/chunk-G2FX75T3.js";
import "/build/_shared/chunk-ECSGXRMK.js";
import "/build/_shared/chunk-Y6RJRNBS.js";
import {
  require_workflow
} from "/build/_shared/chunk-4U6EKPII.js";
import {
  require_execution_service
} from "/build/_shared/chunk-J3SZ52QD.js";
import {
  require_node
} from "/build/_shared/chunk-NBEH4DGX.js";
import {
  useFetcher,
  useLoaderData
} from "/build/_shared/chunk-ULZ26LME.js";
import "/build/_shared/chunk-PLT55Z5M.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-F4KNNEUR.js";
import {
  createHotContext
} from "/build/_shared/chunk-M7AEJR4O.js";
import "/build/_shared/chunk-JR22VO6P.js";
import {
  require_react
} from "/build/_shared/chunk-2Z2JGDFU.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/workflows.$workflowId.tsx
var import_node = __toESM(require_node(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_execution_service = __toESM(require_execution_service(), 1);
var import_workflow = __toESM(require_workflow(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/workflows.$workflowId.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/workflows.$workflowId.tsx"
  );
  import.meta.hot.lastModified = "1763558541114.5908";
}
function WorkflowDetailRoute() {
  _s();
  const {
    workflow,
    executions,
    published
  } = useLoaderData();
  const fetcher = useFetcher();
  const [definition, setDefinition] = (0, import_react2.useState)(() => definitionToReactFlow(workflow.definition));
  const [statusMessage, setStatusMessage] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
    if (fetcher.data?.executionId) {
      setStatusMessage(`Triggered execution ${fetcher.data.executionId}`);
    }
  }, [fetcher.data]);
  (0, import_react2.useEffect)(() => {
    setDefinition(definitionToReactFlow(workflow.definition));
  }, [workflow]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "px-8 py-10 space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", { className: "flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.4em] text-white/50", children: "Workflow" }, void 0, false, {
          fileName: "app/routes/workflows.$workflowId.tsx",
          lineNumber: 93,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-3xl font-semibold text-white", children: workflow.name }, void 0, false, {
          fileName: "app/routes/workflows.$workflowId.tsx",
          lineNumber: 94,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-white/60 mt-2 max-w-3xl", children: workflow.description }, void 0, false, {
          fileName: "app/routes/workflows.$workflowId.tsx",
          lineNumber: 95,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/workflows.$workflowId.tsx",
        lineNumber: 92,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "button", className: "btn-primary", onClick: () => fetcher.submit({
        input: JSON.stringify({
          employee: {
            name: "Demo User",
            email: "demo@flowforge.dev"
          }
        })
      }, {
        method: "post"
      }), children: "Run Workflow" }, void 0, false, {
        fileName: "app/routes/workflows.$workflowId.tsx",
        lineNumber: 97,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 91,
      columnNumber: 7
    }, this),
    published ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card border border-emerald-400/40 text-emerald-200 text-sm", children: "Workflow published successfully." }, void 0, false, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 111,
      columnNumber: 20
    }, this) : null,
    statusMessage ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card border border-emerald-400/40 text-emerald-200 text-sm", children: statusMessage }, void 0, false, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 114,
      columnNumber: 24
    }, this) : null,
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-[640px] bg-white/5 rounded-3xl animate-pulse" }, void 0, false, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 116,
      columnNumber: 29
    }, this), children: () => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FlowBuilder, { initialNodes: definition.nodes, initialEdges: definition.edges, onChange: (payload) => setDefinition(payload) }, workflow.id, false, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 117,
      columnNumber: 16
    }, this) }, void 0, false, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 116,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm uppercase tracking-[0.4em] text-white/50", children: "Recent Executions" }, void 0, false, {
        fileName: "app/routes/workflows.$workflowId.tsx",
        lineNumber: 121,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: executions.map((execution) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-white font-semibold", children: execution.status }, void 0, false, {
            fileName: "app/routes/workflows.$workflowId.tsx",
            lineNumber: 125,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs text-white/60", children: [
            execution.duration ?? "--",
            " ms"
          ] }, void 0, true, {
            fileName: "app/routes/workflows.$workflowId.tsx",
            lineNumber: 126,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/workflows.$workflowId.tsx",
          lineNumber: 124,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs text-white/50 mt-2", children: [
          "Started ",
          new Date(execution.startedAt).toLocaleString()
        ] }, void 0, true, {
          fileName: "app/routes/workflows.$workflowId.tsx",
          lineNumber: 128,
          columnNumber: 15
        }, this)
      ] }, execution.id, true, {
        fileName: "app/routes/workflows.$workflowId.tsx",
        lineNumber: 123,
        columnNumber: 40
      }, this)) }, void 0, false, {
        fileName: "app/routes/workflows.$workflowId.tsx",
        lineNumber: 122,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/workflows.$workflowId.tsx",
      lineNumber: 120,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/workflows.$workflowId.tsx",
    lineNumber: 90,
    columnNumber: 10
  }, this);
}
_s(WorkflowDetailRoute, "zrO7V8UVYLIRYU/L/kA3Pmj8rSg=", false, function() {
  return [useLoaderData, useFetcher];
});
_c = WorkflowDetailRoute;
var _c;
$RefreshReg$(_c, "WorkflowDetailRoute");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  WorkflowDetailRoute as default
};
//# sourceMappingURL=/build/routes/workflows.$workflowId-LBPJIBS2.js.map
