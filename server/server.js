import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const blueprints = new Map();


function getBlueprint(author, name) {
  const key = `${author}:${name}`;
  if (!blueprints.has(key)) {
    blueprints.set(key, {
      author,
      name,
      points: []
    });
  }
  return blueprints.get(key);
}


app.use(cors());
app.use(express.json());


app.get('/api/blueprints/:author/:name', (req, res) => {
  const { author, name } = req.params;
  const blueprint = getBlueprint(author, name);
  
  console.log(`[REST] GET /api/blueprints/${author}/${name} → ${blueprint.points.length} puntos`);
  res.json(blueprint);
});


io.on('connection', (socket) => {
  console.log(`[SOCKET] Cliente conectado: ${socket.id}`);


  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`[SOCKET] ${socket.id} se unió a la sala: ${room}`);
  });


  socket.on('draw-event', (data) => {
    const { room, author, name, point } = data;

    if (!room || !author || !name || !point) {
      console.warn(`[SOCKET] draw-event inválido:`, data);
      return;
    }

    const blueprint = getBlueprint(author, name);
    blueprint.points.push(point);

    console.log(
      `[SOCKET] draw-event de ${socket.id}: (${point.x},${point.y}) en sala ${room}`
    );

    io.to(room).emit('blueprint-update', {
      author,
      name,
      points: [point] 
    });
  });


  socket.on('disconnect', () => {
    console.log(`[SOCKET] Cliente desconectado: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  HTTP  → http://localhost:${PORT}                       
  WS    → ws://localhost:${PORT}                         
  `);
});
