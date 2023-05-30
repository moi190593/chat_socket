const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = 3000

app.use('/style', express.static(__dirname + '/style'));
app.get('/', (req, res)=> res.sendFile(__dirname + '/index.html'))

server.listen(PORT, () => {
  console.log('Server running at '+ PORT);
});

io.on('connection', (socket) => {
  socket.username = 'anonymus';

  socket.on('createRoom', (roomName) =>{
    socket.join(roomName);
  })

  socket.on('message', (message, roomName) => {
    console.log('Mensaje recibido en el server: ', message);
    io.to(roomName).emit('message', {'user': socket.username, 'message': message});
  });

  socket.on('join', (username) =>{
    if(username != null){
      socket.username = username
      console.log(username + " se ha conectado.")
    }
    socket.broadcast.emit('message', {user: 'Server', 'message': socket.username + " se ha unido al chat."});
  })

  

  socket.on('disconnect', () => {
    console.log(socket.username +  " se ha desconectado");
  });
});
