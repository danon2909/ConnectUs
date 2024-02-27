import { getPersonals, setActivityStatus } from '../mysql/usersQuery.js'
import {
  addConversationMessage,
  checkChat,
  createChat,
  getMessageReceivers,
  deleteMessageQuery
} from '../mysql/conversationsQuery.js'
import {
  addGroupMessage,
  getGroupMembers,
  createGroup,
  addUserToGroup,
  checkGroupBelonging,
  getGroupName,
  removeUserFromGroup
} from '../mysql/groupsQuery.js'
import { changeGroupReadStatus, changeChatReadStatus } from '../mysql/statusQuery.js'
import fs from 'fs'

const SocketSession = (socket) => {
  const id = socket.request.session.UserId
  if (id !== undefined) {
    const stringId = id.toString()
    socket.join(stringId)

    const firstname = socket.request.session.firstname
    const lastname = socket.request.session.lastname
    const senderName = `${firstname} ${lastname}`
    const status = socket.request.session.status || 'Online'

    setActivityStatus(status, stringId)
    socket.broadcast.emit('changingStatus', {
      userId: stringId,
      status: status
    })
    socket.on('change-status', async ({ status }) => {
      if (status === 'Online' || status === 'dnd') {
        const showStatus = status === 'dnd' ? 'Nie przeszkadzać' : 'Online'
        socket.request.session.status = showStatus
        socket.request.session.save()
        setActivityStatus(status, stringId)
        socket.broadcast.emit('changingStatus', {
          userId: stringId,
          status: showStatus
        })
      }
    })

    socket.on('disconnect', () => {
      setActivityStatus('Offline', stringId)
      socket.broadcast.emit('changingStatus', {
        userId: stringId,
        status: 'Offline'
      })
    })

    socket.on('delete-message', async ({ id }) => {
      const receivers = await getMessageReceivers(id)
      const status = await deleteMessageQuery(stringId, id)
      if (status && receivers) {
        socket.nsp.to(stringId).emit('delete-message', {
          id: id
        })
        if (typeof receivers === 'object') {
          receivers.forEach((receiver) => {
            socket.to(receiver.userId.toString()).emit('delete-message', {
              id: id
            })
          })
          return
        }
        socket.to(receivers.toString()).emit('delete-message', {
          id: id
        })
      }
    })

    socket.on('create-group', async ({ users }) => {
      const { id, name, lastMessageId } = await createGroup(
        [stringId, ...users],
        `${firstname} ${lastname}`
      )
      users.forEach((user) => {
        socket.to(user.toString()).emit('create-conversation', {
          lastMessageId: lastMessageId,
          read: 0,
          groupId: id,
          groupName: name
        })
      })
      socket.nsp.to(stringId).emit('create-conversation', {
        lastMessageId: lastMessageId,
        read: 0,
        groupId: id,
        groupName: name
      })
    })

    socket.on('add-to-group', async ({ group, users }) => {
      const belong = await checkGroupBelonging(stringId, group)
      if (belong) {
        const name = await getGroupName(group)
        for (const user of users) {
          const { lastMessageId } = await addUserToGroup(group, user, stringId)
          socket.to(user.toString()).emit('create-conversation', {
            lastMessageId: lastMessageId,
            read: 0,
            groupId: group,
            groupName: name
          })
        }
      }
    })

    socket.on(
      'update-conversation-status',
      async ({ otherUser: otherUser, groupId: groupId, read: read }) => {
        if (!groupId && !otherUser) return
        groupId
          ? changeGroupReadStatus(stringId, groupId, read)
          : changeChatReadStatus(stringId, otherUser, read)
      }
    )

    socket.on('leave-group', async ({ group: group }) => {
      removeUserFromGroup(group, stringId)
    })

    socket.on('send-message', async ({ recipient, groupId, text }) => {
      if (recipient && text !== undefined && text !== '') {
        const lastId = await addConversationMessage(text, stringId, recipient)

        const isChat = await checkChat(lastId)
        if (!isChat) {
          createChat(stringId, recipient)
          const personals = await getPersonals(recipient)
          let filee
          if (!personals) return
          if (!personals.pfp) {
            filee = ''
          } else {
            filee = fs.readFileSync(`./server/uploads/pfps/${personals.pfp}`, 'base64')
          }
          socket.nsp.to(stringId).emit('create-conversation', {
            lastMessageId: lastId,
            read: 1,
            otherUser: parseInt(recipient),
            pfp: filee,
            userName: `${personals.firstname} ${personals.lastname}`,
            status: personals.status === 'DND' ? 'Nie przeszkadzać' : personals.status
          })
          const data = await getPersonals(stringId)
          let file
          if (!data) return
          if (!data.pfp) {
            file = ''
          } else {
            file = fs.readFileSync(`./server/uploads/pfps/${data.pfp}`, 'base64')
          }
          socket.to(recipient).emit('create-conversation', {
            lastMessageId: lastId,
            read: 0,
            otherUser: parseInt(stringId),
            pfp: file,
            userName: `${firstname} ${lastname}`,
            status: data.status === 'DND' ? 'Nie przeszkadzać' : data.status
          })
        }
        socket.to(recipient).emit('receive-message', {
          id: lastId,
          sender: stringId,
          text: text,
          senderName: senderName,
          groupId: null
        })
        socket.nsp.to(stringId).emit('receive-message', {
          id: lastId,
          sender: stringId,
          text: text,
          senderName: 'Ty',
          groupId: null
        })
        changeChatReadStatus(recipient, stringId, 0)
      } else if (groupId && text !== undefined && text !== '') {
        const lastId = await addGroupMessage(text, stringId, groupId)

        const [data] = await getGroupMembers(groupId)
        data.forEach((user) => {
          if (user.userId && user.userId.toString() !== stringId.toString()) {
            socket.to(user.userId.toString()).emit('receive-message', {
              id: lastId,
              sender: stringId,
              text: text,
              senderName: senderName,
              groupId: groupId
            })
            changeGroupReadStatus(user.userId, groupId, 0)
          }
        })
        socket.nsp.to(stringId).emit('receive-message', {
          id: lastId,
          sender: stringId,
          text: text,
          senderName: 'Ty',
          groupId: null
        })
      } else {
        console.log('błąd')
      }
    })
  }
}

export { SocketSession }
