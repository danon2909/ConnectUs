import Express from 'express'
import {
  getHistory,
  sendFile,
  getFile,
  getConversations,
  searchUsers,
  searchGroups
} from '../controllers/chatController.js'

const chatRouter = Express.Router()

chatRouter.post('/api/getFile', getFile)
chatRouter.post('/api/sendFile', sendFile)
chatRouter.post('/api/getHistory', getHistory)
chatRouter.get('/api/getConversations', getConversations)
chatRouter.post('/api/searchUsers', searchUsers)
chatRouter.post('/api/searchGroups', searchGroups)

export default chatRouter
