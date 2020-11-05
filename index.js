const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const fs = require('fs');
const countDatabase = new Map();

// TODO: public port
console.info('Listening');
if (!process.env.PORT) {
   console.error('No port specified.');
   return -1
}

app.listen(process.env.PORT);

function stripSpaces(stringWithSpaces) {
  return stringWithSpaces.replace(' ', '');
}

function handler (req, res) {
    var path = req.url;

    if (path.indexOf('?') > -1) {
        // trim off the url params
        path = path.split('?')[0];
    }
    // TODO: sanitize req.url
    const filePath = __dirname + `/public${path === '/' ? '/index.html' : path}`;
    const contentType = handleContentType(path);

    // API: status
    if (path === '/stats') {
        const mapMap = {};
        for (let [k, v] of countDatabase) {
            mapMap[k] = v;
        }

        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(mapMap));
        res.end();
        return;
    }

    // some sort of JSON
    if (req.url.includes('text/' || req.url.includes('application/'))) {
        console.log('url includes text/ or application/');

        fs.readFile(
            'utf8',
            (err, data) => {
                if (err) {
                    res.writeHead(500);
                    return res.end(`Error loading ${req.url}`);
                }
                
                res.writeHead(200, {"Content-Type": `${contentType}`});
                res.write(data, "utf8");
                res.end();
        });
    } else {
        // site pages
        var s = fs.createReadStream(filePath);
        s.on('open', () => {
            res.setHeader('Content-Type', contentType);
            s.pipe(res);
        });

        s.on('error', function () {
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 404;
            res.end('Not found');
        });
    }
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
  } else if (url.includes('.ico')) {
    return 'image/vnd.microsoft.icon';
  } else {
    return 'text/html; charset=utf-8';
  }
}

io.on('connection', (socket) => {  
  console.log('someone connected...');

  socket.on('getCount', (data) => {
    console.log(`someone asked for a count on ${data.tenant}`);

    const { tenant: tenantInput } = data;
    const tenant = stripSpaces(tenantInput);

    if (!tenant.length) {
      socket.emit('count', { error: `${tenantInput} is not a valid name`});
    }

    socket.emit('count', {
      tenant,
      count: countDatabase.get(tenant) || 0,
    });
  });

  socket.on('count', (data) => {
    const { tenant: tenantInput, count } = data;

    const tenant = stripSpaces(tenantInput);
    if (tenant.length) {
      countDatabase.set(tenant, count);
      io.emit('count', data); // to everyone
    } else {
      io.emit('count', { error: `${tenantInput} is not a valid name`});
    }
  });

  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });
});
