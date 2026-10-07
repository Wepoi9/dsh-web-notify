import { type Copy, COPY } from './copy.ts'

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
  /** Notification copy. Defaults to the browser's language; a test can pin another. */
  copy?: Copy
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

export function turnCopy(reason: string, copy: Copy = COPY): { label: string; body: string } | null {
  if (reason === 'completed') return { label: copy.turnLabels.completed, body: copy.turnBodies.completed }
  if (reason === 'blocked') return { label: copy.turnLabels.blocked, body: copy.turnBodies.blocked }
  if (reason === 'error') return { label: copy.turnLabels.error, body: copy.turnBodies.error }
  return null
}

export function waitCopy(kind: string, copy: Copy = COPY): string {
  if (kind === 'approval') return copy.waitLabels.approval
  if (kind === 'plan-review') return copy.waitLabels['plan-review']
  if (kind === 'question') return copy.waitLabels.question
  return copy.waitFallbackLabel
}

export function decideSession(input: DecisionInput): DecisionResult {
  if (input.excluded) return { action: null, observedTurn: input.observedTurn, observedWaitKeys: input.observedWaitKeys }
  const observedWaitKeys = new Set(input.observedWaitKeys)
  let observedTurn = input.observedTurn
  let action: DecisionResult['action'] = null
  const show = !input.conversational || !input.inMainView
  const copy = input.copy ?? COPY

  if (input.lastTurn !== null && input.lastTurn.turn > observedTurn) {
    observedTurn = input.lastTurn.turn
    const copyForTurn = turnCopy(input.lastTurn.reason, copy)
    if (copyForTurn !== null && show) {
      action = { kind: 'turn', title: `${input.title} · ${copyForTurn.label}`, body: copyForTurn.body, label: copyForTurn.label }
    }
  }

  if (input.pending !== null) {
    if (!observedWaitKeys.has(input.pending.key)) {
      observedWaitKeys.add(input.pending.key)
      const label = waitCopy(input.pending.kind, copy)
      if (show) {
        action = { kind: 'wait', title: `${input.title} · ${label}`, body: copy.waitBody, label }
      }
    }
  } else if (observedWaitKeys.size > 0) {
    observedWaitKeys.clear()
  }

  return { action, observedTurn, observedWaitKeys }
}
