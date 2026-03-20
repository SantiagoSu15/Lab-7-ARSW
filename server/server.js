import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

// ────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ────────────────────────────────────────────────────────────
// ALMACENAMIENTO EN MEMORIA (puntos por plano)
// ────────────────────────────────────────────────────────────
const blueprints = new Map();

/**
 * Obtiene o crea un blueprint (plano)
 * Clave: "author:name"
 */
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

// ────────────────────────────────────────────────────────────
// MIDDLEWARE
// ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ────────────────────────────────────────────────────────────
// ENDPOINTS REST
// ────────────────────────────────────────────────────────────

/**
 * GET /api/blueprints/:author/:name
 * Retorna el estado inicial del plano (puntos)
 */
app.get('/api/blueprints/:author/:name', (req, res) => {
  const { author, name } = req.params;
  const blueprint = getBlueprint(author, name);
  
  console.log(`[REST] GET /api/blueprints/${author}/${name} → ${blueprint.points.length} puntos`);
  res.json(blueprint);
});

// ────────────────────────────────────────────────────────────
// EVENTOS SOCKET.IO
// ────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[SOCKET] Cliente conectado: ${socket.id}`);

  /**
   * Evento: join-room
   * Cliente se une a una sala específica
   *   room: "blueprints.{author}.{name}"
   */
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`[SOCKET] ${socket.id} se unió a la sala: ${room}`);
  });

  /**
   * Evento: draw-event
   * Cliente envía un punto para dibujar
   * Payload: { room, author, name, point: {x, y} }
   */
  socket.on('draw-event', (data) => {
    const { room, author, name, point } = data;

    if (!room || !author || !name || !point) {
      console.warn(`[SOCKET] draw-event inválido:`, data);
      return;
    }

    // Guardar el punto en el blueprint
    const blueprint = getBlueprint(author, name);
    blueprint.points.push(point);

    console.log(
      `[SOCKET] draw-event de ${socket.id}: (${point.x},${point.y}) en sala ${room}`
    );

    // Broadcast a todos los clientes en la sala
    io.to(room).emit('blueprint-update', {
      author,
      name,
      points: [point] // Solo el punto nuevo (o puedes enviar todos)
    });
  });

  /**
   * Evento: disconnect
   */
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Cliente desconectado: ${socket.id}`);
  });
});

// ────────────────────────────────────────────────────────────
// INICIO DEL SERVIDOR
// ────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 Backend Socket.IO - BluePrints P4                     ║
║  HTTP  → http://localhost:${PORT}                       ║
║  WS    → ws://localhost:${PORT}                         ║
║  CORS  → * (desarrollo)                                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
