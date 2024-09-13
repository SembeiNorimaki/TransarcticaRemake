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

class Bridge {
  constructor(bridgeData) {
    this.bridgeData = bridgeData;
    this.completed = false;
    this.locations = [];
  }

  process() {
    if (this.checkRequirements()) {
      this.build();
    } 
    // game.conversationPanel.fillData(this.generateConversationData());
    // game.conversationPanel.active = true; 
    

  }

  build() {
    let tileId;
    if (this.bridgeData.type === "Bridge") {
      if (this.bridgeData.orientation === "AD") {
        tileId = 0x50;
      } else if (this.bridgeData.orientation === "BC"){
        tileId = 0x53;
      }  
    } else if (this.bridgeData.type === "Rail") {
      if (this.bridgeData.orientation === "AD") {
        tileId = 0x30;
      } else if (this.bridgeData.orientation === "BC"){
        tileId = 0x31;
      }
    } else if (this.bridgeData.type === "Tunnel") {
      if (this.bridgeData.orientation === "A") {
        tileId = 0x48;
      } else if (this.bridgeData.orientation === "B"){
        tileId = 0x49;
      } else if (this.bridgeData.orientation === "C"){
        tileId = 0x4A;
      } else if (this.bridgeData.orientation === "D"){
        tileId = 0x4B;
      }
    }

    for (let tilePos of this.bridgeData.tiles) {
      game.navigationScene.tileBoard.board[tilePos[1]][tilePos[0]].setTileId(tileId);
    }

    // remove resources from train
    for (let [resourceName, qty] of Object.entries(this.bridgeData.resources)) {
      game.playerTrain.sellResourceByName(resourceName, qty, 0);
    }
  }

  generateConversationData() {
    let conversationText = [
      `We can build a ${this.bridgeData.type} here. We will need:`
    ];
    let aux = [];
    for (let [resourceName, qty] of Object.entries(this.bridgeData.resources)) {
      aux.push(`${qty}x ${resourceName}`);
    }
    conversationText.push(aux.join(', '))

    conversationText.push("Proceed with the construction?")

    return {
      "characterName": "Yuri",
      "textLines": conversationText,
      "buttons": [
        {"text": "Yes", "color": "green", "row": 0},
        {"text": "No", "color": "red", "row": 1}
      ]
    };
  }
  

  checkRequirements() {
    let wagonsOK = false;
    let resourcesOK = true;
    let manpowerOK = false;

    // Check resources
    for (let [resourceName, qty] of Object.entries(this.bridgeData.resources)) {
      if (resourceName in game.playerTrain.contents == false || game.playerTrain.contents[resourceName] < qty) {
        console.log(`Not enough ${resourceName}. Required: ${qty}. Available: ${game.playerTrain.contents[resourceName]}`);
        resourcesOK = false;
        break;
      }
    }

    // check wagons
    for (let [wagonName, qty] of Object.entries(this.bridgeData.wagons)) {
      for (let wagon of game.playerTrain.wagons) {
        if (wagon.name == wagonName) {
          wagonsOK = true;
          break;
        }
      }
    }

    return wagonsOK && resourcesOK;
  }
}
