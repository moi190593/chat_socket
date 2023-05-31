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

let rooms = [];

io.on('connection', (socket) => {
  socket.username = 'anonymus';

  socket.on('createRoom', (roomName) =>{
    console.log("Room creada: " + roomName)
    rooms.push(roomName)
    socket.join(roomName);
  })

  socket.on('joinRoom', (roomName) =>{
    console.log("Room seleccionada: " + roomName)
    socket.join(roomName);
    socket.broadcast.emit('message', {user: 'Server', 'message': socket.username + " se ha unido al chat."});
  })

  socket.on('message', (message, roomName) => {
    console.log('Mensaje recibido en el server: ', message);
    console.log("room: " + roomName + ", username: " + 
    socket.username)
    io.to(socket.roomName).emit('message', {'user': socket.username, 'message': message});
  });

  socket.on('user', (username) =>{
    if(username != null){
      socket.username = username
      console.log(username + " se ha conectado.")
    }
    socket.emit("rooms", rooms)
  })

  socket.on('disconnect', () => {
    console.log(socket.username +  " se ha desconectado");
  });
});
