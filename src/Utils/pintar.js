export function drawAll(upd,setBoard) {
    if(!upd){
      return;
    }
    setBoard(prev => {
      return prev.map((row, y) =>
        row.map((cell, x) => {
          const match = upd.points.some(p => p.x === x && p.y === y);
    
          return match
            ? { ...cell, revelado: true }
            : cell;
        })
      );
    });
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