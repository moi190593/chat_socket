const { json } = require('express');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const PORT = 3000
app.use('/style', express.static(__dirname + '/style'));
app.use('/scripts', express.static(__dirname + '/scripts'));
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

server.listen(PORT, () => {
  console.log('Server running at ' + PORT);
});

app.use(express.json());


/******OPERACIONES*****/


//VERIFICAR ADMIN
app.get("/checkAdmin/:selectedRoom/:username", async (req, res) => {
  fs.readFile('json/salas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      let admin = false
      for (let index = 0; index < jsonData.salas.length; index++) {
        if (jsonData.salas[index].nombre == req.params.selectedRoom) {
          for (let j = 0; j < jsonData.salas[index].admins.length; j++) {
            if (jsonData.salas[index].admins[j] == req.params.username) {
              admin = true
            }
          }
        }
      }
      if (admin == true) {
        res.send("0")
      }
    }
    catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });

});

//ASIGNAR ADMIN
app.post("/convertToAdmin/", (req, res) => {
  fs.readFile("json/salas.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      for (let index = 0; index < jsonData.salas.length; index++) {
        if (jsonData.salas[index].nombre == req.body.room) {
          jsonData.salas[index].admins.push(req.body.user);
        }
      }

      const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

      fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo JSON:', err);
          return;
        }
      });
    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});


//CARGAR HISTORIAL
app.get("/getMessages/:selectedRoom", async (req, res) => {

  fs.readFile("json/salas.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const mensajes = [];
      const jsonData = JSON.parse(data);
      for (let index = 0; index < jsonData.salas.length; index++) {

        if (jsonData.salas[index].nombre == req.params.selectedRoom) {

          for (let j = 0; j < jsonData.salas[index].mensajes.length; j++) {
            mensajes.push(jsonData.salas[index].mensajes[j])
          }
        }
      }
      res.send(JSON.stringify(mensajes))

    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});


//BORRAR MENSAJE
app.post("/deleteMessage/", (req, res) => {
  fs.readFile("json/salas.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      for (let index = 0; index < jsonData.salas.length; index++) {
        if (jsonData.salas[index].nombre == req.body.room) {
          for (let j = 0; j < jsonData.salas[index].mensajes.length; j++) {
            if (jsonData.salas[index].mensajes[j].id == req.body.messageid) {
              jsonData.salas[index].mensajes.splice(j, 1);
            }
          }
        }
      }
      const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

      fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo JSON:', err);
          return;
        }
        res.send("0")
      });
    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});

//CARGAR SALAS
app.get("/getSalas/", async (req, res) => {
  fs.readFile('json/salas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      let rooms = [];
      const jsonData = JSON.parse(data);
      for (let index = 0; index < jsonData.salas.length; index++) {
        const element = jsonData.salas[index];
        rooms.push(element)
      }
      res.send(JSON.stringify(rooms))

    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});


//ABANDONAR SALA (ARRAY DE SALAS)
app.post("/abandonarSalaUsuariosActivos/", (req, res) => {
  fs.readFile("json/salas.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);

      for (let index = 0; index < jsonData.salas.length; index++) {
        if (jsonData.salas[index].nombre == req.body.sala) {
          for (let j = 0; j < jsonData.salas[index].usuariosActivos.length; j++) {
            if (jsonData.salas[index].usuariosActivos[j] == req.body.username) {
              jsonData.salas[index].usuariosActivos.splice(j, 1);
            }
          }
        }
      }
      const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

      fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo JSON:', err);
          return;
        }
        res.send("0")
      });
    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});


//ABANDONAR SALA (ARRAY DE USUARIOS)
app.post("/abandonarSalaCurrentUser/", (req, res) => {
  fs.readFile("json/usuarios.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      for (let index = 0; index < jsonData.usuarios.length; index++) {
        if (jsonData.usuarios[index].nombre == req.body.username) {
          for (let j = 0; j < jsonData.usuarios[index].salas.length; j++) {
            if (jsonData.usuarios[index].salas[j] == req.body.sala) {
              jsonData.usuarios[index].salas.splice(j, 1);
            }
          }
        }

      }
      const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

      fs.writeFile("json/usuarios.json", nuevoContenidoJSON, 'utf8', (err) => {
        if (err) {
          console.error('Error al escribir en el archivo JSON:', err);
          return;
        }
        res.send("0")
      });
    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});



