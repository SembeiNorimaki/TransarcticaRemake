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

idToTileCode = {
  0b0000: 0x00, // wxyz Water
  0b0001: 0x06, // wxyZ Water N
  0b0010: 0x07, // wxYz Water W
  0b1100: 0x02, // wxYZ Ramp SE
  0b0100: 0x08, // wXyz Water E
  0b1010: 0x03, // wXyZ Ramp SW
  0b0110: 0x0E, // wXYz Saddle_WE
  0b0111: 0x0A, // wXYZ Valley N
  0b1000: 0x09, // Wxyz Water S
  0b1001: 0x0F, // WxyZ Saddle_NS
  0b0101: 0x04, // WxYz Ramp NE
  0b1011: 0x0B, // WxYZ Valley W
  0b0011: 0x05, // WXyz Ramp NW
  0b1101: 0x0C, // WXyZ Valley E
  0b1110: 0x0D, // WXYz Valley S
  0b1111: 0x01, // WXYZ Ground

  0b10000: 0x10, // wxyz Water
  0b10001: 0x16, // wxyZ Water N
  0b10010: 0x17, // wxYz Water W
  0b11100: 0x12, // wxYZ Ramp SE
  0b10100: 0x18, // wXyz Water E
  0b11010: 0x13, // wXyZ Ramp SW
  0b10110: 0x1E, // wXYz Saddle_WE
  0b10111: 0x1A, // wXYZ Valley N
  0b11000: 0x19, // Wxyz Water S
  0b11001: 0x1F, // WxyZ Saddle_NS
  0b10101: 0x14, // WxYz Ramp NE
  0b11011: 0x1B, // WxYZ Valley W
  0b10011: 0x15, // WXyz Ramp NW
  0b11101: 0x1C, // WXyZ Valley E
  0b11110: 0x1D, // WXYz Valley S
  0b11111: 0x11  // WXYZ Ground
}


function astar(start, end) {
  const openSet = [];
  const closedSet = [];
  openSet.push(start);
  while (openSet.length > 0) {
    let currentNode = openSet[0];
    // Find the node with the lowest total cost in the open set
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < currentNode.f || (openSet[i].f === currentNode.f && openSet[i].h < currentNode.h)) {
        currentNode = openSet[i];
      }
    }
    openSet.splice(openSet.indexOf(currentNode), 1);
    closedSet.push(currentNode);

    if (currentNode.row === end.row && currentNode.col === end.col) {
      // Reconstruct the path if the goal is reached
      let path = [];
      let temp = currentNode;
      while (temp) {
        path.push(temp);
        temp = temp.parent;
      }
      return path.reverse();      
    }

    const neighbors = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    for (let dir of directions) {
      const neighborRow = currentNode.row + dir[0];
      const neighborCol = currentNode.col + dir[1];

      if (isValidCell(neighborRow, neighborCol)) {
        const neighbor = {
          row: neighborRow,
          col: neighborCol,
          g: currentNode.g + 1,
          h: heuristic({ row: neighborRow, col: neighborCol }, end),
          f: 0,
          parent: currentNode,
        };

        neighbor.f = neighbor.g + neighbor.h;

        if (closedSet.some((node) => node.row === neighbor.row && node.col === neighbor.col)) {
          continue;
        }

        const openSetNode = openSet.find((node) => node.row === neighbor.row && node.col === neighbor.col);
        if (!openSetNode || neighbor.g < openSetNode.g) {
          openSet.push(neighbor);
        }
      }
    }
  }
  // No path found
  return null;
}

function manhattanDistance(pos1, pos2) {
  return abs(pos1.x - pos2.x) + abs(pos1.y - pos2.y);
}


function textToImage(text) {
  let img = createGraphics(text.length * 16, 19)

  for (let [i, character] of Object.entries(text.toLowerCase())) {
    img.image(characters[character], i*16, 0);
  }
  return img;
}

