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

    this.board = [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0]      
    ]
    this.boardDim = createVector(200, 200);
    
    this.camera = new Camera(createVector(0,0));

    
    this.playerHTrain = new HorizontalTrain(Game.Players.Human);
    this.playerHTrain.setPosition(createVector(1400, 845));
    this.playerHTrain.update();

    // Maybe there's no enemy train
    this.enemyHTrain = null;
    if (enemyTrain !== null) {
      this.enemyHTrain = new HorizontalTrain(Game.Players.Cpu);
      this.enemyHTrain.setPosition(createVector(1400, 80));
      this.enemyHTrain.update();
    }

    this.backgroundImg = this.generateCombatBackground();

    // TODO: currently soldierAI is inside soldier. Is this then necessary?
    this.combatAI = new CombatAI();

    // TODO: more than one cannonball is possible (enemy and player shooting simultanously). Make this an array
    this.cannonball = null;
    this.machinegunbullets = null;

    this.playerUnits = [];
    this.enemyUnits = [];
    
    this.playerUnits.push(new Rifleman(1, createVector(500,650), 0, Game.Players.Human));
    this.enemyUnits.push(new Wolf(0, createVector(500,-100), Game.Players.Cpu));
    
    this.enemyUnits[0].setRole({
      "role": "patrol",
      "waypoints": [
        createVector(500,800),
        createVector(1000,800),
      ]
    });
    

    this.selectedWagon = null;
  }

  initialize() {
    this.combatAI.initialize();
  }

  generateCombatBackground() {
    let backgroundImg = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let x,y;
    for (let row=-1; row<13; row++) {
      y = row*tileHalfSizes.Z1.y*2;
      for (let col=0; col<15; col++) {
        x = col*tileHalfSizes.Z1.x*2;
        Tile.draw(backgroundImg, 0x01, createVector(x,y));
        Tile.draw(backgroundImg, 0x01, createVector(x-tileHalfSizes.Z1.x, y+tileHalfSizes.Z1.y));
      }
    }
    for (let i=-1;i<30;i++) {
      if (!(i%2)) {
        Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, mainCanvasDim[1]-1*tileHalfSizes.Z1.y));
        if (this.enemyHTrain !== null) {
          Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 2*tileHalfSizes.Z1.y));
        }
        
      }
      else {
        Tile.draw(backgroundImg, 0x32, createVector(i*tileHalfSizes.Z1.x, mainCanvasDim[1]-0*tileHalfSizes.Z1.y));
        if (this.enemyHTrain !== null) {
          Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 3*tileHalfSizes.Z1.y));
        }
      }
    }
    
    return backgroundImg;
  }

  // Left arrow: Locomotive gear down
  // Right arrow: Locomotive gear up
  processKey(key) {
    if (key == "ArrowLeft") {
      this.playerHTrain.gearDown();
    } else if (key == "ArrowRight") {
      this.playerHTrain.gearUp();
    }

    else if (key.toUpperCase() == "A") {
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
    mousePos.add(this.camera.position);
    // Click on own train
    if (mousePos.y > 750) {
      let i = this.playerHTrain.onClick(mousePos, this.camera.position);
      this.selectedWagon = this.playerHTrain.wagons[i];
      if (this.selectedWagon.name == "Cannon") {
        this.selectedWagon.fire();
        // this.fireCannon(i);
      } else if (this.selectedWagon.name == "Machinegun") {
        // this.fireMachinegun(i);
        this.selectedWagon.fire();
      } else if (this.selectedWagon.name == "Barracks") {
        this.deploySoldier(i);
      } else if (this.selectedWagon.name == "Livestock") {
        this.deployMamooth(i);
      }
    }
    // Click on enemy train
    else if (mousePos.y < 120 && this.enemyHTrain !== null) {
      let i = this.enemyHTrain.onClick(mousePos, this.camera.position);
      let wagonName = this.enemyHTrain.wagons[i].name;
      console.log(`Clicked enemy wagon ${i}: ${wagonName}`);
    }
    // click on the battlefield
    else {
      if (mouseButton == "left") {
        //check if soldier is clicked, then select/deselect it
        for (let soldier of this.playerUnits) {
          soldier.selected = soldier.checkClick(mousePos);
        }
        
        //check if mamooth is clicked
        

      } 
      else if (mouseButton == "right") {
        for (let soldier of this.playerUnits) {
          if (soldier.selected) {
            // if we click in an empty zone, move there
            for (let enemy of this.enemyUnits) {
              if (enemy.checkClick(mousePos)) {
                console.log(`Setting enemy target to enemyId ${enemy.id}`)
                soldier.setTargetUnit(enemy);
                soldier.setTargetPosition(mousePos);
                return;
              }
            }

            // if we click on an enemy soldier, set him as a target
            soldier.setTargetPosition(mousePos);
            break;
          }
        } 
        
        // for (let mamooth of this.playerMamooths) {
        //   if (mamooth.selected) {
        //     mamooth.setTargetPosition(mousePos);
        //     break;
        //   }
        // }
      }   
    }
  }

  deploySoldier(i) {
    let spawnPosition = createVector(this.playerHTrain.wagons[i].position.x + this.playerHTrain.wagons[i].halfSize.x, 760);
    this.playerUnits.push(new Rifleman(9,spawnPosition,0,Game.Players.Human));
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
    let spawnPosition = createVector(this.enemyHTrain.wagons[i].position.x + this.enemyHTrain.wagons[i].halfSize.x + spot*20, 100);
    this.enemyUnits.push(new Rifleman(12,spawnPosition, 0, Game.Players.Cpu));
  }

  deployMamooth(i) {
    let spawnPosition = createVector(this.playerHTrain.wagons[i].position.x + this.playerHTrain.wagons[i].halfSize.x, 700);
    this.playerMamooths.push(new Mamooth(15,spawnPosition,Game.Players.Human));
  }

  // fireCannon(i) {   
  //   let spawnPosition = createVector(this.playerHTrain.wagons[i].position.x + this.playerHTrain.wagons[i].halfSize.x, this.playerHTrain.wagons[i].position.y-40); 
  //   this.cannonball = new Cannonball(spawnPosition);
  // }

  // fireMachinegun(i) {   
  //   let spawnPosition = createVector(this.playerHTrain.wagons[i].position.x + this.playerHTrain.wagons[i].halfSize.x, this.playerHTrain.wagons[i].position.y-40); 
  //   this.cannonball = new Cannonball(spawnPosition);
  // }

  cannonHitEnemy(pos) {
    console.log(pos)
    console.log(this.enemyHTrain)
    let i = this.enemyHTrain.onClick(pos, this.camera.position);
    if (i === null) 
      return;
    let wagonName = this.enemyHTrain.wagons[i].name;
    console.log(`Cannon hits enemy wagon ${i}: ${wagonName}`);
    this.enemyHTrain.wagons[i].receiveDamage(40);
  }

  update() {
    // update trains
    this.playerHTrain.update();
    if (this.enemyHTrain !== null) {
      this.enemyHTrain.update();
    }
    
    //this.combatAI.update();

    if (this.cannonball !== null) {
      this.cannonball.update();
      if (this.cannonball.finished) {
        this.cannonHitEnemy(this.cannonball.position)
        this.cannonball = null;
      }
    }

    if (this.machinegunbullets !== null) {
      this.machinegunbullets.update();
      if (this.machinegunbullets.finished) {
        // this.cannonHitEnemy(this.cannonball.position)
        this.machinegunbullets = null;
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


    //if (frameCount % 4 === 0) {
      
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
    hudCanvas.fill(200)
    hudCanvas.rect(mainCanvasDim[0] - 600,0,600,60);

    this.factor = 200;
    
    let xmax, xmin;
    // enemy
    if (this.enemyHTrain !== null) {
      hudCanvas.fill("red");
      xmax = mainCanvasDim[0] - 600 + this.factor * (this.enemyHTrain.wagons[0].position.x + 2*this.enemyHTrain.wagons[0].halfSize.x)/ mainCanvasDim[0];
      xmin = mainCanvasDim[0] - 600 + this.factor * this.enemyHTrain.wagons.at(-1).position.x / mainCanvasDim[0];
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
    xmax = mainCanvasDim[0] - 600 + this.factor * (this.playerHTrain.wagons[0].position.x + 2*this.playerHTrain.wagons[0].halfSize.x)/ mainCanvasDim[0];
    xmin = mainCanvasDim[0] - 600 + this.factor * this.playerHTrain.wagons.at(-1).position.x / mainCanvasDim[0];
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


  showBoard() {
    mainCanvas.push();
    mainCanvas.noFill();
    mainCanvas.strokeWeight(0.1)
    this.boardDim.set(85,39);
    let D = 20;
    for (let row=5; row< this.boardDim.y; row++) {
      for (let col=0; col< this.boardDim.x; col++) {
        mainCanvas.rect(col*D,row*D,D,D);
      }  
    }
    mainCanvas.pop();
  }
  show() {
    mainCanvas.image(this.backgroundImg, 0, 0);
    
    this.playerHTrain.show(this.camera.position);
    if (this.enemyHTrain !== null) {
      this.enemyHTrain.show(this.camera.position);
    }
    
    if (this.cannonball !== null) {
      this.cannonball.show(this.camera.position);
    }

    if (this.machinegunbullets !== null) {
      this.machinegunbullets.show(this.camera.position);
    }

    for (let soldier of this.playerUnits) {
      soldier.show(this.camera.position);
    }

    for (let soldier of this.enemyUnits) {
      soldier.show(this.camera.position);
    }

    if (this.selectedWagon !== null) {
      this.selectedWagon.showHud();
    }

    this.showMinimap();

    //this.showBoard();
  
    mainCanvas.text(this.camera.position.array(), 10,20)
  }
}