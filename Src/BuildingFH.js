class BuildingFH {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.img = gameData.buildingsFHData[this.name].img;
    this.halfSize = createVector(this.img.width/2, this.img.height/2);
    this.offset = gameData.buildingsFHData[this.name].offset;
  }
  setPosition(position) {
    this.position.set(position.x, position.y);
  }

  showBoundingBox(cameraPosition) {
    mainCanvas.noFill();
    let screenPos = boardToScreen(this.position, cameraPosition);
    mainCanvas.rect(screenPos.x-this.img.width/2, screenPos.y-this.img.height, this.img.width, this.img.height)
  }

  checkClick(mousePos, cameraPosition) {
    let screenPosition = boardToScreen(this.position, cameraPosition);
    return (
      mousePos.x > screenPosition.x - this.halfSize.x &&
      mousePos.x < screenPosition.x + this.halfSize.x &&
      mousePos.y > screenPosition.y - 2*this.halfSize.y &&
      mousePos.y < screenPosition.y
    );
  }
  
  show(cameraPosition) {
    let screenPos = boardToScreen(this.position, cameraPosition);
    mainCanvas.image(this.img, screenPos.x-this.offset[0], screenPos.y-this.offset[1], this.img.width, this.img.height);
    mainCanvas.circle(screenPos.x, screenPos.y, 10)
    this.showBoundingBox(cameraPosition);
  }
}