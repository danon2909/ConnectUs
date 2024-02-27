import asyncHandler from 'express-async-handler'
import { checkGroupBelonging, changeGroupNameQuery, getGroupMembers } from '../mysql/groupsQuery.js'
import { sendAdminMessage } from '../mysql/messagesQuery.js'
import { io } from '../server.js'
import { getPersonals } from '../mysql/usersQuery.js'
import fs from 'fs'

const changeGroupName = asyncHandler(async (req, res) => {
  const group = req.body.group
  const belonging = await checkGroupBelonging(req.session.UserId, group)
  if (belonging) {
    const name = req.body.name
    if (name != '' && name) {
      await changeGroupNameQuery(group, name)
      const message = `${req.session.firstname} ${req.session.lastname} zmienił nazwę grupy na ${name}`
      await sendAdminMessage(message, group)
      const [users] = await getGroupMembers(group)
      for (const user of users) {
        io.to(user.userId.toString()).emit('change-name', {
          groupId: parseInt(group),
          name: name
        })
      }
    }
  }
})

const getGroupMembersController = async (req, res) => {
  const [members] = await getGroupMembers(req.body.group)
  const isInGroup = members.find((member) => member.userId === req.session.UserId)
  if (isInGroup) {
    const returnArray = []
    for (const member of members) {
      const personals = await getPersonals(member.userId)
      if (!personals) return
      let file
      if (personals.pfp === null) {
        file = ''
      } else {
        file = fs.readFileSync(`./server/uploads/pfps/${personals.pfp}`, 'base64')
      }
      returnArray.push({ ...{ ...personals, pfp: file }, id: member.userId })
    }
    res.status(200).json({ members: returnArray })
    return
  }
  res.status(200).json({ message: 'Nie jesteś w tej grupie' })
}

export { changeGroupName, getGroupMembersController }
