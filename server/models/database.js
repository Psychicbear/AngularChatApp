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
        let newUser = {
            email: email, username: username, password: password, 
            groups: [], roles: {global: 'user'}
        }
        return await this.users.insertOne(newUser)
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
        return await this.users.find({groups: new ObjectId(groupId)}).toArray()
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
        return await this.users.findOneAndUpdate({_id: new ObjectId(user.id)}, {$set: user})
    }
    //Delete User CRUD function
    async delUser(id){
        return await this.users.findOneAndDelete({_id: new ObjectId(id)})
    }

    //Create Group CRUD function
    async createGroup(name, desc){
        let newGroup = {
            name: name, desc: desc, 
            channels: [], 
            requests: []
        }

        this.groups.insertOne(newGroup)
    }

    //Read Group CRUD function
    async getGroup(id){
        return await this.groups.findOne({_id: new ObjectId(id)})
    }

    //Gets list of groups for the user dashboard
    async getUserGroupsList(groups=[]){
        let ids = groups.map(id => ObjectId(id))
        let userGroups = await this.groups.find(
            { _id: {$in: ids} }, 
            { projection: {id: 1, name: 1, desc: 1, requests: 1 }
        }).toArray()

        let remainingGroups = await this.groups.find(
            { _id: {$nin: ids} }, 
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
    async updateGroup(user){
        return await this.groups.findOneAndUpdate({_id: new ObjectId(user.id)}, {$set: user})
    }
    
    //Delete Group CRUD function
    async delGroup(id){
        return await this.groups.findOneAndDelete({_id: new ObjectId(id)})
    }

    //Create Channel CRUD function
    async addChannel(groupId, name, desc){
        let newChannel = {
            name: name, desc: desc, 
            messages: []
        }

        this.groups.insertOne(newChannel)
    }

}

module.exports = {
    newDatabase: (db) => {return new DatabaseWrapper(db)}
}