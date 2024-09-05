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


class TileBoard {
  constructor(mapData, tileHalfSize) {
    this.tileHalfSize = tileHalfSize;
    this.boardDim = createVector(mapData[0].length, mapData.length);
    this.board = Array.from(Array(this.boardDim.y), () => new Array(this.boardDim.x));
    
    // populate board
    for (let row=0; row<this.boardDim.y; row++) {
      for (let col=0; col<this.boardDim.x; col++) {  
        try {  
        this.board[row][col] = new Tile(createVector(col, row), mapData[row][col], this.tileHalfSize);        
        } catch {
          console.log(`Error initializing tile: ${row},${col},${mapData[row][col]}`);
        }
      }
    }
  }

  placeUnit(position, unit) {
    this.board[position.y][position.x].setUnitId(unit.id);
  }

  placeBuilding(position, building) {
    this.board[position.y][position.x].setBuildingId(building.id);
  }

  removeUnit(position) {
    this.board[position.y][position.x].setUnitId(null);
  }

  removeBuilding(position) {
    this.board[position.y][position.x].setBuildingId(null);
  }

  placeWall(position, tileId) {
    this.board[position.y][position.x].setTileId(tileId);
  }

  moveUnit(ori, dst) {
    this.board[dst.y][dst.x].setUnitId(this.board[ori.y][ori.x].unitId);
    this.board[ori.y][ori.x].setUnitId(null);
  }

  // A star path finding
  calculatePath(ori, dst) {
    this.astar = new AStar();
    let result = this.astar.search(ori, dst);
    return result;
    // console.log(result)
  }

  // Generates TileLocations inside the screen starting at the TopLeft (tL) tile
  // returns null when no more tiles are left 
  *TileGenerator(tL) {
    let topLeft = tL;
    let col0 = topLeft.x;
    let row0 = topLeft.y;
    let col, row;
    let nX = 28;
    let nY = 28;
  
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

  show(canvas, cameraPos, showOptions) {

    let topLeft;
    if (this.tileHalfSize.x > 60) {
      topLeft = Geometry.cameraToBoard(cameraPos, this.tileHalfSize).sub(createVector(15,0));
    } else {
      topLeft = Geometry.cameraToBoard(cameraPos, this.tileHalfSize).sub(createVector(27,0));
    }
    let generator = this.TileGenerator(topLeft);
    let tilePos, screenPos, tile;
    tilePos = generator.next();
    while(tilePos.value !== null) {
      // If the tilee is outside the board
      if (tilePos.value.x < 0 || tilePos.value.y < 0 || tilePos.value.x >= this.boardDim.x || tilePos.value.y >= this.boardDim.y) {
        if (showOptions.showTerrain) {
          screenPos = Geometry.boardToScreen(tilePos.value, cameraPos, this.tileHalfSize);
          Tile.draw(canvas, showOptions.outOfBoardTile, screenPos, this.tileHalfSize);
        }
      } 
      else {
        tile = this.board[tilePos.value.y][tilePos.value.x];        
        if (showOptions.showTerrain && tile.tileId != showOptions.baseTile) {
          tile.showTerrain(canvas, cameraPos);
        }
        if (showOptions.showBuildings && tile.isBuilding()) {
          tile.showBuilding(canvas, cameraPos);
        }
        if (showOptions.showUnits && tile.isUnit()) {
          tile.showUnit(canvas, cameraPos);
        }
        if (showOptions.showWalls && tile.isWall()) {
          tile.showWall(canvas, cameraPos);
        }    
        
      }      
      tilePos = createVector(tilePos.value.x+1, tilePos.value.y)
      if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= this.boardDim.x || tilePos.y >= this.boardDim.y) {
        if (showOptions.showTerrain) {
          screenPos = Geometry.boardToScreen(tilePos, cameraPos,  this.tileHalfSize);
          Tile.draw(canvas, showOptions.outOfBoardTile, screenPos, this.tileHalfSize);
        }
      } else {
        tile = this.board[tilePos.y][tilePos.x];        
        if (showOptions.showTerrain && tile.tileId != showOptions.baseTile) {
          tile.showTerrain(canvas, cameraPos);
        }
        if (showOptions.showBuildings && tile.isBuilding()) {
          tile.showBuilding(canvas, cameraPos);
        }
        if (showOptions.showUnits && tile.isUnit()) {
          tile.showUnit(canvas, cameraPos);
        }
        if (showOptions.showWalls && tile.isWall()) {
          tile.showWall(canvas, cameraPos);
        }       
      }
      tilePos = generator.next();
    }
  }

