module.exports = {
    connect: (io, PORT, db) => {
        io.on('connection', (socket) => {
            console.log(`user connection on port ${PORT}:${socket.id}`)

            socket.on('join-group', id => {
                socket.join(id)
                console.log(`User joined group: ${id}`)
            })

            socket.on('leave-group', id => {
                socket.leave(id)
                console.log(`User left group: ${id}`)
            })

            socket.on('join-channel', channel =>{
                socket.join(channel.id)
                console.log(`User joined channel: ${channel.name}`)
            })

            socket.on('leave-channel', channel => {
                socket.leave(channel.id)
                console.log(`User joined channel: ${channel.name}`)
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