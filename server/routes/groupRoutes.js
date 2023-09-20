module.exports = {  

    //Takes ID in params
    getGroup: (app, db) => {
        app.get('/api/group/:id', (req, res) => {
            let validate
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
        app.get('/api/groups', (req, res) => {
            let validate
            try {
                let all = db.getAll().map(group => group.serialise())
                console.log(all[2])
                validate = {groups: all, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },

    // Takes ID in params
    getRequests: (app, db) => {
        app.get('/api/requests/:id', (req, res) => {
            let validate
            try {
                console.log(req.params.id)
                let requests = db.getGroup(req.params.id).requests
                validate = {requests: requests, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },

    // Takes ID in params
    getChannels: (app, db) => {
        app.get('/api/channels/:id', (req, res) => {
            let validate
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
            let validate
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
            let validate
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
            let validate
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
            let validate
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
            let validate
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
            let validate
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

    // Takes {userId: string, groupId: string}
    requestJoin: (app, db) => {
        app.post('/api/requestJoin', async (req, res) => {
            const {userId, groupId} = req.body
            console.log({userId, groupId})
            let validate
            try {
                let group = db.getGroup(groupId)
                let req = group.requestJoin(userId)
                await db.saveFile()
                validate = {user: req, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {userId: string, groupId: string}
    acceptRequest: (app, db, users) => {
        app.post('/api/acceptRequest', async (req, res) => {
            const {userId, groupId} = req.body
            let validate
            try {
                let group = db.getGroup(groupId)
                group.removeRequest(userId)
                users.getUser(userId).addToGroup(groupId)
                await db.saveFile()
                validate = {user: userId, joined: groupId, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {userId: string, groupId: string}
    denyRequest: (app, db) => {
        app.post('/api/denyRequest', async (req, res) => {
            const {userId, groupId} = req.body
            let validate
            try {
                db.getGroup(groupId).removeRequest(userId)
                await db.saveFile()
                validate = {user: userId, denied: groupId, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },
    
}