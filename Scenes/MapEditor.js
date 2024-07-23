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
    this.camera = new Camera(boardToCameraSmall(createVector(30,150)));
    this.tileBoard = new TileBoard(mapBoard);
    this.posOri = null;

    this.buildSelection = "City";

    
  }
  initialize() {

  }
  update() {

  }

  downloadMap() {
    let boardDim = this.tileBoard.boardDim
    let board = [];
    let currentRow = "";

    for (let row=0; row<boardDim.y; row++) {
      currentRow = "";
      for (let col=0; col<boardDim.x; col++) {  
        currentRow += str(this.tileBoard.board[row][col].tileId.toString(16).toUpperCase().padStart(2, '0')) + ","
      }
      currentRow = currentRow.slice(0, -1);
      board.push(currentRow + "\n");
    }
    downloadText(board)
  }

  calculatePath(ori, end, oriScreen) {
    
    // let angle = degrees(p5.Vector.sub(end, ori).heading());
    let angle = degrees(p5.Vector.sub(createVector(mouseX, mouseY), oriScreen).heading());
    if (angle < 0) 
      angle += 360;

    //mainCanvas.text(angle, mouseX, mouseY-40)

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
        Tile.drawGhostRail(mainCanvas, tileId[0], boardToScreenSmall(createVector(x, y), this.camera.position));
        x+=deltaX;
        y+=deltaY;
      } 
      return [path, tileId];
    }



    currentTile = ori.copy();
    n = abs(end.y - ori.y) + abs(end.x - ori.x);
    if ((angle >= 90-aperture && angle < 90)) {   // direction south
      tileId = [0x35,0x34];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x34, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x35, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }        
      }
    }
    else if ((angle >= 90 && angle < 90+aperture)) {   // direction south
      tileId = [0x34,0x35];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x35, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x34, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }        
      }
    }

    else if ((angle >= 270 && angle < 270 + aperture)) {   // direction north
      tileId = [0x35,0x34];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x34, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x35, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }        
      }
    }
    else if ((angle >= 270 - aperture && angle < 270)) {   // direction north
      tileId = [0x34,0x35];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x35, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x34, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }        
      }
    }

    else if ((angle >= 180-aperture && angle < 180)) {   // direction west
      tileId = [0x33,0x32];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x32, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x33, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }        
      }
    }
    else if ((angle >= 180 && angle < 180+aperture)) {   // direction west
      tileId = [0x32,0x33];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x33, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, 1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x32, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(-1, 0))
        }        
      }
    }

    else if ((angle >= 360-aperture && angle <= 360)) {   // direction east
      tileId = [0x32,0x33];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x33, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x32, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }        
      }
    }
    else if ((angle >= 0 && angle < 0+aperture)) {   // direction east
      tileId = [0x33,0x32];
      for (let i=0; i<n; i++) {
        path.push(currentTile.copy());
        if (i%2) {
          Tile.drawGhostRail(mainCanvas, 0x32, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(0, -1))
        }
        else {
          Tile.drawGhostRail(mainCanvas, 0x33, boardToScreenSmall(currentTile, this.camera.position));
          currentTile.add(createVector(1, 0))
        }        
      }
    }
    
    return [path, tileId];
      
  }

  onClick(mousePos) {
    let tilePos = screenToBoardSmall(createVector(mouseX, mouseY), this.camera.position);
    if (this.buildSelection == "City") {
      console.log(`Setting tile ${tilePos.x}${tilePos.y} to city`)
      this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0xA0);
      let a=0;
    }
    else {
      if (this.posOri === null) {
        this.posOri = tilePos.copy();
      } else {
        this.posEnd = tilePos.copy();

        let oriScreen = boardToScreenSmall(this.posOri, this.camera.position);
        let [path, tileId] = this.calculatePath(this.posOri, tilePos, oriScreen)
        
        for (let [i,pos] of path.entries()) {
          if (this.tileBoard.board[pos.y][pos.x].tileId == 0x01) {
            if (tileId.length == 1)
              this.tileBoard.board[pos.y][pos.x].setTileId(tileId[0]);
            else
              this.tileBoard.board[pos.y][pos.x].setTileId(tileId[i%tileId.length]);
          }
        }
        this.posOri = path.at(-1);
        this.posEnd = null;

      }
    }
    console.log(`Clicked on Tile ${tilePos}`)
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
      case("d"):
        this.downloadMap()
      break;
      case("c"):
        this.buildSelection = "City";
      break;
      case("r"):
        this.buildSelection = "Rail";
        this.posOri = null;
      break;
    }

  }

  showHud() {
    hudCanvas.image(tileCodes[0x30].img, TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x31].img, 3*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x32].img, 5*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x33].img, 7*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x34].img, 9*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x35].img, 11*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);

    hudCanvas.image(tileCodes[0x3A].img, 13*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x3B].img, 15*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x3C].img, 17*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
    hudCanvas.image(tileCodes[0x3D].img, 19*TILE_WIDTH_HALF, TILE_HEIGHT_HALF);
  }

  show() {
    this.tileBoard.show2D(mainCanvas, this.camera.position); 
    
    let tilePos = screenToBoardSmall(createVector(mouseX, mouseY), this.camera.position);

    if (this.buildSelection == "Rail") {
      if (this.posOri !== null) {
        let oriScreen = boardToScreenSmall(this.posOri, this.camera.position);
        this.calculatePath(this.posOri, tilePos, oriScreen)
      }
    }
    else if (this.buildSelection == "City") {
      Tile.draw2DColor(mainCanvas, "red", boardToScreenSmall(tilePos, this.camera.position))
    }

    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.pop();



  }
}