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

class Rifleman extends Unit {
  constructor(id, position, owner) {
    super(id, "Soldier", position, owner);
    
    let soldierTypeId = 0;
    if (this.owner == Game.Players.Cpu) {
      soldierTypeId = 1;
    }
    // let spriteData = {
    //   "imgs": gameData.unitsData.Soldier.Human,
    //   "actions": ["Idle", "Move", "Attack"],
    //   "nSprites": {"Idle": 1, "Move": 6, "Attack": 2},
    //   "spriteDuration": {"Idle": 100, "Move": 10, "Attack": 20}
    // }

    //this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.attackRange = 4;
    this.viewRange = 5;
    this.hp = 100;

    this.fireSpeed = 10;
    this.fireCount = this.fireSpeed;
    this.walkSpeed = 0.01;
    

  }
}

// class Rifleman extends Soldier {
//   constructor(id, position, soldierType, owner) {
//     super(id, position, soldierType, owner);
    
//     let soldierTypeId = 0;
//     if (this.owner == Game.Players.Cpu) {
//       soldierTypeId = 1;
//     }
//     let spriteData = {
//       "imgs": gameData.unitsData.soldier[soldierTypeId],
//       "actions": ["idle", "walk", "shoot"],
//       "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
//       "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
//     }

//     this.sprite = new Sprite("idle", this.orientation, spriteData);
//     this.attackRange = 4;
//     this.viewRange = 5;
//     this.hp = 100;

//     this.fireSpeed = 10;
//     this.fireCount = this.fireSpeed;
//     this.walkSpeed = 0.01;
    

//   }
// }