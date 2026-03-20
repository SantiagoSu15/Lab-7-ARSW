import './App.css'

import { useEffect, useRef, useState, useMemo } from 'react'
import { createStompClient, subscribeBlueprint } from './lib/stompClient.js'
import { createSocket } from './lib/socketIoClient.js'
import TableroComponent from './components/TableroComponent'
import { crearTablero } from './Utils/crearTablero'
import { BarraIzq } from './components/BarraIzquierda'
import {drawAll,pintarCelda} from './Utils/pintar.js'
import { bluePrintApi } from '../services/apiConection.js'



const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080' // Spring
const IO_BASE  = import.meta.env.VITE_IO_BASE  ?? 'http://localhost:3001' // Node/Socket.IO

export default function App() {
  const [tech, setTech] = useState('stomp')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [board, setBoard] = useState(crearTablero(21))



  const initialized = useRef(false)


  const stompRef = useRef(null)
  const unsubRef = useRef(null)
  const socketRef = useRef(null)


  useEffect(()=>{
    if (initialized.current) return  
    initialized.current = true
    const bluePrintRequest = {
      author: 'juan',
      name: 'plano-1',
      points: [[0,0], [1,1]]
    };
    async function primer(){
      await bluePrintApi.createBluePoint(bluePrintRequest)
    }

    try{
      primer()

    }catch(err){
      console.log(console.error(err))
    }
  },[]);





  useEffect(() => {
    async function  cargar (){
      if(!name){
        const res = await bluePrintApi.getByAuthor(author);
        const firstKey = Object.keys(res)[0];
        const firstBlueprint = res[firstKey];
        drawAll(firstBlueprint, setBoard);
        return;
       }
      if(name && author){
        const res = await bluePrintApi.getByAuthorAndBname(author,name);
        drawAll(res, setBoard);
      }
    }
    cargar();
  }, [author, name]);




  useEffect(() => {
    unsubRef.current?.(); unsubRef.current = null
    stompRef.current?.deactivate?.(); stompRef.current = null
    socketRef.current?.disconnect?.(); socketRef.current = null

    if (tech === 'stomp') {
      const client = createStompClient(API_BASE)
      stompRef.current = client
      client.onConnect = () => {
        unsubRef.current = subscribeBlueprint(client, author, name, (upd)=> {
          drawAll({ points: upd.points },setBoard)
        })
      }
      client.activate()
    } else {
      const s = createSocket(IO_BASE)
      socketRef.current = s
      const room = `blueprints.${author}.${name}`
      s.emit('join-room', room)
      s.on('blueprint-update', (upd)=> drawAll({ points: upd.points },setBoard))
    }
    return () => {
      unsubRef.current?.(); unsubRef.current = null
      stompRef.current?.deactivate?.()
      socketRef.current?.disconnect?.()
    }
  }, [tech, author, name])




  function handleClickCelda(fila, col) {
    const point = { x: col, y: fila };
    pintarCelda(fila,col,setBoard)
    console.log('point enviado:', point)

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

  const puntos = board.flatMap((row, y) =>
    row
      .map((cell, x) => ({ cell, x }))        // primero guarda el x real
      .filter(({ cell }) => cell.revelado)    // luego filtra
      .map(({ x }) => ({ x, y }))            // y usa el x real
  )

  return (
    <div id="app-container">
    <BarraIzq tech={tech} setTech={setTech} author={author}  setAuthor={setAuthor}name={name} setName={setName} puntos={puntos}/>
    <div id="tablero-container">
      <TableroComponent board={board} onClickCelda={handleClickCelda} />
    </div>
  </div>
  )
}


