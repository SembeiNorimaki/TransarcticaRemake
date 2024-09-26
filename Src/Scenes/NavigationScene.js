// Copyright (C) 2024  Sembei Norimaki

// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

class NavigationScene {
  constructor() {
    this.tileHalfSize = tileHalfSizes.Z2;
    this.selectedIntersection = null;

    this.camera = new Camera(createVector(0,0));
    this.tileBoard = new TileBoard(gameData.mapBoard, this.tileHalfSize);
    
    this.locomotive = new Locomotive(createVector(72, 363), 90.0, Game.Players.Human);
    this.enemyLocomotive = new Locomotive(createVector(72, 363), 90.0, Game.Players.Cpu);

    this.backgroundImg = this.populateBackgroundImg();
    
    this.conversationPanel = new ConversationPanel();

    // This is needed because tile.drawBuildings will look for buildings in game.currentScene
    // Store here the buildings representing cities, industries

    this.buildings = [];
    this.units = [];
  }

  initialize() {
    // this.minimapImg = this.populateMinimap();
    this.getNewIntersection(this.locomotive.currentTile, this.locomotive.orientation);
    this.camera.setPosition(Geometry.boardToCamera(this.locomotive.position, this.tileHalfSize));
    // sounds.TravelMusic.play()
  }

  populateBackgroundImg() {
    let img = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let nCols = 14;
    let nRows = 14;
    let x, y;
    for (let row=0; row<nRows; row++) {
      y = row * this.tileHalfSize.y*2;
      for (let col=0;col<nCols; col++) {
        x = col * this.tileHalfSize.x*2;
        Tile.draw(img, 0x01, createVector(x,y), this.tileHalfSize);
        Tile.draw(img, 0x01, createVector(x+this.tileHalfSize.x, y+this.tileHalfSize.y), this.tileHalfSize);
      }
    }
    return img;
  }

  populateMinimap() {
    let img = createGraphics(game.navigationScene.tileBoard.boardDim.x*2, game.navigationScene.tileBoard.boardDim.y*2);
    for (let [y, row] of game.navigationScene.tileBoard.board.entries()) {
      for (let [x, tile] of row.entries()) {
        Tile.draw2D(img, tile.tileId, createVector(x*2, y*2));
      }
    }
    return img;
  }
  


  processKey(key) {
    console.log(key)
    if (key == "Control") {
      this.locomotive.startStop();
      this.getNewIntersection(this.locomotive.currentTile, this.locomotive.orientation);
    } else if (key == "Shift") {
      this.locomotive.turn180();
      this.getNewIntersection(this.locomotive.currentTile, this.locomotive.orientation);
    } else if (key == " " && this.selectedIntersection !== null) {
      this.selectedIntersection.changeTile();
    } else if (key == "ArrowLeft") {
      this.camera.move(createVector(-500,0))
    } else if (key == "ArrowRight") {
      this.camera.move(createVector(500,0))
    } else if (key == "ArrowUp") {
      this.camera.move(createVector(0,-300))
    } else if (key == "ArrowDown") {
      this.camera.move(createVector(0,300))
    } else if (key == "s") {
      game.saveGame();
    }
     
  }

