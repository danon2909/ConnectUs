import { useState } from 'react'
import { ConversationsInterface, MessageDataInterface } from '../types/common.model'
import { useConversationsContext } from '../context/ConversationContext'
import { useSocketContext } from '../context/SocketContext'
import { useEffect } from 'react'

export default function useConversationUtils() {
  const { conversations, setConversations } = useConversationsContext()
  const { socket } = useSocketContext()
  const [localConversations, setLocalConversations] = useState(conversations)

  useEffect(() => {
    setLocalConversations(conversations)
  }, [conversations])

  const setFirst = ({ groupId, userId }: { groupId?: number; userId?: number }) => {
    if (!groupId && !userId) return
    if (
      !localConversations.find(
        (conversation) =>
          (conversation.otherUser?.toString() === userId?.toString() && userId) ||
          (conversation.groupId?.toString() === groupId?.toString() && groupId)
      )
    ) {
      return
    }
    let maxMessageId: number
    const newConversations: ConversationsInterface[] = []
    localConversations.length > 0
      ? (maxMessageId = localConversations[0].lastMessageId)
      : (maxMessageId = 0)

    if (groupId) {
      localConversations.map((conv) => {
        conv.groupId?.toString() === groupId.toString()
          ? newConversations.push({ ...conv, lastMessageId: maxMessageId + 1 })
          : newConversations.push(conv)
      })
    } else if (userId) {
      localConversations.map((conv) => {
        conv.otherUser?.toString() === userId?.toString()
          ? newConversations.push({ ...conv, lastMessageId: maxMessageId + 1 })
          : newConversations.push(conv)
      })
    }
    setConversations(newConversations)
    return newConversations
  }

  const updateConversations = async (data: MessageDataInterface) => {
    const newConversations: ConversationsInterface[] = []

    const conv = setFirst({
      groupId: parseInt(data.groupId || ''),
      userId: parseInt(data.sender)
    })

    conv?.map((convo) => {
      if (convo.groupId?.toString() === data.groupId && data.groupId) {
        newConversations.push({ ...convo, read: 0 })
      } else if (convo.otherUser?.toString() === data.sender && !data.groupId) {
        newConversations.push({ ...convo, read: 0 })
      } else {
        newConversations.push(convo)
      }
    })
    setConversations(newConversations)
  }

  const changeConversationReadStatus = ({
    otherUser,
    groupId,
    read
  }: {
    otherUser: string
    groupId?: string
    read: number
  }) => {
    socket?.emit('update-conversation-status', {
      otherUser: otherUser,
      groupId: groupId,
      read: read
    })
  }

  return { setFirst, updateConversations, changeConversationReadStatus }
}
