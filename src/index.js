import express from "express";
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import { Socket } from "dgram";
import Filter from 'bad-words';
import { generateLocationMessage, generateMessage } from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users.js";


const app = express()
const server = http.createServer(app)
const io = new Server(server)


const port = process.env.PORT || 3000

//Define Paths For Express Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

// const viewsPath = path.join(__dirname, '../templates/views')
// const partialPath = path.join(__dirname, '../templates/partials')


// connection()


const maintenace = false

app.use((req, res, next) => {
    if (maintenace) {
        res.status(503).send('Site Under Maintaince')
    } else {
        next()
    }

})


app.use(express.json())



io.on('connection', (socket) => {
    console.log("New Websocket Connection")


    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)

        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome! '))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has Joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not Allowed!')
        }
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.Latitude},${location.Longitude}`))
        callback("Location Shared!")
    })


    socket.on('disconnect', () => {

        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })

})

server.listen(port, () => {
    console.log("Server is Up on Port " + port)
})