import mysql from 'mysql2'
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

const changeChatReadStatus = async (id, otherUser, read) => {
  await db.query(
    `UPDATE chat SET read_1 = CASE WHEN user_id = ${id} AND user2_id = ${otherUser} THEN ${read} ELSE read_1 END, read_2 = CASE WHEN user_id = ${otherUser} AND user2_id = ${id} THEN ${read} ELSE read_2 END WHERE (user_id = ${id} AND user2_id = ${otherUser}) OR (user_id = ${otherUser} AND user2_id = ${id});`
  )
}

const changeGroupReadStatus = async (id, groupId, read) => {
  await db.query(`UPDATE groups_members SET readGroup = ? WHERE userId = ? AND groupId = ?`, [
    read,
    id,
    groupId
  ])
}

export { changeChatReadStatus, changeGroupReadStatus }
