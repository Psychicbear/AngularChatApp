let app = require('express')()
let cors = require('cors')
let http = require('http')
const fs = require('fs')
let port = 3000;
app.use(cors)
app.listen(port, () => {
    console.log(`Launched local server at port ${port}`)
})

// Takes data = {username: string, password: string}, sends {success: boolean} to client
app.post('/api/login', (req, res) => {
    let creds = req.data
    let validate = {success: false}
    fs.readFile('data.json', (err, data) => {
        let file = JSON.parse(data)
        if(file.users.find((user) => {user.username == creds.username && user.password == creds.pass})){
            validate.success = true
        }
    })
    res.send(validate)
})
