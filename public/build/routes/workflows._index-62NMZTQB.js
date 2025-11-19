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
  Link,
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
import "/build/_shared/chunk-2Z2JGDFU.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/workflows._index.tsx
var import_node = __toESM(require_node(), 1);
var import_workflow = __toESM(require_workflow(), 1);
var import_execution_service = __toESM(require_execution_service(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/workflows._index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/workflows._index.tsx"
  );
  import.meta.hot.lastModified = "1763420918077.8342";
}
function WorkflowsRoute() {
  _s();
  const {
    workflows,
    executions
  } = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "px-8 py-10 space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", { className: "flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.4em] text-white/50", children: "Workflows" }, void 0, false, {
          fileName: "app/routes/workflows._index.tsx",
          lineNumber: 45,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-3xl font-semibold text-white mt-2", children: "Automation Library" }, void 0, false, {
          fileName: "app/routes/workflows._index.tsx",
          lineNumber: 46,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/workflows._index.tsx",
        lineNumber: 44,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/workflows/new", className: "btn-primary", children: "New Workflow" }, void 0, false, {
        fileName: "app/routes/workflows._index.tsx",
        lineNumber: 48,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/workflows._index.tsx",
      lineNumber: 43,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6", children: workflows.map((workflow) => {
      const workflowExecutions = executions.filter((execution) => execution.workflowId === workflow.id);
      return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: `/workflows/${workflow.id}`, className: "card hover:shadow-glow transition-shadow", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-white/70", children: workflow.name }, void 0, false, {
          fileName: "app/routes/workflows._index.tsx",
          lineNumber: 57,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs text-white/50 mt-1", children: workflow.description }, void 0, false, {
          fileName: "app/routes/workflows._index.tsx",
          lineNumber: 58,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center justify-between mt-6 text-xs text-white/60", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
            workflowExecutions.length,
            " runs"
          ] }, void 0, true, {
            fileName: "app/routes/workflows._index.tsx",
            lineNumber: 60,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
            "v",
            workflow.version
          ] }, void 0, true, {
            fileName: "app/routes/workflows._index.tsx",
            lineNumber: 61,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/workflows._index.tsx",
          lineNumber: 59,
          columnNumber: 15
        }, this)
      ] }, workflow.id, true, {
        fileName: "app/routes/workflows._index.tsx",
        lineNumber: 56,
        columnNumber: 16
      }, this);
    }) }, void 0, false, {
      fileName: "app/routes/workflows._index.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/workflows._index.tsx",
    lineNumber: 42,
    columnNumber: 10
  }, this);
}
_s(WorkflowsRoute, "aZ2dtDLry6KIPu525Ij3xpqiVso=", false, function() {
  return [useLoaderData];
});
_c = WorkflowsRoute;
var _c;
$RefreshReg$(_c, "WorkflowsRoute");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  WorkflowsRoute as default
};
//# sourceMappingURL=/build/routes/workflows._index-62NMZTQB.js.map
