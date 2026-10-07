/**
 * Plugin copy in Japanese and English.
 *
 * The language comes from the browser's preferred languages: a `ja` primary
 * subtag selects Japanese, anything else selects English. The plugin does not
 * consult the DSH Language setting.
 */

export type Copy = {
  settingsTitle: string
  settingsDescription: string
  requestPermission: string
  granted: string
  testNotification: string
  denied: string
  unsupported: string
  testTitle: string
  testBody: string
  turnLabels: Record<'completed' | 'blocked' | 'error', string>
  turnBodies: Record<'completed' | 'blocked' | 'error', string>
  waitLabels: Record<'approval' | 'plan-review' | 'question', string>
  waitFallbackLabel: string
  waitBody: string
  updateCount: (count: number) => string
  aggregateLabel: (label: string, count: number) => string
  aggregateJoin: (parts: readonly string[]) => string
}

const ja: Copy = {
  settingsTitle: 'ブラウザ通知',
  settingsDescription: 'セッションの完了・エラー・操作待ちをOS通知で知らせます',
  requestPermission: '許可をリクエスト',
  granted: '許可済み',
  testNotification: 'テスト通知',
  denied: '拒否済み（ブラウザ設定で変更できます）',
  unsupported: 'このブラウザでは非対応',
  testTitle: 'DSH通知テスト',
  testBody: '通知は正常に動作しています',
  turnLabels: {
    completed: '完了',
    blocked: 'ブロック',
    error: 'エラー',
  },
  turnBodies: {
    completed: '処理が完了しました',
    blocked: '処理がブロックされました',
    error: '処理でエラーが発生しました',
  },
  waitLabels: {
    approval: '承認待ち',
    'plan-review': '計画レビュー待ち',
    question: '質問待ち',
  },
  waitFallbackLabel: '操作待ち',
  waitBody: '操作を待っています',
  updateCount: (count) => `DSH · ${count}件の更新`,
  aggregateLabel: (label, count) => `${count}件の${label}`,
  aggregateJoin: (parts) => parts.join('、'),
}

const en: Copy = {
  settingsTitle: 'Browser notifications',
  settingsDescription: 'OS notifications for completed, errored, and waiting sessions',
  requestPermission: 'Request permission',
  granted: 'Granted',
  testNotification: 'Test notification',
  denied: 'Denied (change it in your browser settings)',
  unsupported: 'Not supported in this browser',
  testTitle: 'DSH notification test',
  testBody: 'Notifications are working',
  turnLabels: {
    completed: 'Completed',
    blocked: 'Blocked',
    error: 'Error',
  },
  turnBodies: {
    completed: 'Processing completed',
    blocked: 'Processing was blocked',
    error: 'An error occurred',
  },
  waitLabels: {
    approval: 'Waiting for approval',
    'plan-review': 'Waiting for plan review',
    question: 'Waiting for a question',
  },
  waitFallbackLabel: 'Waiting',
  waitBody: 'Waiting for input',
  updateCount: (count) => `DSH · ${count} updates`,
  aggregateLabel: (label, count) => `${count} ${label}`,
  aggregateJoin: (parts) => parts.join(', '),
}

/**
 * Pick the copy language from the browser's ordered language tags. A `ja`
 * primary subtag selects Japanese; a non-browser host resolves to English.
 */
export function pickCopy(): Copy {
  if (typeof window === 'undefined') return en
  try {
    const tags = [...(navigator.languages ?? []), navigator.language]
    for (const tag of tags) {
      if (typeof tag !== 'string') continue
      const primary = tag.toLowerCase().split('-')[0]
      if (primary === 'ja') return ja
      if (primary) return en
    }
  } catch {
    // No navigator: English.
  }
  return en
}

/** Copy visible to one caller. The browser picks it; tests can select it directly. */
export const COPY: Copy = pickCopy()

/**
 * Both dictionaries, keyed by language id, for callers that pin a language —
 * the Node test run, for example, which has no window to ask.
 */
export const COPY_BY_LANGUAGE: Record<'ja' | 'en', Copy> = { ja, en }
