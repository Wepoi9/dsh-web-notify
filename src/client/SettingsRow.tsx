import { useState } from 'react'

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
    new Notification('DSH通知テスト', { body: '通知は正常に動作しています' })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 16px' }}>
      <div>
        <div style={{ fontWeight: 500 }}>ブラウザ通知</div>
        <div style={{ fontSize: '0.85em', opacity: 0.65 }}>セッションの完了・エラー・操作待ちをOS通知で知らせます</div>
      </div>
      {permission === 'default' && (
        <button type="button" onClick={() => void request()}>
          許可をリクエスト
        </button>
      )}
      {permission === 'granted' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ opacity: 0.65 }}>許可済み</span>
          <button type="button" onClick={test}>
            テスト通知
          </button>
        </div>
      )}
      {permission === 'denied' && <span style={{ opacity: 0.65 }}>拒否済み（ブラウザ設定で変更できます）</span>}
      {permission === 'unsupported' && <span style={{ opacity: 0.65 }}>このブラウザでは非対応</span>}
    </div>
  )
}
