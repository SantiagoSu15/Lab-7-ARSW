import React, { useState } from "react";
import type { Celda } from '../Utils/celda';


type Props = {
    cell : Celda;
};



const CeldaComponent =({cell }: Props)=>{    

    const [celda,setCelda] = useState(cell);

    function pintar (){
        setCelda({...celda,revelado: !celda.revelado})
    }



    const idCell = `${celda.fila}-${celda.columna}`;    
    return(
        <div id= {idCell} className={`cell ${celda.revelado ? "open" : ""}`} onClick={()=>pintar()}></div>
    );
};

export default CeldaComponent;