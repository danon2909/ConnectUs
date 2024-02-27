import { MouseEvent, useState } from 'react'
import { useConversationsContext } from '../../../context/ConversationContext'
import { useSocketContext } from '../../../context/SocketContext'
import UserSearcher from './UserSearcher'
import Alert from '../../Alert'
import groupIcon from '../../../assets/images/group.svg'
import plusIcon from '../../../assets/images/plus.svg'

export default function CreateGroupButton() {
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showAlert, setShowAlert] = useState(false)

  const { conversations, recipient } = useConversationsContext()
  const { showUser } = UserSearcher({ selectedUsers, setSelectedUsers })
  const { socket } = useSocketContext()

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (creatingGroup) {
      setSelectedUsers([])
    }
    setCreatingGroup(!creatingGroup)
  }

  const handleGroupCreate = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (selectedUsers.length > 0) {
      socket?.emit('create-group', {
        users: [...selectedUsers, recipient?.toString()]
      })
    } else {
      setShowAlert(true)
    }
  }

  return (
    <div style={{ position: 'static' }}>
      <div>
        {showAlert && (
          <Alert
            header="Błąd"
            message="Musisz zaznaczyć minimum jedną osobę"
            variant="danger"
            alertFunction={() => setShowAlert(false)}
          />
        )}
        <span onClick={handleClick} className="icon">
          <img src={groupIcon} alt="Stwórz grupę" />
        </span>
        <div className={`dropdown ${creatingGroup ? 'active' : ''}`}>
          <span>Stwórz grupę</span>
          <div className="addUsers">{conversations.map((convo) => showUser(convo))}</div>
          <span onClick={handleGroupCreate} className="icon create__group">
            <img src={plusIcon} alt="Stwórz grupę" />
          </span>
        </div>
      </div>
    </div>
  )
}
