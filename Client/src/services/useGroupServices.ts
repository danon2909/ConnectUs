import axios from 'axios'
import { useConversationsContext } from '../context/ConversationContext'

export default function useGroupServices() {
  const url = `${window.location.protocol}//${import.meta.env.VITE_SERVER_IP}:${
    import.meta.env.VITE_SERVER_PORT
  }`
  const { group, rename } = useConversationsContext()

  const changeName = async (name: string) => {
    await axios.post(
      `${url}/api/changeGroupName`,
      { name: name, group: group },
      { withCredentials: true }
    )
    rename({ groupId: group || undefined, userId: undefined, name: name })
  }

  const getUserList = async () => {
    const res = await axios.post(
      `${url}/api/getGroupMembers`,
      { group: group },
      { withCredentials: true }
    )
    return res.data
  }

  return { changeName, getUserList }
}
