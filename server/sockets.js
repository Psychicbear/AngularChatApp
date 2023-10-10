module.exports = {
    connect: (io, PORT, db) => {
        io.on('connection', (socket) => {
            socket.userId = ''
            console.log(`user connection on port ${PORT}:${socket.id}`)
            socket.on('auth', id => {
                socket.userId = id
                console.log(`Set User ID to: ${socket.userId}`)
            })

            socket.on('deauth', () => {
                socket.userId = ''
                console.log('Deauthorized user')
            })

            socket.on('join-group', id => {
                socket.join(id)
                console.log(`User joined group: ${id}`)
            })

            socket.on('leave-group', id => {
                socket.leave(id)
                console.log(`User left group: ${id}`)
            })

            socket.on('join-channel', async channel =>{
                socket.join(channel.id)
                let userList = await io.in(channel.id).fetchSockets()
                io.in(channel.id).emit(userList.map(sock => sock.userId))
                console.log(`User joined channel: ${channel.name}`)
            })

            socket.on('leave-channel', channel => {
                console.log(socket.rooms)
                if(socket.rooms.has(channel.id)){
                    socket.leave(channel.id)
                    console.log(`User left channel: ${channel.name}`)
                } else console.log(`User not in channel: ${channel.id}`)

            })

            socket.on('sendMessage', async msg => {
                let = {source, ...message} = msg
                await db.addMessage(source, message)
                console.log(`Recieved message: ${message.content}`)
                io.to(source).emit('message', message)
            })

            io.on('disconnect', () => {
                console.log('User disconnected')
            })
        })
    }
}