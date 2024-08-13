class MainMenu {
  constructor() {
    this.buttons = [
      new Button(1, true, createVector(200, 100), createVector(150, 40), "New Game"),
      new Button(2, true, createVector(200, 250), createVector(150, 40), "Continue"),
      new Button(3, false, createVector(200, 400), createVector(150, 40), "Settings")
    ];
  }

  initialize() {

  }
  update() {

  }
  onClick(mousePos) {
    let result = null;
    for (let button of this.buttons) {
      result = button.onClick(mousePos);
      if (result !== null)
        break;
    }
    switch(result) {
      case(null):
      break;
      case(1):
        console.log("New Game");
        game.newGame();
        game.initialize();
      break;
      case(2):
        console.log("Continue");
        game.loadGame();
        game.initialize();
      break;
      case(3):
      console.log("Settings")
      break;
    }
  }

  show() {
    mainCanvas.image(backgroundImg, 0, 0);
    for (let button of this.buttons) {
      button.show(mainCanvas);
    }
  }
}