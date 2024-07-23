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
    this.city = citiesData[locationName]
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
    this.horizontalTrain.setPosition(createVector(1400, 800+20));
    this.horizontalTrain.setVelocity(0);
  }
  
  populateBuyableWagons() {
    let row = 0;
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
    // Add selling price to player's gold
    game.playerTrain.gold += this.city.resources[game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo].Sell;
    // Remove wagon from the train (it also updates the weight)
    game.playerTrain.removeWagon(this.selectedTrainWagonIdx);
    // deselect wagon
    this.selectedTrainWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
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


  showHud() {
    let x = hudCanvasDim[0] - 80;
    let y = hudCanvasDim[1] / 2;

    hudCanvas.image(hudData.fuel, x, y);
    hudCanvas.text(`${int(game.playerTrain.fuel)}`, x, y);
    x-=140;
    hudCanvas.image(hudData.gold, x, y);
    hudCanvas.text(`${game.playerTrain.gold}`, x, y);
    x-=140;
    hudCanvas.image(hudData.frame, x, y);
  }
}

class CityTradeScene extends TradeScene {
  constructor(city) {
    super(city.name, cityBoard);
    this.city = city;    
    
    this.backgroundImg = this.generateBackgroundImage();
    this.populateBuyableWagons();
  }

  showConversation() {
    this.conversationPanel.fillData({
      "characterName": "Yuri",
      "textLines": ["a", "bb", "ccc"]
    });
    this.conversationPanel.show();
  }

  // showConversation() {
  //   mainCanvas.push();
  //   mainCanvas.fill(255,255,255,200);
  //   mainCanvas.noStroke();
  //   mainCanvas.rect(0,mainCanvasDim[1]-200,mainCanvasDim[0],200);
  //   mainCanvas.image(charactersData.Trader,0,mainCanvasDim[1]-200);
  //   mainCanvas.fill(0);
  //   mainCanvas.textSize(24);
  //   let y = mainCanvasDim[1] - 150;
  //   for (let line of this.city.objective.summary) {
  //     mainCanvas.text(line, 250, y);
  //     y += 40;
  //   }
    
  //   mainCanvas.fill(0x93, 0xDC, 0x5C);
  //   mainCanvas.rect(mainCanvasDim[0]-220, mainCanvasDim[1]-190, 200, 80);
  //   mainCanvas.fill(0xAE, 0x4D, 0x4D);
  //   mainCanvas.rect(mainCanvasDim[0]-220, mainCanvasDim[1]-90, 200, 80);
  //   mainCanvas.fill(0);
  //   mainCanvas.textAlign(CENTER, CENTER);
  //   mainCanvas.textSize(28);
  //   mainCanvas.text("Accept", mainCanvasDim[0]-220+100, mainCanvasDim[1]-190+40);
  //   mainCanvas.text("Decline", mainCanvasDim[0]-220+100, mainCanvasDim[1]-90+40);
    
  //   mainCanvas.pop();
  // }



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

    
    // Horizontal train
    if (mousePos.y > 750) {
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
          return;
        }
      }

      // Then check if we clicked the TrafficLight
      if (this.trafficLight.checkClick(mousePos)) {
        this.exitSequence = true;
        this.horizontalTrain.gearUp();
        this.horizontalTrain.maxSpeed = 25;
        this.horizontalTrain.acceleration = 0.2;
        return;
      }

      // check if we clicked a house
      let boardPos = screenToBoard(mousePos, this.cameraPos);
      let tileId = this.tileBoard.board[boardPos.y][boardPos.x].tileId;
      console.log(`Tile clicked: ${boardPos.array()} with tileId ${tileId}`);

      if (tileId == 0xFF) {

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

    this.showHud();

    this.showConversation();
  }
}

class IndustryTradeScene extends TradeScene {
  constructor(locationName) {
    super(locationName, industryBoard);
    
    this.backgroundImg = this.generateBackgroundImage();
    this.populateBuyableWagons();
  }

  generateBackgroundImage() {
    let backgroundImage = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    this.tileBoard.showTiles(backgroundImage, this.cameraPos);

    // show industry
    let aux = boardToScreen(createVector(14,21),this.cameraPos)
    let industryName = "Oil"
    // backgroundImage.image(
    //   industryData[industryName].imgTrade,
    //   aux.x - industryData[industryName].offsetTrade[0],
    //   aux.y - industryData[industryName].offsetTrade[1]);
    // Tile.draw(backgroundImage, 0xC5, boardToScreen(createVector(14,21),this.cameraPos))
    //Tile.draw(backgroundImage, 0xC1, boardToScreen(createVector(14,23),this.cameraPos))
    // Tile.draw(backgroundImage, 0xC3, boardToScreen(createVector(14,21),this.cameraPos))

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
    // Horizontal train
    if (mousePos.y > 750) {
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
          return;
        }
      }

      // Then check if we clicked the TrafficLight
      if (this.trafficLight.checkClick(mousePos)) {
        this.exitSequence = true;
        this.horizontalTrain.gearUp();
        this.horizontalTrain.maxSpeed = 25;
        this.horizontalTrain.acceleration = 0.2;
        return;
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
    // let aux = boardToScreen(createVector(14,21),this.cameraPos)
    // mainCanvas.line(0,aux.y,mainCanvasDim[0],aux.y)
    // mainCanvas.line(aux.x,0,aux.x,mainCanvasDim[1])
    // // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.line(0,750,mainCanvasDim[0],750)
    // mainCanvas.pop();

    this.showHud();
  }
}