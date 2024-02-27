import { ChangeEvent, FormEvent, Dispatch, SetStateAction } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

interface signupFormProps {
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  setConfirmPasswordValue: Dispatch<SetStateAction<string>>
  confirmPasswordValue: string
}

export default function SignupForm({
  handleInput,
  handleSubmit,
  setConfirmPasswordValue,
  confirmPasswordValue
}: signupFormProps) {
  return (
    <Form onSubmit={handleSubmit} className="form">
      <Form.Group controlId="formLogin">
        <Row>
          <Col>
            <Form.Label>Imię</Form.Label>
            <Form.Control
              type="text"
              name="firstname"
              onChange={handleInput}
              placeholder="Imię"
              maxLength={20}
            />
          </Col>
          <Col>
            <Form.Label>Nazwisko</Form.Label>
            <Form.Control
              type="text"
              name="lastname"
              onChange={handleInput}
              placeholder="Nazwisko"
              maxLength={30}
            />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group>
        <Form.Label>Login</Form.Label>
        <Form.Control
          type="text"
          name="login"
          onChange={handleInput}
          placeholder="Login"
          maxLength={30}
        />
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Row>
          <Col>
            <Form.Label>Hasło</Form.Label>
            <Form.Control
              type="password"
              name="password"
              onChange={handleInput}
              placeholder="Hasło"
            />
          </Col>
          <Col>
            <Form.Label>Powtórz hasło</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Powtórz hasło"
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
            />
          </Col>
        </Row>
      </Form.Group>
      <Button className="mt-2 btn main__btn" type="submit">
        Zarejestruj się
      </Button>
      <p>
        Masz już konto?{' '}
        <Link className="form__link" to="/">
          Zaloguj się.
        </Link>
      </p>
    </Form>
  )
}
