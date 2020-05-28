const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const fs = require('fs');
const countDatabase = new Map();

// TODO: public port
app.listen(8080);

function handler (req, res) {
  // TODO: sanitize req.url
  fs.readFile(
    __dirname + `/public${req.url === '/' ? '/index.html' : req.url}`,
    'utf8',
    (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end(`Error loading ${req.url}`);
      }
      const contentType = handleContentType(req.url);
      

      res.writeHead(200, {"Content-Type": `${contentType}; charset=utf-8`});
      res.write(data, "utf8");
      // res.writeHead(200);
      res.end();
    }
  );
}

function handleContentType(url) {
  if (url.includes('.css')) {
    return 'text/css';
  } else if (url.includes('.js')) {
    return 'application/javascript'
  } else if (url.includes('.png')) {
    return 'image/png';
  } else if (url.includes('.jpg')) {
    return 'image/jpeg';
  } else {
    return 'text/html';
  }
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
