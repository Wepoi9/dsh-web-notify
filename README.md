# dsh-web-notify

English | [日本語](README.ja.md)

A community plugin for the DeepSeek Harness (DSH) Web UI that sends browser/OS notifications when a session completes, errors, becomes blocked, or waits for user interaction.

> This is a community-maintained plugin, not part of the DeepSeek Harness core distribution.

## What it does

The host side registers a `notifyTurn` session projection. The Web client observes session state and uses the browser Notification API to notify for:

- a non-visible session ending as `completed`, `blocked`, or `error`;
- a session waiting for `approval`, `question`, or `plan-review`.

Notifications are suppressed when the relevant conversation is already visible and focused.

Additional behavior:

- `max-tokens`, `aborted`, and `interrupted` turn endings are ignored;
- subagent sessions are ignored;
- duplicate turn and interaction notifications are suppressed;
- multiple simultaneous updates are aggregated into one notification (`DSH · 3 updates` / `1 Waiting, 2 Completed` in English, `DSH · 3件の更新` / `1件の操作待ち、2件の完了` in Japanese);
- clicking a notification opens the highest-priority affected session;
- notifications are emitted only when browser permission is `granted`.

## Compatibility

Latest DSH version with recorded runtime verification: **0.2.2-alpha.2**, runtime-verified against the live app on 2026-10-29; the previous lane **0.2.1-rc.2** was runtime-verified on 2026-10-17. A declared range is not proof of runtime compatibility.

| DSH version | Verification |
| --- | --- |
| 0.1.6-alpha.2 | End-to-end behavior verified |
| 0.1.7-alpha.2 | Plugin load, inventory visibility, and test notification verified |
| 0.1.7-rc.1 | Plugin load, inventory visibility, and test notification verified |
| 0.1.7-rc.2 | Plugin load, inventory visibility, and test notification verified |
| 0.2.0-rc.1 | Plugin load, inventory visibility, and test notification verified |
| 0.2.0-rc.2 | Plugin load, inventory visibility, and test notification verified |
| 0.2.1-alpha.1 | Plugin load, inventory visibility, and test notification verified |
| 0.2.1-alpha.2 | Declared in `engines.dsh`; source-level compatibility reviewed, but plugin load, test notification, and real session notification triggers have **not** been runtime-verified on this version |
| 0.2.1-alpha.3 | Plugin load, settings row visibility, granted permission status, test notification firing, and real-session firing — completion (including one resumed after an approval), waiting-for-interaction, and suppressed stop/interrupt — verified on 2026-10-15 with generic titles and fixed status copy |
| 0.2.1-rc.1 | Build, `npm run check`, and 5/5 `npm test` passing on 2026-10-17; the rc.1 runtime compatibility preflight reports zero rejections; plugin load, Plugin Manager card and switch, settings row, granted permission status, test notification, and real-session firing (completion and waiting-for-interaction per the same-day UI pass, no session name in the notification, click-through verified the same day) verified on the live web UI on 2026-10-17; hot disable/enable through the Plugin Manager verified live on the same day (settings row removed and restored without a restart, a completed turn fired no notification while disabled, the next completed turn fired again after re-enable) plus the deselected-bundle state persisting across one restart |
| 0.2.1-rc.2 | `engines.dsh` declares 0.2.1-rc.2; build, `npm run check`, and 5/5 `npm test` passing on 2026-10-17; the web profile loads with zero plugin rejections and the plugin is listed in the Plugin Manager panel; settings row, granted permission status, test notification, and real-session completion firing (generic `DSH · 完了 / 処理が完了しました` copy, no session name in the notification, click-through opens the session, zero page errors) verified on the live web UI on 2026-10-17 |
| 0.2.2-alpha.2 | `apply` migrated to `await ctx.sessionProjections.register(...)` for the alpha.2 projection-handle API and `engines.dsh` extended; build, `npm run check`, and 5/5 unit tests passing on 2026-10-29; plugin listed in the Plugin Manager with zero rejections on the 0.2.2-alpha.2 runtime; settings row visible and real-session completion firing (generic `DSH · 完了 / 処理が完了しました` copy, no session name or body in the notification) verified live on 2026-10-29; hot disable verified live (a completed turn after the toggle-off emitted no notification), and the re-enable was confirmed working after a page reload; waiting-for-interaction verified live (a genuine pending-approval state fired `DSH · 承認待ち / ユーザーの操作を待っています`); click-through verified page-side — dispatching a `click` event on the captured notification instance reopened the notification's own session (the OS-level notification click itself cannot be scripted in the browser harness) |

