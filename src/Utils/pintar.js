export function drawAll(upd, setBoard, { replace = true } = {}) {
  if (!upd || !upd.points || !setBoard) return;

  setBoard(prev =>
    prev.map((row, y) =>
      row.map((cell, x) => {
        const match = upd.points.some(p => p.x === x && p.y === y);
        if (replace) {
          // Carga/repaint completo (ej. al cambiar de plano).
          return { ...cell, revelado: match };
        }

        // Modo incremental: acumula (no apaga puntos previamente revelados).
        return { ...cell, revelado: Boolean(cell.revelado) || match };
      })
    )
  );
}

 export function pintarCelda(fil,col,setBoard){
    setBoard(prev =>
      prev.map((row, y) =>
        row.map((cell, x) =>
          x === col && y === fil ? { ...cell, revelado: !cell.revelado } : cell
        )
      )
    );
  }