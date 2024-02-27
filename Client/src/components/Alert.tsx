import { Alert as AlertBS, Button } from 'react-bootstrap'
import { To } from 'react-router-dom'
import '../assets/alertStyle.scss'

interface AlertProps {
  header: string
  message: string
  variant: string
  alertFunction: ({ show, to }?: { show: boolean; to: To }) => void
}

export default function Alert({ header, message, variant, alertFunction }: AlertProps) {
  return (
    <div className="alert__wrapper">
      <AlertBS variant={variant}>
        <AlertBS.Heading>{header}</AlertBS.Heading>
        <p>{message}</p>
        <Button className="main__btn" onClick={() => alertFunction()}>
          Ok
        </Button>
      </AlertBS>
    </div>
  )
}
