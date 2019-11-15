//
// Browser MCU sample server
//   https://github.com/mganeko/browser_mcu_server
//   browser_mcu_server is provided under MIT license
//
//   This sample is using https://github.com/mganeko/browser_mcu_core
//

'use strict';



const http = require("http");

const express = require('express');

const app = express();
const webPort = process.env.PORT || 3000;
app.use(express.static('public'));
let broadcaster;
var webServer=null;
  // --- http ---
  webServer = http.Server( app ).listen(webPort, function(){
    console.log('Web server start. http://localhost:3000/server.html ');
  });


const io = require('socket.io')(webServer)
io.sockets.on('error', e => console.log(e));
io.sockets.on('connection', function (socket) {
  socket.on('broadcaster', function () {
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster');
  });
  socket.on('watcher', function () {
    broadcaster && socket.to(broadcaster).emit('watcher', socket.id);
  });
  socket.on('offer', function (id /* of the watcher */, message) {
    socket.to(id).emit('offer', socket.id /* of the broadcaster */, message);
  });
  socket.on('answer', function (id /* of the broadcaster */, message) {
    socket.to(id).emit('answer', socket.id /* of the watcher */, message);
  });
  socket.on('candidate', function (id, message) {
    socket.to(id).emit('candidate', socket.id, message);
  });
  socket.on('disconnect', function() {
    broadcaster && socket.to(broadcaster).emit('bye', socket.id);
  });
});
