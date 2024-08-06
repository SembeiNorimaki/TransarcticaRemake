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

class Wagon {
  static wagonToResource = {
    "Oil Tanker":     "Oil",
    "Iron Gondola":   "Iron",
    "Copper Gondola": "Copper",
    "Iron bars":      "Iron bars",
    "Wood Wagon":           "Wood",
    "Container":      "Container",
    "Merchandise":    "ALL"
  };

  static resourceToWagon = {
    "Oil":                 "Oil Tanker",   
    "Iron":                "Iron Gondola", 
    "Copper":              "Copper Gondola",
    "Iron bars":           "Iron bars",
    "Wood":                "Wood Wagon",      
    "Container":           "Container",    
    "Gasoline":            "Oil Tanker",   
    "Water":               "Water Tanker",   
    
    "Antiques":            "Merchandise",
    "Fishing Rods":        "Merchandise",
    "Caviar":              "Merchandise",
    "Line Inspection Car": "Merchandise",
    "Furs":                "Merchandise",
    "Mamooth Dung":        "Merchandise",
    "Missiles":            "Merchandise",
    "Fish":                "Merchandise",
    "Rails":               "Merchandise",
    "Salt":                "Merchandise",
    "Wolf Meat":           "Merchandise"
  };
  

  constructor(id, name, wagonData) {
    this.id = id;
    this.name = name;
    console.log(name)
    this.img = wagonData.img;
    this.halfSize = createVector(wagonData.img[0].width/2, wagonData.img[0].height/2);
    this.offset = wagonData.offset;
    
    this.capacity = wagonData.capacity;
    this.cargo = wagonData.cargo;
    this.unit = wagonData.units;
    this.weight = wagonData.weight;

    this.usedSpace = 0;
    this.availableSpace = this.capacity;
    this.spriteId = 0;
    this.position = createVector(0, 800);
    this.velocity = createVector(0.0, 0.0);
    this.hp = 50;
    this.maxHp = 100;

    this.purchasePrice = 0;

    this.destination = null;

    this.infoPanelData = this.generatePanelInfoData();
    

  }

  generatePanelInfoData() {
    let data = {
      "title": this.name,
      "image": this.img[this.spriteId],
      "lines": [],
      "buttons": ""
    };
    if (this.usedSpace == 0) {
      data.lines.push("Content: Empty");
    } else {
      data.lines.push(`Content: ${this.usedSpace} ${this.unit} of ${this.cargo}`);
    }
    data.lines.push(`Weight: ${this.weight}`);

    return data;
  }

  checkClick(mousePos) {
    return (
      mousePos.x > this.position.x - this.offset[this.spriteId][0] &&
      mousePos.x < this.position.x - this.offset[this.spriteId][0] + 2 * this.halfSize.x &&
      mousePos.y > this.position.y - this.offset[this.spriteId][1]&&
      mousePos.y < this.position.y - this.offset[this.spriteId][1] + 2 * this.halfSize.y
    );
  }

  setPos(newPos) {
    this.position.set(newPos);
  }

  setDestination(destination) {
    this.destination = destination;
  }

  setCargo(cargo) {
    this.cargo = cargo;
  }

  addResource(qty) {
    if (qty > this.availableSpace) {
      throw "Not enough space";
    }
    this.usedSpace += qty;
    this.availableSpace -= qty; 
    //this.recalculateSpriteId();
  }

  removeResource(qty) {
    if (qty >= this.usedSpace) {
      this.usedSpace = 0;
      this.availableSpace = this.capacity;
    } else {
      this.usedSpace -= qty;
      this.availableSpace += qty;
    }
    //this.recalculateSpriteId();
  }

  fillWagon(resourceName) {
    this.setCargo(resourceName);  // TODO: Dangerous. This is good for merchandise, but dangerous for other wagons
    this.addResource(this.capacity)
  }

  emptyWagon() {
    this.setCargo(null);  // TODO: Dangerous. This is good for merchandise, but dangerous for other wagons
    this.removeResource(this.usedSpace);
  }

  receiveDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.img = wagonsData.wreck_vu.img;
      this.spriteId = 0;
    }
  }

  showHealthBar() {
    mainCanvas.push();
    //mainCanvas.rectMode(CENTER)
    mainCanvas.fill("red");
    mainCanvas.rect(this.position.x + this.halfSize.x - 50, this.position.y+30, 100, 4);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x + this.halfSize.x - 50, this.position.y+30, 100*this.hp/this.maxHp, 4);
    
    mainCanvas.pop();
  }

  showHorizontal(cameraPosition) {
    let position = this.position.copy();
    if (cameraPosition) {
      position.sub(cameraPosition);
    }
    mainCanvas.image(
      this.img[this.spriteId], 
      position.x - this.offset[this.spriteId][0], 
      position.y - this.offset[this.spriteId][1]
    );
    try {
      mainCanvas.image(resources[this.cargo], position.x, position.y+10,75,30);
    }catch{}

    mainCanvas.noFill();
    // mainCanvas.stroke("red")
    // mainCanvas.rect(
    //   this.position.x - this.offset[this.spriteId][0], 
    //   this.position.y - this.offset[this.spriteId][1], 
    //   this.halfSize.x*2, this.halfSize.y*2);
    // //mainCanvas.noStroke();
    // mainCanvas.stroke("black")

    //mainCanvas.line(this.position.x, this.position.y-200, this.position.x,this.position.y+100)


    //mainCanvas.line(this.position.x, this.position.y, this.position.x, this.position.y-100);
    //this.showHealthBar(); 
  }

  showHud() {
    hudCanvas.background(100);
    hudCanvas.image(this.img[this.spriteId],100, 30);
    hudCanvas.text(this.name,300, 30);

    // hudCanvas.image(gameData.unitsData.soldier[90][0], 700, 30, 32, 54);
    // hudCanvas.image(gameData.unitsData.soldier[90][0], 720, 30, 32, 54);

    // hudCanvas.image(gameData.unitsData.soldier[90][0], 800, 22, 32, 54);
    // hudCanvas.image(gameData.unitsData.soldier[90][0], 820, 22, 32, 54);
    // hudCanvas.image(gameData.unitsData.soldier[90][0], 810, 38, 32, 54);
  }

  update() {

  }

  show() {

  }
}



class CannonWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
    this.reloadTime = 300;
    this.reloadCount = this.reloadTime;
  }

  isReadyToFire() {
    return (this.reloadCount == 0);
  }

  update() {
    if (this.reloadCount > 0) {
      this.reloadCount--;
    }
  }

  fire() {
    if (this.isReadyToFire()) {
      this.reloadCount = this.reloadTime;
      let spawnPosition = createVector(this.position.x + this.halfSize.x, this.position.y-40); 
      game.currentScene.cannonball = new Cannonball(spawnPosition);
    }
  }

  showReloadBar(cameraPos) {
    mainCanvas.push();
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,this.halfSize.x*2,5);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,
      this.reloadCount*this.halfSize.x*2/this.reloadTime,5);
    
    mainCanvas.pop();
    
  }

}

class MachinegunWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
    this.reloadTime = 50;
    this.reloadCount = this.reloadTime;
  }

  isReadyToFire() {
    return (this.reloadCount == 0);
  }

  update() {
    if (this.reloadCount > 0) {
      this.reloadCount--;
    }
  }

  fire() {
    if (this.isReadyToFire()) {
      this.reloadCount = this.reloadTime;
      let spawnPosition = createVector(this.position.x + this.halfSize.x, this.position.y-40); 
      game.currentScene.machinegunbullets = new MachinegunBullets(spawnPosition);
    }
  }

  showReloadBar(cameraPos) {
    mainCanvas.push();
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,this.halfSize.x*2,5);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,
      this.reloadCount*this.halfSize.x*2/this.reloadTime,5);
    mainCanvas.pop(); 
  }

}

class PlayerMachinegunWagon extends MachinegunWagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
    
  }
}
class EnemyMachinegunWagon extends MachinegunWagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
    
  }
}

class LivestockWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
  }
}
class BarracksWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
  }
}

class LocomotiveWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
  }

  showWeightBar(cameraPos) {
    mainCanvas.push();
    mainCanvas.rect(this.position.x-this.halfSize.x-cameraPos.x, this.position.y+20,this.halfSize.x*2,5);
    //mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22, 100,100);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x-this.halfSize.x-cameraPos.x, this.position.y+20,
      game.playerTrain.weight * this.halfSize.x * 2 / game.playerTrain.maxWeight, 5);
    mainCanvas.pop(); 
  }

  showHorizontal(cameraPos) {
    super.showHorizontal(cameraPos);
    // this.showWeightBar(cameraPos);
  }
}





