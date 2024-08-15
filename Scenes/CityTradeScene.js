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

class CityTradeScene extends TradeScene {
  constructor(city) {
    super(city.name, gameData.cityBoard);
    this.city = city;    
    
    this.backgroundImg = this.generateBackgroundImage();
    
    this.populateBuyableSpecialWagons();
    this.populateBuyableResources();

    this.conversationPanel.fillData({
      "characterName": "Trader",
      "textLines": this.city.objective.summary,
      "buttons": ["Yes", "No"]
    });

    
  }

  generateBackgroundImage() {
    let backgroundImage = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    this.tileBoard.showTiles(backgroundImage, this.cameraPos);

    for (let i=-1;i<30;i++) {
      if (!(i%2)) {
        Tile.draw(backgroundImage, 0x33, createVector(i*TILE_WIDTH_HALF, mainCanvasDim[1]-2.5*TILE_HEIGHT_HALF));
      }
      else {
        Tile.draw(backgroundImage, 0x32, createVector(i*TILE_WIDTH_HALF, mainCanvasDim[1]-1.5*TILE_HEIGHT_HALF));
      }
    }
    return backgroundImage;
  }

  onClick(mousePos) {    
    // check conversation panel
    if (this.conversationPanel.active) {
      let buttonIdx = this.conversationPanel.onClick(mousePos);
      console.log(buttonIdx)
      switch(buttonIdx) {
        case(1): // Accept button
          console.log("Mission accepted");
          this.acceptMission();
          
        break;
        case(2): // Reject Button
          console.log("Mission declined");
          this.conversationPanel.active = false;
        break;
      }
    }
    
    // Horizontal train
    else if (mousePos.y > 750) {
      let wagonIdx = this.horizontalTrain.onClick(mousePos);
      console.log(`Clicked wagon ${wagonIdx}`)
      if (wagonIdx !== null) {
        //let wagon = this.horizontalTrain.wagons[wagonIdx]; 
        let wagon = game.playerTrain.wagons[wagonIdx]; 
        this.selectedTrainWagonIdx = wagonIdx;
        this.selectedBuyableResourceIdx = null;

        // check if the city buys this type of resource
        let price = "0";

        // display wagon in the panel
        let infoPanelData = wagon.generatePanelInfoData();
        if(wagon.cargo in this.city.resources) {
          price = this.city.resources[wagon.cargo].Buy
          infoPanelData.lines.push(`Price: ${price} (${round(100*(price-(wagon.merchandiseValue/wagon.usedSpace))/(wagon.merchandiseValue/wagon.usedSpace))}%)`);
          infoPanelData.buttons = ["Sell"];
        } else {
          infoPanelData.buttons = [];
        }
        
        this.infoPanel.fillData(infoPanelData);
        this.infoPanel.active = true;
      }
    } 

    // Info panel
    else if (this.infoPanel.active && mousePos.x > mainCanvasDim[0]-300){
      let buttonText = this.infoPanel.onClick(mousePos);
      if (buttonText !== null) {      
        if (this.selectedBuyableWagonIdx !== null) {
          console.log("buying a wagon");
          this.buyWagon();
        } else if (this.selectedBuyableResourceIdx !== null) {
          console.log("buying a resource");
          if (buttonText == "Buy 1")
            this.buyResource(1);
          else if (buttonText == "Buy 10") {
            this.buyResource(10);
          }
        } else if (this.selectedTrainWagonIdx !==null) {
          console.log("selling a resource");
          this.sellResource();          
        }
      }      
    }
    
    // TrafficLight
    else if (this.trafficLight.checkClick(mousePos)) {
      this.exitSequence = true;
      this.horizontalTrain.gearUp();
      this.horizontalTrain.maxSpeed = 25;
      this.horizontalTrain.acceleration = 0.2;
    }

    else {
      // First check if we clicked a buyable wagon
      for (const [i,wagon] of this.buyableWagons.entries()) {
        if (wagon === null) {
          continue;
        }
        if (wagon.checkClick(mousePos)) {
          console.log(`Clicked wagon ${wagon.position.array()}`);
          this.selectedBuyableWagonIdx = i;

          let infoPanelData = wagon.generatePanelInfoData();
          infoPanelData.lines.push(`Price: ${wagon.purchasePrice}`);
          infoPanelData.buttons = ["Buy"];
          this.infoPanel.fillData(infoPanelData);
          this.infoPanel.active = true;
          return;
        }
      }
      // check if we clicked a buyable resource
      for (const [i, resource] of this.buyableResources.entries()) {
        if (resource === null) {
          continue;
        }
        if (resource.checkClick(mousePos)) {
          console.log(`Clicked resource ${resource.position.array()}`);
          this.selectedBuyableResourceIdx = i;
          this.selectedTrainWagonIdx = null;

          let infoPanelData = resource.generatePanelInfoData();
          infoPanelData.lines.push(`Unit Price: ${resource.purchasePrice} baks`);
          infoPanelData.buttons = ["Buy 1", "Buy 10"];
          this.infoPanel.fillData(infoPanelData);
          this.infoPanel.active = true;
          return;
        }
      }

    
      // check if we clicked a house
      let boardPos = screenToBoard(mousePos, this.cameraPos);
      let tileId = this.tileBoard.board[boardPos.y][boardPos.x].tileId;
      console.log(`Tile clicked: ${boardPos.array()} with tileId ${tileId}`);

      if (tileId == 0xFF) {
        this.conversationPanel.active = true;
      }


      // If we click anywhere else
      this.selectedBuyableWagonIdx = null;
      this.selectedBuyableResourceIdx = null;
      this.selectedTrainWagonIdx = null;
      this.infoPanel.active = false;

      // let boardPos = screenToBoard(mousePos, this.cameraPos);
      // console.log(`Tile clicked: ${boardPos.array()} with tileId ${this.tileBoard.board[boardPos.y][boardPos.x].tileId}`);

      // this.infoPanel.fillData(
      //   {
      //     "title": this.industry.name,
      //     "image": industryData[this.industry.name].img2,
      //     "lines": [`LINE1`, `LINE2`, `LINE3`],
      //     "buttons": "Buy",
      //   }
      // )
      // this.infoPanel.active = true;
    }



  }

  show() {
    mainCanvas.image(this.backgroundImg, 0, 0);    
    this.trafficLight.show();
    this.horizontalTrain.show(createVector(0,0));

    for (let wagon of this.buyableWagons) {
      if (wagon !== null) {
        wagon.showHorizontal();
      }
    }

    for (let resource of this.buyableResources) {
      if (resource !== null) {
        resource.show();
      }
    }
    
    this.infoPanel.show();

    // show red debug lines
    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.line(0,750,mainCanvasDim[0],750)
    // mainCanvas.pop();

    game.hud.show();
    this.showConversation();

    // Show City Name
    mainCanvas.push();
    mainCanvas.textSize(40);
    mainCanvas.fill(0)
    mainCanvas.textAlign(CENTER, CENTER)
    mainCanvas.text(this.city.name, mainCanvasDim[0]/2, 50);
    mainCanvas.pop();
  }
}
