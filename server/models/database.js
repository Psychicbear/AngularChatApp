const { ObjectId } = require('mongodb')
class DatabaseWrapper {
    constructor(db){
        this.db = db
        this.users = this.db.collection('users')
        this.groups = this.db.collection('groups')
        console.log('DB Wrapper Connected')
        this.testFunc()
    }

    async testFunc(){
        console.log(await this.users.findOne())
    }

    async createUser(username, email, password){
        let newUser = {
            email: email, username: username, password: password, 
            groups: [], roles: {global: 'user'}
        }
        return await this.users.insertOne(newUser)
    }

    async authUser(email, password){
        return await this.users.findOne({email: email, password: password}, {projection: {password: 0}})
    }

    async getUser(userId){
        return await this.users.findOne({_id: new ObjectId(userId)}, {projection: {password: 0}})
    }

    async getUsersByRole(key, val){
        return await this.users.find({[`roles.${key}`]: val})
    }

    async getUsersByGroup(groupId){
        return await this.users.find({groups: new ObjectId(groupId)}).toArray()
    }

    async addUserToGroup(userId, groupId){
        return await this.users.findOneAndUpdate(
            {_id: new ObjectId(userId)},
            {
                $set: {[`roles.${groupId}`]: 'user'},
                $push: {groups: new ObjectId(groupId)}
            }
        )
    }

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

    async updateUser(user){
        return await this.users.findOneAndUpdate({_id: new ObjectId(user.id)}, {$set: user})
    }
    
    async delUser(id){
        return await this.users.findOneAndDelete({_id: new ObjectId(id)})
    }

    async createGroup(name, desc){
        let newGroup = {
            name: name, desc: desc, 
            channels: [], 
            requests: []
        }

        this.groups.insertOne(newGroup)
    }

    async getGroup(id){
        return await this.groups.findOne({_id: ObjectId(id)})
    }

    //Gets list of groups for the user dashboard
    async getUserGroupsList(groups=[]){
        let ids = groups.map(id => ObjectId(id))
        let userGroups = await this.groups.find({_id: {$in: ids}}, {projection: {id: 1, name: 1, desc: 1, requests: 1}}).toArray()
        let remainingGroups = await this.groups.find({_id: {$nin: ids}}, {projection: {id: 1, name: 1, desc: 1, requests: 1}}).toArray()
        return {user: userGroups, remaining: remainingGroups}
    }

    async getGroupRequests(id){
        let group = await this.groups.findOne({_id: new ObjectId(id)})
        console.log(group.requests)
        let userRequests = await this.users.find({_id: {$in: group.requests}}).toArray()
        return userRequests
    }

    async addRequest(userId, groupId){
        return await this.groups.findOneAndUpdate(
            {_id: new ObjectId(groupId)}, 
            {$push: {requests: new ObjectId(userId)}}
        )
    }

    async removeRequest(userId, groupId){
        return await this.groups.findOneAndUpdate(
            {_id: new ObjectId(groupId)}, 
            {$pull: {requests: new ObjectId(userId)}}
        )
    }



    async updateGroup(user){
        return await this.groups.findOneAndUpdate({_id: ObjectId(user.id)}, {$set: user})
    }
    

    async delGroup(id){
        return await this.groups.findOneAndDelete({_id: ObjectId(id)})
    }

}

module.exports = {
    newDatabase: (db) => {return new DatabaseWrapper(db)}
}