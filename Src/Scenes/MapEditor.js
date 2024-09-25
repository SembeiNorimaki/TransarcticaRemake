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

class MapEditor {
  constructor() {
    this.camera = new Camera(boardToCameraSmall(createVector(78,361)));
    this.tileBoard = new TileBoard(gameData.mapBoard);
    this.posOri = null;

    this.buildSelection = "Fix";

    noLoop();

    
  }
  initialize() {

  }
  update() {

  }

  saveMap() {
    let boardDim = this.tileBoard.boardDim
    let board = [];
    let currentRow = [];

    for (let row=0; row<boardDim.y; row++) {
      currentRow = [];
      for (let col=0; col<boardDim.x; col++) {  
        if (this.tileBoard.board[row][col].isEvent) {
          currentRow.push((this.tileBoard.board[row][col].tileId + 0x100).toString(16).toUpperCase().padStart(3, '0'))
        } else {
          currentRow.push(this.tileBoard.board[row][col].tileId.toString(16).toUpperCase().padStart(3, '0'))
        }
      }
      
      board.push(currentRow);
    }
    storeItem("SavedMap", board)

    let str = []
    for (let row of this.tileBoard.board) {
      let str2 = [];
      for (let tile of row) {
        try {
          if (this.tileBoard.board[row][col].isEvent) {
            str2.push((tile.tileId + 0x100).toString(16).toUpperCase().padStart(3, '0'))
          } else {
            str2.push(tile.tileId.toString(16).toUpperCase().padStart(3, '0'))
          }
        } catch {} 
      }
      str.push(str2.join(","))
    }
    downloadText(str.join("\r\n"), "Tutorial.txt")
  }

