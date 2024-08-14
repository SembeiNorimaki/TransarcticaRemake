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

class Locomotive {
  constructor(position, orientation) {
    this.position = position;
    this.prevPosition = position.copy();
    this.orientation = orientation;
    this.frontSensor = createVector(0.4, 0).setHeading(radians(this.orientation)).add(this.position);
    this.currentTile = this.position.copy();
    this.prevTile = this.currentTile.copy();
    this.currentTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.prevTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.acceleration = createVector(0.0002, 0).setHeading(radians(this.orientation));
    this.velocity = createVector(0.0, 0.0);
    this.braking = createVector(0.0005, 0); 
    this.maxVelocity = 0.1;
    this.spriteIdx = 0;
    this.gear = "N";
  }

  initialize(savedData) {
    this.orientation = savedData.orientation;
    this.position = savedData.position; 
    this.prevPosition = this.position.copy();
    this.frontSensor = createVector(0.4, 0).setHeading(radians(this.orientation)).add(this.position);
    this.currentTile = this.position.copy();
    this.prevTile = this.currentTile.copy();
    this.currentTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.prevTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.acceleration = createVector(0.0002, 0).setHeading(radians(this.orientation));
  }

  start() {
    this.gear = "D";
  }

  stop() {
    this.gear = "N";
  }

  startStop() {
    if (this.gear == "N") {
      this.start();
    } else {
      this.stop();
    }
  }

  inmediateStop() {
    this.gear = "N";
    this.velocity.setMag(0.0);
  }

  turn180() {
    if (this.velocity.mag() == 0) {
      this.orientation = (this.orientation + 180) % 360;
      this.acceleration.setHeading(radians(this.orientation));
      this.update();
    }
  }

  checkFrontSensor() {
    let deltaX = this.currentTileFrontSensor.x - this.prevTileFrontSensor.x;
    let deltaY = this.currentTileFrontSensor.y - this.prevTileFrontSensor.y;
    let tileName = "";
    
    tileName = Tile.idxToName[game.navigationScene.tileBoard.board[this.currentTileFrontSensor.y][this.currentTileFrontSensor.x]];
    console.log(tileName)
    
    // TODO: this no longer works, fix it
    if ((deltaX == 1 && !tileName.includes("A")) ||
        (deltaX == -1 && !tileName.includes("D")) ||
        (deltaY == 1 && !tileName.includes("B")) ||
        (deltaY == -1 && !tileName.includes("C"))) {
          console.log("Cannot continue")
          this.stop();
          this.velocity.setMag(0.0);
    }
  }

  enteredNewTile(sensorId) { 
    if (sensorId == 1)  { // center sensor       
      return !this.currentTile.equals(this.prevTile);
    } else if (sensorId == 2) { // front sensor
      return !this.currentTileFrontSensor.equals(this.prevTileFrontSensor);
    }
  }

  newOrientation() {
    let newOri;
    let tileName = Tile.idxToName[game.navigationScene.tileBoard.board[this.prevTile.y][this.prevTile.x].tileId];
    let exitSide = Tile.orientationToExit[tileName][this.orientation];
    let delta = Tile.sideToDelta[exitSide];

    tileName =  Tile.idxToName[game.navigationScene.tileBoard.board[this.currentTile.y][this.currentTile.x].tileId];
    let entrySide = Tile.oppositeSide[exitSide];
    if (tileName in Tile.entryToOrientation) {
      newOri = Tile.entryToOrientation[tileName][entrySide];
    }
    this.orientation = newOri;

    this.frontSensor = createVector(0.4, 0).setHeading(radians(this.orientation)).add(this.position);
    this.velocity.setHeading(radians(this.orientation));
    this.acceleration.setHeading(radians(this.orientation));
  }

  update() {
    // Update train velocity
    if (this.gear == "D") {
      this.velocity.add(this.acceleration);      
      if (this.velocity.mag() > this.maxVelocity) {
        this.velocity.setMag(this.maxVelocity);
      }
    } else {
      this.braking.setHeading(radians(this.orientation));
      this.velocity.sub(this.braking);
      if (this.velocity.mag() < 0.01)
        this.velocity.setMag(0.0);
    }

    // update position and tiles
    this.prevPosition = this.position.copy();
    this.position.add(this.velocity);  
    this.frontSensor.add(this.velocity);  

    this.prevTile = this.currentTile.copy();
    this.currentTile.set(round(this.position.x), round(this.position.y));

    this.prevTileFrontSensor = this.currentTileFrontSensor.copy();
    this.currentTileFrontSensor.set(round(this.frontSensor.x), round(this.frontSensor.y));

    // update fuel
    game.playerTrain.fuel -= this.velocity.mag();    

    // update camera
    if (game.cameraFollowsLocomotive) {
      let aux = boardToCamera(this.position);
      game.navigationScene.camera.setPos(aux);
    }
  }

  show() {
    this.screenPos = boardToScreen(this.position, game.navigationScene.camera.position);
    // console.log(this.position.array(), this.screenPos.array())
    // this.screenPos.add([
    //   gameData.locomotiveData[this.orientation].offset[0],
    //   gameData.locomotiveData[this.orientation].offset[1] 
    // ]);
    mainCanvas.image(gameData.locomotiveData[this.orientation.toString()].imgList[this.spriteIdx], 
    this.screenPos.x+gameData.locomotiveData[this.orientation.toString()].offset[0], 
    this.screenPos.y+gameData.locomotiveData[this.orientation.toString()].offset[1]);
    // mainCanvas.circle(this.screenPos.x, this.screenPos.y, 10)
    let screenPos2 = boardToScreen(this.frontSensor, game.navigationScene.camera.position);
    // mainCanvas.circle(screenPos2.x, screenPos2.y, 10)
  }
}