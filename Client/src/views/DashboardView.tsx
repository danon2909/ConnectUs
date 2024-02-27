import { useEffect, useState, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { useConversationsContext } from '../context/ConversationContext'
import { useSocketContext } from '../context/SocketContext'
import useUserServices from '../services/useUserServices'
import userPanelServices from '../services/useUserPanelServices'
import useLocalStorage from '../hooks/useLocalStorage'
import Chat from '../components/dashboard/Chat'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import Footer from '../components/dashboard/Footer'
import Welcome from '../components/dashboard/Welcome'
import UserPanel from '../components/dashboard/account/UserPanel'
import Common from '../utils/common'
import { GridLoader } from 'react-spinners'

export default function DashboardView() {
  const [avatar, setAvatar] = useState<string | undefined>()
  const [userPanel, setUserPanel] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [sentMonthMessages, setSentMonthMessages] = useState(0)
  const [receivedMonthMessages, setReceivedMonthMessages] = useState(0)
  const [loading, setLoading] = useState(true)

  const { recipient, group } = useConversationsContext()
  const { setSocketId, socket } = useSocketContext()

  const { getUserId } = useUserServices()
  const { getUserPfp } = userPanelServices()
  const { getStatsQuery } = useUserServices()

  const navigate = useNavigate()

  const [muteNotifications, setMuteNotifications] = useLocalStorage('muteNotifications')
  const [colorMode, setColorMode] = useLocalStorage('colorMode')

  const { toggleColorMode } = Common()

  useEffect(() => {
    if (userPanel && (recipient !== null || group !== null)) {
      setUserPanel(false)
    }
  }, [recipient, group])

  const setPersonals = (res: { userId: number; firstName: string; lastName: string }) => {
    setSocketId(res.userId.toString())
    setFirstName(res.firstName)
    setLastName(res.lastName)
  }

  const fetchUserId = async () => {
    try {
      const res = await getUserId()
      res.message === 'nl' ? navigate('/') : setPersonals(res)
    } catch (error) {
      console.error('Error fetching user ID:', error)
    }
  }

  const getPfp = async () => {
    const pfp = await getUserPfp(undefined)
    return pfp.file
  }

  const getAvatar = async () => {
    const pfp = await getPfp()
    setAvatar(pfp)
  }

  const getStats = async () => {
    const { received, sent }: { received: number; sent: number } = await getStatsQuery()
    setReceivedMonthMessages(received)
    setSentMonthMessages(sent)
  }

  useEffect(() => {
    getAvatar()
    fetchUserId()
    toggleColorMode(colorMode)
    getStats()

    socket?.on('redirect', () => {
      navigate('/')
      alert('Twoje konto zostało usunięte')
    })
  }, [socket])

  useEffect(() => {
    setLoading(true)

    const loadListener = () => {
      setLoading(false)
    }

    if (document.readyState === 'complete') {
      setLoading(false)
    } else {
      window.addEventListener('load', loadListener)
    }

    return () => {
      window.removeEventListener('load', loadListener)
      setLoading(false)
    }
  }, [])

  const changeSetting = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.dataset.role === 'notifications') {
      setMuteNotifications(e.target.checked)
      socket?.emit('change-status', {
        status: e.target.checked ? 'dnd' : 'Online'
      })
    } else if (e.target.dataset.role === 'colorMode') {
      const checked = e.target.checked ? 'true' : 'false'
      setColorMode(checked)
      toggleColorMode(checked)
    }
  }

  return (
    <>
      <div className={`spinner__container fullscrean ${loading ? '' : 'hidden'}`}>
        <GridLoader size={20} color="#eef4ed" loading={loading} />
      </div>
      <Container className="main__container dashboard">
        <Navbar
          avatar={avatar}
          firstname={firstName}
          handleChange={setUserPanel}
          muteNotifications={muteNotifications}
        />
        <Sidebar />
        <div className="dashboard__container">
          {!userPanel ? (
            recipient || group ? (
              <Chat />
            ) : (
              <Welcome
                firstName={firstName}
                sentMonthMessages={sentMonthMessages}
                receivedMonthMessages={receivedMonthMessages}
              />
            )
          ) : (
            <UserPanel
              firstName={firstName}
              lastName={lastName}
              avatar={avatar}
              setFirstName={setFirstName}
              setLastName={setLastName}
              changeSetting={changeSetting}
              muteNotifications={muteNotifications}
              colorMode={colorMode}
              setPfp={setAvatar}
            />
          )}
        </div>
        <Footer />
      </Container>
    </>
  )
}
