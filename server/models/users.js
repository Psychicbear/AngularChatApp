const fs = require('fs/promises')
const uuid = require('uuid').v4

class User {
    constructor(email, username, password, id=uuid(), groups=[], roles=[{global: "user"}], isSuper=false){
        this.id = id, this.email = email, this.username = username, this.password = password,
        this.groups = groups, this.roles = roles, this.isSuper = isSuper
    }

    edit(fields){
        for (let [key, val] of fields){
            this[key] = val
        }
    }

    addGroup(group){
        if(!this.groups.find(item => item == group)){
            this.groups.push(group)
            this.roles.push({groupId: group, role: "user"})
        }
    }

    removeGroup(group){
        let index = this.groups.findIndex(item => item == group)
        if(index>-1){
            this.groups.splice(index, 1)
            index = this.roles.findIndex(item => item.groupId == group)
            this.roles.splice(index, 1)
        }
    }

    modifyRole(group, role){
        let index = this.roles.findIndex(item => item.groupId == group)
        if(index>-1){
            this.roles[index].role = role
        }
    }

    serialise(password=false){
        let data = {
            id: this.id, email: this.email, username: this.username, 
            groups: this.groups, roles: this.roles, isSuper: this.isSuper
        }
        if(password) data.password = this.password 
        return data
    }

}

class Users {

    constructor(path){
        this.path = path
        this.loadFile(path)
    }

    async loadFile(path){
        let data = JSON.parse(await fs.readFile(path))
        this.users = data.map(user => new User(
            user.email, user.username, user.password, user.id,
            user.groups, user.roles, user.isSuper
        ))
    }

    async saveFile(){
        let data = this.users.map(user => user.serialise(true))
        return await fs.writeFile(this.path, JSON.stringify(data, null, '\t'))
    }

    getUser(id){
       let user = this.users.find(item => item.id == id)
       if(!user){
        throw "User could not be found"
       }
       return user
    }

    authUser(email, password){
        let auth = this.users.find((item) => {
            return item.email == email && item.password == password
        })

        return auth
    }

    addUser(email, username, password){
        let newUser
        if(!this.users.find(user => user.email == email | user.username == username)){
            newUser = new User(email, username, password)
            this.users.push(newUser) 
        } else {
            throw "User with this email or name already exists!"
        }
        
        return newUser
    }

    removeUser(id){
        let del
        let index = this.users.findIndex(item => item.id == id)
        if(index>-1){
            del = this.users.splice(index, 1)[0]
        }
        
        return del
    }
}

module.exports = {
    newUsers: (path) => {
        return new Users(path)
    }
}