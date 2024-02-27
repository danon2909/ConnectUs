import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import userServices from '../../services/useUserServices.ts'
import { ErrorInterface } from '../../types/common.model.ts'
import { Container, Row, Col } from 'react-bootstrap'
import SignupForm from './SignupForm'
import Alert from '../Alert'

export default function SignupDialog() {
  const navigate = useNavigate()
  const { signupUser } = userServices()

  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({
    header: '',
    message: '',
    variant: '',
    alertFunction: () => {}
  })

  const [values, setValues] = useState({
    firstname: '',
    lastname: '',
    login: '',
    password: ''
  })

  const [confirmPasswordValue, setConfirmPasswordValue] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (values.password !== confirmPasswordValue) {
      setShowAlert(true)
      setAlertData({
        header: 'Błąd',
        message: 'Hasła nie są takie same',
        variant: 'danger',
        alertFunction: () => setShowAlert(false)
      })
      return
    }

    try {
      const res = await signupUser(values)
      setShowAlert(true)
      setAlertData({
        header: 'Sukces',
        message: res.message,
        variant: 'success',
        alertFunction: () => navigate('/')
      })
    } catch (err) {
      setShowAlert(true)
      setAlertData({
        header: 'Błąd',
        message: (err as ErrorInterface).response.data.message,
        variant: 'danger',
        alertFunction: () => setShowAlert(false)
      })
    }
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
      <Container className="login__container">
        <Row>
          <Col sm className="login__container-col">
            <Container>
              <h1>Zarejestruj się</h1>
              <h2>Utwórz nowe konto</h2>
            </Container>
          </Col>
          <Col sm className="login__container-col">
            <SignupForm
              handleInput={handleInput}
              handleSubmit={handleSubmit}
              setConfirmPasswordValue={setConfirmPasswordValue}
              confirmPasswordValue={confirmPasswordValue}
            />
          </Col>
        </Row>
      </Container>
    </>
  )
}
