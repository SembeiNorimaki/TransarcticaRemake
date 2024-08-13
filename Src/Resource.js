// Buy means the city buys from you
// Sell means the city sells to you

class Resource {
  constructor(resourceName) {
    this.resourceName = resourceName;
    this.img = resources[resourceName];
    this.position = createVector(0, 0);
    this.infoPanelData = {
      "title": this.resourceName,
      "image": this.img,
      "lines": [
        `Content:`,
        `Weight:`,
      ],
      "buttons": ""
    }
  } 

  generatePanelInfoData() {
    let data = {
      "title": this.resourceName,
      "image": this.img,
      "lines": [`Stored in: ${Wagon.resourceToWagon[this.resourceName]}`],
      "buttons": ""
    };

    return data;
  }

  setPos(position) {
    this.position = position;
  }

  checkClick(mousePos) {
    return (
      mousePos.x > this.position.x  &&
      mousePos.x < this.position.x + 100 &&
      mousePos.y > this.position.y &&
      mousePos.y < this.position.y + 40
    );
  }

  show() {
    mainCanvas.rect(this.position.x, this.position.y, this.img.width, this.img.height)
    mainCanvas.image(this.img, this.position.x, this.position.y);
  }
}