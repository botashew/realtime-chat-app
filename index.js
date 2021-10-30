const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./public/js/message')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./public/js/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const botName = 'ОнлайнЧат Бот'

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Runs when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Добро пожаловать в Онлайн Чат!'))
        
        // When a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} присоединился(ась) к чату`))

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} покинул(а) чат`))

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}...`))