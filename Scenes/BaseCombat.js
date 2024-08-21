class BaseCombat {
  constructor(base) {
    this.base = base;
    this.camera = new Camera(createVector(0, 94*35));
    this.playerForces = [];
    this.enemyForces = [];

    this.action = UnitFH.Actions.Move;
    this.selectedUnitId = null;
    this.selectedBuildingId = null;
    this.enterSequence = true;
    this.exitSequence = false;



    // this.camera.setDestination(createVector(100,300));

  }
  initialize() {
    let y;
    for (let x=74; x<99; x++) {
      y = 99+74-x;
      this.base.tileBoard.board[y][x].setTileId(0x6B)
      this.base.tileBoard.board[y-1][x].setTileId(0x6C)
    }

    this.horizontalTrain = new HorizontalTrain("Player", game.playerTrain.wagons);
    this.horizontalTrain.setPosition(createVector(0, 245));
    this.horizontalTrain.setVelocity(20);
  }

  unloadUnits() {
    this.base.placeUnit(createVector(83,92), new UnitFH(this.base.units.length, "Tank", createVector(83,92)));
    this.base.placeUnit(createVector(84,91), new UnitFH(this.base.units.length, "Artillery", createVector(84,91)));
    this.base.placeUnit(createVector(85,90), new UnitFH(this.base.units.length, "Tank", createVector(85,90)));
    this.base.placeUnit(createVector(86,89), new UnitFH(this.base.units.length, "Tank", createVector(86,89)));

    this.base.placeUnit(createVector(88,87), new UnitFH(this.base.units.length, "Artillery", createVector(88,87)));
    this.base.placeUnit(createVector(89,86), new UnitFH(this.base.units.length, "Tank", createVector(89,86)));
    this.base.placeUnit(createVector(90,85), new UnitFH(this.base.units.length, "Artillery", createVector(90,85)));
    this.base.placeUnit(createVector(91,84), new UnitFH(this.base.units.length, "Tank", createVector(91,84)));
  }


  setAction(action) {
    if (action === Unit.Actions.Attack) {
      cursor(CROSS);
    } else {
      cursor(ARROW);
    }
    this.action = action;
  }

  onClick(mousePos) {
    // right click deselects all
    if (mouseButton === RIGHT) {
      console.log("Deselecting all");      
      this.selectedUnitId = null;
      this.selectedBuildingId = null;
      // this.base.tileBoard.floodBoard = undefined;
      this.setAction(Unit.Actions.Move);
      return;
    }
    // mouse pressed in the hud
    if (mousePos.y > mainCanvasDim[1]) {  
      console.log("Hud pressed");
      // let buttonId = this.getButtonId(pos.x)
      // // console.log(buttonId)
      // if (buttonId == 6) {
      //   // End turn
      //   this.endTurn();
      // }   
      return;
    } 

    let tilePosition = screenToBoard(mousePos, this.camera.position);
    console.log(`Clicked ${tilePosition.array()}`)
    // if we don't have anything selected
    if (this.selectedUnitId === null && this.selectedBuildingId === null) {      
      //this.base.tileBoard.selectedTile = tile;
      // If we clicked a unit
      if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isUnit()) {
        console.log("Selecting unit");
        this.selectedUnitId = this.base.tileBoard.board[tilePosition.y][tilePosition.x].unitId;
        this.camera.setDestination(boardToScreen(tilePosition, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2)))
        //this.city.tileBoard.flood(tile, 10);
      } 
      // If we clicked a building
      else if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isBuilding()) {
        console.log("Selecting building");
        this.selectedEnemyId = this.base.tileBoard.board[tilePosition.y][tilePosition.x].buildingId;       
      }
      // If we selected an enemy
      //else if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isEnemy()) {
        //this.selectedElementId = this.city.tileBoard.board[tile.y][tile.x].enemyId;
        //this.selectedElementType = "enemy"
      //} 
      else {
        //this.city.tileBoard.floodBoard = undefined;
        console.log("Clicked on empty tile");
      }
      return;
    } 

    // if we already have a unit selected
    if (this.selectedUnitId !== null) {
      if (this.action === UnitFH.Actions.Move) {
        //check if the tile has a unit, if so, select it instead of moving
        if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isUnit()) {
          console.log("Reselecting unit");
          this.selectedUnitId = this.base.tileBoard.board[tilePosition.y][tilePosition.x].unitId;
          this.selectedBuildingId = null;
          // this.city.tileBoard.flood(tile, 10);
          return;
        } 
        //check if the tile has a building, if so, select it instead of moving
        if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isBuilding()) {
          console.log("Reselecting building");
          this.selectedUnitId = null;
          this.selectedBuildingId = this.base.tileBoard.board[tile.y][tile.x].buildingId;
          return;
        }

        console.log("Moving unit");
        // calculate the path to the target and move there
        this.base.units[this.selectedUnitId].destination = tilePosition;
        let origin = this.base.units[this.selectedUnitId].tilePosition;
       
        let path = this.base.tileBoard.calculatePath(origin, tilePosition)

        this.base.units[this.selectedUnitId].setPath(path);
        this.base.units[this.selectedUnitId].setAction(UnitFH.Actions.Move);
      } 
      
      else if (this.action === UnitFH.Actions.Attack) {
        console.log("Attacking");
        this.base.units[this.selectedUnitId].orientation = angleToOrientation(
          p5.Vector.sub(tilePosition, this.base.units[this.selectedUnitId].position).heading()
        );        
        //console.log(this.city.elements[this.selectedElementId])
        this.base.units[this.selectedUnitId].shoot(tilePosition)
      }        
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
    }
  }

  update() {
    // Enter sequence
    if (this.enterSequence && this.horizontalTrain.position.x > 1100) {
      this.horizontalTrain.setGear("N")
      if (this.horizontalTrain.velocity == 0) {
        // this.horizontalTrain.acceleration = 0;
        // this.horizontalTrain.velocity = 0;
        this.enterSequence = false;
        this.unloadUnits();
        this.exitSequence = true;
        this.horizontalTrain.setGear("D");
      }
    }

    // Exit sequence
    // if (this.exitSequence && this.horizontalTrain.wagons.at(-1).position.x > mainCanvasDim[0]+200) {
    //   //game.currentScene = game.navigationScene;
    //   //game.navigationScene.getNewIntersection(game.navigationScene.locomotive.currentTile, game.navigationScene.locomotive.orientation);
    // }

    for (let unit of this.base.units) {
      //this.base.tileBoard.board[unit.tilePos.y][unit.tilePos.x].setUnitId(null);
      unit.update();
      //this.tileBoard.board[unit.tilePos.y][unit.tilePos.x].setUnitId(unit.id);
      //this.idxBoard.showSmall();
    }    
    this.camera.update();
    this.horizontalTrain.update();
  }

  show() {
    mainCanvas.background(0)
    this.base.show(this.camera.position);
    this.horizontalTrain.show(createVector(0,0));
    mainCanvas.rect(mainCanvasDim[0]-300,mainCanvasDim[1]-300,300,300)
  }
}