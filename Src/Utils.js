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


resourceToWagon = {
  "Oil": "OilTanker",
  "Iron": "Iron",
  "Meat": "Merchandise",
  "Container": "Container"
}


// USEFUL FUNCTIONS

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

function cameraToBoard(pos) {
  return createVector(
    round((((pos.x) / TILE_WIDTH_HALF)  + ((pos.y ) / TILE_HEIGHT_HALF) ) / 2) , 
    round((((pos.y) / TILE_HEIGHT_HALF)  - ((pos.x ) / TILE_WIDTH_HALF) ) / 2) 
  );
}

function boardToScreen(pos, cameraPos) {
  return createVector(
    (pos.x - pos.y) * TILE_WIDTH_HALF + mainCanvasDim[0] / 2 - cameraPos.x,
    (pos.x + pos.y) * TILE_HEIGHT_HALF  + mainCanvasDim[1] / 2 - cameraPos.y
  );
}

function boardToMinimapScreen(pos) {
  return createVector(
    (pos.x - pos.y) * TILE_MINI_WIDTH + width/2,
    (pos.x + pos.y) * TILE_MINI_HEIGHT + 10
  );
}

function boardToCamera(pos) {
  return createVector(
    int((pos.x - pos.y) * TILE_WIDTH_HALF),
    int((pos.x + pos.y) * TILE_HEIGHT_HALF)
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
    image(unitsData.soldier[0].shoot[ori][i], x,y);
    x+=16;
  }
}

function showSoldiersWalk() {
  background(255);
  noFill();
  let x = 100;
  let y = 10;
  let ori = [90, 45, 0, -45, -90, -135, 180, 135];
  for (let j=0; j<8; j++) {
    fill(0)
    text(ori[j],50,y)
    noFill();
    for (let i=0;i<6;i++) {
      rect(x,y,16,26);
      image(unitsData.soldier[0].walk[ori[j]][i], x,y);
      x+=16;
    }
    y+=27;
    x=100;
  }
}

