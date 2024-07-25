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

class Industry {
  constructor(industryData) {
    this.name = industryData.name;
    this.resources = industryData.resources;
    this.resourceName = Object.keys(this.resources)[0];
    this.panelInfo = {
      "title": this.name,
      "image": industriesInfo[this.resourceName].imgInfo,
      "lines": [
        `Produces: ${this.resourceName}`, 
        `Anual production: ${this.resources[this.resourceName].Production}`
      ],
      "buttons": "Buy",
    }
    
    // this.position = null;
    // this.size = [8*TILE_WIDTH_HALF, 14*TILE_HEIGHT_HALF];
    // console.log(industryData);
    // this.accepts = "Copper"
    // this.wagonType = "Iron";
    // this.industryAvailableQty = 2;

    // this.wagonPositions = [
    //   createVector(16, 16),
    //   createVector(17, 15),
    //   createVector(18, 14),
    //   createVector(19, 13)
    // ];
    // this.units = "Tons";
    // this.minQty = 1;
  }

  onClick() {

  }

  // show(cameraPos) {
  //   mainCanvas.noFill();

  //   let screenPos = boardToScreen(this.position, cameraPos);
  //   mainCanvas.image(
  //     industriesInfo[this.name].img2, 
  //     screenPos.x-industriesInfo[this.name].offset[0]*2, 
  //     screenPos.y-industriesInfo[this.name].offset[1]*3
  //   );
  //   mainCanvas.circle(screenPos.x, screenPos.y, 20);
  //   mainCanvas.rect(screenPos.x-this.size[0]/2,screenPos.y-this.size[1], this.size[0], this.size[1])


  //   // show wagons
  //   for (let i=0; i<this.industryAvailableQty; i++) {
  //     screenPos = boardToScreen(this.wagonPositions[i], cameraPos);
  //     mainCanvas.image(
  //       wagonsData[this.wagonType].img[2], 
  //       screenPos.x, 
  //       screenPos.y - wagonsData[this.wagonType].offset[2]
  //     );
  //     mainCanvas.rect(
  //       screenPos.x, screenPos.y-wagonsData[this.wagonType].dimensions[1], 
  //       wagonsData[this.wagonType].dimensions[0],
  //       wagonsData[this.wagonType].dimensions[1]
  //     );
  //   }
    
  // }
}