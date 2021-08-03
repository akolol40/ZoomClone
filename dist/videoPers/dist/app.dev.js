"use strict";

var express = require('express');

var app = express();
var port = 4000;

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io')(server);

app.use(express["static"](__dirname + '/src'));
io.sockets.on("error", function (e) {
  return console.log(e);
});
server.listen(port, function () {
  return console.log("Server is running on port ".concat(port));
});
var broadcaster;
io.sockets.on("connection", function (socket) {
  socket.on("broadcaster", function () {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", function () {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("disconnect", function () {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});