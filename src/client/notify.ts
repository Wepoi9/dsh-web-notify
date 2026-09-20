export type SessionId = string

export interface TurnFact {
  turn: number
  reason: string
}

export interface WaitFact {
  key: string
  kind: string
}

export interface DecisionInput {
  excluded?: boolean
  conversational: boolean
  inMainView: boolean
  title: string
  lastTurn: TurnFact | null
  pending: WaitFact | null
  observedTurn: number
  observedWaitKeys: Set<string>
}

export interface DecisionAction {
  kind: 'turn' | 'wait'
  title: string
  body: string
  label: string
}

export interface DecisionResult {
  action: DecisionAction | null
  observedTurn: number
  observedWaitKeys: Set<string>
}

export function isConversationAttended(visibilityState: DocumentVisibilityState, focused: boolean, activePanelId: string | null): boolean {
  return visibilityState === 'visible' && focused && activePanelId === null
}

export function turnCopy(reason: string): { label: string; body: string } | null {
  if (reason === 'completed') return { label: '完了', body: '処理が完了しました' }
  if (reason === 'blocked') return { label: 'ブロック', body: '処理がブロックされました' }
  if (reason === 'error') return { label: 'エラー', body: '処理でエラーが発生しました' }
  return null
}

export function waitCopy(kind: string): string {
  if (kind === 'approval') return '承認待ち'
  if (kind === 'plan-review') return '計画レビュー待ち'
  if (kind === 'question') return '質問待ち'
  return '操作待ち'
}

export function decideSession(input: DecisionInput): DecisionResult {
  if (input.excluded) return { action: null, observedTurn: input.observedTurn, observedWaitKeys: input.observedWaitKeys }
  const observedWaitKeys = new Set(input.observedWaitKeys)
  let observedTurn = input.observedTurn
  let action: DecisionResult['action'] = null
  const show = !input.conversational || !input.inMainView

  if (input.lastTurn !== null && input.lastTurn.turn > observedTurn) {
    observedTurn = input.lastTurn.turn
    const copy = turnCopy(input.lastTurn.reason)
    if (copy !== null && show) {
      action = { kind: 'turn', title: `${input.title} · ${copy.label}`, body: copy.body, label: copy.label }
    }
  }

  if (input.pending !== null) {
    if (!observedWaitKeys.has(input.pending.key)) {
      observedWaitKeys.add(input.pending.key)
      const label = waitCopy(input.pending.kind)
      if (show) {
        action = { kind: 'wait', title: `${input.title} · ${label}`, body: '操作を待っています', label }
      }
    }
  } else if (observedWaitKeys.size > 0) {
    observedWaitKeys.clear()
  }

  return { action, observedTurn, observedWaitKeys }
}
