import { notifyTurnDefinition } from './projection.js'

export const name = 'dsh-web-notify'

export const inject = ['sessionProjections']

export function apply(ctx) {
  ctx.sessionProjections.register(notifyTurnDefinition)
}
