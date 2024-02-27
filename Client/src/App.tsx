import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginView from './views/LoginView'
import SignupView from './views/SignupView'
import DashboardView from './views/DashboardView'
import AdminView from './views/AdminView'
import { SocketProvider } from './context/SocketContext'
import { ConversationsProvider } from './context/ConversationContext'

function App() {
  return (
    <SocketProvider>
      <ConversationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginView />}></Route>
            <Route path="/signup" element={<SignupView />}></Route>
            <Route path="/dashboard" element={<DashboardView />}></Route>
            <Route path="/admin" element={<AdminView />}></Route>
          </Routes>
        </BrowserRouter>
      </ConversationsProvider>
    </SocketProvider>
  )
}

export default App
