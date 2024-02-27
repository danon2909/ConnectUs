import { FormEvent, MouseEvent, ChangeEvent, useEffect, useState } from 'react'
import userPanelServices from '../../../services/useUserPanelServices.ts'
import Alert from '../../Alert.tsx'
import '../../../assets/userPanelStyle.scss'
import closeIcon from '../../../assets/images/cross.svg'
import pencilIcon from '../../../assets/images/pencil.svg'
import defaultPfp from '../../../assets/images/defaultPfp.jpg'

interface UserPanelProps {
  firstName: string
  lastName: string
  avatar?: string
  setFirstName: (name: string) => void
  setLastName: (name: string) => void
  changeSetting: (e: ChangeEvent<HTMLInputElement>) => void
  muteNotifications: boolean
  colorMode: string
  setPfp: React.Dispatch<React.SetStateAction<string | undefined>>
}

export default function UserPanel({
  firstName,
  lastName,
  avatar,
  setFirstName,
  setLastName,
  changeSetting,
  muteNotifications,
  colorMode,
  setPfp
}: UserPanelProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [changingPersonals, setChangingPersonals] = useState(false)
  const [firstNameState, setFirstNameState] = useState(firstName)
  const [lastNameState, setLastNameState] = useState(lastName)

  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({
    header: '',
    message: '',
    variant: '',
    alertFunction: () => {}
  })

  const { changePassword, changePfp, changePersonalsQuery, logoutQuery } = userPanelServices()

  useEffect(() => {
    setFirstNameState(firstName)
    setLastNameState(lastName)
  }, [firstName, lastName])

  const handlePasswordChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !repeatPassword) {
      setShowAlert(true)
      setAlertData({
        header: 'Błąd',
        message: 'Pola nie mogą być puste',
        variant: 'danger',
        alertFunction: () => setShowAlert(false)
      })
      return
    }

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

  const handlePfpChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    try {
      await changePfp(e.target.files?.[0], setPfp)
    } catch (err) {
      setShowAlert(true)
      setAlertData({
        header: 'Błąd',
        message: err?.toString() || 'Nie udało się zmienić zdjęcia profilowego',
        variant: 'danger',
        alertFunction: () => setShowAlert(false)
      })
    }
  }

  const showPersonalsTab = () => {
    return (
      <>
        <div className="close">
          <span onClick={() => setChangingPersonals(false)}>
            <img src={closeIcon} alt="X" />
          </span>
        </div>
        <label htmlFor="pfp" className="main__btn">
          Wybierz nowe zdjęcie profilowe
        </label>
        <input
          type="file"
          id="pfp"
          style={{ display: 'none' }}
          onChange={handlePfpChange}
          accept="image/png, image/jpeg"
        />
        <form onSubmit={changePersonals}>
          <input
            type="text"
            value={firstNameState}
            onChange={(e) => setFirstNameState(e.target.value)}
          />
          <input
            type="text"
            value={lastNameState}
            onChange={(e) => setLastNameState(e.target.value)}
          />
          <input type="submit" value="Zmień dane" />
        </form>
      </>
    )
  }

  const changePersonals = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFirstName(firstNameState)
    setLastName(lastNameState)
    changePersonalsQuery(firstNameState, lastNameState)
  }

  const logout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    logoutQuery()
  }

  useEffect(() => {
    document.title = 'ConnectUs - Profil użytkownika'
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
      <div className="user__panel">
        <div className={`user__edit ${changingPersonals ? 'active' : ''}`}>
          {showPersonalsTab()}
        </div>
        <div>
          <div className="header">
            <div className="changeSettings icon" onClick={() => setChangingPersonals(true)}>
              <img src={pencilIcon} alt="Edytuj" />
            </div>
            <div className="logout">
              <button className="main__btn" onClick={logout}>
                Wyloguj się
              </button>
            </div>
            <div className="pfp">
              <img
                src={avatar ? `data:image;base64,${avatar}` : defaultPfp}
                alt="Zdjęcie profilowe"
              />
            </div>
            <div className="name">{firstName}</div>
          </div>

          <div className="personals">
            {firstName} {lastName}
          </div>
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
        <div className="preferences">
          <div>
            <label htmlFor="colorModes">Ciemny motyw</label>
            <input
              type="checkbox"
              id="colorModes"
              data-role="colorMode"
              onChange={changeSetting}
              checked={colorMode === 'true' ? true : false}
            />
          </div>
          <div>
            <label htmlFor="notifications">Wycisz powiadomienia</label>
            <input
              type="checkbox"
              id="notifications"
              data-role="notifications"
              onChange={changeSetting}
              checked={muteNotifications ? true : false}
            />
          </div>
        </div>
      </div>
    </>
  )
}
