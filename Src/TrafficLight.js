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

class TrafficLight {
  static Color = {
    Red: 0,
    Green: 1
  }
  constructor(position) {
    this.position = position;
    this.screenPosition = Geometry.boardToScreen(this.position, game.currentScene.camera.position, game.currentScene.tileHalfSize);
    this.redImage = gameData.trafficLightData.red;
    this.greenImage = gameData.trafficLightData.green;
    this.halfSize = createVector(50, 50); 
    this.currentColor = TrafficLight.Color.Red;
    this.currentImage = this.redImage;
  }

  checkClick(mousePos) {
    let screenPosition = Geometry.boardToScreen(this.position, game.currentScene.camera.position, game.currentScene.tileHalfSize);
    if (
      mousePos.x > screenPosition.x - this.halfSize.x &&
      mousePos.x < screenPosition.x + this.halfSize.x &&
      mousePos.y > screenPosition.y - this.halfSize.y &&
      mousePos.y < screenPosition.y + this.halfSize.y
    ) {
      console.log("Traffic light clicked");
      if (this.currentColor == TrafficLight.Color.Red) {
        this.currentColor = TrafficLight.Color.Green;
        this.currentImage = this.greenImage;
      } else {
        this.currentColor = TrafficLight.Color.Red;
        this.currentImage = this.redImage;
      } 
      return true;
    }
    return false;    
  }

  show(cameraPos, tileHalfSize) {
    let screenPosition = Geometry.boardToScreen(this.position, cameraPos, tileHalfSize);
    mainCanvas.image(this.currentImage, screenPosition.x-this.halfSize.x, screenPosition.y-this.halfSize.y);
    // mainCanvas.stroke(0)
    // mainCanvas.rect(
    //   screenPosition.x-this.halfSize.x,
    //   screenPosition.y-this.halfSize.y,
    //   this.halfSize.x*2,
    //   this.halfSize.y*2
    // );
    // mainCanvas.circle(screenPosition.x, screenPosition.y,20);

  }
}