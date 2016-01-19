const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());

app.post('/api/v1/notify-upgrade', function(req, res) {
  const token = req.body.token;

  if (token != process.env.UPGRADE_NOTIFY_TOKEN) {
    res.sendStatus(401);
  } else {
    io.emit('upgrade');
    res.sendStatus(201);
  }
});

var currentImageUrl;
io.on('connection', function(socket) {
  socket.on('image shared', function(data) {
    currentImageUrl = data.imageUrl;
    io.emit('image shared', data);
  });

  // get the new user the current image everyone else is already seeing
  io.to(socket.id).emit('image shared', {
    imageUrl: currentImageUrl
  });
});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
