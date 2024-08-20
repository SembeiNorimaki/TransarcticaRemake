class BuildingFH {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.img = gameData.buildingsFHData[this.name].img;
    this.offset = gameData.buildingsFHData[this.name].offset;
  }
  setPosition(position) {
    this.position.set(position.x, position.y);
  }
  
  show(cameraPosition) {
    let screenPos = boardToScreen(this.position, cameraPosition);
    mainCanvas.image(this.img, screenPos.x-this.offset[0], screenPos.y-this.offset[1], this.img.width/2, this.img.height/2);
    mainCanvas.circle(screenPos.x, screenPos.y, 10)
  }
}