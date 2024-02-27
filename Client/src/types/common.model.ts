import { Socket } from 'socket.io-client'
import { Dispatch, SetStateAction } from 'react'

interface ErrorInterface {
  response: {
    data: {
      message: string
    }
  }
}

interface userDataInterface {
  firstname?: string
  lastname?: string
  login: string
  password: string
}

interface MessageDataInterface {
  id: number
  sender: string
  text: string
  senderName: string
  groupId?: string | null
  file?: boolean
}

interface SocketContextInterface {
  socket: Socket | undefined
  socketId: string | undefined
  setSocketId: Dispatch<SetStateAction<string | undefined>>
}

interface MessagesInterface {
  id: number
  sender: number
  text: string
  senderName: string
  fromMe: boolean
  file?: boolean
  fileData?: string
  fileName?: string
  filePrefixData?: string
}

interface ConversationContextInterface {
  setConversation: ({ recipient, group }: { recipient?: number; group?: number }) => void
  setConversations: (conversations: ConversationsInterface[]) => void
  rename: (data: { groupId: number | undefined; userId: number | undefined; name: string }) => void
  conversations: ConversationsInterface[]
  messages: MessagesInterface[]
  setMessages: Dispatch<SetStateAction<MessagesInterface[]>>
  recipient: number | null
  group: number | null
  addConversation: (data: addConversationInterface) => void
  removeConversation: ({ group }: { group?: number }) => void
}

interface ConversationsInterface {
  lastMessageId: number
  read: number
  pfp?: string
  status?: string
  otherUser?: number
  userName?: string
  groupName?: string
  groupId?: number
}

interface HistoryInterface {
  id: number
  message: string
  senderId: number
  senderName: string
  file?: boolean
  fileData?: string
  fileName?: string
  filePrefixData?: string
}

interface userListInterface {
  firstname: string
  lastname: string
  status: string
  pfp: string
  id: number
}

interface UserFilterInterface {
  id: number
  firstname: string
  lastname: string
  pfp: string
}

interface GroupFilterInterface {
  id: number
  groupName: string
}

interface addConversationInterface {
  lastMessageId: number
  read: number
  pfp?: string
  status?: string
  otherUser?: number
  userName?: string
  groupName?: string
  groupId?: number
}

export type {
  ErrorInterface,
  userDataInterface,
  MessageDataInterface,
  SocketContextInterface,
  MessagesInterface,
  HistoryInterface,
  ConversationContextInterface,
  ConversationsInterface,
  userListInterface,
  UserFilterInterface,
  GroupFilterInterface,
  addConversationInterface
}
