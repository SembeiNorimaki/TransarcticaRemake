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

class Unit {
  static Actions = { 
    Idle: 0,       // Idle means the unit has no orders, but is not yet finished, so it should request orders
    Move: 1,       // Unit is currently moving
    Attack: 2,     // Unit is currently attacking (Bullet on the way)
    Overwatch: 3,  // Unit in overwatch, will trigger reaction fire on player turn
    Finished: 4,    // Finished indicates the CPU IA that the unit has finished for this turn
    Aiming: 5,

    0: "Idle",
    1: "Move",
    2: "Attack",
    3: "Overwatch",
    4: "Finished",
    5: "Aiming"

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

  static OrientationToHeading(ori) {
    let myDict = {
      90: [0, -1],
      135: [-1, -1],
      180: [-1, 0],
      225: [-1, 1],
      270: [0, 1],
      315: [1, 1],
      0: [1, 0],
      45: [1, -1]
    }
    return createVector(myDict[ori][0], myDict[ori][1]);
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

  constructor(id, name, position, owner) {
    this.id = id,
    this.name = name;
    this.owner = owner;
    this.position = position.copy();  // Position is a float, accepts values between tiles
    this.tilePosition = createVector(round(this.position.x), round(this.position.y));  // TilePosition is an int, is the tile coordinate where the unit is

    this.prevPosition = this.position.copy();
    this.prevTilePosition = this.tilePosition.copy();
    
    if (this.owner == Game.Players.Human) {
      this.defaultOrientation = Unit.Orientations.N;
    } else {
      this.defaultOrientation = Unit.Orientations.S;
    }
    this.orientation = this.defaultOrientation;

    this.isSelected = false;
    this.isDead = false;

    this.path = [];
    this.bullet = null;

    this.currentHp = 100;
    this.currentAp = 1000;
    this.speed = 0.03;
    this.attackValue = 10;
    this.attackCost = 50;
    this.bulletSpeed = 0.1;

    this.ray = null;

    let spriteData = {
      "imgs": null,
      "actions": ["Idle", "Move", "Attack"],
      "nSprites": {"Idle": 1, "Move": 6, "Attack": 2},
      "spriteDuration": {"Idle": 100, "Move": 5, "Attack": 20}
    }

      
    if (this.owner == Game.Players.Human) {
      spriteData.imgs = gameData.unitsData[this.name].Human;
    } else {
      spriteData.imgs = gameData.unitsData[this.name].Cpu;
    }
    this.sprite = new Sprite(Unit.Actions.Idle, this.orientation, spriteData);

  }

  /* #region SETTERS */
  setOrientation(newOrientation) {
    this.orientation = newOrientation;
    this.sprite.setOrientation(newOrientation);
  }
  setHeading(newHeading) {
    this.heading = p5.Vector.mult(newHeading, this.speed);
  }

  setRole(roleData) {
    this.role = roleData.role;
    this.soldierAI.setRole(roleData);
  }
  setAction(action) {
    this.action = action;
    this.sprite.setAction(action);
    if (action == Unit.Actions.Move) {
      sounds.MoveTrack.play();    // TODO: make this a property, so it's not always MoveTrack sound
    }
  }
  setPath(path) {
    this.path = path;
    if (this.path.length > 0) {
      this.setDestination(path[0]);
      this.setAction(UnitFH.Actions.Move);
    } else {
      this.setDestination(null);
    }
  }

  setDestination(destination) {
    this.destination = destination;
    // updates orientation and heading (this is now done by lookAt)
    if (destination === null) {
      this.lookAt(createVector(0,0));
    } else {
      this.lookAt(destination);
    }
  }


  /* #endregion */

  // Make the unit look towards the targetPosition
  // modified orientation and heading
  lookAt(targetPosition) {
    let delta = p5.Vector.sub(targetPosition, this.position);
    let angle = degrees(atan2(delta.y, delta.x));
    let orientation = UnitFH.AngleToOrientation(angle);
    console.log(`New orientation: ${orientation}`)
    this.setOrientation(orientation);    
    this.setHeading(Unit.OrientationToHeading(orientation));
  }

  /* #region ATTACK */

  isEnemy() {
    return this.owner === Game.Players.Cpu;
  }

  receiveDamage(amount) {
    this.currentHp -= amount;
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.dead = true;
      sounds.VehicleExplosion.play(); // TODO: make the sound an attribut, so it's not always a vehicle explosion
    }
  }

  shoot(targetPos) {
    if (this.attackCost > this.currentAp) {
      return false;
    }
    
    this.lookAt(targetPos);
    this.ray = new RayCast(this.position, targetPos);
    this.ray.compute();

    // this.bullet = new BallisticBullet(this.position, targetPos, this.bulletSpeed, this.attackValue);
    this.bullet = new Bullet(this.position, targetPos, this.bulletSpeed, this.attackValue);
    this.setAction(Unit.Actions.Attack);
    this.currentAp -= this.attackCost;
    //sounds.ArtilleryShoot.play();  // TODO: Make it an attribute
    sounds.SniperShoot.play();  // TODO: Make it an attribute
    return true;
  }

  /* #endregion */




  /* #region MOVE */

  hasReachedDestination() {
    return p5.Vector.dist(this.position, this.destination) < this.speed;
  }

 


  move(delta) {    
    this.position.add(delta);
    this.currentAp -= this.speed*10;
    game.currentScene.camera.setPosition(Geometry.boardToCamera(this.position, game.currentScene.tileHalfSize))
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
      this.setAction(Unit.Actions.Idle);
    }
  }

