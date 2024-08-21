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


/* TODO:
- actions is not used
- Resizing sprite should be done hen preloading
*/
class Sprite {
  #currentAction;
  #orientation;
  #spriteIdx;
  #frameCount;
  #currentImg;
  #spriteData;
  #imgs;
  #actions;
  #nSprites;
  #frameDuration;

  constructor(action, orientation, spriteData) {
    // this.#spriteData = {
    //   "imgs": gameData.unitsData.soldier[0],
    //   "actions": ["idle", "walk", "shoot"],
    //   "nSprites": {"idle": 1, "walk": 6, "shoot": 2},
    //   "spriteDuration": {"idle": 100, "walk": 10, "shoot": 20}
    // }

    // imgs has the structure:
    // imgs [action] [orientation] [spriteIdx]

    this.#spriteData = spriteData;
    this.#imgs = this.#spriteData.imgs;
    this.#actions = this.#spriteData.actions;
    this.#nSprites = this.#spriteData.nSprites;
    this.#frameDuration = this.#spriteData.spriteDuration;
    
    this.#currentAction = action;
    this.#orientation = orientation;
    this.#spriteIdx = 0;
    this.#frameCount = 0;
    this.#currentImg = this.#imgs[this.#currentAction][this.#orientation][this.#spriteIdx];
  }

  setOrientation(ori) {
    if (ori == this.#orientation) {
      return;
    }
    this.#orientation = ori;
    this.#spriteIdx = 0;
    this.#frameCount = 0;
  }

  setAction(action) {
    if (action == this.#currentAction) {
      return;
    }
    this.#currentAction = action;
    this.#spriteIdx = 0;
    this.#frameCount = 0;
  }

  getAction() {
    return this.#currentAction;
  }

  getSpriteIdx() {
    return this.#spriteIdx;
  }
  getFrameCount() {
    return this.#frameCount;
  }

  update() {
    this.#frameCount++;
    if (this.#frameCount == this.#frameDuration[this.#currentAction]) {
      this.#frameCount = 0;
      this.#spriteIdx++;
      if (this.#spriteIdx == this.#nSprites[this.#currentAction]) {
        this.#spriteIdx = 0;
      }
    }
    try {
      this.#currentImg = this.#imgs[this.#currentAction][this.#orientation][this.#spriteIdx];
    }catch{
      console.log("aaa")
    }
  }

  show(screenPos) {
    mainCanvas.image(this.#currentImg, 
      screenPos.x - this.#currentImg.width/2, 
      screenPos.y - this.#currentImg.height/2
    );
    // mainCanvas.image(this.#currentImg, 
    //   screenPos.x, 
    //   screenPos.y
    // );
    //mainCanvas.circle(screenPos.x, screenPos.y, 5);
  }
}