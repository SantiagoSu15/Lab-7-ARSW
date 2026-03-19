import { useEffect, useRef, useState } from 'react'
import { crearTablero } from '../Utils/crearTablero';
import type { Celda } from '../Utils/celda';
import React from "react";
import CeldaComponent from './Celda';


export const TableroComponent = () =>{
    const size = 21;

    const [celdas]  = useState<Celda[][]>(
        () => crearTablero(size) 
    );

    return (
        <div id = "board" style={{ "--size": size } as React.CSSProperties}>
        {
            celdas.map((fila,i) =>
                fila.map((cell,j)=>
                <CeldaComponent
                    key={`${i}-${j}`}
                    cell={cell}
                />
            ))
        }
        </div>
    );
}

export default TableroComponent