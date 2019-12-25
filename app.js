const express = require('express');
const app = express();
let broadcaster;
let server;
let port;
  const http = require('http');
  server = http.createServer(app);
  port = process.env.PORT || 3000;

const io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));
io.sockets.on('error', e => console.log(e));
io.sockets.on('connection', function (socket) {
  socket.on('image',(image)=>{
     io.emit('data', image)
   
  });
});
server.listen(port, () => console.log(`http://localhost:${port}`+ '/mix.html',))
                          console.log(`http://localhost:${port}`+ '/index.html',);
