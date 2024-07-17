// generic virtual unit. Soldiers and mamooths inherit from it
class Unit {
  constructor(position, owner) {
    this.owner = owner;
    this.position = position.copy();
    if (this.owner == "player") {
      this.defaultOrientation = 90;
    } else {
      this.defaultOrientation = 270;
    }
    this.orientation = this.defaultOrientation;

    this.selected = false;
    this.dead = false;
  }
}

class Soldier {
  static Action = Object.freeze({
    Idle:  "idle",
    Walk:  "walk",
    Shoot: "shoot"
  });

  constructor(position, soldierType, owner) {
    this.owner = owner;
    this.role = "";
    this.position = position.copy();
    this.orientation = 90;

    if (this.owner == "player") {
      this.defaultOrientation = 90;
      this.path = [];
    } else {
      // CPU
      this.defaultOrientation = 270;
      this.soldierAI = new SoldierAI(this.role, this);
      this.path = [];
    }
    this.orientation = this.defaultOrientation;
    this.direction = createVector(0, 0);
    this.halfSize = createVector(20, 20);
    this.selected = false;

    this.dead = false;
    
    this.range = 150;
    this.viewRange = 200;
    this.hp = 100;
    
    let spriteData = {
      "imgs": unitsData.soldier[0],
      "actions": ["idle", "walk", "shoot"],
      "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
      "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.fireSpeed = 10;
    this.fireCount = this.fireSpeed;
    this.walkSpeed = 1;
    
    // TODO: Make child class for each soldier type
    this.soldierType = soldierType;

    this.targetUnit = null;

    if (this.owner == "player") {
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
    console.log(`heading ${int(degrees(this.direction.heading())) %360}`)
    let ori = int(degrees(this.direction.heading()));
    if (ori < 0) {
      ori = -ori;
    } else {
      ori = 360 - ori;
    }
    // this.setOrientation(int(degrees(this.direction.heading())));
    this.setOrientation(ori%360);
    this.setAction(Soldier.Action.Walk);
  }

  inRange(targetPosition) {
    return p5.Vector.dist(targetPosition, this.position) <= this.range;
  }

  setAction(action) {
    if (this.action == action) {
      return;
    }
    this.action = action;
    this.sprite.setAction(action);
    if (action == Soldier.Action.Idle) {
      this.setOrientation(this.defaultOrientation);
      this.direction.set(0,0);
    } else if (action == Soldier.Action.Shoot) {
      this.direction.set(0,0);
      this.path = [];
    } else {

    }
  }

  checkClick(mousePos) {
    return (
      mousePos.x >= this.position.x - this.halfSize.x && 
      mousePos.x <= this.position.x + this.halfSize.x && 
      mousePos.y >= this.position.y - this.halfSize.y && 
      mousePos.y <= this.position.y + this.halfSize.y);
  }

  fireWeapon() {
    // show fire
    console.log("Fire!");
    this.shootAtUnit(this.targetUnit);
    

    //
  }

  update() {
    // update sprite
    this.sprite.update();

    if (this.action === Soldier.Action.Idle) {
      if (this.owner == "cpu") {
        let orders = this.soldierAI.requestOrders();
        
        if (orders.order == "move") {
          this.setTargetPosition(orders.destination);
        }
        else if (orders.order == "shoot") {
          console.log("shooting at player soldier")
          this.setAction(Soldier.Action.Shoot);
          this.setTargetUnit(orders.destination);
        }
      }

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
            
            //this.setOrientation(int(degrees(this.direction.heading())));
            let ori = int(degrees(this.direction.heading()));
            if (ori < 0) {
              ori = -ori;
            } else {
              ori = 360 - ori;
            }
            // this.setOrientation(int(degrees(this.direction.heading())));
            this.setOrientation(ori%360);



          } else {
            // no more waypoints to go...
            if (this.owner == "player") {
              // if we are the player, set soldier status to Idle
              this.setAction(Soldier.Action.Idle);
            } else {
              // if it's the cpu, request next waypoint to the AI
              let orders = this.soldierAI.requestOrders();
              if (orders.order == "move") {
                this.setTargetPosition(orders.destination);
              }
            }

          }
        }
      }
      else {
        let orders = this.soldierAI.requestOrders();
        if (orders.order == "move") {
          this.setTargetPosition(orders.destination);
        }
      }

      this.position.add(this.direction);

    } else if (this.action === Soldier.Action.Shoot) {
      // update the soldier orientation

      //let heading = p5.Vector.sub(this.targetUnit.position, this.position).heading();
      let ori = int(degrees(p5.Vector.sub(this.targetUnit.position, this.position).heading()));
      if (ori < 0) {
        ori = -ori;
      } else {
        ori = 360 - ori;
      }
      this.setOrientation(angleToOri(ori%360));

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
    //hudCanvas.image(unitsData.soldier[this.soldierType].walk[this.orientation][this.spriteIdx], 60, 30, 32, 54);
    hudCanvas.text("Rifleman", 150, 30);
  }

