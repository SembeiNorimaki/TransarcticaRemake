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
  constructor(name, info) {
    this.resourceName = name;
    console.log(this.resourceName)
    this.img = resources[this.resourceName].img;
    this.qtyAvailable = info.Available;
    this.production = info.Production;
    this.sellPrice = info.Sell;
    this.buyPrice = info.Buy;
    this.inputOrOutput = info.InputOrOutput;
    this.requires = resources[this.resourceName].requires;
    this.screenPosition = createVector(0, 0);
    // this.infoPanelData = {
    //   "title": this.resourceName,
    //   "image": this.img,
    //   "lines": [
    //     `Content:`,
    //     `Weight:`,
    //   ],
    //   "buttons": ""
    // }

    this.isBuyable = this.sellPrice > 0; 
    // Manufactured resources are not bought, but manufactured in industries from other resources
    // TODO: Set this from configuration. 
    this.manufacturedOrSold = info.ManufacturedOrSold;
  } 

  generatePanelInfoData() {
    let data = {
      "title": this.resourceName,
      "image": this.img,
      "lines": [`Stored in: ${Wagon.resourceToWagon[this.resourceName]}`],
      "buttons": ""
    };

    // if the resource is manufactured, show the price and available quantity
    if (this.manufacturedOrSold == "Manufactured" && this.inputOrOutput == "Output") {
      data.buttons = ["Manufacture 1", "Manufacture Max", "Load 1", "Load Max"];
      data.lines.push("Manufacturing 1 unit requires:");
      for (let [resourceName, qty] of Object.entries(this.requires)) {
        data.lines.push(`  ${resourceName}: ${qty}`);
      }
    } 
    // if the resource is sold, show the price and available quantity
    else if (this.manufacturedOrSold == "Sold" && this.inputOrOutput == "Output"){  
      data.buttons = ["Buy 1", "Buy 5", "Buy 10", "Buy Max"];
      data.lines.push(`Unit Price: ${this.sellPrice} baks`);
      data.lines.push(`Available: ${this.qtyAvailable}`);        
    } else if (this.manufacturedOrSold == "Manufactured" && this.inputOrOutput == "Input"){  
      data.buttons = ["Unload 1", "Unload 5", "Unload 10", "Unload Max"];
    } else if (this.manufacturedOrSold == "Sold" && this.inputOrOutput == "Input"){  
      data.buttons = ["Sell 1", "Sell 5", "Sell 10", "Sell Max"];
    }

    return data;
  }

  update(resourceData) {
    this.qtyAvailable = resourceData.Available;
    this.production = resourceData.Production;
    this.sellPrice = resourceData.Sell;
    this.buyPrice = resourceData.Buy;
  }

  setPosition(screenPosition) {
    this.screenPosition = screenPosition;
  }

  checkClick(mousePos) {
    return (
      mousePos.x > this.screenPosition.x  - this.img.width/2 &&
      mousePos.x < this.screenPosition.x + this.img.width/2 &&
      mousePos.y > this.screenPosition.y - this.img.height/2 &&
      mousePos.y < this.screenPosition.y + this.img.height/2
    );
  }

  show() {
    // mainCanvas.rect(this.screenPosition.x, this.screenPosition.y, this.img.width, this.img.height)
    mainCanvas.image(this.img, this.screenPosition.x-this.img.width/2, this.screenPosition.y-this.img.height/2);
    mainCanvas.circle(this.screenPosition.x, this.screenPosition.y, 5)
    mainCanvas.text(`${this.qtyAvailable}`, this.screenPosition.x+30, this.screenPosition.y+30);
  }
}