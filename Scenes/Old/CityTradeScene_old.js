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
  
}

class CityTradeScene {
  constructor(cityName) {
    this.cityName = cityName;

    this.tileBoard = new TileBoard(gameData.cityBoard);
    
    this.infoPanel = new InfoPanel();

    this.enterSequence = true;
    this.exitSequence = false;
    this.cameraPos = Geometry.boardToCamera(createVector(15,15), tileHalfSizes.Z1);

    // todo: industry type passed as parameter
    this.industry = new Industry(createVector(14, 21));
    
    this.trafficLight = new TrafficLight(
      createVector(mainCanvasDim[0]-60, mainCanvasDim[1]-180), 
      [gameData.trafficLightData.green, gameData.trafficLightData.red], 
      createVector(50, 50));

    this.backgroundImg = this.generateBackgroundImage();

    this.clickableObjects = [];
    this.wagonRowsResources = [];

    this.selectedBuyableWagonIdx = null;
    this.selectedTrainWagonIdx = null;

    this.buyableWagons = [];
    this.populateBuyableWagons();
    
  }

  populateBuyableWagons() {
    let row = 0;
    for (let [resourceName, val] of Object.entries(gameData.citiesData[this.cityName].resources)) {
      // this.wagonRowsResources.push(resourceName);
      for (let i=0; i<val.Qty; i++) {
        let wagonName = resourceToWagon[resourceName];
        let wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
        wagon.setPosition(createVector(
          1200 + i * wagon.halfSize.x*2 - 100*row + wagon.halfSize.x, 
          386 + row*tileHalfSizes.Z1.y*2
        ));
        wagon.fillWagon(resourceName);
        this.buyableWagons.push(wagon);
      }
      row++;
    }
  }

  initialize() {
    this.horizontalTrain = new HorizontalTrain(Game.Players.Human);
    this.horizontalTrain.setPosition(createVector(1400, 800+20));
    this.horizontalTrain.setVelocity(0);
  }

  generateBackgroundImage() {
    let backgroundImage = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    this.tileBoard.showTiles(backgroundImage, this.cameraPos);

    for (let i=-1;i<30;i++) {
      if (!(i%2)) {
        Tile.draw(backgroundImage, 0x33, createVector(i*tileHalfSizes.Z1.x, mainCanvasDim[1]-2.5*tileHalfSizes.Z1.y));
      }
      else {
        Tile.draw(backgroundImage, 0x32, createVector(i*tileHalfSizes.Z1.x, mainCanvasDim[1]-1.5*tileHalfSizes.Z1.y));
      }
    }
    return backgroundImage;
  }

  // Move train left and right
  processKey(key) {
    if (key == "ArrowLeft") {
      this.horizontalTrain.gearDown();
    } else if (key == "ArrowRight") {
      this.horizontalTrain.gearUp();
    }
  }

  buyWagon() {
    // Add wagon to the train (it also updates the weight)
    game.playerTrain.addWagon(this.buyableWagons[this.selectedBuyableWagonIdx].name, 0);
    // Fill the wagon
    game.playerTrain.wagons.at(-1).fillWagon();
    // Substract wagon cost from player gold
    game.playerTrain.gold -= gameData.citiesData[this.cityName].resources[this.buyableWagons[this.selectedBuyableWagonIdx].cargo].Buy;
    // remove the wagon from the city
    this.buyableWagons[this.selectedBuyableWagonIdx] = null;
    // deselect the removed wagon
    this.selectedBuyableWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
  }

  sellWagon() {
    // Add selling price to player's gold
    game.playerTrain.gold += gameData.citiesData[this.cityName].resources[game.playerTrain.wagons[this.selectedTrainWagonIdx].cargo].Sell;
    // Remove wagon from the train (it also updates the weight)
    game.playerTrain.removeWagon(this.selectedTrainWagonIdx);
    // deselect wagon
    this.selectedTrainWagonIdx = null;
    // hide panel
    this.infoPanel.active = false;
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
        if(wagon.cargo in gameData.citiesData["Barcelona"].resources) {
          price = gameData.citiesData["Barcelona"].resources[wagon.cargo].Sell
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
          infoPanelData.lines.push(`Price: ${gameData.citiesData[this.cityName].resources[wagon.cargo].Buy}`);
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

      // let boardPos = Geometry.screenToBoard(mousePos, this.cameraPos);
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

    hudCanvas.image(gameData.hudData.coal, x, y);
    hudCanvas.text(`${int(game.playerTrain.coal)}`, x, y);
    x-=140;
    hudCanvas.image(gameData.hudData.gold, x, y);
    hudCanvas.text(`${game.playerTrain.gold}`, x, y);
    x-=140;
    hudCanvas.image(gameData.hudData.frame, x, y);
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
    for (let [resourceName, val] of Object.entries(gameData.citiesData[this.cityName].resources)) {
      mainCanvas.textSize(20)
      mainCanvas.text(resourceName, 
        1100 - i*2*tileHalfSizes.Z1.x, 
        394 + i*tileHalfSizes.Z1.y*2 -25)
      i++;
    }
    this.infoPanel.show();

    // show red debug lines
    mainCanvas.push();
    mainCanvas.stroke("red")
    mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    mainCanvas.line(0,750,mainCanvasDim[0],750)
    mainCanvas.pop();

    this.showHud();
  }
}

class IndustryTradeScene extends CityTradeScene {
  constructor() {

  }
}