function makeMinimap() {
  mainCanvas.noStroke()
  let x = 0;
  let y = 0;
  for (let row of game.navigationScene.tileBoard.board) {
    x = 0;
    for (let tile of row) {
      Tile.draw2D(mainCanvas, tile.tileId, createVector(x,y))
      x += TILE_MINI_WIDTH;
    }
    y += TILE_MINI_HEIGHT;
  }
}

function segmentImage(img) {
  let NCOLS = img.width
  let NROWS = img.height;
  let board = Array.from(Array(NROWS), () => new Array(NCOLS));
  let px;
  for (let y=0; y<NROWS; y++) {
    for (let x=0; x<NCOLS; x++) {
      px = img.get(x, y).toString();
      if (px == "0,0,0,255") {               // water
        board[y][x] = 0x00;
      } else if (px == "255,255,255,255") {  // land high
        board[y][x] = 0x02;
      } else if (px == "100,100,100,255") {  // land 
          board[y][x] = 0x01;
      } else if (px == "255,0,0,255"){       // cities
        board[y][x] = 0xF0;
      } else if (px == "0,0,255,255"){       // rails
        board[y][x] = 0xF1;
      }
      else {
        let a = 0;
      }
    }
  }
  return board;
}

function processHeightmap(board) {
  let NCOLS = board[0].length;
  let NROWS = board.length;
  let board2 = Array.from(Array(NROWS), () => new Array(NCOLS));

  for (let x=0; x<NCOLS; x++) {
    for (let y=0; y<NROWS; y++) {
      if (x==0 || y==0 || x==NCOLS-1 || y==NROWS-1) {
        board2[y][x] = 0;
        continue;
      }

      if (board[y][x] >= 0xF0) {  // skip cities, rails and stuff not related to heightmap terrain
        board2[y][x] = board[y][x];
        continue;
      }

      /* 
            w
         A / \ B
          x   y
         C \ / D
            z
      */

      let tA = board[y][x-1]; 
      let tB = board[y-1][x];
      let tC = board[y+1][x];
      let tD = board[y][x+1];
      let tW = board[y-1][x-1]; 
      let tX = board[y+1][x-1];
      let tY = board[y-1][x+1];
      let tZ = board[y+1][x+1];

      let vW = 8; 
      let vX = 4;   
      let vY = 2; 
      let vZ = 1;
      
      if(board[y][x]) {
        if (board[y][x] == 2) {
          let a = 0;
        }
        let ref = board[y][x];
        // Flat ramps
        if (tA==(ref-1) && tB>=ref && tC>=ref && tD>=ref) {    
          board2[y][x] = vY + vZ;
        }
        else if (tA>=ref && tB==(ref-1) && tC>=ref && tD>=ref) {    
          board2[y][x] = vX + vZ;
        }
        else if (tA>=ref && tB>=ref && tC==(ref-1) && tD>=ref) {    
          board2[y][x] = vW + vY;
        }
        else if (tA>=ref && tB>=ref && tC>=ref && tD==(ref-1)) {    
          board2[y][x] = vW + vX;
        }

        // 3 vertex low
        else if (tA==(ref-1) && tB==(ref-1) && tC>=ref && tD>=ref) {    
          board2[y][x] = vZ;
        }
        else if (tA>=ref && tB==(ref-1) && tC>=ref && tD==(ref-1)) {    
          board2[y][x] = vX;
        }
        else if (tA>=ref && tB>=ref && tC==(ref-1) && tD==(ref-1)) {    
          board2[y][x] = vW;
        }
        else if (tA==(ref-1) && tB>=ref && tC==(ref-1) && tD>=ref) {    
          board2[y][x] = vY;
        }

        // horse seat
        else if (tW==(ref-1) && tZ==(ref-1)) {    
          board2[y][x] = vX + vY;
        }
        else if (tX==(ref-1) && tY==(ref-1)) {    
          board2[y][x] = vW + vZ;
        }

        // 3 vertex up
        else if (tW==(ref-1)) {    
          board2[y][x] = vX + vY + vZ;
        }
        else if (tX==(ref-1)) {    
          board2[y][x] = vW + vY + vZ;
        }
        else if (tY==(ref-1)) {    
          board2[y][x] = vW + vX + vZ;
        }
        else if (tZ==(ref-1)) {    
          board2[y][x] = vW + vX + vY;
        }

        else {
          board2[y][x] = vW + vX + vY + vZ;
        }

        if(board[y][x] == 2) {
          board2[y][x] += 0b10000;
        }
      }
      else {
        board2[y][x] = 0;
      }

    }
  }
  return board2;
}