  showMinimap(canvas) {
    let minimapLoc = createVector(mainCanvasDim[0] - 99*2, mainCanvasDim[1] - 99*2)
    canvas.fill(20)

    canvas.rect(minimapLoc.x-99*2, minimapLoc.y, 99*4,99*2)
    for (let x=0; x<this.boardDim.x; x++) {
      for (let y=0; y<this.boardDim.y; y++) {
        this.board[y][x].showMinimap(canvas, minimapLoc)      
      }
    }
  }
}

// showUnits(canvas, cameraPos) {
//   let topLeft = cameraToBoard(cameraPos).sub(createVector(23,0));
//   let generator = this.TileGenerator(topLeft);
//   let tilePos, screenPos;
//   tilePos = generator.next();
//   while(tilePos.value !== null) {
//     if (tilePos.value.x < 0 || tilePos.value.y < 0 || tilePos.value.x >= this.boardDim.x || tilePos.value.y >= this.boardDim.y) {
//     } else {
//       if (this.board[tilePos.value.y][tilePos.value.x].isUnit()) {
//         game.currentScene.base.units[this.board[tilePos.value.y][tilePos.value.x].unitId].show(cameraPos)
//       } else if (this.board[tilePos.value.y][tilePos.value.x].isBuilding()) {
//         game.currentScene.base.buildings[this.board[tilePos.value.y][tilePos.value.x].buildingId].show(cameraPos)
//       }
//     }

//     tilePos = createVector(tilePos.value.x+1, tilePos.value.y);
//     if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= this.boardDim.x || tilePos.y >= this.boardDim.y) {
//     } else {
//       if (this.board[tilePos.y][tilePos.x].isUnit()) {
//         game.currentScene.base.units[this.board[tilePos.y][tilePos.x].unitId].show(cameraPos)
//       } else if (this.board[tilePos.y][tilePos.x].isBuilding()) {
//         game.currentScene.base.buildings[this.board[tilePos.y][tilePos.x].buildingId].show(cameraPos)
//       }
//     }

//     tilePos = generator.next();

//   }
// }

// showTiles2(canvas, cameraPos) {
//   let halfNTiles = int(screenDim[0] / (2*tileHalfSizes.Z1.x)) + 2;

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
//         screenPos = Geometry.boardToScreen(createVector(col, row), cameraPos)  
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
//         screenPos = Geometry.boardToScreen(createVector(col, row), cameraPos);
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

// showTiles(canvas, cameraPos) {
//   let topLeft = cameraToBoard(cameraPos).sub(createVector(25,0));
//   let generator = this.TileGenerator(topLeft);
//   let tilePos, screenPos;
//   tilePos = generator.next();
//   while(tilePos.value !== null) {
//     if (tilePos.value.x < 0 || tilePos.value.y < 0 || tilePos.value.x >= this.boardDim.x || tilePos.value.y >= this.boardDim.y) {
//       screenPos = Geometry.boardToScreen(tilePos.value, cameraPos);
//       Tile.draw(canvas, 0x6F, screenPos);
//     } else {
//       this.board[tilePos.value.y][tilePos.value.x].show(canvas, cameraPos);
//     }
    
//     tilePos = createVector(tilePos.value.x+1, tilePos.value.y)
//     if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= this.boardDim.x || tilePos.y >= this.boardDim.y) {
//       screenPos = Geometry.boardToScreen(tilePos, cameraPos);
//       Tile.draw(canvas, 0x6F, screenPos);
//     } else {
//       this.board[tilePos.y][tilePos.x].show(canvas, cameraPos);
//     }

//     tilePos = generator.next();
//   }
// }

// Discards ground tiles (0x6E) making rendering bases more efficient
// showTiles2(canvas, cameraPos) {
//   let topLeft = cameraToBoard(cameraPos).sub(createVector(25,0));
//   let generator = this.TileGenerator(topLeft);
//   let tilePos, screenPos;
//   tilePos = generator.next();
//   while(tilePos.value !== null) {
//     // If the tilee is outside the board
//     if (tilePos.value.x < 0 || tilePos.value.y < 0 || tilePos.value.x >= this.boardDim.x || tilePos.value.y >= this.boardDim.y) {
//       screenPos = Geometry.boardToScreen(tilePos.value, cameraPos);
//       Tile.draw(canvas, 0x6F, screenPos);
//     } else {
//       if (this.board[tilePos.value.y][tilePos.value.x].tileId != 0x6E) {
//         this.board[tilePos.value.y][tilePos.value.x].show(canvas, cameraPos);
//       }
//     }
    
