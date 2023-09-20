class DatabaseWrapper {
    constructor(db){
        this.db
        this.users = this.db.collection('users')
        this.groups = this.db.collction('groups')
    }

    async createUser(username, email, password){
        let newUser = {
            email: email, username: username, password: password, 
            groups: [], roles: {global: 'user'}
        }
        return await this.users.insertOne(newUser)
    }

    async getUser(userId){
        return await this.users.findOne({_id: userId}, {projection: {password: 0}})
    }

    async getUsersByRole(key, val){
        return await this.users.find({[`roles.${key}`]: val})
    }

    async getUsersByGroup(groupId){
        return await this.users.find({groups: groupId}).toArray()
    }

    async addUserToGroup(userId, groupId){
        return await this.users.findOneAndUpdate(
            {_id: userId},
            {
                $set: {[`roles.${groupId}`]: 'user'},
                $push: {groups: groupId}
            }
        )
    }

    async updateUserRole(userId, role, change){
        return await this.users.findOneAndUpdate(
            {_id: userId},
            {$set: {[`roles.${role}`]: change}}
        )
    }

    //Removes groupId from roles and groups
    async removeUserFromGroup(userId, groupId){
        return await this.users.findOneAndUpdate(
            {_id: userId},
            {
                $unset: {[`roles.${groupId}`]: ''},
                $pull: {groups: groupId}
            })
    }

    async updateUser(user){
        return await this.users.findOneAndUpdate({_id: user.id}, {$set: user})
    }
    
    async delUser(id){
        return await this.users.findOneAndDelete({_id: id})
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
        return await this.groups.findOne({_id: id})
    }

    //Gets list of groups for the user dashboard
    async getUserGroupsList(groups=[]){
        let userGroups = await this.groups.find({_id: {$in: groups}}, {projection: {id: 1, name: 1, desc: 1}}).asArray()
        let remainingGroups = await this.groups.find({_id: {$nin: groups}}, {projection: {id: 1, name: 1, desc: 1}}).asArray()
        return {user: userGroups, remaining: remainingGroups}
    }

    async updateGroup(user){
        return await this.groups.findOneAndUpdate({_id: user.id}, {$set: user})
    }
    

    async delGroup(id){
        return await this.groups.findOneAndDelete({_id: id})
    }

}