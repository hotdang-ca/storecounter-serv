const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const fs = require('fs');

// TODO: public port
app.listen(8080);

const countDatabase = new Map();

function handler (req, res) {
  fs.readFile(__dirname + '/public/index.html',
  (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', (socket) => {  
  console.log('someone connected...');

  socket.on('getCount', (data) => {
    console.log(`someone asked for a count on ${data.tenant}`);

    const { tenant } = data;
    if (!countDatabase.get(tenant)) {
      countDatabase.set(tenant, 0);
    }

    socket.emit('count', {
      tenant,
      count: countDatabase.get(tenant),
    });
  });

  socket.on('count', (data) => {
    console.log(data);

    const { tenant, count } = data;
    countDatabase.set(tenant, count);
    io.emit('count', data); // to everyone
  });

  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });
});
