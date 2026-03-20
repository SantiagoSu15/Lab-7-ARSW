# Lab-7 ARSW — BluePrints Tiempo Real con Socket.IO

**Colaboración en tiempo real para diseño de planos** con ReactJS + Socket.IO (Node.js)

Múltiples usuarios pueden dibujar en el mismo plano **simultáneamente** sin recargar la página.

---

## Setup

### Requisitos

- **Node.js** v18+ (recomendado v24 LTS)
- **npm** o **pnpm**

### Instalación

**1) Frontend:**
```bash
npm install
```

**2) Backend:**
```bash
cd server
npm install
cd ..
```
## Setup con Docker 

### Requisitos
- **Docker** v20+
- **Docker Compose** v2+

### Backend Socket.IO en Docker

**Dockerfile** (server/Dockerfile):
```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

**docker-compose.yml** (en raíz):
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - NODE_ENV=development
    volumes:
      - ./server:/app
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_IO_BASE=http://localhost:3001
      - VITE_API_BASE=http://localhost:8080
    volumes:
      - ./src:/app/src
    restart: unless-stopped
    depends_on:
      - backend
```

**Dockerfile** :
```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### Ejecución con Docker Compose
```bash
# Levantar ambos servicios
docker-compose up

# En background
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Resultado:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

---


---

### Ejecución
**Terminal 1 - Backend Socket.IO:**
```bash
cd server
node server.js
```

**Esperado:**
```
  HTTP  → http://localhost:3001
  WS    → ws://localhost:3001
  CORS  → * (desarrollo)
```

**Terminal 2 - Frontend React:**
```bash
npm run dev
```

**Esperado:**
```
  VITE v5.4.21  ready in 321 ms
  ➜  Local:   http://localhost:5173/
```

---

### Variables de Entorno

**`.env.local`** (ya incluido):
```bash
VITE_API_BASE=http://localhost:8080      # Backend REST (opcional)
VITE_IO_BASE=http://localhost:3001       # Socket.IO WebSocket
```

---

### Prueba en Navegador

1. **Abre 2 pestañas:**
   ```
   http://localhost:5173
   ```

2. **En ambas pestañas:**
   - Tecnología: **"Socket.IO (Node)"**
   - Autor: `juan`
   - Plano: `plano-1`

3. **Pestaña 1:** Haz clic en celdas del tablero
   - Pestaña 1: Actualización local (instante)
   - Pestaña 2: Recibe cambios **en tiempo real** (automático)

---

## Endpoints Usados

### REST API (Backend)

| Método | Endpoint | Descripción | Ejemplo |
|--------|----------|-------------|---------|
| **GET** | `/api/blueprints/:author/:name` | Obtiene puntos iniciales del plano | `GET /api/blueprints/juan/plano-1` |

**Respuesta:**
```json
{
  "author": "juan",
  "name": "plano-1",
  "points": [
    {"x": 12, "y": 3},
    {"x": 4, "y": 13},
    {"x": 5, "y": 10}
  ]
}
```

**Prueba rápida:**
```bash
curl http://localhost:3001/api/blueprints/juan/plano-1
```

---

## Comparativa: Socket.IO vs STOMP

| Criterio | **Socket.IO (Node.js)** | **STOMP (Spring Boot)** |
|----------|--------------------------|------------------------|
| **Protocolo** | WebSocket + fallbacks | STOMP sobre WebSocket/SockJS |
| **Modelo** | Eventos (`emit`/`on`) | Pub/Sub (`publish`/`subscribe`) |
| **Salas** | Nativas (`join`, `rooms`) | Tópicos (`/topic/...`) |
| **Escalado** | Adapters (Redis) | Message broker (RabbitMQ, etc.) |
| **Curva aprendizaje** | Media (eventos intuitivos) | Alta (STOMP + Spring config) |
| **Performance** | Muy rápido (~50ms latencia) | Dependiente del broker |
| **Middleware** | Sí (custom handlers) | Spring Interceptors |
| **Testing** | Fácil (standalone) | Requiere Spring test context |
| **Debugging** | Browser DevTools + logs | Logs + message broker UI |

---

## autores
santiago suarez, juan felipe rangel
