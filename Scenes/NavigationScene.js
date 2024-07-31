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
    this.selectedIntersection = null;
    //this.camera = new Camera(boardToCamera(createVector(10,10)));
    this.camera = new Camera(boardToCamera(createVector(64,157)), createVector(0,0));
    this.tileBoard = new TileBoard(gameData.mapBoard);
    this.locomotive = new Locomotive(createVector(64, 157), 90.0);
  }

  initialize() {
    // populate cities in the tileBoard
    // for (let [locationStr, name] of Object.entries(citiesLocations)) {
    //   let aux = locationStr.split(",")
    //   this.tileBoard.buildCity(createVector(int(aux[0]), int(aux[1])));
    // }
    // for (let [locationStr, name] of Object.entries(industriesLocations)) {
    //   let aux = locationStr.split(",")
    //   this.tileBoard.buildIndustry(createVector(int(aux[0]), int(aux[1])));
    // }

  }

  processKey(key) {
    if (key == "Control") {
      this.locomotive.startStop();
    } else if (key == "Shift") {
      this.locomotive.turn180();
    } else if (key == "Enter" && this.selectedIntersection !== null) {
      this.selectedIntersection.changeTile();
    } else if (key == "ArrowLeft") {
      this.camera.move(createVector(-500,0))
    } else if (key == "ArrowRight") {
      this.camera.move(createVector(500,0))
    } else if (key == "ArrowUp") {
      this.camera.move(createVector(0,-300))
    } else if (key == "ArrowDown") {
      this.camera.move(createVector(0,300))
    }
     
  }

  onClick(mousePos) {

  }

  // TODO: precompute next intersection
  getNewIntersection(pos, ori) {
    let newPos = pos.copy();
    let newOri = ori;
    
    for (let i=0; i<6; i++) {
      if (this.tileBoard.board[newPos.y][newPos.x].isIntersection) {
        //this.tileBoard.board[newPos.y][newPos.x].isSelected = true;
        this.selectedIntersection = this.tileBoard.board[newPos.y][newPos.x]
        return;
      }
      
      let tileName =  Tile.idxToName[this.tileBoard.board[newPos.y][newPos.x].tileId];
      let exitSide = Tile.orientationToExit[tileName][newOri];
      let delta = Tile.sideToDelta[exitSide];
      
      //console.log(`Current: ${tileName}, pos: ${newPos.array()}, ori: ${newOri}, exit: ${exitSide}, delta: ${delta}`)
      
      newPos.add(createVector(delta[0], delta[1]));
      tileName =  Tile.idxToName[this.tileBoard.board[newPos.y][newPos.x].tileId];
      
      

      let entrySide = Tile.oppositeSide[exitSide];
      if (tileName in Tile.entryToOrientation) {
        newOri = Tile.entryToOrientation[tileName][entrySide];
      } else {
        this.selectedIntersection = null;
        return;
      }

      //console.log(`Next: ${tileName}, pos: ${newPos.array()}, ori: ${newOri}, entry: ${entrySide}`)
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

      // check if we arrived to a city or industry
      let tileString = String(this.locomotive.currentTileFrontSensor.x) + "," + String(this.locomotive.currentTileFrontSensor.y);
      if (tileString in game.events) {
        let locationName = game.events[tileString];
        this.locomotive.inmediateStop();
        this.locomotive.turn180();
        this.locomotive.position = this.locomotive.prevTile.copy();
        
        if (locationName in game.cities) {
          console.log(`Arrived to city ${locationName} at ${tileString}`);
          game.currentScene = new CityTradeScene(game.cities[locationName]);
        } else {
          console.log(`Arrived to industry ${locationName} at ${tileString}`);
          game.currentScene = new IndustryTradeScene(game.industries[locationName]);  
        }
        game.currentScene.initialize();
      }  
    }
  }

  // showHud() {
  //   let x = hudCanvas.width-80;
  //   let y = hudCanvas.height-30;
  //   hudCanvas.image(gameData.hudData.fuel, x, y);
  //   hudCanvas.text(`${int(game.playerTrain.fuel)}`, x, y);
  //   x-=140;
  //   hudCanvas.image(gameData.hudData.gold, x, y);
  //   hudCanvas.text(`${game.playerTrain.gold}`, x, y);
  //   x-=140;
  //   hudCanvas.image(gameData.hudData.frame, x, y);
  //   hudCanvas.text(`${this.locomotive.gear}`, x, y);
  // }

  show() {

    this.tileBoard.showTiles(mainCanvas, this.camera.position); 
    this.locomotive.show();
    
    
    // show selected intersection
    if (this.selectedIntersection) {
      // console.log(this.selectedIntersection)
      let screenPos = boardToScreen(this.selectedIntersection.boardPosition, this.camera.position);
      mainCanvas.push();
      mainCanvas.strokeWeight(2);
      mainCanvas.stroke("blue")
      mainCanvas.line(screenPos.x-TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y-TILE_HEIGHT_HALF);
      mainCanvas.line(screenPos.x-TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y+TILE_HEIGHT_HALF);
      mainCanvas.line(screenPos.x+TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y-TILE_HEIGHT_HALF);
      mainCanvas.line(screenPos.x+TILE_WIDTH_HALF,screenPos.y,screenPos.x,screenPos.y+TILE_HEIGHT_HALF);
      mainCanvas.pop();
    }

    game.hud.show();

    // show the center of the screen in red lines
    // mainCanvas.push();
    // mainCanvas.stroke("red")
    // mainCanvas.line(0,mainCanvasDim[1]/2,mainCanvasDim[0],mainCanvasDim[1]/2)
    // mainCanvas.line(mainCanvasDim[0]/2,0,mainCanvasDim[0]/2,mainCanvasDim[1])
    // mainCanvas.pop();
  }
}