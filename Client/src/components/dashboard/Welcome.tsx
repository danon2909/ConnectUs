import { useEffect, useState } from 'react'
import '../../assets/welcomeStyle.scss'
import { useUserSearch } from '../../hooks/useUserSearch'
import { UserFilterInterface } from '../../types/common.model'
import userIcon from '../../assets/images/user.svg'

interface WelcomeProps {
  firstName: string
  sentMonthMessages: number
  receivedMonthMessages: number
}

export default function Welcome({
  firstName,
  sentMonthMessages,
  receivedMonthMessages
}: WelcomeProps) {
  const { searchUser, showResults, handleChange, changeConversation } = useUserSearch()
  const [sidebarActive, setSidebarActive] = useState(false)

  useEffect(() => {
    document.title = 'ConnectUs - Strona główna'
  }, [])

  const switchNavbar = () => {
    setSidebarActive(!sidebarActive)
  }

  return (
    <div className="welcome__container">
      <div className="header">
        <h2>Witaj</h2>
        <h1>{firstName}</h1>
        <div className="line"></div>
      </div>
      <div className={`search__container ${sidebarActive ? 'active' : ''}`}>
        <h2>Z kim chcesz porozmawiać? </h2>
        <div className="searchbar">
          <input
            type="text"
            placeholder="Wyszukaj osobę"
            value={searchUser}
            onChange={handleChange}
            className="searchbar"
          />
        </div>
        <div className="user__list">
          {showResults.map((user: UserFilterInterface) => (
            <form
              className="user__item"
              key={user.id}
              data-id={user.id}
              onSubmit={changeConversation}
              onClick={switchNavbar}
            >
              <button>
                <div className="pfp icon welcomeSearch">
                  <img src={userIcon} alt="Avatar" />
                </div>
                <div className="user__info">
                  <div className="name">
                    <h4>
                      {user.firstname} {user.lastname}
                    </h4>
                  </div>
                  <div className="status"></div>
                </div>
              </button>
            </form>
          ))}{' '}
        </div>
      </div>
      <div className="stats">
        <h3>W tym miesiącu</h3>
        <div className="stat__left">
          <div className="info">Wysłałeś</div>
          <div className="stat">{sentMonthMessages}</div>
        </div>
        <div className="stat__right">
          <div className="info">Otrzymałeś</div>
          <div className="stat">{receivedMonthMessages}</div>
        </div>
        <h3>Wiadomości</h3>
      </div>
    </div>
  )
}
