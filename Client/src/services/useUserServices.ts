import axios from 'axios'
import { userDataInterface } from '../types/common.model.ts'

export default function useUserServices() {
  const url = `${window.location.protocol}//${import.meta.env.VITE_SERVER_IP}:${
    import.meta.env.VITE_SERVER_PORT
  }`
  const pathName = window.location.pathname

  const loginUser = async (userData: userDataInterface) => {
    const res = await axios.post(`${url}${pathName}`, userData, { withCredentials: true })
    return res.data
  }

  const signupUser = async (userData: userDataInterface) => {
    const res = await axios.post(`${url}${pathName}`, userData, { withCredentials: true })
    return res.data
  }

  const getUserId = async () => {
    const res = await axios.get(`${url}/api/getId`, { withCredentials: true })
    return res.data
  }

  const searchUsers = async (searchUser: string) => {
    const res = await axios.post(
      `${url}/api/searchUsers`,
      { user: searchUser },
      { withCredentials: true }
    )
    return res.data
  }

  const searchGroups = async (group: string) => {
    const res = await axios.post(
      `${url}/api/searchGroups`,
      { group: group },
      { withCredentials: true }
    )
    return res.data
  }

  const getStatsQuery = async () => {
    const res = await axios.get(`${url}/api/getStats`, { withCredentials: true })
    return { received: res.data.received[0].Received, sent: res.data.sent[0].Sent }
  }

  return { loginUser, signupUser, getUserId, searchUsers, searchGroups, getStatsQuery }
}
