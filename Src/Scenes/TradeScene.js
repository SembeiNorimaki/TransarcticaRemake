// non scrollable scene
class TradeScene {
  constructor(city) {
    this.city = city;
    this.tileHalfSize = tileHalfSizes.Z2;
    this.camera = new Camera(createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2))

    this.backgroundImg = this.populateBackgroundImg();
    this.enterSequence = true;
    this.exitSequence = false;
    this.conversationPanel = new ConversationPanel();
    
    this.infoPanel = new InfoPanel();
    this.trafficLight = new TrafficLight(createVector(23, -3));

    this.buyableWagons = [];



    this.wagonLocations = [
      createVector(12, -3),
      createVector(14, -5),

      createVector(13, 0),
      createVector(15, -2),
      createVector(17, -4),

      createVector(14, 3),
      createVector(16, 1),
      createVector(18, -1),
      createVector(20, -3)
    ];


    // for (let i=0; i<this.resourceLocations.length; i++) {
    //   // this.buyableResources.push(null);
    //   this.buyableWagons.push(null);
    // }

    // this.populateBuyableResources();
    // this.populateBuyableResourceWagons();
    // this.populateBuyableSpecialWagons();

    this.selectedBuyableWagonIdx = null;
    this.selectedBuyableResourceName = null;
    this.selectedTrainWagonIdx = null;

  }
  


  // Initialized the HorizontalTrain
  initialize() {
    this.horizontalTrain = new HorizontalTrain(Game.Players.Human, game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(11.5, 12));
    this.horizontalTrain.setVelocity(0.2);
  }

  // Populate functions

  // Generates a background image containing the Floor tiles, buildings and rails
  populateBackgroundImg() {
    let img = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let nCols = 16;
    let nRows = 16;
    let x, y;
    for (let row=0; row<nRows; row++) {
      y = row * this.tileHalfSize.y*2;
      for (let col=0;col<nCols; col++) {
        x = col * this.tileHalfSize.x*2;
        Tile.draw(img, 0x01, createVector(x,y), this.tileHalfSize)
        Tile.draw(img, 0x01, createVector(x+this.tileHalfSize.x, y+this.tileHalfSize.y), this.tileHalfSize)
      }
    }

    // bottom rail
    y = 12 * this.tileHalfSize.y*2;
    for (let col=0;col<nCols; col++) {
      x = col * this.tileHalfSize.x*2;
      Tile.draw(img, 0x32, createVector(x,y), this.tileHalfSize);
      Tile.draw(img, 0x33, createVector(x+this.tileHalfSize.x,y-this.tileHalfSize.y), this.tileHalfSize);
    }

    // Resource plattoforms only if the city sells resources and if its a city
    // if (Object.keys(this.city.resources).length > 0 && this.city.constructor.name == "City") {  
    //   for (let y=-6; y<=4; y++) {
    //     Tile.draw(img, 0x4C, Geometry.boardToScreen(createVector(13,y), this.camera.position, this.tileHalfSize), this.tileHalfSize);
    //   }
    // }

    // // Wagon rails only if the city sells wagons
    // if (Object.keys(this.city.wagons).length > 0) {
    //   let row;
    //   for (let col=10; col<=19; col++) {
    //     row = 10-col
    //     Tile.draw(img, 0x32, Geometry.boardToScreen(createVector(col,row), this.camera.position, this.tileHalfSize), this.tileHalfSize);
    //     Tile.draw(img, 0x33, Geometry.boardToScreen(createVector(col,row-1), this.camera.position, this.tileHalfSize), this.tileHalfSize);

    //     Tile.draw(img, 0x32, Geometry.boardToScreen(createVector(col+2,row+2), this.camera.position, this.tileHalfSize), this.tileHalfSize);
    //     Tile.draw(img, 0x33, Geometry.boardToScreen(createVector(col+2,row+2-1), this.camera.position, this.tileHalfSize), this.tileHalfSize);

    //     Tile.draw(img, 0x32, Geometry.boardToScreen(createVector(col+4,row+4), this.camera.position, this.tileHalfSize), this.tileHalfSize);
    //     Tile.draw(img, 0x33, Geometry.boardToScreen(createVector(col+4,row+4-1), this.camera.position, this.tileHalfSize), this.tileHalfSize);
    //   }
    // }


    for (let building of this.city.buildings) {
      //Tile.draw(img, 0xA1, Geometry.boardToScreen(building.position, this.camera.position, this.tileHalfSize), this.tileHalfSize);
      building.show(img, this.camera.position)
    }

    // Input zones
    img.beginShape();
    let aux;
    for (let pos of [[7.5, 4.5], [13.5, 4.5], [13.5, 7.5], [7.5, 7.5]]) {
      aux = Geometry.boardToScreen(createVector(pos[0], pos[1]), this.camera.position, this.tileHalfSize);
      img.vertex(aux.x, aux.y);
    }
    img.endShape(CLOSE);

    // Output zones
    img.beginShape();
    for (let pos of [[14.5, -2.5], [14.5, 3.5], [17.5, 3.5], [17.5, -2.5]]) {
      let aux = Geometry.boardToScreen(createVector(pos[0], pos[1]), this.camera.position, this.tileHalfSize);
      img.vertex(aux.x, aux.y);
    }
    img.endShape(CLOSE);

    // Arrows
    aux = Geometry.boardToScreen(createVector(13.5, 3), createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize);
    img.image(arrowImg.SE, aux.x,aux.y);    
    aux = Geometry.boardToScreen(createVector(13.5, 1), createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize);
    img.image(arrowImg.SE, aux.x,aux.y);    
    aux = Geometry.boardToScreen(createVector(13.5, -1), createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize);
    img.image(arrowImg.SE, aux.x,aux.y);    
    aux = Geometry.boardToScreen(createVector(12.5, 4), createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize);
    img.image(arrowImg.NE, aux.x,aux.y);
    aux = Geometry.boardToScreen(createVector(10.5, 4), createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize);
    img.image(arrowImg.NE, aux.x,aux.y);
    aux = Geometry.boardToScreen(createVector(8.5, 4), createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize);
    img.image(arrowImg.NE, aux.x,aux.y);

    return img;
  }

  // populateBuyableResources() {
  //   let idx = 0;
  //   this.buyableResources = [];
  //   for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
  //     if (resourceInfo.Available == 0) {
  //       continue;
  //     }
  //     let resource = new Resource(resourceName, resourceInfo);
  //     resource.setPosition(Geometry.boardToScreen(this.resourceLocations[idx], this.camera.position, this.tileHalfSize));
  //     this.buyableResources.push(resource);
  //     idx++;      
  //   }
  // }

  // populateBuyableResourceWagons() {
  //   let idx = 0;
  //   for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
  //     if (resourceInfo.Available == 0) {
  //       continue;
  //     }
  //     let wagonName = Wagon.resourceToWagon[resourceName];
  //     let wagon;
  //     if (wagonName == "Merchandise") {
  //       wagon = new MerchandiseWagon(1, wagonName, wagonsData[wagonName], resourceName);  
  //     } else {
  //       wagon = new Wagon(1, wagonName, wagonsData[wagonName], this.owner);
  //     }
  //     wagon.setPosition(this.resourceLocations[idx]);
  //     wagon.purchasePrice = resourceInfo.Sell;
  //     wagon.fillWagon(resourceName);
  //     this.buyableWagons.push(wagon);
  //     idx++;
  //   }
  // }
    
  populateBuyableSpecialWagons() {
    let idx = 0;
    for (let [wagonName, wagonInfo] of Object.entries(this.city.wagons)) {
      if (wagonInfo.Sell == 0) {
        continue;
      }
      let wagon;
      console.log(wagonName)
      if (wagonName == "Merchandise") {
        wagon = new MerchandiseWagon(1, wagonName, wagonsData[wagonName], "");  
      } else {
        wagon = new Wagon(1, wagonName, wagonsData[wagonName], this.owner);
      }
      wagon.setPosition(this.wagonLocations[idx]);
      wagon.purchasePrice = wagonInfo.Sell;
      this.buyableWagons.push(wagon);
      idx++;
    }
  }

  showConversation() {
    if (this.conversationPanel !== null) {
      this.conversationPanel.show();
    }
  }

  acceptMission() {
    // TODO: change to objectives
    game.objectives.push(this.city.objectives[0]);
    this.conversationPanel.active = false;
  }

  displayError(text) {
    this.conversationPanel.fillData({
      "characterName": "Yuri",
      "textLines": [text],
      "buttons": [{"id": "Close", "text": "Close", "color": "green", "row": 0}]
    });
    this.conversationPanel.active = true;
  }

  // Resource functions

  // Allows to add, edit a resource in the city
  editResource(resourceData) {
    this.city.editResource(resourceData);
  }

  manufactureResource(qtyToProduce) {
    let resource = this.city.resources[this.selectedBuyableResourceName];
    
    // requirements is a dict of requirements {"Clay": 2, "Iron": 4}
    let requirements = this.city.produces[this.selectedBuyableResourceName].require;

    //we need to check that the industry has all the requirements
    let requirementsSatisfied = true;
    for (let [resourceName, requiredUnitQty] of Object.entries(requirements)) {
      if (resourceName in this.city.resources && 
          this.city.resources[resourceName].qtyAvailable >= qtyToProduce*requiredUnitQty) {
            // no need to do anything
      }
      else {
        requirementsSatisfied = false;
        this.displayError(`Not enough ${resourceName} to produce ${this.selectedBuyableResourceName}`);
        return;
      } 
    }

    if (requirementsSatisfied) {
      this.city.addQtyToResource(this.selectedBuyableResourceName, qtyToProduce);
      for (let [resourceName, requiredUnitQty] of Object.entries(requirements)) {
        this.city.addQtyToResource(resourceName, -requiredUnitQty);
      }
    } 
  }

  buyResource(qty) {
    // TODO: resources is now a dictionary, doesnt need an index but a name
    let resource = this.city.resources[this.selectedBuyableResourceName];
    if (resource.qtyAvailable < qty) {
      this.displayError("Not enough availability");
      return;
    }

    let result = game.playerTrain.buyResource(resource.resourceName, qty, resource.sellPrice);
    if (result == "OK") {  // If the resource was succesfully bought
      this.city.addQtyToResource(resource.resourceName, -qty);
    } else {
      this.displayError(result);
    }
  }

  sellResource(qty) {
    //let resourceName = this.buyableResources[this.selectedBuyableResourceIdx];
    let resourceName = game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo;
    let resourcePrice = this.city.resources[resourceName].Buy
    game.playerTrain.sellResource(this.selectedTrainWagonIdx, qty, resourcePrice);
    // let infoPanelData = game.playerTrain.wagons[this.selectedTrainWagonIdx].generatePanelInfoData();
    // infoPanelData.buttons = ["Sell 1", "Sell 10"];
    // this.infoPanel.fillData(infoPanelData);
  }

  unloadResource(qty) {
    let resourceName = game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo;
    if (resourceName in this.city.resources) {
      this.city.addQtyToResource(resourceName, qty);
    } else {
      this.city.addNewResource({
        "Name": resourceName,
        "Available": qty,
        "Production": 0,
        "InputOrOutput": "Input",
        "Buy": null,
        "Sell": null
      })
    }
    game.playerTrain.sellResource(this.selectedTrainWagonIdx, qty, 0);
    
  }
  
  loadResource(qty) {
    let resource = this.city.resources[this.selectedBuyableResourceName];
    if (resource.qtyAvailable < qty) {
      this.displayError("Not enough availability");
      return;
    }
    let result = game.playerTrain.buyResource(resource.resourceName, qty, 0);
    if (result == "OK") {  // If the resource was succesfully bought
      this.city.addQtyToResource(resource.resourceName, -qty);
    } else {
      this.displayError(result);
    }    
  }


  buyWagon() {
    let wagonName = this.buyableWagons[this.selectedBuyableWagonIdx].name;
    let resourceName = this.buyableWagons[this.selectedBuyableWagonIdx].cargo;
    let price = this.buyableWagons[this.selectedBuyableWagonIdx].purchasePrice;

    // Add wagon to the train (it also updates the weight)
    game.playerTrain.buyWagon(wagonName, price);
    
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
    game.playerTrain.gold += this.city.resources[resourceName].Buy;
    // Remove wagon from the train (it also updates the weight)
    game.playerTrain.removeWagon(this.selectedTrainWagonIdx);
    // deselect wagon
    this.selectedTrainWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
    // update objectives
    // TODO: update to objectives
    this.city.objective.updateResource(resourceName, resourceQty);
  }

  // Move train left and right
  processKey(key) {
    if (key == "ArrowLeft") {
      this.horizontalTrain.gearDown();
    } else if (key == "ArrowRight") {
      this.horizontalTrain.gearUp();
    }
  }

  onClick(mousePos) {   
    // check conversation panel
    if (this.conversationPanel !== null && this.conversationPanel.active) {
      let buttonIdx = this.conversationPanel.onClick(mousePos);
      if (buttonIdx !== null) {
        switch(buttonIdx) {
          case("Accept"): // Accept button
            console.log("Mission accepted");
            this.acceptMission();
            
          break;
          case("Reject"): // Reject Button
            console.log("Mission declined");
            this.conversationPanel.active = false;
          break;
          case("Close"): 
            this.conversationPanel.active = false;
          break;
        }
        return;
      }
    }
    
    // Horizontal train
    let wagonIdx = this.horizontalTrain.onClick(mousePos, this.camera.position);
    if (wagonIdx !== null) {
      console.log(`Clicked wagon ${wagonIdx}`)
      let wagon = game.playerTrain.wagons[wagonIdx]; 
      this.selectedTrainWagonIdx = wagonIdx;
      this.selectedBuyableResourceName = null;

      // check if the city buys this type of resource
      let price = "0";

      // display wagon in the panel
      let infoPanelData; // = wagon.generatePanelInfoData();
      if(wagon.usedSpace > 0 && wagon.cargo in this.city.resources) {
        infoPanelData = this.city.resources[wagon.cargo].generatePanelInfoData();
        // price = this.city.resources[wagon.cargo].Buy
        // infoPanelData.lines.push(`Price: ${price} (${round(100*(price-(wagon.merchandiseValue/wagon.usedSpace))/(wagon.merchandiseValue/wagon.usedSpace))}%)`);
        infoPanelData.buttons = ["Sell 1", "Sell 5", "Sell 10", "Sell Max"];
      } 
      else {
        infoPanelData = wagon.generatePanelInfoData();
        infoPanelData.buttons = [];
      }
      
      this.infoPanel.fillData(infoPanelData);
      this.infoPanel.active = true;
      return;
    }     

    // Info panel
    if (this.infoPanel.active) {
      let buttonText = this.infoPanel.onClick(mousePos);
      if (buttonText !== null) {     

        if (buttonText == "Buy Wagon") {
          this.buyWagon();
        }
        else if (buttonText.startsWith("Sell")) {
          let qty = Number(buttonText.split(" ")[1]);
          this.sellResource(qty);
        }
        else if (buttonText.startsWith("Buy")) {
          let qty = Number(buttonText.split(" ")[1]);
          this.buyResource(qty);
        }
        else if (buttonText.startsWith("Unload")) {
          let qty = Number(buttonText.split(" ")[1]);
          this.unloadResource(qty);
        }
        else if (buttonText.startsWith("Load")) {
          let qty = Number(buttonText.split(" ")[1]);
          this.loadResource(qty);
        }
        else if (buttonText.startsWith("Manufacture")) {
          let qty = Number(buttonText.split(" ")[1]);
          this.manufactureResource(qty);
        }

        return;
      }      
    }
    
    // TrafficLight
    if (this.trafficLight.checkClick(mousePos)) {
      this.exitSequence = true;
      this.horizontalTrain.gearUp();
      return;
    }

    // Buyable wagon
    for (const [i,wagon] of this.buyableWagons.entries()) {
      if (wagon === null) {
        continue;
      }
      if (wagon.checkClick(mousePos, this.camera.position)) {
        console.log(`Clicked wagon ${wagon.position.array()}`);
        this.selectedBuyableWagonIdx = i;
        this.selectedTrainWagonIdx = null;
        this.selectedBuyableResourceName = null;

        let infoPanelData = wagon.generatePanelInfoData();
        infoPanelData.lines.push(`Price: ${wagon.purchasePrice}`);
        infoPanelData.buttons = ["Buy"];
        this.infoPanel.fillData(infoPanelData);
        this.infoPanel.active = true;
        return;
      }
    }

    // Buyable resource
    for (const [resourceName, resourceInstance] of Object.entries(this.city.resources)) {
      if (resourceInstance.checkClick(mousePos)) {
        console.log(`Clicked resource ${resourceName}`);

        // TODO: Make a function that selects an element and deselects the rest
        this.selectedBuyableResourceName = resourceName;
        this.selectedTrainWagonIdx = null;
        this.selectedBuyableWagonIdx = null;

        let infoPanelData = resourceInstance.generatePanelInfoData();
        this.infoPanel.fillData(infoPanelData);
        this.infoPanel.active = true;
        return;
      }
    }

    // Building
    for(let [i, building] of this.city.buildings.entries()) {
      if (building.checkClick(mousePos, this.camera.position)) {
        console.log(`Clicked building ${i}`);
        // the building itself should provide the panel data
        if (this.city.objectives.length > 0) {
          this.conversationPanel.fillData(this.city.objectives[0].generateConversationPanelData());
          this.conversationPanel.active = true;
        }
        let panelData = building.generatePanelInfoData()
        this.infoPanel.fillData(panelData);
        this.infoPanel.active = true;

        return;
      }
    }

    // Empty tile
    let tilePos = Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize)
    console.log(`Clicked tile ${tilePos.array()}`)

    this.selectedBuyableWagonIdx = null;
    this.selectedTrainWagonIdx = null;
    this.selectedBuyableResourceName = null;
    this.infoPanel.active = false;
    if (this.conversationPanel !== null) {
      this.conversationPanel.active = false;
    }
  }

  update() {
    // Update Resources
    // for (let resource of this.city.buyableResources) {
    //   if (resource !== null) {
    //     resource.qtyAvailable = this.city.buyableResources[resource.resourceName].Available;
    //   }
    // }

    // Enter sequence
    if (this.enterSequence && this.horizontalTrain.position.x > 19) {
      this.horizontalTrain.setGear("N");
      if (this.horizontalTrain.velocity == 0) {
        this.enterSequence = false;
      }
    }

    // Exit sequence
    if (this.exitSequence && game.playerTrain.wagons.at(-1).position.x > 20) {
      game.currentScene = game.navigationScene;
      game.navigationScene.getNewIntersection(game.navigationScene.locomotive.currentTile, game.navigationScene.locomotive.orientation);
    }

    this.horizontalTrain.update();
  }

  show() {
    mainCanvas.background(0);
    mainCanvas.image(this.backgroundImg, 0, 0);
    // for (let building of this.buildings) {
    //   building.show(this.camera.position);
    // }
    
    this.horizontalTrain.show(this.camera.position);    
    this.trafficLight.show(this.camera.position, this.tileHalfSize);

    for (let [resourceName, resourceInstance] of Object.entries(this.city.resources)) {
      //if (resourceInstance.isBuyable) {
        resourceInstance.show();
      //}
    }

    for (let wagon of this.buyableWagons) {
      if (wagon !== null) {
        wagon.showHorizontal(this.camera.position);
      }
    }

    // Show City Name
    mainCanvas.push();
    mainCanvas.textSize(40);
    mainCanvas.fill(255,255,255,150)
    mainCanvas.noStroke();
    mainCanvas.rect(mainCanvasDim[0]/2-150, 50-30, 300, 55)
    mainCanvas.fill(0);
    mainCanvas.textAlign(CENTER, CENTER)
    mainCanvas.text(this.city.name, mainCanvasDim[0]/2, 50);
    mainCanvas.pop();

    this.infoPanel.show();
    this.showConversation();

    
  }
}
