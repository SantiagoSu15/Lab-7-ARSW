import React, { useState } from "react";
import type { Celda } from '../Utils/celda';


type Props = {
    cell : Celda;
    onClick: (fila: number, col: number) => void;
};



const CeldaComponent =({cell,onClick  }: Props)=>{    
    const idCell = `${cell.fila}-${cell.columna}`;    
    return(
        <div id= {idCell} className={`cell ${cell.revelado ? "open" : ""}`} onClick={() => onClick?.(cell.fila, cell.columna)}></div>
    );
};

export default CeldaComponent;