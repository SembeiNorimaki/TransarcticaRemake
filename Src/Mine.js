class Mine {
  static OriToTileIdActive = {
    "A": 0x48,
    "B": 0x49,
    "C": 0x4A,
    "D": 0x4B
  }
  static OriToTileIdHidden = {
    "A": 0x05,
    "B": 0x04,
    "C": 0x03,
    "D": 0x02
  }
  constructor(mineData) {
    this.mineData = mineData;
    this.completed = false;
    this.location = null;
  }

  
  generateConversationData() {
    
    let conversationText = [
      `We arrived to an Anthracite mine. Do you want to mine resources? :`,
      `Available workforce: 0 Cranes, 2 Mamooths, 50 Slaves`,
    ];
    
    return {
      "characterName": "Yuri",
      "textLines": conversationText,
      "buttons": [
        {"text": "Yes", "color": "green", "row": 0},
        {"text": "No", "color": "red", "row": 1}
      ]
    };
    
  }

  reveal() {
    console.log(`Mine ${this.mineData.name} revealed`);
    game.events[`${this.location.x},${this.location.y}`] = this.name;
    game.navigationScene.tileBoard.board[this.location.y][this.location.x].setTileId(Mine.OriToTileIdActive[this.mineData.orientation]);   
  }

  excavate() {
    game.playerTrain.coal += 2000;
    this.completed = true;
  }
}