import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import userServices from '../../services/useUserServices.ts'
import { ErrorInterface } from '../../types/common.model.ts'
import { Container, Row, Col } from 'react-bootstrap'
import LoginForm from './LoginForm'
import Alert from '../Alert'

export default function LoginDialog() {
  const navigate = useNavigate()
  const { loginUser } = userServices()

  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({
    header: '',
    message: '',
    variant: '',
    alertFunction: () => {}
  })

  const [values, setValues] = useState({
    login: '',
    password: ''
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const res = await loginUser(values)
      res.admin ? navigate('/admin') : navigate('/dashboard')
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
              <h1>Zaloguj się</h1>
              <h2>Zaloguj się do systemu</h2>
            </Container>
          </Col>
          <Col sm className="login__container-col">
            <LoginForm handleInput={handleInput} handleSubmit={handleSubmit} />
          </Col>
        </Row>
      </Container>
    </>
  )
}
