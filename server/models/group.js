const fs = require('fs/promises')
const uuid = require('uuid').v4

//Class for loading and managing collection of group data
class Groups {
    constructor(path){
        this.path = path
        this.loadFile()
    }

    //Loads data from file using specified path
    async loadFile(path){
        let data = JSON.parse(await fs.readFile(path))
        this.list = data.map(item => new Group(item.name, item.desc, item.id, item.channels))
    }

    //Saves serialised data to file at path previously specified
    async saveFile(){
        let data = this.list.map(group => group.serialise())
        return await fs.writeFile(this.path, JSON.stringify(data, null, '\t'))
    }

    //Finds and returns instance of Group which contains the specified id
    getGroup(id){
        let group = this.list.find(group => group.id == id)

        if(!group){
            throw "Selected group not found"
        }

        return group
    }

    //Creates new Group instance and adds it to list, returning it after
    addGroup(name, desc){
        if(this.list.find(group => group.name == name)){
            throw "Group with this name already exists"
        } 

        let newGroup = new Group(name, desc)
        this.list.push(newGroup)
        return newGroup
    }

    //Removes Group instance from list and returns it
    removeGroup(id){
        let index = this.list.find(group => group.id == id)

        if(index==-1){
            throw "Selected group does not exist already"
        }

        return this.list.splice(index, 1)
    }
}

//Data for controlling individual group's data
class Group {
    constructor(name, desc, id=uuid(), channels=[]){
        this.id = id, this.name = name, this.desc = desc, this.channels = channels
    }


    //Returns an object containing all of the instance's attributes
    serialise(){
        let channels = this.list.channels.map(chan => {
            return chan.serialise()
        })
        let data = {
            id: this.id, name: this.name, desc: this.desc, channels: channels
        }

        return data
    }

    //Creates new Channel instance, adding to the channels list, returning the new Channel
    addChannel(name, desc=''){
        let newChan = new Channel(name, desc)
        this.channels.push(newChan)
        
        return newChan
    }

    //Removes Channel instance from channel, returning the removed Channel
    removeChannel(id){
        let index = this.channel.findIndex(chan => chan.id == id)

        if(index==-1){
            throw "Selected channel does not exist already"
        }

        return this.channels.splice(index,1)
    }

    //Finds and returns instance of Channel which contains the specified id
    getChannel(id){
        let channel = this.channels.find(chan => chan.id == id)

        if(!channel){
            throw "Selected channel not found"
        }

        return channel
    }
}

//Class for managing individual channel's data
class Channel {
    constructor(name="General", desc="The main channel", id=uuid(), messages=[]){
        this.id = id, this.name = name, this.desc = desc, this.messages = messages
    }

    //Modifies the name and desc properties of this Channel, returning the changes
    edit(name, desc){
        this.name = name
        this.desc = desc

        return {name: this.name, desc: this.desc}
    }

    //Pushes passed in msg object to message array
    addMsg(msg){
        this.messages.push(msg)
    }

    //Removes msg object containing specified id from the messages array
    removeMsg(id){
        let index = this.messages.findIndex(msg => msg.id == id)

        if(index==-1){
            throw "Selected message does not exist already"
        }

        return this.messages.splice(index, 1)
    }

    //Returns an object containing all of the instance's attributes
    serialise(){
        return {id: this.id, name: this.name, desc: this.desc, messages: this.messages}
    }
}

//Exports Groups class constructor
module.exports = {
    newGroups: (path) => {
        return new Groups(path)
    }
}