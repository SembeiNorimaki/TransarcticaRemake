class BaseScene {
  static Actions = {
    "None": 0,
    "Build": 1,
    "Train": 2,
    "BuildRoad": 3,
    "Wagon": 4
  }
  constructor(base) {
    this.tileHalfSize = tileHalfSizes.Z1;
    this.base = base;    
    

    this.selectedBuilding = null;
    this.selectedUnit = null;    
    this.enterSequence = true;

    this.draggedWagonTrainId = null;
    this.draggedWagonDepotId = null;
    let binId = null;

    let hudData = [];
    this.infoPanel = new InfoPanel();
    this.trafficLight = new TrafficLight(createVector(71, 22));

    this.unitBuildingPosition = createVector(50,27)

  }

  initialize() {
    this.camera = new Camera(Geometry.boardToCamera(createVector(61, 31), this.tileHalfSize));
    this.horizontalTrain = new HorizontalTrain(Game.Players.Human, game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(44, 54));
    this.horizontalTrain.setVelocity(0.2);
  }

  update() {
    // Enter sequence
    if (this.enterSequence && this.horizontalTrain.position.x > 68) {
      this.horizontalTrain.setGear("N");
      if (this.horizontalTrain.velocity == 0) {
        this.enterSequence = false;
      }
    }

    // Exit sequence
    if (this.exitSequence && game.playerTrain.wagons.at(-1).position.x > 90) {
      game.currentScene = game.navigationScene;
      game.navigationScene.getNewIntersection(game.navigationScene.locomotive.currentTile, game.navigationScene.locomotive.orientation);
    }


    this.horizontalTrain.update();
  }

  onMouseReleased() {
    if (this.draggedWagonTrainId !== null && this.binId !== null) {
      const element = game.playerTrain.wagons.splice(this.draggedWagonTrainId, 1)[0]
      game.playerTrain.wagons.splice(this.binId, 0, element);
      this.draggedWagonTrainId = null;
      this.binId = null;
    }
    if (this.draggedWagonDepotId !== null && this.binId !== null) {
      const element = this.base.wagons[this.draggedWagonTrainId]
      game.playerTrain.wagons.splice(this.binId, 0, element);
      this.draggedWagonDepotId = null;
      this.binId = null;
    }
  }

  onClick(mousePos) {

    // Right click takes a wagon to drag
    if (mouseButton == "right") {
      // check if we clicked a wagon from the train
      this.draggedWagonTrainId = this.horizontalTrain.onClick(mousePos, this.camera.position);
      if (this.draggedWagonTrainId === null) {
        // check if we clicked a wagon from the depot
        for (let wagon of this.base.wagons) {
          if (wagon.checkClick(mousePos, this.camera.position)) {
            console.log(`Clicked stored wagon: ${wagon.name}`)
            this.draggedWagonDepotId = wagon.id;
          }
        }
      }
      return;
    }

    // If we are dragging a wagon
    if (this.draggedWagonTrainId !== null && this.binId !== null) {
      const element = game.playerTrain.wagons.splice(this.draggedWagonTrainId, 1)[0];
      if (this.binId == -1) {
        // this.base.storeWagon(game.playerTrain.wagons[this.draggedWagonTrainId]);
        this.base.storeWagon(element);
        // game.playerTrain.wagons.splice(this.draggedWagonTrainId, 1)
      } else {        
        if (this.binId <= this.draggedWagonTrainId) {
          game.playerTrain.wagons.splice(this.binId, 0, element);  
        } else if (this.binId > this.draggedWagonTrainId){
          game.playerTrain.wagons.splice(this.binId-1, 0, element);  
        }
      }
      this.draggedWagonTrainId = null;
      this.binId = null;
      return;
    }

    if (this.draggedWagonDepotId !== null && this.binId !== null) {
      const element = this.base.wagons[this.draggedWagonDepotId];
      game.playerTrain.wagons.splice(this.binId, 0, element);  
      this.draggedWagonDepotId = null;
      this.binId = null;
      return;
    }



    // check Info Panel    
    if (this.infoPanel.active) {
      let result = this.infoPanel.onClick(mousePos);
      if (result !== null) {
        switch(result) {
          case("Tank"):
            this.infoPanel.fillData({
              "title": "Tank",
              "image": gameData.unitsData.Tank.Human.idle[270][0],
              "lines": [
                `HP: 100`,
                `AP: 20`,
                `Cost: 200`
              ],
              "buttons": ["Build Tank", "Cancel"]
            });
          break;
          case("Artillery"):
            this.infoPanel.fillData({
              "title": "Artillery",
              "image": gameData.unitsData.Artillery.Human.idle[270][0],
              "lines": [
                `HP: 50`,
                `AP: 30`,
                `Cost: 400`
              ],
              "buttons": ["Build Artillery", "Cancel"]
            });
          break;
          case("Build Tank"):
            this.base.addUnit(new Tank("Tank", this.unitBuildingPosition.copy(), Game.Players.Human));
            this.unitBuildingPosition.x++;
          break;
          case("Build Artillery"):
            this.base.addUnit(new Artillery("Artillery", this.unitBuildingPosition.copy(), Game.Players.Human));
            this.unitBuildingPosition.x++;
          break;
          case("Load to Train"):
            console.log(`Loading unit ${this.selectedUnit.name} to train`);
            game.playerTrain.wagons[2].loadVehicle(this.selectedUnit);
          break;
          case("Cancel"):
          break;
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

    // check HorizontalTrain (null if not)
    let wagonId = this.horizontalTrain.onClick(mousePos, this.camera.position)
    if (wagonId !== null) {
      console.log(`Clicked wagon ${wagonId}`);
      // Show infoPanel for that wagon
      let panelData = game.playerTrain.wagons[wagonId].generatePanelInfoDataBase();
      panelData.buttons = ["Repair", "Sell"];
      this.infoPanel.fillData(panelData);
      this.infoPanel.active = true;

      return;
    }
   
    let tilePosition = Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize);
    let tile = this.base.tileBoard.board[tilePosition.y][tilePosition.x];

    // check if we clicked a unit
    if (tile.isUnit()) {
      console.log(`Clicked unit ${tile.unitId}`)
      let unit = this.base.tileBoard.units[tile.unitId];
      this.selectedUnit = unit;
      let panelData = unit.generatePanelInfoData();
      this.infoPanel.fillData(panelData);
      this.infoPanel.active = true;

      return;
    }

    // check if we clicked a building
    // buildings are big, so instead of checking the tile, check all the buildings
    for (let building of this.base.buildings) {
      if (building.checkClick(mousePos, this.camera.position)) {
        console.log(`Clicked building ${building.name}`);
        let panelData = building.generatePanelInfoData();
        this.infoPanel.fillData(panelData);
        this.infoPanel.active = true;
        return;
      }
    }


    // If we have a building selected, place it
    if (this.selectedBuilding !== null) {
      // place a building      
      this.selectedBuilding.setPosition(tilePosition);
      let result = this.base.placeBuilding(tilePosition, this.selectedBuilding);
      if (result)
        this.selectedBuilding = null;
      this.show();
    }

    else {
      if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isBuilding()) {
        console.log("Building clicked")        
      }
      console.log(tilePosition.array());
      this.infoPanel.active = false;
    }
  }
  onMouseReleased() {
  }

  setHudData(action) {
    let hudData;
    if (action == BaseScene.Actions.Train) {
      hudData = [
        new Button(1, true, createVector(80,30), createVector(64,26), null, null, gameData.unitsData.Artillery.Human.idle[0][0]),
        new Button(1, true, createVector(80*3,30), createVector(64,26), null, null, gameData.unitsData.Tank.Human.idle[0][0])
      ];
    } else if (action == BaseScene.Actions.Build) {
      hudData = [
        new Button(1, true, createVector(80,30), createVector(64,26), null, null, gameData.buildingsFHData.FactoryHud.img),
        new Button(1, true, createVector(80*3,30), createVector(64,26), null, null, gameData.buildingsFHData.ConstructionBayHud.img)
      ]
    } else if (action == BaseScene.Actions.Wagon) {
      hudData = [
        new Button(1, true, createVector(80,30), createVector(64,26), null, null, wagonsData.Merchandise.img[0]),
        new Button(1, true, createVector(80*3,30), createVector(64,26), null, null, wagonsData.Tender.img[0]),
        new Button(1, true, createVector(80*5,30), createVector(64,26), null, null, wagonsData.Gondola.img[0]),
      ]
    }
    game.hud.buttons = hudData;

    // }
  }

  processKey(key) {
    console.log(key)
    if (key == "ArrowLeft") {
      this.camera.move(createVector(-200,0))
    } else if (key == "ArrowRight") {
      this.camera.move(createVector(200,0))
    } else if (key == "ArrowUp") {
      this.camera.move(createVector(0,-50))
    } else if (key == "ArrowDown") {
      this.camera.move(createVector(0,50))
    } else if (key == "b") {
      // this.selectedBuilding = new BuildingFH(this.base.buildings.length, "Factory", createVector(0,0))
      this.setHudData(BaseScene.Actions.Build);
    } else if (key == "t") {
      this.setHudData(BaseScene.Actions.Train);
    } else if (key == "w") {
      //this.setHudData(BaseScene.Actions.Wagon);
      let infoPanelData = MerchandiseWagon.getInfoPanelData();
      infoPanelData.buttons.push("Build")
      this.infoPanel.fillData(infoPanelData);
      this.infoPanel.active = true;
    } 
  }


  show() {
    this.base.show(this.camera.position);
    this.horizontalTrain.show(this.camera.position);



    // if we are building and have a building selected, show it where the mouse is
    // if (this.selectedBuilding !== null) {
    let aux;
    switch(this.action) {
      case(BaseScene.Actions.Build):
        aux = Geometry.screenToBoard(createVector(mouseX, mouseY), this.camera.position, this.tileHalfSize);
        this.selectedBuilding.setPosition(aux);
        this.selectedBuilding.show(mainCanvas, this.camera.position);
      break;
      case(BaseScene.Actions.Train):
        aux = Geometry.screenToBoard(createVector(mouseX, mouseY), this.camera.position, this.tileHalfSize);
        this.selectedUnit.setPosition(aux);
        this.selectedUnit.show(this.camera.position);
      break;
      case(BaseScene.Actions.BuildRoad):
      break;

    }

    // if (this.action === BaseScene.Actions.Build) {
    //   let aux = Geometry.screenToBoard(createVector(mouseX, mouseY), this.camera.position, this.tileHalfSize);
    //   this.selectedBuilding.setPosition(aux);
    //   this.selectedBuilding.show(this.camera.position);
    // }
    // // else if (this.selectedUnit !== null) {
    // else if (this.action === BaseScene.Actions.Train) {
    //   let aux = Geometry.screenToBoard(createVector(mouseX, mouseY), this.camera.position, this.tileHalfSize);
    //   this.selectedUnit.setPosition(aux);
    //   this.selectedUnit.show(this.camera.position);
    // }

    this.trafficLight.show(this.camera.position, this.tileHalfSize);




    // show dragged wagon
    if (this.draggedWagonTrainId !== null) {
      mainCanvas.image(game.playerTrain.wagons[this.draggedWagonTrainId].img[0], mouseX - game.playerTrain.wagons[this.draggedWagonTrainId].halfSize.x, mouseY);
      for (let [i, wagon] of game.playerTrain.wagons.entries()) {
        let screenPos = Geometry.boardToScreen(wagon.position, this.camera.position, this.tileHalfSize);
        if (mouseY < screenPos.y && mouseY > screenPos.y-100 && mouseX > screenPos.x) {
          if (i !== this.binId) {
            console.log(`Bin Id: ${i}`)
          }
          this.binId = i;
          mainCanvas.line(screenPos.x+wagon.halfSize.x, screenPos.y, screenPos.x+wagon.halfSize.x, screenPos.y-100)
          return;
        }
      }
      let screenPos = Geometry.boardToScreen(this.base.wagonStorageLocations[0], this.camera.position, this.tileHalfSize);
      if (mouseY < screenPos.y && mouseY > screenPos.y-60) {
        mainCanvas.rect(100, screenPos.y-60,1000,60);
        this.binId = -1;
        return;
      }
    }

    // show dragged wagon
    if (this.draggedWagonDepotId !== null) {
      mainCanvas.image(this.base.wagons[this.draggedWagonDepotId].img[0], mouseX - this.base.wagons[this.draggedWagonDepotId].halfSize.x, mouseY);
      for (let [i, wagon] of game.playerTrain.wagons.entries()) {
        let screenPos = Geometry.boardToScreen(wagon.position, this.camera.position, this.tileHalfSize);
        if (mouseY < screenPos.y && mouseY > screenPos.y-100 && mouseX > screenPos.x) {
          if (i !== this.binId) {
            console.log(`Bin Id: ${i}`)
          }
          this.binId = i;
          mainCanvas.line(screenPos.x+wagon.halfSize.x, screenPos.y, screenPos.x+wagon.halfSize.x, screenPos.y-100)
          return;
        }
      }
      let screenPos = Geometry.boardToScreen(this.base.wagonStorageLocations[0], this.camera.position, this.tileHalfSize);
      if (mouseY < screenPos.y && mouseY > screenPos.y-60) {
        mainCanvas.rect(100, screenPos.y-60,1000,60);
        this.binId = -1;
        return;
      }
    }

    this.infoPanel.show();
  }
}