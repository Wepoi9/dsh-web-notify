import { NotificationObserver } from './NotificationObserver.tsx'
import { SettingsRow } from './SettingsRow.tsx'

export const inject = ['slots', 'uiWorkspace']

interface SlotsApi {
  inject(key: string, factory: () => void): void
  register(options: Record<string, unknown>, component: unknown): void
}

interface WorkspaceApi {
  openSession(sessionId: string): void
}

export function apply(ctx: { slots: SlotsApi; uiWorkspace: WorkspaceApi }) {
  ctx.slots.inject('shell.overlay', () => {
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'web-notify',
        inject: () => ({ openSession: (sessionId: string) => ctx.uiWorkspace.openSession(sessionId) }),
      },
      NotificationObserver,
    )
  })
  ctx.slots.inject('settings.general.item', () => {
    ctx.slots.register({ name: 'settings.general.item', id: 'web-notify', order: 100 }, SettingsRow)
  })
}
