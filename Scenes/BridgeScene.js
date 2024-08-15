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

class BridgeScene {
  constructor(bridgeName) {
    // this.backgroundImage = img;
    this.bridgeName = bridgeName; 
    let conversationData = game.bridges[bridgeName].generateConversationData()
    game.conversationPanel.fillData(conversationData);
    game.conversationPanel.active = true;

  }
  initialize() {
  }
  onClick(mousePos) {
    if (game.conversationPanel.active) {
      let result = game.conversationPanel.onClick(mousePos);
      switch(result) {
        case(0):  // Yes
          game.bridges[this.bridgeName].build();
          game.currentScene = game.navigationScene;
          game.conversationPanel.active = false;
          
        break;
        case(1):  // No
          game.currentScene = game.navigationScene;
          game.conversationPanel.active = false;
        break;
      }
    }
    
  }

  update() {
    let a = 0;
  }

  show() {
    // mainCanvas.image(this.backgroundImage, 0, 0);
    // mainCanvas.image(textToImage("You arrive next to a collapsed bridge"), 100, 800)
    let a = 0;
    
  }
}