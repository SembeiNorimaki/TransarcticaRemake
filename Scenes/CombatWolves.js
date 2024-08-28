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

class CombatWolves {
  constructor(playerTrain) {

    this.camera = new Camera(createVector(0,0));

    this.backgroundImg = this.generateCombatBackground();
    this.playerHTrain = new HorizontalTrain(Game.Players.Human);
    this.playerHTrain.setPosition(createVector(1400, 845));
    this.playerHTrain.update();

    // TODO: currently soldierAI is inside soldier. Is this then necessary?
    //this.combatAI = new CombatAI();

    // TODO: more than one cannonball is possible (enemy and player shooting simultanously). Make this an array
    this.cannonball = null;
    this.machinegunbullets = null;

    this.playerSoldiers = [];
    this.playerMamooths = [];
    this.enemyWolves = [];

    this.playerSoldiers.push(new Rifleman(0, createVector(500,650), 0, Game.Players.Human));
    
    this.enemyWolves.push(new Wolf(1, createVector(300,120), Game.Players.Cpu));
    
    this.enemyWolves[0].setRole({
      "role": "patrol",
      "waypoints": [
        createVector(300,120),
        createVector(500,120),
      ]
    });

    this.selectedWagon = null;
  }

  initialize() {
    //this.combatAI.initialize();
  }

  generateCombatBackground() {
    let backgroundImg = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let x,y;
    for (let row=-1; row<13; row++) {
      y = row*TILE_HEIGHT_HALF*2;
      for (let col=0; col<15; col++) {
        x = col*TILE_WIDTH_HALF*2;
        Tile.draw(backgroundImg, 0x01, createVector(x,y));
        Tile.draw(backgroundImg, 0x01, createVector(x-TILE_WIDTH_HALF, y+TILE_HEIGHT_HALF));
      }
    }
    for (let i=-1;i<30;i++) {
      if (!(i%2)) {
        Tile.draw(backgroundImg, 0x33, createVector(i*TILE_WIDTH_HALF, mainCanvasDim[1]-1*TILE_HEIGHT_HALF));
      }
      else {
        Tile.draw(backgroundImg, 0x32, createVector(i*TILE_WIDTH_HALF, mainCanvasDim[1]-0*TILE_HEIGHT_HALF));
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
      let i = this.playerHTrain.getClickedWagon(mousePos);
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
    // click on the battlefield
    else {
      if (mouseButton == "left") {
        //check if soldier is clicked, then select/deselect it
        for (let soldier of this.playerSoldiers) {
          soldier.selected = soldier.checkClick(mousePos);
        }
        
        //check if mamooth is clicked
        for (let mamooth of this.playerMamooths) {
          mamooth.selected = mamooth.checkClick(mousePos);  
        }

      } 
      else if (mouseButton == "right") {
        for (let soldier of this.playerSoldiers) {
          if (soldier.selected) {
            // if we click in an empty zone, move there
            for (let enemy of this.enemySoldiers) {
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
      }   
    }
  }

  deploySoldier(i) {
    let spawnPosition = createVector(this.playerHTrain.wagons[i].position.x + this.playerHTrain.wagons[i].halfSize.x, 760);
    this.playerSoldiers.push(new Rifleman(9,spawnPosition,0,Game.Players.Human));
  }
  

  deployMamooth(i) {
    let spawnPosition = createVector(this.playerHTrain.wagons[i].position.x + this.playerHTrain.wagons[i].halfSize.x, 700);
    this.playerMamooths.push(new Mamooth(15,spawnPosition,Game.Players.Human));
  }


  update() {
    this.playerHTrain.update();
    //this.combatAI.update();

    if (this.machinegunbullets !== null) {
      this.machinegunbullets.update();
      if (this.machinegunbullets.finished) {
        // this.cannonHitEnemy(this.cannonball.position)
        this.machinegunbullets = null;
      }
    }

    // remove dead soldiers
    for (let i=0; i<this.playerSoldiers.length; i++) {
      if (this.playerSoldiers[i].dead) {
        this.playerSoldiers.splice(i, 1);
        i--;
      }
    }
    for (let i=0; i<this.enemyWolves.length; i++) {
      if (this.enemyWolves[i].dead) {
        this.enemyWolves.splice(i, 1);
        i--;
      }
    }


      
    // check if enemy in range and engage
    for (let soldier of this.playerSoldiers) {
      for(let enemy of this.enemyWolves) {
        if (soldier.inRange(enemy.position)) {
          soldier.setAction(Soldier.Action.Shoot);
          soldier.setTargetUnit(enemy);
        }
      }
      soldier.update();
    }



    for (let mamooth of this.playerMamooths) {
      mamooth.update();
    }

    for (let enemy of this.enemyWolves) {
      enemy.update();
    }

  }

  // TODO: show in hud. Maybe make it a class
  showMinimap() {
    hudCanvas.push();
    hudCanvas.fill(200)
    hudCanvas.rect(mainCanvasDim[0] - 600,0,600,60);

    this.factor = 200;
    
    // enemy
    
    for (let enemy of this.enemyWolves) {
      hudCanvas.rect(
        mainCanvasDim[0] - 600 + this.factor * enemy.position.x / mainCanvasDim[0],
        60 * enemy.position.y / mainCanvasDim[1], 
        4, 4);
    }
    
    // player
    hudCanvas.fill("blue");
    let xmax = mainCanvasDim[0] - 600 + this.factor * (this.playerHTrain.wagons[0].position.x + 2*this.playerHTrain.wagons[0].halfSize.x)/ mainCanvasDim[0];
    let xmin = mainCanvasDim[0] - 600 + this.factor * this.playerHTrain.wagons.at(-1).position.x / mainCanvasDim[0];
    hudCanvas.rect(xmin, 55, xmax - xmin, 4);
    
    for (let soldier of this.playerSoldiers) {
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
    
    if (this.cannonball !== null) {
      this.cannonball.show(this.camera.position);
    }

    if (this.machinegunbullets !== null) {
      this.machinegunbullets.show(this.camera.position);
    }

    for (let soldier of this.playerSoldiers) {
      soldier.show(this.camera.position);
    }

    for (let soldier of this.enemyWolves) {
      soldier.show(this.camera.position);
    }

    for (let mamooth of this.playerMamooths) {
      mamooth.show(this.camera.position);
    }

    

    if (this.selectedWagon !== null) {
      this.selectedWagon.showHud();
    }

    this.showMinimap();

    //this.showBoard();
  
    mainCanvas.text(this.camera.position.array(), 10,20)
  }
}