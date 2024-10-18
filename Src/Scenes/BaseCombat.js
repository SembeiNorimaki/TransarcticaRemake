class BaseCombat {
  constructor(base) {
    this.tileHalfSize = tileHalfSizes.Z1;
    // sounds.CityMusic2.play();
    this.base = base;
    this.camera = new Camera(createVector(0, 86*35));
    // this.camera = new Camera(createVector(0, 0));
    this.currentPlayer = Game.Players.Human

    this.action = UnitFH.Actions.Move;
    this.selectedUnitId = null;
    this.selectedBuildingId = null;
    this.enterSequence = true;
    this.exitSequence = false;

    this.currentEnemyIdx = 0;
    this.currentEnemyUnit = this.base.units[0];
    this.conversationPanel = new ConversationPanel();

    if (this.base.owner == Game.Players.Human) {
      this.attacker = Game.Players.Cpu;
    } else {
      this.attacker = Game.Players.Human;
    }




    
    // sounds.battle.setVolume(0.5)
    // sounds.battle.play()

    // this.camera.setDestination(createVector(100,300));
  }



  initialize() {
    // TODO: What if it's the enemy attacking the base?
    // Then the horizontal Train doesn't belong to the player.
    // Also there could be 2 enemy trains attacking: Nord and South
    if (this.attacker == Game.Players.Human) { 
      this.horizontalTrain = new HorizontalTrain(Game.Players.Human, game.playerTrain.wagons);
      this.horizontalTrain.setPosition(createVector(200, 0));
      this.attackerTrain = game.playerTrain;
    } else {
      this.horizontalTrain = new HorizontalTrain(Game.Players.Cpu, game.enemyTrain.wagons);
      this.horizontalTrain.setPosition(createVector(74, 98));
      this.attackerTrain = game.enemyTrain;
    }

    this.horizontalTrain.setVelocity(0.2);
  }

  unloadUnits() {
    let x = 86;
    let y = 89;
    for (let wagon of this.attackerTrain.wagons) {
      if (wagon.constructor.name == "VehicleWagon") {
        let units = wagon.unloadAll();
        for (let unit of units) {
          unit.setPosition(createVector(x,y))      
          x++;
          y--;
        }
        this.base.addUnits(units);
      }
    }  
    
    this.base.addUnit(new Rifleman(this.base.units.length, createVector(95,95), Game.Players.Human))
    this.base.addUnit(new Wolf(this.base.units.length, createVector(95,95), Game.Players.Human))
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
    // right click makes a unit look at mousePosition
    if (mouseButton === RIGHT && this.selectedUnitId !== null) {
      this.base.units[this.selectedUnitId].lookAt(Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize));
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

    let tilePosition = Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize);
    let tile = this.base.tileBoard.board[tilePosition.y][tilePosition.x];
    console.log(`Clicked ${tilePosition.array()}`)

    // if we don't have anything selected
    if (this.selectedUnitId === null && this.selectedBuildingId === null) {      
      // If we clicked a unit
      if (tile.isUnit() && !this.base.units[tile.unitId].isEnemy()) {
        console.log(`Selecting unit ${tile.unitId}`);
        this.selectedUnitId = tile.unitId;
        //this.camera.setDestination(Geometry.boardToScreen(tilePosition, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2), this.tileHalfSize));

        this.base.units[this.selectedUnitId].isSelected = true;
      } 
      // If we clicked a building
      else if (tile.isBuilding()) {
        console.log("Selecting building");
        this.selectedBuildingId = tile.buildingId;       
      }
      // If we clicked a tile 
      else {
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
        // this.base.units[this.selectedUnitId].orientation = Geometry.angleToOrientation(
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
    } else if (key == "Escape") {
      // Deselect code
      console.log("Deselecting all");      
      if (this.selectedUnitId !== null) {
        this.base.units[this.selectedUnitId].isSelected = false;
      }
      this.selectedUnitId = null;
      this.selectedBuildingId = null;
      // this.base.tileBoard.floodBoard = undefined;
      this.setAction(UnitFH.Actions.Move);
    }
  }

  closestTarget(refUnit) {
    let closestDistance = 10000;
    let closestUnit = null;
    console.log(`Ref Unit Pos: ${refUnit.position.array()}`)
    for (const unit of this.base.units) {
      if (unit === null || unit.isEnemy()) {
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
    for (let [i, unit] of this.base.units.entries()) {
      if (unit !== null && unit.isEnemy() && unit.action != UnitFH.Actions.Finished) {
        this.currentEnemyUnit = unit;
        this.currentEnemyIdx = i;
        this.camera.setPosition(Geometry.boardToScreen(this.currentEnemyUnit.position, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2), this.tileHalfSize));
        return true;
      }
    }
    return false;
  }

  endTurn() {
    for (let unit of this.base.units) {
      if (unit !== null) {
        unit.replenishAp();
      }
    }
    this.currentEnemyIdx = 0
    this.selectNextEnemyUnit();
    this.camera.setPosition(Geometry.boardToScreen(this.currentEnemyUnit.position, createVector(mainCanvasDim[0]/2,mainCanvasDim[1]/2), this.tileHalfSize));
    this.currentPlayer = Game.Players.Cpu;
    this.currentEnemyUnit.unitAI.decideAction();
  }

  
  

  update() {
    let nPlayerForces = 0;
    let nEnemyForces = 0;
    
    for (let [i, unit] of this.base.units.entries()) {
      if (unit !== null) {
        if(unit.isDead) {
          this.base.removeUnit(i);
          continue;
        }
        if(unit.owner == Game.Players.Human) {
          nPlayerForces++;
        } else {
          nEnemyForces++;
        }
      }
    }

    // if (this.enterSequence == false) {
    //   if (nPlayerForces == 0) {
    //     console.log("Game Over, enemy Wins");
    //     game.currentScene = game.navigationScene;
    //   } else if (nEnemyForces == 0) {
    //     console.log("Game Over, player Wins");
    //     game.currentScene = game.navigationScene;
    //   }
    // }

    

    if (this.currentPlayer === Game.Players.Cpu) {
      this.enemyTurn();
      return;
    }



    // Enter sequence
    if (this.enterSequence && this.horizontalTrain.position.x > 85) {
      this.horizontalTrain.setGear("N");
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
      if (unit !== null && unit.owner == this.currentPlayer) {
        //this.base.tileBoard.board[unit.tilePos.y][unit.tilePos.x].setUnitId(null);
        unit.update();
        
        // let viewTiles = unit.generateViewTiles();
        // for (let tilePos of viewTiles) {
        //   if (tilePos.x>=0 && tilePos.y >= 0) {
        //     this.base.tileBoard.board[tilePos.y][tilePos.x].reveal();
        //   }
        // }
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
      mainCanvas.text(this.base.units[this.selectedUnitId].calculateHitProbability(Geometry.screenToBoard(createVector(mouseX, mouseY), this.camera.position, this.base.tileHalfSize)), mouseX, mouseY-20)
    }
    
  }
}