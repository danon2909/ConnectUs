import {
  getBackups,
  installBackupQuery,
  createBackupQuery,
  getCountQuery,
  adminDeleteQuery
} from '../mysql/adminQuery.js'

import { io } from '../server.js'

const authAdmin = (req, res) => {
  if (!req.session.admin || req.session.UserId !== 0) {
    res.status(401).json({})
    return false
  }
  return true
}

const getAllBackups = async (req, res) => {
  if (!authAdmin(req, res)) return
  await getBackups(res)
}

const createBackup = async (req, res) => {
  if (!authAdmin(req, res)) return res.status(401).json({})
  await createBackupQuery()
  res.status(200).json({})
}

const createBackupServer = async () => {
  await createBackupQuery(true)
}

const installBackup = async (req, res) => {
  if (!authAdmin(req, res)) return
  await installBackupQuery(req.body.backup)
  res.status(200).json({ message: 'Przywrócono kopie bazy danych' })
}

const getCount = async (req, res) => {
  if (!authAdmin(req, res)) return
  const { users, groups } = await getCountQuery()
  res.status(200).json({ users: users, groups: groups })
}

const adminDelete = async (req, res) => {
  if (!authAdmin(req, res)) return res.status(401).json({ message: 'Nie jesteś administratorem' })
  const { userId, groupId } = req.body
  if (!userId && !groupId) return res.status(500).json({ message: 'Błąd' })

  await adminDeleteQuery(userId, groupId)
  io.emit('delete-conversation', {
    groupId: groupId,
    userId: userId
  })

  const sessionStore = req.sessionStore

  sessionStore.all((err, sessions) => {
    if (err) {
      console.error('Błąd w wczytywaniu sesji:', err)
      return res.status(500).json({ message: 'Błąd serwera' })
    }

    for (const sessionID of Object.keys(sessions)) {
      const session = sessions[sessionID]
      if (session && session.UserId && session.UserId.toString() === userId.toString()) {
        sessionStore.destroy(sessionID, (err) => {
          if (err) {
            console.error('Błąd w usunięciu sesji użytkownika: ', err)
            return res.status(500).json({ message: 'Błąd serwera' })
          }
          io.to(userId.toString()).emit('redirect')
        })
        return
      }
    }

    res.status(200)
  })
}

export { getAllBackups, installBackup, createBackup, getCount, adminDelete, createBackupServer }
