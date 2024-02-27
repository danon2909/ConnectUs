import axios from 'axios'

export default function useChatServices() {
  const url = `${window.location.protocol}//${import.meta.env.VITE_SERVER_IP}:${
    import.meta.env.VITE_SERVER_PORT
  }`

  const getHistory = async (recipient: number | null, group: number | null, offset?: number) => {
    const res = await axios.post(
      `${url}/api/getHistory`,
      { recipient: recipient, group: group, offset: offset },
      { withCredentials: true }
    )
    return res.data
  }

  const sendFile = (
    fileName: string,
    fileData: string,
    recipient: number | null,
    group: number | null,
    prefix: string
  ) => {
    axios.post(
      `${url}/api/sendFile`,
      {
        fileName,
        fileData,
        recipient: recipient,
        group: group,
        prefix: prefix
      },
      { withCredentials: true }
    )
  }

  const getFile = async (messageId?: number) => {
    const res = await axios.post(
      `${url}/api/getFile`,
      { messageId: messageId },
      { withCredentials: true }
    )
    return res.data
  }

  const getConversations = async () => {
    const res = await axios.get(`${url}/api/getConversations`, { withCredentials: true })
    return res.data
  }

  return { getHistory, sendFile, getFile, getConversations }
}
