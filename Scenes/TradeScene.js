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

class TradeScene {
  constructor(locationName, board) {
    //TODO: this is a hack, fix this mess
    console.log(locationName)
    if (locationName in citiesData) 
      this.city = citiesData[locationName]
    else
      this.city = industriesData[locationName]
     
    this.locationName = locationName;
    this.tileBoard = new TileBoard(board);
    this.infoPanel = new InfoPanel();
    this.conversationPanel = new ConversationPanel();

    this.enterSequence = true;
    this.exitSequence = false;
    this.cameraPos = boardToCamera(createVector(15,15));
    this.trafficLight = new TrafficLight(
      createVector(mainCanvasDim[0]-60, mainCanvasDim[1]-180), 
      [trafficLightData.green, trafficLightData.red], 
      createVector(50, 50)
    );
    this.clickableObjects = [];
    this.wagonRowsResources = [];

    this.selectedBuyableWagonIdx = null;
    this.selectedTrainWagonIdx = null;

    this.buyableWagons = [];
  }

  initialize() {
    this.horizontalTrain = new HorizontalTrain("Player", game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(0, 800));
    this.horizontalTrain.setVelocity(20);
  }
  
  populateBuyableWagons() {
    let row = 0;
    console.log(this.city)
    for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
      for (let i=0; i<resourceInfo.Qty; i++) {
        let wagonName = resourceToWagon[resourceName];
        let wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
        wagon.setPos(createVector(
          1200 + i * wagon.halfSize.x*2 - 100*row + wagon.halfSize.x, 
          386 + row*TILE_HEIGHT_HALF*2
        ));
        wagon.fillWagon();
        this.buyableWagons.push(wagon);
      }
      row++;
    }
  }

  buyWagon() {
    // Add wagon to the train (it also updates the weight)
    game.playerTrain.addWagon(this.buyableWagons[this.selectedBuyableWagonIdx].name, 0);
    // Fill the wagon
    game.playerTrain.wagons.at(-1).fillWagon();
    // Substract wagon cost from player gold
    game.playerTrain.gold -= this.city.resources[this.buyableWagons[this.selectedBuyableWagonIdx].cargo].Buy;
    // remove the wagon from the city
    this.buyableWagons[this.selectedBuyableWagonIdx] = null;
    // deselect the removed wagon
    this.selectedBuyableWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
  }

  sellWagon() {
    let resourceName = game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo;
    let resourceQty = game.playerTrain.wagons[this.selectedTrainWagonIdx].usedSpace;

    // Add selling price to player's gold
    game.playerTrain.gold += this.city.resources[resourceName].Sell;
    // Remove wagon from the train (it also updates the weight)
    game.playerTrain.removeWagon(this.selectedTrainWagonIdx);
    // deselect wagon
    this.selectedTrainWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
    // update objectives
    this.city.objective.updateResource(resourceName, resourceQty);
    // if (resourceName in this.city.objective.resources) {
    //   this.city.objective.resources[resourceName].delivered += resourceQty;
    // }
  }

  // Move train left and right
  processKey(key) {
    if (key == "ArrowLeft") {
      this.horizontalTrain.gearDown();
    } else if (key == "ArrowRight") {
      this.horizontalTrain.gearUp();
    }
  }

  update() {
    // Enter sequence
    if (this.enterSequence && this.horizontalTrain.position.x > 1100) {
      if (this.horizontalTrain.velocity > 0)
        this.horizontalTrain.acceleration = -0.2;
      else {
        this.horizontalTrain.acceleration = 0;
        this.horizontalTrain.velocity = 0;
        this.enterSequence = false;
      }
    }

    // Exit sequence
    if (this.exitSequence && this.horizontalTrain.wagons.at(-1).position.x > mainCanvasDim[0]+200) {
      game.currentScene = game.navigationScene;
    }

    this.horizontalTrain.update();
  }


  // showHud() {
  //   let x = hudCanvasDim[0] - 80;
  //   let y = hudCanvasDim[1] / 2;


  //   //hudCanvas.image(hudData.frame, 100, y);
  //   hudCanvas.image(hudData.quest, 100, y);
    

  //   hudCanvas.image(hudData.fuel, x, y);
  //   hudCanvas.text(`${int(game.playerTrain.fuel)}`, x, y);
  //   x-=140;
  //   hudCanvas.image(hudData.gold, x, y);
  //   hudCanvas.text(`${game.playerTrain.gold}`, x, y);
  //   x-=140;
  //   hudCanvas.image(hudData.frame, x, y);

  // }
}