  /* #endregion */


  /* #region UPDATE functions */
  updateIdle() {

  }
  updateMove() {
    // If we don't have enough AP to move 1 tile, flag the unit as finished
    if (this.currentAp < 10) {
      this.setPath([]);
      this.setDestination(null);
      this.setAction(Unit.Actions.Finished);
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
      this.move(this.heading);
      this.tilePosition.set(round(this.position.x), round(this.position.y));
      
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

  updateAttack() {
    if (this.bullet !== null) {
      this.bullet.update();
      if (this.bullet.finished) {
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
    if (this.action === UnitFH.Actions.Idle) {
      this.updateIdle();
    } else if (this.action === UnitFH.Actions.Move) {
      this.updateMove();
    } else if (this.action === UnitFH.Actions.Attack) {
      this.updateAttack();
    }

    this.sprite.update();
  }
  /* #endregion*/

  /* #region SHOW functions */
  showHud() {
    let currentX = 100;
    hudCanvas.background(100)
    hudCanvas.fill(0)
    hudCanvas.image(this.sprite.getHudImg(), currentX, 30);
    hudCanvas.text(this.displayName,currentX+100, 30);
    currentX+=100;
  }
  showPath(cameraPosition) {
    let ori, dst;    
    if (this.path.length > 0) {
      ori = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
      dst = Geometry.boardToScreen(this.path[0], cameraPosition, game.currentScene.tileHalfSize);
      mainCanvas.line(ori.x, ori.y, dst.x, dst.y);
      for(let i=0; i<this.path.length-1; i++) {
        ori = Geometry.boardToScreen(this.path[i], cameraPosition, game.currentScene.tileHalfSize);
        dst = Geometry.boardToScreen(this.path[i+1], cameraPosition, game.currentScene.tileHalfSize);
        mainCanvas.line(ori.x, ori.y, dst.x, dst.y);
        mainCanvas.circle(ori.x, ori.y, 4)
      }
    }
  }

  showRangeCircle(screenPos) {
    mainCanvas.push();
    mainCanvas.fill(255,255,255,50)
    mainCanvas.noStroke();
    mainCanvas.ellipse(screenPos.x, screenPos.y, 116*this.attackRange, 58*this.attackRange);
    mainCanvas.pop();
  }

  show(cameraPosition) {
    let screenPos = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    
    this.sprite.show(createVector(screenPos.x, screenPos.y));
    this.showRangeCircle(screenPos);
    this.showPath(cameraPosition);

    if (this.bullet !== null) {
      this.bullet.show(cameraPosition);
    }

    if (this.ray !== null) {
      this.ray.show(cameraPosition);
    }
  
  }
  /* #endregion*/

}