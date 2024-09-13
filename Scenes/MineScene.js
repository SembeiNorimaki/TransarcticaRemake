class MineScene {
  constructor(mineName) {
    this.tileHalfSize = tileHalfSizes.Z1;
    this.mineName = mineName; 
    this.conversationPanel = new ConversationPanel();
    let conversationData = game.mines[mineName].generateConversationData();
    this.conversationPanel.fillData(conversationData);
    this.conversationPanel.active = true;
  }
  initialize() {

  }
  onClick(mousePos) {
    if (this.conversationPanel.active) {
      let result = this.conversationPanel.onClick(mousePos);
      switch(result) {
        case('0'):  // Yes
          game.mines[this.mineName].excavate();
          game.currentScene = game.navigationScene;
          game.conversationPanel.active = false;
        break;
        case('1'):  // No
          game.currentScene = game.navigationScene;
          game.conversationPanel.active = false;
        break;
      }
    }    
  }
  update() {

  }
  show() {
    this.conversationPanel.show();
  }
}