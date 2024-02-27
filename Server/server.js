import Express from 'express'
import cors from 'cors'
import session from 'express-session'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import { createServer } from 'https'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import errorHandler from './middleware/errorHandler.js'
import UserRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import groupRouter from './routes/groupRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import { SocketSession } from './controllers/socketController.js'
import { createBackupServer } from './controllers/adminController.js'
import { setActivityStatus } from './mysql/usersQuery.js'
import fs from 'fs'

dotenv.config()

const secretKey = crypto.randomBytes(32).toString('hex')

const sessionMiddleWare = session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
})

const corsOptions = {
  origin: [`https://${process.env.SERVER_IP}:${process.env.CLIENT_PORT}`],
  credentials: true
}

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8')
const certificate = fs.readFileSync(process.env.CERTIFICATE, 'utf8')

const httpsOptions = {
  key: privateKey,
  cert: certificate
}

const app = new Express()
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' }))

app.use(sessionMiddleWare)

app.use(UserRouter)
app.use(chatRouter)
app.use(groupRouter)
app.use(adminRouter)
app.use(errorHandler)

const httpsServer = createServer(httpsOptions, app)

httpsServer.listen(process.env.SERVER_PORT || 443, process.env.SERVER_IP, () => {
  console.log('Server is running')
})

const ioServer = createServer(httpsOptions)
const io = new Server(ioServer, {
  cors: corsOptions
})

io.engine.use(sessionMiddleWare)

io.on('connection', SocketSession)

ioServer.listen(process.env.HTTPS_PORT, process.env.SERVER_IP)

createBackupServer()
setActivityStatus('offline', 'all')
setInterval(() => {
  createBackupServer()
}, 3600 * 24 * 30)

export { io }
