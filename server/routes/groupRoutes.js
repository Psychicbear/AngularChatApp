const {Validator} = require('../models/validate')

module.exports = {  

    //Takes ID in params
    getGroup: (app, db) => {
        app.get('/api/group/:id', (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.params.id)
                let group = db.getGroup(req.params.id)
                validate = {...group.serialise(), success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },

    //Simply returns all groups
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

    // Takes ID in params
    getChannels: (app, db) => {
        app.get('/api/channels/:id', (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.params.id)
                let channels = db.getGroup(req.params.id).channels
                validate = {channels: channels, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },
    
    // Takes {name: string, desc: string}
    createGroup: (app, db) => {
        app.post('/api/addGroup', async (req, res) => {
            let {name, desc} = req.body
            let validate = new Validator(res)
            try {
                let group = db.add(name, desc)
                validate = {...group.serialise(), success: true}
                await db.saveFile()
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },
    
    // Takes {id: string, name: string, desc: string}
    editGroup: (app, db) => {
        app.post('/api/editGroup', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {id, name, desc} = req.body
                let group = db.getGroup(id)
                group.edit(name, desc)
                await db.saveFile()
                validate = {...group.serialise(), success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {id: string}
    deleteGroup: (app, db, users) => {
        app.post('/api/deleteGroup', async (req, res) => {
            let validate = new Validator(res)
            let id = req.body.id
            try {
                let removed = db.remove(id)
                let match = (user) => user.groups.find(group => group == id)
                users.getUsers(match).forEach(user => user.removeGroup(id))
                await db.saveFile()
                validate = {removed: removed, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },

    // Takes {id: string, name: string, desc: string}
    addChannel: (app, db) => {
        app.post('/api/addChannel', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {id, name, desc} = req.body
                let group = db.getGroup(id)
                group.addChannel(name, desc)
                await db.saveFile()
                validate = {...group, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {groupId: string, chanId: string, name: string, desc: string}
    editChannel: (app, db) => {
        app.post('/api/editChannel', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {groupId, chanId, name, desc} = req.body
                let group = db.getGroup(groupId)
                let channel = group.getChannel(chanId).edit(name, desc)
                await db.saveFile()
                validate = {...channel.serialise(), success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {groupId: string, chanId: string}
    deleteChannel: (app, db) => {
        app.post('/api/deleteChannel', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {groupId, chanId} = req.body
                let removed = db.getGroup(groupId).removeChannel(chanId)
                await db.saveFile()
                validate = {removed: removed, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes ID in params
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

    // Takes {userId: string, groupId: string}
    requestJoin: (app, db) => {
        app.post('/api/requestJoin', async (req, res) => {
            const {userId, groupId} = req.body
            console.log({userId, groupId})
            let validate = new Validator(res)
            try {
                let add = db.addRequest(userId, groupId)
                console.log(add)
                validate.success()
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            } 
        })
    },

    // Takes {userId: string, groupId: string}
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

    // Takes {userId: string, groupId: string}
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