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

class Hud {
  constructor() {
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.currentTime = new Date(3102441200 * 1000);

    this.buttons = [
      new ClickableRegion(createVector(80, 30), [50, 20], [hudData.frame, hudData.button_find], "",null),
      new ClickableRegion(createVector(80+140, 30), [50, 20], [hudData.frame, hudData.button_book], "",null),
      new ClickableRegion(createVector(80+2*140, 30), [50, 20], [hudData.frame, hudData.button_map], "",this.showMinimap)
    ];
  }

  onClick(mousePos) {
    console.log("Hud clicked");
    for (let button of this.buttons) {
      if (button.checkClick(p5.Vector.sub(mousePos, createVector(0, mainCanvasDim[1])))) {
        button.callback();
      }
    }
  }

  showMinimap() {
    console.log("Show minimap called");
    game.currentScene = new Minimap();
  }

  show() {

    for (let button of this.buttons) {
      button.show(canvas);
    }

    let x = hudCanvas.width-80;
    let y = hudCanvas.height-30;
    hudCanvas.image(hudData.frame, x, y);
    //hudCanvas.text(`${int(game.navigationScene.locomotive.velocity.mag()*300/9*300)} Km/h`, x, y);
    x-=140;
    hudCanvas.image(hudData.fuel, x, y);
    //hudCanvas.text(`${int(game.playerTrain.fuel)}`, x, y);
    x-=140;
    hudCanvas.image(hudData.gold, x, y);
    //hudCanvas.text(`${game.playerTrain.gold}`, x, y);
    x-=140;
    hudCanvas.image(hudData.frame, x, y);
    //hudCanvas.text(`${game.navigationScene.locomotive.gear}`, x, y);
  }
}