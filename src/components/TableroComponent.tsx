import { useEffect, useRef, useState } from 'react'
import { crearTablero } from '../Utils/crearTablero';
import type { Celda } from '../Utils/celda';
import React from "react";
import CeldaComponent from './Celda';

type props ={
    board: Celda[][];                      
    onClickCelda: () => void;

}


export const TableroComponent = ({ board, onClickCelda }: props) =>{
    const size = 21;

   

    return (
        <div id = "board" style={{ "--size": size } as React.CSSProperties}>
        {
            board.map((fila,i) =>
                fila.map((cell,j)=>
                <CeldaComponent
                    key={`${i}-${j}`}
                    cell={cell}
                    onClick={onClickCelda}
                />
            ))
        }
        </div>
    );
}

export default TableroComponent