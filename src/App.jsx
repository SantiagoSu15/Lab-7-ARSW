import './App.css'

import { useEffect, useRef, useState } from 'react'
import { createStompClient, subscribeBlueprint } from './lib/stompClient.js'
import { createSocket } from './lib/socketIoClient.js'
import TableroComponent from './components/TableroComponent'
import { crearTablero } from './Utils/crearTablero'



const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080' // Spring
const IO_BASE  = import.meta.env.VITE_IO_BASE  ?? 'http://localhost:3001' // Node/Socket.IO

export default function App() {
  const [tech, setTech] = useState('stomp')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [board, setBoard] = useState(crearTablero(21))

  const canvasRef = useRef(null)

  const stompRef = useRef(null)
  const unsubRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    fetch(`${tech==='stomp'?API_BASE:IO_BASE}/api/blueprints/${author}/${name}`)
      .then(r=>r.json())
      .then(data => drawAll(data))
  }, [tech, author, name])

  function drawAll(upd) {
    if(!upd){
      return;
    }
    setBoard(prev => {
      return prev.map((row, y) =>
        row.map((cell, x) => {
          const match = upd.points.some(p => p.x === x && p.y === y);
    
          return match
            ? { ...cell, revelado: true }
            : cell;
        })
      );
    });
  }

  function pintarCelda(fil,col){
    setBoard(prev =>
      prev.map((row, y) =>
        row.map((cell, x) =>
          x === col && y === fil ? { ...cell, revelado: !cell.revelado } : cell
        )
      )
    );
  }

  useEffect(() => {
    unsubRef.current?.(); unsubRef.current = null
    stompRef.current?.deactivate?.(); stompRef.current = null
    socketRef.current?.disconnect?.(); socketRef.current = null

    if (tech === 'stomp') {
      const client = createStompClient(API_BASE)
      stompRef.current = client
      client.onConnect = () => {
        unsubRef.current = subscribeBlueprint(client, author, name, (upd)=> {
          drawAll({ points: upd.points })
        })
      }
      client.activate()
    } else {
      const s = createSocket(IO_BASE)
      socketRef.current = s
      const room = `blueprints.${author}.${name}`
      s.emit('join-room', room)
      s.on('blueprint-update', (upd)=> drawAll({ points: upd.points }))
    }
    return () => {
      unsubRef.current?.(); unsubRef.current = null
      stompRef.current?.deactivate?.()
      socketRef.current?.disconnect?.()
    }
  }, [tech, author, name])

  function handleClickCelda(fila, col) {
    const point = { x: col, y: fila };
    pintarCelda(fila,col)
  
    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({
        destination: '/app/draw',
        body: JSON.stringify({ author, name, point })
      });
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`;
      socketRef.current.emit('draw-event', { room, author, name, point });
    }
  }

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:16, maxWidth:900}}>
      <h2>BluePrints RT – Socket.IO vs STOMP</h2>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
        <label>Tecnología:</label>
        <select value={tech} onChange={e=>setTech(e.target.value)}>
          <option value="stomp">STOMP (Spring)</option>
          <option value="socketio">Socket.IO (Node)</option>
        </select>
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="autor"/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="plano"/>
      </div>
      <TableroComponent  board={board} onClickCelda={handleClickCelda} />
    </div>
  )
}
