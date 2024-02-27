import { ConversationsInterface } from '../types/common.model.ts'
import { useConversationsContext } from '../context/ConversationContext'
import chatServices from '../services/useChatServices.ts'

export default function useConversationListUtils() {
  const { setConversations, setConversation, group, recipient, conversations } =
    useConversationsContext()

  const { getConversations } = chatServices()

  const getUserConversations = async () => {
    const gotConversations = await getConversations()
    if (gotConversations.length > 0) {
      const newConversations = gotConversations.sort(
        (a: ConversationsInterface, b: ConversationsInterface) => b.lastMessageId - a.lastMessageId
      )
      setConversations(newConversations)
    }
  }

  const deleteConversation = async (data: { groupId?: string; userId?: string }) => {
    const filteredConversations = conversations.filter(
      (convo) =>
        (convo.groupId?.toString() !== data.groupId && data.groupId !== undefined) ||
        (convo.otherUser?.toString() !== data.userId && data.userId !== undefined)
    )
    if (recipient?.toString() === data.userId) {
      setConversation({ recipient: undefined, group: undefined })
    } else if (group?.toString() === data.groupId) {
      setConversation({ recipient: undefined, group: undefined })
    }
    setConversations(filteredConversations)
  }

  return { getUserConversations, deleteConversation }
}
