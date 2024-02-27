import { Dispatch, SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import { useConversationsContext } from '../../context/ConversationContext'
import '../../assets/navbarStyle.scss'
import settingsIcon from '../../assets/images/settings.svg'
import logo from '../../assets/images/connectus.svg'
import defaultPfp from '../../assets/images/defaultPfp.jpg'

interface NavbarProps {
  avatar?: string
  firstname?: string
  handleChange: Dispatch<SetStateAction<boolean>>
  muteNotifications: boolean
}

export default function Navbar({
  avatar,
  firstname,
  handleChange,
  muteNotifications
}: NavbarProps) {
  const { setConversation } = useConversationsContext()

  const handleChangeHandler = () => {
    handleChange(true)
    setConversation({})
  }

  const handleLogoClick = () => {
    setConversation({})
    handleChange(false)
  }

  return (
    <div className="dashNavbar">
      <nav className="brand">
        <Link to="/dashboard" onClick={handleLogoClick}>
          <img src={logo} alt="ConnectUs" />
        </Link>
      </nav>
      <nav className="menu__wrapper">
        <Link to="#">
          <div className="icon" onClick={() => handleChangeHandler()}>
            <img src={settingsIcon} alt="settings" />
          </div>
        </Link>
        <nav className="user">
          <div className="user__info" onClick={() => handleChangeHandler()}>
            <span className="name">{firstname}</span>
            <span className={`status ${muteNotifications ? 'dnd' : 'online'}`}>
              {muteNotifications ? 'Nie przeszkadzać ' : 'Online '}
            </span>
          </div>
          <div className="user__avatar" onClick={() => handleChangeHandler()}>
            <img src={avatar ? `data:image;base64,${avatar}` : defaultPfp} alt="imie nazwisko" />
          </div>
        </nav>
      </nav>
    </div>
  )
}
