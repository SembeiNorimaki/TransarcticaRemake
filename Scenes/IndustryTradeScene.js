
class IndustryTradeScene extends TradeScene {
  constructor(industry) {
    super(industry.name, industryBoard);
    
    this.industry = industry;
    this.backgroundImg = this.generateBackgroundImage();
    
    // first rail is for the produced resource
    this.railResourceNames = [];

    // the other rails are for required resources
    for (let resourceName of Object.keys(this.industry.resources)) {
      this.railResourceNames.push(resourceName)
    }
    this.populateBuyableWagons();    
  }

  populateBuyableWagons() {
    this.buyableWagons = [];
    let row = 0;
    for (let [resourceName, resourceInfo] of Object.entries(this.industry.resources)) {
      for (let i=0; i<resourceInfo.Qty; i++) {
        let wagonName = Wagon.resourceToWagon[resourceName];
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

  generateBackgroundImage() {
    let backgroundImage = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    this.tileBoard.showTiles(backgroundImage, this.cameraPos);

    // show industry
    let aux = boardToScreen(createVector(14,21),this.cameraPos)
    
    backgroundImage.image(
      this.industry.imgTrade,
      aux.x - this.industry.offsetTrade[0],
      aux.y - this.industry.offsetTrade[1]
    );
    
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

  buyWagon() {
    let wagonName = this.buyableWagons[this.selectedBuyableWagonIdx].name;
    let resourceName = this.buyableWagons[this.selectedBuyableWagonIdx].cargo;
    // Add wagon to the train (it also updates the weight)
    game.playerTrain.addWagon(wagonName, 0);
    // Fill the wagon
    game.playerTrain.wagons.at(-1).fillWagon();
    // Substract wagon cost from player gold
    game.playerTrain.gold -= this.city.resources[resourceName].Buy;
    
    // substract the wagon resources from the industry qty
    this.industry.resources[resourceName].Qty--;
    // deselect the removed wagon
    this.selectedBuyableWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;

    // update the BuyableWagons
    this.populateBuyableWagons();
  }

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
    let i=0;
    for (let wagon of this.buyableWagons) {
      if (wagon !== null) {
        wagon.showHorizontal();
        i++;
      }
    }

    i=0;
    for (let resourceName of this.railResourceNames) {
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