const {Validator} = require('../models/validate.js')
module.exports = {
    
    //Uses FindOne(), filtering for matching email and password
    //Returns User
    authUser: (app, db) => {
        app.post('/api/login', async (req, res) => {
            let creds = req.body
            let validate = new Validator(res)
            try {
                let user = await db.authUser(creds.email, creds.password)
                console.log(user)
                validate.success(user)
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },
    

    //Uses FindOne(), returning User
    getUser: (app, db) => {
        app.get('/api/user/:id', (req, res) => {
            let validate = new Validator(res)
            try {
                console.log(req.params.id)
                let user = db.getUser(req.params.id)
                validate.success(user)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },


    //Uses Find(), finds all users in specified group
    //returns list of users as {users: groupUsers}
    getUsersByGroup: (app, db) => {
        app.get('/api/user/byGroup/:id', (req, res) => {
            let validate = new Validator(res)
            try {
                let id = req.params.id
                let match = (user) => {return user.roles.global == "super" || user.groups.find(group => group == id)}
                let groupUsers = db.getUsers(match)
                
                validate.success({users: groupUsers})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },
    

    //Uses insertOne(), returns the newly created user
    createUser: (app, db) => {
        app.post('/api/register', async (req, res) => {
            let creds = req.body
            let validate = new Validator(res)
            try {
                let user = db.addUser(creds.email, creds.username, creds.password)
                validate.success(user)
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    
    //Uses findOneAndUpdate(), returns the updated user
    editUser: (app, db) => {
        app.post('/api/editUser', async (req, res) => {
            let validate = new Validator(res)
            try {
                const {id, ...fields} = req.body
                let user = db.getUser(id)
                user.edit(fields)
                validate.success(user)
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },
    

    //Uses findOneAndDelete(), returns deleted User
    deleteUser: (app, db) => {
        app.post('/api/deleteUser', async (req, res) => {
            let validate = new Validator(res)
            try {
                let user = db.removeUser(req.body.id)
                db.getAll().forEach(group => {
                    let i = group.requests.findIndex(request => request == req.body.id)
                    group.requests.splice(i, 1)
                })

                validate.success({deleted: user})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    }
}