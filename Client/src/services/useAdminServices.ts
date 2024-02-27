import { Dispatch, SetStateAction } from 'react'
import axios from 'axios'

export default function useAdminServices() {
  const url = `${window.location.protocol}//${import.meta.env.VITE_SERVER_IP}:${
    import.meta.env.VITE_SERVER_PORT
  }`

  const getAllBackups = async (setFiles: Dispatch<SetStateAction<string[]>>) => {
    const res = await axios.get(`${url}/api/getAllBackups`, { withCredentials: true })
    if (!res.data.sortedFiles) return
    const setArray = res.data.sortedFiles.map((file: { name: string; modifiedTime: Date }) => {
      return [file.name, file.modifiedTime]
    })
    setFiles(setArray)
    return res.data
  }

  const installBackup = async (backup: string) => {
    const res = await axios.post(
      `${url}/api/installBackup`,
      { backup: backup },
      { withCredentials: true }
    )
    return res.data
  }

  const createBackupService = async () => {
    await axios.get(`${url}/api/createBackup`, { withCredentials: true })
    return
  }

  const getCount = async (
    setUserCount: Dispatch<SetStateAction<number>>,
    setGroupCount: Dispatch<SetStateAction<number>>
  ) => {
    const res = await axios.get(`${url}/api/getCount`, { withCredentials: true })
    setGroupCount(res.data.groups)
    setUserCount(res.data.users)
  }

  const deleteQuery = async ({
    userId,
    groupId
  }: {
    userId: string | undefined
    groupId: string | undefined
  }) => {
    if (!userId && !groupId) return
    axios.post(
      `${url}/api/delete`,
      {
        groupId: groupId,
        userId: userId
      },
      { withCredentials: true }
    )
  }

  return { getAllBackups, installBackup, createBackupService, getCount, deleteQuery }
}
