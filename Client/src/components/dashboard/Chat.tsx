import { useEffect, useState, FormEvent, useRef } from 'react'
import {
  MessageDataInterface,
  MessagesInterface,
  HistoryInterface,
  ErrorInterface
} from '../../types/common.model'
import { useConversationsContext } from '../../context/ConversationContext'
import { useSocketContext } from '../../context/SocketContext'
import useConversationUtils from '../../utils/useConversationUtils'
import useChatUtils from '../../utils/useChatUtils'
import useChatServices from '../../services/useChatServices.ts'
import Common from '../../utils/common.ts'
import Message from './Message'
import CreateGroupButton from './accessories/CreateGroupButton'
import Settings from './account/Settings'
import SendMessageInput from './accessories/SendMessageInput'
import '../../assets/chatStyle.scss'
import { PulseLoader } from 'react-spinners'
import Alert from '../Alert.tsx'

export default function Chat() {
  const [text, setText] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [off, setOff] = useState(0)
  const [sentMessages, setSentMessages] = useState(0)
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const { socket, socketId } = useSocketContext()

  const { recipient, messages, group, setMessages, conversations } = useConversationsContext()

  const {
    handleAddFile,
    handleFiles,
    deleteFile,
    addMessageToConversation,
    removeMessageFromConversation,
    files,
    fileSizeAlert,
    setFileSizeAlert
  } = useChatUtils()
  const { setFirst, updateConversations, changeConversationReadStatus } = useConversationUtils()
  const { playNotificationSound } = Common()

  const { getFile, getHistory } = useChatServices()

  /* eslint-disable */
  const receiveMessageHandler = async (data: MessageDataInterface) => {
    if (data.sender === socketId) {
      handleIncomingMessage(data)
      return
    }
    if (parseInt(data.sender) !== recipient) {
      const isGroupMessage = data.groupId && parseInt(data.groupId) === group

      if (isGroupMessage && data.groupId) {
        setFirst({ groupId: parseInt(data.groupId) })
        handleIncomingMessage(data)
      } else {
        playNotificationSound()
        updateConversations(data)
        return
      }
    } else {
      if (data.groupId) {
        playNotificationSound()
        updateConversations(data)
        return
      }
      handleIncomingMessage(data)
    }

    changeConversationReadStatus({
      otherUser: data.sender.toString(),
      groupId: data.groupId?.toString(),
      read: 1
    })
  }

  const deleteMessageHandler = (id: { id: number }) => {
    removeMessageFromConversation(id)
    if (messages.find((message) => message.id === id.id)) {
      setSentMessages(sentMessages - 1)
    }
  }

  /* eslint-enable */

  useEffect(() => {
    if (!socket) return

    socket.on('receive-message', receiveMessageHandler)
    socket.on('delete-message', deleteMessageHandler)

    return () => {
      socket.off('receive-message')
      socket.off('delete-message')
    }
  }, [
    socket,
    addMessageToConversation,
    receiveMessageHandler,
    deleteMessageHandler,
    recipient,
    group
  ])

  const handleIncomingMessage = async (data: MessageDataInterface) => {
    if (data.file) {
      const { fileData, fileName, filePrefix } = await getFile(data.id)
      addMessageToConversation(
        data.id,
        parseInt(data.sender),
        data.text,
        data.senderName,
        true,
        fileData,
        fileName,
        filePrefix
      )
    } else {
      addMessageToConversation(data.id, parseInt(data.sender), data.text, data.senderName, false)
    }
    if (data.sender === socketId) setScrollHeight(0)
    setSentMessages(sentMessages + 1)
    setRefresh(!refresh)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!socket || (!recipient && !group) || !socketId) return

    handleFiles()

    if (text !== '') {
      const messageData = {
        recipient: recipient?.toString(),
        groupId: group?.toString(),
        text: text
      }
      if (recipient) {
        setFirst({ userId: recipient })
      } else if (group) {
        setFirst({ groupId: group })
      }
      socket.emit('send-message', messageData)
      setText('')
    }
  }

  const showMessage = (m: MessagesInterface, i: number) => {
    return Message(m, i, socket, messages?.[i - 1] ? messages[--i].senderName : undefined)
  }

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  const getAndSetMessages = async (offset2?: number) => {
    try {
      const offset = (off + 1) * 20 + sentMessages
      setLoading(true)
      const res = await getHistory(recipient, group, offset2 ? offset2 : offset)
      if (res.length === 0) return setLoading(false)
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

      setMessages([...newMessages, ...messages])
      setLoading(false)
    } catch (err) {
      alert((err as ErrorInterface).response.data.message)
    }
  }

  const handleScroll = async () => {
    if (chatRef.current) {
      setScrollHeight(chatRef.current.scrollHeight - chatRef.current.scrollTop)
      if (chatRef.current.scrollTop === 0) {
        if (!messages?.length) return
        setOff(off + 1)
        getAndSetMessages()
      }
    }
  }

  useEffect(() => {
    setScrollHeight(0)
    setOff(0)
    setSentMessages(0)
  }, [recipient, group])

  useEffect(() => {
    if (!chatRef.current || !messages) return

    const isScrolledToBottom =
      chatRef.current.scrollHeight - chatRef.current.scrollTop <= chatRef.current.clientHeight + 200

    if (!scrollHeight && isScrolledToBottom) {
      scrollToBottom()
    } else {
      chatRef.current.scrollTop = chatRef.current.scrollHeight - scrollHeight
    }

    if (messages.length < 20 && sentMessages < 0) getAndSetMessages(messages.length)

    chatRef.current?.removeEventListener('scroll', handleScroll)

    const timeout = setTimeout(() => {
      chatRef.current?.addEventListener('scroll', handleScroll)
    }, 100)

    return () => {
      clearTimeout(timeout)
      chatRef.current?.removeEventListener('scroll', handleScroll)
    }
  }, [messages, chatRef])

  const showName = () => {
    const convo = conversations.find(
      (conversation) =>
        (conversation.otherUser === recipient && recipient) ||
        (conversation.groupId === group && group)
    )
    const text = convo?.groupId ? convo.groupName : convo?.userName
    return text
  }

  useEffect(() => {
    const userName = showName()
    userName
      ? (document.title = `ConnectUs - ${userName}`)
      : (document.title = `ConnectUs - Utwórz konwersację`)
  }, [recipient, group, messages])

  return (
    <div className="chat">
      {fileSizeAlert && (
        <Alert
          header="Błąd"
          variant="danger"
          message="Plik nie może przekraczać 50mb"
          alertFunction={() => {
            setFileSizeAlert(!fileSizeAlert)
          }}
        />
      )}
      <div className="header">
        <h4>{showName()}</h4>
        <div className="group">{recipient ? <CreateGroupButton /> : <Settings />}</div>
      </div>

      <div className="messages" ref={chatRef}>
        <div className="text-center">
          {loading ? (
            <PulseLoader size={10} loading={loading} color="#5d5d5d" style={{ opacity: 0.2 }} />
          ) : null}
        </div>
        {messages?.map((m: MessagesInterface, i: number) => showMessage(m, i))}
      </div>
      <SendMessageInput
        handleScroll={handleScroll}
        handleSubmit={handleSubmit}
        handleAddFile={handleAddFile}
        text={text}
        setText={setText}
        deleteFile={deleteFile}
        files={files}
      />
    </div>
  )
}
