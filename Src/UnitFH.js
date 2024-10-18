class UnitFH {
  static Actions = { 
    Idle: 0,       // Idle means the unit has no orders, but is not yet finished, so it should request orders
    Move: 1,       // Unit is currently moving
    Attack: 2,     // Unit is currently attacking (Bullet on the way)
    Overwatch: 3,  // Unit in overwatch, will trigger reaction fire on player turn
    Finished: 4    // Finished indicates the CPU IA that the unit has finished for this turn
  };
  static Orientations = {
    N: 90,
    NW: 135,
    W: 180,
    SW: 225,
    S: 270,
    SE: 315,
    E: 0,
    NE: 45
  }
  static AngleToOrientation(angleDegrees) {
    let orientation = UnitFH.Orientations.N;
    if (angleDegrees >= 0 && angleDegrees < 22.5) {
      orientation = UnitFH.Orientations.E;
    } else if (angleDegrees >= 22.5 && angleDegrees < 67.5) {
      orientation = UnitFH.Orientations.SE;
    } else if (angleDegrees >= 67.5 && angleDegrees < 112.5) {
      orientation = UnitFH.Orientations.S;
    } else if (angleDegrees >= 112.5 && angleDegrees < 157.5) {
      orientation = UnitFH.Orientations.SW;
    } else if (angleDegrees >= 157.5 && angleDegrees <= 180) {
      orientation = UnitFH.Orientations.W;
    } else if (angleDegrees < 0 && angleDegrees > -22.5) {
      orientation = UnitFH.Orientations.E;
    } else if (angleDegrees <= -22.5 && angleDegrees > -67.5) {
      orientation = UnitFH.Orientations.NE;
    } else if (angleDegrees <= -67.5 && angleDegrees > -112.5) {
      orientation = UnitFH.Orientations.N;
    } else if (angleDegrees <= -112.5 && angleDegrees > -157.5) {
      orientation = UnitFH.Orientations.NW;
    } else if (angleDegrees <= -157.5 && angleDegrees >= -180) {
      orientation = UnitFH.Orientations.W;
    }
    return orientation;

  }

  constructor(name, position, owner) {
    this.id = null;
    this.name = name;
    this.displayName = name;
    this.owner = owner;
    this.isSelected = false;
    this.isDead = false;

    this.unitAI = null;
    if (this.owner == Game.Players.Cpu) {
      this.unitAI = new UnitFHAI(this);
    }

    // this.pos is a floating point position, contains decimal values
    this.position = position;
    // tilePos contains the integer coordinates of the tile
    if (this.position !== null) {
      this.tilePosition = position.copy();
      this.prevTilePosition = position.copy();
    }

    this.orientation = UnitFH.Orientations.N;
    this.destination = null;
    this.path = [];
    this.speed = 0.1;
    this.direction = createVector(0,0);

    this.maxAp = 200;
    this.maxHp = 1500;

    this.currentAp = this.maxAp;
    this.currentHp = this.maxHp;
    this.armor = 5;
    this.attackRange = 3;

    this.bullet = null;
    this.bulletSpeed = 0.2;
    this.attackValue = 10;
    this.attackCost = 50;

    this.action = UnitFH.Actions.Idle;
    
    let spriteData = {
      "imgs": null,
      "actions": ["Idle"],
      "nSprites": {"Idle": 1},
      "spriteDuration": {"Idle": 100}
    }
    if (this.owner == Game.Players.Human) {
      spriteData.imgs = gameData.unitsData[this.name].Human;
    } else {
      spriteData.imgs = gameData.unitsData[this.name].Cpu;
    }

    this.sprite = new Sprite(UnitFH.Actions.Idle, this.orientation, spriteData);
    this.offset = createVector(0,5);
    this.destination = null;

  }

  generatePanelInfoData() {
    let data = {
      "title": this.name,
      "image": this.sprite.getHudImg(),
      "lines": [
      ],
      "buttons": ["Load to Train"]
    };

    return data;
  }

  generateViewTiles() {
    let points =[
      [3, 4], [4, -3], [4, 3], [-5, 0], [5, -2], [5, -1], [5, 1], [0, 5], [2, -4], [2, 5], [-4, -2], 
      [-4, 4], [-2, -5], [-1, -5], [-2, 4], [4, -4], [4, 2], [-5, 2], [5, 0], [-3, -4], [0, -5], 
      [2, -5], [2, 4], [1, 5], [-4, -3], [-2, 5], [-4, 3], [4, -2], [3, -4], [-5, -1], [-5, -2], 
      [5, 2], [4, 4], [-5, 1], [-3, 4], [1, -5], [-4, -4], [-4, 2], [-2, -4], [-1, 5]
    ];

    let viewTiles = []
    for (let point of points) {
      let tilePos = createVector(this.tilePosition.x + point[0], this.tilePosition.y + point[1]);
      viewTiles.push(tilePos);
    }
    return viewTiles;

  }

  lookAt(targetPosition) {
    let delta = p5.Vector.sub(targetPosition, this.position);
    let angle = degrees(atan2(delta.y, delta.x));
    let orientation = UnitFH.AngleToOrientation(angle);
    this.setOrientation(orientation);    
  }

  setPosition(position) {
    this.position = createVector(position.x, position.y);
    this.tilePosition = createVector(round(position.x), round(position.y));    
    this.prevTilePosition = this.tilePosition.copy();
  }
  getPosition() {
    return this.position;
  }

  setOrientation(newOrientation) {
    this.orientation = newOrientation;
    this.sprite.setOrientation(newOrientation);
  }

  //Migrated
  setAction(action) {
    this.action = action;
    if (action == UnitFH.Actions.Move) {
      sounds.MoveTrack.play()
    }
  }
  
  //Migrated
  setPath(path) {
    this.path = path;
    if (this.path.length > 0) {
      this.setDestination(path[0]);
      this.setAction(UnitFH.Actions.Move);
    } else {
      this.setDestination(null);
    }
  }

  isEnemy() {
    return this.owner == Game.Players.Cpu;
  }

  replenishAp() {
    this.currentAp = this.maxAp;
  }

  move(delta) {    
    this.position.add(delta);
    this.currentAp -= this.speed*10;
    game.currentScene.camera.setPosition(Geometry.boardToCamera(this.position, game.currentScene.tileHalfSize))
  }

  calculateHitProbability(targetPos) {
    let distance = this.position.dist(targetPos);
    let prob;
    if (this.name == "Tank") {
      prob = 100 - 10*distance;
    } else if (this.name == "Artillery") {
      if (distance < 5 || distance > 10) {
        prob = 0;
      } else {
        prob = 80;
      }
    }
    return prob;
  }

  // Migrated
  receiveDamage(val) {
    this.currentHp -= val;
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.isDead = true;
      sounds.VehicleExplosion.play();
    }
  }

  //Migrated
  shoot(targetPos) {
    if (this.attackCost > this.currentAp) {
      return false;
    }
    
    let delta = p5.Vector.sub(targetPos, this.position);
    
    let ori = int(degrees(delta.heading()));
    if (ori < 0) {
      ori = -ori;
    } else {
      ori = 360 - ori;
    }
    
    this.setOrientation(Geometry.angleToOri(ori%360));

    this.bullet = new BallisticBullet(this.position, targetPos, this.bulletSpeed, 
      this.attackValue);
    this.setAction(UnitFH.Actions.Attack);
    this.currentAp -= this.attackCost;
    sounds.ArtilleryShoot.play();
    return true;
  }

  //Migrated
  showPath(cameraPosition) {
    let ori, dst;    
    if (this.path.length > 0) {
      ori = Geometry.boardToScreen(this.position, cameraPosition, tileHalfSizes.Z1);
      dst = Geometry.boardToScreen(this.path[0], cameraPosition, tileHalfSizes.Z1);
      mainCanvas.line(ori.x, ori.y, dst.x, dst.y);
      for(let i=0; i<this.path.length-1; i++) {
        ori = Geometry.boardToScreen(this.path[i], cameraPosition, tileHalfSizes.Z1);
        dst = Geometry.boardToScreen(this.path[i+1], cameraPosition, tileHalfSizes.Z1);
        mainCanvas.line(ori.x, ori.y, dst.x, dst.y);
        mainCanvas.circle(ori.x, ori.y, 4)
      }
    }
  }

  //Migrated
  setDestination(destination) {
    this.destination = destination;
    if (destination === null) {
      this.direction = createVector(0,0);
      // this.setAction(UnitFH.Actions.Idle);
    } else {
      let delta = p5.Vector.sub(destination, this.position);
      this.direction = delta.normalize().mult(this.speed);   
      let ori = int(degrees(this.direction.heading()));
      if (ori < 0) {
        ori = -ori;
      } else {
        ori = 360 - ori;
      }
      this.setOrientation(ori%360);
    }
  }

  hasReachedDestination() {
    return p5.Vector.dist(this.position, this.destination) < this.speed;
  }

  assignNextPathLocation() {
    if (this.path.length > 1) {
      // set the position to the reached waypoint to correct offset errors
      this.position.set(this.path[0]);
      // remove first waypoint from path
      this.path.shift();
      // assign next path location as destination
      this.setDestination(this.path[0].copy());
    }
    else {
      // set the position to the reached waypoint to correct offset errors
      this.position.set(this.path[0]);
      this.setDestination(null);
      this.setAction(UnitFH.Actions.Idle);
    }
  }

  updateMove() {
    // If we don't have enough AP to move 1 tile, flag the unit as finished
    if (this.currentAp < 10) {
      this.setPath([]);
      this.setDestination(null);
      this.setAction(UnitFH.Actions.Finished);
      return;
    }

    // If we have a destination
    if (this.destination !== null) {
      // if we have arrived to the destination
      if (this.hasReachedDestination()) {
        this.assignNextPathLocation();
        return;
      }
      
      // Update position
      this.move(this.direction);
      this.tilePosition = createVector(round(this.position.x), round(this.position.y));
      // Check if we entered a new tile
      if (!this.tilePosition.equals(this.prevTilePosition)) {
        game.currentScene.base.tileBoard.board[this.prevTilePosition.y][this.prevTilePosition.x].setUnitId(null);
        game.currentScene.base.tileBoard.board[this.tilePosition.y][this.tilePosition.x].setUnitId(this.id);
        this.prevTilePosition.set(this.tilePosition);
      }
       
    }
    // We should never have destination null and be in move action
    else {
      console.log("ERROR, we should never have no destination and be in move action");
    }
  }

  updateIdle() {

  }

  updateAttack() {
    if (this.bullet !== null) {
      this.bullet.update();
      if (this.bullet.finished) {
        // bullet has arrived to destination.
        // Resolve damage
        let targetId = game.currentScene.base.tileBoard.board[this.bullet.dst.y][this.bullet.dst.x].unitId;
        if (targetId !== null) {
          game.currentScene.base.units[targetId].receiveDamage(this.bullet.strength);
        }
        this.bullet = null;
      }
    } else {
      this.setAction(UnitFH.Actions.Idle);
    }
  }


  update() {
    if (this.owner == Game.Players.Cpu) {
      this.unitAI.update();
    }

    if (this.action === UnitFH.Actions.Idle) {
      this.updateIdle();
    } else if (this.action === UnitFH.Actions.Move) {
      this.updateMove();
    } else if (this.action === UnitFH.Actions.Attack) {
      this.updateAttack();
    }
  }

  // update() {
  //   // update sprite
  //   this.sprite.update();





  //   // if (this.owner == Game.Players.Cpu) {
  //   //   let order = this.soldierAI.requestOrders();
  //   //   this.processOrder(order);
  //   // }

  //   if (this.action === UnitFH.Actions.Idle) {  
        
  //   } 
    
  //   else if (this.action === UnitFH.Actions.Move) {
  //     // if we have waypoints to go
  //     if (this.path.length &&  this.currentAp > 0) {
  //       // check if we have arrived at the first waypoint
  //       if (p5.Vector.dist(this.position, this.path[0]) < 0.1) {
  //         // set the position to the reached waypoint to correct offset errors
  //         this.position.set(this.path[0]);
  //         // remove first waypoint from path
  //         this.path.shift();

  //         if (this.owner == Game.Players.Cpu) {
  //           let order = this.unitAI.requestOrders();
  //           if (order !== null) {
  //             this.unitAI.processOrder(order)
  //           }
  //         }

  //         // if there are more waypoints to go
  //         if (this.path.length) {
  //           // set the direction and orientation
  //           this.direction = p5.Vector.sub(this.path[0], this.position).normalize().mult(this.speed);
            
  //           let ori = int(degrees(this.direction.heading()));
  //           if (ori < 0) {
  //             ori = -ori;
  //           } else {
  //             ori = 360 - ori;
  //           }
  //           this.setOrientation(ori%360);

  //         } else {
  //           // no more waypoints to go...
  //           this.setAction(UnitFH.Actions.Idle);
  //         }
  //       }
  //       else {
  //         this.direction = p5.Vector.sub(this.path[0], this.position).normalize().mult(this.speed);
  //       }
  //     }
  //     else {
  //       // If we don't have waypoints to go or we ran out of AP
  //       this.setAction(UnitFH.Actions.Idle);
  //     }

  //     // Update position
  //     this.move(this.direction);
  //     this.tilePosition = createVector(round(this.position.x), round(this.position.y));
  //     // Check if we entered a new tile
  //     if (!this.tilePosition.equals(this.prevTilePosition)) {
  //       game.currentScene.base.tileBoard.board[this.prevTilePosition.y][this.prevTilePosition.x].setUnitId(null);
  //       game.currentScene.base.tileBoard.board[this.tilePosition.y][this.tilePosition.x].setUnitId(this.id);
  //       this.prevTilePosition = this.tilePosition.copy();
  //     }
  //   } 
    
  //   else if (this.action === UnitFH.Actions.Shoot) {
  //     if (this.bullet !== null) {
  //       if (this.bullet.finished) {
  //         this.setAction("idle")
  //       }
  //     }
  //     // update the soldier orientation
  //     // let ori = int(degrees(p5.Vector.sub(this.targetUnit.position, this.position).heading()));
  //     // if (ori < 0) {
  //     //   ori = -ori;
  //     // } else {
  //     //   ori = 360 - ori;
  //     // }
  //     // this.setOrientation(Geometry.angleToOri(ori%360));

  //     // if (this.sprite.getSpriteIdx() == 1 && this.sprite.getFrameCount() == 0) {
  //     //   this.fireWeapon();
  //     // }
  //   }

  // }

  //Migrated
  showRangeCircle(screenPos) {
    // let aux1, aux2;
    // if (this.orientation === UnitFH.Orientations.SE) {
    //   aux1 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(5,-4)));
    //   aux2 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(5, 4)));
    // } else if (this.orientation === UnitFH.Orientations.NW) {
    //   aux1 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(-5,-4)));
    //   aux2 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(-5, 4)));
    // } else if (this.orientation === UnitFH.Orientations.NE) {
    //   aux1 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(-4,-5)));
    //   aux2 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(4,-5)));
    // } else if (this.orientation === UnitFH.Orientations.SW) {
    //   aux1 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(-4,5)));
    //   aux2 = Geometry.boardToScreen(p5.Vector.add(this.position, createVector(4,5)));
    // }

    mainCanvas.push();
    mainCanvas.fill(255,255,255,50)
    mainCanvas.noStroke();
    //mainCanvas.strokeWeight(0.5)
    mainCanvas.ellipse(screenPos.x, screenPos.y, 116*this.attackRange, 58*this.attackRange);
    // mainCanvas.beginShape();
    // mainCanvas.vertex(screenPos.x, screenPos.y);
    // mainCanvas.vertex(aux1.x, aux1.y);
    // mainCanvas.vertex(aux2.x, aux2.y);
    // mainCanvas.endShape(CLOSE);

    mainCanvas.pop();
  }

  showBars(screenPos) {
    mainCanvas.push();
    mainCanvas.fill("red");
    mainCanvas.rect(screenPos.x-20, screenPos.y+20, 50,5);
    mainCanvas.fill("green");
    mainCanvas.rect(screenPos.x-20, screenPos.y+20, 50*this.currentHp/this.maxHp,5);
    mainCanvas.fill("white");
    mainCanvas.rect(screenPos.x-20, screenPos.y+25, 50,5);
    mainCanvas.fill("blue");
    mainCanvas.rect(screenPos.x-20, screenPos.y+25, 50*this.currentAp/this.maxAp,5);    
    mainCanvas.pop();
  }

  //Migrated
  showHud() {
    let currentX = 100;
    hudCanvas.background(100)
    hudCanvas.fill(0)
    hudCanvas.image(this.sprite.getHudImg(),currentX,30);
    hudCanvas.text(this.displayName,currentX+100,30);
    currentX+=100;
  }


  show(cameraPosition) {
    if (this.isDead) {
      return;
    }
    let screenPos = Geometry.boardToScreen(this.getPosition(), cameraPosition, tileHalfSizes.Z1);
    this.showPath(cameraPosition);
    this.sprite.update();
    this.sprite.show(createVector(screenPos.x-this.offset.x, screenPos.y-this.offset.y));
    mainCanvas.text(this.owner, screenPos.x, screenPos.y-20);
    mainCanvas.text(this.id, screenPos.x, screenPos.y-30);
    mainCanvas.text(this.action, screenPos.x, screenPos.y-40);


    // this.showBars(screenPos);
    

    if (this.isSelected) {      
      this.showHud();
      this.showRangeCircle(screenPos);
    }

    if (this.bullet !== null) {
      this.bullet.show(cameraPosition);
    }
  }
}

class Artillery extends UnitFH {
  constructor(name, position, owner) {
    super(name, position, owner);

  }
}

class Tank extends UnitFH {
  constructor(name, position, owner) {
    super(name, position, owner);
  }
}