import type { Celda } from "./celda";

export type Tablero = {
    celdas: Celda[][]; 
    tamaño: number;
    element: HTMLDivElement;
  };