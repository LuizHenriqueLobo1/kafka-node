import { Server } from 'socket.io';
import http from 'http';
import fs from 'fs';

// cria o servidor http
const app = http.createServer((req, res) => {
  fs.readFile('./src/index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html: '+ err);
    }

    res.writeHead(200);
    res.end(data);
  });
});

// cria o servidor do sockect
const io = new Server(app);

// sockets de clientes
let monitorSockets = [];

// gerencia as coneções no servidor
io.on('connection', (clientSocket) => {
  let connectionType = clientSocket.handshake.headers.conntype;
  let clientId = clientSocket.handshake.headers.clientid;

  console.log('ms-monitor', (new Date()).toLocaleString(), 'connection request from', clientId, 'of type', connectionType);

  if (connectionType == "monitor") {
    // sendo um monitor, adicionar o socket na lista de listeners
    monitorSockets.push(clientSocket);

  } else if (["producer", "consumer"].includes(connectionType)) {
    // sendo produtor ou consumidor, registra o listener de mensagem para enviar para os monitores
    clientSocket.on('message', (msg) => {
      monitorSockets.forEach(monitorSocket => {
        monitorSocket && monitorSocket.emit && monitorSocket.emit('message', msg);
      });
    });
  }
});

// Inicia o servidor http
app.listen(3000);