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