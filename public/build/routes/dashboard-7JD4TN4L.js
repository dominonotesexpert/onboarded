import {
  require_execution_service
} from "/build/_shared/chunk-J3SZ52QD.js";
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

// app/routes/dashboard.tsx
var import_node = __toESM(require_node(), 1);
var import_react3 = __toESM(require_react(), 1);
var import_execution_service = __toESM(require_execution_service(), 1);

// node_modules/remix-utils/build/react/use-event-source.js
var import_react = __toESM(require_react(), 1);
var context = (0, import_react.createContext)(/* @__PURE__ */ new Map());
var EventSourceProvider = context.Provider;
function useEventSource(url, { event = "message", init, enabled = true } = {}) {
  let map = (0, import_react.useContext)(context);
  let [data, setData] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!enabled) {
      return void 0;
    }
    let key = [url.toString(), init?.withCredentials].join("::");
    let value = map.get(key) ?? {
      count: 0,
      source: new EventSource(url, init)
    };
    ++value.count;
    map.set(key, value);
    value.source.addEventListener(event, handler);
    setData(null);
    function handler(event2) {
      setData(event2.data || "UNKNOWN_EVENT_DATA");
    }
    return () => {
      value.source.removeEventListener(event, handler);
      --value.count;
      if (value.count <= 0) {
        value.source.close();
        map.delete(key);
      }
    };
  }, [url, event, init, map, enabled]);
  return data;
}

// app/routes/dashboard.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/dashboard.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/dashboard.tsx"
  );
  import.meta.hot.lastModified = "1763421219974.8647";
}
function DashboardRoute() {
  _s();
  const {
    executions
  } = useLoaderData();
  const [activeExecutionId, setActiveExecutionId] = (0, import_react3.useState)(executions[0]?.id);
  const event = useEventSource(activeExecutionId ? `/api/executions/${activeExecutionId}/stream` : null);
  const liveEvent = event ? JSON.parse(event) : null;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "px-8 py-10 space-y-8", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.4em] text-white/50", children: "Monitoring" }, void 0, false, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 44,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-3xl font-semibold text-white", children: "Execution Dashboard" }, void 0, false, {
          fileName: "app/routes/dashboard.tsx",
          lineNumber: 45,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 43,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/workflows", className: "btn-secondary", children: "Manage Workflows" }, void 0, false, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 47,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 42,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: executions.map((execution) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => setActiveExecutionId(execution.id), className: `card text-left ${activeExecutionId === execution.id ? "border-blue-400/60" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs uppercase tracking-[0.3em] text-white/50", children: execution.status }, void 0, false, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 54,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-lg text-white font-semibold mt-1", children: execution.workflowId }, void 0, false, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 55,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-xs text-white/60 mt-2", children: execution.duration ? `${execution.duration} ms` : "Processing" }, void 0, false, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 56,
        columnNumber: 13
      }, this)
    ] }, execution.id, true, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 53,
      columnNumber: 38
    }, this)) }, void 0, false, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 52,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "card space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm uppercase tracking-[0.4em] text-white/50", children: "Live Event Stream" }, void 0, false, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 63,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("pre", { className: "bg-black/30 rounded-2xl text-xs text-emerald-200 p-4 h-64 overflow-auto", children: liveEvent ? JSON.stringify(liveEvent, null, 2) : "Awaiting events..." }, void 0, false, {
        fileName: "app/routes/dashboard.tsx",
        lineNumber: 64,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/dashboard.tsx",
      lineNumber: 62,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/dashboard.tsx",
    lineNumber: 41,
    columnNumber: 10
  }, this);
}
_s(DashboardRoute, "RDSjtEh3ZBmeDschGGJsDboSSyo=", false, function() {
  return [useLoaderData, useEventSource];
});
_c = DashboardRoute;
var _c;
$RefreshReg$(_c, "DashboardRoute");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  DashboardRoute as default
};
//# sourceMappingURL=/build/routes/dashboard-7JD4TN4L.js.map
