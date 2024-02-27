import { ChangeEvent, FormEvent } from 'react'
import { Form, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

interface loginFormProps {
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export default function LoginForm({ handleSubmit, handleInput }: loginFormProps) {
  return (
    <Form onSubmit={handleSubmit} className="form">
      <Form.Group controlId="formLogin">
        <Form.Label>Login</Form.Label>
        <Form.Control onChange={handleInput} type="text" name="login" placeholder="Login" />
      </Form.Group>
      <Form.Group controlId="formPassword">
        <Form.Label>Hasło</Form.Label>
        <Form.Control onChange={handleInput} type="password" name="password" placeholder="Hasło" />
      </Form.Group>
      <Button className="mt-2 btn main__btn" type="submit">
        Zaloguj się
      </Button>
      <p>
        Nie masz konta?{' '}
        <Link className="form__link" to="/signup">
          Zarejestruj się.
        </Link>
      </p>
    </Form>
  )
}
