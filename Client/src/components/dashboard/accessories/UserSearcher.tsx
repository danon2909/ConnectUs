import React from 'react'
import { MouseEvent } from 'react'
import { ConversationsInterface } from '../../../types/common.model'
import { useConversationsContext } from '../../../context/ConversationContext'

export default function UserSearcher({
  selectedUsers,
  setSelectedUsers
}: {
  selectedUsers: string[]
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const { recipient } = useConversationsContext()
  const checkUser = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.preventDefault()
    const target = e.target as HTMLElement
    const id = target.dataset.id
    if (id) {
      const index = selectedUsers.indexOf(id)
      if (index === -1) {
        setSelectedUsers((prev) => [...prev, id])
      } else {
        const updatedUsers = selectedUsers.filter((user) => user !== id)
        setSelectedUsers(updatedUsers)
      }
    }
  }

  const showUser = (
    convo: ConversationsInterface,
    userList?: {
      firstname: string
      lastname: string
      status: string
      pfp: string
      id: number
    }[]
  ) => {
    if (convo.groupId || !convo.otherUser) return

    if (convo.otherUser === recipient) return

    if (userList?.find((user) => user.id.toString() === convo.otherUser?.toString())) return

    return (
      <button
        key={convo.otherUser}
        data-id={convo.otherUser}
        className={selectedUsers.indexOf(convo.otherUser.toString()) === -1 ? '' : 'active'}
        onClick={checkUser}
      >
        {convo.userName}
      </button>
    )
  }
  return { showUser, checkUser }
}
