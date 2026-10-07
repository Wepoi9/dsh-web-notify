import { useState } from 'react'
import { COPY } from './copy.ts'

type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

function readPermission(): PermissionState {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

export function SettingsRow() {
  const [permission, setPermission] = useState<PermissionState>(readPermission)

  const request = async () => {
    try {
      setPermission(await Notification.requestPermission())
    } catch {
      setPermission(readPermission())
    }
  }

  const test = () => {
    new Notification(COPY.testTitle, { body: COPY.testBody })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px' }}>
      <div>
        <div style={{ fontWeight: 500 }}>{COPY.settingsTitle}</div>
        <div style={{ fontSize: '0.85em', opacity: 0.65 }}>{COPY.settingsDescription}</div>
      </div>
      {permission === 'default' && (
        <button type="button" onClick={() => void request()}>
          {COPY.requestPermission}
        </button>
      )}
      {permission === 'granted' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ opacity: 0.65 }}>{COPY.granted}</span>
          <button type="button" onClick={test}>
            {COPY.testNotification}
          </button>
        </div>
      )}
      {permission === 'denied' && <span style={{ opacity: 0.65 }}>{COPY.denied}</span>}
      {permission === 'unsupported' && <span style={{ opacity: 0.65 }}>{COPY.unsupported}</span>}
    </div>
  )
}
