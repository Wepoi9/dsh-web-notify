import test from 'node:test'
import assert from 'node:assert/strict'
import { decideSession, isConversationAttended } from '../src/client/notify.ts'

const base = {
  conversational: false,
  inMainView: false,
  title: 'テストセッション',
  lastTurn: null,
  pending: null,
  observedTurn: 0,
  observedWaitKeys: new Set(),
}

test('turn end notifies once per new turn for completed/blocked/error only; suppressed while viewing the session', () => {
  let r = decideSession({ ...base, lastTurn: { turn: 1, reason: 'completed' } })
  assert.equal(r.action.kind, 'turn')
  assert.equal(r.action.title, 'テストセッション · 完了')
  assert.equal(r.action.body, '処理が完了しました')
  assert.equal(r.observedTurn, 1)

  assert.equal(decideSession({ ...base, observedTurn: 1, lastTurn: { turn: 1, reason: 'completed' } }).action, null)

  r = decideSession({ ...base, observedTurn: 1, lastTurn: { turn: 2, reason: 'max-tokens' } })
  assert.equal(r.action, null)
  assert.equal(r.observedTurn, 2)

  r = decideSession({ ...base, observedTurn: 1, lastTurn: { turn: 2, reason: 'aborted' } })
  assert.equal(r.action, null)
  assert.equal(r.observedTurn, 2)

  r = decideSession({ ...base, observedTurn: 2, lastTurn: { turn: 3, reason: 'blocked' } })
  assert.equal(r.action.kind, 'turn')
  assert.equal(r.action.title, 'テストセッション · ブロック')

  r = decideSession({
    ...base,
    observedTurn: 3,
    conversational: true,
    inMainView: true,
    lastTurn: { turn: 4, reason: 'error' },
  })
  assert.equal(r.action, null)
  assert.equal(r.observedTurn, 4)

  r = decideSession({ ...base, excluded: true, observedTurn: 4, lastTurn: { turn: 5, reason: 'completed' } })
  assert.equal(r.action, null)
  assert.equal(r.observedTurn, 4)
})

test('conversation is attended only when visible, focused, and showing the conversation panel', () => {
  assert.equal(isConversationAttended('visible', true, null), true)
  assert.equal(isConversationAttended('visible', false, null), false)
  assert.equal(isConversationAttended('hidden', false, null), false)
  assert.equal(isConversationAttended('visible', true, 'plugins'), false)

  const currentTurn = { turn: 1, reason: 'completed' }
  const attended = isConversationAttended('visible', true, null)
  assert.equal(decideSession({ ...base, conversational: attended, inMainView: true, lastTurn: currentTurn }).action, null)

  const unfocused = isConversationAttended('visible', false, null)
  assert.equal(decideSession({ ...base, conversational: unfocused, inMainView: true, lastTurn: currentTurn }).action.kind, 'turn')

  const hidden = isConversationAttended('hidden', false, null)
  assert.equal(decideSession({ ...base, conversational: hidden, inMainView: true, lastTurn: currentTurn }).action.kind, 'turn')

  const otherSession = isConversationAttended('visible', true, null)
  assert.equal(decideSession({ ...base, conversational: otherSession, inMainView: false, lastTurn: currentTurn }).action.kind, 'turn')

  const globalPanel = isConversationAttended('visible', true, 'plugins')
  assert.equal(decideSession({ ...base, conversational: globalPanel, inMainView: true, lastTurn: currentTurn }).action.kind, 'turn')

  const waitKeys = new Set()
  assert.equal(
    decideSession({
      ...base,
      conversational: attended,
      inMainView: true,
      pending: { key: 'focused-wait', kind: 'approval' },
      observedWaitKeys: waitKeys,
    }).action,
    null,
  )
  assert.equal(
    decideSession({
      ...base,
      conversational: unfocused,
      inMainView: true,
      pending: { key: 'unfocused-wait', kind: 'question' },
      observedWaitKeys: waitKeys,
    }).action.kind,
    'wait',
  )
})

test('wait notifications dedupe by key: new keys notify once, resolve clears, waits win over turns', () => {
  const keys = new Set()
  let r = decideSession({ ...base, pending: { key: 'k1', kind: 'approval' }, observedWaitKeys: keys })
  assert.equal(r.action.kind, 'wait')
  assert.equal(r.action.title, 'テストセッション · 承認待ち')
  assert.equal(r.action.body, '操作を待っています')
  assert.ok(keys.has('k1'))

  assert.equal(
    decideSession({ ...base, pending: { key: 'k1', kind: 'approval' }, observedWaitKeys: keys }).action,
    null,
  )

  r = decideSession({ ...base, pending: { key: 'k2', kind: 'question' }, observedWaitKeys: keys })
  assert.equal(r.action.kind, 'wait')
  assert.equal(r.action.title, 'テストセッション · 質問待ち')

  r = decideSession({
    ...base,
    lastTurn: { turn: 1, reason: 'completed' },
    pending: { key: 'k3', kind: 'plan-review' },
    observedWaitKeys: keys,
  })
  assert.equal(r.action.kind, 'wait')
  assert.equal(r.action.title, 'テストセッション · 計画レビュー待ち')
  assert.equal(r.observedTurn, 1)

  r = decideSession({ ...base, observedWaitKeys: keys })
  assert.equal(r.action, null)
  assert.equal(keys.size, 0)

  r = decideSession({ ...base, pending: { key: 'k1', kind: 'approval' }, observedWaitKeys: keys })
  assert.equal(r.action.kind, 'wait')
})
