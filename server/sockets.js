module.exports = {
    connect: (io, PORT) => {
        io.on('connection', (socket) => {
            console.log(`user connection on port ${PORT}:${socket.id}`)

            socket.on('message', (message) => {
                console.log(message)
                io.emit('message', message)
            })
        })
    }
}