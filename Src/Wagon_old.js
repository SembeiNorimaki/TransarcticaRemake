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
  constructor(id, name, wagonData) {
    this.id = id;
    this.name = name;
    this.img = wagonData.img;
    this.halfSize = createVector(wagonData.img[0].width/2, wagonData.img[0].height/2);
    this.offsety = wagonData.offsety;
    this.capacity = wagonData.capacity;
    this.usedSpace = 0;
    this.availableSpace = this.capacity;
    this.spriteId = 0;
    this.position = createVector(0, 800);
    this.velocity = createVector(0.0, 0.0);
    this.hp = 50;
    this.maxHp = 100;

  }

  setPosition(newPos) {
    this.position.set(newPos);
  }

  addResource(qty) {
    if (qty > this.availableSpace) {
      throw "Not enough space";
    }
    this.usedSpace += qty;
    this.availableSpace -= qty; 
    //this.recalculateSpriteId();
  }

  fillWagon() {
    this.usedSpace = this.capacity;
    this.availableSpace = 0;
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
    mainCanvas.image(this.img[this.spriteId], position.x, position.y - this.offsety[this.spriteId]);
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

  show() {

  }
}

class CannonWagon extends Wagon {
  constructor() {
  }
}

class MachinegunWagon extends Wagon {
  constructor() {
  }
}

class LivestockWagon extends Wagon {
  constructor() {
  }
}
class BarracksWagon extends Wagon {
  constructor() {
  }
}

class OilWagon extends Wagon {
  constructor(){
  }
}

class IronWagon extends Wagon {
  constructor(){
  }
}
class CopperWagon extends Wagon {
  constructor(){
  }
}
class WoodWagon extends Wagon {
  constructor(){
  }
}
class ContainerWagon extends Wagon {
  constructor(){
  }
}





