import { useEffect } from 'react'
import SignupDialog from '../components/authentication/SignupDialog'

export default function SignupView() {
  useEffect(() => {
    document.title = 'ConnectUs - Rejestracja'
  }, [])

  return (
    <div className="auth">
      <SignupDialog />
    </div>
  )
}
