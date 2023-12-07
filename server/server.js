// create http server to serve spa

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

const hostname = "127.0.0.1";
const port = 3001;
const basePath = path.join(__dirname, "..", "client", "dist");

const server = http.createServer((req, res) => {
  
  console.log(req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url.endsWith("html")) {
    res.setHeader('Content-Type', 'text/html');
  } else if (req.url.endsWith("js")) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith("css")) {
    res.setHeader('Content-Type', 'text/css');
  }

  let target

  if (req.url === "/") {
    target = "index.html";
    res.setHeader('Content-Type', 'text/html');
  } else {
    target = req.url;
  }

  try {
    const file = fs.readFileSync(path.join(basePath, target));
    res.statusCode = 200;
    res.write(file);
  } catch (error) {
    console.log(error);
    res.statusCode = 404;
    res.write("Error 404");
  }

  res.end();

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 

// create websocket server

// const Server = require('socket.io');
// const io = new Server();

// create controller and model logic