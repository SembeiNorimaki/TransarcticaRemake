class BaseScene {
  static Actions = {
    "None": 0,
    "Build": 1,
    "Train": 2,
    "Wagon": 3
  }
  constructor(base) {
    this.base = base;    
    this.camera = new Camera(boardToScreen(createVector(46, 38), createVector(0,0)));

    this.selectedBuilding = null;
    this.selectedUnit = null;    
    this.enterSequence = true;

    this.draggedWagonId = null;
    let binId = null;

    let hudData = [];
  }

  initialize() {
    this.horizontalTrain = new HorizontalTrain(Game.Players.Human);
    this.horizontalTrain.setPosition(createVector(44, 54));
    this.horizontalTrain.setVelocity(0.2);
  }

  update() {
  

    // Enter sequence
    if (this.enterSequence && this.horizontalTrain.position.x > 60) {
      this.horizontalTrain.setGear("N")
      if (this.horizontalTrain.velocity == 0) {
        // this.horizontalTrain.acceleration = 0;
        // this.horizontalTrain.velocity = 0;
        this.enterSequence = false;
        // this.unloadUnits();
        // this.exitSequence = true;
        // this.horizontalTrain.setGear("D");
      }
    }


    this.horizontalTrain.update();
  }

  onMouseReleased() {
    if (this.draggedWagonId !== null && this.binId !== null) {
      const element = game.playerTrain.wagons.splice(this.draggedWagonId, 1)[0]
      game.playerTrain.wagons.splice(this.binId, 0, element);
      this.draggedWagonId = null;
      this.binId = null;
    }
  }

  onClick(mousePos) {
    if (mouseButton == "right") {
      this.draggedWagonId = this.horizontalTrain.onClick(mousePos, this.camera.position);
      return
    }

    // check if we clicked somewhere in the horizontalTrain (null if not)
    let wagonId = this.horizontalTrain.onClick(mousePos, this.camera.position)
    if (wagonId !== null) {
      console.log(`Clicked wagon ${wagonId}`);
      return;
    }
   
    let tilePosition = screenToBoard(mousePos, this.camera.position);
    let tile = this.base.tileBoard.board[tilePosition.y][tilePosition.x];

    // check if we clicked a unit
    if (tile.isUnit()) {
      console.log(`Clicked unit ${tile.unitId}`)
    }

    // check if we clicked a building
    // buildings are big, so instead of checking the tile, check all the buildings
    for (let building of this.base.buildings) {
      if (building.checkClick(mousePos, this.camera.position)) {
        console.log(`Clicked building ${building.name}`);
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
      console.log(tilePosition.array())
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
      this.setHudData(BaseScene.Actions.Wagon);
    } 
  }


  show() {
    this.base.show(this.camera.position);
    this.horizontalTrain.show(this.camera.position);



    // if we are building and have a building selected, show it where the mouse is
    if (this.selectedBuilding !== null) {
      let aux = screenToBoard(createVector(mouseX, mouseY), this.camera.position);
      this.selectedBuilding.setPosition(aux);
      this.selectedBuilding.show(this.camera.position);
    }
    else if (this.selectedUnit !== null) {
      let aux = screenToBoard(createVector(mouseX, mouseY), this.camera.position);
      this.selectedUnit.setPosition(aux);
      this.selectedUnit.show(this.camera.position);
    }


    // show dragged wagon
    if (this.draggedWagonId !== null) {
      mainCanvas.image(game.playerTrain.wagons[this.draggedWagonId].img[0], mouseX - game.playerTrain.wagons[this.draggedWagonId].halfSize.x, mouseY);

      //let positions = []
      for (let [i, wagon] of game.playerTrain.wagons.entries()) {
        //mainCanvas.line(wagon.position.x, 500, wagon.position.x, 800)
        if (mouseX > wagon.position.x ) {
          this.binId = i
          // mainCanvas.rect(wagon.position.x,600,wagon.halfSize.x*2,300)
          mainCanvas.line(wagon.position.x+wagon.halfSize.x, 700, wagon.position.x+wagon.halfSize.x, 800)
          break;
        }
      }
    }
  }
}