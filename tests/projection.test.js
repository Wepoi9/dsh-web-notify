import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyNotifyTurnEvent,
  initNotifyTurnState,
  notifyTurnDefinition,
  notifyTurnView,
  notifyTurnViewSchema,
} from '../src/projection.js'

test('turn/start and matching turn/end fold into last; mismatched or unrelated events keep the reference', () => {
  const state = initNotifyTurnState()
  assert.deepEqual(state, { openTurn: null, last: null })

  const opened = applyNotifyTurnEvent(state, { type: 'turn/start', data: { turn: 1 } })
  assert.equal(opened.openTurn, 1)
  assert.equal(opened.last, null)

  const ended = applyNotifyTurnEvent(opened, {
    type: 'turn/end',
    data: { turn: 1, reason: { kind: 'completed' } },
  })
  assert.equal(ended.openTurn, null)
  assert.deepEqual(ended.last, { turn: 1, reason: 'completed' })

  assert.equal(
    applyNotifyTurnEvent(ended, { type: 'turn/end', data: { turn: 1, reason: { kind: 'error' } } }),
    ended,
  )
  assert.equal(applyNotifyTurnEvent(ended, { type: 'tool/call', data: { tool: 'read' } }), ended)

  const opened2 = applyNotifyTurnEvent(ended, { type: 'turn/start', data: { turn: 2 } })
  const ended2 = applyNotifyTurnEvent(opened2, {
    type: 'turn/end',
    data: { turn: 2, reason: { kind: 'max-tokens' } },
  })
  assert.deepEqual(ended2.last, { turn: 2, reason: 'max-tokens' })
})

test('wire view exposes last and passes viewSchema', () => {
  const state = { openTurn: null, last: { turn: 3, reason: 'error' } }
  const view = notifyTurnView(state)
  assert.deepEqual(view, { turn: 3, reason: 'error' })
  assert.deepEqual(notifyTurnViewSchema.parse(view), view)
  assert.equal(notifyTurnViewSchema.parse(null), null)
  assert.equal(notifyTurnDefinition.key, 'notifyTurn')
  assert.equal(notifyTurnDefinition.stateVersion, 1)
  assert.equal(notifyTurnDefinition.wire.view, notifyTurnView)
})
