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
  constructor(position) {
    this.position = position;
    this.velocity = createVector(0, -30);
    this.finished = false;
    this.targetY = 200;
    this.direction = "N";
  }

  update() {
    this.position.add(this.velocity);

    if (this.direction == "N" && this.position.y <= this.targetY) {
      //this.sprite.setAction("explode");
      this.velocity.y = 0;
      this.finished = true;
    } else if (this.direction == "S" && this.position.y >= this.targetY) {
      //this.sprite.setAction("explode");
      this.velocity.y = 0;
      this.finished = true;
    }
  }

  show(cameraPos) {
    let position = this.position.copy();
    if (cameraPos) {
      position.sub(cameraPos);
    }
    mainCanvas.fill("black");
    mainCanvas.circle(position.x, position.y, 5);
    mainCanvas.noFill();
  }
}