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

class CombatAI {
  constructor() {
    this.updateCounter = 100;
    this.turn = 0;
    
  }

  initialize() {
    
  }

  update() {

    this.updateCounter--;
    if (this.updateCounter > 0) 
      return;

    if (this.turn % 1 == 0) {
      // Fire cannon
      let idx = game.currentScene.enemyHTrain.findWagonIdxByName("CannonWagon");
      if (game.currentScene.enemyHTrain.wagons[idx].isReadyToFire()) {
        game.currentScene.enemyHTrain.wagons[idx].fire();
      }

      idx = game.currentScene.enemyHTrain.findWagonIdxByName("MachinegunWagon");
      if (game.currentScene.enemyHTrain.wagons[idx].isReadyToFire()) {
        game.currentScene.enemyHTrain.wagons[idx].fire();
      }
    }

    if (this.turn == 0) {
      // game.currentScene.enemyHTrain.gearUp();
      // game.currentScene.deployEnemySoldier(-2);
      // game.currentScene.deployEnemySoldier(-1);
      // game.currentScene.deployEnemySoldier(0);
      // game.currentScene.deployEnemySoldier(1);
      // game.currentScene.deployEnemySoldier(2);
      
    } 
    // else if (this.turn == 1) {
    //   game.currentScene.enemyHTrain.gearDown();
    //   game.currentScene.enemyUnits[0].setTargetPosition(createVector(10,10));
    //   game.currentScene.enemyUnits[1].setTargetPosition(createVector(11,10));
    //   game.currentScene.enemyUnits[2].setTargetPosition(createVector(12,10));
    //   game.currentScene.enemyUnits[3].setTargetPosition(createVector(13,10));

      
    // } 
    // else if (this.turn == 1000) {
    //   game.currentScene.enemyUnits[0].setTargetPosition(createVector(500,700));
    //   game.currentScene.enemyUnits[1].setTargetPosition(createVector(750,700));
    //   game.currentScene.enemyUnits[2].setTargetPosition(createVector(1000,700));
    //   game.currentScene.enemyUnits[3].setTargetPosition(createVector(1300,700));
    // }

    
    this.updateCounter = 100;
    this.turn++;
  }
}