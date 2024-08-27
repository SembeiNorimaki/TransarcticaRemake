class UnitFHAI {
  constructor(ownerInstance) {
    this.ownerInstance = ownerInstance;
    this.role = "idle";
    this.targetEnemy = null;

  }

  setRole(roleData) {
    this.role = roleData.role;
  }

  checkEnemyInAttackRange() {
    for (let unit of game.currentScene.base.units) {
      if (unit.isEnemy() == false && this.ownerInstance.calculateHitProbability(unit.position) > 60) {
        return unit;
      }
    }
    return null;
  }

  processOrder(order) {
    if (order.order == "shoot") {
      let targetPos = order.destination;
      this.ownerInstance.setAction(UnitFH.Actions.Attack);
      this.ownerInstance.shoot(targetPos);
    }
  }

  requestOrders() {
    // first check if we have an enemy in range to fire
    let targetEnemy = this.checkEnemyInAttackRange();

    if (targetEnemy !== null) {
      // we have an enemy in range, lock it as the target to shoot
      console.log("Player unit in range, shooting")
      return {
        "order": "shoot",
        "destination": targetEnemy.position
      }
    }
    return null;

    // if not, if we have a path already calculated




    // if (this.role == "patrol") {
    //   // if the soldier has not yet reach the current waypoint, dont give him any order
    //   if (this.ownerInstance.path.length > 0) {
    //     return {
    //       "order": "none",
    //       "destination": null  
    //     }
    //   }
    //   // otherwise give him a waypoint to move
    //   let targetLocation = this.patrolPoints[this.patrolIdx];
    //   this.patrolIdx++;
    //   if (this.patrolIdx >= this.patrolPoints.length) {
    //     this.patrolIdx = 0;
    //   }
    //   return {
    //     "order": "move",
    //     "destination": targetLocation
    //   };
    // }
    // else if (this.role == "idle") {
    //   return {
    //     "order": "idle",
    //     "destination": null
    //   };
    // }

  }

  decideAction() {
    // this is called at the beginning of the unit turn or after a shoot is completed

    // select a target enemy unit
    this.targetEnemy = game.currentScene.closestTarget(this.ownerInstance);
    
    // calculate hit probability
    let hitProb = this.ownerInstance.calculateHitProbability(this.targetEnemy.position);
    
    // if the hit probability is high enough
    if (hitProb > 60) {
      // check if we have enough AP to shoot
      if (this.ownerInstance.currentAp >= this.ownerInstance.attackCost) {
        this.ownerInstance.shoot(this.targetEnemy.position);
      }
      // if we don;t have enough AP to shoot we are finished
      else {
        this.ownerInstance.setAction(UnitFH.Actions.Finished);
        this.ownerInstance.setPath([]);
      }      
    }
    // if the hit probability is not high enough, move towards the enemy
    else {
      let path = game.currentScene.base.tileBoard.calculatePath(this.ownerInstance.position, this.targetEnemy.position);
      this.ownerInstance.setPath(path);      
    }
  }
  
  update() {
    // if we are already shooting at the enemy
    if (this.ownerInstance.action == UnitFH.Actions.Idle) {
      console.log("idle")
      this.decideAction();
    }
    else if (this.ownerInstance.action == UnitFH.Actions.Attack) {
      console.log("idle")
    }
    else if (this.ownerInstance.action == UnitFH.Actions.Move) {
      // If we are moving towards the target unit, check if we came in range to shoot it
      // if we have enought AP left to shoot:
      if (this.ownerInstance.currentAp >= this.ownerInstance.attackCost) {
        // calculate hit probability
        let hitProb = this.ownerInstance.calculateHitProbability(this.targetEnemy.position);
        if (hitProb > 60) {
          this.ownerInstance.shoot(this.targetEnemy.position);
          return;
          //this.ownerInstance.setPath([]);
        }
      }
      // continue moving towards the enemy
    }
  }
}
