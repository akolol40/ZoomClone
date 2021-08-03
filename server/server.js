const express = require("express");
const app = express();


let broadcaster;
const port = 4000;
app.use('/', express.static(__dirname + '/public'));
const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
const { addUser, getUser, deleteUser, getUsers } = require('./users')

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on('joinroom', (data) => {
    const {user} = addUser(socket.id, data.roomId)
    socket.join(user.room)
  })
  socket.on('sendMessage', message => {
    const user = getUser(socket.id)
    console.log(socket.id)
    io.in(user.room).emit('msg', message)
  })
 // socket.broadcast.emit('send', 'hello')
  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
  });

  socket.on("broadcaster", () => {
    broadcaster = socket.id;

    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    const user = getUser(socket.id)
  //  console.log(user)
    io.to(user.room).emit("watcher", socket.id);
  });

  socket.on("offer", (id, message) => {
    const user = getUser(socket.id)
    io.to(user.room).emit("offer", socket.id, message);
    console.log(user.room)
  });
  socket.on("answer", (id, message) => {
    const user = getUser(socket.id)
    console.log(user.room)
    io.to(user.room).emit("answer", socket.id, message);
    console.log(message)
  });
  socket.on("candidate", (id, message) => {
    const user = getUser(socket.id)
    io.to(user.room).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    io.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));