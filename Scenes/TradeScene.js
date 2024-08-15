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
    // if (locationName in gameData.citiesData) 
    //   this.city = gameData.citiesData[locationName]
    // else
    //   this.city = gameData.industriesData[locationName]

    if (locationName in game.cities) 
      this.city = game.cities[locationName]
    else if (locationName in game.industries) 
      this.city = game.industries[locationName]
    
     
    this.locationName = locationName;
    this.tileBoard = new TileBoard(board);
    this.infoPanel = new InfoPanel();
    this.conversationPanel = new ConversationPanel();

    this.enterSequence = true;
    this.exitSequence = false;
    this.cameraPos = boardToCamera(createVector(15,15));
    this.trafficLight = new TrafficLight(
      createVector(mainCanvasDim[0]-60, mainCanvasDim[1]-180), 
      [gameData.trafficLightData.green, gameData.trafficLightData.red], 
      createVector(50, 50)
    );
    this.clickableObjects = [];
    this.wagonRowsResources = [];

    this.selectedBuyableWagonIdx = null;
    this.selectedBuyableResourceIdx = null;
    this.selectedTrainWagonIdx = null;

    this.buyableWagons = [];
    this.buyableResources = [];
  }

  initialize() {
    this.horizontalTrain = new HorizontalTrain("Player", game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(0, 800));
    this.horizontalTrain.setVelocity(20);
  }

  // Mission related functions
  showConversation() {
    this.conversationPanel.show();
  }
  acceptMission() {
    game.objectives.push(this.city.objective);
    this.conversationPanel.active = false;
  }

  // Populate functions
  populateBuyableResourceWagons() {
    let row = 0;
    let col = 0;
    
    for (let [resourceName, resourceInfo] of Object.entries(this.city.resources)) {
      for (let i=0; i<resourceInfo.Qty; i++) {
        let wagonName = Wagon.resourceToWagon[resourceName];
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
        wagon.purchasePrice = resourceInfo.Buy;
        wagon.fillWagon(resourceName);
        this.buyableWagons.push(wagon);
        col++;
        if (col >=3+row) {
          row++;
          col = 0;
        }
      }
    }
  }
    
  populateBuyableSpecialWagons() {
    let row = 0;
    let col = 0;
    
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


  //Resource Functions
  buyResource(qty) {
    let resourceName = this.buyableResources[this.selectedBuyableResourceIdx].resourceName;
    game.playerTrain.buyResource(resourceName, qty, this.buyableResources[this.selectedBuyableResourceIdx].purchasePrice);
  }

  sellResource() {
    let resourceName = game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo;
    game.playerTrain.sellResource(this.selectedTrainWagonIdx, this.city.resources[resourceName].Sell);
    let infoPanelData = game.playerTrain.wagons[this.selectedTrainWagonIdx].generatePanelInfoData();
    infoPanelData.buttons = "Sell";
    this.infoPanel.fillData();
  }

  buyWagon() {
    let wagonName = this.buyableWagons[this.selectedBuyableWagonIdx].name;
    let resourceName = this.buyableWagons[this.selectedBuyableWagonIdx].cargo;
    let price = this.buyableWagons[this.selectedBuyableWagonIdx].purchasePrice;

    // Add wagon to the train (it also updates the weight)
    game.playerTrain.addWagon(wagonName, 0);
    // Fill the wagon
    game.playerTrain.wagons.at(-1).fillWagon(resourceName);
    game.playerTrain.wagons.at(-1).purchasePrice = price;
    // Substract wagon cost from player gold
    game.playerTrain.gold -= price;
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
      game.navigationScene.getNewIntersection(game.navigationScene.locomotive.currentTile, game.navigationScene.locomotive.orientation);
    }

    this.horizontalTrain.update();
  }


  // showHud() {
  //   let x = hudCanvasDim[0] - 80;
  //   let y = hudCanvasDim[1] / 2;


  //   //hudCanvas.image(gameData.hudData.frame, 100, y);
  //   hudCanvas.image(gameData.hudData.quest, 100, y);
    

  //   hudCanvas.image(gameData.hudData.fuel, x, y);
  //   hudCanvas.text(`${int(game.playerTrain.fuel)}`, x, y);
  //   x-=140;
  //   hudCanvas.image(gameData.hudData.gold, x, y);
  //   hudCanvas.text(`${game.playerTrain.gold}`, x, y);
  //   x-=140;
  //   hudCanvas.image(gameData.hudData.frame, x, y);

  // }
}
