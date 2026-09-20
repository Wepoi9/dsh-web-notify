import { z } from 'zod'

export const notifyTurnStateSchema = z.object({
  openTurn: z.number().int().nonnegative().nullable(),
  last: z
    .object({ turn: z.number().int().nonnegative(), reason: z.string() })
    .nullable(),
})

export const notifyTurnViewSchema = z
  .object({ turn: z.number().int().nonnegative(), reason: z.string() })
  .nullable()

export function initNotifyTurnState() {
  return { openTurn: null, last: null }
}

export function applyNotifyTurnEvent(state, event) {
  if (event.type === 'turn/start') return { ...state, openTurn: event.data.turn }
  if (event.type === 'turn/end' && state.openTurn === event.data.turn) {
    return {
      ...state,
      openTurn: null,
      last: { turn: event.data.turn, reason: event.data.reason.kind },
    }
  }
  return state
}

export function notifyTurnView(state) {
  return state.last
}

export const notifyTurnDefinition = {
  key: 'notifyTurn',
  stateSchema: notifyTurnStateSchema,
  stateVersion: 1,
  init: initNotifyTurnState,
  apply: applyNotifyTurnEvent,
  wire: {
    viewSchema: notifyTurnViewSchema,
    view: notifyTurnView,
  },
}
