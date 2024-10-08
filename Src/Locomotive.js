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
  constructor(position, orientation, owner) {
    this.position = position;
    this.prevPosition = position.copy();
    this.orientation = orientation;
    this.owner = owner;
    this.frontSensor = createVector(0.4, 0).setHeading(radians(this.orientation)).add(this.position);
    this.currentTile = this.position.copy();
    this.prevTile = this.currentTile.copy();
    this.currentTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.prevTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.acceleration = createVector(0.02, 0).setHeading(radians(this.orientation));
    this.velocity = createVector(0.0, 0.0);
    this.braking = createVector(0.0006, 0); 
    this.maxVelocity = 0.05;
    this.spriteIdx = 0;
    this.gear = "N";
  }

  initialize(savedData) {
    this.orientation = savedData.orientation;
    this.position = createVector(savedData.position.x, savedData.position.y); 
    this.prevPosition = this.position.copy();
    this.currentTile = this.position.copy();
    this.prevTile = this.currentTile.copy();
    
    this.acceleration = createVector(0.0002, 0).setHeading(radians(this.orientation));
    
    let tileName = game.navigationScene.tileBoard.board[this.position.y][this.position.x].tileName;
    let offset = Tile.tileToInitialPositionOffset(tileName);
    this.position.add(offset);
    this.frontSensor = createVector(0.3, 0).setHeading(radians(this.orientation)).add(this.position);
    this.currentTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
    this.prevTileFrontSensor = createVector(round(this.frontSensor.x), round(this.frontSensor.y));
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
      this.frontSensor = createVector(0.3, 0).setHeading(radians(this.orientation)).add(this.position);
      console.log(this.orientation)
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

    this.frontSensor = createVector(0.3, 0).setHeading(radians(this.orientation)).add(this.position);
    this.velocity.setHeading(radians(this.orientation));
    this.acceleration.setHeading(radians(this.orientation));
  }

  update() {
    // Check if wee ran out of fuel
    if (game.playerTrain.coal <= 0) {
      this.stop();
      game.gameOver();
      
    }
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
    game.playerTrain.coal -= this.velocity.mag();    

    // update camera
    if (game.cameraFollowsLocomotive) {
      let aux = Geometry.boardToCamera(this.position, game.currentScene.tileHalfSize);
      game.navigationScene.camera.setPosition(aux);
    }
  }

  show() {
    this.screenPos = Geometry.boardToScreen(this.position, game.navigationScene.camera.position, game.navigationScene.tileHalfSize);
    // console.log(this.position.array(), this.screenPos.array())
    // this.screenPos.add([
    //   gameData.locomotiveData[this.orientation].offset[0],
    //   gameData.locomotiveData[this.orientation].offset[1] 
    // ]);
    if (this.owner == Game.Players.Human) {
      mainCanvas.image(gameData.locomotiveData.Human[this.orientation.toString()].img, 
      this.screenPos.x+gameData.locomotiveData.Human[this.orientation.toString()].offset[0], 
      this.screenPos.y+gameData.locomotiveData.Human[this.orientation.toString()].offset[1]);
    } else {
      mainCanvas.image(gameData.locomotiveData.Cpu[this.orientation.toString()].img, 
      this.screenPos.x+gameData.locomotiveData.Cpu[this.orientation.toString()].offset[0], 
      this.screenPos.y+gameData.locomotiveData.Cpu[this.orientation.toString()].offset[1]);
    }
    mainCanvas.fill(255)
    mainCanvas.circle(this.screenPos.x, this.screenPos.y, 5)
    let screenPos2 = Geometry.boardToScreen(this.frontSensor, game.navigationScene.camera.position, game.currentScene.tileHalfSize);
    mainCanvas.circle(screenPos2.x, screenPos2.y, 5)
  }
}