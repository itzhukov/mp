const app = require('http').createServer(httpHandler)
const io = require('socket.io')(app);
const fs = require('fs');
const allPlayers = {};

app.listen(3030);

function httpHandler (req, res) {
  res.writeHead(200);
  res.end('Server is up!');
}

io.on('connection', (socket) => {
  let clientId = socket.id;

  console.log('-> Player connected', clientId);

  allPlayers[clientId] = {
    clientId: clientId,
    position: {
      x: null,
      y: null
    }
  };

  socket.broadcast.emit('connected', {
    allPlayers,
    clientId
  });

  socket.on('disconnect', (data) =>  {
    console.log('-> Player disconnected', clientId);
    delete allPlayers[clientId];
  });

  socket.on('newPosition', (data) =>  {
    // console.log(data);
    if (allPlayers[data.clientId]){
      allPlayers[data.clientId].position = data.position;

      socket.broadcast.emit('updatePlayers', {
        allPlayers
      });
    }
  });

});
