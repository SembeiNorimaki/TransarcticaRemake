class Base {
  constructor(baseData) {
    this.name = baseData.name;
    this.units = [];
    this.buildings = [];
    this.wagons = [];

    this.tileBoard = new TileBoard(gameData.baseBoard);
    
    let unit;
    for (let unitData of baseData.units) {
      if (unitData.name == "Artillery")
        unit = new Artillery(unitData.name, createVector(unitData.position[0], unitData.position[1]), Game.Players.Cpu);
      else if(unitData.name == "Tank")
        unit = new Tank(unitData.name, createVector(unitData.position[0], unitData.position[1]), Game.Players.Cpu);
      this.addUnit(unit);
    }

    for (let buildingData of baseData.buildings) {
      let building = new BuildingFH(this.buildings.length, buildingData.name, createVector(buildingData.position[0], buildingData.position[1]));
      this.addBuilding(building);

    }

    let x = 65;
    let y = 39;
    for (let wagonData of baseData.wagons) {
      let wagon = new Wagon(0, wagonData.name, wagonsData[wagonData.name]);
      wagon.setPosition(createVector(x,y));
      this.wagons.push(wagon);
      x += 3;
      y -= 3;
    }

    this.backgroundImg = this.populateBackgroundImg();
    this.initialize();
  }


  populateBackgroundImg() {
    let img = createGraphics(mainCanvasDim[0]+TILE_WIDTH_HALF*2, mainCanvasDim[1]+TILE_HEIGHT_HALF*6);
    let nCols = 29;
    let nRows = 29;
    let x, y;
    for (let row=0; row<nRows; row++) {
      y = row * TILE_HEIGHT_HALF*2;
      for (let col=0;col<nCols; col++) {
        x = col * TILE_WIDTH_HALF*2;
        Tile.draw(img, 0x6E, createVector(x,y))
        Tile.draw(img, 0x6E, createVector(x+TILE_WIDTH_HALF,y+TILE_HEIGHT_HALF))
      }
    }
    return img;
  }

  initialize() {
    // build central rail
    for (let x=0; x<99; x++) {
      this.tileBoard.board[99-x][x].setTileId(0x82)
      this.tileBoard.board[99-x-1][x].setTileId(0x83)
    }

    // secondary central rail
    for (let x=25; x<75; x++) {
      this.tileBoard.board[104-x][x].setTileId(0x82)
      this.tileBoard.board[104-x-1][x].setTileId(0x83)
    }
    // this.tileBoard.board[27][74].setTileId(0x6A)

    // bottom rail
    for (let x=74; x<99; x++) {
      this.tileBoard.board[99+74-x][x].setTileId(0x82)
      this.tileBoard.board[99+74-x-1][x].setTileId(0x83)
    }

    // Walls
    for (let x=20; x<49; x++) {
      this.addWall(createVector(x, 99-30-x), 0x62);
      this.addWall(createVector(x, 99-30-x-1), 0x63);
      // this.tileBoard.board[99-30-x][x].setTileId(0x62)
      // this.tileBoard.board[99-30-x-1][x].setTileId(0x63)
    }

    for (let x=51; x<80; x++) {
      this.addWall(createVector(x, 80+50-x), 0x62);
      this.addWall(createVector(x, 80+50-x-1), 0x63);
      // this.tileBoard.board[80+50-x][x].setTileId(0x62)
      // this.tileBoard.board[80+50-x-1][x].setTileId(0x63)
    }

    for (let y=49; y<75; y++) {
      this.addWall(createVector(20, y), 0x61);
      // this.tileBoard.board[y][20].setTileId(0x61)
    }
    for (let x=49; x<75; x++) {
      this.addWall(createVector(x,20), 0x60);
      // this.tileBoard.board[20][x].setTileId(0x60)
    }
    
    for (let y=25; y<51; y++) {
      this.addWall(createVector(99-20, y), 0x61);
      // this.tileBoard.board[y][99-20].setTileId(0x61)
    }
    for (let x=25; x<51; x++) {
      this.addWall(createVector(x, 99-20), 0x60);
      // this.tileBoard.board[99-20][x].setTileId(0x60)
    }

    
    this.addWall(createVector(84, 92), 0x60);
    this.addWall(createVector(85, 92), 0x60);
    this.addWall(createVector(86, 92), 0x60);
    this.addWall(createVector(87, 92), 0x60);
    this.addWall(createVector(88, 92), 0x60);

    // this.tileBoard.board[92][84].setTileId(0x60)
    // this.tileBoard.board[92][85].setTileId(0x60)
    // this.tileBoard.board[92][86].setTileId(0x60)
    // this.tileBoard.board[92][87].setTileId(0x60)
    // this.tileBoard.board[92][88].setTileId(0x60)
    

    
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
  addWall(boardPos, tileId) {
    this.tileBoard.placeWall(boardPos, tileId);
  }

  show(cameraPosition) {
    //let start = performance.now()
    mainCanvas.background(0);
    mainCanvas.image(this.backgroundImg, -cameraPosition.x % (TILE_WIDTH_HALF*2), -cameraPosition.y % (TILE_HEIGHT_HALF*2));
    
    //this.tileBoard.showTiles(mainCanvas, cameraPosition);
    
    //this.tileBoard.showTiles2(mainCanvas, cameraPosition);
    //this.tileBoard.showUnits(mainCanvas, cameraPosition);
    
    let showOptions = { 
      "outOfBoardTile": 0x6F,
      "baseTile": 0x6E,
      "showTerrain": true,
      "showBuildings": true,
      "showUnits": false,
      "showWalls": false,
      "showMinimap": false
    }
    this.tileBoard.show(mainCanvas, cameraPosition, showOptions);
    showOptions = { 
      "outOfBoardTile": 0x6F,
      "baseTile": 0x6E,
      "showTerrain": false,
      "showBuildings": false,
      "showUnits": true,
      "showWalls": false,
      "showMinimap": false
    }
    // this.tileBoard.show(mainCanvas, cameraPosition, showOptions);


    for (let wagon of this.wagons) {
      wagon.showHorizontal(cameraPosition);
    }

    // this.tileBoard.showMinimap(mainCanvas)

    //let end = performance.now()
    //console.log(end-start)
    // hudCanvas.background(0)
    // hudCanvas.text(cameraPosition.y%TILE_HEIGHT_HALF,100,30)
  }
}