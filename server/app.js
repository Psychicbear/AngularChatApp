const { MongoClient } = require('mongodb')

const uri = 'mongodb://192.168.1.254:27017'


let client = new MongoClient(uri)
async function run(){
    try {
        await client.connect()
        let channels = client.db('chat').collection('channels')
        let groups = client.db('chat').collection('groups')
        
        let allGroups = await groups.find({}, {projection: {_id: 1}}).toArray()
        allGroups.forEach(async gr => {
            let newChan = {
                groupId: gr._id,
                name: 'Main',
                desc: 'Main channel for the server',
                messages: []
            }

            let attempt = await channels.insertOne(newChan)
            console.log(attempt)
        })

    } catch (err){
        console.error
        throw err
    } finally {
        await client.close()
    }
}

run()