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

class SoldierAI {
  constructor(soldierType, ownerInstance) {
    this.ownerInstance = ownerInstance;
    this.role = "idle";
    this.soldierType = soldierType;
    this.patrolPoints = [
      createVector(100, 200),
      createVector(1000, 200),
    ];
    this.patrolIdx = 0;
  }

  setRole(roleData) {
    /* 
    {
      "role": "patrol",
      "waypoints": []
    }
    */
    this.role = roleData.role;
    if (this.role == "patrol") {
      this.patrolPoints = roleData.waypoints;
    }
  }

  checkEnemyInViewRange() {
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