  calculatePath(ori, end, oriScreen) {
    
    
    let angle = degrees(p5.Vector.sub(createVector(mouseX, mouseY), oriScreen).heading());
    if (angle < 0) 
      angle += 360;

    mainCanvas.text(angle, mouseX, mouseY-40)

    let n, deltaX, deltaY, x, y, currentTile;
    let aperture = 10;
    let tileId = null;
    let path = [];

    
    if (angle > 207-aperture && angle < 207+aperture) {   // direction A
      deltaX = -1;
      deltaY = 0;
      n = abs(end.x - ori.x);
      tileId = [0x30];
    }
    else if (angle > 27-aperture && angle < 27+aperture) {   // direction D
      deltaX = 1;
      deltaY = 0;
      n = abs(end.x - ori.x);
      tileId = [0x30];
    } 
    else if (angle >= 153-aperture && angle < 153+aperture) {   // direction C
      deltaX = 0;
      deltaY = 1;
      n = abs(end.y - ori.y);
      tileId = [0x31];
    }
    else if (angle >= 333-aperture && angle < 333+aperture) {   // direction B
      deltaX = 0;
      deltaY = -1;
      n = abs(end.y - ori.y);
      tileId = [0x31];
    }
    if (tileId !==null) {
      x = this.posOri.x;
      y = this.posOri.y;
      
      for (let i=0; i<n; i++) {
        path.push(createVector(x,y));
        Tile.drawGhostRail(mainCanvas, tileId[0], Geometry.boardToScreenSmall(createVector(x, y), this.camera.position));
        x+=deltaX;
        y+=deltaY;
      } 
      return [path, tileId];
    }

    currentTile = ori.copy();
    n = abs(end.y - ori.y) + abs(end.x - ori.x);
    if ((angle >= 90-aperture*4 && angle < 90)) {   // direction south
      tileId = [0x35,0x34];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x34, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x35, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }        
      }
    }
    else if ((angle >= 90 && angle < 90+aperture*4)) {   // direction south
      tileId = [0x34,0x35];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x35, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x34, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }        
      }
    }

    else if ((angle >= 270 && angle < 270 + aperture*4)) {   // direction north
      tileId = [0x35,0x34];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x34, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x35, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }        
      }
    }
    else if ((angle >= 270 - aperture*4 && angle < 270)) {   // direction north
      tileId = [0x34,0x35];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x35, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x34, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }        
      }
    }

    else if ((angle >= 180-aperture*2 && angle < 180)) {   // direction west
      tileId = [0x33,0x32];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x32, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x33, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }        
      }
    }
    else if ((angle >= 180 && angle < 180+aperture*2)) {   // direction west
      tileId = [0x32,0x33];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x33, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x32, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }        
      }
    }

    else if ((angle >= 360-aperture*2 && angle <= 360)) {   // direction east
      tileId = [0x32,0x33];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x33, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x32, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }        
      }
    }
    else if ((angle >= 0 && angle < 0+aperture*2)) {   // direction east
      tileId = [0x33,0x32];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x32, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x33, Geometry.boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }        
      }
    }
    
    return [path, tileId];
      
  }

  onClick(mousePos) {
    let tilePos = Geometry.screenToBoardSmall(createVector(mouseX, mouseY), this.camera.position);
    if (this.buildSelection == "City") {
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0xA0);
    } else if (this.buildSelection == "Industry") {
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0xA1);
    } else if (this.buildSelection == "Water") {
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0x00);
    } else if (this.buildSelection == "Ground") {
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0x01);
    } else if (this.buildSelection == "Forest") {
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0x5A);
    } else if (this.buildSelection == "Event") {
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(this.tileBoard.board[tilePos.y][tilePos.x].tileId | 0x100);
      let a=0;
    } else if (this.buildSelection == "Fix") {
      this.fixRail(tilePos)
    } else {
      if (this.posOri === null) {
        this.posOri = tilePos.copy();
      } else {
        this.posEnd = tilePos.copy();

        let oriScreen = Geometry.boardToScreenSmall(this.posOri, this.camera.position);
        let [path, tileId] = this.calculatePath(this.posOri, tilePos, oriScreen)
        
        for (let [i,pos] of path.entries()) {
          if (this.tileBoard.board[pos.y][pos.x].tileId == 0x01) {
            if (tileId.length == 1)
              this.tileBoard.board[pos.y][pos.x].setTileId(tileId[0]);
            else
              this.tileBoard.board[pos.y][pos.x].setTileId(tileId[i%tileId.length]);
          }
        }
        // this.posOri = path.at(-1);
        this.posOri = null;
        this.posEnd = null;

      }
    }
    console.log(`Clicked on Tile ${tilePos}`)
  }

  fixRail(tilePos) {
    console.log(tilePos.array());
    let t = this.tileBoard.board[tilePos.y][tilePos.x];
    let tA = this.tileBoard.board[tilePos.y][tilePos.x-1];
    let tB = this.tileBoard.board[tilePos.y-1][tilePos.x];
    let tC = this.tileBoard.board[tilePos.y+1][tilePos.x];
    let tD = this.tileBoard.board[tilePos.y][tilePos.x+1];

    if (tA.isRail && tB.isRail && tC.isRail) {
      t.setTileId(0x3C);
    } else if (tA.isRail && tB.isRail && tD.isRail) {
      t.setTileId(0x3A);
    } else if (tA.isRail && tC.isRail && tD.isRail) {
      t.setTileId(0x3B);
    } else if (tB.isRail && tC.isRail && tD.isRail) {
      t.setTileId(0x3D);
    }

  }

  processKey(key) {
    switch(key) {
      case("ArrowLeft"):
      this.camera.move(createVector(-500, 0));
      break;
      case("ArrowRight"):
      this.camera.move(createVector(500, 0));
      break;
      case("ArrowUp"):
      this.camera.move(createVector(0, -300));
      break;
      case("ArrowDown"):
      this.camera.move(createVector(0, 300));
      break;
      case("w"):
        this.buildSelection = "Water";
      break;
      case("g"):
        this.buildSelection = "Ground";
      break;
      case("c"):
        this.buildSelection = "City";
      break;
      case("i"):
        this.buildSelection = "Industry";
      break;
      case("r"):
        this.buildSelection = "Rail";
        this.posOri = null;
      break;
      case("f"):
        this.buildSelection = "Forest";
      break;
      case("x"):
        this.buildSelection = "Fix";
      break;
      case("e"):
        this.buildSelection = "Event";
      break;
      case("s"):
        this.saveMap();
      break;
    }
    draw();
  }

  mouseMoved() {
    draw();
  }

  showHud() {
    hudCanvas.image(Tile.tileCodes[0x30].img, tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x31].img, 3*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x32].img, 5*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x33].img, 7*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x34].img, 9*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x35].img, 11*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);

    hudCanvas.image(Tile.tileCodes[0x3A].img, 13*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x3B].img, 15*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x3C].img, 17*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
    hudCanvas.image(Tile.tileCodes[0x3D].img, 19*tileHalfSizes.Z1.x, tileHalfSizes.Z1.y);
  }

  show() {
    this.tileBoard.draw3D(mainCanvas, this.camera.position); 
    
    let tilePos = Geometry.screenToBoardSmall(createVector(mouseX, mouseY), this.camera.position);

    if (this.buildSelection == "Rail") {
      if (this.posOri !== null) {
        let oriScreen = Geometry.boardToScreenSmall(this.posOri, this.camera.position);
        this.calculatePath(this.posOri, tilePos, oriScreen)
      }
    }
    else if (this.buildSelection == "City") {
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(tilePos, this.camera.position))
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-1,0)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-2,0)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(0,-1)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-1,-1)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-2,-1)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(0,-2)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-1,-2)), this.camera.position));
      Tile.draw2DColor(mainCanvas, "red", Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-2,-2)), this.camera.position));
    } else if (this.buildSelection == "Industry") {
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(tilePos, this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-1,0)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-2,0)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(0,-1)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-1,-1)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-2,-1)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(0,-2)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-1,-2)), this.camera.position));
      Tile.draw2DColor(mainCanvas, color(200, 200, 100), Geometry.boardToScreenSmall(p5.Vector.add(tilePos, createVector(-2,-2)), this.camera.position));
    } else if (this.buildSelection == "Ground") {
      Tile.draw2DColor(mainCanvas, "gray", Geometry.boardToScreenSmall(tilePos, this.camera.position));
    } else if (this.buildSelection == "Fix") {
      Tile.draw2DColor(mainCanvas, "black", Geometry.boardToScreenSmall(tilePos, this.camera.position));
    } else if (this.buildSelection == "Water") {
      Tile.draw2DColor(mainCanvas, "blue", Geometry.boardToScreenSmall(tilePos, this.camera.position));
    } else if (this.buildSelection == "Forest") {
      Tile.draw2DColor(mainCanvas, "green", Geometry.boardToScreenSmall(tilePos, this.camera.position));
    } else if (this.buildSelection == "Event") {
      Tile.draw2DColor(mainCanvas, color(100,100,200), Geometry.boardToScreenSmall(tilePos, this.camera.position));
    }
  }
}