class CityTradeScene extends TradeScene {
  constructor(city) {
    super(city.name, cityBoard);
    this.city = city;    
    
    this.backgroundImg = this.generateBackgroundImage();
    this.populateBuyableWagons();

    this.conversationPanel.fillData({
      "characterName": "Trader",
      "textLines": this.city.objective.summary
    });
  }

  showConversation() {
    this.conversationPanel.show();
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

  acceptMission() {
    game.objectives.push(this.city.objective);
    this.conversationPanel.active = false;
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

        // check if the city buys this type of resource
        let price = "N/A";
        let button = null;
        if(wagon.cargo in this.city.resources) {
          price = this.city.resources[wagon.cargo].Sell
          button = "Sell";
        }

        // display wagon in the panel
        let infoPanelData = wagon.infoPanelData;
        infoPanelData.lines.push(`Price: ${price}`);
        infoPanelData.buttons = button;
        this.infoPanel.fillData(infoPanelData);
        this.infoPanel.active = true;
      }
    } 

    // Info panel
    else if (this.infoPanel.active && mousePos.x > mainCanvasDim[0]-300){
      let buttonClicked = this.infoPanel.onClick(mousePos);
      if (buttonClicked) {
        if (this.selectedBuyableWagonIdx !== null) {
          console.log("buying a wagon");
          this.buyWagon();
        } else if (this.selectedTrainWagonIdx !==null) {
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

          let infoPanelData = wagon.infoPanelData;
          infoPanelData.lines.push(`Price: ${this.city.resources[wagon.cargo].Buy}`);
          infoPanelData.buttons = "Buy";
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

    let i=0;
    for (let wagon of this.buyableWagons) {
      if (wagon !== null) {
        wagon.showHorizontal();
        i++;
      }
    }
    i=0;
    for (let [resourceName, val] of Object.entries(this.city.resources)) {
      mainCanvas.textSize(20)
      mainCanvas.text(resourceName, 
        1100 - i*2*TILE_WIDTH_HALF, 
        394 + i*TILE_HEIGHT_HALF*2 -25)
      i++;
    }
    this.infoPanel.show();

    // show red debug lines
    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.line(0,750,mainCanvasDim[0],750)
    // mainCanvas.pop();

    //this.showHud();
    game.hud.show();
    this.showConversation();

    mainCanvas.push();
    mainCanvas.textSize(40);
    mainCanvas.fill(0)
    mainCanvas.textAlign(CENTER, CENTER)
    mainCanvas.text(this.city.name, mainCanvasDim[0]/2, 50);
    mainCanvas.pop();
  }
}

class IndustryTradeScene extends TradeScene {
  constructor(industry) {
    super(industry.name, industryBoard);
    
    this.industry = industry;
    this.backgroundImg = this.generateBackgroundImage();
    this.populateBuyableWagons();

    // this.conversationPanel.fillData({
    //   "characterName": "Trader",
    //   "textLines": this.city.objective.summary
    // });
    console.log(industriesInfo)
    console.log(this.industry.name)
    
    
  }

  generateBackgroundImage() {
    let backgroundImage = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    this.tileBoard.showTiles(backgroundImage, this.cameraPos);

    // show industry
    let aux = boardToScreen(createVector(14,21),this.cameraPos)
    // let industryName = "Oil"
    backgroundImage.image(
      industriesInfo[this.industry.resourceName].imgTrade,
      aux.x - industriesInfo[this.industry.resourceName].offsetTrade[0],
      aux.y - industriesInfo[this.industry.resourceName].offsetTrade[1]
    );
    // Tile.draw(backgroundImage, 0xC5, boardToScreen(createVector(14,21),this.cameraPos))
    //Tile.draw(backgroundImage, 0xC1, boardToScreen(createVector(14,23),this.cameraPos))
    // Tile.draw(backgroundImage, 0xC3, boardToScreen(createVector(14,21),this.cameraPos))

    //mainCanvas.image(this.industriesInfo[this.industry.resourceName].imgTrade,0,0)
    
    // Bottom rails for player train
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
        let wagon = this.horizontalTrain.wagons[wagonIdx]; 
        this.selectedTrainWagonIdx = wagonIdx;

        // check if the city buys this type of resource
        let price = "N/A";
        let button = null;
        if(wagon.cargo in this.city.resources) {
          price = this.city.resources[wagon.cargo].Sell
          button = "Sell";
        }

        // display wagon in the panel
        let infoPanelData = wagon.infoPanelData;
        infoPanelData.lines.push(`Price: ${price}`);
        infoPanelData.buttons = button;
        this.infoPanel.fillData(infoPanelData);
        this.infoPanel.active = true;
      }
    } 

    // Info panel
    else if (this.infoPanel.active && mousePos.x > mainCanvasDim[0]-300){
      let buttonClicked = this.infoPanel.onClick(mousePos);
      if (buttonClicked) {
        if (this.selectedBuyableWagonIdx !== null) {
          console.log("buying a wagon");
          this.buyWagon();
        } else if (this.selectedTrainWagonIdx !==null) {
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

          let infoPanelData = wagon.infoPanelData;
          infoPanelData.lines.push(`Price: ${this.city.resources[wagon.cargo].Buy}`);
          infoPanelData.buttons = "Buy";
          this.infoPanel.fillData(infoPanelData);
          this.infoPanel.active = true;
          return;
        }
      }

    
      // check if we clicked the industry
      let boardPos = screenToBoard(mousePos, this.cameraPos);
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
      // let boardPos = screenToBoard(mousePos, this.cameraPos);
      // console.log(`Tile clicked: ${boardPos.array()} with tileId ${this.tileBoard.board[boardPos.y][boardPos.x].tileId}`);
    }



  }

