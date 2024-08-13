class BridgeScene {
  constructor(img) {
    this.backgroundImage = img;
  }
  initialize() {

  }

  update() {

  }

  show() {
    mainCanvas.image(this.backgroundImage, 0, 0);
    mainCanvas.image(textToImage("You arrive next to a collapsed bridge"), 100, 800)
    
  }
}