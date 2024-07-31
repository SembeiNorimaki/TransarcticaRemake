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


// USEFUL FUNCTIONS






function downloadText(content, filename) {
  var blob = new Blob([content], {
    type: "text/plain"
   });
  saveAs(blob, filename);
}

function angleToOri(angle) {
  // angle must be positive, in degrees [0..360)
  let idx = floor((angle + 22.5) / 45);
  let ori = idx * 45;
  return(ori % 360);
}


function screenToBoard(pos, cameraPos) {
  return createVector(
    round((((pos.x + cameraPos.x - mainCanvasDim[0]/2) / TILE_WIDTH_HALF)  + ((pos.y + cameraPos.y - mainCanvasDim[1]/2) / TILE_HEIGHT_HALF) ) / 2) , 
    round((((pos.y + cameraPos.y - mainCanvasDim[1]/2) / TILE_HEIGHT_HALF)  - ((pos.x + cameraPos.x - mainCanvasDim[0]/2) / TILE_WIDTH_HALF) ) / 2) 
  );
}

function screenToBoardSmall(pos, cameraPos) {
  return createVector(
    round((((pos.x + cameraPos.x - mainCanvasDim[0]/2) / TILE_MINI_WIDTH)  + ((pos.y + cameraPos.y - mainCanvasDim[1]/2) / TILE_MINI_HEIGHT) ) / 2) , 
    round((((pos.y + cameraPos.y - mainCanvasDim[1]/2) / TILE_MINI_HEIGHT)  - ((pos.x + cameraPos.x - mainCanvasDim[0]/2) / TILE_MINI_WIDTH) ) / 2) 
  );
}

function cameraToBoard(pos) {
  return createVector(
    round((((pos.x) / TILE_WIDTH_HALF)  + ((pos.y ) / TILE_HEIGHT_HALF) ) / 2) , 
    round((((pos.y) / TILE_HEIGHT_HALF)  - ((pos.x ) / TILE_WIDTH_HALF) ) / 2) 
  );
}

function cameraToBoardSmall(pos) {
  return createVector(
    round((((pos.x) / TILE_MINI_WIDTH)  + ((pos.y ) / TILE_MINI_HEIGHT) ) / 2) , 
    round((((pos.y) / TILE_MINI_HEIGHT)  - ((pos.x ) / TILE_MINI_WIDTH) ) / 2) 
  );
}

function boardToScreen(pos, cameraPos) {
  return createVector(
    (pos.x - pos.y) * TILE_WIDTH_HALF + mainCanvasDim[0] / 2 - cameraPos.x,
    (pos.x + pos.y) * TILE_HEIGHT_HALF  + mainCanvasDim[1] / 2 - cameraPos.y
  );
}
function boardToScreenSmall(pos, cameraPos) {
  return createVector(
    (pos.x - pos.y) * TILE_MINI_WIDTH + mainCanvasDim[0] / 2 - cameraPos.x,
    (pos.x + pos.y) * TILE_MINI_HEIGHT  + mainCanvasDim[1] / 2 - cameraPos.y
  );
}

function boardToMinimapScreen(pos) {
  return createVector(
    (pos.x - pos.y) * TILE_MINI_WIDTH + mainCanvasDim[0]/2,
    (pos.x + pos.y) * TILE_MINI_HEIGHT + 10
  );
}

function boardToCamera(pos) {
  return createVector(
    int((pos.x - pos.y) * TILE_WIDTH_HALF),
    int((pos.x + pos.y) * TILE_HEIGHT_HALF)
  );
}

function boardToCameraSmall(pos) {
  return createVector(
    int((pos.x - pos.y) * TILE_MINI_WIDTH),
    int((pos.x + pos.y) * TILE_MINI_HEIGHT)
  );
}

function cameraToScreen(pos) {
  return createVector(
    (pos.x - pos.y) * TILE_WIDTH_HALF,
    (pos.x + pos.y) * TILE_HEIGHT_HALF 
  );
}
function screenToCamera(pos) {
  return createVector(
    round(((pos.x / TILE_WIDTH_HALF)  + (pos.y / TILE_HEIGHT_HALF) ) / 2), 
    round(((pos.y / TILE_HEIGHT_HALF)  - (pos.x / TILE_WIDTH_HALF) ) / 2) 
  );
}



