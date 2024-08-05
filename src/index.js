const path=require('path')
const express=require('express')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('../src/utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const app=express()


app.use(express.static(path.join(__dirname,'../public')))
const server=http.createServer(app)
const io=socketio(server)

// //connection going to get fired whenever socketio server gets new connection
// io.on('connection',(socket)=>{ //socket is an object which contains information about that new conncection //if we have 5 client connecting to this server  this call back is going to run 5 times 
//     console.log("new websocket connection")
//     //when working with socket.io and transfering the data we are sending and receiving what are called events
//     //we want to send an event from a server and receive it to the client(chat.js)
//     //so to send an event we use socket.emit
//     socket.emit('countUpdated',count)

//     socket.on('increment',()=>{
//         count++
//         // socket.emit('countUpdated',count)
//         io.emit('countUpdated',count)

//     })
// })

io.on('connection',(socket)=>{
    console.log("New websocket connection")

  

    socket.on('join',(options,cb)=>{
        const{error,user}= addUser({id:socket.id,...options})

        if(error){
           return  cb(error)
        }


        socket.join(user.room)

        socket.emit('message',generateMessage("Admin","Welcome"))
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${user.username} has joined`))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })


        cb()


    })

    socket.on('sendMessage',(message,cb)=>{
        const user=getUser(socket.id)
        const filter=new Filter()

        if(filter.isProfane(message)){
            return cb("Not allowed")
        }

        io.to(user.room).emit("message",generateMessage(user.username,message))
        cb()
})


    socket.on('sendLocation',(location,cb)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        cb()
    })

    socket.on('disconnect',()=>{
        const user= removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message",generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(3000,()=>{
    console.log(`listening on port 3000`)
})