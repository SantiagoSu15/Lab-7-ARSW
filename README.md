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
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

EXPOSE 3001
ENV PORT=3001

CMD [ "npm", "run", "dev" ]

```

**docker-compose.yml** (en raíz):
```yaml
services:
  web:
    build:
      context: .
      dockerfile: dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:8080
        VITE_API_BASE: http://localhost:8080
        VITE_IO_BASE: http://localhost:3001
        VITE_STOMP_BASE: http://localhost:8080
    ports:
      - '5173:4173'
    depends_on:
      - ws
      - backend

  ws:
    build:
      context: ./server
    ports:
      - '3001:3001'
    environment:
      - PORT=3001
    depends_on:
      - backend

  backend:
    image: ghcr.io/santiagosu15/lab-5-arsw/java-app:lab-7
    ports:
      - '8080:8080'
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://java_DB:5432/blueprints
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=postgres
    depends_on:
      - java_DB

  java_DB:
    image: postgres:13.3
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=blueprints
```

**Dockerfile** :
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_API_BASE
ARG VITE_IO_BASE
ARG VITE_STOMP_BASE

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_IO_BASE=$VITE_IO_BASE
ENV VITE_STOMP_BASE=$VITE_STOMP_BASE

COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD [ "serve", "-s", "dist", "-l", "4173" ]
```

### Ejecución con Docker Compose
```bash
# Levantar todos los servicios
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
- Backend Spring: `http://localhost:8080`

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

### REST API (Spring)

| Método | Endpoint | Descripción | Ejemplo |
|--------|----------|-------------|---------|
| **GET** | `/blueprints/{author}` | Lista blueprints de un autor | `GET /blueprints/juan` |
| **GET** | `/blueprints/{author}/{name}` | Obtiene puntos iniciales del plano | `GET /blueprints/juan/plano-1` |
| **POST** | `/blueprints` | Crea blueprint nuevo | `POST /blueprints` |
| **PUT** | `/blueprints/{author}/{name}/points` | Actualiza puntos del blueprint | `PUT /blueprints/juan/plano-1/points` |
| **DELETE** | `/blueprints/{author}/{name}` | Elimina un blueprint | `DELETE /blueprints/juan/plano-1` |

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
curl http://localhost:8080/blueprints/juan/plano-1
```

---

### Eventos Tiempo Real (Socket.IO - Node)

| Dirección | Evento | Payload | Descripción |
|-----------|--------|---------|-------------|
| Cliente -> Servidor | `join-room` | `room` (`blueprints.{author}.{name}`) | Une el cliente a la sala del blueprint |
| Cliente -> Servidor | `draw-event` | `{ room, author, name, point: {x,y} }` | Envía el punto dibujado |
| Servidor -> Clientes | `blueprint-update` | `{ author, name, points: [point] }` | Broadcast del nuevo punto a la sala |

---

## Referencia Rapida: Dónde se usa cada endpoint/evento

| Endpoint / Evento | Dónde se usa |
|-------------------|--------------|
| `GET /blueprints/{author}` | `services/apiConection.js` -> `bluePrintApi.getByAuthor()`; invocado desde `src/App.jsx` en `cargar()` cuando no hay nombre |
| `GET /blueprints/{author}/{name}` | `services/apiConection.js` -> `bluePrintApi.getByAuthorAndBname()`; invocado desde `src/App.jsx` en `cargar()` |
| `POST /blueprints` | `services/apiConection.js` -> `bluePrintApi.createBluePoint()`; invocado en `src/components/BarraIzquierda.tsx` (`onGuardar`) y en `src/App.jsx` (carga inicial) |
| `PUT /blueprints/{author}/{name}/points` | `services/apiConection.js` -> `bluePrintApi.editBluePoint()`; invocado en `src/components/BarraIzquierda.tsx` (`onActualizar`) |
| `DELETE /blueprints/{author}/{name}` | `services/apiConection.js` -> `bluePrintApi.deleteBluePoint()`; invocado en `src/components/BarraIzquierda.tsx` (`onEliminar`) |
| `join-room` | Emitido en `src/App.jsx` al conectar Socket.IO (`useEffect` de `tech/author/name`) y manejado en `server/server.js` |
| `draw-event` | Emitido en `src/App.jsx` (`handleClickCelda`) y manejado en `server/server.js` |
| `blueprint-update` | Emitido por `server/server.js` y escuchado en `src/App.jsx` para repintar (`drawAll`) |

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
## Video

https://github.com/user-attachments/assets/a08cbc36-8439-493a-ac42-e2eab89f2097

* Se uso una version sin seguridad JWT del laboratorio num 6 en una rama aparte
* Ambos usuarios tienen que estar en la misma tecnologia, tablero y autor para notar los cambios en tiempo real
* Automaticamente si se cambia de autor/tablero cambia el dibujo (Si existe un tablero asociado a esos datos, de lo contrario se mantiene el anterior)
* Si se crea un nuevo tablero pero no se ha guardado ningun usuario lo podra ver hasta que este sea guardado en caso de entrar solo mirara los cambios parciales
  

---

## autores
santiago suarez, juan felipe rangel
