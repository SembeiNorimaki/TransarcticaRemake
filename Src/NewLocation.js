class NewLocation {
  constructor(baseData) {
    this.tileHalfSize = tileHalfSizes.Z1;
    this.baseData = baseData;
    this.name = baseData.name;
    
    this.tileBoard = new TileBoard(TileBoard.createEmptyBoard(createVector(100, 100), 0x22), this.tileHalfSize);

    this.tileBoard.board[0][0].reveal();
    this.tileBoard.board[1][0].reveal();
    this.tileBoard.board[2][0].reveal();
    this.tileBoard.board[1][1].reveal();
    this.tileBoard.board[2][1].reveal();
    this.units = [];

    this.addUnit(new Tank("Tank", createVector(0,1), Game.Players.Human));
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
    let showOptions = { 
      "outOfBoardTile": 0x21,
      "baseTile": null,
      "showTerrain": true,
      "showBuildings": true,
      "showUnits": false,
      "showWalls": false,
      "showMinimap": false
    }
    this.tileBoard.show(mainCanvas, cameraPosition, showOptions);
    showOptions = { 
      "outOfBoardTile": null,
      "baseTile": null,
      "showTerrain": false,
      "showBuildings": false,
      "showUnits": true,
      "showWalls": false,
      "showMinimap": false
    }
    this.tileBoard.show(mainCanvas, cameraPosition, showOptions);
  }

}

