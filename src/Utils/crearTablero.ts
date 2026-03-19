import type { Celda } from "./celda";

export function crearTablero(tamaño: number): Celda[][] {
    const celdas: Celda[][] = [];

    for(let i = 0;i<tamaño;i++){
        const fila: Celda[] = [];
        for(let j = 0;j<tamaño;j++){
            const cell: Celda = {
                fruta: false,
                fila: i,
                columna:j
            };       
            fila.push(cell);
        };
        celdas.push(fila);
    };



    return celdas;
}