// DEBUG FUNCTIONS

function showSoldiersShoot() {
  let x = 100;
  let y = 10;
  let ori = -45;
  for (let i=0;i<2;i++) {
    rect(x,y,16,27);
    image(gameData.unitsData.soldier[0].shoot[ori][i], x,y);
    x+=16;
  }
}

function showSoldiersWalk() {
  background(255);
  noFill();
  let x = 100;
  let y = 10;
  let ori = [90, 45, 0, 135, 180, 225, 270, 315];
  let img;
  for (let j=0; j<8; j++) {
    fill(0)
    text(ori[j],50,y)
    noFill();
    for (let i=0;i<6;i++) {
      img = gameData.unitsData.soldier[0].walk[ori[j]][i];

      rect(x,y,img.width,img.height);
      image(img, x,y);
      x+=img.width;
    }
    y+=55;
    x=100;
  }
}

function showWolfWalk() {
  background(255);
  noFill();
  let x = 100;
  let y = 10;
  let ori = [90, 45, 0, 135, 180, 225, 270, 315];
  let img;
  for (let j=0; j<8; j++) {
    fill(0)
    text(ori[j],50,y)
    noFill();
    for (let i=0;i<6;i++) {
      img = gameData.unitsData.wolf[0].walk[ori[j]][i];

      rect(x,y,img.width,img.height);
      image(img, x,y);
      x+=img.width;
    }
    y+=80;
    x=100;
  }
}

function showTrainSummary() {
  push();
  background(255,255,255,200);
  let x = 100;
  let y = 100;
  
  for (let wagon of game.playerTrain.wagons) {
    text(`${wagon.usedSpace} ${wagon.unit} of ${wagon.cargo}`, x, y);
    image(wagon.img[wagon.spriteId],x,y);
    y+=100;
  }
  pop();
}

function assembleBuilding() {
  mainCanvas.background(0,0,0,255)
  
  // Tile.draw(mainCanvas, 0xC0, boardToScreen(createVector(0,0), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xC1, boardToScreen(createVector(1,0), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xC2, boardToScreen(createVector(3,0), createVector(0,0)))

  // Tile.draw(mainCanvas, 0xC3, boardToScreen(createVector(0,1), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xC4, boardToScreen(createVector(1,1), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xC5, boardToScreen(createVector(3,1), createVector(0,0)))
  
  // Tile.draw(mainCanvas, 0xC6, boardToScreen(createVector(0,3), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xC7, boardToScreen(createVector(1,3), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xC8, boardToScreen(createVector(3,3), createVector(0,0)))

  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(0,0), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(1,0), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(2,0), createVector(0,0)))
  
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(0,1), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(1,1), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(2,1), createVector(0,0)))
  
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(0,2), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(1,2), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(2,2), createVector(0,0)))

  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(0,3), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(1,3), createVector(0,0)))
  // Tile.draw(mainCanvas, 0x5A, boardToScreen(createVector(2,3), createVector(0,0)))
  
  //Tile.draw(mainCanvas, 0xCA, boardToScreen(createVector(0,0), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xCA, boardToScreen(createVector(1,0), createVector(0,0)))
  //Tile.draw(mainCanvas, 0xCA, boardToScreen(createVector(2,0), createVector(0,0)))
  
  //Tile.draw(mainCanvas, 0xCA, boardToScreen(createVector(0,2), createVector(0,0)))
  // Tile.draw(mainCanvas, 0xCA, boardToScreen(createVector(1,2), createVector(0,0)))
  //Tile.draw(mainCanvas, 0xCA, boardToScreen(createVector(2,2), createVector(0,0)))
  
  Tile.draw(mainCanvas, 0xA4, boardToScreen(createVector(0,0), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA3, boardToScreen(createVector(0,2), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA4, boardToScreen(createVector(0,4), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA5, boardToScreen(createVector(2,0), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA5, boardToScreen(createVector(2,2), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA4, boardToScreen(createVector(2,4), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA2, boardToScreen(createVector(4,0), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA4, boardToScreen(createVector(4,2), createVector(0,0)))
  Tile.draw(mainCanvas, 0xA3, boardToScreen(createVector(4,4), createVector(0,0)))
  
  mainCanvas.save("Village")

  image(mainCanvas,0,0)

}

