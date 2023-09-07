const fs = require('fs/promises')
const uuid = require('uuid').v4

//Class for loading and managing collection of User data
class Users {
    constructor(path){
        this.path = path
        this.loadFile(path)
    }

    //Loads data from file using specified path
    async loadFile(path){
        let data = JSON.parse(await fs.readFile(path))
        this.list = data.map(user => new User(
            user.email, user.username, user.password, user.id,
            user.groups, user.roles, user.isSuper
        ))
    }

    //Saves serialised data to file at path previously specified
    async saveFile(){
        let data = this.list.map(user => user.serialise(true))
        console.log('Saving Users')
        return await fs.writeFile(this.path, JSON.stringify(data, null, '\t'))
    }

    //Finds and returns instance of User which contains specified id
    getUser(id){
       let user = this.list.find(item => item.id == id)
       if(!user){
        throw "User could not be found"
       }
       return user
    }

    //Takes a function for filtering through list, returns found users
    getUsers(fn){
        let users = this.list.filter(fn)
        console.log(users)

        if(users.length<1){
            throw "No users found matching specified query"
        }

        return users
    }

    //Checks input email and password against list of Users, 
    //returns instance of User which matches credentials
    authUser(email, password){
        let auth = this.list.find((item) => {
            return item.email == email && item.password == password
        })

        if(!auth){
            throw "Your user credentials are incorrect"
        }

        return auth
    }

    //Creates new instance of User and adds it to list, returning the new User
    addUser(email, username, password){
        if(this.list.find(user => user.email == email | user.username == username)){
            throw "User with this email or name already exists!"
        } 

        let newUser = new User(email, username, password)
        this.list.push(newUser) 
        
        return newUser
    }

    //Removes User instance from list and returns it
    removeUser(id){
        let index = this.list.findIndex(item => item.id == id)
        if(index==-1){
            throw "Selected user does not exist already"
        }
        
        return this.list.splice(index, 1)[0]
    }
}

//Class for managing individual user's data
class User {
    constructor(email, username, password, id=uuid(), groups=[], roles={global: "user"}){
        this.id = id, this.email = email, this.username = username, this.password = password,
        this.groups = groups, this.roles = roles
    }

    //Takes an object, merges it's properties with User instance, 
    //updating matching attributes. Returns serialised instance
    edit(user){
        this.email = user.email, this.username = user.username, 
        this.groups = user.groups, this.roles = user.roles

        return this.serialise()
    }

    //Takes group: string, adds it to groups array, 
    //creates and adds matching roles to roles array
    addToGroup(group){
        if(group in this.roles){
            throw "User already in selected group"
        }

        this.groups.push(group)
        this.roles[group] = "user"

        return this.groups
    }

    //Removes group and related roles from User, returns removed group
    removeGroup(groupId){
        let index = this.groups.findIndex(item => item == groupId)
        
        if(index==-1){
            throw "Selected group not found"
        }

        let rm = this.groups.splice(index, 1)
        index = this.roles.findIndex(item => groupId in item)
        this.roles.splice(index, 1)
        return rm
    }

    //Takes groupId
    modifyRole(groupId, role){
        let index = this.roles.findIndex(item => groupId in item)
        
        if(index==-1){
            throw "Group role not found"
        }

        this.roles[index].role = role
    }

    serialise(password=false){
        let data = {
            id: this.id, email: this.email, username: this.username, 
            groups: this.groups, roles: this.roles
        }
        if(password) data.password = this.password 
        return data
    }

}


//Exports Users class constructor
module.exports = {
    newUsers: (path) => {
        return new Users(path)
    }
}