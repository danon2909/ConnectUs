import { FormEvent } from 'react'
import { ConversationsInterface } from '../../types/common.model.ts'
import { useConversationsContext } from '../../context/ConversationContext'
import '../../assets/sidebarStyle.scss'
import groupIcon from '../../assets/images/group-blue.svg'
import bellRead from '../../assets/images/bellread.svg'
import bellUnread from '../../assets/images/bellunread.svg'
import defaultPfp from '../../assets/images/defaultPfp.jpg'

export default function Conversation({ convo }: { convo: ConversationsInterface }) {
  const { setConversation, group, recipient } = useConversationsContext()

  const changeConversation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const dataTarget = (e.target as HTMLElement).dataset
    if (dataTarget.id) {
      if (recipient === parseInt(dataTarget.id)) return
      setConversation({ recipient: parseInt(dataTarget.id) })
    } else if (dataTarget.groupid) {
      if (group === parseInt(dataTarget.groupid)) return
      setConversation({ group: parseInt(dataTarget.groupid) })
    } else {
      setConversation({})
      console.error('Błąd aplikacji')
    }
  }

  if (convo.groupId) {
    return (
      <form
        className={`user__item ${convo.groupId?.toString() === group?.toString() ? 'active' : ''}`}
        data-groupid={convo.groupId}
        onSubmit={changeConversation}
      >
        <button>
          <div className="pfp group-pfp">
            <img src={groupIcon} alt="Grupa" />
          </div>
          <div className="user__info">
            <div className="name">{convo.groupName}</div>
            <div className="status"></div>
          </div>
          <div className="read">
            {convo.read ? (
              <div>
                <img src={bellRead} alt="Przeczytane" />
              </div>
            ) : (
              <div>
                <img src={bellUnread} alt="Nieprzeczytane" />
              </div>
            )}
          </div>
        </button>
      </form>
    )
  } else {
    return (
      <form
        className={`user__item ${
          convo.otherUser?.toString() === recipient?.toString() ? 'active' : ''
        }`}
        data-id={convo.otherUser}
        onSubmit={changeConversation}
      >
        <button>
          <div className="pfp">
            <img src={convo.pfp ? `data:image;base64,${convo.pfp}` : defaultPfp} alt="avatar" />
          </div>
          <div className="user__info">
            <div className="name">
              <h4>{convo.userName}</h4>
              <span
                className={`status ${
                  convo.status === 'Online'
                    ? 'online'
                    : convo.status === 'Nie przeszkadzać'
                    ? 'dnd'
                    : 'offline'
                }`}
              >
                {convo.status}
              </span>
            </div>
            <div className="status"></div>
          </div>
          <div className="read">
            {convo.read ? (
              <div>
                <img src={bellRead} alt="Przeczytane" />
              </div>
            ) : (
              <div>
                <img src={bellUnread} alt="Nieprzeczytane" />
              </div>
            )}
          </div>
        </button>
      </form>
    )
  }
}
