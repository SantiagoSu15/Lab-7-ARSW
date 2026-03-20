import React, { useState } from "react"

type BarraProps = {
    tech: string;
    setTech: (val: string) => void;
    author: string;
    setAuthor: (val: string) => void;
    name: string;
    setName: (val: string) => void;
  };

  export const BarraIzq = ({ tech, setTech, author, setAuthor, name, setName }: BarraProps) => {
    const[creando,setCreando] = useState(false);

    function crearBluepoint(){
        setCreando(true);
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
        <button disabled={creando}>Actualizar Bluepoint</button>
        <button>Eliminar Bluepoint</button>
        {creando && <button onClick={crearBluepoint}>Guardar Bluepoint</button>}

      </div>
    );
  };