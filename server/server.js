let app = require('express')()
let cors = require('cors')
let http = require('http').Server(app)
const fs = require('fs/promises')
let uuid = require('uuid').v4
const { MongoClient } = require('mongodb')
let connection = new MongoClient('mongodb://192.168.1.254:27017/')
let db
const bodyparser = require('body-parser')
let port = 3000;
const Users = require('./models/users') 
const Groups = require('./models/groups')
// let userData = Users.newUsers('users.json')
// let groupData = Groups.newGroups('groups.json')
app.use(cors())
app.use(bodyparser.json())
app.listen(port, async () => {
    console.log(`Launched local server at port ${port}`)
    await connection.connect()
    db = require('./models/database').newDatabase(connection.db('chat'))

    userRoutes.authUser(app, db)// api/login
    userRoutes.createUser(app, db)// api/register
    userRoutes.getUser(app, db)// api/user/:id
    userRoutes.editUser(app, db)// api/editUser
    userRoutes.deleteUser(app, db)// api/deleteUser
    userRoutes.getUsersByGroup(app, db)// api/user/byGroup/:id
    groupRoutes.getGroup(app, db)// api/group/:id
    groupRoutes.getGroups(app, db)// api/group/all
    groupRoutes.getRequests(app, db)// api/requests/:id
    groupRoutes.getChannels(app, db)// api/channels/:id
    groupRoutes.createGroup(app, db)// api/addGroup
    groupRoutes.editGroup(app, db)// api/editGroup
    groupRoutes.deleteGroup(app, db)// api/deleteGroup
    groupRoutes.addChannel(app, db)// api/addChannel
    groupRoutes.editChannel(app, db)// api/editChannel
    groupRoutes.deleteChannel(app, db)// api/deleteChannel
    groupRoutes.requestJoin(app, db)// api/requestJoin
    groupRoutes.acceptRequest(app, db)// api/acceptRequest
    groupRoutes.denyRequest(app, db)// api/denyRequest

})

let userRoutes = require('./routes/userRoutes')
let groupRoutes = require('./routes/groupRoutes')




