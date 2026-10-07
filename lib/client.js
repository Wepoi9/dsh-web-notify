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

// src/client/copy.ts
var ja = {
  settingsTitle: "\u30D6\u30E9\u30A6\u30B6\u901A\u77E5",
  settingsDescription: "\u30BB\u30C3\u30B7\u30E7\u30F3\u306E\u5B8C\u4E86\u30FB\u30A8\u30E9\u30FC\u30FB\u64CD\u4F5C\u5F85\u3061\u3092OS\u901A\u77E5\u3067\u77E5\u3089\u305B\u307E\u3059",
  requestPermission: "\u8A31\u53EF\u3092\u30EA\u30AF\u30A8\u30B9\u30C8",
  granted: "\u8A31\u53EF\u6E08\u307F",
  testNotification: "\u30C6\u30B9\u30C8\u901A\u77E5",
  denied: "\u62D2\u5426\u6E08\u307F\uFF08\u30D6\u30E9\u30A6\u30B6\u8A2D\u5B9A\u3067\u5909\u66F4\u3067\u304D\u307E\u3059\uFF09",
  unsupported: "\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u975E\u5BFE\u5FDC",
  testTitle: "DSH\u901A\u77E5\u30C6\u30B9\u30C8",
  testBody: "\u901A\u77E5\u306F\u6B63\u5E38\u306B\u52D5\u4F5C\u3057\u3066\u3044\u307E\u3059",
  turnLabels: {
    completed: "\u5B8C\u4E86",
    blocked: "\u30D6\u30ED\u30C3\u30AF",
    error: "\u30A8\u30E9\u30FC"
  },
  turnBodies: {
    completed: "\u51E6\u7406\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F",
    blocked: "\u51E6\u7406\u304C\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3057\u305F",
    error: "\u51E6\u7406\u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F"
  },
  waitLabels: {
    approval: "\u627F\u8A8D\u5F85\u3061",
    "plan-review": "\u8A08\u753B\u30EC\u30D3\u30E5\u30FC\u5F85\u3061",
    question: "\u8CEA\u554F\u5F85\u3061"
  },
  waitFallbackLabel: "\u64CD\u4F5C\u5F85\u3061",
  waitBody: "\u64CD\u4F5C\u3092\u5F85\u3063\u3066\u3044\u307E\u3059",
  updateCount: (count) => `DSH \xB7 ${count}\u4EF6\u306E\u66F4\u65B0`,
  aggregateLabel: (label, count) => `${count}\u4EF6\u306E${label}`,
  aggregateJoin: (parts) => parts.join("\u3001")
};
var en = {
  settingsTitle: "Browser notifications",
  settingsDescription: "OS notifications for completed, errored, and waiting sessions",
  requestPermission: "Request permission",
  granted: "Granted",
  testNotification: "Test notification",
  denied: "Denied (change it in your browser settings)",
  unsupported: "Not supported in this browser",
  testTitle: "DSH notification test",
  testBody: "Notifications are working",
  turnLabels: {
    completed: "Completed",
    blocked: "Blocked",
    error: "Error"
  },
  turnBodies: {
    completed: "Processing completed",
    blocked: "Processing was blocked",
    error: "An error occurred"
  },
  waitLabels: {
    approval: "Waiting for approval",
    "plan-review": "Waiting for plan review",
    question: "Waiting for a response"
  },
  waitFallbackLabel: "Waiting",
  waitBody: "Waiting for input",
  updateCount: (count) => `DSH \xB7 ${count} updates`,
  aggregateLabel: (label, count) => `${count} ${label}`,
  aggregateJoin: (parts) => parts.join(", ")
};
function pickCopy() {
  if (typeof window === "undefined") return en;
  try {
    const tags = [...navigator.languages ?? [], navigator.language];
    for (const tag of tags) {
      if (typeof tag !== "string") continue;
      const primary = tag.toLowerCase().split("-")[0];
      if (!primary) continue;
      return primary === "ja" ? ja : en;
    }
  } catch {
  }
  return en;
}
var COPY = pickCopy();

