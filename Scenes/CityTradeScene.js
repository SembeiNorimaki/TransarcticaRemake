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

class CityTradeScene {
  constructor(cityName) {
    this.cityName = cityName;

    this.tileBoard = new TileBoard(cityBoard);
    
    this.infoPanel = new InfoPanel();

    this.enterSequence = true;
    this.exitSequence = false;
    this.cameraPos = boardToCamera(createVector(15,15));

    // todo: industry type passed as parameter
    this.industry = new Industry(createVector(14, 21));
    
    this.trafficLight = new TrafficLight(
      createVector(mainCanvasDim[0]-60, mainCanvasDim[1]-180), 
      [trafficLightData.green, trafficLightData.red], 
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
    for (let [resourceName, val] of Object.entries(citiesData[this.cityName].resources)) {
      // this.wagonRowsResources.push(resourceName);
      for (let i=0; i<val.Qty; i++) {
        let wagonName = resourceToWagon[resourceName];
        let wagon = new Wagon(1, wagonName, wagonsData[wagonName]);
        wagon.setPos(createVector(
          1200 + i * wagon.halfSize.x*2 - 100*row + wagon.halfSize.x, 
          386 + row*TILE_HEIGHT_HALF*2
        ));
        wagon.fillWagon();
        this.buyableWagons.push(wagon);


        // this.clickableObjects.push(new ClickableRegion(
        //   createVector(1200 + i*wagonsData[wagonName].dimensions[0] - wagonsData[wagonName].offset.at(-1)[0] - 140*row, 
        //     420 + row*TILE_HEIGHT_HALF*2 - wagonsData[wagonName].offset.at(-1)[1]), // position
        //   createVector(100,100), // halfsize
        //   [wagonsData[wagonName].img.at(-1), wagonsData[wagonName].img.at(-1)], // image
        //   resourceName,// text
        //   ""// callback
        // ));
      }

      row++;
    }
  }

  initialize() {
    this.horizontalTrain = new HorizontalTrain("Player", game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(1400, 800+20));
    this.horizontalTrain.setVelocity(0);
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

  // Move train left and right
  processKey(key) {
    if (key == "ArrowLeft") {
      console.log("Left arrow")
      this.horizontalTrain.gearDown();
    } else if (key == "ArrowRight") {
      console.log("Right arrow")
      this.horizontalTrain.gearUp();
    }
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
        if(wagon.cargo in citiesData["Barcelona"].resources) {
          price = citiesData["Barcelona"].resources[wagon.cargo].Buy
          button = "Sell";
        }

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
          console.log("buying a wagon")
          game.playerTrain.addWagon(this.buyableWagons[this.selectedBuyableWagonIdx].name, 0);
          game.playerTrain.wagons.at(-1).fillWagon();
          this.buyableWagons[this.selectedBuyableWagonIdx] = null;
          this.selectedBuyableWagonIdx = null;
          this.infoPanel.active = false;
        } else if (this.selectedTrainWagonIdx !==null) {
          console.log("selling a wagon")
          game.playerTrain.removeWagon(this.selectedTrainWagonIdx);
          this.selectedTrainWagonIdx = null;
          this.infoPanel.active = false;
        }
        
        //game.playerTrain.wagons.at(-1).fillWagon();
        //this.industry.industryAvailableQty--;
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
          infoPanelData.lines.push(`Price: ${citiesData[this.cityName].resources[wagon.cargo].Buy}`);
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

    // this.vel += this.acc;
    // if (this.vel > this.maxVel) {
    //   this.vel = this.maxVel;
    //   this.acc = 0;
    // }
    // this.trainPosition.x += this.vel;
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

  show() {
    mainCanvas.image(this.backgroundImg, 0, 0);    
    
    // mainCanvas.image(wagonsData["Iron"].img[1], 750, 570);
    // mainCanvas.image(wagonsData["Iron"].img[2], 900, 570);
    // mainCanvas.image(wagonsData["Iron"].img[2], 1050, 570);
    // mainCanvas.image(wagonsData["Copper"].img[1], 800, 470);
    // mainCanvas.image(wagonsData["Copper"].img[2], 950, 470);
    // mainCanvas.image(wagonsData["Copper"].img[2], 1100, 470);

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
    for (let [resourceName, val] of Object.entries(citiesData[this.cityName].resources)) {
      mainCanvas.textSize(20)
      mainCanvas.text(resourceName, 
        1100 - i*2*TILE_WIDTH_HALF, 
        394 + i*TILE_HEIGHT_HALF*2 -25)
      i++;
    }
    this.infoPanel.show();

    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.pop();

    this.showHud();
  }
}