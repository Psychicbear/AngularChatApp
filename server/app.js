const { MongoClient, ObjectId } = require('mongodb')

const uri = 'mongodb://192.168.1.254:27017'


let client = new MongoClient(uri)

let newUsers = [
    {_id: new ObjectId(), username: 'rjscho', email: 'rjscho@live.com.au', password: 'helloworld', groups: [], roles: {global: 'super'} },
    {_id: new ObjectId(), username: 'bob', email: 'bob@.com.au', password: 'password123', groups: [], roles: {global: 'admin'} },
    {_id: new ObjectId(), username: 'alice', email: 'alice@.com.au', password: 'password123', groups: [], roles: {global: 'admin'} },
    {_id: new ObjectId(), username: 'fred', email: 'fred@.com.au', password: 'password123', groups: [], roles: {global: 'user'} },
    {_id: new ObjectId(), username: 'john', email: 'john@.com.au', password: 'password123', groups: [], roles: {global: 'user'} },
]

let newGroups = []
let newChannels = []

for(let i=0; i<=4; i++){
    console.log('Creating group ' + i)
    let chanId = new ObjectId()
    let groupId = new ObjectId()
    newChannels.push({
        _id: chanId,
        group: groupId,
        name: 'Main',
        desc: 'Main channel for the group',
        messages: []
    })

    newGroups.push({_id: groupId, name: 'Group ' + (i+1), desc: '', channels: [chanId], requests: []})
}

newGroups.forEach(gr => {
    newUsers[1].groups.push(gr._id)
    newUsers[1].roles[gr._id] = 'admin'
    newUsers[2].groups.push(gr._id)
    newUsers[2].roles[gr._id] = 'user'
})

newChannels = newChannels.map(chan => {
    chan.messages = [
        {userId: newUsers[1]._id, timestamp: new Date(), content: 'Hello world'},
        {userId: newUsers[2]._id, timestamp: new Date(), content: 'Hello Bob!!!'},
    ]

    return chan
})




async function run(){
    try {
        await client.connect()
        let db = client.db('chat')
        let users = db.collection('users')
        let channels = db.collection('channels')
        let groups = db.collection('groups')
        
        users.deleteMany({})
        groups.deleteMany({})
        channels.deleteMany({})

        newUsers = await users.insertMany(newUsers)
        console.log(newUsers)

        newGroups = await groups.insertMany(newGroups)
        console.log(newGroups)
        
        newChannels = await channels.insertMany(newChannels)
        console.log(newChannels)

    } catch (err){
        console.error
        throw err
    } finally {
        await client.close()
    }
}

run()