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


// Buy means the city buys from you
// Sell means the city sells to you

class Resource {
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.img = resources[resourceName];
    this.position = createVector(0, 0);
    this.infoPanelData = {
      "title": this.resourceName,
      "image": this.img,
      "lines": [
        `Content:`,
        `Weight:`,
      ],
      "buttons": ""
    }
  } 

  generatePanelInfoData() {
    let data = {
      "title": this.resourceName,
      "image": this.img,
      "lines": [`Stored in: ${Wagon.resourceToWagon[this.resourceName]}`],
      "buttons": ""
    };

    return data;
  }

  setPosition(position) {
    this.position = position;
  }

  checkClick(mousePos) {
    return (
      mousePos.x > this.position.x  &&
      mousePos.x < this.position.x + 100 &&
      mousePos.y > this.position.y &&
      mousePos.y < this.position.y + 40
    );
  }

  show() {
    mainCanvas.rect(this.position.x, this.position.y, this.img.width, this.img.height)
    mainCanvas.image(this.img, this.position.x, this.position.y);
  }
}