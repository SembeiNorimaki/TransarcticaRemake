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
        try {  
        this.board[row][col] = new Tile(createVector(col, row), mapData[row][col]);        
        } catch {
          console.log(`Error initializing tile: ${row},${col},${mapData[row][col]}`);
        }
      }
    }
  }





  // buildCity(boardPos) {
  //   this.board[boardPos.y][boardPos.x].setTileId(0xA3);
  // }
  // buildIndustry(boardPos) {
  //   this.board[boardPos.y][boardPos.x].setTileId(0xFE);
  // }


  // showtilesDataCity(cameraPos) {
  //   let topLeft = cameraToBoard(cameraPos).sub(createVector(14,0));
  //   let row0 = topLeft.y;
  //   let col0 = topLeft.x;

    
  //   let n=0;
  //   let startRow = row0;
  //   while(n<=15) {  // increase to add more rendering in Y direction
  //     let col = col0;
  //     let row = startRow;
  //     let nC=0;
  //     while((row >= 0) && (col < this.boardDim.x) && (nC<15)) {
  //       try {
  //         this.board[row][col].showCity(row, col, cameraPos);
  //       } catch {
  //         //console.log(`exception in ${col},${row}`)
  //       }
  //       col++;
  //       row--;
  //       nC++;
  //     }
  //     col = col0+1;
  //     row = startRow;
  //     nC=0;
  //     while((row >= 0) && (col < this.boardDim.x) && (nC<14)) {
  //       try {
  //         this.board[row][col].showCity(row, col, cameraPos);
  //       } catch {
  //         //console.log(`exception in ${col},${row}`)
  //       }
  //       col++;
  //       row--;
  //       nC++;
  //     }
  //     n+=1;
  //     if (startRow < this.boardDim.y-1) 
  //       startRow++;
  //     col0+=1;
  //   }
  // }

  // draw3D(canvas, cameraPos) {
  //   let off = mainCanvasDim[0] / (2*TILE_MINI_WIDTH);
  //   let n = off
  //   let m = n;
  //   let topLeft = cameraToBoardSmall(cameraPos).sub(createVector(off,0));
  //   let row0 = topLeft.y;
  //   let col0 = topLeft.x;
  //   let col, row, screenPos;
  //   let startRow = row0;
    
  //   let orderIdx = 0;
  //   mainCanvas.background("gray")

  //   for (let j=0; j<n;j++) {
  //     col = col0;
  //     row = startRow;
  //     for (let i=0; i<m; i++) {
  //       if (col < 0 || row < 0 || col >= this.boardDim.x || row >= this.boardDim.y) {
  //         screenPos = boardToScreenSmall(createVector(col, row), cameraPos)  
  //         Tile.draw3D(mainCanvas, 0x00, screenPos);
  //         //canvas.text(`${col}_${row}`, screenPos.x, screenPos.y);
  //       } else {
  //         try {
  //           this.board[row][col].draw3D(canvas, cameraPos, orderIdx);
  //         } catch {}
  //         orderIdx++;
  //       }
  //       col++;
  //       row--;
  //     }
  //     col = col0 + 1;
  //     row = startRow;
  //     for (let i=0; i<m; i++) {
  //       if (col < 0 || row < 0 || col >= this.boardDim.x || row >= this.boardDim.y) {
  //         screenPos = boardToScreenSmall(createVector(col, row), cameraPos);
  //         Tile.draw3D(mainCanvas, 0x00, screenPos);
  //         //canvas.text(`${col}_${row}`, screenPos.x, screenPos.y);
  //       } else {
  //         try {
  //         this.board[row][col].draw3D(canvas, cameraPos, orderIdx);
  //         } catch{}
  //         orderIdx++;
  //       }
  //       col++;
  //       row--;
  //     }
  //     col0++;
  //     startRow++;
  //   }
  // }

  placeUnit(position, unit) {
    this.board[position.y][position.x].setUnitId(unit.id);
  }

  placeBuilding(position, building) {
    this.board[position.y][position.x].setBuildingId(building.id);
  }

  moveUnit(ori, dst) {
    this.board[dst.y][dst.x].setUnitId(this.board[ori.y][ori.x].unitId);
    this.board[ori.y][ori.x].setUnitId(null);
  }

  calculatePath(ori, dst) {
    let delta = p5.Vector.sub(dst, ori);
    let firstPoint, secondPoint;
    if (abs(delta.x) > abs(delta.y)) {
      // first we move in the x direction, then diagonal, then in the x direction again
      if (delta.x > 0) {
        firstPoint = createVector(ori.x + (delta.x - abs(delta.y)) / 2, ori.y);
        secondPoint = createVector(ori.x + (delta.x + abs(delta.y)) / 2, dst.y);
      } else {
        firstPoint = createVector(ori.x + (delta.x + abs(delta.y)) / 2, ori.y);
        secondPoint = createVector(ori.x + (delta.x - abs(delta.y)) / 2, dst.y);
      }
    } else {
      if (delta.y > 0) {
        firstPoint = createVector(ori.x, ori.y + (delta.y - abs(delta.x)) / 2);
        secondPoint = createVector(dst.x, ori.y + (delta.y + abs(delta.x)) / 2);
      } else {
        firstPoint = createVector(ori.x, ori.y + (delta.y + abs(delta.x)) / 2);
        secondPoint = createVector(dst.x, ori.y + (delta.y - abs(delta.x)) / 2);
      }
    }
    return [firstPoint, secondPoint, dst.copy()];
  }

  *TileGenerator(tL) {
    let topLeft = tL;
    let col0 = topLeft.x;
    let row0 = topLeft.y;
    let col, row;
    let nX = 26;
    let nY = 26;
  
    for (let y=0; y<nY; y++) {
      col = col0;
      row = row0;
      for (let x=0; x<nX; x++) {
        yield (createVector(col, row))
        col++;
        row--;
      }
      col0++;
      row0++;
    }
    yield null;
  }


  showTiles(canvas, cameraPos) {
    let topLeft = cameraToBoard(cameraPos).sub(createVector(25,0));
    let generator = this.TileGenerator(topLeft);
    let tilePos, screenPos;
    tilePos = generator.next();
    while(tilePos.value !== null) {
      if (tilePos.value.x < 0 || tilePos.value.y < 0 || tilePos.value.x >= this.boardDim.x || tilePos.value.y >= this.boardDim.y) {
        screenPos = boardToScreen(tilePos.value, cameraPos);
        Tile.draw(canvas, 0x6F, screenPos);
      } else {
        this.board[tilePos.value.y][tilePos.value.x].show(canvas, cameraPos);
      }
      
      tilePos = createVector(tilePos.value.x+1, tilePos.value.y)
      if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= this.boardDim.x || tilePos.y >= this.boardDim.y) {
        screenPos = boardToScreen(tilePos, cameraPos);
        Tile.draw(canvas, 0x6F, screenPos);
      } else {
        this.board[tilePos.y][tilePos.x].show(canvas, cameraPos);
      }

      tilePos = generator.next();
    }
  }

  showUnits(canvas, cameraPos) {
    let topLeft = cameraToBoard(cameraPos).sub(createVector(23,0));
    let generator = this.TileGenerator(topLeft);
    let tilePos, screenPos;
    tilePos = generator.next();
    while(tilePos.value !== null) {
      if (tilePos.value.x < 0 || tilePos.value.y < 0 || tilePos.value.x >= this.boardDim.x || tilePos.value.y >= this.boardDim.y) {
      } else {
        if (this.board[tilePos.value.y][tilePos.value.x].isUnit()) {
          game.currentScene.base.units[this.board[tilePos.value.y][tilePos.value.x].unitId].show(cameraPos)
        } else if (this.board[tilePos.value.y][tilePos.value.x].isBuilding()) {
          game.currentScene.base.buildings[this.board[tilePos.value.y][tilePos.value.x].buildingId].show(cameraPos)
        }
      }

      tilePos = createVector(tilePos.value.x+1, tilePos.value.y);
      if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= this.boardDim.x || tilePos.y >= this.boardDim.y) {
      } else {
        if (this.board[tilePos.y][tilePos.x].isUnit()) {
          game.currentScene.base.units[this.board[tilePos.y][tilePos.x].unitId].show(cameraPos)
        } else if (this.board[tilePos.y][tilePos.x].isBuilding()) {
          game.currentScene.base.buildings[this.board[tilePos.y][tilePos.x].buildingId].show(cameraPos)
        }
      }

      tilePos = generator.next();

    }
  }

  showMinimap(canvas) {
    for (let x=0; x<this.boardDim.x; x++) {
      for (let y=0; y<this.boardDim.y; y++) {
        this.board[y][x].showTilePixel(canvas);
      
      }
    }
  }



  // showTiles2(canvas, cameraPos) {
  //   let halfNTiles = int(screenDim[0] / (2*TILE_WIDTH_HALF)) + 2;

  //   let topLeft = cameraToBoard(cameraPos).sub(createVector(halfNTiles,0));
  //   let row0 = topLeft.y;
  //   let col0 = topLeft.x;
  //   let col, row, screenPos;
  //   let startRow = row0;
    
  //   for (let j=0; j<halfNTiles;j++) {
  //     col = col0;
  //     row = startRow;
  //     for (let i=0; i<halfNTiles; i++) {
  //       if (col < 0 || row < 0 || col >= this.boardDim.x || row >= this.boardDim.y) {
  //         screenPos = boardToScreen(createVector(col, row), cameraPos)  
  //         Tile.draw(mainCanvas, 0x6F, screenPos);
  //       } else {
  //         // Show terrain
  //         this.board[row][col].show(canvas, cameraPos);
  //         if (this.board[row][col].isBuilding()) {
  //           // draw building
  //           game.currentScene.base.buildings[this.board[row][col].buildingId].show(cameraPos)
  //         } else if (this.board[row][col].isUnit()) {
  //           // draw unit
  //           game.currentScene.base.units[this.board[row][col].unitId].show(cameraPos)
  //         } else {
  //         }

  //       }

  //       col++;
  //       row--;
  //     }      
  //     col = col0 + 1;
  //     row = startRow;
  //     for (let i=0; i<halfNTiles; i++) {
  //       if (col < 0 || row < 0 || col >= this.boardDim.x || row >= this.boardDim.y) {
  //         screenPos = boardToScreen(createVector(col, row), cameraPos);
  //         Tile.draw(mainCanvas, 0x6F, screenPos);
  //       } else {
  //         this.board[row][col].show(canvas, cameraPos);
  //         if (this.board[row][col].isBuilding()) {
  //           // draw building
  //           game.currentScene.base.buildings[this.board[row][col].buildingId].show(cameraPos)
  //         } else if (this.board[row][col].isUnit()) {
  //           // draw unit
  //           game.currentScene.base.units[this.board[row][col].unitId].show(cameraPos)
  //         }
  //       }
  //       col++;
  //       row--;
  //     }
  //     col0++;
  //     startRow++;
  //   }
  // }
}