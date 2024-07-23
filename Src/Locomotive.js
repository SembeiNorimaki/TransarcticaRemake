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
    this.maxVelocity = 0.06;
    this.spriteIdx = 0;
    this.gear = "N";
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
      this.orientation =  (this.orientation + 180) % 360;
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
       
      if (!this.currentTile.equals(this.prevTile)) {
        return true;
      }
      return false;
    } else if (sensorId == 2) { // front sensor
      if (!this.currentTileFrontSensor.equals(this.prevTileFrontSensor)) {
        return true;
      }
      return false;      
    }
  }

  // TODO: use the static dictionaries in Tile to calculate the new orientation and position, like in getNextIntersection

  newOrientation() {
    //console.log(worldMap.tileIdx2name[worldMap.board[this.currentTile.y][this.currentTile.x]]);
    // stations make the train stop
    // if ([0x81, 0x82].includes(worldMap.board[this.currentTile.y][this.currentTile.x])) {
    //   this.stop();
    //   this.braking.setMag(this.velocity.mag()*this.velocity.mag()/1.2);
    //   console.log(this.braking.mag())
    //   return;
    // }

    //console.log(this.currentTile.x, this.currentTile.y,worldMap.map2idx(createVector(this.currentTile.x, this.currentTile.y)))
    

    switch(Tile.idxToName[game.navigationScene.tileBoard.board[this.currentTile.y][this.currentTile.x].tileId]) {
      case("Rail_AB"):
      case("Rail_ABc"):
      case("Rail_ABd"):
        if (this.velocity.y > 0) {    
          this.orientation = 135;
          this.position = createVector(this.currentTile.x, this.currentTile.y - 0.5);
        } else {
          this.orientation = 315;
          this.position = createVector(this.currentTile.x - 0.5, this.currentTile.y);
        }
      break;
      case("Rail_AC"):
      case("Rail_ACb"):
      case("Rail_ACd"):
        if (this.velocity.x > 0) {
          this.orientation = 45;
          this.position = createVector(this.currentTile.x - 0.5, this.currentTile.y );
        } else {
          this.orientation = 225;
          this.position = createVector(this.currentTile.x, this.currentTile.y + 0.5);
        }
      break;
      case("Rail_AD"):
      case("Rail_ADb"):
      case("Rail_ADc"):
        if (this.velocity.x > 0) {
          this.orientation = 0;
          this.position = createVector(this.currentTile.x - 0.5, this.currentTile.y);
        } else {
          this.orientation = 180;
          this.position = createVector(this.currentTile.x + 0.5, this.currentTile.y);
        }
      break;
      case("Rail_BC"):
      case("Rail_BCa"):
      case("Rail_BCd"):
        if (this.velocity.y > 0) {
          this.orientation = 90;
          this.position = createVector(this.currentTile.x, this.currentTile.y - 0.5);
        } else {
          this.orientation = 270;
          this.position = createVector(this.currentTile.x, this.currentTile.y + 0.5);
        }
      break;
      case("Rail_BD"):
      case("Rail_BDa"):
      case("Rail_BDc"):
        if (this.velocity.x < 0) {
          this.orientation = 225;
          this.position = createVector(this.currentTile.x+0.5, this.currentTile.y);
        } else {
          this.orientation = 45;
          this.position = createVector(this.currentTile.x, this.currentTile.y-0.5);
        }
      break;
      case("Rail_CD"):
      case("Rail_CDa"):
      case("Rail_CDb"):
        if (this.velocity.y < 0) {
          this.orientation = 315;
          this.position = createVector(this.currentTile.x, this.currentTile.y + 0.5);
        } else {
          this.orientation = 135;
          this.position = createVector(this.currentTile.x + 0.5, this.currentTile.y);
        }
      break;
    }
    this.frontSensor = createVector(0.4, 0).setHeading(radians(this.orientation)).add(this.position);
    this.velocity.setHeading(radians(this.orientation));
    this.acceleration.setHeading(radians(this.orientation));

  }

  update() {
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

    this.prevPosition = this.position.copy();
    this.position.add(this.velocity);  
    this.frontSensor.add(this.velocity);  

    this.prevTile = this.currentTile.copy();
    this.currentTile.set(round(this.position.x), round(this.position.y));

    this.prevTileFrontSensor = this.currentTileFrontSensor.copy();
    this.currentTileFrontSensor.set(round(this.frontSensor.x), round(this.frontSensor.y));

    this.fuel -= this.velocity.mag();
    

    let aux = boardToCamera(this.position);
    //game.navigationScene.camera.setPos(aux);
    

  }

  show() {
    this.screenPos = boardToScreen(this.position, game.navigationScene.camera.position);
    // console.log(this.position.array(), this.screenPos.array())
    // this.screenPos.add([
    //   locomotiveData[this.orientation].offset[0],
    //   locomotiveData[this.orientation].offset[1] 
    // ]);
    mainCanvas.image(locomotiveData[this.orientation.toString()].imgList[this.spriteIdx], 
    this.screenPos.x+locomotiveData[this.orientation.toString()].offset[0], 
    this.screenPos.y+locomotiveData[this.orientation.toString()].offset[1]);
    // mainCanvas.circle(this.screenPos.x, this.screenPos.y, 10)
    let screenPos2 = boardToScreen(this.frontSensor, game.navigationScene.camera.position);
    // mainCanvas.circle(screenPos2.x, screenPos2.y, 10)
  }
}