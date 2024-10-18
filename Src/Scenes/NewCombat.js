class NewCombat {
  constructor(base) {
    this.tileHalfSize = tileHalfSizes.Z1;
    this.camera = new Camera(createVector(0, 0));
    this.base = base;
    this.currentPlayer = Game.Players.Human;
    this.action = UnitFH.Actions.Move;
    this.selectedUnitId = null;
    this.selectedBuildingId = null;

  }

  initialize() {
    // deploy units

  }

  // Move the camera, Move, attack & end turn
  processKey(key) {
    console.log(key)
    if (key == "ArrowLeft") {
      this.camera.move(createVector(-200,0))
    } else if (key == "ArrowRight") {
      this.camera.move(createVector(200,0))
    } else if (key == "ArrowUp") {
      this.camera.move(createVector(0,-100))
    } else if (key == "ArrowDown") {
      this.camera.move(createVector(0,100))
    } else if (key == "a") {
      this.setAction(UnitFH.Actions.Attack);
    } else if (key == "m") {
      this.setAction(UnitFH.Actions.Move);
    } else if (key == "e") {
      this.endTurn();
    }
  }

  onClick(mousePos) {
    let tilePosition = Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize);
    let tile = this.base.tileBoard.board[tilePosition.y][tilePosition.x];
    console.log(`Clicked ${tilePosition.array()}`);

    // if we don't have anything selected
    if (this.selectedUnitId === null && this.selectedBuildingId === null) {      
      // If we clicked a unit
      if (tile.isUnit() && !this.base.units[tile.unitId].isEnemy()) {
        console.log(`Selecting unit ${tile.unitId}`);
        this.selectedUnitId = tile.unitId;
        //this.camera.setDestination(Geometry.boardToScreen(tilePosition, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2), this.tileHalfSize));

        this.base.units[this.selectedUnitId].isSelected = true;
      } 

      return;
    }

    // if we already have a unit selected
    if (this.selectedUnitId !== null) {
      if (this.action === UnitFH.Actions.Move) {
        //check if the tile has a unit, if so, select it instead of moving
        if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isUnit()) {
          console.log("Reselecting unit");
          this.base.units[this.selectedUnitId].isSelected = false;
          this.selectedUnitId = this.base.tileBoard.board[tilePosition.y][tilePosition.x].unitId;
          this.selectedBuildingId = null;
          this.base.units[this.selectedUnitId].isSelected = true;
          // this.city.tileBoard.flood(tile, 10);
          return;
        } 
        //check if the tile has a building, if so, select it instead of moving
        if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isBuilding()) {
          console.log("Reselecting building");
          this.base.units[this.selectedUnitId].isSelected = false;
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
    }
  }

  update() {
    for (let unit of this.base.units) {
      if (unit !== null && unit.owner == this.currentPlayer) {
        unit.update();
        let viewTiles = unit.generateViewTiles();
        for (let tilePos of viewTiles) {
          if (tilePos.x>=0 && tilePos.y >= 0) {
            this.base.tileBoard.board[tilePos.y][tilePos.x].reveal();
          }
        }
      }
    }   
  }

  show() {
    mainCanvas.background(0);
    this.base.show(this.camera.position);
    
    // show red debug lines
    mainCanvas.push();
    mainCanvas.stroke("red")
    let aux = Geometry.boardToScreen(createVector(0,0),this.camera.position, this.tileHalfSize)
    mainCanvas.line(0,aux.y,mainCanvasDim[0],aux.y)
    mainCanvas.line(aux.x,0,aux.x,mainCanvasDim[1])
    mainCanvas.pop();
  }
}