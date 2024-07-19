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

class Tile {
  static idxToName = {};
  static nameToIdx = {};

  static initialize() {
    for (const [code, val] of Object.entries(tileCodes)) {
      Tile.idxToName[code] = val.imgName;
      Tile.nameToIdx[val.imgName] = code;
    }
  }
  
  static tileChanges = {
    "Rail_CDb": "Rail_BDc",
    "Rail_BDc": "Rail_BCd",
    "Rail_BCd": "Rail_CDb",
    "Rail_ABd": "Rail_ADb",
    "Rail_ADb": "Rail_BDa",
    "Rail_BDa": "Rail_ABd",
    "Rail_CDa": "Rail_ADc",
    "Rail_ADc": "Rail_ACd",
    "Rail_ACd": "Rail_CDa",
    "Rail_ACb": "Rail_BCa",
    "Rail_BCa": "Rail_ABc",
    "Rail_ABc": "Rail_ACb"
  };

  static orientationToExit = {
    "Rail_AB" :  {135: "A", 315: "B"},
    "Rail_ABc" : {135: "A", 315: "B"},
    "Rail_ABd" : {135: "A", 315: "B"},
    "Rail_AC" :  {45: "C", 225: "A"},
    "Rail_ACb" : {45: "C", 225: "A"},
    "Rail_ACd" : {45: "C", 225: "A"},
    "Rail_AD" :  {180: "A", 0: "D"},
    "Rail_ADb" : {180: "A", 0: "D"},
    "Rail_ADc" : {180: "A", 0: "D"},
    "Rail_BC" :  {90: "C", 270: "B"},
    "Rail_BCa" : {90: "C", 270: "B"},
    "Rail_BCd" : {90: "C", 270: "B"},
    "Rail_BD" :  {45: "D", 225: "B"},
    "Rail_BDa" : {45: "D", 225: "B"},
    "Rail_BDc" : {45: "D", 225: "B"},
    "Rail_CD" :  {135: "C", 315: "D"},
    "Rail_CDa" : {135: "C", 315: "D"},
    "Rail_CDb" : {135: "C", 315: "D"},
    
    "Bridge_A" : {180: "A", 0: "D"},
    "Bridge_D" : {180: "A", 0: "D"},
    "Bridge_AD" : {180: "A", 0: "D"},
    "Bridge_B" : {90: "C", 270: "B"},
    "Bridge_C" : {90: "C", 270: "B"},
    "Bridge_BC" : {90: "C", 270: "B"},
  }

  static entryToOrientation = {
    "Rail_AB" :  {"A": 315, "B": 135},
    "Rail_ABc" : {"A": 315, "B": 135},
    "Rail_ABd" : {"A": 315, "B": 135},
    "Rail_AC" :  {"C": 225, "A": 45},
    "Rail_ACb" : {"C": 225, "A": 45},
    "Rail_ACd" : {"C": 225, "A": 45},
    "Rail_AD" :  {"A": 0, "D": 180},
    "Rail_ADb" : {"A": 0, "D": 180},
    "Rail_ADc" : {"A": 0, "D": 180},
    "Rail_BC" :  {"B": 90, "C": 270},
    "Rail_BCa" : {"B": 90, "C": 270},
    "Rail_BCd" : {"B": 90, "C": 270},
    "Rail_BD" :  {"D": 225, "B": 45},
    "Rail_BDa" : {"D": 225, "B": 45},
    "Rail_BDc" : {"D": 225, "B": 45},
    "Rail_CD" :  {"C": 315, "D": 135},
    "Rail_CDa" : {"C": 315, "D": 135},
    "Rail_CDb" : {"C": 315, "D": 135},
    
    "Bridge_A" :  {"A": 0, "D": 180},
    "Bridge_D" :  {"A": 0, "D": 180},
    "Bridge_AD" : {"A": 0, "D": 180},
    "Bridge_B" :  {"B": 90, "C": 270},
    "Bridge_C" :  {"B": 90, "C": 270},
    "Bridge_BC" : {"B": 90, "C": 270},
  }

  static sideToDelta = {
    "A": [-1, 0],
    "B": [0, -1],
    "C": [0,  1],
    "D": [1,  0]
  }

  static oppositeSide = {
    "A": "D", 
    "B": "C", 
    "C": "B", 
    "D": "A"
  }

  static draw(canvas, tileId, screenPos) {
    screenPos.add(
      tileCodes[tileId].offset[0],
      tileCodes[tileId].offset[1]
    );
    canvas.image(
      tileCodes[tileId].img, 
      screenPos.x - TILE_WIDTH_HALF, 
      screenPos.y - TILE_HEIGHT_HALF);
  }

  static draw2D(canvas, tileId, screenPos) {
    canvas.rect(screenPos.x-10, screenPos.y-10, 20, 20);
  }

  static drawOutline(canvas, screenPos) {
    canvas.push();
    canvas.strokeWeight(2);
    canvas.stroke("blue");
    canvas.line(screenPos.x-TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y-TILE_HEIGHT_HALF);
    canvas.line(screenPos.x-TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y+TILE_HEIGHT_HALF);
    canvas.line(screenPos.x+TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y-TILE_HEIGHT_HALF);
    canvas.line(screenPos.x+TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y+TILE_HEIGHT_HALF);
    canvas.pop();
  }