  show(cameraPos) {
    //console.log(unitsData.soldier[this.soldierType][this.action][this.orientation], this.spriteIdx)
    //mainCanvas.image(unitsData.soldier[this.soldierType][this.action][this.orientation][this.spriteIdx], this.position.x-12, this.position.y-22, 32, 54)
    
    let position = this.position.copy();
    if (cameraPos) {
      position.sub(cameraPos);
    }
    
    this.sprite.show(position);
    if (this.sprite.currentAction == "shoot" && this.sprite.spriteIdx == 1) {
      mainCanvas.circle(position.x, position.y-20, 10);
    }


    if (this.selected) {
      mainCanvas.push();
      mainCanvas.noFill();
      mainCanvas.circle(position.x, position.y, 60);
      this.showHud();
      mainCanvas.pop();
      //mainCanvas.fill(255)
    }
    mainCanvas.text(this.hp, position.x-10, position.y+35);
    mainCanvas.text(this.action, position.x-10, position.y+45);
    mainCanvas.text(this.role, position.x-10, position.y+55);

    if (this.path.length) {
      mainCanvas.line(position.x, position.y, this.path[0].x, this.path[0].y);
      for (let i=0; i<this.path.length-1; i++) {
        //mainCanvas.circle(this.path[i].x, this.path[i].y, 10);
        mainCanvas.line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y);
      }
      mainCanvas.circle(this.path.at(-1).x, this.path.at(-1).y, 10);
    }

    // if (
    //   this.action === Soldier.Action.Shoot &&
    //   this.sprite.getSpriteIdx() == 1 
    // ) {
    //   mainCanvas.image(fireN, position.x-5, position.y-40);
    // }

    
    //mainCanvas.fill(0,0,0,100);
    //if (this.owner == "cpu") {
      mainCanvas.push();
      mainCanvas.noFill();
      mainCanvas.stroke("red");
      mainCanvas.circle(this.position.x, this.position.y, this.range*2);
      mainCanvas.stroke("blue");
      mainCanvas.circle(position.x, position.y, this.viewRange*2);
      mainCanvas.pop();
    //}
  }
}

class Sniper extends Soldier {
  constructor(position, soldierType, owner) {
    super(position, soldierType, owner);

    let spriteData = {
      "imgs": unitsData.soldier[1],
      "actions": ["idle", "walk", "shoot"],
      "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
      "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.range = 200;
    this.viewRange = 250;
  }
}

class Rifleman extends Soldier {
  constructor(position, soldierType, owner) {
    super(position, soldierType, owner);
    
    let spriteData = {
      "imgs": unitsData.soldier[0],
      "actions": ["idle", "walk", "shoot"],
      "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
      "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.range = 150;
    this.viewRange = 200;

  }
}