//LOGIN Y REGISTER
app.post("/register/", (req, res) => {
  fs.readFile("json/usuarios.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      let exists = false
      let counter = 0
      if (jsonData.usuarios.length > 0) {
        for (let index = 0; index < jsonData.usuarios.length && !exists; index++) {
          if (counter < jsonData.usuarios[index].id) {
            counter = jsonData.usuarios[index].id
          }
          if (jsonData.usuarios[index].nombre == req.body.user) {
            res.send("1")
            exists = true;
          }
        }
      }
      //PENDIENTE ENCRIPITAR LA CONTRASEÑA
      if (!exists) {
        const nuevoUsuario = {
          id: counter + 1,
          nombre: req.body.user,
          password: req.body.pwd,
          salas: []
        };

        jsonData.usuarios.push(nuevoUsuario);

        const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

        fs.writeFile("json/usuarios.json", nuevoContenidoJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo JSON:', err);
            return;
          }
        });
      }

    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});

app.get("/login/:username/:password", (req, res) => {
  fs.readFile("json/usuarios.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      let exists = false
      if (jsonData.usuarios.length > 0) {
        for (let index = 0; index < jsonData.usuarios.length; index++) {
          if (jsonData.usuarios[index].nombre == req.params.username && jsonData.usuarios[index].password == req.params.password) {
            res.send("0")
            exists = true;
          }
        }
      }

      //PENDIENTE ENCRIPITAR LA CONTRASEÑA
      if (!exists) {
        res.send("1")
      }

    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});


//CARGAR SALAS DE UN USUARIO CONCRETO
app.get("/getSalasFromCurrentUser/:username/", (req, res) => {
  const salas = []
  fs.readFile("json/usuarios.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.usuarios.length > 0) {
        for (let index = 0; index < jsonData.usuarios.length; index++) {
          if (jsonData.usuarios[index].nombre == req.params.username) {
            for (let j = 0; j < jsonData.usuarios[index].salas.length; j++) {
              salas.push(jsonData.usuarios[index].salas[j])
            }
          }
        }
      }

      res.send(JSON.stringify(salas));


    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});





//COBTENER USUARIOS ACTIVOS DE UNA SALAS
app.get("/getUsuariosActivos/:sala/", (req, res) => {
  const usuariosActivos = []
  fs.readFile("json/salas.json", 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      for (let index = 0; index < jsonData.salas.length; index++) {
        if (jsonData.salas[index].nombre == req.params.sala) {
          for (let j = 0; j < jsonData.salas[index].usuariosActivos.length; j++) {
            usuariosActivos.push(jsonData.salas[index].usuariosActivos[j])
          }
        }
      }

      res.send(JSON.stringify(usuariosActivos));


    } catch (err) {
      console.error('Error al parsear el archivo JSON:', err);
    }
  });
});



//CONEXION A SOCKETS

