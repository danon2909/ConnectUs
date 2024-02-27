import mysql from 'mysql2'
import dotenv from 'dotenv'
import { getGroupMembers } from './groupsQuery.js'
import fs from 'fs'

dotenv.config()

const db = mysql
  .createConnection({
    host: process.env.DB_IP,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
  .promise()

const getConversationMessages = async (recipientId, UserId, offset) => {
  let off = offset
  if (!offset) off = 0
  const [data] = await db.query(
    'SELECT messages.*, users.firstname, users.lastname FROM messages JOIN users ON messages.senderId = users.id WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY ID DESC LIMIT 20 OFFSET ?',
    [UserId, recipientId, recipientId, UserId, off]
  )
  return data
}

const addConversationMessage = async (text, stringId, recipient, file, fileName, prefix) => {
  if (!file) file = 0

  const [result] = await db.query(
    'INSERT INTO messages VALUES (NULL, ?, current_timestamp(), ?, ?, NULL, ?, ?, ?)',
    [text, stringId, recipient, file, fileName, prefix]
  )
  return result.insertId
}

const checkChat = async (messageId) => {
  if (messageId) {
    const [dbData] = await db.query(
      `SELECT chat.id FROM chat WHERE (chat.user2_id = (SELECT messages.senderId FROM messages WHERE messages.id = ${messageId}) OR chat.user2_id = (SELECT messages.receiverId FROM messages WHERE messages.id = ${messageId})) AND (chat.user_id = (SELECT messages.senderId FROM messages WHERE messages.id = ${messageId}) OR chat.user_id = (SELECT messages.receiverId FROM messages WHERE messages.id = ${messageId}))`
    )
    if (dbData.length === 0) {
      return false
    }
    return true
  }
}

const createChat = async (user1, user2) => {
  if (parseInt(user2) === 0 || parseInt(user1) === 0) return
  if (user1 && user2) {
    await db.query(`INSERT INTO chat VALUES (NULL, '${user1}', '${user2}', '1', '0')`)
  }
}

const deleteMessageQuery = async (userId, messageId) => {
  if (!userId) return
  const [result] = await db.query(`SELECT id, senderId, file, fileName FROM messages WHERE id=?`, [
    messageId
  ])
  if (result[0].senderId.toString() === userId) {
    if (result[0].file) {
      const splitted = result[0].fileName.split('.')
      fs.unlink(`./server/uploads/${splitted[0]}_${result[0].id}.${splitted[1]}`, (err) => {
        if (err) {
          console.error('Nie udało się usunąć pliku z wiadomości')
        }
      })
    }
    await db.query(`DELETE FROM messages WHERE id = ?`, [messageId])
    return true
  }
  return false
}

const getMessageReceivers = async (id) => {
  const [receiverId] = await db.query(`SELECT receiverId, groupId FROM messages WHERE id=?`, [id])
  if (receiverId[0].groupId) {
    const [groupMembers] = await getGroupMembers(receiverId[0].groupId)
    return groupMembers
  } else if (receiverId[0].receiverId) {
    return receiverId[0].receiverId
  } else {
    return false
  }
}

export {
  getConversationMessages,
  addConversationMessage,
  checkChat,
  createChat,
  deleteMessageQuery,
  getMessageReceivers
}
