import Express from 'express'
import {
  signupUser,
  loginUser,
  getUserId,
  changePassword,
  getPfp,
  changePfp,
  changeName,
  logoutQuery,
  getStats
} from '../controllers/userController.js'

const UserRouter = Express.Router()

UserRouter.get('/api/getStats', getStats)
UserRouter.get('/api/logout', logoutQuery)
UserRouter.post('/api/getPfp', getPfp)
UserRouter.post('/api/changePfp', changePfp)
UserRouter.post('/api/changeName', changeName)
UserRouter.post('/api/changePassword', changePassword)
UserRouter.get('/api/getId', getUserId)
UserRouter.post('/signup', signupUser)
UserRouter.post('/', loginUser)

export default UserRouter
