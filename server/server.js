let app = require('express')()
let cors = require('cors')
let http = require('http').Server(app)
const fs = require('fs/promises')
let uuid = require('uuid').v4
const bodyparser = require('body-parser')
let port = 3000;
const Users = require('./models/users') 
const Groups = require('./models/groups')
let userData = Users.newUsers('users.json')
let groupData = Groups.newGroups('groups.json')
app.use(cors())
app.use(bodyparser.json())
app.listen(port, () => {
    console.log(`Launched local server at port ${port}`)
    console.log(userData)
    console.log(groupData)
})

let userRoutes = require('./routes/userRoutes')
let groupRoutes = require('./routes/groupRoutes')

userRoutes.authUser(app, userData)// api/login
userRoutes.createUser(app, userData)// api/register
userRoutes.getUser(app, userData)// api/user/:id
userRoutes.editUser(app, userData)// api/editUser
userRoutes.deleteUser(app, userData, groupData)// api/deleteUser
userRoutes.getUsersByGroup(app, userData)// api/user/byGroup/:id
groupRoutes.getGroup(app, groupData)// api/group/:id
groupRoutes.getGroups(app, groupData)// api/group/all
groupRoutes.getRequests(app, groupData)// api/requests/:id
groupRoutes.getChannels(app, groupData)// api/channels/:id
groupRoutes.createGroup(app, groupData)// api/addGroup
groupRoutes.editGroup(app, groupData)// api/editGroup
groupRoutes.deleteGroup(app, groupData, userData)// api/deleteGroup
groupRoutes.addChannel(app, groupData)// api/addChannel
groupRoutes.editChannel(app, groupData)// api/editChannel
groupRoutes.deleteChannel(app, groupData)// api/deleteChannel
groupRoutes.requestJoin(app, groupData)// api/requestJoin
groupRoutes.acceptRequest(app, groupData, userData)// api/acceptRequest
groupRoutes.denyRequest(app, groupData)// api/denyRequest



