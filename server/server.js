let app = require('express')()
let cors = require('cors')
let http = require('http').Server(app)
const fs = require('fs')
const bodyparser = require('body-parser')
let port = 3000;
app.use(cors())
app.use(bodyparser.json())
app.listen(port, () => {
    console.log(`Launched local server at port ${port}`)
})

// Takes data = {email: string, password: string}, sends {success: boolean} to client
app.post('/api/login', (req, res) => {
    let creds = req.body
    console.log(creds)
    let validate = {success: false}
    fs.readFile('data.json', (err, data) => {
        let file = JSON.parse(data)
        console.log(file)
        let authUser = file.users.find((value) => {
            return value.email == creds.email && value.password == creds.password
        })
        console.log(authUser)
        if(authUser){
            validate.success = true
        }
        console.log(validate.success)
        res.send(validate)
    })
})
