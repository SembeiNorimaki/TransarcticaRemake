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

class ClickableRegion {
  constructor (pos, halfSize, image, text, callback) {
    this.pos = pos;
    this.halfSize = halfSize;
    if (image !== null) {
      this.bgImage = image[0];
      this.fgImage = image[1];
      this.halfSize = createVector(this.bgImage.width/2, this.bgImage.height/2);
    }
    this.callback = callback;
    this.text = text;
  }

  showText() {
    mainCanvas.push();
    mainCanvas.textAlign(CENTER, CENTER);
    mainCanvas.rectMode(CENTER);
    mainCanvas.fill(200);
    mainCanvas.rect(this.pos.x, this.pos.y, this.halfSize.x*2, this.halfSize.y*2);
    mainCanvas.fill(0);
    mainCanvas.text(this.text, this.pos.x, this.pos.y);
    mainCanvas.pop();
  }

  checkClick(mousePos) {
    return (
      mousePos.x > this.pos.x - this.halfSize.x &&
      mousePos.x < this.pos.x + this.halfSize.x &&
      mousePos.y > this.pos.y - this.halfSize.y &&
      mousePos.y < this.pos.y + this.halfSize.y
    );
  }

  show(canvas) {
    canvas.image(this.bgImage, this.pos.x, this.pos.y);
    //canvas.image(this.fgImage, this.pos.x, this.pos.y);  
    canvas.noFill();
    canvas.stroke("red")
    canvas.rect(this.pos.x, this.pos.y, this.halfSize.x*2, this.halfSize.y*2);
    canvas.noStroke();
    canvas.fill("black")

  }
}