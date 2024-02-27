import mysql from 'mysql2'
import dotenv from 'dotenv'
import Importer from 'mysql-import'
import './changeEnvFiles.js'
import fs from 'fs'

dotenv.config()

const { host, user, password, database } = {
  host: process.env.DB_IP,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
}

const db = mysql
  .createConnection({
    host: host,
    user: user,
    password: password,
    database: database
  })
  .promise()

const importDatabase = async () => {
  const importer = new Importer({ host, user, password, database })

  fs.readFile('database.sql', 'utf8', async (err, data) => {
    if (err) {
      console.error(
        'Błąd, nie odnalezion pliku database.sql, bądź nie udało się go odczytać: ',
        err
      )
      return
    }
    const modifiedData = data.replace(/placeholder/g, process.env.DB_NAME)

    fs.writeFile('import_database.sql', modifiedData, (err) => {
      if (err) {
        console.error('Błąd w tworzeniu nowej bazy danych: ', err)
        return
      }
      console.log('Nowa baza danych została stworzona!')
    })

    const folderNames = ['./server/backups', './server/uploads', './server/uploads/pfps']

    for (const folder of folderNames) {
      try {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder)
        }
      } catch {
        console.error(
          `Błąd podczas tworzenia katalogu ${folder}, prosimy o stworzenie go ręcznie, bądź ponowne urchomienie installera`
        )
      }
    }

    try {
      await importer.import('import_database.sql')
      console.log('Baza danych została zaimportowana')
      fs.unlink('import_database.sql', (err) => {
        if (err) {
          console.error('Nie udało się usunąć pliku tymczasowego')
        }
      })
    } catch (err) {
      console.error(err)
    }
  })
  setTimeout(() => {
    process.exit()
  }, 500)
}

importDatabase()
