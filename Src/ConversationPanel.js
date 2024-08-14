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
    for (let [i, buttonData] of data.buttons.entries()) {
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