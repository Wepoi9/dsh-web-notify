import { useEffect, useRef } from 'react'
import { decideSession, isConversationAttended, type SessionId, type TurnFact, type WaitFact } from './notify.ts'

interface SessionRow {
  id: SessionId
  displayTitle: string
  origin?: 'subagent'
  retainedBy: { mainView?: number }
  projectionValues?: { notifyTurn?: TurnFact | null }
}

interface SessionListState {
  ids: readonly SessionId[]
  byId: Record<SessionId, SessionRow>
}

interface SessionStatus {
  pendingInteraction?: WaitFact
}

interface PanelInfo {
  activePanelId: string | null
}

interface ObserverProps {
  openSession: (sessionId: SessionId) => void
  useSessions: (selector: (list: SessionListState) => SessionListState) => SessionListState
  useSessionStatus: (
    selector: (status: ReadonlyMap<SessionId, SessionStatus>) => ReadonlyMap<SessionId, SessionStatus>,
  ) => ReadonlyMap<SessionId, SessionStatus>
  usePanelInfo: (selector: (panel: PanelInfo) => PanelInfo) => PanelInfo
}

interface ObserverState {
  seen: Set<SessionId>
  observedTurns: Map<SessionId, number>
  observedWaits: Map<SessionId, Set<string>>
  current: Notification | null
}

export function NotificationObserver({ openSession, useSessions, useSessionStatus, usePanelInfo }: ObserverProps) {
  const list = useSessions((state) => state)
  const status = useSessionStatus((state) => state)
  const panel = usePanelInfo((state) => state)
  const stateRef = useRef<ObserverState>({
    seen: new Set(),
    observedTurns: new Map(),
    observedWaits: new Map(),
    current: null,
  })

  useEffect(() => {
    const s = stateRef.current
    const conversational = isConversationAttended(document.visibilityState, document.hasFocus(), panel.activePanelId)
    const actions: { kind: 'turn' | 'wait'; session: SessionId; title: string; body: string }[] = []
    for (const id of list.ids) {
      const row = list.byId[id]
      if (row === undefined) continue
      const firstSight = !s.seen.has(row.id)
      const waits = s.observedWaits.get(row.id) ?? new Set()
      const result = decideSession({
        excluded: row.origin === 'subagent',
        conversational,
        inMainView: (row.retainedBy.mainView ?? 0) > 0,
        title: row.displayTitle,
        lastTurn: row.projectionValues?.notifyTurn ?? null,
        pending: status.get(row.id)?.pendingInteraction ?? null,
        observedTurn: s.observedTurns.get(row.id) ?? 0,
        observedWaitKeys: waits,
      })
      s.observedTurns.set(row.id, result.observedTurn)
      if (waits.size > 0) s.observedWaits.set(row.id, waits)
      if (firstSight) {
        s.seen.add(row.id)
        continue
      }
      if (result.action !== null) actions.push({ ...result.action, session: row.id })
    }
    const ids = new Set(list.ids)
    for (const id of s.seen) if (!ids.has(id)) s.seen.delete(id)
    for (const id of [...s.observedTurns.keys()]) if (!ids.has(id)) s.observedTurns.delete(id)
    for (const id of [...s.observedWaits.keys()]) if (!ids.has(id)) s.observedWaits.delete(id)

    const action = actions.find((entry) => entry.kind === 'wait') ?? actions[0]
    if (action === undefined) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    s.current?.close()
    const notification = new Notification(action.title, { body: action.body })
    notification.onclick = () => {
      window.focus()
      openSession(action.session)
      notification.close()
    }
    s.current = notification
  }, [list, status, panel, openSession])

  return null
}
