class BaseScene {
  constructor(base) {
    this.base = base;
    
    this.camera = new Camera(createVector(500, 2000));

    this.selectedBuilding = null;
    this.selectedUnit = null;
    this.buildings = [];
    this.units = [];
    
  }

  initialize() {
    this.horizontalTrain = new HorizontalTrain("Player", game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(1400, 200));
    this.horizontalTrain.setVelocity(0);
  }

  update() {
    this.horizontalTrain.update();
  }

  onClick(mousePos) {
    let tilePos = screenToBoard(mousePos, this.camera.position);
    
    if (this.selectedBuilding !== null) {
      // place a building      
      this.selectedBuilding.setPosition(tilePos);
      let result = this.base.placeBuilding(tilePos, this.selectedBuilding);
      if (result)
        this.selectedBuilding = null;
      this.show();
    }

    else {
      if (this.base.tileBoard.board[tilePos.y][tilePos.x].isBuilding()) {
        console.log("Building clicked")        
      }
      console.log(tilePos.array())
    }
  }
  onMouseReleased() {

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
      this.selectedBuilding = new BuildingFH(this.buildings.length, "Building1", createVector(0,0))
    }
  }

  show() {
    //mainCanvas.background(0)
    this.base.show(this.camera.position);

    //this.tileBoard.showTiles(mainCanvas, this.camera.position);
    this.horizontalTrain.show(createVector(0,0));

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
  }
}