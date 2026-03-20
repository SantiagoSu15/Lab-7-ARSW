# 🚀 Backend Socket.IO - BluePrints P4

Backend Node.js + Express + Socket.IO para colaboración en tiempo real en planos/blueprints.

## 📋 Requisitos

- **Node.js** v18+ (v20 LTS recomendado)
- **npm** o **pnpm**

## 🏗️ Instalación

```bash
# Desde la carpeta server/
npm install
```

## ▶️ Ejecución

### Desarrollo
```bash
npm run dev
# El servidor levanta en http://localhost:3001
```

### Producción
```bash
PORT=3001 npm start
```

## 🔌 API & Eventos

### REST Endpoints

**GET `/api/blueprints/:author/:name`** - Obtiene estado inicial del plano
```bash
curl http://localhost:3001/api/blueprints/juan/plano-1
```

**Respuesta:**
```json
{
  "author": "juan",
  "name": "plano-1",
  "points": [
    { "x": 10, "y": 20 },
    { "x": 15, "y": 25 }
  ]
}
```

### Socket.IO Events

**Cliente → Servidor**
- `join-room` - Unirse a una sala
  ```js
  socket.emit('join-room', 'blueprints.juan.plano-1');
  ```

- `draw-event` - Enviar un punto para dibujar
  ```js
  socket.emit('draw-event', {
    room: 'blueprints.juan.plano-1',
    author: 'juan',
    name: 'plano-1',
    point: { x: 5, y: 10 }
  });
  ```

**Servidor → Clientes (broadcast)**
- `blueprint-update` - Actualización de blueprint (broadcast a la sala)
  ```json
  {
    "author": "juan",
    "name": "plano-1",
    "points": [{ "x": 5, "y": 10 }]
  }
  ```

## 🧪 Prueba con el Frontend

1. **Instala deps del backend:**
   ```bash
   cd server
   npm install
   ```

2. **Levanta el backend:**
   ```bash
   npm run dev
   # Escucha en puerto 3001
   ```

3. **En otra terminal, levanta el frontend:**
   ```bash
   npm run dev
   # Escucha en puerto 5173
   ```

4. **En el navegador:**
   - Abre `http://localhost:5173`
   - Selecciona **"Socket.IO (Node)"** en el dropdown de tecnología
   - Ingresa autor y nombre del plano
   - Abre **dos pestañas** del navegador
   - Haz clic en el canvas: verás el trazo replicado en tiempo real

## ⚙️ Variables de Entorno

- `PORT` (default: **3001**) - Puerto del servidor
  ```bash
  PORT=4000 npm run dev
  ```

## 📦 Dependencias

- **express** - Framework web
- **socket.io** - Tiempo real WebSocket
- **cors** - Manejo de CORS

## 🔐 Seguridad

- **Desarrollo:** CORS abierto (`origin: '*'`)
- **Producción:** Restringe orígenes:
  ```js
  cors: {
    origin: ['https://tu-frontend.com'],
    credentials: true
  }
  ```

## ❓ Troubleshooting

| Problema | Solución |
|----------|----------|
| **Puerto 3001 ocupado** | Cambia `PORT=3002 npm run dev` |
| **No hay broadcast** | Verifica que ambas pestañas hacen `join-room` a la misma sala |
| **CORS bloqueado** | Asegúrate que frontend está en `http://localhost:5173` |
| **No conecta Socket.IO** | Revisa consola del navegador; fuerza WebSocket en cliente |

## 📚 Extensiones Sugeridas

- Persistencia (Redis, Postgres)
- Escalado con adapters
- Autenticación JWT
- Validación de payloads (zod/joi)
- Métricas y logging

---

**Laboratorio ARSW** - Blueprint Real-Time Collaboration