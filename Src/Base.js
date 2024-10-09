class Base {
  constructor(baseData) {
    this.tileHalfSize = tileHalfSizes.Z1;
    this.baseData = baseData;
    this.name = baseData.name;
    this.units = [];
    this.buildings = [];
    this.location = null;
    this.owner = baseData.owner;
    

    this.wagonStorage = [
      {"position": createVector(71-0*3.2,33+0*3.2), "wagon": null},
      {"position": createVector(71-1*3.2,33+1*3.2), "wagon": null},
      {"position": createVector(71-2*3.2,33+2*3.2), "wagon": null},
      {"position": createVector(71-3*3.2,33+3*3.2), "wagon": null},
      {"position": createVector(71-4*3.2,33+4*3.2), "wagon": null},
      {"position": createVector(71-5*3.2,33+5*3.2), "wagon": null},
      {"position": createVector(71-6*3.2,33+6*3.2), "wagon": null},
      {"position": createVector(71-7*3.2,33+7*3.2), "wagon": null},
      {"position": createVector(71-8*3.2,33+8*3.2), "wagon": null},
      {"position": createVector(71-9*3.2,33+9*3.2), "wagon": null},
      {"position": createVector(71-10*3.2,33+10*3.2), "wagon": null},
      {"position": createVector(71-11*3.2,33+11*3.2), "wagon": null},
      {"position": createVector(71-12*3.2,33+12*3.2), "wagon": null},
    ];
    this.nStoredWagons = 0;

    // empty baseboard
    let NROWS = 100;
    let NCOLS = 100;
    let baseBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (let row=0; row<NROWS; row++) {
      for (let col=0; col<NCOLS; col++) {
        baseBoard[row][col] = 0x6E;
      }
    }

    this.tileBoard = new TileBoard(baseBoard, this.tileHalfSize);
    
    this.initialize();
  }

  generateBuildMenu() {
    let elements = [];
    let x = 100;
    let y = 50; 
    for (let [i, name] of ["ConstructionBay", "Factory", "Barracks"].entries()) {
      elements.push(new Button(`BuildBuilding_${name}`, true, createVector(x,y), createVector(90,30), null, (255,255,255,200), gameData.buildingsFHData[name].img));
      elements.push(new Text(name, createVector(x,y+50)));
      x += 200;
      if (x >= 1800) {
        y += 100;
        x = 400;
      }
    }
    return elements;
  }

  addWagonToStorage(wagon) {
    for (let [i, elem] of this.wagonStorage.entries()) {
      if (elem.wagon === null) {
        wagon.setPosition(elem.position);
        this.wagonStorage[i].wagon = wagon;
        this.nStoredWagons++;
        return;
      }
    }
  }

  removeWagonFromStorage(idx) {
    let wagon = this.wagonStorage[i].wagon;
    this.wagonStorage[i].wagon = null;
    this.nStoredWagons--;
    return wagon;
  }


  populateBackgroundImg() {
    let img = createGraphics(mainCanvasDim[0]+this.tileHalfSize.x*2, mainCanvasDim[1]+this.tileHalfSize.y*6);
    let nCols = 29;
    let nRows = 29;
    let x, y;
    for (let row=0; row<nRows; row++) {
      y = row * this.tileHalfSize.y*2;
      for (let col=0;col<nCols; col++) {
        x = col * this.tileHalfSize.x*2;
        Tile.draw(img, 0x6E, createVector(x,y),this.tileHalfSize)
        Tile.draw(img, 0x6E, createVector(x+this.tileHalfSize.x, y+this.tileHalfSize.y),this.tileHalfSize)
      }
    }
    return img;
  }

  initialize() {
    this.backgroundImg = this.populateBackgroundImg();

    // populate walls
    // for (let position of this.baseData.walls) {
    //   this.addWall(createVector(position[0], position[1]));
    // }

    // populate units
    let unit;
    for (let unitData of this.baseData.units) {
      if (unitData.name == "Artillery")
        unit = new Artillery(unitData.name, createVector(unitData.position[0], unitData.position[1]), this.owner);
      else if(unitData.name == "Tank")
        unit = new Tank(unitData.name, createVector(unitData.position[0], unitData.position[1]), this.owner);
      this.addUnit(unit);
    }

    // populate buildings
    for (let buildingData of this.baseData.buildings) {
      let building = new BuildingFH(this.buildings.length, buildingData.name, createVector(buildingData.position[0], buildingData.position[1]));
      this.addBuilding(building);

    }

    for (let wagonData of this.baseData.wagons) {
      let wagon = new Wagon(this.nStoredWagons, wagonData.name, wagonsData[wagonData.name], Game.Players.Human);
      this.addWagonToStorage(wagon);
    }


    // build central rail
    for (let x=0; x<99; x++) {
      this.tileBoard.board[99-x][x].setTileId(0x82)
      this.tileBoard.board[99-x-1][x].setTileId(0x83)
    }

    // secondary central rail
    for (let x=28; x<78; x++) {
      this.tileBoard.board[105-x][x].setTileId(0x82)
      this.tileBoard.board[105-x-1][x].setTileId(0x83)
    }

    // bottom rail
    for (let x=74; x<99; x++) {
      this.tileBoard.board[99+74-x][x].setTileId(0x82)
      this.tileBoard.board[99+74-x-1][x].setTileId(0x83)
    }

    // Walls
    for (let x=20; x<49; x++) {
      this.addWall(createVector(x, 99-30-x), 0x62);
      this.addWall(createVector(x, 99-30-x-1), 0x63);
    }

    for (let x=51; x<80; x++) {
      this.addWall(createVector(x, 80+50-x), 0x62);
      this.addWall(createVector(x, 80+50-x-1), 0x63);
    }

    for (let y=49; y<75; y++) {
      this.addWall(createVector(20, y), 0x61);
    }
    for (let x=49; x<75; x++) {
      this.addWall(createVector(x,20), 0x60);
    }
    
    for (let y=25; y<51; y++) {
      this.addWall(createVector(99-20, y), 0x61);
    }
    for (let x=25; x<51; x++) {
      this.addWall(createVector(x, 99-20), 0x60);
    }

    // roads
    for (let y=44; y>24; y--) {
      this.tileBoard.board[y][48].setTileId(0x71)
      this.tileBoard.board[y+6*1][42].setTileId(0x71)
      this.tileBoard.board[y+6*2][36].setTileId(0x71)
      this.tileBoard.board[y+6*3][30].setTileId(0x71)
      this.tileBoard.board[y+6*4][24].setTileId(0x71)
    }
    for (let x=24; x<44; x++) {
      this.tileBoard.board[49][x].setTileId(0x70)
      this.tileBoard.board[42][x+6*1].setTileId(0x70)
      this.tileBoard.board[36][x+6*2].setTileId(0x70)
      this.tileBoard.board[30][x+6*3].setTileId(0x70)
      this.tileBoard.board[24][x+6*4].setTileId(0x70)
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

  removeUnit(unitIdx) {
    this.tileBoard.removeUnit(this.units[unitIdx].tilePosition);
    this.units[unitIdx] = null;
  }

  addWall(boardPos, tileId) {
    this.tileBoard.placeWall(boardPos, tileId);
  }

  showWagonStorageLocations(cameraPosition) {
    for (let elem of this.wagonStorage) {
      let screenPosition = Geometry.boardToScreen(elem.position, cameraPosition, this.tileHalfSize);
      mainCanvas.circle(screenPosition.x, screenPosition.y, 10);
    }
  }

  show(cameraPosition) {
    //let start = performance.now()
    mainCanvas.background(0);
    mainCanvas.image(this.backgroundImg, -cameraPosition.x % (this.tileHalfSize.x*2), -cameraPosition.y % (this.tileHalfSize.y*2));
       
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
    this.tileBoard.show(mainCanvas, cameraPosition, showOptions);


    for (let elem of this.wagonStorage) {
      if (elem.wagon !== null) {
        elem.wagon.showHorizontal(cameraPosition);
      }
    }

    this.showWagonStorageLocations(cameraPosition)

    // this.tileBoard.showMinimap(mainCanvas)

    //let end = performance.now()
    //console.log(end-start)
    // hudCanvas.background(0)
    // hudCanvas.text(cameraPosition.y%tileHalfSizes.Z1.y,100,30)
  }
}

class WagonStorage {
  constructor() {

  }
}