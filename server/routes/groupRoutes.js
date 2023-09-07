module.exports = {  

    //Takes ID in params
    getGroup: (app, groups) => {
        app.get('/api/group/:id', (req, res) => {
            let validate
            try {
                console.log(req.params.id)
                let group = groups.getGroup(req.params.id)
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
    getGroups: (app, groups) => {
        app.get('/api/groups', (req, res) => {
            let validate
            try {
                let all = groups.getAll()
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
    getRequests: (app, groups) => {
        app.get('/api/requests/:id', (req, res) => {
            let validate
            try {
                console.log(req.params.id)
                let requests = groups.getGroup(req.params.id).requests
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
    getChannels: (app, groups) => {
        app.get('/api/channels/:id', (req, res) => {
            let validate
            try {
                console.log(req.params.id)
                let channels = groups.getGroup(req.params.id).channels
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
    createGroup: (app, groups) => {
        app.post('/api/addGroup', async (req, res) => {
            let {name, desc} = req.body
            let validate
            try {
                let group = groups.add(name, desc)
                validate = {...group.serialise(), success: true}
                await groups.saveFile()
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },
    
    // Takes {id: string, name: string, desc: string}
    editGroup: (app, groups) => {
        app.post('/api/editGroup', async (req, res) => {
            let validate
            try {
                const {id, name, desc} = req.body
                let group = groups.getGroup(id)
                group.edit(name, desc)
                await groups.saveFile()
                validate = {...group, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {id: string}
    deleteGroup: (app, groups) => {
        app.post('/api/deleteGroup', async (req, res) => {
            let validate
            try {
                let removed = groups.remove(req.body.id)
                await groups.saveFile()
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
    addChannel: (app, groups) => {
        app.post('/api/addChannel', async (req, res) => {
            let validate
            try {
                const {id, name, desc} = req.body
                let group = groups.getGroup(id)
                group.addChannel(name, desc)
                await groups.saveFile()
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
    editChannel: (app, groups) => {
        app.post('/api/editChannel', async (req, res) => {
            let validate
            try {
                const {groupId, chanId, name, desc} = req.body
                let group = groups.getGroup(groupId)
                group.getChannel(chanId).edit(name, desc)
                await groups.saveFile()
                validate = {...group, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },

    // Takes {groupId: string, chanId: string}
    deleteChannel: (app, groups) => {
        app.post('/api/deleteChannel', async (req, res) => {
            let validate
            try {
                const {groupId, chanId} = req.body
                let removed = groups.getGroup(groupId).removeChannel(chanId)
                await groups.saveFile()
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
    requestJoin: (app, groups) => {
        app.post('/api/requestJoin', async (req, res) => {
            const {userId, groupId} = req.body
            console.log({userId, groupId})
            let validate
            try {
                let group = groups.getGroup(groupId)
                let req = group.requestJoin(userId)
                await groups.saveFile()
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
    acceptRequest: (app, groups, users) => {
        app.post('/api/acceptRequest', async (req, res) => {
            const {userId, groupId} = req.body
            let validate
            try {
                let group = groups.getGroup(groupId)
                group.removeRequest(userId)
                users.getUser(userId).addToGroup(groupId)
                await groups.saveFile()
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
    denyRequest: (app, groups) => {
        app.post('/api/denyRequest', async (req, res) => {
            const {userId, groupId} = req.body
            let validate
            try {
                groups.getGroup(groupId).removeRequest(userId)
                await groups.saveFile()
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