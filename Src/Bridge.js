class Bridge {
  constructor(bridgeData) {
    this.bridgeData = bridgeData;
    this.completed = false;
  }

  process() {
    // if (this.checkRequirements()) {
    //   console.log("")
    // } 
    // game.conversationPanel.fillData(this.generateConversationData());
    // game.conversationPanel.active = true; 
    this.build();

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
      console.log(tilePos)
      game.navigationScene.tileBoard.board[tilePos[1]][tilePos[0]].setTileId(tileId);
    }

    // TODO: substract resources from the train
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
    for (let [resourceName, qty] of Object.entries(this.bridgeData.resources)) {
      if (resourceName in game.playerTrain.contents == false || game.playerTrain.contents[resourceName] < qty) {
        console.log(`Not enough ${resourceName}. Required: ${qty}. Available: ${game.playerTrain.contents[resourceName]}`);
        return false;
      }
    }
    return true;
  }
}