Real-session completion and waiting-for-interaction notification firing on **0.2.1-alpha.3** is verified as listed (stop and interrupt do not notify). In the scripted browser, the notification permission and the not-attended gate were exercised through page-side overrides; the granted-permission display itself was checked in a real browser the same day. Real-session firing from **error**/**blocked** end states has not been triggered in this pass, and on **0.2.1-rc.1** the stop/interrupt suppression and aggregated-notification display were not re-triggered (no notification-logic changes since the alpha.3 pass; the only edits were Japanese copy strings). On **0.2.1-rc.2**, waiting-for-interaction firing, stop/interrupt suppression, aggregated-notification display, and hot disable/enable were not re-triggered either (no plugin changes since the rc.1 pass beyond the `engines.dsh` declaration). The rc.2 UI pass likewise ran in a scripted browser with the not-attended gate overridden page-side; notification permission was granted as a browser-context permission. On **0.2.1-alpha.2**, even the test-notification smoke check remains unverified. Versions later than 0.2.2-alpha.2 are not assumed compatible until verified.

## Install

Install dependencies and build the client bundle:

```sh
npm install
npm run build
```

Add the local checkout to the Web profile:

```sh
dsh plugin --profile web add <absolute-path-to-this-repository>
```

Restart DSH Web after installation.

## Settings

Open **Settings → General → Browser notifications**.

- When permission is not decided, request browser notification permission.
- When permission is granted, send a test notification.
- Revoke permission from the browser's site settings.

Copy language follows the browser's preferred languages, not the DSH Language setting. The first usable preference decides: `ja` renders Japanese, anything else renders English.

## Privacy and notification content

OS notification centers and lock screens may display notification content.

This plugin intentionally limits notification text to:

- a generic `DSH` title prefix plus a short state label such as `Completed`, `Error`, or `Waiting for approval` in English, and its Japanese counterpart in a Japanese browser session;
- generic counts for aggregated notifications.

It does **not** show the DSH session display title, LLM output, command text, or full filesystem paths, so a session name holding customer or project names is not exposed on the OS lock screen. The plugin declares no dedicated capability; it reads only the session id and the session finish/wait states as fixed enum values (completed, error, blocked, approval, …), and hands the OS notification nothing but a generic title, a fixed status label, and fixed status copy. Clicking a notification opens the affected session (the plugin passes only its session id there), which is how a notification is tied back to it.

The plugin does not send notification data to an external service. Notifications are created locally through the browser Notification API.

## Build and test

```sh
npm run build
npm run check
npm test
```

`npm run build` regenerates `lib/client.js` with esbuild. Rebuild after changing client source.

The runtime `zod` dependency is declared as `^4.6.6` so the lockfile resolves past GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404 (memory exhaustion while validating array schemas without a length bound, fixed in 4.6.6). This plugin validates no array schemas (`src/projection.js` uses only object, number, and string), so the vulnerable path is not reachable from its code.

## Limitations

- Browser notification permission is required and is scoped to the browser origin.
- Notifications are available only while the DSH page is loaded and connected; this plugin does not implement offline push notifications.
- DSH is evolving rapidly, so extension contracts can change between prerelease versions.
- Copy language is chosen once when the client module loads; changing the browser's preferred languages takes effect on the next page reload.

## Contributing

Bug reports and focused pull requests are welcome. For notification failures, include the DSH version, browser, operating system, relevant session state, and whether the page was visible/focused.

## License

MIT. See [LICENSE](LICENSE).
