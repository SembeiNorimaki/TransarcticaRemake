class BarracksWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
  }

  deploySoldier() {
    let spawnPosition = p5.Vector.add(this.position, createVector(-2, -2));
    spawnPosition.set(round(spawnPosition.x), round(spawnPosition.y))
    let unit = new Rifleman(9, spawnPosition, 0, Game.Players.Human);
    return unit;
  }
}