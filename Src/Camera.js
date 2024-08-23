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

class Camera {
  constructor(position) {
    this.position = position.copy();
    this.destination = this.position.copy();
    this.speed = 10;
  }

  setPosition(position) {
    this.position.set(position.x, position.y);
  }
  setDestination(dst) {
    this.destination = dst;
  }

  update() {
    // if (p5.Vector.dist(this.position, this.destination) > 10) {
    //   this.move(p5.Vector.sub(this.destination, this.position).normalize().mult(this.speed));
    // }
  }

  move(delta) {
    this.setPosition(p5.Vector.add(this.position, delta));
  }
}