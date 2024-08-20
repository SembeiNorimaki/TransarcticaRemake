class UnitFH {
  static Actions = { 
    Idle: 0,
    Move: 1,
    Attack: 2
  };
  static Orientations = {
    NW: 0,
    NE: 1,
    SW: 2,
    SE: 3
  }

  constructor(id, name, position) {
    this.id = id;
    this.name = name;

    // this.pos is a floating point position, contains decimal values
    this.position = position;
    // tilePos contains the integer coordinates of the tile
    this.tilePosition = position.copy();

    this.orientation = 0;
    
    let spriteData = {
      "imgs": gameData.unitsData[this.name],
      "actions": ["idle"],
      "nSprites": {"idle": 1},
      "spriteDuration": {"idle": 100}
    }

    this.sprite = new Sprite("idle", this.orientation, spriteData);
    this.offset = createVector(0,5)

  }

  setPosition(position) {
    this.position.set(position.x, position.y);
    this.tilePosition.set(round(position.x), round(position.y));    
  }
  getPosition() {
    return this.position;
  }

  move(delta) {
    this.setPosition(p5.Vector.add(this.position, delta));
  }

  setOrientation(newOrientation) {
    this.orientation = newOrientation;
    this.sprite.orientation = newOrientation;
  }

  update() {

  }

  show(cameraPosition) {
    let screenPos = boardToScreen(this.getPosition(), cameraPosition);
    this.sprite.update();
    this.sprite.show(createVector(screenPos.x-this.offset.x, screenPos.y-this.offset.y));
  }
}