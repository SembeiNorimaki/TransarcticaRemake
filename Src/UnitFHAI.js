class UnitFHAI {
  constructor(ownerInstance) {
    this.ownerInstance = ownerInstance;
    this.role = "idle";

  }

  setRole(roleData) {
    this.role = roleData.role;
  }

  checkEnemyInAttackRange() {
    let i = 0;
    for (let soldier of game.currentScene.playerUnits) {
      let inRange = this.ownerInstance.inAttackRange(soldier.position);
      if (inRange) {
        return soldier;
      }
      i++;
    }
    return null;
  }

  requestOrders() {
    // first check if we have an enemy in range to fire
    let targetEnemy = this.checkEnemyInAttackRange();
    if (targetEnemy !== null) {
      // we have an enemy in range, lock it as the target to shoot
      console.log("Player soldier in range, shooting")
      return {
        "order": "shoot",
        "destination": targetEnemy
      }
    }

    // if not, if it's a soldier patrolling, check if he has reached the target point

    if (this.role == "patrol") {
      // if the soldier has not yet reach the current waypoint, dont give him any order
      if (this.ownerInstance.path.length > 0) {
        return {
          "order": "none",
          "destination": null  
        }
      }
      // otherwise give him a waypoint to move
      let targetLocation = this.patrolPoints[this.patrolIdx];
      this.patrolIdx++;
      if (this.patrolIdx >= this.patrolPoints.length) {
        this.patrolIdx = 0;
      }
      return {
        "order": "move",
        "destination": targetLocation
      };
    }
    else if (this.role == "idle") {
      return {
        "order": "idle",
        "destination": null
      };
    }
  }
}
