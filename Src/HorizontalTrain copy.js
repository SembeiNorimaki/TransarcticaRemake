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

class HorizontalTrain {
  constructor(owner, wagons) {
    this.owner = owner;
    // game.playerTrain.wagons = wagons;

    if (this.owner == Game.Players.Human) {
      this.position = createVector(1400, 800+8);
    } else {
      this.position = createVector(1400, 50-32);
      this.horizontalTrainAI = new HorizontalTrainAI(this);
    }
    
    this.velocity = 0.0;
    this.acceleration = 0;
    this.accelerationStrenght = 0.1;
    this.brakingStrenght = 0.2;
    this.maxVelocity = 12.0;
    this.minVelocity = -12.0;
    this.gear = "N";    
  }

  findWagonIdxByName(name) {
    let result = [];
    for (const [i, wagon] of game.playerTrain.wagons.entries()) {
      if (wagon.constructor.name == name) {
        result.push(i)
      }
    }
    return result;
  }

  setPosition(position) {
    this.position = position;
  }

  setVelocity(velocity) {
    this.velocity = velocity;
  }

  setGear(gear) {
    if (gear == "D") {
      this.gear = "D";
      if (this.velocity >= 0)
        this.acceleration = this.accelerationStrenght;
      else 
        this.acceleration = this.brakingStrenght;
    } else if (gear == "R") {
      this.gear = "R";
      if (this.velocity <= 0)
        this.acceleration = -this.accelerationStrenght;
      else 
        this.acceleration = -this.brakingStrenght;
    } else {
      this.gear = "N";
      if (this.velocity > 0) {
        this.acceleration = -this.brakingStrenght;
      } else if (this.velocity < 0) {
        this.acceleration = this.brakingStrenght;
      }
    }
  }

  gearUp() {
    if (this.gear == "R")
      this.setGear("N");
    else if (this.gear == "N")
      this.setGear("D");
  }

  gearDown() {
    if (this.gear == "D")
      this.setGear("N");
    else if (this.gear == "N")
      this.setGear("R");
  }

  update() {
    
    this.velocity += this.acceleration;

    if (this.gear == "N") {
      if (this.acceleration > 0 && this.velocity >= 0) {
        this.acceleration = 0;
        this.velocity = 0;
      } else if (this.acceleration < 0 && this.velocity <= 0) {
        this.acceleration = 0;
        this.velocity = 0;
      } else {

      }
    }
    
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
      this.acceleration = 0;
    } else if (this.velocity < this.minVelocity) {
      this.velocity = this.minVelocity;
      this.acceleration = 0;
    }

    this.position.x += this.velocity;

    this.currentPosition = this.position.copy();

    game.playerTrain.wagons[0].setPos(this.currentPosition);  
    this.currentPosition.sub(game.playerTrain.wagons[0].halfSize.x+2, 0);

    for (let [i, wagon] of game.playerTrain.wagons.entries()) {
      if (i==0) continue;
      this.currentPosition.sub(wagon.halfSize.x+2, 0);
      wagon.setPos(this.currentPosition.copy());  
      this.currentPosition.sub(wagon.halfSize.x+2, 0);
    }

    // let auxPos = this.position.copy();
    // game.playerTrain.wagons[0].update();
    // game.playerTrain.wagons[0].setPos(this.position);

    // for (let i=1; i<game.playerTrain.wagons.length; i++) {
    //   game.playerTrain.wagons[i].update();
    //   auxPos.x -= game.playerTrain.wagons[i].halfSize.x*2;
    //   game.playerTrain.wagons[i].setPos(auxPos);
    // }
  }

  getClickedWagon(mousePos) {
    for (let i=0; i<game.playerTrain.wagons.length; i++) {
      if (mousePos.x >= game.playerTrain.wagons[i].position.x - game.playerTrain.wagons[i].halfSize.x) {
        console.log(`Clicked wagon ${i}`);
        return i;
      }
    } 
    return null;
  }

  onClick(mousePos) {
    for (const [i, wagon] of game.playerTrain.wagons.entries()) {
      if (wagon.checkClick(mousePos)) {
        return i;
      }
    }
    return null;
  }
    
    // let i = this.getClickedWagon(mousePos);
    // if (i !== null) {
    //   game.currentScene.infoPanel.fillData({
    //     "title": game.playerTrain.wagons[i].name,
    //     "image": game.playerTrain.wagons[i].img[0],
    //     "lines": ["1","2","3"],
    //     "buttons": "sell"
    //   }); 
    // }
  

  processKey(key) {

  }

  show(cameraPosition) {
    for (let [i, wagon] of game.playerTrain.wagons.entries()) {
      wagon.showHorizontal(cameraPosition);
      //if (["Cannon", "Machinegun", "Cannon_vu", "Machinegun_vu"].includes(wagon.name)) {
        // TODO: gives error for cityTradeScene, 
        //game.playerTrain.wagons[i].showReloadBar(cameraPosition);
      //}
      
      //mainCanvas.strokeWeight(5)
      
    }
  }
}