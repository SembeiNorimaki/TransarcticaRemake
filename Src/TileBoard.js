// Copyright (C) 2024  Sembei Norimaki

// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


/*
TileBoard is a 2D array of Tile instances
*/

class TileBoard {
  constructor(mapData) {
    this.boardDim = createVector(mapData[0].length, mapData.length);
    this.board = Array.from(Array(this.boardDim.y), () => new Array(this.boardDim.x));
    // populate board
    for (let row=0; row<this.boardDim.y; row++) {
      for (let col=0; col<this.boardDim.x; col++) {      
        this.board[row][col] = new Tile(createVector(col, row), mapData[row][col]);        
      }
    }
  }


  showtilesDataCity(cameraPos) {
    let topLeft = cameraToBoard(cameraPos).sub(createVector(14,0));
    let row0 = topLeft.y;
    let col0 = topLeft.x;

    
    let n=0;
    let startRow = row0;
    while(n<=15) {  // increase to add more rendering in Y direction
      let col = col0;
      let row = startRow;
      let nC=0;
      while((row >= 0) && (col < this.boardDim.x) && (nC<15)) {
        try {
          this.board[row][col].showCity(row, col, cameraPos);
        } catch {
          //console.log(`exception in ${col},${row}`)
        }
        col++;
        row--;
        nC++;
      }
      col = col0+1;
      row = startRow;
      nC=0;
      while((row >= 0) && (col < this.boardDim.x) && (nC<14)) {
        try {
          this.board[row][col].showCity(row, col, cameraPos);
        } catch {
          //console.log(`exception in ${col},${row}`)
        }
        col++;
        row--;
        nC++;
      }
      n+=1;
      if (startRow < this.boardDim.y-1) 
        startRow++;
      col0+=1;
    }
  }

  showTiles(canvas, cameraPos) {
    let topLeft = cameraToBoard(cameraPos).sub(createVector(14,0));
    let row0 = topLeft.y;
    let col0 = topLeft.x;
    let col, row, screenPos;
    let startRow = row0;
    
    for (let j=0; j<15;j++) {
      col = col0;
      row = startRow;
      for (let i=0; i<15; i++) {
        if (col < 0 || row < 0 || col >= this.boardDim.x || row >= this.boardDim.y) {
          screenPos = boardToScreen(createVector(col, row), cameraPos)  
          screenPos.add(
            tileCodes[0x00].offset[0],
            tileCodes[0x00].offset[1]
          );
          canvas.image(tileCodes[0x00].img, 
            screenPos.x - TILE_WIDTH_HALF, 
            screenPos.y - TILE_HEIGHT_HALF);

          //canvas.text(`${col}_${row}`, screenPos.x, screenPos.y);
        } else {
          this.board[row][col].show(canvas, row, col, cameraPos);
        }
        col++;
        row--;
      }
      col = col0 + 1;
      row = startRow;
      for (let i=0; i<14; i++) {
        if (col < 0 || row < 0 || col >= this.boardDim.x || row >= this.boardDim.y) {
          screenPos = boardToScreen(createVector(col, row), cameraPos);
          screenPos.add(
            tileCodes[0x00].offset[0],
            tileCodes[0x00].offset[1]
          );
          canvas.image(tileCodes[0x00].img,
            screenPos.x - TILE_WIDTH_HALF, 
            screenPos.y - TILE_HEIGHT_HALF)
          //canvas.text(`${col}_${row}`, screenPos.x, screenPos.y);
        } else {
          this.board[row][col].show(canvas, row, col, cameraPos);
        }
        col++;
        row--;
      }
      col0++;
      startRow++;
    }
  }
}