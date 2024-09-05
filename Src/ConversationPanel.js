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

class ConversationPanel {
  constructor() {
    this.characterName = "Yuri";
    this.textLines = [
      "aaaa",
      "bbbb",
      "cccc"
    ];

    this.buttons = [];

      // new Button(1, true, createVector(mainCanvasDim[0]-120,mainCanvasDim[1]-150), createVector(100,40), "Accept", "green"),
      // new Button(2, true, createVector(mainCanvasDim[0]-120,mainCanvasDim[1]-50), createVector(100,40), "Decline", "red"),
    
    this.active = false;
  }

  fillData(data) {
    this.characterName = data.characterName;
    this.textLines = data.textLines;
    for (let [i, buttonData] of Object.entries(data.buttons)) {
      this.buttons.push(new Button(i, true, createVector(mainCanvasDim[0]-120,mainCanvasDim[1]-150+100*buttonData.row), createVector(100,40), buttonData.text, buttonData.color))
    }
  }

  onClick(mousePos) {
    let result = null;
    for (let button of this.buttons) {
      result = button.onClick(mousePos);
      if (result !== null)
        return result;
    }
    return null;
    
  }

  show() {
    if (!this.active) {
      return;
    }

    let y = mainCanvasDim[1]-160;
    //mainCanvas.textSize(24);
    mainCanvas.fill(255,255,255,200);
    mainCanvas.rect(0,mainCanvasDim[1]-200,mainCanvasDim[0],200);
    mainCanvas.image(charactersData[this.characterName], 25, mainCanvasDim[1]-200)
    mainCanvas.fill(0)
    for (let line of this.textLines) {
      mainCanvas.text(line, 250, y);
      y += 30;
    }
    for (let button of this.buttons) {
      button.show(mainCanvas);
    }
  }
}