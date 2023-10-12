const { Validator } = require('../models/validate.js')
const { formidable } = require('formidable')

module.exports = {
    
    //Uses FindOne(), filtering for matching email and password
    //Returns User
    authUser: (app, db) => {
        app.post('/api/login', async (req, res) => {
            let creds = req.body
            let validate = new Validator(res)
            try {
                let user = await db.authUser(creds.email, creds.password)
                console.log(`Authorised user: ${user.name}`)
                validate.success(user)
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },
    

    //Uses FindOne(), returning User
    getUser: (app, db) => {
        app.get('/api/user/:id', async (req, res) => {
            let validate = new Validator(res)
            try {
                let user = await db.getUser(req.params.id)
                console.log(`Got user: ${user.name}`)
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
        app.get('/api/user/byGroup/:id', async (req, res) => {
            let validate = new Validator(res)
            try {
                let id = req.params.id
                let groupUsers = await db.getUsersByGroup(id)
                console.log(`Got users for group: ${id}`)
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
            let {email, username, password} = req.body
            let validate = new Validator(res)
            try {
                let user = await db.createUser(username, email, password)
                console.log(user)
                console.log(`Created user: ${user.name}`)
                validate.success(user)
            } catch (err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    },

    //Uses formidable to upload image to server, returns the filename
    uploadProfilePic: (app, db, path) => {
        app.post('/api/user/upload', async (req, res) => {
            let validate = new Validator(res)
            const form = formidable({
            uploadDir: path,
            keepExtensions: true
            });

            try {
                let [fields, files] = await form.parse(req)
                let userId = fields.userId
                console.log(files.img[0])
                await db.updateUserProfilePic(userId[0], files.img[0].newFilename)
            
                validate.success({imgUrl: files.img[0].newFilename})
            } catch(err) {
                console.log(err)
                validate.error(err)
            }
        });
    },

    //Uses findOneAndUpdate(), returns the updated user
    editUser: (app, db) => {
        app.post('/api/editUser', async (req, res) => {
            let validate = new Validator(res)
            try {
                
                let user = await db.updateUser(req.body)
                console.log(user)
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
                let user = db.delUser(req.body.id)

                validate.success({deleted: user})
            } catch(err) {
                console.log(`Error occurred: ${err}`)
                validate.error(err)
            }
        })
    }
}