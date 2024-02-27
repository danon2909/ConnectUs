import fs from 'fs'
import mysqlDump from 'mysqldump'
import Importer from 'mysql-import'
import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const { host, user, password, database } = {
  host: process.env.DB_IP,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}

const db = mysql
  .createConnection({
    host: host,
    user: user,
    password: password,
    database: database
  })
  .promise()

const getBackups = async (res) => {
  const folderPath = './server/backups'
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      res.status(500).json({})
      return
    }
    const fileStats = files.map((file) => {
      const filePath = `${folderPath}/${file}`
      return { name: file, modifiedTime: fs.statSync(filePath).mtime }
    })

    const sortedFiles = fileStats.sort((a, b) => b.modifiedTime - a.modifiedTime)
    res.status(200).json({ sortedFiles })
  })
}

const installBackupQuery = async (backup) => {
  const path = `./server/backups/${backup}`
  fs.readFile(path, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading backup file:', err)
      return
    }
    const modifiedData = data.replace(/placeholder/g, database)
    const splittedPath = path.split('.sql')
    const modifiedPath = splittedPath[0] + '-temp.sql'
    fs.writeFileSync(modifiedPath, modifiedData)
    await importDatabase(modifiedPath)
    fs.unlink(modifiedPath, (err) => {
      if (err) {
        console.log('Nie udało się usunąć pliku tymczasowego')
      }
    })
  })
}

const createBackupQuery = async (server) => {
  let name = await saveDatabase(server)
  return name
}

const saveDatabase = async (server) => {
  const date = new Date()
  const fileDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
  const filePath = server
    ? `./server/backups/auto_backup_${fileDate}.sql`
    : `./server/backups/backup_${fileDate}.sql`
  try {
    await mysqlDump({
      connection: {
        host: host,
        user: user,
        password: password,
        database: database
      },
      dump: {
        data: {
          format: false
        }
      },
      dumpToFile: filePath
    })
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading backup file:', err)
        return
      }

      // Podziel dane na linie
      const lines = data.split('\n')

      // Filtruj linie, usuwając te zaczynające się na # lub /*
      const filteredLines = lines.filter(
        (line) =>
          !line.trim().startsWith('#') && !line.trim().startsWith('/*') && line.trim() !== ''
      )
      const filteredData = filteredLines.join('\n')
      const test = filteredData.trim()

      const modifiedDump = test.replace(/INSERT/g, 'INSERT IGNORE')
      const saveDump =
        `DROP DATABASE placeholder;
CREATE DATABASE placeholder;
USE placeholder;\n` +
        modifiedDump +
        "\nUPDATE `users` SET `id` = 0 WHERE `login` = 'Admin';"

      fs.writeFileSync(filePath, saveDump)
    })
    return `backup_${fileDate}.sql`
  } catch (error) {
    console.error('Error generating MySQL dump:', error)
  }
}

const importDatabase = async (filePath) => {
  const importer = new Importer({ host, user, password, database })

  try {
    await importer.import(filePath)
    console.log(`Database imported.`)
  } catch (err) {
    console.error(err)
  }
}

const getCountQuery = async () => {
  const [dbData] = await db.query(
    'SELECT COUNT(DISTINCT users.id) AS user_count, COUNT(DISTINCT g.id) AS group_count FROM (SELECT id FROM users WHERE id != 0) AS users LEFT JOIN  (SELECT id FROM usergroups) AS g ON 1=1'
  )
  if (!dbData[0]) return
  return { users: dbData[0].user_count, groups: dbData[0].group_count }
}

const adminDeleteQuery = async (userId, groupId) => {
  if (userId) {
    await db.query('DELETE FROM users WHERE id=?', [userId])
    await db.query('DELETE FROM chat WHERE user_id = ? OR user2_id = ?', [userId, userId])
  } else {
    await db.query('DELETE FROM usergroups WHERE id=?', [groupId])
    await db.query('DELETE FROM groups_members WHERE groupId=?', [groupId])
  }
}

export { getBackups, installBackupQuery, createBackupQuery, getCountQuery, adminDeleteQuery }
