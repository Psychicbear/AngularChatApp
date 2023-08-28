let app = require('express')()
let cors = require('cors')
let http = require('http').Server(app)
const fs = require('fs/promises')
let uuid = require('uuid').v4
const bodyparser = require('body-parser')
let port = 3000;
app.use(cors())
app.use(bodyparser.json())
app.listen(port, () => {
    console.log(`Launched local server at port ${port}`)
})


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


// Takes data = {email: string, password: string}, sends {success: boolean} to client
app.post('/api/login', async (req, res) => {
    let creds = req.body
    let validate = {success: false}
    try {
        let file = JSON.parse(await fs.readFile('data.json'))
        let authUser = file.users.find((value) => {
            return value.email == creds.email && value.password == creds.password
        })
        const {password, ...response} = authUser
        validate.success = true
        validate = {...response ,...validate}
    } catch (err) {
        console.log(`Error occurred: ${err}`)
    } finally {
        res.send(validate)
    }
})

app.post('/api/register', async (req, res) => {
    let creds = req.body
    let validate = {success: false}
    try {
        let file = JSON.parse(await fs.readFile('data.json'))
        if(file.users.find((val) => { return val.username == creds.username || val.email == creds.email})){
            throw "Account already exists with this username or email"
        } else {
            let newuser = {...creds, id: uuid(), roles: [], groups: []}
            console.log(newuser)
            file.users.push(newuser)
            await fs.writeFile('data.json', JSON.stringify(file))
            const {password, ...valuser} = newuser
            validate = {...valuser, success: true}
        }
    } catch(err) {
        console.log(`Error occurred: ${err}`)
        validate = {...validate, error: err}
    } finally {
        res.send(validate)
    }
})
