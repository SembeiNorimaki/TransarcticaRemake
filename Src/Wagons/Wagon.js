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
    "Alcohol":             "Merchandise", 
    "Antiques":            "Merchandise", 
    "Wood":                "Merchandise", 
    "Fishing Rods":         "Merchandise", 
    "Caviar":              "Merchandise", 
    "Line Inspection Car": "Merchandise", 
    "Furs":                "Merchandise", 
    "Mammoth Dung":        "Merchandise", 
    "Oil":                 "Oil Tank", 
    "Missiles":            "Merchandise", 
    "Gasoline":            "Merchandise", 
    "Plants":              "BioGreenHouse", 
    "Fish":                "Merchandise", 
    "Rails":               "Merchandise", 
    "Salt":                "Merchandise", 
    "Wolf Meat":           "Merchandise", 
    "Mamooth":             "Merchandise", 


    "Water":               "Water Tanker", 
    "Iron":                "Gondola", 
    "Copper":              "Gondola",
    "Clay":                "Gondola",
    "Iron bars":           "Iron bars",
    "Container":           "Container",        
    "Wolf":                "Livestock",
    "Tank":                "Vehicle Wagon",
    "Artillery":           "Vehicle Wagon"
  };
  

  constructor(id, name, wagonData) {
    this.id = id;
    this.name = name;
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

    this.defaultCargo = null;

    this.merchandiseValue = 0;

    this.destination = null;

    this.infoPanelData = this.generatePanelInfoData();
    

  }

  generatePanelInfoData() {
    let data = {
      "title": this.name,
      "image": this.img[this.spriteId],
      "lines": [
        `Cargo: ${this.cargo}`,
        `Content: ${this.usedSpace} / ${this.capacity} ${this.unit}`,
        `Weight: ${this.weight}`
      ],
      "buttons": ""
    };
    return data;
  }

  checkClick(mousePos, cameraPosition) {
    let screenPosition = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    return (
      mousePos.x > screenPosition.x - this.halfSize.x &&
      mousePos.x < screenPosition.x + this.halfSize.x &&
      mousePos.y > screenPosition.y - 2*this.halfSize.y &&
      mousePos.y < screenPosition.y
    );
  }

  setPosition(newPos) {
    this.position.set(newPos);
  }

  setDestination(destination) {
    this.destination = destination;
  }

  setCargo(cargo) {
    this.cargo = cargo;
  }

  addResource(qty, unitPrice) {
    if (qty > this.availableSpace) {
      throw "Not enough space";
    }
    this.usedSpace += qty;
    this.availableSpace -= qty; 
    this.merchandiseValue += qty * unitPrice;
    //this.recalculateSpriteId();
  }

  removeResource(qty, unitPrice) {
    if (qty >= this.usedSpace) {
      this.usedSpace = 0;
      this.availableSpace = this.capacity;
      this.merchandiseValue = 0;
    } else {
      this.usedSpace -= qty;
      this.availableSpace += qty;
      this.merchandiseValue -= qty * unitPrice;
    }
    //this.recalculateSpriteId();
  }

  fillWagon(resourceName, unitPrice) {
    this.setCargo(resourceName);  // TODO: Dangerous. This is good for merchandise, but dangerous for other wagons
    this.addResource(this.capacity, unitPrice);
  }

  emptyWagon() {
    this.setCargo(this.defaultCargo);  
    this.removeResource(this.usedSpace, 0);
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

  showBoundingBox(screenPosition) {
    mainCanvas.push();
    mainCanvas.noFill();
    mainCanvas.rect(screenPosition.x-this.halfSize.x, screenPosition.y-2*this.halfSize.y, 2*this.halfSize.x, 2*this.halfSize.y);
    mainCanvas.pop();
  }


  showHorizontal(cameraPosition) {
    // This position is now a tilePosition, not a screenPosition
    let position = this.position.copy();
    let screenPosition = Geometry.boardToScreen(position, cameraPosition, game.currentScene.tileHalfSize)
    // if (cameraPosition) {
    //   position.sub(cameraPosition);
    // }
    mainCanvas.image(
      this.img[this.spriteId], 
      screenPosition.x - this.offset[this.spriteId][0], 
      screenPosition.y - this.offset[this.spriteId][1]
    );

    // this.showBoundingBox(screenPosition)
    
    // mainCanvas.line(
    //   screenPosition.x-50, screenPosition.y-50,screenPosition.x+50, screenPosition.y+50,
    // )
    // mainCanvas.line(
    //   screenPosition.x+50, screenPosition.y-50,screenPosition.x-50, screenPosition.y+50,
    // )
    
    try {
      if (game.currentScene.constructor.name != "CombatScene" && game.currentScene.horizontalTrain.velocity == 0 && this.usedSpace > 0) {
        mainCanvas.image(resources[this.cargo], screenPosition.x-resources[this.cargo].width/2, screenPosition.y+10);
        mainCanvas.text(this.usedSpace, screenPosition.x+resources[this.cargo].width/2, screenPosition.y+40)
      }
      // mainCanvas.rect(position.x-resources[this.cargo].width/2, position.y+10, resources[this.cargo].width, resources[this.cargo].height);
    } catch {
      console.log(`Error in wagon ${this.id} ${this.name}`)
    }

    

  }


  // showHorizontal(cameraPosition) {
  //   // This position is now a tilePosition, not a screenPosition
  //   let position = this.position.copy();
  //   if (cameraPosition) {
  //     position.sub(cameraPosition);
  //   }
  //   mainCanvas.image(
  //     this.img[this.spriteId], 
  //     position.x - this.offset[this.spriteId][0], 
  //     position.y - this.offset[this.spriteId][1]
  //   );
  //   try {
  //     if (game.currentScene.horizontalTrain.velocity == 0 && this.usedSpace > 0) {
  //       mainCanvas.image(resources[this.cargo], position.x-resources[this.cargo].width/2, position.y+10);
  //       mainCanvas.text(this.usedSpace, position.x+resources[this.cargo].width/2, position.y+40)
  //     }
  //     // mainCanvas.rect(position.x-resources[this.cargo].width/2, position.y+10, resources[this.cargo].width, resources[this.cargo].height);
  //   }catch{}

  //   mainCanvas.noFill();
  //   // mainCanvas.stroke("red")
  //   // mainCanvas.rect(
  //   //   this.position.x - this.offset[this.spriteId][0], 
  //   //   this.position.y - this.offset[this.spriteId][1], 
  //   //   this.halfSize.x*2, this.halfSize.y*2);
  //   // //mainCanvas.noStroke();
  //   // mainCanvas.stroke("black")

  //   //mainCanvas.line(this.position.x, this.position.y-200, this.position.x,this.position.y+100)


  //   //mainCanvas.line(this.position.x, this.position.y, this.position.x, this.position.y-100);
  //   //this.showHealthBar(); 
  // }

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







// class PlayerMachinegunWagon extends MachinegunWagon {
//   constructor(id, name, wagonData) {
//     super(id, name, wagonData);
    
//   }
// }
// class EnemyMachinegunWagon extends MachinegunWagon {
//   constructor(id, name, wagonData) {
//     super(id, name, wagonData);
    
//   }
// }

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







