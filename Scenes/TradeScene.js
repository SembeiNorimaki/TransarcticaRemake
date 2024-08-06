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
    if (locationName in gameData.citiesData) 
      this.city = gameData.citiesData[locationName]
    else
      this.city = gameData.industriesData[locationName]
     
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
    this.horizontalTrain.setPosition(createVector(1400, 800));
    this.horizontalTrain.setVelocity(0);
  }
  
  populateBuyableWagons() {
    let row = 0;
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
          1200 + i * wagon.halfSize.x*2 - 100*row + wagon.halfSize.x, 
          386 + row*TILE_HEIGHT_HALF*2
        ));
        wagon.fillWagon(resourceName);
        this.buyableWagons.push(wagon);
      }
      row++;
    }
  }

  buyResource() {
    let resourceName = this.buyableResources[this.selectedBuyableResourceIdx].resourceName;
    let totalCost = this.buyableResources[this.selectedBuyableResourceIdx].purchasePrice;
    game.playerTrain.addResource(resourceName, totalCost);
  }

  sellResource() {
    let resourceName = game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo;
    game.playerTrain.sellResource(wagonId, this.city.resources[resourceName].Sell);
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
