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

class Minimap {
  constructor() {

  }
  initialize() {
    
  }
  update() {

  }
  processKey() {

  }
  show() {
    mainCanvas.background(255);
    
    for (let col=0; col<game.navigationScene.tileBoard.boardDim.x; col++) {
      for (let row=0; row<game.navigationScene.tileBoard.boardDim.y; row++) {
        let screenPos = boardToMinimapScreen(createVector(col,row));
        //console.log(screenPos.array())
        switch(Tile.idxToName[game.navigationScene.tileBoard.board[row][col].tileId]) {
          case("Ground"):
            
          break;
          case("AD"):
            mainCanvas.line(
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("BC"):
            mainCanvas.line(
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("AB"):
            mainCanvas.line(
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2);
          break;
          case("AC"):
            mainCanvas.line(
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("BD"):
            mainCanvas.line(
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("CD"):
            mainCanvas.line(
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;

          case("ABc"):
          case("ACb"):
          case("BCa"):
            mainCanvas.line(  //AB
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2);
            mainCanvas.line( //AC
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
            mainCanvas.line( //BC
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("ABd"):
          case("ADb"):
          case("BDa"):
            mainCanvas.line(  //AB
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2);
            mainCanvas.line( //AD
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
            mainCanvas.line( //BD
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("ACd"):
          case("ADc"):
          case("CDa"):
            mainCanvas.line( //AC
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
            mainCanvas.line( //AD
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
            mainCanvas.line( //CD
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
          break;
          case("BCd"):
          case("BDc"):
          case("CDb"):
            mainCanvas.line( //BC
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
            mainCanvas.line( //BD
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y-TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2);
            mainCanvas.line( //CD
              screenPos.x-TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2,
              screenPos.x+TILE_MINI_WIDTH/2,
              screenPos.y+TILE_MINI_HEIGHT/2); 
          break;
          case("Water"): // Water
            mainCanvas.push();
            mainCanvas.noStroke();
            mainCanvas.fill("blue");
            mainCanvas.beginShape();
            mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
            mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
            mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
            mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
            mainCanvas.endShape(CLOSE);
            mainCanvas.pop();
            //mainCanvas.circle(screenPos.x, screenPos.y, TILE_MINI_WIDTH);
            //mainCanvas.noFill();
          break;
          case("City"):
            mainCanvas.push();
            mainCanvas.noStroke();
            mainCanvas.fill("red");
            mainCanvas.beginShape();
            mainCanvas.vertex(screenPos.x-16, screenPos.y);
            mainCanvas.vertex(screenPos.x, screenPos.y-8);
            mainCanvas.vertex(screenPos.x+16, screenPos.y);
            mainCanvas.vertex(screenPos.x, screenPos.y+8);
            mainCanvas.endShape(CLOSE);
            mainCanvas.pop();
          break;
          default:
            mainCanvas.push();
            mainCanvas.noStroke();
            mainCanvas.fill("gray");
            mainCanvas.beginShape();
            mainCanvas.vertex(screenPos.x-TILE_MINI_WIDTH, screenPos.y);
            mainCanvas.vertex(screenPos.x, screenPos.y-TILE_MINI_HEIGHT);
            mainCanvas.vertex(screenPos.x+TILE_MINI_WIDTH, screenPos.y);
            mainCanvas.vertex(screenPos.x, screenPos.y+TILE_MINI_HEIGHT);
            mainCanvas.endShape(CLOSE);
            mainCanvas.pop();
          break;
        }
      }
    }
  }
}