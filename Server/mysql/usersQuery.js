import mysql from 'mysql2'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const db = mysql
  .createConnection({
    host: process.env.DB_IP,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
  .promise()

const getAllUsers = async () => {
  const [data] = await db.query('SELECT * FROM users')
  return data
}

const createUser = async (values) => {
  db.query('INSERT INTO users VALUES (NULL, ?, NULL, "Offline", 0)', [values])
}

const setActivityStatus = async (status, id) => {
  if (id === 'all') {
    db.query('UPDATE users SET status = ?', [status])
    return
  }
  db.query('UPDATE users SET status = ? WHERE id = ?', [status, id])
}

const checkBelonging = async (userId, messageId) => {
  const [result] = await db.query('SELECT * FROM messages WHERE id=?', [messageId])
  if (result[0].groupId) {
    const [resultGroup] = await db.query(
      'SELECT * FROM groups_members WHERE groupId = ? AND userId = ?',
      [result[0].groupId, userId]
    )
    return resultGroup.length !== 0
  } else
    return (
      result[0].receiverId.toString() === userId.toString() ||
      result[0].senderId.toString() === userId.toString()
    )
}

const getMessage = async (id) => {
  return db.query('SELECT * FROM messages WHERE id = ?', [id])
}

const getUserChats = async (id) => {
  if (id !== undefined) {
    const [dbData] = await db.query(
      `SELECT DISTINCT chat.*, max(messages.id) as lastMessageId FROM chat LEFT JOIN messages ON ((messages.senderId = chat.user_id AND messages.receiverId = chat.user2_id AND messages.groupId IS NULL) OR (messages.senderId = chat.user2_id AND messages.receiverId = chat.user_id AND messages.groupId IS NULL)) WHERE (chat.user_id = ? OR chat.user2_id = ?) GROUP BY chat.id;`,
      [id, id]
    )
    const returnArray = []
    if (dbData.length > 0) {
      for (const data of dbData) {
        if (data.id !== null && data.id !== undefined) {
          let otherUser, read
          if (data.user_id.toString() === id.toString()) {
            otherUser = data.user2_id
            read = data.read_1
          } else {
            otherUser = data.user_id
            read = data.read_2
          }
          const [userData] = await db.query(
            `SELECT firstname, lastname, status, pfp FROM users WHERE id=${otherUser}`
          )
          if (userData[0]) {
            let file
            if (userData[0].pfp) {
              file = fs.readFileSync(`./server/uploads/pfps/${userData[0].pfp}`, 'base64')
            } else {
              file = ''
            }
            returnArray.push({
              lastMessageId: data.lastMessageId,
              read: read,
              otherUser: otherUser,
              userName: `${userData[0].firstname} ${userData[0].lastname}`,
              pfp: file,
              status: userData[0].status === 'DND' ? 'Nie przeszkadzać' : userData[0].status
            })
          }
        }
      }
    }
    return returnArray
  }
  return
}

const searchUsersQuery = async (searcherId, user) => {
  if (user) {
    const [dbData] = await db.query(
      `SELECT id, firstname, lastname, pfp FROM users WHERE ((users.firstname LIKE '${user}%' OR users.lastname LIKE '${user}%') AND id != ? AND id != 0)`,
      [searcherId]
    )
    return dbData
  }
}

const getPersonals = async (user) => {
  const [dbData] = await db.query(
    `SELECT firstname, lastname, status, pfp FROM users WHERE id = ?`,
    [user]
  )
  return dbData[0]
}

const getPassword = async (user) => {
  const [dbData] = await db.query(`SELECT password FROM users WHERE id = ?`, [user])
  return dbData
}

const changePasswordQuery = async (user, newPassword) => {
  const [dbData] = await db.query(`UPDATE users SET password = ? WHERE id = ?`, [newPassword, user])
  return dbData
}

const getPfpName = async (id) => {
  const [dbData] = await db.query(`SELECT pfp FROM users WHERE id=?`, [id])
  return dbData[0]
}

const changeNameQuery = async (firstName, lastName, id) => {
  await db.query(`UPDATE users SET firstname = ?, lastname = ? WHERE id = ?`, [
    firstName,
    lastName,
    id
  ])
}

const changePfpQuery = async (id) => {
  await db.query(`UPDATE users SET pfp = 'pfp_${id}' WHERE id = ${id}`)
}

const getMonthStats = async (id) => {
  const date = new Date()
  const month = date.getMonth() + 1
  const [sent] = await db.query(
    `SELECT COUNT(*) as Sent FROM messages WHERE senderId = ? AND MONTH(messages.date) = ?`,
    [id, month]
  )
  const [received] = await db.query(
    `SELECT COUNT(*) as Received FROM messages WHERE receiverId = ? AND MONTH(messages.date) = ?`,
    [id, month]
  )
  return { received: received, sent: sent }
}

export {
  getAllUsers,
  createUser,
  setActivityStatus,
  checkBelonging,
  getMessage,
  getUserChats,
  searchUsersQuery,
  getPersonals,
  getPassword,
  changePasswordQuery,
  getPfpName,
  changeNameQuery,
  changePfpQuery,
  getMonthStats
}
