import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

import { sendAdminMessage } from './messagesQuery.js'
import { getPersonals } from './usersQuery.js'

const db = mysql
  .createConnection({
    host: process.env.DB_IP,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })
  .promise()

const getGroupMessages = async (groupId, offset) => {
  let off = offset
  if (!offset) off = 0
  const [data] = await db.query(
    `SELECT messages.*, users.firstname, users.lastname FROM messages JOIN users ON messages.senderId = users.id WHERE groupId = ? ORDER BY ID DESC LIMIT 20 OFFSET ?`,
    [groupId, off]
  )
  return data
}

const getGroupName = async (groupId) => {
  const [data] = await db.query(`SELECT groupName FROM usergroups WHERE id=?`, [groupId])
  return data[0].groupName
}

const getGroupMembers = async (groupId) => {
  return db.query(`SELECT userId FROM groups_members WHERE groupId = ?`, [groupId])
}

const addGroupMessage = async (text, stringId, recipient, file, fileName, prefix) => {
  if (!file) file = 0

  const [result] = await db.query(
    `INSERT INTO messages VALUES (NULL, ?, current_timestamp(), ?, NULL, ?, ?, ?, ?)`,
    [text, stringId, recipient, file, fileName, prefix]
  )
  return result.insertId
}

const addUserToGroup = async (group, addedUser, user) => {
  const [result] = await db.query(`INSERT IGNORE INTO groups_members VALUES (NULL, ?, ?, 0);`, [
    group,
    addedUser
  ])
  if (result.affectedRows && user) {
    const userPersonals = await getPersonals(user)
    const addedUserPersonals = await getPersonals(addedUser)
    const message = `Użytkownik ${userPersonals.firstname} ${userPersonals.lastname} dodał użytkownika ${addedUserPersonals.firstname} ${addedUserPersonals.lastname}`
    const [result] = await sendAdminMessage(message, group)
    return { lastMessageId: result.insertId }
  }
  return { lastMessageId: '' }
}

const removeUserFromGroup = async (groupId, userId) => {
  await db.query(`DELETE FROM groups_members WHERE userId = ? AND groupId = ?`, [userId, groupId])
  const personals = await getPersonals(userId)
  sendAdminMessage(
    `Użytkownik ${personals.firstname} ${personals.lastname} opuścił(a) grupę`,
    groupId
  )
}

const createGroup = async (users, name) => {
  if (users && name) {
    const [dbData] = await db.query(`SELECT firstname, lastname FROM users WHERE id=? OR id=?`, [
      users[0],
      users[1]
    ])
    const [result] = await db.query(`INSERT INTO usergroups VALUES (NULL, ?)`, [
      `${dbData[0].firstname} ${dbData[0].lastname}, ${dbData[1].firstname} ${dbData[1].lastname}...`
    ])
    const [result2] = await sendAdminMessage(`Użytkownik ${name} utworzył grupę`, result.insertId)
    for (const user of users) {
      await addUserToGroup(result.insertId, user)
    }
    return {
      lastMessageId: result2.insertId,
      id: result.insertId,
      name: `${dbData[0].firstname} ${dbData[0].lastname}, ${dbData[1].firstname} ${dbData[1].lastname}...`
    }
  }
}

const checkGroupBelonging = async (user, groupId) => {
  const [dbData] = await db.query(
    `SELECT id FROM groups_members WHERE groupId = ${groupId} AND userId=${user}`
  )
  return dbData.length !== 0
}

const getUserGroups = async (id) => {
  if (id !== undefined) {
    const [dbData] = await db.query(
      `SELECT groups_members.groupId, groups_members.readGroup, max(messages.id) as lastMessageId FROM groups_members LEFT JOIN messages ON messages.groupId = groups_members.groupId WHERE groups_members.userId = ${id} GROUP BY groups_members.groupId`
    )
    const returnArray = []
    if (dbData.length > 0) {
      for (const data of dbData) {
        if (data.groupId !== null && data.groupId !== undefined) {
          const groupId = data.groupId
          const [groupData] = await db.query(`SELECT groupName FROM usergroups WHERE id=${groupId}`)
          returnArray.push({
            lastMessageId: data.lastMessageId,
            groupName: groupData[0].groupName,
            groupId: groupId,
            read: data.readGroup
          })
        }
      }
    }
    return returnArray
  }
  return
}

const changeGroupNameQuery = async (id, name) => {
  await db.query('UPDATE usergroups SET groupName = ? WHERE id = ?', [name, id])
  return true
}

const searchGroupsQuery = async (group) => {
  if (group) {
    const [dbData] = await db.query(
      `SELECT id, groupName FROM usergroups WHERE usergroups.groupName LIKE '${group}%'`
    )
    return dbData
  }
}

export {
  getGroupName,
  getGroupMessages,
  getGroupMembers,
  addGroupMessage,
  createGroup,
  getUserGroups,
  addUserToGroup,
  checkGroupBelonging,
  changeGroupNameQuery,
  searchGroupsQuery,
  removeUserFromGroup
}
