import asyncHandler from 'express-async-handler'
import fs from 'fs'
import { io } from '../server.js'
import { getConversationMessages, addConversationMessage } from '../mysql/conversationsQuery.js'
import {
  getGroupMembers,
  addGroupMessage,
  getGroupMessages,
  getUserGroups,
  searchGroupsQuery
} from '../mysql/groupsQuery.js'
import { getMessage, getUserChats, searchUsersQuery, checkBelonging } from '../mysql/usersQuery.js'

const compileData = async (dbData) => {
  const returnData = []
  for (const data of dbData) {
    let file = false
    let fileData,
      fileName,
      filePrefix = null
    if (data.file) {
      const [name, extension] = data.fileName.split('.')
      const filePath = `./server/uploads/${name}_${data.id}.${extension}`
      try {
        fileData = await fs.promises.readFile(filePath, 'base64')
        file = true
        fileName = data.fileName
        filePrefix = data.filePrefix
      } catch (err) {
        console.error(`Error reading file: ${err}`)
      }
    }
    returnData.unshift({
      id: data.id,
      message: data.message,
      senderId: data.senderId,
      senderName: `${data.firstname} ${data.lastname}`,
      file: file,
      fileData: fileData,
      fileName: fileName,
      filePrefixData: filePrefix
    })
  }
  return returnData
}

const getHistory = asyncHandler(async (req, res) => {
  const { recipient, group, offset } = req.body

  if (recipient) {
    const dbData = await getConversationMessages(recipient, req.session.UserId, offset)
    res.json(await compileData(dbData))
  } else if (group) {
    const dbData = await getGroupMessages(group, offset)
    res.json(await compileData(dbData))
  } else {
    res.status(400)
    throw new Error('Nie znaleziono użytkownika')
  }
})

const sendFile = asyncHandler(async (req, res) => {
  const { fileName, fileData, recipient, group, prefix } = req.body
  const [name, extension] = fileName.split('.')
  const stringId = req.session.UserId.toString()
  const senderName = `${req.session.firstname} ${req.session.lastname}`
  let newFileName
  if (recipient) {
    const result = await addConversationMessage('', stringId, recipient, true, fileName, prefix)
    newFileName = `${name}_${result}.${extension}`
    fs.writeFileSync(`./server/uploads/${newFileName}`, fileData, 'base64')
    io.to(recipient.toString()).emit('receive-message', {
      id: result,
      sender: stringId,
      text: '',
      senderName: senderName,
      groupId: null,
      file: true
    })
    io.to(req.session.UserId.toString()).emit('receive-message', {
      id: result,
      sender: stringId,
      text: '',
      senderName: 'Ty',
      groupId: group,
      file: true
    })
    res.status(200).json('Success')
  } else if (group) {
    const result = await addGroupMessage(
      '',
      req.session.UserId.toString(),
      group.toString(),
      true,
      fileName,
      prefix
    )
    newFileName = `${name}_${result}.${extension}`
    fs.writeFileSync(`server/uploads/${newFileName}`, fileData, 'base64')
    const [data] = await getGroupMembers(group.toString())
    data.forEach((user) => {
      if (user.userId && user.userId.toString() !== stringId.toString()) {
        io.to(user.userId.toString()).emit('receive-message', {
          id: result,
          sender: stringId,
          text: '',
          senderName: senderName,
          groupId: group,
          file: true
        })
      }
    })
    io.to(req.session.UserId.toString()).emit('receive-message', {
      id: result,
      sender: stringId,
      text: '',
      senderName: senderName,
      groupId: group,
      file: true
    })
    res.status(200).json('Success')
  } else {
    res.status(400)
    throw new Error('Nie znaleziono użytkownika')
  }
})

const getFile = asyncHandler(async (req, res) => {
  const getResult = await checkBelonging(req.session.UserId, req.body.messageId)
  if (getResult) {
    const [dbData] = await getMessage(req.body.messageId)
    const [name, extension] = dbData[0].fileName.split('.')
    const filePath = `./server/uploads/${name}_${dbData[0].id}.${extension}`
    let fileData,
      file,
      fileName,
      filePrefix = null
    try {
      fileData = await fs.promises.readFile(filePath, 'base64')
      file = true
      fileName = dbData[0].fileName
      filePrefix = dbData[0].filePrefix
    } catch (err) {
      console.error(`Error reading file: ${err}`)
    }
    res
      .status(200)
      .json({ file: file, fileName: fileName, fileData: fileData, filePrefix: filePrefix })
  } else {
    res.status(400).json('Nie masz dostępu do pliku')
  }
})

const getConversations = asyncHandler(async (req, res) => {
  if (req.session.UserId) {
    const id = req.session.UserId
    const chats = await getUserChats(id)
    const groups = await getUserGroups(id)

    res.status(200).json([...chats, ...groups])
  } else {
    res.json({})
  }
})

const searchUsers = asyncHandler(async (req, res) => {
  const { user } = req.body
  const data = await searchUsersQuery(req.session.UserId, user)
  const returnArray = data.map((data) => {
    if (!data) return

    let file
    if (data.pfp === null) {
      file = ''
    } else {
      file = fs.readFileSync(`./server/uploads/pfps/${data.pfp}`, 'base64')
    }

    return { ...data, pfp: file }
  })
  res.status(200).json(returnArray)
})

const searchGroups = asyncHandler(async (req, res) => {
  const { group } = req.body
  const data = await searchGroupsQuery(group)
  res.status(200).json(data)
})

export { getHistory, sendFile, getFile, getConversations, searchUsers, searchGroups }
