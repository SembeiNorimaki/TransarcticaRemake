class Base {
  constructor(baseData) {
    this.name = baseData.name;
    this.units = [];
    this.buildings = [];

    this.tileBoard = new TileBoard(gameData.baseBoard);

    for (let unitData of baseData.units) {
      let unit = new UnitFH(this.units.length, unitData.name, createVector(unitData.position[0], unitData.position[1]))
      this.placeUnit(unit.position, unit);
    }
    for (let buildingData of baseData.buildings) {
      let building = new BuildingFH(this.buildings.length, buildingData.name, createVector(buildingData.position[0], buildingData.position[1]));
      this.placeBuilding(building.position, building);

    }
  }

  placeBuilding(boardPosition, building) {
    this.tileBoard.placeBuilding(boardPosition, building);
    this.buildings.push(building);
    return true;
  }

  placeUnit(boardPosition, unit) {
    this.tileBoard.placeUnit(boardPosition, unit);
    this.units.push(unit);
    return true;
  }

  show(cameraPosition) {
    this.tileBoard.showTiles(mainCanvas, cameraPosition);
  }
}