io.on('connection', (socket) => {

  //1. USERNAME O ANONYMUS
  socket.on('user', (username) => {
    socket.username = username
    console.log(username + " se ha conectado.")
  })


  //2. CREATE ROOM OR JOIN ROOM
  socket.on('createRoom', (roomName) => {
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        const nuevaSala = {
          nombre: roomName,
          admins: [socket.username],
          usuariosActivos: [],
          mensajes: []
        };

        jsonData.salas.push(nuevaSala);


        for (let index = 0; index < jsonData.salas.length; index++) {
          if (jsonData.salas[index].nombre == roomName) {
            jsonData.salas[index].usuariosActivos.push(socket.username);
          }
        }

        const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

        const nuevoArraySalas = [];
        for (let index = 0; index < jsonData.salas.length; index++) {

          const element = jsonData.salas[index];
          nuevoArraySalas.push(element)

        }
        socket.emit('refreshRooms', nuevoArraySalas)
        fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo JSON:', err);
            return;
          }
        });
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
    socket.join(roomName);

  })

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        let found = false;
        const jsonData = JSON.parse(data);
        for (let index = 0; index < jsonData.salas.length; index++) {
          if (jsonData.salas[index].nombre == roomName) {
            for (let j = 0; j < jsonData.salas[index].usuariosActivos.length; j++) {
              if (jsonData.salas[index].usuariosActivos[j] == socket.username) {
                found = true
              }
            }
          }
        }

        if (!found) {
          for (let index = 0; index < jsonData.salas.length; index++) {
            if (jsonData.salas[index].nombre == roomName) {
              jsonData.salas[index].usuariosActivos.push(socket.username);
            }
          }
        }

        const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

        fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo JSON:', err);
            return;
          }
        });
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });

    fs.readFile("json/usuarios.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        let found = false;
        const jsonData = JSON.parse(data);
        for (let index = 0; index < jsonData.usuarios.length; index++) {
          if (jsonData.usuarios[index].nombre == socket.username) {
            for (let j = 0; j < jsonData.usuarios[index].salas.length; j++) {
              if (jsonData.usuarios[index].salas[j] == roomName) {
                found = true
              }

            }
          }
        }
        if (!found) {
          for (let index = 0; index < jsonData.usuarios.length; index++) {
            if (jsonData.usuarios[index].nombre == socket.username) {
              jsonData.usuarios[index].salas.push(roomName)
            }
          }
        }

        const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

        fs.writeFile("json/usuarios.json", nuevoContenidoJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo JSON:', err);
            return;
          }
        });
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
  })


  //3. CHAT
  socket.on('message', (message, roomName) => {
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        let counter = 0
        let mensaje_final = {
          id: "",
          nombre: "",
          mensaje: ""
        }
        for (let index = 0; index < jsonData.salas.length; index++) {
          if (jsonData.salas[index].nombre == roomName) {
            for (let j = 0; j < jsonData.salas[index].mensajes.length; j++) {
              if (counter < jsonData.salas[index].mensajes[j].id) {
                counter = jsonData.salas[index].mensajes[j].id
              }
            }
          }
        }

        for (let index = 0; index < jsonData.salas.length; index++) {
          if (jsonData.salas[index].nombre == roomName) {
            mensaje_final.id = counter + 1;
            mensaje_final.nombre = socket.username;
            mensaje_final.mensaje = message;
            jsonData.salas[index].mensajes.push(mensaje_final);
            io.to(roomName).emit('message', mensaje_final);
          }
        }

        const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

        fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo JSON:', err);
            return;
          }
        });
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
  });


  //4. LEAVE ROOM
  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
  })


  //REFRESH
  socket.on('refreshMsg', (roomName) => {
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const mensajes = []
        const jsonData = JSON.parse(data);
        for (let index = 0; index < jsonData.salas.length; index++) {

          if (jsonData.salas[index].nombre == roomName) {

            for (let j = 0; j < jsonData.salas[index].mensajes.length; j++) {
              mensajes.push(jsonData.salas[index].mensajes[j])
            }
          }
        }
        io.to(roomName).emit('refreshMsg', mensajes);

      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
  })

  socket.on('refreshUsers', (roomName) => {
    const usuariosActivos = [];
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        for (let index = 0; index < jsonData.salas.length; index++) {
          if (jsonData.salas[index].nombre == roomName) {
            for (let j = 0; j < jsonData.salas[index].usuariosActivos.length; j++) {
              usuariosActivos.push(jsonData.salas[index].usuariosActivos[j])
            }
          }
        }
        io.to(roomName).emit('refreshUsers', usuariosActivos)
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
  })

  socket.on('refreshRooms', () => {
    const updatedRooms = [];
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        for (let index = 0; index < jsonData.salas.length; index++) {
            updatedRooms.push(jsonData.salas[index])
        }
        socket.emit('refreshRooms', updatedRooms)
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
  })


  //DISCONECT
  socket.on('disconnect', () => {
    console.log(socket.username + " se ha desconectado");
    fs.readFile("json/salas.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);

        for (let index = 0; index < jsonData.salas.length; index++) {
          for (let j = 0; j < jsonData.salas[index].usuariosActivos.length; j++) {
            if (jsonData.salas[index].usuariosActivos[j].nombre == socket.username) {
              jsonData.salas[index].usuariosActivos.splice(j, 1);
            }
          }
        }
        const nuevoContenidoJSON = JSON.stringify(jsonData, null, 2);

        fs.writeFile("json/salas.json", nuevoContenidoJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo JSON:', err);
            return;
          }
          console.log('Usuario eliminado');
        });
      } catch (err) {
        console.error('Error al parsear el archivo JSON:', err);
      }
    });
  });
});
