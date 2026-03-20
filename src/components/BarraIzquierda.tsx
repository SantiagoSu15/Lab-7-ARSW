import React, { useState } from "react"
import { bluePrintApi } from "../../services/apiConection";
import type { bluePrintRequest, points } from "../../services/tiposApi";


type BarraProps = {
    tech: string;
    setTech: (val: string) => void;
    author: string;
    setAuthor: (val: string) => void;
    name: string;
    setName: (val: string) => void;
    puntos: { x: number; y: number }[]; 
    };

  export const BarraIzq = ({ tech, setTech, author, setAuthor, name, setName, puntos}: BarraProps) => {
    const[creando,setCreando] = useState(false);

    function crearBluepoint(){
        setCreando(true);
    }


    async function onEliminar(){
      await bluePrintApi.deleteBluePoint(author,name);
    }

    async function onActualizar() {
      console.log('puntos a enviar:', puntos)
      await bluePrintApi.editBluePoint(author, name, puntos)
  }

    async function onGuardar() {
      setCreando(false)
      await bluePrintApi.createBluePoint({
        author: author,
        name: name,
        points: puntos.map(p => ({ x: p.x, y: p.y }))
      })
    }

    return (
      <div id="barraIzq">
        <label>Tecnología:</label>
        <select value={tech} onChange={e => setTech(e.target.value)}>
          <option value="stomp">STOMP (Spring)</option>
          <option value="socketio">Socket.IO (Node)</option>
        </select>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="autor"/>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="plano"/>
        {!creando && <button onClick={crearBluepoint}>Nuevo Bluepoint</button>}
        <button disabled={creando} onClick={onActualizar}>Actualizar Bluepoint</button>
        <button onClick={onEliminar}>Eliminar Bluepoint</button>
        {creando && <button onClick={onGuardar}>Guardar Bluepoint</button>}

      </div>
    );
  };