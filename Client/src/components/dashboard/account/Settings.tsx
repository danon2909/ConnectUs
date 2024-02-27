import { useState, MouseEvent, useEffect } from 'react'
import { userListInterface } from '../../../types/common.model'
import { useConversationsContext } from '../../../context/ConversationContext'
import { useSocketContext } from '../../../context/SocketContext'
import useGroupServices from '../../../services/useGroupServices'
import UserSearcher from '../accessories/UserSearcher'
import settingsIcon from '../../../assets/images/settings.svg'
import crossIcon from '../../../assets/images/cross.svg'
import defaultPfp from '../../../assets/images/defaultPfp.jpg'

export default function Settings() {
  const [settings, setSettings] = useState(false)
  const [addingUser, setAddingUser] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [changingName, setChangingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [userList, setUserList] = useState<userListInterface[]>([])
  const [refresh, setRefresh] = useState(false)

  const { conversations, group, removeConversation } = useConversationsContext()
  const { socket } = useSocketContext()

  const { showUser } = UserSearcher({ selectedUsers, setSelectedUsers })
  const { changeName, getUserList } = useGroupServices()

  const handleAddUsers = () => {
    socket?.emit('add-to-group', {
      group: group,
      users: selectedUsers
    })
    setRefresh(!refresh)
  }

  useEffect(() => {
    setSettings(false)
    setAddingUser(false)
    setSelectedUsers([])
    setChangingName(false)
    setNewName('')
    setUserList([])
    const getList = async () => {
      const userList = await getUserList()
      if (userList.message) return alert('Nie jesteś w tej grupie')
      setUserList(userList.members)
    }

    getList()
  }, [group, refresh])

  const leaveGroup = () => {
    socket?.emit('leave-group', { group: group })
    removeConversation({ group: group || undefined })
  }

  const showSearcher = () => {
    let canShow = 0
    conversations.map((convo) => {
      const isUser = userList?.find((user) => user.id.toString() === convo.otherUser?.toString())
      if (!isUser) {
        if (!convo.otherUser) return
        canShow = 1
      }
    })
    if (!canShow) return <div>Brak użytkowników do dodania</div>
    return (
      <div className="addUsersList">
        <button className="addButton" onClick={handleAddUsers}>
          Dodaj
        </button>
        {conversations.map((convo) => showUser(convo, userList))}
      </div>
    )
  }

  const showSettings = () => {
    return (
      <>
        <div className="userList">
          {userList.map((user: userListInterface) => (
            <div className="userInGroup" key={user.id}>
              <img
                src={user.pfp ? `data:image;base64,${user.pfp}` : defaultPfp}
                alt="Zdjęcie profilowe"
                style={{ maxWidth: '50px' }}
              />
              <span>
                {user.firstname} <br></br>
                {user.lastname}
              </span>
            </div>
          ))}
        </div>
        <>
          <button onClick={() => setChangingName(!changingName)}>Zmień nazwę</button>
          <button onClick={() => setAddingUser(!addingUser)}>Dodaj użytkownika</button>
          <div className="addUsers">{addingUser ? showSearcher() : null}</div>
          <button onClick={leaveGroup}>Opuść grupę</button>
        </>
      </>
    )
  }

  const handleChangeName = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    setChangingName(false)
    changeName(newName)
  }

  const showChangingName = () => {
    return (
      <div className="popup-container">
        <div className="popup">
          <input
            type="text"
            maxLength={60}
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)
            }}
          />
          <button onClick={handleChangeName}>Zmień nazwę</button>
          <span className="close" onClick={() => setChangingName(!changingName)}>
            <img src={crossIcon} alt="" />
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <span className="icon" onClick={() => setSettings(!settings)}>
        <img src={settingsIcon} alt="Ustawienia" />
      </span>
      <div className={`dropdown ${changingName || settings ? 'active' : ''}`}>
        {changingName ? showChangingName() : null}
        {showSettings()}
      </div>
    </>
  )
}
