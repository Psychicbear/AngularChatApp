let app = require('express')()
let cors = require('cors')
let http = require('http').Server(app)
const fs = require('fs/promises')
let uuid = require('uuid').v4
const bodyparser = require('body-parser')
let port = 3000;
const Users = require('./models/users')
let userData = Users.newUsers('data.json')
app.use(cors())
app.use(bodyparser.json())
app.listen(port, () => {
    console.log(`Launched local server at port ${port}`)
    console.log(userData)
})

let userRoutes = require('./routes/userRoutes')

app.post('/api/updateme', async (req, res) => {
    let user = req.body
    let validate = {success: false}
    try {
        let file = JSON.parse(await fs.readFile('data.json'))
        let idx = file.users.findIndex(val => {
            return val.id == user.id
        })
        file.users[idx] = user
        await fs.writeFile('data.json', JSON.stringify(file))
        validate.success = true
    } catch (err) {
        console.log(`Error occurred: ${err}`)
    } finally {
        res.send(validate)
    }
})


userRoutes.authUser(app, userData)
userRoutes.createUser(app, userData)
userRoutes.getUser(app, userData)
userRoutes.editUser(app, userData)

app.get('/api/groups', async (req, res) => {
    let validate = {success: false}
    try {
        let file = JSON.parse(await fs.readFile('groups.json'))
        validate = {success: true, ...file}
    } catch(err) {
        console.log(`Error occurred: ${err}`)
        validate = {...validate, error: err}
    } finally {
        //console.log(validate)
        res.send(validate)
    }
})

