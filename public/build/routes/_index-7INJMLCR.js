import "/build/_shared/chunk-Y2XMVLKO.js";
import {
  useTranslation
} from "/build/_shared/chunk-5TYVNNOX.js";
import {
  ClientOnly,
  FlowBuilder,
  definitionToReactFlow
} from "/build/_shared/chunk-G2FX75T3.js";
import "/build/_shared/chunk-ECSGXRMK.js";
import "/build/_shared/chunk-Y6RJRNBS.js";
import {
  require_node
} from "/build/_shared/chunk-NBEH4DGX.js";
import {
  Link,
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

// app/routes/_index.tsx
var import_node = __toESM(require_node(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1763496097296.2686";
}
function IndexRoute() {
  _s();
  const data = useLoaderData();
  const {
    t
  } = useTranslation();
  const builderData = (0, import_react2.useMemo)(() => definitionToReactFlow(data.heroWorkflow.definition), [data.heroWorkflow.definition]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "px-8 py-12 space-y-12", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "grid grid-cols-1 lg:grid-cols-2 gap-10 items-center", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-6", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm uppercase tracking-[0.4em] text-emerald-300/80", children: t("app.tagline") }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 53,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "text-5xl font-bold text-white leading-tight", children: [
          "Build workflows visually.",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500", children: [
            " ",
            "Observe them in real-time."
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 58,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 56,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-lg text-white/70 max-w-xl", children: "FlowForge pairs a delightful drag-and-drop builder with a production-grade execution engine powered by Effect, Prisma, and Remix. Automate onboarding, revenue ops, or anything in between." }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 63,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/workflows/new", className: "btn-primary", children: t("app.cta") }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 70,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/dashboard", className: "btn-secondary", children: t("app.dashboard") }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 73,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 69,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("dl", { className: "grid grid-cols-3 gap-6 text-center", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, { value: data.metrics.automations, label: "Automations" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 79,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, { value: `${data.metrics.successRate * 100}%`, label: "Success rate" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 80,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, { value: data.metrics.avgDuration, label: "Avg duration" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 81,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 78,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 52,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "glass p-4 border border-white/5 rounded-3xl shadow-2xl", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center justify-between p-4", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase text-white/50 tracking-[0.3em]", children: "Demo workflow" }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 88,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-lg text-white font-semibold", children: data.heroWorkflow.name }, void 0, false, {
              fileName: "app/routes/_index.tsx",
              lineNumber: 91,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 87,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "pill", children: "Live Builder" }, void 0, false, {
            fileName: "app/routes/_index.tsx",
            lineNumber: 93,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 86,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-[460px]", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-full w-full bg-black/20 rounded-3xl animate-pulse" }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 96,
          columnNumber: 35
        }, this), children: () => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FlowBuilder, { initialNodes: builderData.nodes, initialEdges: builderData.edges, onChange: () => void 0, showPalette: false, showConfig: false, interactive: false }, "hero-preview", false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 97,
          columnNumber: 22
        }, this) }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 96,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/routes/_index.tsx",
          lineNumber: 95,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 85,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 51,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: data.executions.map((execution) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "card space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.3em] text-white/50", children: execution.status }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 105,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xl font-semibold text-white", children: execution.workflowId }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 108,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-white/70", children: [
        "Started ",
        new Date(execution.startedAt).toLocaleTimeString()
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 109,
        columnNumber: 13
      }, this)
    ] }, execution.id, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 104,
      columnNumber: 43
    }, this)) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 103,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 50,
    columnNumber: 10
  }, this);
}
_s(IndexRoute, "1UEc0BzshLS2AwHYMxSYs//SHpE=", false, function() {
  return [useLoaderData, useTranslation];
});
_c = IndexRoute;
function Metric({
  value,
  label
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-3xl font-semibold text-white", children: value }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 125,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.4em] text-white/60 mt-2", children: label }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 126,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 124,
    columnNumber: 10
  }, this);
}
_c2 = Metric;
var _c;
var _c2;
$RefreshReg$(_c, "IndexRoute");
$RefreshReg$(_c2, "Metric");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  IndexRoute as default
};
//# sourceMappingURL=/build/routes/_index-7INJMLCR.js.map