  static drawGhostRail(canvas, tileId, screenPos) {
    canvas.push();
    canvas.strokeWeight(2);
    canvas.stroke("blue");
    switch(tileId) {
      case(0x30):  // AD
        canvas.line(screenPos.x-TILE_WIDTH_HALF*0.6,screenPos.y-TILE_HEIGHT_HALF*0.40,
                    screenPos.x+TILE_WIDTH_HALF*0.40,screenPos.y+TILE_HEIGHT_HALF*0.60);
        canvas.line(screenPos.x-TILE_WIDTH_HALF*0.40,screenPos.y-TILE_HEIGHT_HALF*0.60,
                    screenPos.x+TILE_WIDTH_HALF*0.60,screenPos.y+TILE_HEIGHT_HALF*0.40);
        
      break;

      case(0x31):  // BC
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.6,screenPos.y-TILE_HEIGHT_HALF*0.40,
                    screenPos.x-TILE_WIDTH_HALF*0.40,screenPos.y+TILE_HEIGHT_HALF*0.60);
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.40,screenPos.y-TILE_HEIGHT_HALF*0.60,
                    screenPos.x-TILE_WIDTH_HALF*0.60,screenPos.y+TILE_HEIGHT_HALF*0.40);
      break;

      case(0x32):   // AB
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.6,screenPos.y-TILE_HEIGHT_HALF*0.40,
                    screenPos.x-TILE_WIDTH_HALF*0.60,screenPos.y-TILE_HEIGHT_HALF*0.40);
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.40,screenPos.y-TILE_HEIGHT_HALF*0.60,
                    screenPos.x-TILE_WIDTH_HALF*0.40,screenPos.y-TILE_HEIGHT_HALF*0.60);
      break;
      case(0x33):   // CD
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.6,screenPos.y+TILE_HEIGHT_HALF*0.40,
                    screenPos.x-TILE_WIDTH_HALF*0.60,screenPos.y+TILE_HEIGHT_HALF*0.40);
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.40,screenPos.y+TILE_HEIGHT_HALF*0.60,
                    screenPos.x-TILE_WIDTH_HALF*0.40,screenPos.y+TILE_HEIGHT_HALF*0.60);
      break;
      case(0x34):   // AC
        canvas.line(screenPos.x-TILE_WIDTH_HALF*0.6,screenPos.y-TILE_HEIGHT_HALF*0.40,
                    screenPos.x-TILE_WIDTH_HALF*0.60,screenPos.y+TILE_HEIGHT_HALF*0.40);
        canvas.line(screenPos.x-TILE_WIDTH_HALF*0.40,screenPos.y-TILE_HEIGHT_HALF*0.60,
                    screenPos.x-TILE_WIDTH_HALF*0.40,screenPos.y+TILE_HEIGHT_HALF*0.60);
      break;
      case(0x35):   // BD
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.6,screenPos.y-TILE_HEIGHT_HALF*0.40,
                    screenPos.x+TILE_WIDTH_HALF*0.60,screenPos.y+TILE_HEIGHT_HALF*0.40);
        canvas.line(screenPos.x+TILE_WIDTH_HALF*0.40,screenPos.y-TILE_HEIGHT_HALF*0.60,
                    screenPos.x+TILE_WIDTH_HALF*0.40,screenPos.y+TILE_HEIGHT_HALF*0.60);
      break;

    }
    canvas.pop();
  }

  constructor(boardPosition, tileId) {
    this.tileId = null;
    this.tileName = null;
    this.offset = null;
    this.img = null;

    this.setTileId(tileId);

    this.boardPosition = boardPosition;
    this.isSelected = false;
    this.isRail = this.tileName.startsWith("Rail");
    this.isIntersection = this.tileName in Tile.tileChanges;
    
  }

  setTileId(tileId) {
    this.tileId = tileId;
    this.tileName = tileCodes[tileId].imgName;
    this.offset = tileCodes[tileId].offset;
    this.img = tileImgs[this.tileName].img;    
  }

  changeTile() {
    if (this.isIntersection) {
      let newTileName = Tile.tileChanges[this.tileName];
      let newTileId = Tile.nameToIdx[newTileName];
      this.setTileId(newTileId);
    }
  }

  show(canvas, cameraPos, auxText) {
    let screenPos = boardToScreen(this.boardPosition, cameraPos);    

    // Bridges need 
    if (this.tileId == 0x50) {
      Tile.draw(mainCanvas, 0x00, screenPos.copy());
    } else if (this.tileId == 0x51) {
      Tile.draw(mainCanvas, 0x02, screenPos.copy());
    } else if (this.tileId == 0x52) {
      Tile.draw(mainCanvas, 0x05, screenPos.copy());
    }
    else if (this.tileId == 0x53) {
      Tile.draw(mainCanvas, 0x00, screenPos.copy());
    } else if (this.tileId == 0x54) {
      Tile.draw(mainCanvas, 0x03, screenPos.copy());
    } else if (this.tileId == 0x55) {
      Tile.draw(mainCanvas, 0x04, screenPos.copy());
    }
    else if (this.tileId >= 0xA0 && this.tileId <= 0xAF) {
      Tile.draw(canvas, 0x01, screenPos);
    }
    
    if (this.tileId == 0xFE) {
      Tile.draw(canvas, 0x00, screenPos);
      let posStr = str(this.boardPosition.x) + "," + str(this.boardPosition.y) 
      if (posStr in industriesLocations) {
        
        canvas.image(industriesInfo[game.industries[industriesLocations[posStr]].name].imgNav,
          screenPos.x - industriesInfo[game.industries[industriesLocations[posStr]].name].offsetNav[0], 
          screenPos.y - industriesInfo[game.industries[industriesLocations[posStr]].name].offsetNav[1]);
        
        // Tile.draw(canvas, 0x02, screenPos);
      }
      return;
    }

    Tile.draw(canvas, this.tileId, screenPos);
    // canvas.text(this.boardPosition.array(), screenPos.x, screenPos.y); 
    canvas.text(auxText, screenPos.x, screenPos.y); 

    if (this.isSelected) {
      Tile.drawOutline(canvas, screenPos);
    }

  }
}