//     tilePos = createVector(tilePos.value.x+1, tilePos.value.y)
//     if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= this.boardDim.x || tilePos.y >= this.boardDim.y) {
//       screenPos = Geometry.boardToScreen(tilePos, cameraPos);
//       Tile.draw(canvas, 0x6F, screenPos);
//     } else {
//       if (this.board[tilePos.y][tilePos.x].tileId != 0x6E) {
//         this.board[tilePos.y][tilePos.x].show(canvas, cameraPos);
//       }
//     }
//     tilePos = generator.next();
//   }
// }

// calculatePathOLD(ori, dst) {
//   let delta = p5.Vector.sub(dst, ori);
//   let firstPoint, secondPoint;
//   if (abs(delta.x) > abs(delta.y)) {
//     // first we move in the x direction, then diagonal, then in the x direction again
//     if (delta.x > 0) {
//       firstPoint = createVector(ori.x + (delta.x - abs(delta.y)) / 2, ori.y);
//       secondPoint = createVector(ori.x + (delta.x + abs(delta.y)) / 2, dst.y);
//     } else {
//       firstPoint = createVector(ori.x + (delta.x + abs(delta.y)) / 2, ori.y);
//       secondPoint = createVector(ori.x + (delta.x - abs(delta.y)) / 2, dst.y);
//     }
//   } else {
//     if (delta.y > 0) {
//       firstPoint = createVector(ori.x, ori.y + (delta.y - abs(delta.x)) / 2);
//       secondPoint = createVector(dst.x, ori.y + (delta.y + abs(delta.x)) / 2);
//     } else {
//       firstPoint = createVector(ori.x, ori.y + (delta.y + abs(delta.x)) / 2);
//       secondPoint = createVector(dst.x, ori.y + (delta.y - abs(delta.x)) / 2);
//     }
//   }
//   return [firstPoint, secondPoint, dst.copy()];
// }

// calculatePath2(ori, dst) {
//   let path = [];
//   let delta = p5.Vector.sub(dst, ori);
//   let deltaxy = abs(delta.x) - abs(delta.y);
//   let currentPos = ori.copy();

//   if (deltaxy >= 0) {  // deltaX is bigger than deltaY
//     let firstDeltaX = round(deltaxy/2);
//     let secondDeltaX = deltaxy - firstDeltaX;
//     for (let i=0; i<firstDeltaX; i++) {
//       currentPos.add(createVector(Math.sign(delta.x), 0));
//       path.push(currentPos.copy());
//     }
//     for (let i=0; i<abs(delta.y); i++) {
//       currentPos.add(createVector(Math.sign(delta.x), Math.sign(delta.y)));
//       path.push(currentPos.copy());
//     }
//     for (let i=0; i<secondDeltaX; i++) {
//       currentPos.add(createVector(Math.sign(delta.x), 0));
//       path.push(currentPos.copy());
//     }
//   } else {  // deltaY is bigger than deltaX
//     let firstDeltaY = round(abs(deltaxy/2));
//     let secondDeltaY = abs(deltaxy) - firstDeltaY;
//     for (let i=0; i<firstDeltaY; i++) {
//       currentPos.add(createVector(0, Math.sign(delta.y)));
//       path.push(currentPos.copy());
//     }
//     for (let i=0; i<abs(delta.x); i++) {
//       currentPos.add(createVector(Math.sign(delta.x), Math.sign(delta.y)));
//       path.push(currentPos.copy());
//     }
//     for (let i=0; i<secondDeltaY; i++) {
//       currentPos.add(createVector(0, Math.sign(delta.y)));
//       path.push(currentPos.copy());
//     }
//   }


//   // let path = [];
//   // let delta = p5.Vector.sub(dst, ori);
//   // let currentPos = ori.copy();
//   // for (let i=0;i<abs(delta.x);i++) {
//   //   currentPos.add(createVector(Math.sign(delta.x), 0));
//   //   path.push(currentPos.copy());
//   // }
//   // for (let i=0;i<abs(delta.y);i++) {
//   //   currentPos.add(createVector(0, Math.sign(delta.y)));
//   //   path.push(currentPos.copy());
//   // }

//   return path;
// }