var socket = null;
var app = new Vue({
  el: '#app',
  data: {
    message: '',
    messages: [],
    historial: [],
    username: '',
    usernameR: '',
    passwordR: '',
    password: '',
    roomName: '',
    selectedRoom: '',
    rooms: [],
    state: 0,
    exists: false,
    admin: false,
    salasFromUser: [],
    activeUsers: []
  },
  computed: {
    roomListEmpty() {
      return this.rooms.length > 0;
    }
  },
  methods: {
    groupLogin() {
      this.cargarSalas();
      this.login();
    },
    groupBackToMenu() {
      this.leaveRoom();
      this.cargarSalas()
      this.backToMenu();
      this.selectedRoom = "";
      this.roomName = ""
    },
    groupAbandonar() {
      this.abandonarSalaSALAS();
      this.abandonarSalaUsuariosActivos();
      this.cargarSalas();
      this.backToMenu();
      this.leaveRoom();
      this.selectedRoom = "";
      this.roomName = "";
    },
    groupRegister() {
      this.register();
      this.backToLogin();
      this.usernameR = '';
      this.passwordR = '';
    },
    groupCreate() {
      this.createRoom();
      this.getUsuariosActivos();
      this.getSalasFromCurrentUser();
    },
    groupJoin() {
      this.enterRoom();
      this.getUsuariosActivos();
      this.getSalasFromCurrentUser();
    },
    getSalasFromCurrentUser: async function () {
      await fetch("http://localhost:3000/getSalasFromCurrentUser/" + this.username, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: "cors",
        cache: "default",
        timeout: "2000"
      }).then(
        (response) =>
          response.json()
      ).then((data) => {
        this.salasFromUser = data
      }).catch((error) => {
        console.log(error)
      });
    },
    getUsuariosActivos: async function () {
      let sala = ''
      if (this.roomName != '') {
        sala = this.roomName
      } else if (this.selectedRoom != '') {
        sala = this.selectedRoom
      }
      await fetch("http://localhost:3000/getUsuariosActivos/" + sala, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: "cors",
        cache: "default",
        timeout: "2000"
      }).then(
        (response) =>
          response.json()
      ).then((data) => {
        this.activeUsers = data
      }).catch((error) => {
        console.log(error)
      });
    },
    createRoom: async function () {
      console.log("user: " + this.username)
      if (this.username == '') {
        alert("Los usuarios anonimos no pueden crear salas")
      } else {
        for (let index = 0; index < this.rooms.length; index++) {
          if (this.roomName == this.rooms[index]) {
            this.exists = true
          }
        }
        let sala = this.roomName
        let sala2 = sala.trimStart().trimEnd();
        if (sala2 != '' && this.exists == false) {
          console.log("Creando sala: " + this.roomName)
          this.rooms.push(this.roomName);
          this.messages = [];
          this.admin = true;
          await socket.emit('createRoom', this.roomName);
          await socket.emit('refreshRooms');
          this.state = 2;
        } else if (this.exists == true) {
          alert("Esta sala ya existe!")
        }
        else {
          alert("El nombre de la sala está vacío!")
        }
      }
    },
    enterRoom: async function () {
      if (this.selectedRoom != '') {
        console.log('Ingresando a la sala:', this.selectedRoom);
        this.messages = [];
        await socket.emit('joinRoom', this.selectedRoom);
        await socket.emit('refreshUsers', this.selectedRoom);
        this.checkAdmin();
        this.getMessages();
        this.state = 2
      } else {
        alert("Selecciona una sala")
      }
    },
    getMessages: async function () {
      await fetch("http://localhost:3000/getMessages/" + this.selectedRoom, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: "cors",
        cache: "default",
        timeout: "2000"
      }).then(
        (response) =>
          response.json()
      ).then((data) => {
        console.log("length:" + data.length)
        this.messages = data
      }).catch((error) => {
        console.log(error)
      });
    },
    checkAdmin: async function () {
      if (this.selectedRoom != '') {
        await fetch("http://localhost:3000/checkAdmin/" + this.selectedRoom + "/" + this.username, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: "cors",
          cache: "default",
          timeout: "2000"
        }).then(
          (response) =>
            response.json()
        ).then((data) => {
          if (data == "0") {
            this.admin = true
          }
        }).catch((error) => {
          console.log(error)
        });
      } else {
        alert("Selecciona una sala")
      }
    },
    sendMessage: async function () {
      let mensaje2 = this.message.trimStart().trimEnd();
      if (mensaje2 != '') {
        let room = ''
        if (this.roomName != '') {
          room = this.roomName
        } else if (this.selectedRoom != '') {
          room = this.selectedRoom
        }
        console.log("sala seleccionada: " + room);
        console.log("enviando mensaje: " + this.message)
        await socket.emit('message', this.message, room);
        this.message = '';
      } else {
        alert("No puedes mandar mensajes en blanco");
      }

    },
    leaveRoom: async function () {
      let sala = '';
      if (this.roomName != '') {
        sala = this.roomName
      } else if (this.selectedRoom != '') {
        sala = this.selectedRoom
      }
      await socket.emit('leaveRoom', sala);
    },
    deleteMessage: async function (id) {
      let sala = ''
      if (this.roomName != '') {
        sala = this.roomName
      } else if (this.selectedRoom != '') {
        sala = this.selectedRoom
      }
      if (this.admin == true) {
        for (let index = 0; index < this.messages.length; index++) {
          if (this.messages[index].id == id) {
            console.log("Borro mensaje nuevo")
            this.messages.splice(index, 1);
            this.deleteMessage(id);
          }
        }
        let info = {
          messageid: id,
          room: sala
        }
        console.log("info: " + info.messageid + ", " + info.room)
        await fetch("http://localhost:3000/deleteMessage/", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: "cors",
          cache: "default",
          timeout: "2000",
          body: JSON.stringify(info)
        }).then(
          (response) =>
            response.json()
        ).then(async (data) => {
          if (data == "0") {
            console.log("COSAS")
            await socket.emit('refreshMsg', sala);
          }
        }).catch((error) => {
          console.log(error)
        });
      } else {
        alert("Solo los admins pueden borrar");
      }

    },
    asignarAdmin: async function (nombre) {
      if (this.admin == true) {
        let admin = window.confirm("Quieres que este usuario sea admin?")
        if (admin) {
          let sala = ''
          if (this.roomName != '') {
            sala = this.roomName
          } else if (this.selectedRoom != '') {
            sala = this.selectedRoom
          }
          let info = {
            user: nombre,
            room: sala
          }

          //MIRARSE EL IF
          await fetch("http://localhost:3000/convertToAdmin/", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: "cors",
            cache: "default",
            timeout: "2000",
            body: JSON.stringify(info)
          }).then(
            (response) =>
              response.json()
          ).then((data) => {
          }).catch((error) => {
            console.log(error)
          });
        }
      } else {
        alert("No eres admin!")
      }

    },
    backToMenu: function () {
      this.state = 1;
    },
    backToLogin: function () {
      this.state = 0;
    },
    goToRegister: function () {
      this.state = 3;
    },
    cargarSalas: async function () {
      await fetch("http://localhost:3000/getSalas/", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: "cors",
        cache: "default",
        timeout: "2000"
      }).then(
        (response) =>
          response.json()
      ).then((data) => {
        this.rooms = data;
      }).catch((error) => {
        console.log(error)
      });
    },
    abandonarSalaSALAS: async function () {
      let sala = ''
      if (this.roomName != '') {
        sala = this.roomName
      } else if (this.selectedRoom != '') {
        sala = this.selectedRoom
      }
      await fetch("http://localhost:3000/abandonarSalaCurrentUser/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: "cors",
        cache: "default",
        timeout: "2000",
        body: JSON.stringify({ username: this.username, sala: sala })
      }).then(
        (response) =>
          response.json()
      ).then(async (data) => {
        if (data == "0") {
          await this.getSalasFromCurrentUser();
        }
      }).catch((error) => {
        console.log(error)
      });
    },
    abandonarSalaUsuariosActivos: async function () {
      let sala = ''
      if (this.roomName != '') {
        sala = this.roomName
      } else if (this.selectedRoom != '') {
        sala = this.selectedRoom
      }
      await fetch("http://localhost:3000/abandonarSalaUsuariosActivos/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: "cors",
        cache: "default",
        timeout: "2000",
        body: JSON.stringify({ username: this.username, sala: sala })
      }).then(
        (response) =>
          response.json()
      ).then(async (data) => {
        if (data == "0") {
          await socket.emit('refreshUsers', sala);
        }
      }).catch((error) => {
        console.log(error)
      });
    },
    login: async function () {
      let nombre2 = this.username.trimStart().trimEnd();
      let pwd2 = this.password.trimStart().trimEnd();
      if (nombre2 == '' || pwd2 == '') {
        alert("Algun campo está vacío");
      } else {
        socket.emit('user', nombre2)
        await fetch("http://localhost:3000/login/" + nombre2 + "/" + pwd2, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: "cors",
          cache: "default",
          timeout: "2000"
        }).then(
          (response) =>
            response.json()
        ).then((data) => {
          if (data == "0") {
            this.state = 1;
          } else if (data = "1") {
            alert("El usuario o contraseña son incorrectos")
          }
        }).catch((error) => {
          console.log(error)
        });
      }

    },
    register: async function () {
      let nombre2 = this.usernameR.trimStart().trimEnd();
      let pwd2 = this.passwordR.trimStart().trimEnd();
      if (nombre2 == '' || pwd2 == '') {
        alert("Algun campo vacío")
      } else {

        let info = {
          user: nombre2,
          pwd: pwd2
        }
        await fetch("http://localhost:3000/register/", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: "cors",
          cache: "default",
          timeout: "2000",
          body: JSON.stringify(info)
        }).then(
          (response) =>
            response.json()
        ).then((data) => {
          if (data == "0") {
            this.state = 0;
          } else if (data == "1") {
            alert("El nombre de usuario ya existe")
          }
        }).catch((error) => {
          console.log(error)
        });
      }
    },
    handleEnterKey: function () {
      this.sendMessage();
    }
  },
  created: function () {
    socket = io();
  },
  mounted: async function () {
    await socket.on('message', function (message) {
      app.messages.push(message);
      app.$nextTick(function () {
        var messageBox = document.getElementById('chatbox');
        messageBox.scrollTop = messageBox.scrollHeight;
      })
    });

    await socket.on('refreshMsg', function (mensajes) {
      app.messages = mensajes;
    });

    await socket.on('refreshUsers', function (usuariosActivos) {
      app.activeUsers = usuariosActivos;
    });

    await socket.on('refreshRooms', function (nuevoArraySalas) {
      app.rooms = nuevoArraySalas
    });
  }
});

