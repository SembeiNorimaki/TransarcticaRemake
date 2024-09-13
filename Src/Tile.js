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
  static tileCodes = {};

  static initialize() {
    for (const [code, val] of Object.entries(tileCodes)) {
      Tile.tileCodes[code] = {
        "imgName": val.imgName,
        "offset": val.offset,
        "img": tileImgs[val.imgName]
      }
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

  static tileToInitialPositionOffset(tileName) {
    let a = {
      "Rail_AB" :  createVector(-1/4, -1/4),
      "Rail_ABc" : createVector(-1/4, -1/4),
      "Rail_ABd" : createVector(-1/4, -1/4),
      "Rail_AC" :  createVector(-1/4, 1/4),
      "Rail_ACb" : createVector(-1/4, 1/4),
      "Rail_ACd" : createVector(-1/4, 1/4),
      "Rail_AD" :  createVector(0, 0),
      "Rail_ADb" : createVector(0, 0),
      "Rail_ADc" : createVector(0, 0),
      "Rail_BC" :  createVector(0, 0),
      "Rail_BCa" : createVector(0, 0),
      "Rail_BCd" : createVector(0, 0),
      "Rail_BD" :  createVector(1/4, -1/4),
      "Rail_BDa" : createVector(1/4, -1/4),
      "Rail_BDc" : createVector(1/4, -1/4),
      "Rail_CD" :  createVector(1/4, 1/4),
      "Rail_CDa" : createVector(1/4, 1/4),
      "Rail_CDb" : createVector(1/4, 1/4),
    };
    return a[tileName];
  }

  static draw(canvas, tileId, screenPos, tileHalfSize) {
    screenPos.add(
      Tile.tileCodes[tileId].offset[0],
      Tile.tileCodes[tileId].offset[1]
    );
    canvas.image(
      Tile.tileCodes[tileId].img, 
      screenPos.x - tileHalfSize.x, 
      screenPos.y - tileHalfSize.y);
  }

  static draw2D(canvas, tileId, screenPos) {
    canvas.noStroke();
    let tileName = Tile.idxToName[tileId] 
    if (tileName.startsWith("Rail")) {
      canvas.fill("black")
    } else if (tileName == "Ground") {
      canvas.fill("gray")
    } else if (tileName == "Village") {
      canvas.fill("red")
    } else {      
      canvas.fill("blue");
    }
    canvas.rect(screenPos.x, screenPos.y, 2, 2);
  }

  static draw2DOLD(canvas, tileId, screenPos) {
    // canvas.rect(screenPos.x, screenPos.y, 10, 10);
    switch(Tile.idxToName[tileId]) {
      case("Rail_AD"):
      canvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y);
      break;
      case("Rail_BC"):
      canvas.line(
          screenPos.x,
          screenPos.y-TILE_MINI_WIDTH/2,
          screenPos.x,
          screenPos.y+TILE_MINI_WIDTH/2);
      break;
      case("Rail_AB"):
      canvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y,
          screenPos.x,
          screenPos.y-TILE_MINI_WIDTH/2);
      break;
      case("Rail_AC"):
      canvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y,
          screenPos.x,
          screenPos.y+TILE_MINI_WIDTH/2);
      break;
      case("Rail_BD"):
      canvas.line(
          screenPos.x,
          screenPos.y-TILE_MINI_WIDTH/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y);
      break;
      case("Rail_CD"):
      canvas.line(
          screenPos.x,
          screenPos.y+TILE_MINI_WIDTH/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y);
      break;

      case("Rail_ABc"):
      case("Rail_ACb"):
      case("Rail_BCa"):
      
      break;
      case("Rail_ABd"):
      case("Rail_ADb"):
      case("Rail_BDa"):
       
      break;
      case("Rail_ACd"):
      case("Rail_ADc"):
      case("Rail_CDa"):
        
      break;
      case("Rail_BCd"):
      case("Rail_BDc"):
      case("Rail_CDb"):
        
      break;
      case("Water"): // Water
        mainCanvas.push();
        // mainCanvas.noStroke();
        mainCanvas.fill("blue");
        mainCanvas.rect(screenPos.x-TILE_MINI_WIDTH/2,screenPos.y-TILE_MINI_WIDTH/2,TILE_MINI_WIDTH, TILE_MINI_WIDTH);
        mainCanvas.pop();
      break;
      case("Ground"): // Water
        mainCanvas.push();
        // mainCanvas.noStroke();
        mainCanvas.fill("gray");
        mainCanvas.rect(screenPos.x-TILE_MINI_WIDTH/2,screenPos.y-TILE_MINI_WIDTH/2,TILE_MINI_WIDTH, TILE_MINI_WIDTH);
        mainCanvas.pop();
      break;
      case("Building_1"):
        // mainCanvas.push();
        // mainCanvas.noStroke();
        // mainCanvas.fill("red");
        // mainCanvas.beginShape();
        // mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        // mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        // mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        // mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        // mainCanvas.endShape(CLOSE);
        // mainCanvas.pop();
      break;
      default:
        // mainCanvas.push();
        // mainCanvas.noStroke();
        // mainCanvas.fill("black");
        // mainCanvas.beginShape();
        // mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        // mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        // mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        // mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        // mainCanvas.endShape(CLOSE);
        // mainCanvas.pop();
      break;
    }
  }

  static draw3D(canvas, tileId, screenPos, isEvent) {
    let boardPos;
    mainCanvas.push();
    // mainCanvas.noStroke();
    // mainCanvas.stroke(0)
    switch(Tile.idxToName[tileId]) {
      case("Ground"):      
      // mainCanvas.fill("gray");
      // mainCanvas.beginShape();
      // mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
      // mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
      // mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
      // mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
      // mainCanvas.endShape(CLOSE);
      break;
      case("Rail_AD"):
        mainCanvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_BC"):
        mainCanvas.line(
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_AB"):
        mainCanvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2);
      break;
      case("Rail_AC"):
        mainCanvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_BD"):
        mainCanvas.line(
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_CD"):
        mainCanvas.line(
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;

      case("Rail_ABc"):
      case("Rail_ACb"):
      case("Rail_BCa"):
        mainCanvas.line(  //AB
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2);
        mainCanvas.line( //AC
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
        mainCanvas.line( //BC
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_ABd"):
      case("Rail_ADb"):
      case("Rail_BDa"):
        mainCanvas.line(  //AB
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2);
        mainCanvas.line( //AD
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
        mainCanvas.line( //BD
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_ACd"):
      case("Rail_ADc"):
      case("Rail_CDa"):
        mainCanvas.line( //AC
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
        mainCanvas.line( //AD
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
        mainCanvas.line( //CD
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
      break;
      case("Rail_BCd"):
      case("Rail_BDc"):
      case("Rail_CDb"):
        mainCanvas.line( //BC
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
        mainCanvas.line( //BD
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y-TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2);
        mainCanvas.line( //CD
          screenPos.x-TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2,
          screenPos.x+TILE_MINI_WIDTH/2,
          screenPos.y+TILE_MINI_HEIGHT/2); 
      break;

      case("Water"): // Water
        mainCanvas.noStroke();
        mainCanvas.fill("blue");
        mainCanvas.beginShape();
        mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        mainCanvas.endShape(CLOSE);
      break;
      case("Building_1"):
        mainCanvas.noStroke();
        mainCanvas.fill("red");
        mainCanvas.beginShape();
        mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        mainCanvas.endShape(CLOSE);
      break;
      case("Building_2"):
        mainCanvas.noStroke();
        mainCanvas.fill(200,200,100);
        mainCanvas.beginShape();
        mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        mainCanvas.endShape(CLOSE);
      break;
      case("Forest"):
        mainCanvas.noStroke();
        mainCanvas.fill("green");
        mainCanvas.beginShape();
        mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        mainCanvas.endShape(CLOSE);
      break;
      default:
        mainCanvas.noStroke();
        mainCanvas.fill("black");
        mainCanvas.beginShape();
        mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
        mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
        mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
        mainCanvas.endShape(CLOSE);
      break;
    }
    

    if (isEvent) {
      
      mainCanvas.noStroke();
      mainCanvas.fill(100,100,0,200);
      mainCanvas.beginShape();
      mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
      mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
      mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
      mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
      mainCanvas.endShape(CLOSE);
      mainCanvas.fill(255);
      mainCanvas.stroke(0);
      let boardPos = Geometry.screenToBoardSmall(screenPos, game.currentScene.camera.position, tileHalfSizes.Z1);
      mainCanvas.text(`${boardPos.x},${boardPos.y}`,screenPos.x, screenPos.y-20)
    }
    
    mainCanvas.pop();
  }

  static draw2DColor(canvas, color, screenPos) {
    mainCanvas.push();
      canvas.noStroke();
      canvas.fill(color);
      canvas.beginShape();
      canvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
      canvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
      canvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
      canvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
      canvas.endShape(CLOSE);
      canvas.pop();
  }

  static drawOutline(canvas, screenPos) {
    canvas.push();
    canvas.strokeWeight(2);
    canvas.stroke("blue");
    canvas.line(screenPos.x-tileHalfSizes.Z1.x,screenPos.y,screenPos.x,screenPos.y-tileHalfSizes.Z1.y);
    canvas.line(screenPos.x-tileHalfSizes.Z1.x,screenPos.y,screenPos.x,screenPos.y+tileHalfSizes.Z1.y);
    canvas.line(screenPos.x+tileHalfSizes.Z1.x,screenPos.y,screenPos.x,screenPos.y-tileHalfSizes.Z1.y);
    canvas.line(screenPos.x+tileHalfSizes.Z1.x,screenPos.y,screenPos.x,screenPos.y+tileHalfSizes.Z1.y);
    canvas.pop();
  }

  static drawGhostRail(canvas, tileId, screenPos) {
    canvas.push();
    canvas.strokeWeight(2);
    canvas.stroke("blue");
    switch(tileId) {
      case(0x30):  // AD
        canvas.line(screenPos.x-TILE_MINI_WIDTH*0.5,screenPos.y -TILE_MINI_HEIGHT*0.50,
                    screenPos.x+TILE_MINI_WIDTH*0.50,screenPos.y+TILE_MINI_HEIGHT*0.50);
      break;

      case(0x31):  // BC
        canvas.line(screenPos.x+TILE_MINI_WIDTH*0.5,screenPos.y -TILE_MINI_HEIGHT*0.50,
                    screenPos.x-TILE_MINI_WIDTH*0.50,screenPos.y+TILE_MINI_HEIGHT*0.50);
      break;

      case(0x32):   // AB
        canvas.line(screenPos.x+TILE_MINI_WIDTH*0.5,screenPos.y -TILE_MINI_HEIGHT*0.50,
                    screenPos.x-TILE_MINI_WIDTH*0.50,screenPos.y-TILE_MINI_HEIGHT*0.50);
      break;
      case(0x33):   // CD
        canvas.line(screenPos.x+TILE_MINI_WIDTH*0.5,screenPos.y +TILE_MINI_HEIGHT*0.50,
                    screenPos.x-TILE_MINI_WIDTH*0.50,screenPos.y+TILE_MINI_HEIGHT*0.50);
      break;
      case(0x34):   // AC
        canvas.line(screenPos.x-TILE_MINI_WIDTH*0.5,screenPos.y -TILE_MINI_HEIGHT*0.50,
                    screenPos.x-TILE_MINI_WIDTH*0.50,screenPos.y+TILE_MINI_HEIGHT*0.50);        
      break;
      case(0x35):   // BD
        canvas.line(screenPos.x+TILE_MINI_WIDTH*0.5,screenPos.y -TILE_MINI_HEIGHT*0.50,
                    screenPos.x+TILE_MINI_WIDTH*0.50,screenPos.y+TILE_MINI_HEIGHT*0.50);
      break;

    }
    canvas.pop();
  }

  constructor(boardPosition, tileId, tileHalfSize) {
    this.tileHalfSize = tileHalfSize;
    this.tileId = null;
    this.tileName = null;
    this.offset = null;
    this.img = null;
    this.isEvent = false;
    this.unitId = null;
    this.buildingId = null;
    this.buildingTypeId = null;
    this.isOccupied = false;

    this.setTileId(tileId);

    this.boardPosition = boardPosition;
    this.isSelected = false;
    this.isRail = this.tileName.startsWith("Rail");
    this.isIntersection = this.tileName in Tile.tileChanges;
    
    
  }

  setTileId(tileId) {
    let id = tileId & 0xFF;
    this.isEvent = Boolean(tileId & 0x100);
    this.tileId = id;
    
    this.tileName = Tile.tileCodes[id].imgName;
    this.offset = Tile.tileCodes[id].offset;
    this.img = tileImgs[this.tileName].img;    
    this.isIntersection = this.tileName in Tile.tileChanges;
  }

  setUnitId(id) {
    this.unitId = id;
  }

  setBuildingId(id) {
    this.buildingId = id;
  }

  setBuildingTypeId(id) {
    this.buildingTypeId = id;
  }

  isUnit() {
    return this.unitId !== null;
  }

  isBuilding() {
    return this.buildingId !== null;
  }

  isRoad() {
    return false;
  }

  isWall() {
    return this.tileId >= 0x60 && this.tileId <= 0x69;
  }
  
  changeTile() {
    if (this.isIntersection) {
      let newTileName = Tile.tileChanges[this.tileName];
      let newTileId = Tile.nameToIdx[newTileName];
      this.setTileId(newTileId);
    }
  }

  removeTile() {
    this.buildingId = null;
    this.unitId = null;
    this.setTileId(0x01);
  }

  show(canvas, cameraPos) {
    let screenPos = Geometry.boardToScreen(this.boardPosition, cameraPos, this.tileHalfSize);    

    // Bridges  
    if (this.tileId == 0x50) {
      Tile.draw(mainCanvas, 0x00, screenPos.copy());
    } else if (this.tileId == 0x51) {
      Tile.draw(mainCanvas, 0x02, screenPos.copy());
    } else if (this.tileId == 0x52) {
      Tile.draw(mainCanvas, 0x05, screenPos.copy());
    } else if (this.tileId == 0x53) {
      Tile.draw(mainCanvas, 0x00, screenPos.copy());
    } else if (this.tileId == 0x54) {
      Tile.draw(mainCanvas, 0x03, screenPos.copy());
    } else if (this.tileId == 0x55) {
      Tile.draw(mainCanvas, 0x04, screenPos.copy());
    }

    // Houses need ground below them
    else if (this.tileId >= 0xA0 && this.tileId <= 0xAF || this.tileId == 0x5A || this.tileId == 0x5B || this.tileId >= 0x4C && this.tileId <= 0x4F) {
      Tile.draw(canvas, 0x01, screenPos);
    }
    
    // ?? what is FE?
    // if (this.tileId == 0xFE) {
    //   Tile.draw(canvas, 0x00, screenPos);
    //   let posStr = str(this.boardPosition.x) + "," + str(this.boardPosition.y) 
    //   if (posStr in industriesLocations) {
        
    //     canvas.image(game.industries[industriesLocations[posStr]].imgNav,
    //       screenPos.x - game.industries[industriesLocations[posStr]].offsetNav[0], 
    //       screenPos.y - game.industries[industriesLocations[posStr]].offsetNav[1]);
        
    //   }
    //   return;
    // }

    Tile.draw(canvas, this.tileId, screenPos.copy());
    canvas.fill(0)
    canvas.text(this.boardPosition.array(), screenPos.x, screenPos.y); 
    // canvas.text(auxText, screenPos.x, screenPos.y); 
    canvas.push();

    if (this.tileId == 0xA0) {  // if it's a City show the name
      canvas.fill(255,255,255,200);
      canvas.noStroke();
      canvas.rect(screenPos.x-tileHalfSizes.Z1.x, screenPos.y-122, 2*tileHalfSizes.Z1.x,30)
      canvas.textAlign(CENTER)
      canvas.textSize(22)
      canvas.fill(0)
      
      // canvas.text("Granada", screenPos.x+tileHalfSizes.Z1.x*2, screenPos.y+18);
      let tilePos = Geometry.screenToBoard(screenPos, game.navigationScene.camera.position, tileHalfSizes.Z1);
      tilePos.add(createVector(-1,0));
      let tileString = String(tilePos.x) + "," + String(tilePos.y);
      if (tileString in citiesLocations) {
        canvas.text(citiesLocations[tileString], screenPos.x, screenPos.y-100);
      } else {
        canvas.text(tilePos.array(), screenPos.x, screenPos.y-100);
      }
    }
    if (this.isSelected) {
      Tile.drawOutline(canvas, screenPos);
    }
    canvas.pop();
  }

  showTerrain(canvas, cameraPos) {
    let screenPos = Geometry.boardToScreen(this.boardPosition, cameraPos, this.tileHalfSize);    
    
    if (this.tileId >= 0xA0) {  // Village needs ground to be drawn
      Tile.draw(canvas, 0x01, screenPos, this.tileHalfSize)
    }
    
    Tile.draw(canvas, this.tileId, screenPos, this.tileHalfSize)
    
    // canvas.circle(screenPos.x, screenPos.y, 10); 
    // canvas.text(this.boardPosition.array(), screenPos.x, screenPos.y); 
  }

  showBuilding(canvas, cameraPos) {
    let screenPos = Geometry.boardToScreen(this.boardPosition, cameraPos, this.tileHalfSize); 
    // game.currentScene.buildings[this.buildingId].show(cameraPos);
    game.currentScene.base.buildings[this.buildingId].show(cameraPos);
  }

  showUnit(canvas, cameraPos) {
    game.currentScene.base.units[this.unitId].show(cameraPos);
  }

  showWall(canvas, cameraPos) {
    let screenPos = Geometry.boardToScreen(this.boardPosition, cameraPos, this.tileHalfSize); 
    canvas.circle(screenPos.x, screenPos.y, 20)
  }

  showMinimap(canvas, minimapLoc) {
    canvas.push();
    let screenPos = boardToMinimap(this.boardPosition);
    screenPos.add(minimapLoc)
    let color = "yellow";
    if (this.isUnit()) {
      canvas.fill(255,0,0)
      canvas.noStroke()
      canvas.rect(screenPos.x, screenPos.y, 3,3);
    } else if(this.isBuilding()) {
      canvas.fill(0,0,255)
      canvas.noStroke()
      canvas.rect(screenPos.x, screenPos.y, 3,3);
    }
    canvas.pop();
  }

  draw3D(canvas, cameraPos, auxText) {
    let screenPos = Geometry.boardToScreenSmall(this.boardPosition, cameraPos, this.tileHalfSize);    
    Tile.draw3D(canvas, this.tileId, screenPos, this.isEvent);
  }
}