import { useContext, useEffect, useState, createContext, ReactNode } from 'react'
import {
  ConversationContextInterface,
  MessagesInterface,
  ErrorInterface,
  HistoryInterface,
  ConversationsInterface,
  addConversationInterface
} from '../types/common.model.ts'
import { useSocketContext } from './SocketContext.tsx'
import useChatServices from '../services/useChatServices.ts'
import useConversationUtils from '../utils/useConversationUtils.ts'

const ConversationContext = createContext({} as ConversationContextInterface)

export function useConversationsContext() {
  return useContext(ConversationContext)
}

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const { socketId, socket } = useSocketContext()
  const [recipient, setRecipient] = useState<number | null>(null)
  const [group, setGroup] = useState<number | null>(null)
  const [messages, setMessages] = useState<MessagesInterface[]>([])
  const [conversations, setConversations] = useState<ConversationsInterface[]>([])

  const { getHistory } = useChatServices()

  const { changeConversationReadStatus } = useConversationUtils()

  useEffect(() => {
    if (socket) {
      /* eslint-disable  */
      socket.on('changingStatus', (data: any) => {
        const updatedConversations = conversations.map((conversation) =>
          conversation.otherUser?.toString() === data.userId.toString()
            ? { ...conversation, status: data.status }
            : conversation
        )
        setConversations(updatedConversations)
      })
      /* eslint-enable  */

      return () => {
        socket.off('changingStatus')
      }
    }
  }, [socket, conversations])

  useEffect(() => {
    setConversations([])
  }, [socket])

  useEffect(() => {
    if (recipient || group) {
      const history = async () => {
        try {
          const res = await getHistory(recipient, group)
          const newMessages = res.map((data: HistoryInterface) => {
            const fromMe = data.senderId.toString() === socketId?.toString()
            const senderName = fromMe ? 'Ty' : data.senderName
            return {
              id: data.id,
              sender: data.senderId,
              text: data.message,
              senderName: senderName,
              fromMe: fromMe,
              file: data.file,
              fileData: data.fileData,
              fileName: data.fileName,
              filePrefixData: data.filePrefixData
            }
          })
          setMessages(newMessages)
        } catch (err) {
          alert((err as ErrorInterface).response.data.message)
        }
      }

      history()
    }
  }, [recipient, group])

  const sortConversations = async () => {
    if (conversations.length > 0) {
      const newConversations = conversations.sort(
        (a: ConversationsInterface, b: ConversationsInterface) => b.lastMessageId - a.lastMessageId
      )
      setConversations(newConversations)
    }
  }

  useEffect(() => {
    sortConversations()
  }, [conversations])

  const addConversation = (data: addConversationInterface) => {
    let read = data.read
    data.groupId === group ? (read = 1) : data.otherUser === recipient ? (read = 1) : null
    const newArray = [
      ...conversations,
      {
        lastMessageId: data.lastMessageId,
        groupId: data.groupId,
        groupName: data.groupName,
        read: read,
        pfp: data.pfp,
        otherUser: data.otherUser,
        userName: data.userName,
        status: data.status
      }
    ]

    setConversations(newArray)
  }

  const removeConversation = ({ group }: { group?: number }) => {
    if (group) {
      const newConversations = conversations.filter(
        (conversation) => conversation.groupId !== group
      )
      setConversations(newConversations)
      setConversation({})
    }
    return
  }

  const setConversation = ({ recipient, group }: { recipient?: number; group?: number }) => {
    if (recipient) {
      setRecipient(recipient)
      setGroup(null)
    } else if (group) {
      setGroup(group)
      setRecipient(null)
    } else {
      setGroup(null)
      setRecipient(null)
    }
    if (recipient || group) {
      const newConversations: ConversationsInterface[] = []
      conversations.map((convo) => {
        if (
          (convo.groupId?.toString() === group?.toString() && group !== undefined) ||
          (convo.otherUser?.toString() === recipient?.toString() && recipient !== undefined)
        ) {
          newConversations.push({ ...convo, read: 1 })
          changeConversationReadStatus({
            otherUser: recipient?.toString() || '',
            groupId: group?.toString(),
            read: 1
          })
        } else {
          newConversations.push(convo)
        }
      })
      setConversations(newConversations)
    }
  }

  const rename = async (data: {
    groupId: number | undefined
    userId: number | undefined
    name: string
  }) => {
    const newArray: ConversationsInterface[] = []
    conversations.map((convo) => {
      if (convo.groupId === data.groupId && data.groupId !== undefined) {
        newArray.push({ ...convo, groupName: data.name })
      } else if (convo.otherUser === data.userId && data.userId !== undefined) {
        newArray.push({ ...convo, userName: data.name })
      } else {
        newArray.push(convo)
      }
    })
    setConversations(newArray)
  }

  return (
    <ConversationContext.Provider
      value={{
        setConversation,
        setConversations,
        rename,
        conversations,
        messages,
        setMessages,
        recipient,
        group,
        addConversation,
        removeConversation
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}
