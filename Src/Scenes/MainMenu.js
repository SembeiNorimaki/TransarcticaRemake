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

class MainMenu {
  constructor() {
    this.buttons = [
      new Button(1, true, createVector(200, 100), createVector(150, 40), "New Game"),
      new Button(2, true, createVector(200, 250), createVector(150, 40), "Continue"),
      new Button(3, false, createVector(200, 400), createVector(150, 40), "Settings")
    ];
  }

  initialize() {

  }
  update() {

  }
  onClick(mousePos) {
    let result = null;
    for (let button of this.buttons) {
      result = button.onClick(mousePos);
      if (result !== null)
        break;
    }
    switch(result) {
      case(null):
      break;
      case(1):
        console.log("New Game");
        game.newGame();
        game.initialize();
      break;
      case(2):
        console.log("Continue");
        game.loadGame();
        game.initialize();
      break;
      case(3):
      console.log("Settings")
      break;
    }
  }

  show() {
    mainCanvas.image(backgroundImg, 0, 0);
    for (let button of this.buttons) {
      button.show(mainCanvas);
    }
  }
}