// src/client/notify.ts
function isConversationAttended(visibilityState, focused, activePanelId) {
  return visibilityState === "visible" && focused && activePanelId === null;
}
function turnCopy(reason, copy = COPY) {
  if (reason === "completed") return { label: copy.turnLabels.completed, body: copy.turnBodies.completed };
  if (reason === "blocked") return { label: copy.turnLabels.blocked, body: copy.turnBodies.blocked };
  if (reason === "error") return { label: copy.turnLabels.error, body: copy.turnBodies.error };
  return null;
}
function waitCopy(kind, copy = COPY) {
  if (kind === "approval") return copy.waitLabels.approval;
  if (kind === "plan-review") return copy.waitLabels["plan-review"];
  if (kind === "question") return copy.waitLabels.question;
  return copy.waitFallbackLabel;
}
function decideSession(input) {
  if (input.excluded) return { action: null, observedTurn: input.observedTurn, observedWaitKeys: input.observedWaitKeys };
  const observedWaitKeys = new Set(input.observedWaitKeys);
  let observedTurn = input.observedTurn;
  let action = null;
  const show = !input.conversational || !input.inMainView;
  const copy = input.copy ?? COPY;
  if (input.lastTurn !== null && input.lastTurn.turn > observedTurn) {
    observedTurn = input.lastTurn.turn;
    const copyForTurn = turnCopy(input.lastTurn.reason, copy);
    if (copyForTurn !== null && show) {
      action = { kind: "turn", title: `${input.title} \xB7 ${copyForTurn.label}`, body: copyForTurn.body, label: copyForTurn.label };
    }
  }
  if (input.pending !== null) {
    if (!observedWaitKeys.has(input.pending.key)) {
      observedWaitKeys.add(input.pending.key);
      const label = waitCopy(input.pending.kind, copy);
      if (show) {
        action = { kind: "wait", title: `${input.title} \xB7 ${label}`, body: copy.waitBody, label };
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
      const result = decideSession({
        excluded: row.origin === "subagent",
        conversational,
        inMainView: (row.retainedBy.mainView ?? 0) > 0,
        title: row.displayTitle,
        lastTurn: row.projectionValues?.notifyTurn ?? null,
        pending: status.get(row.id)?.pendingInteraction ?? null,
        observedTurn: s.observedTurns.get(row.id) ?? 0,
        observedWaitKeys: s.observedWaits.get(row.id) ?? /* @__PURE__ */ new Set()
      });
      s.observedTurns.set(row.id, result.observedTurn);
      s.observedWaits.set(row.id, result.observedWaitKeys);
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
    const top = actions.find((entry) => entry.kind === "wait") ?? actions[0];
    if (top === void 0) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    let title;
    let body;
    if (actions.length === 1) {
      title = top.title;
      body = top.body;
    } else {
      const counts = /* @__PURE__ */ new Map();
      for (const entry of actions) counts.set(entry.label, (counts.get(entry.label) ?? 0) + 1);
      title = COPY.updateCount(actions.length);
      body = COPY.aggregateJoin([...counts.entries()].map(([label, count]) => COPY.aggregateLabel(label, count)));
    }
    s.current?.close();
    const notification = new Notification(title, { body });
    notification.onclick = () => {
      window.focus();
      openSession(top.session);
      notification.close();
    };
    s.current = notification;
  }, [list, status, panel, openSession]);
  (0, import_react.useEffect)(() => {
    return () => {
      const current = stateRef.current.current;
      if (current === null) return;
      current.onclick = null;
      current.close();
      stateRef.current.current = null;
    };
  }, []);
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
    new Notification(COPY.testTitle, { body: COPY.testBody });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "10px 16px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 500 }, children: COPY.settingsTitle }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "0.85em", opacity: 0.65 }, children: COPY.settingsDescription })
    ] }),
    permission === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => void request(), children: COPY.requestPermission }),
    permission === "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.65 }, children: COPY.granted }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: test, children: COPY.testNotification })
    ] }),
    permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.65 }, children: COPY.denied }),
    permission === "unsupported" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { opacity: 0.65 }, children: COPY.unsupported })
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
