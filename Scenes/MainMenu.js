class MainMenu {
  constructor() {

  }
  initialize() {

  }
  update() {

  }
  show() {
    mainCanvas.textAlign(CENTER, CENTER);
    mainCanvas.textSize(40)
    mainCanvas.image(backgroundImg, 0, 0);
    mainCanvas.rect(100,100,300,80);
    mainCanvas.text("New Game", 250,140);
    mainCanvas.rect(100,250,300,80);
    mainCanvas.text("Continue", 250,290);
    mainCanvas.rect(100,400,300,80);
    mainCanvas.text("Settings", 250,440);
  }
}