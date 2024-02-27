import Express from 'express'
import { changeGroupName, getGroupMembersController } from '../controllers/groupController.js'

const groupRouter = Express.Router()

groupRouter.post('/api/changeGroupName', changeGroupName)
groupRouter.post('/api/getGroupMembers', getGroupMembersController)

export default groupRouter
