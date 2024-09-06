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

class Soldier extends Unit {
  static Action = Object.freeze({
    Idle:  "idle",
    Walk:  "walk",
    Shoot: "shoot"
  });

  constructor(id, position, soldierType, owner) {
    super(id, position, owner);
    this.role = "";
    
    if (this.owner == Game.Players.Cpu) {
      this.soldierAI = new SoldierAI(this.role, this);
    }
    this.halfSize = createVector(20, 20);
    
    let soldierTypeId = 0;
    if (this.owner == Game.Players.Cpu) {
      soldierTypeId = 1;
    }
    let spriteData = {
      "imgs": gameData.unitsData.soldier[soldierTypeId],
      "actions": ["idle", "walk", "shoot"],
      "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
      "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    
    // TODO: Make child class for each soldier type
    this.soldierType = soldierType;

    this.targetUnit = null;

    if (this.owner == Game.Players.Human) {
      this.setAction(Soldier.Action.Idle);
    } else {
      this.setAction(Soldier.Action.Idle);
      //let orders = this.soldierAI.requestOrders();
      //console.log(orders)
    }
  }

  setOrientation(ori) {
    this.orientation = ori;
    this.sprite.setOrientation(ori);
  }

  setRole(roleData) {
    this.role = roleData.role;
    this.soldierAI.setRole(roleData);
  }

  // TODO: This shouldn't be here, should be in CombatScene or in the Map of combatScene
  calculatePath(ori, dst) {
    let delta = p5.Vector.sub(dst, ori);
    let firstPoint, secondPoint;
    if (abs(delta.x) > abs(delta.y)) {
      // first we move in the x direction, then diagonal, then in the x direction again
      if (delta.x > 0) {
        firstPoint = createVector(ori.x + (delta.x - abs(delta.y)) / 2, ori.y);
        secondPoint = createVector(ori.x + (delta.x + abs(delta.y)) / 2, dst.y);
      } else {
        firstPoint = createVector(ori.x + (delta.x + abs(delta.y)) / 2, ori.y);
        secondPoint = createVector(ori.x + (delta.x - abs(delta.y)) / 2, dst.y);
      }
    } else {
      if (delta.y > 0) {
        firstPoint = createVector(ori.x, ori.y + (delta.y - abs(delta.x)) / 2);
        secondPoint = createVector(dst.x, ori.y + (delta.y + abs(delta.x)) / 2);
      } else {
        firstPoint = createVector(ori.x, ori.y + (delta.y + abs(delta.x)) / 2);
        secondPoint = createVector(dst.x, ori.y + (delta.y - abs(delta.x)) / 2);
      }
    }
    this.path = [firstPoint, secondPoint, dst.copy()];
  }

  setTargetPosition(destination) {
    this.calculatePath(this.position, destination);
    this.direction = p5.Vector.sub(this.path[0], this.position).normalize().mult(this.walkSpeed);
    let ori = int(degrees(this.direction.heading()));
    if (ori < 0) {
      ori = -ori;
    } else {
      ori = 360 - ori;
    }
    // this.setOrientation(int(degrees(this.direction.heading())));

    // TODO: how could this possibly work without calling Geometry.angleToOri?
    this.setOrientation(ori%360);
    this.setAction(Soldier.Action.Walk);
  }

  inViewRange(targetPosition) {
    return p5.Vector.dist(targetPosition, this.position) <= this.ViewRange;
  }

  inAttackRange(targetPosition) {
    return p5.Vector.dist(targetPosition, this.position) <= this.attackRange;
  }

  setAction(action) {
    if (this.action == action) {
      return;
    }
    this.action = action;
    this.sprite.setAction(action);
    if (action == Soldier.Action.Idle) {
      // an idle soldier stops and looks at the default orientation (towards enemy train)
      this.setOrientation(this.defaultOrientation);
      this.direction.set(0,0);
    } else if (action == Soldier.Action.Shoot) {
      // shooting makes the soldier stop, also clears the path
      this.direction.set(0,0);
      this.path = [];
    } else {

    }
  }

  checkClick(mousePos) {
    let screenPos = Geometry.boardToScreen(this.position, game.currentScene.camera.position, game.currentScene.tileHalfSize);
    return (
      mousePos.x >= screenPos.x - this.halfSize.x && 
      mousePos.x <= screenPos.x + this.halfSize.x && 
      mousePos.y >= screenPos.y - this.halfSize.y && 
      mousePos.y <= screenPos.y + this.halfSize.y);
  }

  fireWeapon() {
    console.log("Fire!");
    this.shootAtUnit(this.targetUnit);
  }

  processOrder(order) {
    if (order.order == "move") {
      this.setTargetPosition(order.destination);
      this.setAction(Soldier.Action.Walk);
    }
    else if (order.order == "shoot") {
      this.setAction(Soldier.Action.Shoot);
      this.setTargetUnit(order.destination);
    }
  }

  update() {
    // update sprite
    this.sprite.update();

    if (this.owner == Game.Players.Cpu) {
      let order = this.soldierAI.requestOrders();
      this.processOrder(order);
    }

    if (this.action === Soldier.Action.Idle) {  
        
    } else if (this.action === Soldier.Action.Walk) {
      // if we have waypoints to go
      if (this.path.length) {
        // check if we have arrived at the first waypoint
        if (p5.Vector.dist(this.position, this.path[0]) < 2) {
          // set the position to the reached waypoint to correct offset errors
          this.position.set(this.path[0]);
          // remove first waypoint from path
          this.path.shift();
          // if there are more waypoints to go
          if (this.path.length) {
            // set the direction and orientation
            this.direction = p5.Vector.sub(this.path[0], this.position).normalize().mult(this.walkSpeed);
            
            let ori = int(degrees(this.direction.heading()));
            if (ori < 0) {
              ori = -ori;
            } else {
              ori = 360 - ori;
            }
            this.setOrientation(ori%360);

          } else {
            // no more waypoints to go...
            this.setAction(Soldier.Action.Idle);
          }
        }
      }
      else {
        // If we don't have waypoints to go
        this.setAction(Soldier.Action.Idle);
      }

      this.position.add(this.direction);

    } else if (this.action === Soldier.Action.Shoot) {
      // update the soldier orientation
      let ori = int(degrees(p5.Vector.sub(this.targetUnit.position, this.position).heading()));
      if (ori < 0) {
        ori = -ori;
      } else {
        ori = 360 - ori;
      }
      this.setOrientation(Geometry.angleToOri(ori%360));

      if (this.sprite.getSpriteIdx() == 1 && this.sprite.getFrameCount() == 0) {
        this.fireWeapon();
      }
    }
  }

  setTargetUnit(unit) {
    this.targetUnit = unit;
  }

  receiveDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  shootAtUnit(targetUnit) {
    targetUnit.receiveDamage(1);
  }

  showHud() {
    hudCanvas.background(100);
    hudCanvas.image(gameData.unitsData.soldier[this.soldierType].idle[270][0], 60, 25, 32, 54);
    hudCanvas.text("Rifleman", 150, 30);
  }

  show(cameraPos, tileHalfSize) {
    //console.log(gameData.unitsData.soldier[this.soldierType][this.action][this.orientation], this.spriteIdx)
    //mainCanvas.image(gameData.unitsData.soldier[this.soldierType][this.action][this.orientation][this.spriteIdx], this.position.x-12, this.position.y-22, 32, 54)
    
    let screenPosition = Geometry.boardToScreen(this.position, cameraPos, tileHalfSize);
    
    this.sprite.show(screenPosition);
    if (this.sprite.currentAction == "shoot" && this.sprite.spriteIdx == 1) {
      mainCanvas.circle(position.x, position.y-20, 10);
    }


    if (this.selected) {
      mainCanvas.push();
      mainCanvas.noFill();
      mainCanvas.rect(screenPosition.x-this.halfSize.x, screenPosition.y-this.halfSize.y, this.halfSize.x*2, this.halfSize.y*2);
      this.showHud();
      mainCanvas.pop();
      //mainCanvas.fill(255)
    }
    mainCanvas.fill(0);
    mainCanvas.text(this.id, screenPosition.x-10, screenPosition.y+35);
    mainCanvas.text(this.hp, screenPosition.x-10, screenPosition.y+45);
    mainCanvas.text(this.action, screenPosition.x-10, screenPosition.y+55);
    mainCanvas.text(this.role, screenPosition.x-10, screenPosition.y+65);

    if (this.path.length) {
      mainCanvas.push();
      if (this.targetUnit !== null) {
        mainCanvas.stroke("red")
        //mainCanvas.strokeWeight(3)
      } else {
        mainCanvas.stroke("black")
        //mainCanvas.strokeWeight(1)
      }
      // mainCanvas.line(position.x, position.y, this.path[0].x-cameraPos.x, this.path[0].y-cameraPos.y);
      for (let i=0; i<this.path.length-1; i++) {
        //mainCanvas.circle(this.path[i].x, this.path[i].y, 10);
        // mainCanvas.line(this.path[i].x-cameraPos.x, this.path[i].y-cameraPos.y, this.path[i+1].x-cameraPos.x, this.path[i+1].y-cameraPos.y);
      }
      // mainCanvas.circle(this.path.at(-1).x-cameraPos.x, this.path.at(-1).y-cameraPos.y, 10);
      mainCanvas.pop();
    }

    // if (
    //   this.action === Soldier.Action.Shoot &&
    //   this.sprite.getSpriteIdx() == 1 
    // ) {
    //   mainCanvas.image(fireN, position.x-5, position.y-40);
    // }

    
    //mainCanvas.fill(0,0,0,100);
    //if (this.owner == Game.Players.Cpu) {
      // mainCanvas.push();
      // mainCanvas.noFill();
      // mainCanvas.stroke("red");
      // mainCanvas.circle(position.x, position.y, this.range*2);
      // mainCanvas.stroke("blue");
      // mainCanvas.circle(position.x, position.y, this.viewRange*2);
      // mainCanvas.pop();
    //}
  }
}