window.__ModuleLoader__.load({
	id: "dsh-web-notify",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/NotificationObserver.tsx
var import_react = require("react");

// src/client/notify.ts
function isConversationAttended(visibilityState, focused, activePanelId) {
  return visibilityState === "visible" && focused && activePanelId === null;
}
function turnCopy(reason) {
  if (reason === "completed") return { label: "\u5B8C\u4E86", body: "\u51E6\u7406\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F" };
  if (reason === "blocked") return { label: "\u30D6\u30ED\u30C3\u30AF", body: "\u51E6\u7406\u304C\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3057\u305F" };
  if (reason === "error") return { label: "\u30A8\u30E9\u30FC", body: "\u51E6\u7406\u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F" };
  return null;
}
function waitCopy(kind) {
  if (kind === "approval") return "\u627F\u8A8D\u5F85\u3061";
  if (kind === "plan-review") return "\u8A08\u753B\u30EC\u30D3\u30E5\u30FC\u5F85\u3061";
  if (kind === "question") return "\u8CEA\u554F\u5F85\u3061";
  return "\u64CD\u4F5C\u5F85\u3061";
}
function decideSession(input) {
  const observedWaitKeys = input.observedWaitKeys;
  if (input.excluded) return { action: null, observedTurn: input.observedTurn, observedWaitKeys };
  let observedTurn = input.observedTurn;
  let action = null;
  const show = !input.conversational || !input.inMainView;
  if (input.lastTurn !== null && input.lastTurn.turn > observedTurn) {
    observedTurn = input.lastTurn.turn;
    const copy = turnCopy(input.lastTurn.reason);
    if (copy !== null && show) {
      action = { kind: "turn", title: `${input.title} \xB7 ${copy.label}`, body: copy.body };
    }
  }
  if (input.pending !== null) {
    if (!observedWaitKeys.has(input.pending.key)) {
      observedWaitKeys.add(input.pending.key);
      if (show) {
        action = { kind: "wait", title: `${input.title} \xB7 ${waitCopy(input.pending.kind)}`, body: "\u64CD\u4F5C\u3092\u5F85\u3063\u3066\u3044\u307E\u3059" };
      }
    }
  } else if (observedWaitKeys.size > 0) {
    observedWaitKeys.clear();
  }
  return { action, observedTurn, observedWaitKeys };
}

// src/client/NotificationObserver.tsx
function NotificationObserver({ openSession, useSessions, useSessionStatus, usePanelInfo }) {
  const list = useSessions((state) => state);
  const status = useSessionStatus((state) => state);
  const panel = usePanelInfo((state) => state);
  const stateRef = (0, import_react.useRef)({
    seen: /* @__PURE__ */ new Set(),
    observedTurns: /* @__PURE__ */ new Map(),
    observedWaits: /* @__PURE__ */ new Map(),
    current: null
  });
  (0, import_react.useEffect)(() => {
    const s = stateRef.current;
    const conversational = isConversationAttended(document.visibilityState, document.hasFocus(), panel.activePanelId);
    const actions = [];
    for (const id of list.ids) {
      const row = list.byId[id];
      if (row === void 0) continue;
      const firstSight = !s.seen.has(row.id);
      const waits = s.observedWaits.get(row.id) ?? /* @__PURE__ */ new Set();
      const result = decideSession({
        excluded: row.origin === "subagent",
        conversational,
        inMainView: (row.retainedBy.mainView ?? 0) > 0,
        title: row.displayTitle,
        lastTurn: row.projectionValues?.notifyTurn ?? null,
        pending: status.get(row.id)?.pendingInteraction ?? null,
        observedTurn: s.observedTurns.get(row.id) ?? 0,
        observedWaitKeys: waits
      });
      s.observedTurns.set(row.id, result.observedTurn);
      if (waits.size > 0) s.observedWaits.set(row.id, waits);
      if (firstSight) {
        s.seen.add(row.id);
        continue;
      }
      if (result.action !== null) actions.push({ ...result.action, session: row.id });
    }
    const ids = new Set(list.ids);
    for (const id of s.seen) if (!ids.has(id)) s.seen.delete(id);
    for (const id of [...s.observedTurns.keys()]) if (!ids.has(id)) s.observedTurns.delete(id);
    for (const id of [...s.observedWaits.keys()]) if (!ids.has(id)) s.observedWaits.delete(id);
    const action = actions.find((entry) => entry.kind === "wait") ?? actions[0];
    if (action === void 0) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    s.current?.close();
    const notification = new Notification(action.title, { body: action.body });
    notification.onclick = () => {
      window.focus();
      openSession(action.session);
      notification.close();
    };
    s.current = notification;
  }, [list, status, panel, openSession]);
  return null;
}

// src/client/SettingsRow.tsx
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function readPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}
function SettingsRow() {
  const [permission, setPermission] = (0, import_react2.useState)(readPermission);
  const request = async () => {
    try {
      setPermission(await Notification.requestPermission());
    } catch {
      setPermission(readPermission());
    }
  };
  const test = () => {
    new Notification("DSH\u901A\u77E5\u30C6\u30B9\u30C8", { body: "\u901A\u77E5\u306F\u6B63\u5E38\u306B\u52D5\u4F5C\u3057\u3066\u3044\u307E\u3059" });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 16px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 500 }, children: "\u30D6\u30E9\u30A6\u30B6\u901A\u77E5" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "0.85em", opacity: 0.65 }, children: "\u30BB\u30C3\u30B7\u30E7\u30F3\u306E\u5B8C\u4E86\u30FB\u30A8\u30E9\u30FC\u30FB\u64CD\u4F5C\u5F85\u3061\u3092OS\u901A\u77E5\u3067\u77E5\u3089\u305B\u307E\u3059" })
    ] }),
    permission === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => void request(), children: "\u8A31\u53EF\u3092\u30EA\u30AF\u30A8\u30B9\u30C8" }),
    permission === "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.65 }, children: "\u8A31\u53EF\u6E08\u307F" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: test, children: "\u30C6\u30B9\u30C8\u901A\u77E5" })
    ] }),
    permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.65 }, children: "\u62D2\u5426\u6E08\u307F\uFF08\u30D6\u30E9\u30A6\u30B6\u8A2D\u5B9A\u3067\u5909\u66F4\u3067\u304D\u307E\u3059\uFF09" }),
    permission === "unsupported" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.65 }, children: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u975E\u5BFE\u5FDC" })
  ] });
}

// src/client/index.ts
var inject = ["slots", "uiWorkspace"];
function apply(ctx) {
  ctx.slots.inject("shell.overlay", () => {
    ctx.slots.register(
      {
        name: "shell.overlay",
        id: "web-notify",
        inject: () => ({ openSession: (sessionId) => ctx.uiWorkspace.openSession(sessionId) })
      },
      NotificationObserver
    );
  });
  ctx.slots.inject("settings.general.item", () => {
    ctx.slots.register({ name: "settings.general.item", id: "web-notify", order: 100 }, SettingsRow);
  });
}

		return module.exports;
	}
});
