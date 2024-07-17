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

class InfoPanel {
  constructor(selectedObject) {
    this.selectedObject = industryData["Chemical"];

    this.buttons = {};
    this.buttons.Buy = new ClickableRegion(createVector(mainCanvasDim[0]-150, 500), createVector(80, 30), null, "Buy 1 wagon",null);
    this.buttons.Sell = new ClickableRegion(createVector(mainCanvasDim[0]-150, 500), createVector(80, 30), null, "Sell",null);
    this.buttons.Close = new ClickableRegion(createVector(mainCanvasDim[0]-150, 500), createVector(80, 30), null, "Close",null);

    this.title = "";
    this.image = null;
    this.lines = [""];
    this.activeButton = null;

    this.active = false;
    this.activeButtons = [];
  }

  fillData(data) {
    console.log(data)
    this.title = data.title;
    this.image = data.image;
    this.lines = data.lines;
    this.activeButton = data.buttons;

    this.active = true;
  }

  onClick(mousePos) {
    if (this.activeButton !== null) {
      return this.buttons[this.activeButton].checkClick(mousePos);
    } else {
      return {};
    }
  }

  show() {
    if (!this.active) {
      return;
    }
    let texty = 220;
    mainCanvas.push();
    mainCanvas.fill(255,255,255,200);
    mainCanvas.textSize(20);
    mainCanvas.textAlign(CENTER, CENTER);
    mainCanvas.imageMode(CENTER)
    mainCanvas.rect(mainCanvasDim[0]-300,0,300,mainCanvasDim[1]-300);
    
    mainCanvas.image(this.image, mainCanvasDim[0]-150, 100, this.image.width, this.image.height);
    
    mainCanvas.fill(0);
    mainCanvas.text(this.title, mainCanvasDim[0]-150, texty);
    mainCanvas.textAlign(LEFT)
    texty += 50;
    mainCanvas.textAlign(LEFT, CENTER);
    for (let line of this.lines) {
      mainCanvas.text(line, mainCanvasDim[0]-250, texty);  
      texty += 50;
    }
    
    // mainCanvas.text(`Unit Price: ${resourceData[this.selectedObject.resourceName].price}`, width-380, texty);
    // texty += 50;
    // mainCanvas.text(`Train capacity: ${train.usedSpace[this.selectedObject.resourceName]} / ${train.capacity[this.selectedObject.resourceName]}`, width-380, texty);
    // texty += 50;

    mainCanvas.pop();
    if (this.activeButton !== null) {
      this.buttons[this.activeButton].showText();      
    }    
  }


  showTradeWindow(canvas, train) {
    let texty = 220;
    mainCanvas.push();
    mainCanvas.fill(255,255,255,100);
    mainCanvas.rect(canvas.width-200, canvas.height/2-125, 400, canvas.height-250);
    mainCanvas.noFill()
    mainCanvas.textSize(20);
    mainCanvas.fill(0);

    if (this.selectedObjectType == "wagon") {
      this.selectedObject.showHorizontal2(canvas, createVector(canvas.width-200-this.selectedObject.halfSize[0], 90));
      mainCanvas.text(`Name: ${this.selectedObject.name}`, canvas.width-380, texty);
      texty += 50;
      mainCanvas.text(`Resource: ${this.selectedObject.resourceName}`, canvas.width-380, texty);
      texty += 50;
      //canvas.text(`Capacity: ${this.selectedObject.capacity} ${this.selectedObject.units}`, width-380, 250);  
      //canvas.text(`Tare Weight: ${this.selectedObject.weight} tons`, width-380, 300);
      mainCanvas.text(`Quantity: ${this.selectedObject.usedSpace} / ${this.selectedObject.capacity} ${this.selectedObject.units}`,width-380, texty);
      texty += 50;

      // Selling price:
      // If the city needs it: double price
      // If the city produces it: half price
      // Otherwise: 110% of normal price
      let sellingPrice = this.calculateSellingPrice(this.selectedObject.resourceName);
      // if (this.selectedObject.resourceName in this.needs) {
      //   console.log("The city needs this resource");
      //   sellingPrice = int(resourceData[this.selectedObject.resourceName].price * 2);
      // } else if (this.selectedObject.resourceName === this.industry.resourceName) {
      //   console.log("The city produces this resource");
      //   sellingPrice = int(resourceData[this.selectedObject.resourceName].price * 0.5);        
      // } else {
      //   sellingPrice = int(resourceData[this.selectedObject.resourceName].price * 1.1);          
      // }

      mainCanvas.text(`Selling Price: ${sellingPrice}`,width-380, texty);
      texty += 50;
      this.activeButtons = [this.buttons.sell, this.buttons.close];
    } else if (this.selectedObjectType == "industry") {
      mainCanvas.image(this.selectedObject.img, width-200, 120, this.selectedObject.img.width/3, this.selectedObject.img.height/3);
      mainCanvas.textAlign(CENTER, CENTER);
      //canvas.textSize(26)
      mainCanvas.text(`${this.selectedObject.industryName}`,width-200, texty);
      texty += 50;
      mainCanvas.textAlign(LEFT, CENTER);
      mainCanvas.text(`Production: ${this.selectedObject.resourceName}`, width-380, texty);
      texty += 50;
      mainCanvas.text(`Available: ${this.industryAvailableQty} ${this.industry.units}`, width-380, texty);
      texty += 50;
      mainCanvas.text(`Min qty: ${this.industry.minQty} ${this.industry.units}`, width-380, texty);
      texty += 50;
      mainCanvas.text(`Unit Price: ${resourceData[this.selectedObject.resourceName].price}`, width-380, texty);
      texty += 50;
      mainCanvas.text(`Train capacity: ${train.usedSpace[this.selectedObject.resourceName]} / ${train.capacity[this.selectedObject.resourceName]}`, width-380, texty);
      texty += 50;
      this.activeButtons = [this.buttons.buy, this.buttons.close];
    } else if (this.selectedObjectType == "house") {
      mainCanvas.image(this.selectedObject.img, width-200, 100);  
      mainCanvas.textAlign(CENTER, CENTER);
      //canvas.textSize(26)
      mainCanvas.text(`${this.cityData.name}`,width-200, texty);
      texty += 50;
      mainCanvas.textAlign(LEFT, CENTER);
      mainCanvas.text(`City needs:`, width-380, texty);
      texty += 30;
      for(const [key, val] of Object.entries(this.needs)) {
        if (this.fulfilled[key] >= val)
          mainCanvas.fill("green");
        else
          mainCanvas.fill("black");
        
        mainCanvas.text(`    ${key}: ${this.fulfilled[key]} / ${val}`, width-380, texty);
        texty += 30;  
      }
      texty += 20;  
      
      //canvas.text(`Reward: ${this.cityData.reward}`, width-380, texty);
      
      //this.activeButtons = [this.buttons.buy];
      
    }
    mainCanvas.fill(255,0,0);
    mainCanvas.text(this.errorMsg, width-380, texty);
    mainCanvas.fill(0);

    for (let button of this.activeButtons) {
      button.showText();
    }
    mainCanvas.pop();

  }
}