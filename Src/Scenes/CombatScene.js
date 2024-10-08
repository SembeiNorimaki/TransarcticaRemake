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

class CombatScene {
  constructor(playerTrain, enemyTrain) {
    this.tileHalfSize = tileHalfSizes.Z1;
       
    this.camera = new Camera(createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2))
    this.backgroundImg = this.populateBackgroundImg();

    this.playerHTrain = new HorizontalTrain(Game.Players.Human, playerTrain.wagons);
    this.playerHTrain.setPosition(createVector(48, 0));
    this.playerHTrain.setAccelerationsVelocities(0.002, 0.002, 0.05, -0.05);
    this.playerHTrain.update();

    //Maybe there's no enemy train
    this.enemyHTrain = null;
    if (enemyTrain !== null) {
      this.enemyHTrain = new HorizontalTrain(Game.Players.Cpu, enemyTrain.wagons);
      this.enemyHTrain.setAccelerationsVelocities(0.002, 0.002, 0.05, -0.05);
      this.enemyHTrain.setPosition(createVector(20, -16));
      this.enemyHTrain.update();
    }

    this.selectedWagon = null;

    // TODO: currently soldierAI is inside soldier. Is this then necessary?
    this.combatAI = new CombatAI();

    this.cannonballs = [];
    this.machinegunBullets = [];

    this.playerUnits = [];
    this.enemyUnits = [];
    
    // this.playerUnits.push(new Rifleman(1, createVector(500,650), 0, Game.Players.Human));
    // this.enemyUnits.push(new Wolf(0, createVector(500,-100), Game.Players.Cpu));
    
