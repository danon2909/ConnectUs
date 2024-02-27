import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSocketContext } from '../context/SocketContext'

export default function UseUserPanelServices() {
  const url = `${window.location.protocol}//${import.meta.env.VITE_SERVER_IP}:${
    import.meta.env.VITE_SERVER_PORT
  }`
  const navigate = useNavigate()
  const { socket } = useSocketContext()
  const changePassword = async (newPassword: string, oldPassword: string) => {
    const res = await axios.post(
      `${url}/api/changePassword`,
      {
        newPassword: newPassword,
        oldPassword: oldPassword
      },
      { withCredentials: true }
    )
    return res.data
  }

  const getUserPfp = async (id?: number) => {
    const res = await axios.post(
      `${url}/api/getPfp`,
      {
        userId: id
      },
      { withCredentials: true }
    )
    return res.data
  }

  const changePfp = async (
    pfp: File | undefined,
    setPfp: React.Dispatch<React.SetStateAction<string | undefined>>
  ) => {
    return new Promise((resolve, reject) => {
      if (!pfp) {
        reject('Nie podano pliku')
        return
      }
      const reader = new FileReader()
      reader.readAsDataURL(pfp)

      reader.onload = async () => {
        const resultArray = reader.result?.toString().split(',')
        if (!resultArray?.[0].startsWith('data:image')) {
          reject('Podano inny plik niż zdjęcie lub nie obsługiwany format')
          return
        }
        if (resultArray && resultArray.length === 2) {
          const fileData = resultArray[1]
          try {
            const res = await axios.post(
              `${url}/api/changePfp`,
              { fileData: fileData, name: pfp.name },
              { withCredentials: true }
            )
            if (res.status === 200) {
              setPfp(resultArray?.[1])
              resolve('')
            }
          } catch (err: any) {
            reject(err.response.data.data)
          }
        }
      }
    })
  }

  const changePersonalsQuery = async (firstName: string, lastName: string) => {
    const res = await axios.post(
      `${url}/api/changeName`,
      { firstName: firstName, lastName: lastName },
      { withCredentials: true }
    )
    return res.data
  }

  const logoutQuery = async () => {
    axios.get(`${url}/api/logout`, { withCredentials: true })
    navigate('/')
    socket?.disconnect()
  }

  return { changePassword, getUserPfp, changePfp, changePersonalsQuery, logoutQuery }
}