  onClick(mousePos) {
    let tilePos = Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize);
    console.log(`Clicked tile ${tilePos.array()}`)
    // if (this.conversationPanel.active && mousePos.y > mainCanvasDim[1]-200) {
    //   let result = game.conversationPanel.onClick(mousePos);
    //   console.log(result)
    // } else {
    //   console.log(`Clicked tile ${Geometry.screenToBoard(mousePos, this.camera.position, this.tileHalfSize)}`)
    // }
    this.conversationPanel.active = false;
  }

  // TODO: precompute next intersection
  getNewIntersection(pos, ori) {
    let newPos = pos.copy();
    let newOri = ori;
    
    for (let i=0; i<10; i++) {
      if (this.tileBoard.board[newPos.y][newPos.x].isIntersection) {
        this.selectedIntersection = this.tileBoard.board[newPos.y][newPos.x]
        return;
      }
      
      let tileName =  Tile.idxToName[this.tileBoard.board[newPos.y][newPos.x].tileId];
      if (!(tileName in Tile.orientationToExit)) {
        this.selectedIntersection = null;
        return;
      }
      let exitSide = Tile.orientationToExit[tileName][newOri];
      let delta = Tile.sideToDelta[exitSide];

      newPos.add(createVector(delta[0], delta[1]));
      tileName =  Tile.idxToName[this.tileBoard.board[newPos.y][newPos.x].tileId];
      
      let entrySide = Tile.oppositeSide[exitSide];
      if (tileName in Tile.entryToOrientation) {
        newOri = Tile.entryToOrientation[tileName][entrySide];
      } else {
        this.selectedIntersection = null;
        return;
      }
    }
  }

  canEnterNextTile(currentTileName, nextTileName, currentOrientation) {
    // given the current tile and the orientation, calculate what side we are exiting
    let exitSide = Tile.orientationToExit[currentTileName][currentOrientation];

    // knowing where we exit, the opposite side is where we enter
    let entrySide = Tile.oppositeSide[exitSide];

    // with the entry side and the next tile we can:
    // if the key doesnt exist, we cannot enter the tile
    // if the key exist, it gives us the new orientation
    if (nextTileName in Tile.entryToOrientation && entrySide in Tile.entryToOrientation[nextTileName]) {
      let newOrientation = Tile.entryToOrientation[nextTileName][entrySide];
      return true;
    } else {
      // we cannot enter the tile
      return false;
    }

  }

  update() {
    this.locomotive.update();

    // check if we intercepted enemy locomotive
    if (this.enemyLocomotive.position.dist(this.locomotive.position) < 0.2) {
      game.currentScene = new CombatScene(game.playerTrain, game.enemyTrain);
      return;
    }

    // Center sensor puts the locomotive in a new orientation and computes next intersection
    if (this.locomotive.enteredNewTile(1)) { // center sensor
      this.locomotive.newOrientation();
      this.getNewIntersection(this.locomotive.currentTile, this.locomotive.orientation);
    }
    
    // front sensor checks:
    // - if the next tile is Navigable
    // - if the next tile is a cityLocation or industryLocation (or event)
    
    if (this.locomotive.enteredNewTile(2)) { // front sensor
      // Check if we can enter the new tile:
      let currentTileName = this.tileBoard.board[this.locomotive.currentTile.y][this.locomotive.currentTile.x].tileName;
      let nextTileName = this.tileBoard.board[this.locomotive.currentTileFrontSensor.y][this.locomotive.currentTileFrontSensor.x].tileName;
      let currentOrientation = this.locomotive.orientation;
      let canEnter = this.canEnterNextTile(currentTileName, nextTileName, currentOrientation);
      console.log(`Current: ${currentTileName}, Next: ${nextTileName}, Ori: ${currentOrientation}, Allowed: ${canEnter}`);

      // We cannot ener the tile, we must stop the train
      if (!canEnter) {
        console.log("Cannot enter tile. Inmediate stop!")
        this.locomotive.inmediateStop();
      }

      // check if we arrived to a city, industry, base or bridge
      let tileString = String(this.locomotive.currentTileFrontSensor.x) + "," + String(this.locomotive.currentTileFrontSensor.y);
      if (tileString in game.events) {
        let locationName = game.events[tileString];
        
        if (locationName in game.cities) {
          console.log(`Arrived to city ${locationName} at ${tileString}`);
          this.locomotive.inmediateStop();        
          this.locomotive.position = this.locomotive.prevTile.copy();
          this.locomotive.turn180();
          game.currentScene = new TradeScene(game.cities[locationName]);
        } else if (locationName in game.industries) {
          console.log(`Arrived to industry ${locationName} at ${tileString}`);
          this.locomotive.inmediateStop();        
          this.locomotive.position = this.locomotive.prevTile.copy();
          this.locomotive.turn180();
          game.currentScene = new IndustryTradeScene(game.industries[locationName]);  
        } else if (locationName in game.bases) {
          console.log(`Arrived to base ${locationName} at ${tileString}`);
          this.locomotive.inmediateStop();        
          this.locomotive.position = this.locomotive.prevTile.copy();
          this.locomotive.turn180();
          game.currentScene = new BaseScene(game.bases[locationName]);  
        } else if (locationName in game.mines) {
          console.log("Arrived to a minee");
          game.currentScene = new MineScene(locationName);
        } else if (locationName in game.bridges && !game.bridges[locationName].completed) {
          console.log(`Arrived to bridge ${locationName} at ${tileString}`);
          game.currentScene = new BridgeScene(locationName);
        }
        this.locomotive.update();
        game.currentScene.initialize();
      }  
    }
  }

  show() {
    mainCanvas.background(0);
    
    let showOptions = { 
      "outOfBoardTile": 0x00,
      "baseTile": null,
      "showTerrain": true,
      "showBuildings": false,
      "showUnits": false,
      "showWalls": false,
      "showMinimap": false
    }
    this.tileBoard.show(mainCanvas, this.camera.position, showOptions);
    
    showOptions = { 
      "outOfBoardTile": 0x00,
      "baseTile": null,
      "showTerrain": false,
      "showBuildings": true,
      "showUnits": false,
      "showWalls": false,
      "showMinimap": false
    }
    this.tileBoard.show(mainCanvas, this.camera.position, showOptions);

    this.locomotive.show();   
    this.enemyLocomotive.show();   
    
    // show selected intersection
    if (this.selectedIntersection) {
      // console.log(this.selectedIntersection)
      let screenPos = Geometry.boardToScreen(this.selectedIntersection.boardPosition, this.camera.position, this.tileHalfSize);
      mainCanvas.push();
      mainCanvas.strokeWeight(2);
      mainCanvas.stroke("blue")
      mainCanvas.line(screenPos.x - this.tileHalfSize.x, screenPos.y, screenPos.x, screenPos.y - this.tileHalfSize.y);
      mainCanvas.line(screenPos.x - this.tileHalfSize.x, screenPos.y, screenPos.x, screenPos.y + this.tileHalfSize.y);
      mainCanvas.line(screenPos.x + this.tileHalfSize.x, screenPos.y, screenPos.x, screenPos.y - this.tileHalfSize.y);
      mainCanvas.line(screenPos.x + this.tileHalfSize.x, screenPos.y, screenPos.x, screenPos.y + this.tileHalfSize.y);
      mainCanvas.pop();
    }

    game.hud.show();
    this.conversationPanel.show();

    //show the center of the screen in red lines
    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // mainCanvas.line(0, mainCanvasDim[1]/2, mainCanvasDim[0], mainCanvasDim[1]/2)
    // mainCanvas.line(mainCanvasDim[0]/2, 0, mainCanvasDim[0]/2, mainCanvasDim[1])
    // mainCanvas.pop();
  }
}