function processRails(board) {
  let NCOLS = board[0].length;
  let NROWS = board.length;
  let board2 = Array.from(Array(NROWS), () => new Array(NCOLS));

  for (let x=0; x<NCOLS; x++) {
    for (let y=0; y<NROWS; y++) {
      if (board[y][x] != 0xF1) {
        board2[y][x] = board[y][x];
        continue;
      }

      let tA = board[y][x-1]; 
      let tB = board[y-1][x];
      let tC = board[y+1][x];
      let tD = board[y][x+1];

      let neighbors = 0
      if (tA == 0xF1)
        neighbors += 1;
      if (tB == 0xF1)
        neighbors += 2;
      if (tC == 0xF1)
        neighbors += 4;
      if (tD == 0xF1)
        neighbors += 8;

      switch(neighbors) {
        case(1):
        case(8):
        case(9):  // AD
          board2[y][x] = 0x30;
        break;

        case(2):
        case(4):
        case(6):  // BC
          board2[y][x] = 0x31;
        break;

        case(3):  // AB
          board2[y][x] = 0x32;
        break;

        case(12):  // CD
          board2[y][x] = 0x33;
        break;

        case(5):  // AC
          board2[y][x] = 0x34;
        break;

        case(10):  // BD
          board2[y][x] = 0x35;
        break;

        case(7):  // BCa
          board2[y][x] = 0x3C;
        break;

        case(11):  // ADb
          board2[y][x] = 0x3A;
        break;

        case(13):  // ADc
          board2[y][x] = 0x3B;
        break;
        
        case(14):  // BCd
          board2[y][x] = 0x3D;
        break;
      }
    }
  }
  return board2;
}

function processEvents(board) {
  let NCOLS = board[0].length;
  let NROWS = board.length;
  let board2 = Array.from(Array(NROWS), () => new Array(NCOLS));
  for (let x=0; x<NCOLS; x++) {
    for (let y=0; y<NROWS; y++) {
      if (board[y][x] == 0xF2) {
        board2[y][x] = 0x1F1;
      } else {
        board2[y][x] = board[y][x];
      }
    }
  }
  return board2;
}

function processOther(board) {
  let NCOLS = board[0].length;
  let NROWS = board.length;
  let board2 = Array.from(Array(NROWS), () => new Array(NCOLS));

  for (let x=NCOLS; x>=0; x--) {
    for (let y=0; y<NROWS; y++) {
      if (board[y][x] == 0xF0) {
        board2[y][x+1] = 0xA0;
        board2[y][x] = 0x01;
      } else {
        board2[y][x] = board[y][x];
      }
    }
  }
  return board2;
}

function convertTileCodes(board) {
  let NCOLS = board[0].length;
  let NROWS = board.length;
  for (let x=0; x<NCOLS; x++) {
    for (let y=0; y<NROWS; y++) {
      if (board[y][x] in idToTileCode) {
        board[y][x] = idToTileCode[board[y][x]];
      }
    }
  }
  return board;
}





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

function boardToMinimap(pos) {
  return createVector(
    (pos.x - pos.y) * 2,
    (pos.x + pos.y) * 1
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

