class ConversationPanel {
  constructor() {
    this.characterName = "Yuri";
    this.textLines = [
      "aaaa",
      "bbbb",
      "cccc"
    ];

    this.buttons = [
      new Button(1, createVector(), createVector(), "Accept", "green"),
      new Button(2, createVector(), createVector(), "Decline", "red"),
    ];
  }

  fillData(data) {
    this.characterName = data.characterName;
    this.textLines = data.textLines;
  }

  onClick() {
    let result = null;
    for (let button of this.buttons) {
      result = this.buttons.show(mainCanvas);
      if (result !== null)
        break
    }
    switch(result) {
      case(1):
      break;
      case(2):
      break;
    }
  }

  show() {
    let y = mainCanvasDim[1]-200;
    //mainCanvas.textSize(24);
    mainCanvas.fill(255,255,255,200);
    mainCanvas.rect(0,mainCanvasDim[1]-200,mainCanvasDim[0],200);
    for (let line of this.textLines) {
      mainCanvas.text(line, 200, y);
      y += 30;
    }
    for (let button of this.buttons) {
      button.show(mainCanvas);
    }
  }

}