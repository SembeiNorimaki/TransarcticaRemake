class BuildingFH {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.img = gameData.buildingsFHData[this.name].img;
    this.halfSize = createVector(this.img.width/2, this.img.height/2);
    this.offset = gameData.buildingsFHData[this.name].offset;
  }

  setImage(img, offset) {
    this.img = img;
    this.halfSize = createVector(this.img.width/2, this.img.height/2);
    this.offset = offset;
  }

  setPosition(position) {
    this.position.set(position.x, position.y);
  }

  showBoundingBox(canvas, cameraPosition) {
    canvas.noFill();
    let screenPos = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    canvas.rect(screenPos.x-this.img.width/2, screenPos.y-this.img.height, this.img.width, this.img.height)
  }

  checkClick(mousePos, cameraPosition) {
    let screenPosition = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    return (
      mousePos.x > screenPosition.x - this.halfSize.x &&
      mousePos.x < screenPosition.x + this.halfSize.x &&
      mousePos.y > screenPosition.y - 2*this.halfSize.y &&
      mousePos.y < screenPosition.y
    );
  }
  
  show(canvas, cameraPosition) {
    let screenPos = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    canvas.image(this.img, screenPos.x-this.offset[0], screenPos.y-this.offset[1], this.img.width, this.img.height);
    canvas.circle(screenPos.x, screenPos.y, 10)
    this.showBoundingBox(canvas, cameraPosition);
  }
}