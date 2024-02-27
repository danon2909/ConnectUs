import { useState, useEffect } from 'react'
import { UserFilterInterface, MessageDataInterface } from '../../types/common.model'
import { useUserSearch } from '../../hooks/useUserSearch'
import ConversationsList from './ConversationsList'
import '../../assets/sidebarStyle.scss'
import userIcon from '../../assets/images/user.svg'
import { useSocketContext } from '../../context/SocketContext'
import useConversationUtils from '../../utils/useConversationUtils'
import { useConversationsContext } from '../../context/ConversationContext'
import Common from '../../utils/common'

export default function Sidebar() {
  const { searchUser, showResults, handleChange, changeConversation, loading } = useUserSearch()
  const [sidebarActive, setSidebarActive] = useState(false)

  const { socket } = useSocketContext()
  const { conversations, recipient, group } = useConversationsContext()
  const { updateConversations } = useConversationUtils()
  const { playNotificationSound } = Common()

  const switchSideBar = () => {
    setSidebarActive(!sidebarActive)
  }

  useEffect(() => {
    socket?.on('receive-message', (data: MessageDataInterface) => {
      if (!recipient && !group) {
        updateConversations(data)
        playNotificationSound()
      }
    })

    return () => {
      socket?.off('receive-message')
    }
  }, [socket, conversations, recipient, group])

  return (
    <div className="wrap__container">
      <button
        onClick={switchSideBar}
        className={`navSwitch ${sidebarActive ? 'active' : ''}`}
        aria-label="Przełącz panel boczny"
      ></button>
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="groups">
          <div className="header">
            <h3>Konwersacje grupowe</h3>
          </div>
          <div className="group__list" onClick={switchSideBar}>
            <ConversationsList isGroup={true} />
          </div>
        </div>
        <div className="users">
          <div className="header">
            <h3>Prywatne wiadomości</h3>
          </div>
          <div className="convo__list">
            <div className="searchbar">
              <input
                type="text"
                placeholder="Wyszukaj osobę"
                value={searchUser}
                onChange={handleChange}
                className="searchbar"
              />
            </div>
            {!searchUser ? (
              <div onClick={switchSideBar}>
                <ConversationsList isGroup={false} />
              </div>
            ) : (
              <>
                {loading ? (
                  <></>
                ) : (
                  <>
                    {showResults.length === 0 ? (
                      <p className="noMsgAlert">Nic nie znaleziono.</p>
                    ) : (
                      showResults.map((show: UserFilterInterface) => (
                        <form
                          className="user__item"
                          key={show.id}
                          data-id={show.id}
                          onSubmit={changeConversation}
                          onClick={switchSideBar}
                        >
                          <button>
                            <div className="pfp icon">
                              <img src={userIcon} alt="User" />
                            </div>
                            <div className="user__info">
                              <div className="name">
                                <h4>
                                  {show.firstname} {show.lastname}
                                </h4>
                              </div>
                            </div>
                          </button>
                        </form>
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
