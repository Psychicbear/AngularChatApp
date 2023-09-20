module.exports = {
    authUser: (app, db) => {
        app.post('/api/login', (req, res) => {
            let creds = req.body
            let validate
            try {
                let user = db.authUser(creds.email, creds.password)
                validate = {...user.serialise(), success: true}
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },
    
    getUser: (app, db) => {
        app.get('/api/user/:id', (req, res) => {
            let validate
            try {
                console.log(req.params.id)
                let user = db.getUser(req.params.id)
                validate = {...user.serialise(), success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },

    getUsersByGroup: (app, db) => {
        app.get('/api/user/byGroup/:id', (req, res) => {
            let validate
            try {
                let id = req.params.id
                let match = (user) => {return user.roles.global == "super" || user.groups.find(group => group == id)}
                let groupUsers = db.getUsers(match)
                
                groupUsers = groupUsers.map(user => user.serialise())
                validate = {users: groupUsers, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },
    
    createUser: (app, db) => {
        app.post('/api/register', async (req, res) => {
            let creds = req.body
            let validate
            try {
                let user = db.addUser(creds.email, creds.username, creds.password)
                validate = {...user.serialise(), success: true}
                await db.saveFile()
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },

    
    editUser: (app, db) => {
        app.post('/api/editUser', async (req, res) => {
            let validate
            try {
                const {id, ...fields} = req.body
                let user = db.getUser(id)
                user.edit(fields)
                await db.saveFile()
                validate = {...user, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },
    
    deleteUser: (app, db) => {
        app.post('/api/deleteUser', async (req, res) => {
            let validate
            try {
                let user = db.removeUser(req.body.id)
                db.getAll().forEach(group => {
                    let i = group.requests.findIndex(request => request == req.body.id)
                    group.requests.splice(i, 1)
                })

                await db.saveFile()
                validate = {...user.serialise(), success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    }
}