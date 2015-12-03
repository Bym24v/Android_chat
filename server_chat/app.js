// Dependencias
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;

server.listen(port, function () {
  console.log('Server corriendo en el puerto %d', port);
});


// Lista de usuarios
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // Nuevo mensaje
  socket.on('new message', function (data) {

    // Enviar a todos el nuevo mensaje + username
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // Añadir un nuevo cliente
  socket.on('add user', function (username) {

    // le damos el nombre de usuario a la sesion con sockets
    socket.username = username;

    // Añadir a la lista global de usuarios
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

    // Emitir a todos los clientes que alguien se a conectado
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // Cuando alguien esta escribiendo
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // Cuando deja de escribir
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // Cuando se desconecta un usuario
  socket.on('disconnect', function () {

    // Lo borra de la lista de usuarios
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // Emite a todos que el usuario a salido
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
