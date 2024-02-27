import { useState, ChangeEvent } from 'react'
import chatServices from '../services/useChatServices'
import { useConversationsContext } from '../context/ConversationContext'
import { useSocketContext } from '../context/SocketContext'

export default function useChatUtils() {
  const [files, setFiles] = useState<File[]>([])
  const [fileSizeAlert, setFileSizeAlert] = useState(false)

  const { group, recipient, messages, setMessages } = useConversationsContext()
  const { socketId } = useSocketContext()

  const handleAddFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target
    const selectedFiles = fileInput.files

    if (selectedFiles) {
      const newFiles: File[] = [...files]
      Array.from(selectedFiles).forEach((file) => {
        if (file) {
          if (file.size > 50000000) {
            setFileSizeAlert(true)
            return fileSizeAlert
            setFileSizeAlert(false)
          }
          newFiles.push(file)
        }
      })
      setFiles(newFiles)
    }

    fileInput.value = ''
  }

  const handleFiles = () => {
    const { sendFile } = chatServices()

    if (!files) return
    if (files.length !== 0) {
      files.map((file: File, index: number) => {
        setTimeout(() => {
          if (!file) return

          const reader = new FileReader()
          reader.readAsDataURL(file)

          reader.onload = async () => {
            const resultArray = reader.result?.toString().split(',')
            const fileName = file.name

            if (resultArray && resultArray.length === 2) {
              const [filePrefixData, fileData] = resultArray
              sendFile(fileName, fileData, recipient, group, filePrefixData)
            }
          }
        }, 500 * index)
      })
    }
    setFiles([])
    return files
  }

  const deleteFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i: number) => index != i))
  }

  const addMessageToConversation = (
    id: number,
    sender: number,
    text: string,
    senderName: string,
    file?: boolean,
    fileData?: string,
    fileName?: string,
    filePrefixData?: string
  ) => {
    if (messages) {
      let fromMe = false
      if (socketId && socketId.toString() === sender.toString()) fromMe = true
      const newMessages = [
        ...messages,
        {
          id: id,
          sender: sender,
          text: text,
          senderName: senderName,
          fromMe: fromMe,
          file,
          fileData,
          fileName,
          filePrefixData
        }
      ]
      setMessages(newMessages)
    }
  }

  const removeMessageFromConversation = (id: { id: number }) => {
    const filteredMessages = messages.filter((message) => message.id !== id.id)
    setMessages(filteredMessages)
  }

  return {
    handleAddFile,
    handleFiles,
    deleteFile,
    addMessageToConversation,
    removeMessageFromConversation,
    files,
    fileSizeAlert,
    setFileSizeAlert
  }
}
