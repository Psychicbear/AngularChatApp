const {Validator} = require('../models/validate')

module.exports = {  

    //Takes ID in params, uses find(), returns Group
    getGroup: (app, db) => {
        app.get('/api/group/:id', async (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.params.id)
                let group = await db.getGroup(req.params.id)
                validate.success(group)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    //Uses find({}) to get all Groups, returns array of Groups
    getGroups: (app, db) => {
        app.get('/api/groups', async (req, res) => {
            let validate = new Validator(res)
            try {
                let all = await db.getUserGroupsList()
                console.log(all)
                validate.success(all)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    // Takes ID in params, uses find(), returns Group
    getChannels: (app, db) => {
        app.post('/api/channels/', async (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.body)
                let channels = await db.getChannels(req.body.channels)
                console.log(channels)
                validate.success({channels: channels})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },
    
    // Takes ID in params, uses find(), returns Group
    getChannel: (app, db) => {
        app.get('/api/channels/:id', async (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.body.id)
                let channel = await db.getChannel(req.body.id)
                console.log(channel)
                validate.success(channel)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },

    // Takes {name: string, desc: string}, uses insertOne()
    // Returns created Group
    createGroup: (app, db) => {
        app.post('/api/addGroup', async (req, res) => {
            let {name, desc} = req.body
            let validate = new Validator(res)
            try {
                let group = db.createGroup(name, desc)
                validate.success(group)
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },
    
    // Takes updated user, uses findOneAndUpdate(), 
    // returns updated group
    editGroup: async (app, db) => {
        app.post('/api/editGroup', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {update} = req.body
                let group = await db.updateGroup(update)
                console.log(group)
                validate.success(group)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },

    // Takes id, uses findOneAndDelete(), returns {removed: Group}
    deleteGroup: (app, db) => {
        app.post('/api/deleteGroup', async (req, res) => {
            let validate = new Validator(res)
            let { id } = req.body
            try {
                let removed = db.delGroup(id)
                validate.success({removed: removed})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    // Takes {id: string, name: string, desc: string},
    // Uses insertOne(), returns updated Group
    addChannel: (app, db) => {
        app.post('/api/addChannel', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {id, name, desc} = req.body
                let group = db.getGroup(id)
                group.addChannel(name, desc)
                validate.success(group)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },

    // REQUIRES UPDATE TO CHANNEL COLLECTION
    // Takes {groupId: string, chanId: string, name: string, desc: string}
    // Uses findOneAndUpdate(), returns updated Group
    editChannel: (app, db) => {
        app.post('/api/editChannel', async (req, res) => {
            let validate = new Validator(res)
            try {
                let channel = await db.editChannel(req.body.channel)
                validate.success(channel)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    // REQUIRES UPDATE TO CHANNEL COLLECTION
    // Takes {groupId: string, chanId: string}, uses findOneAndUpdate(),
    // Returns removed Channel
    deleteChannel: (app, db) => {
        app.post('/api/deleteChannel', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {groupId, chanId} = req.body
                let removed = db.getGroup(groupId).removeChannel(chanId)
                validate.success({deleted: removed})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    // Takes ID in params, uses find(), returns array of Users
    getRequests: (app, db) => {
        app.get('/api/requests/:id', async (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.params.id)
                let requests = await db.getGroupRequests(req.params.id)
                console.log(requests)
                validate.success({requests: requests})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    // Takes {userId: string, groupId: string}, uses findOneAndInsert(),
    // Returns updated Group
    requestJoin: (app, db) => {
        app.post('/api/requestJoin', async (req, res) => {
            const {userId, groupId} = req.body
            console.log({userId, groupId})
            let validate = new Validator(res)
            try {
                let add = db.addRequest(userId, groupId)
                console.log(add)
                validate.success(add)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },

    // Takes {userId: string, groupId: string}, uses findOneAndUpdate(),
    // Returns the userId and updated Group as {user, joined}
    acceptRequest: (app, db) => {
        app.post('/api/acceptRequest', async (req, res) => {
            const {userId, groupId} = req.body
            let validate = new Validator(res)
            try {
                let removeReq = await db.removeRequest(userId, groupId)
                console.log(removeReq)
                let addUser = await db.addUserToGroup(userId, groupId)
                console.log(addUser)
                validate.success({userId: userId, joined: removeReq})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },

    // Takes {userId: string, groupId: string}, uses findOneAndUpdate()
    // Returns the userId and group as {user, denied}
    denyRequest: (app, db) => {
        app.post('/api/denyRequest', async (req, res) => {
            const {userId, groupId} = req.body
            let validate = new Validator(res)
            try {
                let denied = await db.removeRequest(userId, groupId)
                validate.success({user: userId, denied: denied})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },
    
}