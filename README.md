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
- multiple simultaneous updates are aggregated into one notification;
- clicking a notification opens the highest-priority affected session;
- notifications are emitted only when browser permission is `granted`.

## Compatibility

Latest tested DSH version: **0.2.1-alpha.1**.

| DSH version | Verification |
| --- | --- |
| 0.1.6-alpha.2 | End-to-end behavior verified |
| 0.1.7-alpha.2 | Plugin load, inventory visibility, and test notification verified |
| 0.1.7-rc.1 | Plugin load, inventory visibility, and test notification verified |
| 0.1.7-rc.2 | Plugin load, inventory visibility, and test notification verified |
| 0.2.0-rc.1 | Plugin load, inventory visibility, and test notification verified |
| 0.2.0-rc.2 | Plugin load, inventory visibility, and test notification verified |
| 0.2.1-alpha.1 | Plugin load, inventory visibility, and test notification verified |

Real session completion/error/interaction notification firing on **0.2.1-alpha.1** has not yet been re-verified. Newer DSH versions are not assumed compatible until verified.

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

The current settings and notification copy is Japanese; notification behavior is otherwise locale-independent.

## Privacy and notification content

OS notification centers and lock screens may display notification content.

This plugin intentionally limits notification text to:

- the DSH session display title;
- a short state label such as completion, error, or pending approval.

It does **not** include LLM output, command text, or full filesystem paths. A session display title may still be derived by DSH from a workspace directory name or session identifier when no explicit title exists.

The plugin does not send notification data to an external service. Notifications are created locally through the browser Notification API.

## Build and test

```sh
npm run build
npm run check
npm test
```

`npm run build` regenerates `lib/client.js` with esbuild. Rebuild after changing client source.

## Limitations

- Browser notification permission is required and is scoped to the browser origin.
- Notifications are available only while the DSH page is loaded and connected; this plugin does not implement offline push notifications.
- DSH is evolving rapidly, so extension contracts can change between prerelease versions.

## Contributing

Bug reports and focused pull requests are welcome. For notification failures, include the DSH version, browser, operating system, relevant session state, and whether the page was visible/focused.

## License

MIT. See [LICENSE](LICENSE).
