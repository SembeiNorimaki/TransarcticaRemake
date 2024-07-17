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

class TrafficLight {
  constructor(position, images, halfSize) {
    this.position = position;
    this.redImage = images[1];
    this.greenImage = images[0];
    this.halfSize = createVector(halfSize.x, halfSize.y); 
    this.currentColor = 0;
    this.currentImage = this.redImage;
  }

  checkClick(mousePos) {
    if (
      mousePos.x > this.position.x - this.halfSize.x &&
      mousePos.x < this.position.x + this.halfSize.x &&
      mousePos.y > this.position.y - this.halfSize.y &&
      mousePos.y < this.position.y + this.halfSize.y
    ) {
      console.log("Traffic light clicked");
      if (this.currentColor == 0) {
        this.currentColor = 1;
        this.currentImage = this.greenImage;
      } else {
        this.currentColor = 0;
        this.currentImage = this.redImage;
      } 
      return true;
    }
    return false;    
  }

  show() {
    mainCanvas.image(this.currentImage, this.position.x-this.halfSize.x, this.position.y-this.halfSize.y);
    mainCanvas.stroke(0)
    // mainCanvas.rect(
    //   this.position.x-this.halfSize.x,
    //   this.position.y-this.halfSize.y,
    //   this.halfSize.x*2,
    //   this.halfSize.y*2
    // );
    //mainCanvas.circle(this.position.x,this.position.y,50);

  }
}