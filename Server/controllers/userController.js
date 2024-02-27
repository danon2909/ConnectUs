import asyncHandler from 'express-async-handler'
import bcrypt from 'bcrypt'
import ldap from 'ldapjs'
import dotenv from 'dotenv'
import {
  getAllUsers,
  createUser,
  getPassword,
  changePasswordQuery,
  getPfpName,
  changeNameQuery,
  changePfpQuery,
  getMonthStats
} from '../mysql/usersQuery.js'
import fs from 'fs'
import { io } from '../server.js'

dotenv.config()

const options = {
  url: process.env.LDAP_URL
}

const signupUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, login, password } = req.body

  if (!firstname || !lastname || !login || !password) {
    res.status(400)
    throw new Error('Nie wypełniono wszystkich pól')
  }
  const dbData = await getAllUsers()
  const isUserExist = dbData.find((user) => user.login === login)

  if (isUserExist) {
    res.status(400)
    throw new Error('Użytkownik o takim loginie już istnieje')
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const values = [firstname, lastname, login, hashedPassword]

    const entry = {
      cn: login,
      givenName: firstname,
      sn: lastname,
      userPassword: password,
      objectClass: 'user'
    }

    await createUser(values)

    const client = ldap.createClient(options)

    client.bind(process.env.LDAP_LOGIN, process.env.LDAP_PASSWORD, (err) => {
      if (err) {
        console.error('Bind error:', err)
        return
      }
      const dn = `cn=${entry.cn},ou=${process.env.LDAP_OU_NAME},${process.env.LDAP_DC_NAME}`
      client.add(dn, entry, (err) => {
        if (err) {
          console.error('Add error:', err)
        }
        client.unbind()
      })
    })

    res.status(200).json({ message: `Użytkownik ${login} został zarejestrowany` })
  } catch (err) {
    res.status(500)
    throw new Error('Błąd bazy danych, spróbuj później')
  }
})

const loginUser = asyncHandler(async (req, res) => {
  const { login, password } = req.body
  if (!login || !password) {
    res.status(400)
    throw new Error('Nie podano loginu lub hasła')
  }

  const dbData = await getAllUsers()
  const user = dbData.find((user) => user.login === login)
  if (!user) {
    res.status(400)
    throw new Error('Nie znaleziono użytkownika')
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    res.status(400)
    throw new Error('Niepoprawne hasło')
  }

  req.session.firstname = user.firstname
  req.session.lastname = user.lastname
  req.session.isLoggedIn = true
  req.session.UserId = user.id
  req.session.admin = false
  let admin = 0
  if (user.id === 0) {
    admin = 1
    req.session.admin = true
  }
  res.status(200).json({ message: 'Zalogowano', admin: admin })
})

const getUserId = asyncHandler(async (req, res) => {
  if (req.session.admin) {
    res.json({ message: 'admin' })
    return
  }

  if (req.session.isLoggedIn === true) {
    res.json({
      userId: parseInt(req.session.UserId),
      firstName: req.session.firstname,
      lastName: req.session.lastname
    })
    return
  }
  res.json({ message: 'nl' })
})

const changePassword = asyncHandler(async (req, res) => {
  if (!req.session.UserId && req.session.UserId !== 0)
    return res.status(404).json({ message: 'Błąd użytkownika' })
  const [password] = await getPassword(req.session.UserId)
  const isPasswordCorrect = await bcrypt.compare(req.body.oldPassword, password.password)
  if (!isPasswordCorrect) return res.json({ message: 'Złe hasło' })
  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)
  await changePasswordQuery(req.session.UserId, hashedPassword)
  res.status(200).json({ message: 'Zmieniono hasło' })
})

const getPfp = asyncHandler(async (req, res) => {
  let userId = req.body.userId
  if (userId === undefined) userId = req.session.UserId
  const pfpName = await getPfpName(userId)
  if (!pfpName) return res.status(500)
  if (pfpName.pfp === null) {
    res.json({ file: '' }).status(200)
  } else {
    res
      .json({ file: fs.readFileSync(`./server/uploads/pfps/${pfpName.pfp}`, 'base64') })
      .status(200)
  }
})

const checkImage = (fileData) => {
  const decodedImage = Buffer.from(fileData, 'base64')

  const magicNumber = decodedImage.toString('hex', 0, 4)

  if (magicNumber.startsWith('89504e47')) {
    return { isImage: true, format: 'png' }
  } else if (magicNumber.startsWith('ffd8ff')) {
    return { isImage: true, format: 'jpeg' }
  } else if (magicNumber.startsWith('47494638')) {
    return { isImage: true, format: 'gif' }
  } else if (magicNumber.startsWith('424d')) {
    return { isImage: true, format: 'bmp' }
  } else {
    return { isImage: false }
  }
}

const changePfp = asyncHandler(async (req, res) => {
  if (!req.session.UserId) return
  const result = checkImage(req.body.fileData)
  if (!result.isImage)
    return res.status(400).json({ data: 'Podano inny plik niż zdjęcie lub nie obsługiwany format' })
  fs.writeFileSync(`./server/uploads/pfps/pfp_${req.session.UserId}`, req.body.fileData, 'base64')
  await changePfpQuery(req.session.UserId)
  res.status(200).json({})
})

const changeName = asyncHandler(async (req, res) => {
  if (!req.session.UserId) return
  const firstname = req.body.firstName
  const lastname = req.body.lastName
  const userId = req.session.UserId
  try {
    await changeNameQuery(firstname, lastname, userId)
    req.session.firstname = firstname
    req.session.lastname = lastname
    req.session.save()

    io.emit('change-name', {
      userId: parseInt(userId),
      name: `${firstname} ${lastname}`
    })
    res.status(200)
  } catch (error) {
    res.status(500)
  }
})

const logoutQuery = async (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/')
    if (!err) {
      res.status(200)
    } else {
      res.status(500)
    }
  })
}

const getStats = async (req, res) => {
  if (!req.session.UserId) return
  const { received, sent } = await getMonthStats(req.session.UserId)
  res.status(200).json({ received, sent })
}

export {
  signupUser,
  loginUser,
  getUserId,
  changePassword,
  getPfp,
  changePfp,
  changeName,
  logoutQuery,
  getStats
}
