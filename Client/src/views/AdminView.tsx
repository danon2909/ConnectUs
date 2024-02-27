import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GroupFilterInterface, UserFilterInterface } from '../types/common.model'
import UseUserPanelServices from '../services/useUserPanelServices'
import UserServices from '../services/useUserServices'
import adminServices from '../services/useAdminServices'
import Alert from '../components/Alert'
import '../assets/adminPanelStyle.scss'
import deleteIcon from '../assets/images/delete.svg'
import defaultPfp from '../assets/images/defaultPfp.jpg'

export default function AdminView() {
  const [userCount, setUserCount] = useState(0)
  const [groupCount, setGroupCount] = useState(0)
  const [files, setFiles] = useState<string[]>([])
  const [admin, setAdmin] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({
    header: '',
    message: '',
    variant: '',
    alertFunction: () => {}
  })

  const [searchUserResults, setSearchUserResults] = useState<UserFilterInterface[]>([])
  const [showUserResults, setShowUserResults] = useState<UserFilterInterface[]>([])

  const [searchGroupResults, setSearchGroupResults] = useState<GroupFilterInterface[]>([])
  const [showGroupResults, setShowGroupResults] = useState<GroupFilterInterface[]>([])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const { getUserId, searchUsers, searchGroups } = UserServices()
  const { getAllBackups, installBackup, createBackupService, getCount, deleteQuery } =
    adminServices()
  const { logoutQuery, changePassword } = UseUserPanelServices()

  const navigate = useNavigate()

  const handleUserChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const length = e.target.value.length
    if (length === 1) {
      const users = await searchUsers(e.target.value)
      setSearchUserResults(users)
      setShowUserResults(users)
    } else if (length > 1) {
      const filteredResults = searchUserResults.filter((user: UserFilterInterface) =>
        `${user.firstname.toLowerCase()} ${user.lastname.toLowerCase()}`.includes(
          e.target.value.toLowerCase()
        )
      )
      setShowUserResults(filteredResults)
    } else {
      setSearchUserResults([])
      setShowUserResults([])
    }
  }

  const handleGroupChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const length = e.target.value.length
    if (length === 1) {
      const groups = await searchGroups(e.target.value)
      setSearchGroupResults(groups)
      setShowGroupResults(groups)
    } else if (length > 1) {
      const filteredResults = searchGroupResults.filter((group: GroupFilterInterface) =>
        `${group.groupName.toLowerCase()}`.includes(e.target.value.toLowerCase())
      )
      setShowGroupResults(filteredResults)
    } else {
      setSearchGroupResults([])
      setShowGroupResults([])
    }
  }
  const fetchUserId = async () => {
    try {
      const res = await getUserId()
      res.message !== 'admin' ? navigate('/') : setAdmin(true)
    } catch (error) {
      console.error('Error fetching user ID:', error)
    }
  }
  useEffect(() => {
    getAllBackups(setFiles)
    getCount(setUserCount, setGroupCount)
    fetchUserId()
  }, [])

  const installBackupHandler = async (file: string) => {
    const data = await installBackup(file)
    setShowAlert(true)
    setAlertData({
      header: 'Sukces',
      message: data.message,
      variant: 'success',
      alertFunction: () => setShowAlert(false)
    })
  }

  const createBackup = async () => {
    await createBackupService()
    await getAllBackups(setFiles)
  }

  const deleteUser = async (id: number) => {
    await deleteQuery({ userId: id.toString(), groupId: undefined })
    const newArray: UserFilterInterface[] = []
    searchUserResults.map((user: UserFilterInterface) => {
      if (user.id === id) {
        return
      }
      newArray.push(user)
    })
    setSearchUserResults(newArray)
    const filteredResults = newArray.filter((user: UserFilterInterface) => user.id !== id)
    setShowUserResults(filteredResults)
  }

  const deleteGroup = async (id: number) => {
    await deleteQuery({ userId: undefined, groupId: id.toString() })
    const newArray: GroupFilterInterface[] = []
    searchGroupResults.map((group: GroupFilterInterface) => {
      if (group.id === id) {
        return
      }
      newArray.push(group)
    })
    setSearchGroupResults(newArray)
    const filteredResults = newArray.filter((group: GroupFilterInterface) => group.id !== id)
    setShowGroupResults(filteredResults)
  }

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPassword !== repeatPassword) {
      setShowAlert(true)
      setAlertData({
        header: 'Błąd',
        message: 'Hasła nie są takie same',
        variant: 'danger',
        alertFunction: () => setShowAlert(false)
      })
      return
    }

    const res = await changePassword(newPassword, currentPassword)
    setShowAlert(true)
    setAlertData({
      header: 'Sukces',
      message: res.message,
      variant: 'success',
      alertFunction: () => setShowAlert(false)
    })
  }

  const showDate = () => {
    if (!files[0]?.[1]) return <span>Brak</span>
    const firstDate = new Date(files[0]?.[1])
    const day = String(firstDate.getDate()).padStart(2, '0')
    const month = String(firstDate.getMonth() + 1).padStart(2, '0')
    const year = firstDate.getFullYear()
    const hours = String(firstDate.getHours()).padStart(2, '0')
    const minutes = String(firstDate.getMinutes()).padStart(2, '0')
    const seconds = String(firstDate.getSeconds()).padStart(2, '0')

    const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
    return <span>{formattedDate}</span>
  }

  useEffect(() => {
    document.title = 'ConnectUs - Panel administratora'
  }, [])

  return (
    <>
      {showAlert && (
        <Alert
          header={alertData.header}
          message={alertData.message}
          variant={alertData.variant}
          alertFunction={alertData.alertFunction}
        />
      )}
      <div className="main__container dashboard admin__panel">
        <div className="dashboard__container">
          <div>
            <h2>Panel</h2>
            <h1>Administratora</h1>
          </div>
          <div className="line"></div>
          <button onClick={logoutQuery} className="main__btn admin__logout">
            Wyloguj się
          </button>
          <div className="stats" style={{ marginTop: '15px' }}>
            <div className="stat__left">
              <div className="info">
                Użytkownicy
                <br></br>w aplikacji
              </div>
              <div className="stat">{userCount}</div>
            </div>
            <div className="stat__right">
              <div className="info">
                Grupy
                <br></br>w aplikacji
              </div>
              <div className="stat">{groupCount}</div>
            </div>
          </div>
          <div className="backups">
            <h3>Kopie zapasowe</h3>
            <p>Ostatnia kopia zapasowa: {showDate()}</p>
            <button className="main__btn" onClick={createBackup}>
              Utwórz kopię zapasową
            </button>
            <ul>
              {admin
                ? files.map((file) => (
                    <li key={file[0]}>
                      <button
                        className="main__btn install__backup"
                        onClick={() => installBackupHandler(file[0])}
                      >
                        {file[0]}
                      </button>
                    </li>
                  ))
                : null}
            </ul>
          </div>
          <div className="change__password">
            <form onSubmit={handlePasswordChange}>
              <h2>Zmiana hasła</h2>
              <div className="input__group">
                <input
                  type="password"
                  placeholder="Stare hasło"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Nowe hasło"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Powtórz hasło"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="main__btn">
                Zmień hasło
              </button>
            </form>
          </div>
        </div>
        <div className="admin__panel-sidebar">
          <div className="groups">
            <h2>Grupy</h2>
            <input type="text" onChange={handleGroupChange} />
            <div className="groups__list">
              {showGroupResults.map((group: { id: number; groupName: string }) => (
                <div className="element" key={`group-${group.id}`}>
                  {group.groupName}{' '}
                  <span className="deleteIcon" onClick={() => deleteGroup(group.id)}>
                    <img src={deleteIcon} alt="X" />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="users">
            <h2>Użytkownicy</h2>
            <input type="text" onChange={handleUserChange} />
            <div className="users__list">
              {showUserResults.map(
                (user: { id: number; firstname: string; lastname: string; pfp: string }) => (
                  <div className="element" key={`user-${user.id}`}>
                    <img
                      src={user.pfp ? `data:image;base64,${user.pfp}` : defaultPfp}
                      style={{ maxWidth: '50px' }}
                      alt="Zdjęcie profilowe"
                      className="pfp"
                    />
                    <span className="userName">
                      {user.firstname} {user.lastname}{' '}
                    </span>
                    <span className="deleteIcon" onClick={() => deleteUser(user.id)}>
                      <img src={deleteIcon} alt="X" />
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
