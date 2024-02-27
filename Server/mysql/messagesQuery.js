import mysql from 'mysql2'
import dotenv from 'dotenv'
import { getGroupMembers } from './groupsQuery.js'
import { io } from '../server.js'

dotenv.config()

const db = mysql
  .createConnection({
    host: process.env.DB_IP,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
  .promise()

const sendAdminMessage = async (message, groupId) => {
  const [users] = await getGroupMembers(groupId)
  const result = await db.query(
    `INSERT INTO messages VALUES (NULL, ?, current_timestamp(), '0', NULL, ?, '0', NULL, NULL);`,
    [message, groupId]
  )
  users.forEach((user) => {
    io.to(user.userId.toString()).emit('receive-message', {
      id: result.insertId,
      sender: 0,
      text: message,
      senderName: 'Default User',
      groupId: groupId
    })
  })
  return result
}

export { sendAdminMessage }
