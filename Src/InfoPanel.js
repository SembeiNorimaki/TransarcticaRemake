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
    this.selectedObject = industriesInfo["Chemical"];

    // this.buttons = {};
    // this.buttons.Buy = new ClickableRegion(createVector(mainCanvasDim[0]-150, 500), createVector(80, 30), null, "Buy",null);
    // this.buttons.Sell = new ClickableRegion(createVector(mainCanvasDim[0]-150, 500), createVector(80, 30), null, "Sell",null);
    // this.buttons.Close = new ClickableRegion(createVector(mainCanvasDim[0]-150, 500), createVector(80, 30), null, "Close",null);

    this.title = "";
    this.image = null;
    this.lines = [""];
    this.buttons = [];

    this.active = false;
   
  }

  fillData(data) {
    console.log(data)
    this.title = data.title;
    this.image = data.image;
    this.lines = data.lines;
    let x = 60;
    this.buttons = [];
    let buttonPositions = [
      createVector(mainCanvasDim[0]-210,     500),
      createVector(mainCanvasDim[0]-210+120, 500),
      createVector(mainCanvasDim[0]-210,     440),
      createVector(mainCanvasDim[0]-210+120, 440),
    ];
    for (let [i, buttonText] of data.buttons.entries()) {
      this.buttons.push(new ClickableRegion(buttonPositions[i], createVector(50, 25), null, buttonText, null));
      
    }
  }

  onClick(mousePos) {
    for (let button of this.buttons) {
      if (button.checkClick(mousePos)) {
        return button.text;
      }
    }
    return null;

    // if (this.activeButton !== null) {
    //   return this.buttons[this.activeButton].checkClick(mousePos);
    // } else {
    //   return {};
    // }
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
      texty += 34;
    }
    mainCanvas.pop();
    
    for (let button of this.buttons) {
      button.showText();
    }
  }
}