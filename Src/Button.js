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

class Button {
  constructor(id, active, position, halfSize, text=null, color=null, image=null) {
    this.id = id;
    this.position = position;
    this.halfSize = halfSize;
    this.text = text;
    this.color = color;
    this.image = image;
    this.active = active;
  }

  onClick(mousePos) {
    if (
      mousePos.x > this.position.x - this.halfSize.x &&
      mousePos.x < this.position.x + this.halfSize.x &&
      mousePos.y > this.position.y - this.halfSize.y &&
      mousePos.y < this.position.y + this.halfSize.y
    ) {
      return this.id;
    } else {
      return null;
    }
  }

  show(canvas) {
    if (!this.active) {
      return;
    }
    canvas.push();    
    if (this.color !== null) {
      canvas.fill(this.color);
    }
    canvas.rect(this.position.x - this.halfSize.x, this.position.y - this.halfSize.y, 2*this.halfSize.x, 2*this.halfSize.y);

    if (this.image !== null) {
      canvas.imageMode(CENTER, CENTER)
      canvas.image(this.image, this.position.x, this.position.y)
    } 
    
        
    

    if (this.text !== null) {
      canvas.fill(0);
      canvas.textAlign(CENTER, CENTER);
      canvas.textSize(32);
      canvas.text(this.text, this.position.x, this.position.y);
    }  
    
    canvas.pop();
  }
}