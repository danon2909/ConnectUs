import { useEffect } from 'react'
import LoginDialog from '../components/authentication/LoginDialog'

export default function AuthenticationView() {
  useEffect(() => {
    document.title = 'ConnectUs - Logowanie'
  }, [])

  return (
    <div className="auth">
      <LoginDialog />
    </div>
  )
}
