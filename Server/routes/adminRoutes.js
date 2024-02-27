import Express from 'express'
import {
  getAllBackups,
  installBackup,
  createBackup,
  getCount,
  adminDelete
} from '../controllers/adminController.js'

const adminRouter = Express.Router()

adminRouter.get('/api/getAllBackups', getAllBackups)
adminRouter.get('/api/createBackup', createBackup)
adminRouter.get('/api/getCount', getCount)
adminRouter.post('/api/installBackup', installBackup)
adminRouter.post('/api/delete', adminDelete)

export default adminRouter
