class UnitFH {
  static Actions = { 
    Idle: 0,
    Move: 1,
    Attack: 2
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

  constructor(id, name, position) {
    this.id = id;
    this.name = name;

    // this.pos is a floating point position, contains decimal values
    this.position = position;
    // tilePos contains the integer coordinates of the tile
    this.tilePosition = position.copy();
    this.prevTilePosition = position.copy();

    this.orientation = UnitFH.Orientations.N;
    this.destination = null;
    this.path = [];
    this.speed = 0.1;
    this.direction = createVector(0,0);

    this.action = UnitFH.Actions.Idle;
    
    let spriteData = {
      "imgs": gameData.unitsData[this.name],
      "actions": ["idle"],
      "nSprites": {"idle": 1},
      "spriteDuration": {"idle": 100}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.offset = createVector(0,5);
    this.destination = null;

  }

  setPosition(position) {
    this.position.set(position.x, position.y);
    this.tilePosition.set(round(position.x), round(position.y));    
  }
  getPosition() {
    return this.position;
  }

  move(delta) {
    this.setPosition(p5.Vector.add(this.position, delta));
  }
  setPath(path) {
    this.path = path;
  }

  setOrientation(newOrientation) {
    this.orientation = newOrientation;
    this.sprite.setOrientation(newOrientation);
  }

  setAction(action) {
    this.action = action;
  }
  shoot(targetPos) {

  }

  showPath(cameraPosition) {
    let ori, dst;    
    if (this.path.length > 0) {
      ori = boardToScreen(this.position, cameraPosition);
      dst = boardToScreen(this.path[0], cameraPosition);
      mainCanvas.line(ori.x, ori.y, dst.x, dst.y);
      for(let i=0; i<this.path.length-1; i++) {
        ori = boardToScreen(this.path[i], cameraPosition);
        dst = boardToScreen(this.path[i+1], cameraPosition);
        mainCanvas.line(ori.x, ori.y, dst.x, dst.y);
        mainCanvas.circle(ori.x, ori.y, 10)
      }
    }
  }

  setDestination(destination) {
    
  }

  update() {
    // update sprite
    this.sprite.update();

    // if (this.owner == "cpu") {
    //   let order = this.soldierAI.requestOrders();
    //   this.processOrder(order);
    // }

    if (this.action === UnitFH.Actions.Idle) {  
        
    } 
    
    else if (this.action === UnitFH.Actions.Move) {
      // if we have waypoints to go
      if (this.path.length) {
        // check if we have arrived at the first waypoint
        if (p5.Vector.dist(this.position, this.path[0]) < 0.1) {
          // set the position to the reached waypoint to correct offset errors
          this.position.set(this.path[0]);
          // remove first waypoint from path
          this.path.shift();
          // if there are more waypoints to go
          if (this.path.length) {
            // set the direction and orientation
            this.direction = p5.Vector.sub(this.path[0], this.position).normalize().mult(this.speed);
            
            let ori = int(degrees(this.direction.heading()));
            if (ori < 0) {
              ori = -ori;
            } else {
              ori = 360 - ori;
            }
            this.setOrientation(ori%360);

          } else {
            // no more waypoints to go...
            this.setAction(UnitFH.Actions.Idle);
          }
        }
        else {
          this.direction = p5.Vector.sub(this.path[0], this.position).normalize().mult(this.speed);
        }
      }
      else {
        // If we don't have waypoints to go
        this.setAction(UnitFH.Actions.Idle);
      }

      // Update position
      this.position.add(this.direction);
      this.tilePosition = createVector(round(this.position.x), round(this.position.y));
      // Check if we entered a new tile
      if (!this.tilePosition.equals(this.prevTilePosition)) {
        game.currentScene.base.tileBoard.board[this.prevTilePosition.y][this.prevTilePosition.x].setUnitId(null);
        game.currentScene.base.tileBoard.board[this.tilePosition.y][this.tilePosition.x].setUnitId(this.id);
        this.prevTilePosition = this.tilePosition.copy();
      }
    } 
    
    else if (this.action === UnitFH.Actions.Shoot) {
      // update the soldier orientation
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


  

  show(cameraPosition) {
    let screenPos = boardToScreen(this.getPosition(), cameraPosition);
    this.showPath(cameraPosition);
    this.sprite.update();
    this.sprite.show(createVector(screenPos.x-this.offset.x, screenPos.y-this.offset.y));
    mainCanvas.text(this.id, screenPos.x, screenPos.y-20)
  }
}