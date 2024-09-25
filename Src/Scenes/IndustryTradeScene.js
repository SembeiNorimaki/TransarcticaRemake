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

class IndustryTradeScene extends TradeScene {
  constructor(industry) {
    super(industry.name, industryBoard);
    
    this.industry = industry;
    this.backgroundImg = this.generateBackgroundImage();

    // this.populateBuyableWagons();
    this.populateBuyableResources();
    
    // this.conversationPanel.fillData({
    //   "characterName": "Trader",
    //   "textLines": this.industry.objective.summary,
    //   "buttons": ["Yes", "No"]
    // });


    // first rail is for the produced resource
    // this.railResourceNames = [];

    // // the other rails are for required resources
    // for (let resourceName of Object.keys(this.industry.resources)) {
    //   this.railResourceNames.push(resourceName)
    // }
    // this.populateBuyableWagons();    
  }

  generateBackgroundImage() {
    let backgroundImage = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let showOptions = { 
      "outOfBoardTile": 0x00,
      "baseTile": null,
      "showTerrain": true,
      "showBuildings": false,
      "showUnits": false,
      "showWalls": false,
      "showMinimap": false
    }
    this.tileBoard.show(backgroundImage, this.camera.position, showOptions);

    // show industry
    let aux = Geometry.boardToScreen(createVector(14,21),this.camera.position, this.tileHalfSize)
    
    backgroundImage.image(
      this.industry.imgTrade,
      aux.x - this.industry.offsetTrade[0],
      aux.y - this.industry.offsetTrade[1]
    );
    
    // Bottom rails for player train
    for (let i=-1;i<30;i++) {
      if (!(i%2)) {
        Tile.draw(backgroundImage, 0x33, createVector(i*this.tileHalfSize.x, mainCanvasDim[1]-2.5*this.tileHalfSize.y), this.tileHalfSize);
      }
      else {
        Tile.draw(backgroundImage, 0x32, createVector(i*this.tileHalfSize.x, mainCanvasDim[1]-1.5*this.tileHalfSize.y), this.tileHalfSize);
      }
    }
    return backgroundImage;
  }


  populateBuyableWagons() {
    let row = 0;
    let col = 0;

    for (let [wagonName, wagonInfo] of Object.entries(this.industry.wagons)) {
      if (wagonInfo.Sell == 0) {
        continue;
      }
      let wagon;
      if (wagonName == "Merchandise") {
        wagon = new MerchandiseWagon(1, wagonName, wagonsData[wagonName], resourceName);  
      } else {
        wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
      }
      wagon.setPosition(createVector(
        1100 + col * wagon.halfSize.x*2.4 - 150*row + wagon.halfSize.x, 
        352 + row*this.tileHalfSize.y*3
      ));
      wagon.purchasePrice = wagonInfo.Sell;
      this.buyableWagons.push(wagon);
      col++;
      if (col >=3+row) {
        row++;
        col = 0;
      }

      // for (let i=0; i<resourceInfo.Qty; i++) {
      //   let wagonName = Wagon.resourceToWagon[resourceName];
      //   let wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
      //   wagon.setPos(createVector(
      //     1200 + i * wagon.halfSize.x*2 - 100*row + wagon.halfSize.x, 
      //     386 + row*tileHalfSizes.Z1.y*2
      //   ));
      //   wagon.fillWagon(resourceName);
      //   this.buyableWagons.push(wagon);
      // }
      // row++;
    }
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
        let wagon = this.horizontalTrain.wagons[wagonIdx]; 
        this.selectedTrainWagonIdx = wagonIdx;
        this.selectedBuyableResourceIdx = null;

        // check if the city buys this type of resource
        let price = "0";

        // let button = null;
        // if(wagon.cargo in this.city.resources) {
        //   price = this.city.resources[wagon.cargo].Sell
        //   button = "Sell";
        // }

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
        } else if (this.selectedTrainWagonIdx !== null) {
          console.log("selling a wagon");
          this.sellWagon();          
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
    
      // check if we clicked the industry
      let boardPos = Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize);
      let tileId = this.tileBoard.board[boardPos.y][boardPos.x].tileId;
      console.log(`Tile clicked: ${boardPos.array()} with tileId ${tileId}`);

