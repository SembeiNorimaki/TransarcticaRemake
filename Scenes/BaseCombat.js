class BaseCombat {
  constructor(base) {
    this.base = base;
    this.camera = new Camera(createVector(0, 94*35));
    // this.camera = new Camera(createVector(0, 0));
    this.currentPlayer = Game.Players.Human

    this.action = UnitFH.Actions.Move;
    this.selectedUnitId = null;
    this.selectedBuildingId = null;
    this.enterSequence = false;
    this.exitSequence = false;

    this.currentEnemyIdx = 0;
    this.currentEnemyUnit = this.base.units[0];


    
    // sounds.battle.setVolume(0.5)
    // sounds.battle.play()

    // this.camera.setDestination(createVector(100,300));
  }



  initialize() {
    this.horizontalTrain = new HorizontalTrain(Game.Players.Human);
    this.horizontalTrain.setPosition(createVector(74, 98));
    this.horizontalTrain.setVelocity(-200);
    
    this.unloadUnits();
    // this.endTurn();
  }

  unloadUnits() {
    let units = game.playerTrain.wagons[3].unloadAll();
    let x = 86;
    let y = 89;
    for (let unit of units) {
      unit.setPosition(createVector(x,y))
      
      x++;
      y--;
    }
    this.base.addUnits(units);
  }

  setAction(action) {
    if (action === UnitFH.Actions.Attack) {
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
      if (this.selectedUnitId !== null) {
        this.base.units[this.selectedUnitId].isSelected = false;
      }
      this.selectedUnitId = null;
      this.selectedBuildingId = null;
      // this.base.tileBoard.floodBoard = undefined;
      this.setAction(UnitFH.Actions.Move);
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
      // If we clicked one of our units
      if (this.base.tileBoard.board[tilePosition.y][tilePosition.x].isUnit()) {
        let unitId = this.base.tileBoard.board[tilePosition.y][tilePosition.x].unitId;
        if (this.base.units[unitId].isEnemy() == false) {
          console.log(`Selecting unit ${unitId}`);
          this.selectedUnitId = unitId;
          this.camera.setDestination(boardToScreen(tilePosition, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2)));
          this.base.units[this.selectedUnitId].isSelected = true;
        }
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
      
      else if (this.action === UnitFH.Actions.Attack) {
        console.log("Attacking");
        // this.base.units[this.selectedUnitId].orientation = angleToOrientation(
        //   p5.Vector.sub(tilePosition, this.base.units[this.selectedUnitId].position).heading()
        // );        
        //console.log(this.city.elements[this.selectedElementId])
        this.base.units[this.selectedUnitId].shoot(tilePosition)
        //this.base.units[this.selectedUnitId].calculateHitProbability(tilePosition);
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

  closestTarget(refUnit) {
    let closestDistance = 10000;
    let closestUnit = null;
    console.log(`Ref Unit Pos: ${refUnit.position.array()}`)
    for (const unit of this.base.units) {
      if (unit.isEnemy()) {
        continue;
      } 
      console.log(`Unit U${unit.id}: ${unit.position.array()}`)
      let distance = manhattanDistance(refUnit.position, unit.position);
      console.log(`Distance to U${unit.id}: ${distance}`)
      if (distance < closestDistance) {
        closestDistance = distance;
        closestUnit = unit;
      }
    }
    console.log(`Closest unit is: U${closestUnit}`)
    return closestUnit;
  }

  // decideAction() {
  //   let closestUnitId = this.closestTarget(this.currentEnemyUnit);
  //   // console.log(this.currentEnemyUnit.tilePos.array())
  //   // console.log(this.city.units[closestUnitId].tilePos.array())

  //   let path = this.base.tileBoard.calculatePath(this.currentEnemyUnit.tilePosition,
  //     p5.Vector.add(this.base.units[closestUnitId].tilePosition, createVector(0,-2)));
    
  //   // let path = this.base.tileBoard.calculatePath(
  //   //   this.currentEnemyUnit.tilePosition,
  //   //   this.base.units[closestUnitId].tilePosition
  //   // );
      

  //   console.log(`Moving enemy unit ${this.currentEnemyIdx}`);

  //   // let path = this.calculatePath(
  //   //   this.currentEnemyUnit.pos, 
  //   //   p5.Vector.add(this.currentEnemyUnit.pos, 
  //   //     createVector(2,0)));
  //   // console.log(path)
  //   this.currentEnemyUnit.setPath(path);
    
  //   this.currentEnemyUnit.setAction(UnitFH.Actions.Move);
  //   // console.log(this.enemyTurnUnitIdx)
  //   // let candidates = this.enemyForces[this.enemyTurnUnitIdx].unitsInShootingRange();
    
  //   // this.enemyForces[this.enemyTurnUnitIdx].shoot(this.city.elements[candidates[0]].pos)
  //   // console.log(`${this.enemyTurnUnitIdx} shhots ${this.city.elements[candidates[0]].id}`)
  //   //this.enemyForces[this.enemyTurnUnitIdx].shoot(this.city.elements[candidates[0].pos])
  //   // this.enemyForces[this.enemyTurnUnitIdx].path = [
  //   //   p5.Vector.add(this.enemyForces[this.enemyTurnUnitIdx].pos,
  //   //   createVector(0,-2))];
  // }

  enemyTurn() {
    this.currentEnemyUnit.update();
    if (this.currentEnemyUnit.action === UnitFH.Actions.Finished) {
      if (this.selectNextEnemyUnit()) {
        // If we succesfully selected the next enemy unit, decide an action
        this.currentEnemyUnit.unitAI.decideAction();
      } else {
        // otherwise it means that there are no more enemy units, finish the turn
        console.log("Enemy turn completed");        
        this.currentPlayer = Game.Players.Human;
        // for (const unit of this.base.units) {
        //   //unit.replenishAp();
        // }
      }
    }
  }

  selectNextEnemyUnit() {
    for (let i=this.currentEnemyIdx+1; i<this.base.units.length; i++) {
      if (this.base.units[i].isEnemy()) {
        this.currentEnemyUnit = this.base.units[i];
        this.currentEnemyIdx = i;
        this.camera.setPosition(boardToScreen(this.currentEnemyUnit.position, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2)));
        return true;
      }
    }
    return false;
  }

  endTurn() {
    for (let unit of this.base.units) {
      unit.replenishAp();
    }
    this.currentEnemyIdx = 0
    this.currentEnemyUnit = this.base.units[0];
    this.camera.setPosition(boardToScreen(this.currentEnemyUnit.position, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2)));
    this.currentPlayer = Game.Players.Cpu;
    this.currentEnemyUnit.unitAI.decideAction();
  }

  
  

  update() {
    if (this.currentPlayer === Game.Players.Cpu) {
      this.enemyTurn();
      return;
    }



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
      if (unit.owner == this.currentPlayer) {
        //this.base.tileBoard.board[unit.tilePos.y][unit.tilePos.x].setUnitId(null);
        unit.update();
        //this.tileBoard.board[unit.tilePos.y][unit.tilePos.x].setUnitId(unit.id);
        //this.idxBoard.showSmall();
      }
    }    
    this.camera.update();
    this.horizontalTrain.update();
  }

  show() {
    this.base.show(this.camera.position);
    this.horizontalTrain.show(this.camera.position);
    return;
    if (this.action === UnitFH.Actions.Attack && this.selectedUnitId !== null) {
      mainCanvas.text(this.base.units[this.selectedUnitId].calculateHitProbability(screenToBoard(createVector(mouseX, mouseY), this.camera.position)), mouseX, mouseY-20)
    }
    
  }
}