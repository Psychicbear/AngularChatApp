const { ObjectId } = require('mongodb')
class DatabaseWrapper {
    //Takes database connection, sets the required collections
    constructor(db){
        this.db = db
        this.users = this.db.collection('users')
        this.groups = this.db.collection('groups')
        this.channels = this.db.collection('channels')
        console.log('DB Wrapper Connected')
    }

    //Create User CRUD function
    async createUser(username, email, password){
        if(await this.users.findOne({email: email})){
            throw 'User with this email already exists'
        }

        let newUser = {
            email: email, username: username, password: password, 
            groups: [], roles: {global: 'user'}
        }
        let insert = await this.users.insertOne(newUser)
        return await this.users.findOne({_id: insert.insertedId})
    }

    //Gets user matching email and password
    async authUser(email, password){
        return await this.users.findOne({email: email, password: password}, {projection: {password: 0}})
    }

    //Read User CRUD function
    async getUser(userId){
        return await this.users.findOne({_id: new ObjectId(userId)}, {projection: {password: 0}})
    }

    //Gets array of Users which have specified role for specified group
    async getUsersByRole(key, val){
        return await this.users.find({[`roles.${key}`]: val})
    }

    //Gets array of Users which have groupID within User.groups
    async getUsersByGroup(groupId){
        return await this.users.find({$or: [{groups: new ObjectId(groupId)}, {['roles.global']: 'super'}]}).toArray()
    }

    //Adds groupID to User.groups, and {groupID: 'user'} to User.roles
    async addUserToGroup(userId, groupId){
        return await this.users.findOneAndUpdate(
            {_id: new ObjectId(userId)},
            {
                $set: {[`roles.${groupId}`]: 'user'},
                $push: {groups: new ObjectId(groupId)}
            }
        )
    }

    //Promotes or demotes User within group
    async updateUserRole(userId, role, change){
        return await this.users.findOneAndUpdate(
            {_id: new ObjectId(userId)},
            {$set: {[`roles.${role}`]: change}}
        )
    }

    //Removes groupId from roles and groups
    async removeUserFromGroup(userId, groupId){
        return await this.users.findOneAndUpdate(
            {_id: new ObjectId(userId)},
            {
                $unset: {[`roles.${groupId}`]: ''},
                $pull: {groups: groupId}
            })
    }

    //Update User CRUD function
    async updateUser(user){
        let {_id, ...update} = user
        return await this.users.findOneAndUpdate({_id: new ObjectId(_id)}, {$set: update})
    }

    //Sets img attribute to user with userId
    async updateUserProfilePic(userId, img) {
        return await this.users.findOneAndUpdate({_id: new ObjectId(userId)}, {$set: {img: img}})
    }
    //Delete User CRUD function, has to remove all requests made by user 
    async delUser(id){
        let userId = new ObjectId(id)
        let deleted = await this.users.findOneAndDelete({_id: userId})
        let requests = await this.groups.updateMany({requests: userId}, {$pull: {requests: userId}})

        console.log(requests)
        return deleted
    }

    //Create Group CRUD function
    async createGroup(name, desc){
        let groupId = new ObjectId()
        let chanId = new ObjectId()

        let newChannel = {
            group: groupId, name: 'Main', 
            desc: 'Main channel for the group', messages: []
        }
        
        let newGroup = {
            name: name, desc: desc, 
            channels: [chanId], requests: []
        }
        
        let insertedChan = await this.channels.insertOne(newChannel)
        console.log(insertedChan)

        return await this.groups.insertOne(newGroup)
    }

    //Read Group CRUD function
    async getGroup(id){
        return await this.groups.findOne({_id: new ObjectId(id)})
    }

    //Gets list of groups for the user dashboard
    async getUserGroupsList(id){
        let ids = await this.users.findOne({_id: new ObjectId(id)}, {projection: {groups: 1}})
        console.log(ids)
        let userGroups = await this.groups.find(
            { _id: {$in: ids.groups} }, 
            { projection: {id: 1, name: 1, desc: 1, requests: 1 }
        }).toArray()

        let remainingGroups = await this.groups.find(
            { _id: {$nin: ids.groups} }, 
            { projection: {id: 1, name: 1, desc: 1, requests: 1} }
        ).toArray()

        return {user: userGroups, remaining: remainingGroups}
    }

    //Returns list of users which were found in group.requests
    async getGroupRequests(groupId){
        let group = await this.groups.findOne({_id: new ObjectId(groupId)})
        console.log(group.requests)
        let userRequests = await this.users.find({_id: {$in: group.requests}}).toArray()
        return userRequests
    }

    //Inserts userId to the specified group.requests 
    async addRequest(userId, groupId){
        return await this.groups.findOneAndUpdate(
            {_id: new ObjectId(groupId)}, 
            {$push: {requests: new ObjectId(userId)}}
        )
    }

    //Pulls userId from specified group.requests
    async removeRequest(userId, groupId){
        return await this.groups.findOneAndUpdate(
            {_id: new ObjectId(groupId)}, 
            {$pull: {requests: new ObjectId(userId)}}
        )
    }


    //Update Group CRUD function
    async updateGroup(group){
        return await this.groups.findOneAndUpdate({_id: new ObjectId(group._id)}, {$set: {name: group.name, desc: group.desc}})
    }
    
    //Delete Group CRUD function
    async delGroup(id){
        let deletedGroup = await this.groups.findOneAndDelete({_id: new ObjectId(id)})
        console.log(deletedGroup)

        let deletedChannels = await this.channels.deleteMany({group: {$in: deletedGroup.channels}})
        console.log(deletedChannels)

        return deletedGroup
    }

    //Create Channel CRUD function
    async addChannel(id, name, desc){
        let groupId = new ObjectId(id)
        let chanId = new ObjectId()

        let newChannel = {
            _id: chanId, group: groupId, name: name, 
            desc: desc, messages: []
        }

        let addedChan = await this.channels.insertOne(newChannel)
        console.log(addedChan)

        let updatedGroup = await this.groups.findOneAndUpdate({_id: groupId}, {$push: {channels: chanId}})
        console.log(updatedGroup)

        return addedChan
    }

    async getChannels(ids){
        let channels = ids.map(id => new ObjectId(id))
        console.log(channels)

        return await this.channels.find({_id: {$in: channels}}, {projection: {_id: 1, name: 1}}).toArray()
    }

    async getChannel(id){
        let channel = await this.channels.findOne({_id: new ObjectId(id)})
        return channel
    }

    async addMessage(id, msg){
        return await this.channels.findOneAndUpdate({_id: new ObjectId(id)}, {$push: {messages: msg}})
    }

    async editChannel(channel){
        return await this.channels.findOneAndUpdate({_id: new ObjectId(channel._id)}, {$set: {name: channel.name, desc: channel.desc}})
    }

    async delChannel(chanId){
        let deletedChan = await this.channels.findOneAndDelete({_id: new ObjectId(chanId)})
        console.log(deletedChan)

        let updateGroup = await this.groups.findOneAndUpdate({_id: deletedChan.group}, {$pull: {channels: deletedChan._id}})
        console.log(updateGroup)
        return deletedChan
    }

}

module.exports = {
    newDatabase: (db) => {return new DatabaseWrapper(db)}
}