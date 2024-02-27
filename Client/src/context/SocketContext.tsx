import { useEffect, useState, useContext, createContext, ReactNode } from 'react'
import io, { Socket } from 'socket.io-client'
import { SocketContextInterface } from '../types/common.model'
import useLocalStorage from '../hooks/useLocalStorage'

const SocketContext = createContext({} as SocketContextInterface)

export function useSocketContext() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | undefined>()
  const [socketId, setSocketId] = useState<string | undefined>()
  const [muteNotifications] = useLocalStorage('muteNotifications')
  useEffect(() => {
    if (socketId) {
      const newSocket = io(
        `${window.location.protocol}//${import.meta.env.VITE_SERVER_IP}:${
          import.meta.env.VITE_SOCKET_PORT
        }`,
        {
          withCredentials: true
        }
      )

      setSocket(newSocket)

      newSocket?.emit('change-status', {
        status: muteNotifications ? 'dnd' : 'Online'
      })

      return () => {
        newSocket.close()
      }
    }
  }, [socketId])

  return (
    <SocketContext.Provider value={{ socket, socketId, setSocketId }}>
      {children}
    </SocketContext.Provider>
  )
}
