import { useEffect, useState } from 'react'
import { useConversationsContext } from '../../context/ConversationContext'
import { useSocketContext } from '../../context/SocketContext'
import useConversationListUtils from '../../utils/useConversationListUtils'
import Conversation from './Conversation'

export default function ConversationsList({ isGroup }: { isGroup: boolean }) {
  const [refresh, setRefresh] = useState(false)

  const { conversations, rename, addConversation } = useConversationsContext()
  const { socket } = useSocketContext()
  const { getUserConversations, deleteConversation } = useConversationListUtils()

  useEffect(() => {
    if (conversations.length === 0) {
      getUserConversations()
    }

    setRefresh(!refresh)
  }, [conversations])

  useEffect(() => {
    if (!socket) return

    socket.on('create-conversation', addConversation)
    socket.on('change-name', rename)
    socket.on('delete-conversation', deleteConversation)

    return () => {
      socket.off('create-conversation')
      socket.off('change-group-name')
      socket.off('delete-conversation')
    }
  }, [socket, addConversation, deleteConversation, rename, conversations])

  return (
    <>
      {conversations.length !== undefined &&
      conversations.length > 0 &&
      (isGroup
        ? conversations.some((convo) => convo.groupId)
        : conversations.some((convo) => convo.otherUser)) ? (
        conversations.map((convo) =>
          isGroup
            ? convo.groupId && <Conversation key={`group-${convo.groupId}`} convo={convo} />
            : convo.otherUser && <Conversation key={`user-${convo.otherUser}`} convo={convo} />
        )
      ) : (
        <div className="noMsgAlert">
          {isGroup ? <p>Nie masz grup.</p> : <p>Nie masz prywatnych wiadomości.</p>}
        </div>
      )}
    </>
  )
}
