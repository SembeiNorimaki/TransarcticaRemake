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

class Cannonball {
  constructor(position) {

    let spriteData = {
      "imgs": gameData.cannonballData,
      "actions": ["move", "explode"],
      "nSprites": {"move": 1, "explode": 7},
      "spriteDuration": {"move": 1, "explode": 4}
    }
    this.orientation = 0;

    this.sprite = new Sprite("move", this.orientation, spriteData);
    

    this.position = position;
    this.velocity = createVector(-0.3, -0.3);
    this.diam = 10;
    this.finished = false;
    
    this.targetY = 2;
    this.direction = "N";

    // if (this.velocity.y < 0) {
    //   this.targetY = 70;
    //   this.direction = "N";
    // } else {
    //   this.targetY = 800;
    //   this.direction = "S";
    // }
  }

  // explode() {
  //   this.diam = 20;
  //   this.velocity.y = 0;
  //   this.finished = true;


  // }

  update() {
    this.sprite.update();

    this.position.add(this.velocity);
    if (this.direction == "N" && (this.position.x + this.position.y) <= this.targetY) {
      this.sprite.setAction("explode");
      this.velocity.set(createVector(0,0));
      // this.finished = true;
    } else if (this.direction == "S" && (this.position.x + this.position.y) >= this.targetY) {
      this.sprite.setAction("explode");
      this.velocity.set(createVector(0,0));
      this.finished = true;
    }

    if (this.sprite.getAction() == "explode" && this.sprite.getSpriteIdx() == 6) {
      this.finished = true;
    }
  }

  show(cameraPos, tileHalfSize) {
    let screenPosition = Geometry.boardToScreen(this.position, cameraPos, tileHalfSize);
    // if (cameraPos) {
    //   position.sub(cameraPos);
    // }
    this.sprite.show(screenPosition);

    // mainCanvas.push();
    // mainCanvas.fill(20)
    // mainCanvas.circle(this.position.x, this.position.y, this.diam);
    // mainCanvas.pop();
  }
}