  show() {
    mainCanvas.image(this.backgroundImg, 0, 0);    
    this.trafficLight.show();
    this.horizontalTrain.show(createVector(0,0));

    let i=0;
    for (let wagon of this.buyableWagons) {
      if (wagon !== null) {
        wagon.showHorizontal();
        i++;
      }
    }
    i=0;
    for (let [resourceName, val] of Object.entries(this.city.resources)) {
      mainCanvas.textSize(20)
      mainCanvas.text(resourceName, 
        1100 - i*2*TILE_WIDTH_HALF, 
        394 + i*TILE_HEIGHT_HALF*2 -25)
      i++;
    }
    this.infoPanel.show();

    // show red debug lines
    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // let aux = boardToScreen(createVector(14,21),this.cameraPos)
    // mainCanvas.line(0,aux.y,mainCanvasDim[0],aux.y)
    // mainCanvas.line(aux.x,0,aux.x,mainCanvasDim[1])
    // // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.line(0,750,mainCanvasDim[0],750)
    // mainCanvas.pop();

    // this.showHud();
    game.hud.show();
    mainCanvas.push();
    mainCanvas.textSize(40);
    mainCanvas.fill(0)
    mainCanvas.textAlign(CENTER, CENTER)
    mainCanvas.text(this.industry.name, mainCanvasDim[0]/2, 50);
    mainCanvas.pop();
  }
}