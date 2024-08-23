class Base {
  constructor(baseData) {
    this.name = baseData.name;
    this.units = [];
    this.buildings = [];

    this.tileBoard = new TileBoard(gameData.baseBoard);

    for (let unitData of baseData.units) {
      let unit = new UnitFH(unitData.name, createVector(unitData.position[0], unitData.position[1]), "CPU")
      this.addUnit(unit);
    }
    for (let buildingData of baseData.buildings) {
      let building = new BuildingFH(this.buildings.length, buildingData.name, createVector(buildingData.position[0], buildingData.position[1]));
      this.addBuilding(building);

    }
    this.initialize();
  }

  initialize() {
    // build central rail
    for (let x=0; x<99; x++) {
      this.tileBoard.board[99-x][x].setTileId(0x6B)
      this.tileBoard.board[99-x-1][x].setTileId(0x6C)
    }

    // bottom rail
    for (let x=74; x<99; x++) {
      this.tileBoard.board[99+74-x][x].setTileId(0x6B)
      this.tileBoard.board[99+74-x-1][x].setTileId(0x6C)
    }

    for (let x=20; x<49; x++) {
      this.tileBoard.board[99-30-x][x].setTileId(0x62)
      this.tileBoard.board[99-30-x-1][x].setTileId(0x63)
    }

    for (let x=51; x<80; x++) {
      this.tileBoard.board[80+50-x][x].setTileId(0x62)
      this.tileBoard.board[80+50-x-1][x].setTileId(0x63)
    }

    for (let y=49; y<75; y++) {
      this.tileBoard.board[y][20].setTileId(0x61)
    }
    for (let x=49; x<75; x++) {
      this.tileBoard.board[20][x].setTileId(0x60)
    }
    
    for (let y=25; y<51; y++) {
      this.tileBoard.board[y][99-20].setTileId(0x61)
    }
    for (let x=25; x<51; x++) {
      this.tileBoard.board[99-20][x].setTileId(0x60)
    }

    
  }

  addBuilding(building) {
    this.tileBoard.placeBuilding(building.position, building);
    this.buildings.push(building);
    return true;
  }
  
  addBuildings(buildings) {
    for (let building of buildings) {
      this.addBuilding(building);
    }
  }

  addUnit(unit) {
    unit.id = this.units.length;
    this.tileBoard.placeUnit(unit.position, unit);
    this.units.push(unit);
  }

  addUnits(units) {
    for (let unit of units) {
      this.addUnit(unit);
    }
  }

  show(cameraPosition) {
    this.tileBoard.showTiles(mainCanvas, cameraPosition);
    this.tileBoard.showUnits(mainCanvas, cameraPosition);
  }
}