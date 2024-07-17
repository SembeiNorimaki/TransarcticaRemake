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
    this.camera = new Camera(boardToCamera(createVector(0,0)));
    this.tileBoard = new TileBoard(mapBoard);
    this.posOri = null;

    console.log(screenToBoard(createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.camera.position).array());
    console.log(screenToBoard(createVector(mainCanvasDim[0]/2+TILE_WIDTH_HALF+2, mainCanvasDim[1]/2), this.camera.position).array());
    console.log(screenToBoard(createVector(mainCanvasDim[0]/2-TILE_WIDTH_HALF-2, mainCanvasDim[1]/2), this.camera.position).array());
    console.log(screenToBoard(createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2-TILE_HEIGHT_HALF-2), this.camera.position).array());
    console.log(screenToBoard(createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2+TILE_HEIGHT_HALF+2), this.camera.position).array());

  }
  initialize() {

  }
  update() {

  }

  calculatePath(ori, end) {
    let angle = degrees(p5.Vector.sub(end, ori).heading());
    let n, deltaX, deltaY, x, y;
    let aperture = 20;
    let tileId = null;
    let path = [];

    if (angle < 0) 
      angle += 360;

    if (angle > 180-aperture && angle < 180+aperture) {   // direction A
      deltaX = -1;
      deltaY = 0;
      n = abs(end.x - ori.x);
      tileId = 0x30;
    }
    else if ((angle >= 0 && angle < aperture) || (angle >= 360-aperture && angle < 360)) {   // direction D
      deltaX = 1;
      deltaY = 0;
      n = abs(end.x - ori.x);
      tileId = 0x30;
    } 
    else if (angle >= 90-aperture && angle < 90+aperture) {   // direction C
      deltaX = 0;
      deltaY = 1;
      n = abs(end.y - ori.y);
      tileId = 0x31;
    }
    else if (angle >= 270-aperture && angle < 270+aperture) {   // direction B
      deltaX = 0;
      deltaY = -1;
      n = abs(end.y - ori.y);
      tileId = 0x31;
    }
    if (tileId !==null) {
      x = this.posOri.x;
      y = this.posOri.y;
      
      for (let i=0; i<n; i++) {
        path.push(createVector(x,y))
        Tile.drawGhostRail(mainCanvas, tileId, boardToScreen(createVector(x, y), this.camera.position))
        x+=deltaX;
        y+=deltaY;
      } 
      return [path, tileId];
    }

    


    if ((angle >= 45-aperture && angle < 45)) {   // direction south
      deltaX = 1;
      deltaY = 1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x35;

      x = this.posOri.x;
      y = this.posOri.y;
      let path = [];
      for (let i=0; i<n; i++) {
        path.push(createVector(x,y))
        Tile.drawGhostRail(mainCanvas, 0x35, boardToScreen(createVector(x, y), this.camera.position))
        Tile.drawGhostRail(mainCanvas, 0x34, boardToScreen(createVector(x+1, y), this.camera.position))
        x+=deltaX;
        y+=deltaY;
      } 
    }
    else if ((angle >= 45 && angle < 45+aperture)) {   // direction south
      deltaX = 1;
      deltaY = 1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x34;

      x = this.posOri.x;
      y = this.posOri.y;
      let path = [];
      for (let i=0; i<n; i++) {
        path.push(createVector(x,y))
        Tile.drawGhostRail(mainCanvas, 0x34, boardToScreen(createVector(x, y), this.camera.position))
        Tile.drawGhostRail(mainCanvas, 0x35, boardToScreen(createVector(x, y+1), this.camera.position))
        x+=deltaX;
        y+=deltaY;
      } 
    }

    else if ((angle >= 225-aperture && angle < 225)) {   // direction north
      deltaX = -1;
      deltaY = -1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x34;

      x = this.posOri.x;
      y = this.posOri.y;
      let path = [];
      for (let i=0; i<n; i++) {
        path.push(createVector(x,y))
        Tile.drawGhostRail(mainCanvas, 0x34, boardToScreen(createVector(x, y), this.camera.position))
        Tile.drawGhostRail(mainCanvas, 0x35, boardToScreen(createVector(x-1, y), this.camera.position))
        x+=deltaX;
        y+=deltaY;
      } 
    }
    else if ((angle >= 225 && angle < 225+aperture)) {   // direction north
      deltaX = -1;
      deltaY = -1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x35;
      
      x = this.posOri.x;
      y = this.posOri.y;
      let path = [];
      for (let i=0; i<n; i++) {
        path.push(createVector(x,y))
        Tile.drawGhostRail(mainCanvas, 0x35, boardToScreen(createVector(x, y), this.camera.position))
        Tile.drawGhostRail(mainCanvas, 0x34, boardToScreen(createVector(x, y-1), this.camera.position))
        x+=deltaX;
        y+=deltaY;
      } 
    }

    else if ((angle >= 135-aperture && angle < 135)) {   // direction west
      deltaX = -1;
      deltaY = 1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x33;
    }
    else if ((angle >= 135 && angle < 135+aperture)) {   // direction west
      deltaX = -1;
      deltaY = 1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x32;
    }

    else if ((angle >= 315-aperture && angle < 315)) {   // direction east
      deltaX = 1;
      deltaY = -1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x32;
    }
    else if ((angle >= 315 && angle < 315+aperture)) {   // direction east
      deltaX = 1;
      deltaY = -1;
      n = abs(end.y - ori.y);
      console.log(n)
      tileId = 0x33;
    }

    
    return [path, tileId];

    
      
  }

  onClick(mousePos) {
    let tilePos = screenToBoard(createVector(mouseX, mouseY+32), this.camera.position);
    if (this.posOri === null) {
      this.posOri = tilePos.copy();
    } else {
      this.posEnd = tilePos.copy();

      let [path, tileId] = this.calculatePath(this.posOri, this.posEnd);
      console.log(path)
      console.log(tileId)
      for (let pos of path) {
        this.tileBoard.board[pos.y][pos.x].setTileId(tileId);
      }
      this.posOri = this.posEnd.copy();
      this.posEnd = null;

    }
    // try {
    // this.tileBoard.board[tilePos.y][tilePos.x].setTileId(0x30);
    // }catch{}
    console.log(`Clicked on Tile ${tilePos}`)
  }
  processKey() {}

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
    this.showHud();
    this.tileBoard.showTiles(mainCanvas, this.camera.position); 
    let tilePos = screenToBoard(createVector(mouseX, mouseY), this.camera.position);
    let screenPos = boardToScreen(tilePos, this.camera.position)
    Tile.drawOutline(mainCanvas, screenPos, this.camera.position);
    
    // determine which tile the mouse is hovering

    if (this.posOri !== null) {
      //console.log(this.posOri)
      Tile.drawOutline(mainCanvas, boardToScreen(this.posOri, this.camera.position));
      
      this.calculatePath(this.posOri, tilePos)
      
    }

    mainCanvas.push();
    mainCanvas.stroke("red")
    mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    mainCanvas.pop();
  }
}