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

class MachinegunBullets {
  constructor(position, direction) {
    let spriteData = {
      "imgs": gameData.cannonballData,
      "actions": ["move", "explode"],
      "nSprites": {"move": 1, "explode": 7},
      "spriteDuration": {"move": 1, "explode": 4}
    }
    this.orientation = 0;

    this.sprite = new Sprite("move", this.orientation, spriteData);

    this.position = position;
    this.direction = direction;
    if (this.direction == "N") {
      this.velocity = createVector(-0.3, -0.3);
      this.targetY = 2;
    } else {
      this.velocity = createVector(0.3, 0.3);
      this.targetY = 45;
    }

    this.diam = 10;
    this.finished = false;
  }
  
  explode() {
    this.sprite.setAction("explode");
    this.velocity.set(createVector(0,0));
  }

  update() {
    this.sprite.update();

    this.position.add(this.velocity);
    if (this.direction == "N" && (this.position.x + this.position.y) <= this.targetY) {
      this.explode();
    } else if (this.direction == "S" && (this.position.x + this.position.y) >= this.targetY) {
      this.explode();
    }

    if (this.sprite.getAction() == "explode" && this.sprite.getSpriteIdx() == 6) {
      this.finished = true;
    }
  }

  show(cameraPos, tileHalfSize) {
    let screenPosition = Geometry.boardToScreen(this.position, cameraPos, tileHalfSize);
    this.sprite.show(screenPosition);    
  }
}