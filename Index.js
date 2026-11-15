const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });

const rooms = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'join') {
        currentRoom = data.room;
        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, new Set());
        }
        rooms.get(currentRoom).add(ws);
      } else if (currentRoom && rooms.has(currentRoom)) {
        for (const client of rooms.get(currentRoom)) {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message);
          }
        }
      }
    } catch (e) {
      console.error('Erro ao processar mensagem:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

console.log('OpenTune Relay Server rodando na porta ' + PORT);
                    
