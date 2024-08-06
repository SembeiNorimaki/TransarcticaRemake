
class CityTradeScene extends TradeScene {
  constructor(city) {
    super(city.name, gameData.cityBoard);
    this.city = city;    
    
    this.backgroundImg = this.generateBackgroundImage();
    
    this.populateBuyableWagons();
    this.populateBuyableResources();

    this.conversationPanel.fillData({
      "characterName": "Trader",
      "textLines": this.city.objective.summary
    });

    
  }
  
  // populateResourceWagons() {
  //   let row = 0;
  //   let col = 0;
  //   for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
  //     for (let i=0; i<resourceInfo.Qty; i++) {
  //       let wagonName = Wagon.resourceToWagon[resourceName];
  //       let wagon;
  //       if (wagonName == "Merchandise") {
  //         wagon = new MerchandiseWagon(1, wagonName, wagonsData[wagonName], resourceName);  
  //       } else {
  //         wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
  //       }
  //       wagon.setPos(createVector(
  //         1100 + col * wagon.halfSize.x*2.4 - 150*row + wagon.halfSize.x, 
  //         352 + row*TILE_HEIGHT_HALF*3
  //       ));
  //       wagon.fillWagon(resourceName);
  //       this.buyableWagons.push(wagon);
  //       col++;
  //       if (col >=3+row) {
  //         row++;
  //         col = 0;
  //       }
  //     }
  //   }
  // }

  populateBuyableWagons() {
    // Buyable wagons are:
    // 1) Resource Wagons
    // 2) Special Wagons
    let row = 0;
    let col = 0;
    
    // Firsts the resource wagons
    // for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
    //   for (let i=0; i<resourceInfo.Qty; i++) {
    //     let wagonName = Wagon.resourceToWagon[resourceName];
    //     let wagon;
    //     if (wagonName == "Merchandise") {
    //       wagon = new MerchandiseWagon(1, wagonName, wagonsData[wagonName], resourceName);  
    //     } else {
    //       wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
    //     }
    //     wagon.setPos(createVector(
    //       1100 + col * wagon.halfSize.x*2.4 - 150*row + wagon.halfSize.x, 
    //       352 + row*TILE_HEIGHT_HALF*3
    //     ));
    //     wagon.purchasePrice = resourceInfo.Buy;
    //     wagon.fillWagon(resourceName);
    //     this.buyableWagons.push(wagon);
    //     col++;
    //     if (col >=3+row) {
    //       row++;
    //       col = 0;
    //     }
    //   }
    // }
    
    // Then other wagons
    for (let [wagonName, wagonInfo] of Object.entries(this.city.wagons)) {
      if (wagonInfo.Sell == 0) {
        continue;
      }
      let wagon;
      if (wagonName == "Merchandise") {
        wagon = new MerchandiseWagon(1, wagonName, wagonsData[wagonName], resourceName);  
      } else {
        wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
      }
      wagon.setPos(createVector(
        1100 + col * wagon.halfSize.x*2.4 - 150*row + wagon.halfSize.x, 
        352 + row*TILE_HEIGHT_HALF*3
      ));
      wagon.purchasePrice = wagonInfo.Sell;
      this.buyableWagons.push(wagon);
      col++;
      if (col >=3+row) {
        row++;
        col = 0;
      }
    }
  }

  populateBuyableResources() {
    let row = 0;
    let col = 0;
    for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
      if (resourceInfo.Sell == 0) {
        continue;
      }
      let resource = new Resource(resourceName);
      resource.setPos(createVector(
        1100 + col * 60*2.4 - 150*row + 60, 
        352 + row*TILE_HEIGHT_HALF*3
      ));
      resource.purchasePrice = resourceInfo.Sell;
      this.buyableResources.push(resource);
      col++;
      if (col >=3+row) {
        row++;
        col = 0;
      }
    }
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
        //let wagon = this.horizontalTrain.wagons[wagonIdx]; 
        let wagon = game.playerTrain.wagons[wagonIdx]; 
        this.selectedTrainWagonIdx = wagonIdx;

        // check if the city buys this type of resource
        let price = "0";
        let button = null;
        

        // display wagon in the panel
        let infoPanelData = wagon.generatePanelInfoData();
        if(wagon.cargo in this.city.resources) {
          price = this.city.resources[wagon.cargo].Buy
          infoPanelData.lines.push(`Price: ${price} (${round(100*(price-wagon.purchasePrice)/wagon.purchasePrice)}%)`);
          infoPanelData.buttons = "Sell";
        } else {
          infoPanelData.buttons = "Sell";
        }
        
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
        } else if (this.selectedBuyableResourceIdx !== null) {
          console.log("buying a resource");
          this.buyResource();
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

          let infoPanelData = wagon.generatePanelInfoData();
          infoPanelData.lines.push(`Price: ${wagon.purchasePrice}`);
          infoPanelData.buttons = "Buy";
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

          let infoPanelData = resource.generatePanelInfoData();
          infoPanelData.lines.push(`Price: ${resource.purchasePrice} baks (full wagon)`);
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
        let resourceName = wagon.cargo;
        try {
          mainCanvas.image(resources[resourceName], wagon.position.x, wagon.position.y+5, 60,23)
        }catch{}
      }
    }

    for (let resource of this.buyableResources) {
      if (resource !== null) {
        resource.show();
      }
    }
    
    mainCanvas.image(resources.Salt,          1075+64*0, 215-32*0, 100,40)
    mainCanvas.image(resources.Caviar,        1075+64*1, 215-32*1, 100,40)
    mainCanvas.image(resources["Wolf Meat"],  1075+64*2, 215-32*2, 100,40)
    mainCanvas.image(resources.Furs,          1075+64*3, 215-32*3, 100,40)
    
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
