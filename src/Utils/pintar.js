export function drawAll(upd, setBoard) {
  if (!upd || !upd.points || !setBoard) return;

  setBoard(prev =>
    prev.map((row, y) =>
      row.map((cell, x) => {
        const match = upd.points.some(p => p.x === x && p.y === y);
        return { ...cell, revelado: match };  
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