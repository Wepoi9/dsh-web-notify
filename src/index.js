import { notifyTurnDefinition } from './projection.js'

export const name = 'dsh-web-notify'

export const inject = ['sessionProjections']

export async function apply(ctx) {
  await ctx.sessionProjections.register(notifyTurnDefinition)
}
