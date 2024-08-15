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

class CannonWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
    this.reloadTime = 300;
    this.reloadCount = this.reloadTime;
  }

  isReadyToFire() {
    return (this.reloadCount == 0);
  }

  update() {
    if (this.reloadCount > 0) {
      this.reloadCount--;
    }
  }

  fire() {
    if (this.isReadyToFire()) {
      this.reloadCount = this.reloadTime;
      let spawnPosition = createVector(this.position.x + this.halfSize.x, this.position.y-40); 
      game.currentScene.cannonball = new Cannonball(spawnPosition);
    }
  }

  showReloadBar(cameraPos) {
    mainCanvas.push();
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,this.halfSize.x*2,5);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,
      this.reloadCount*this.halfSize.x*2/this.reloadTime,5);
    
    mainCanvas.pop();
    
  }

}