class VehicleWagon extends Wagon {
  constructor(id, name, wagonData, owner) {
    super(id, name, wagonData, owner);
    this.loadPositions = [null, null, null, null, null];  // Has capacity for 5 vehicles
  }

  findAvailableSpot() {
    for (let [i, spot] of this.loadPositions.entries()) {
      if (spot === null) {
        return i;
      }
    }
    return null;
  }

  loadVehicle(vehicle) {
    let idx = this.findAvailableSpot();
    if (idx !== null) {
      this.loadPositions[idx] = vehicle;
      return true;
    }
    return false;
  }

  unloadVehicle(position) {
    let vehicle = this.loadPositions[position];
    this.loadPositions[position] = null;
    return vehicle;
  }

  unloadAll() {
    let units = [];
    let unit;
    for (let i=0; i<5; i++) {
      unit = this.unloadVehicle(i);
      if (unit !== null) {
        units.push(unit);
      }
    }
    return units;
  }

  showHorizontal(cameraPosition) {
    let position = this.position.copy();
    let screenPosition = Geometry.boardToScreen(position, cameraPosition, game.currentScene.tileHalfSize)
    mainCanvas.image(
      this.img[0], 
      screenPosition.x - this.offset[0][0], 
      screenPosition.y - this.offset[0][1]
    );
    for (let [i, unit] of this.loadPositions.entries()) {
      if (unit !== null) {
        mainCanvas.image(
          unit.sprite.getHorizontalImg(),
          10+screenPosition.x - this.offset[this.spriteId][0] + i*55, 
          screenPosition.y - this.offset[this.spriteId][1] - 25
        );
      }
    }

    this.showHealthBar(screenPosition);
  }
}