module.exports = {
    authUser: (app, users) => {
        app.post('/api/login', (req, res) => {
            let creds = req.body
            let validate
            try {
                let user = users.authUser(creds.email, creds.password)
                validate = {...user.serialise(), success: true}
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },
    
    getUser: (app, users) => {
        app.get('/api/user/:id', (req, res) => {
            let validate
            try {
                console.log(req.params.id)
                let user = users.getUser(req.params.id)
                validate = {...user.serialise(), success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {...validate, error: err}
            } finally {
                res.send(validate)
            }
        })
    },

    getUsersByGroup: (app, users) => {
        app.get('/api/user/byGroup/:id', (req, res) => {
            let validate
            try {
                let id = req.params.id
                let match = (user) => {return user.roles.global == "super" || user.groups.find(group => group == id)}
                let groupUsers = users.getUsers(match)
                
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
    
    createUser: (app, users) => {
        app.post('/api/register', async (req, res) => {
            let creds = req.body
            let validate
            try {
                let user = users.addUser(creds.email, creds.username, creds.password)
                validate = {...user.serialise(), success: true}
                await users.saveFile()
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }
        })
    },

    
    editUser: (app, users) => {
        app.post('/api/editUser', async (req, res) => {
            let validate
            try {
                const {id, ...fields} = req.body
                let user = users.getUser(id)
                user.edit(fields)
                await users.saveFile()
                validate = {...user, success: true}
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate = {success: false, err: err}
            } finally {
                res.send(validate)
            }

        })
    },
    
    deleteUser: (app, users, groups) => {
        app.post('/api/deleteUser', async (req, res) => {
            let validate
            try {
                let user = users.removeUser(req.body.id)
                groups.getAll().forEach(group => {
                    let i = group.requests.findIndex(request => request == req.body.id)
                    group.requests.splice(i, 1)
                })

                await users.saveFile()
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