    // this.enemyUnits[0].setRole({
    //   "role": "patrol",
    //   "waypoints": [ 
    //     createVector(500,800),
    //     createVector(1000,800),
    //   ]
    // });    

    
  }

  initialize() {
    this.combatAI.initialize();
  }

  populateBackgroundImg() {
    let img = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let nCols = 27;
    let nRows = 26;
    let x, y;
    for (let row=0; row<nRows; row++) {
      y = row * this.tileHalfSize.y*2;
      for (let col=0;col<nCols; col++) {
        x = col * this.tileHalfSize.x*2;
        Tile.draw(img, 0x6E, createVector(x,y), this.tileHalfSize)
        Tile.draw(img, 0x6E, createVector(x+this.tileHalfSize.x, y+this.tileHalfSize.y), this.tileHalfSize)
      }
    }

    // bottom and top rail
    let yBottom = 24 * this.tileHalfSize.y*2;
    let yTop = 2 * this.tileHalfSize.y*2;
    for (let col=0;col<nCols; col++) {
      x = col * this.tileHalfSize.x*2;
      Tile.draw(img, 0x83, createVector(x, yTop), this.tileHalfSize);
      Tile.draw(img, 0x82, createVector(x+this.tileHalfSize.x, yTop+this.tileHalfSize.y), this.tileHalfSize);

      Tile.draw(img, 0x83, createVector(x, yBottom), this.tileHalfSize);
      Tile.draw(img, 0x82, createVector(x+this.tileHalfSize.x, yBottom+this.tileHalfSize.y), this.tileHalfSize);
    }

    return img;
  }



  // Left, right arrow: Move locomotive
  // A, S: Move camera
  processKey(key) {
    if (key == "ArrowLeft") {
      this.playerHTrain.gearDown();
    } else if (key == "ArrowRight") {
      this.playerHTrain.gearUp();
    } else if (key.toUpperCase() == "A") {
      if (this.camera.position.x >= 100) {
        this.camera.move(createVector(-300, 0));
      }
    } else if (key.toUpperCase() == "S") {
      if (this.camera.position.x <= 3300) {
        this.camera.move(createVector(300, 0));
      }
    }
  }

  onClick(mousePos) {   
    // Horizontal train
    let wagonIdx = this.playerHTrain.onClick(mousePos, this.camera.position);
    if (wagonIdx !== null) {
      console.log(`Clicked wagon ${wagonIdx}`);
      this.selectedWagon = this.playerHTrain.wagons[wagonIdx];
      switch(this.selectedWagon.name) {
        case("Cannon"):
        this.selectedWagon.fire();
        break;
        case("Machinegun"):
        this.selectedWagon.fire();
        break;
        case("Barracks"):
        this.deploySoldier(wagonIdx);
        break;
        case("Livestock"):
        this.deployMamooth(wagonIdx);
        break;
      };
      return;
    } 

    // Click on enemy train
    wagonIdx = this.enemyHTrain.onClick(mousePos, this.camera.position);
    if (wagonIdx !== null) {
      console.log(`Clicked enemy wagon ${wagonIdx}`);
      return;
    }    

    // Left click on the battlefield deselects soldier   
    if (mouseButton == "left") {
      //check if soldier is clicked, then select/deselect it
      for (let soldier of this.playerUnits) {
        soldier.selected = soldier.checkClick(mousePos);
        if (soldier.selected) {
          console.log(`Soldier ${soldier.id} selected`)
          return;
        }
      }
      return;
    }

    // Right click on the battlefield    
    if (mouseButton == "right") {
      for (let soldier of this.playerUnits) {
        if (soldier.selected) {        
          
          // if we click on an enemy soldier, set him as a target
          for (let enemy of this.enemyUnits) {
            if (enemy.checkClick(mousePos)) {
              console.log(`Setting enemy target to enemyId ${enemy.id}`)
              soldier.setTargetUnit(enemy);
              soldier.setTargetPosition(mousePos);
              return;
            }
          }

          // if we click in an empty zone, move there
          soldier.setTargetPosition(Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize));
          return;
        }
      } 
      
      return;
    }  
  }

  deploySoldier(i) {
    let unit = game.playerTrain.wagons[i].deploySoldier();
    this.playerUnits.push(unit);
  }
  
  findEnemyBarracks() {
    for (let [i, wagon] of this.enemyHTrain.wagons.entries()) {
      if (wagon.name == "Barracks_vu") {
        return i;
      }
    }
    return null;
  }

  deployEnemySoldier(spot) {
    // find a barracks wagon
    let i = this.findEnemyBarracks();
    let spawnPosition = p5.Vector.add(this.enemyHTrain.wagons[i].position, createVector(0.5*spot, -0.5*spot));
    this.enemyUnits.push(new Rifleman(12, spawnPosition, 0, Game.Players.Cpu));
  }


  cannonHitEnemy(pos) {
    let screenPos = Geometry.boardToScreen(pos, this.camera.position, this.tileHalfSize);
    let i = this.enemyHTrain.onClick(screenPos, this.camera.position);
    if (i === null) 
      return;
    let wagonName = this.enemyHTrain.wagons[i].name;
    console.log(`Cannon hits enemy wagon ${i}: ${wagonName}`);
    this.enemyHTrain.wagons[i].receiveDamage(40);
  }
  cannonHitPlayer(pos) {
    let screenPos = Geometry.boardToScreen(pos, this.camera.position, this.tileHalfSize);
    let i = this.playerHTrain.onClick(screenPos, this.camera.position);
    if (i === null) 
      return;
    let wagonName = this.playerHTrain.wagons[i].name;
    console.log(`Cannon hits player wagon ${i}: ${wagonName}`);
    this.playerHTrain.wagons[i].receiveDamage(40);
  }

  machinegunHitUnit(unit) {
    unit.receiveDamage(1);
  }

  update() {
    // update trains
    this.playerHTrain.update();
    if (this.enemyHTrain !== null) {
      this.enemyHTrain.update();
    }
    
    this.combatAI.update();

    // Cannonball
    for (let [i, cannonball] of this.cannonballs.entries()) {
      if (cannonball === null) {
        continue;
      }
      cannonball.update();
      if (cannonball.finished) {
        if (cannonball.direction == "N") {
          this.cannonHitEnemy(cannonball.position)
        } else {
          this.cannonHitPlayer(cannonball.position)
        }
        this.cannonballs[i] = null;
      }
    }

    // Machinegun bullets
    for (let [i, machinegunBullet] of this.machinegunBullets.entries()) {
      if (machinegunBullet === null) {
        continue;
      }
      machinegunBullet.update();
      // Check if the bullet hits a soldier
      for (let unit of this.playerUnits) {
        if (machinegunBullet.position.dist(unit.position) < 0.5) {
          machinegunBullet.explode();
          this.machinegunHitUnit(unit);
        }
      }

      if (machinegunBullet.finished) {
        
        this.machinegunBullets[i] = null;
      }
    }

    // remove dead soldiers
    for (let i=0; i<this.playerUnits.length; i++) {
      if (this.playerUnits[i].dead) {
        this.playerUnits.splice(i, 1);
        i--;
      }
    }
    for (let i=0; i<this.enemyUnits.length; i++) {
      if (this.enemyUnits[i].dead) {
        this.enemyUnits.splice(i, 1);
        i--;
      }
    }

      
    // check if enemy in range and engage
    for (let soldier of this.playerUnits) {
      for(let enemy of this.enemyUnits) {
        if (soldier.inAttackRange(enemy.position)) {
          soldier.setAction(Soldier.Action.Shoot);
          soldier.setTargetUnit(enemy);
        }
      }
      soldier.update();
    }

    for (let enemy of this.enemyUnits) {
      enemy.update();
    }
  }

  // TODO: show in hud. Maybe make it a class
  showMinimap() {
    hudCanvas.push();
    hudCanvas.fill(200);
    hudCanvas.rect(mainCanvasDim[0] - 600,0,600,60);

    this.factor = 200;
    
    let xmax, xmin;
    // enemy
    if (this.enemyHTrain !== null) {
      hudCanvas.fill("red");
      let screenPosFirst = Geometry.boardToScreen(this.enemyHTrain.wagons[0].position, this.camera.position, this.tileHalfSize);
      let screenPosLast = Geometry.boardToScreen(this.enemyHTrain.wagons.at(-1).position, this.camera.position, this.tileHalfSize);

      xmax = mainCanvasDim[0] - 600 + this.factor * (screenPosFirst.x + 2*this.enemyHTrain.wagons[0].halfSize.x) / mainCanvasDim[0];
      xmin = mainCanvasDim[0] - 600 + this.factor * screenPosLast.x / mainCanvasDim[0];
      hudCanvas.rect(xmin, 1, xmax - xmin, 4);
    }

    for (let enemy of this.enemyUnits) {
      hudCanvas.rect(
        mainCanvasDim[0] - 600 + this.factor * enemy.position.x / mainCanvasDim[0],
        60 * enemy.position.y / mainCanvasDim[1], 
        4, 4);
    }
    
    // player
    hudCanvas.fill("blue");
    let screenPosFirst = Geometry.boardToScreen(this.playerHTrain.wagons[0].position, this.camera.position, this.tileHalfSize);
    let screenPosLast = Geometry.boardToScreen(this.playerHTrain.wagons.at(-1).position, this.camera.position, this.tileHalfSize);
    xmax = mainCanvasDim[0] - 600 + this.factor * (screenPosFirst.x + 2*this.playerHTrain.wagons[0].halfSize.x)/ mainCanvasDim[0];
    xmin = mainCanvasDim[0] - 600 + this.factor * screenPosLast.x / mainCanvasDim[0];
    hudCanvas.rect(xmin, 55, xmax - xmin, 4);
    
    for (let soldier of this.playerUnits) {
      hudCanvas.rect(
        mainCanvasDim[0] - 600 + this.factor * soldier.position.x / mainCanvasDim[0],
        60 * soldier.position.y / mainCanvasDim[1], 
        4, 4);
    }
    hudCanvas.noFill();
    hudCanvas.stroke("black");
    hudCanvas.strokeWeight(2)
    hudCanvas.rect(mainCanvasDim[0] - 600 + this.factor*this.camera.position.x/mainCanvasDim[0],0,200,60)

    
    
    hudCanvas.pop();
  }



  show() {
    mainCanvas.background(0);
    mainCanvas.image(this.backgroundImg, 0, 0);
   
    
    if (this.enemyHTrain !== null) {
      this.enemyHTrain.show(this.camera.position);
    }
    
    for (let cannonball of this.cannonballs) {
      if (cannonball === null) {
        continue;
      }
      cannonball.show(this.camera.position, this.tileHalfSize);
    }

    for (let machinegunBullet of this.machinegunBullets) {
      if (machinegunBullet === null) {
        continue;
      }
      machinegunBullet.show(this.camera.position, this.tileHalfSize);
    }

    for (let soldier of this.playerUnits) {
      soldier.show(this.camera.position, this.tileHalfSize);
    }

    for (let soldier of this.enemyUnits) {
      soldier.show(this.camera.position, this.tileHalfSize);
    }

    this.playerHTrain.show(this.camera.position);

    if (this.selectedWagon !== null) {
      this.selectedWagon.showHud();
    }

    this.showMinimap();

    //this.showBoard();
  
    mainCanvas.text(this.camera.position.array(), 10,20)
  }
}