      if (tileId == 0xFF) {
        console.log("clicked industry")
        // this.conversationPanel.active = true;
        this.infoPanel.fillData(this.industry.panelInfo);
        this.infoPanel.active = true;
      }
      else {
        // If we click anywhere else
        this.selectedBuyableWagonIdx = null;
        this.selectedTrainWagonIdx = null;
        this.infoPanel.active = false;
      }
      // let boardPos = Geometry.screenToBoard(mousePos, this.cameraPos);
      // console.log(`Tile clicked: ${boardPos.array()} with tileId ${this.tileBoard.board[boardPos.y][boardPos.x].tileId}`);
    }



  }

  // buyWagon() {
  //   let wagonName = this.buyableWagons[this.selectedBuyableWagonIdx].name;
  //   let resourceName = this.buyableWagons[this.selectedBuyableWagonIdx].cargo;
  //   // Add wagon to the train (it also updates the weight)
  //   game.playerTrain.addWagon(wagonName, 0);
  //   // Fill the wagon
  //   game.playerTrain.wagons.at(-1).fillWagon(resourceName);
  //   // Substract wagon cost from player gold
  //   game.playerTrain.gold -= this.city.resources[resourceName].Buy;
    
  //   // substract the wagon resources from the industry qty
  //   this.industry.resources[resourceName].Qty--;
  //   // deselect the removed wagon
  //   this.selectedBuyableWagonIdx = null;
  //   // hide panel
  //   this.infoPanel.active = false;

  //   // update the BuyableWagons
  //   this.populateBuyableWagons();
  // }


  sellWagon() {
    let resourceName = game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo;
    let resourceQty = game.playerTrain.wagons[this.selectedTrainWagonIdx].usedSpace;

    // Add wagon to city
    this.industry.resources[resourceName].Qty++;
    // Add selling price to player's gold
    game.playerTrain.gold += this.city.resources[resourceName].Sell;
    // Remove wagon from the train (it also updates the weight)
    game.playerTrain.removeWagon(this.selectedTrainWagonIdx);
    // deselect wagon
    this.selectedTrainWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
    
    // check if industry has enough resources to produce goods.
    // TODO: This should be in a loop, in case more than 1 wagon can be produced
    let canProduce = true;
    for (let [resourceName, requiredQty] of Object.entries(this.industry.requires)) {
      if (this.industry.resources[resourceName].Qty < requiredQty) {
        canProduce = false;
        break;
      }
    }
    if (canProduce) {
      // Add 1 wagon of the produced resource
      this.industry.resources[this.industry.produces].Qty++;
      // Substract the resources required to produce that wagon
      for (let [resourceName, requiredQty] of Object.entries(this.industry.requires)) {
        this.industry.resources[resourceName].Qty -= requiredQty;
      }
    }
    this.populateBuyableWagons();
  }

  show() {
    mainCanvas.image(this.backgroundImg, 0, 0);    
    this.trafficLight.show();
    this.horizontalTrain.show(createVector(0,0));

    // show buyable wagons
    for (let wagon of this.buyableWagons) {
      if (wagon !== null) {
        wagon.showHorizontal();
        try {
          mainCanvas.image(resources[wagon.cargo], wagon.position.x, wagon.position.y+5, 60,23)
        } catch {}
      }
    }

    for (let resource of this.buyableResources) {
      if (resource !== null) {
        resource.show();
      }
    }

    // i=0;
    // for (let resourceName of this.railResourceNames) {
    //   mainCanvas.textSize(20)
    //   mainCanvas.text(resourceName, 
    //     1100 - i*2*tileHalfSizes.Z1.x, 
    //     394 + i*tileHalfSizes.Z1.y*2 -25)
    //   i++;
    // }
    this.infoPanel.show();

    // show red debug lines
    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // let aux = Geometry.boardToScreen(createVector(14,21),this.cameraPos)
    // mainCanvas.line(0,aux.y,mainCanvasDim[0],aux.y)
    // mainCanvas.line(aux.x,0,aux.x,mainCanvasDim[1])
    // // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.line(0,750,mainCanvasDim[0],750)
    // mainCanvas.pop();

    // this.showHud();
    game.hud.show();
    this.showConversation();

    // Show Industry Name
    mainCanvas.push();
    mainCanvas.textSize(40);
    mainCanvas.fill(0)
    mainCanvas.textAlign(CENTER, CENTER)
    mainCanvas.text(this.industry.name, mainCanvasDim[0]/2, 50);
    mainCanvas.pop();
  }
}