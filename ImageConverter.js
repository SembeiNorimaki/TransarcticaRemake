class ImageConverter {
  static idToTileCode = {
    0b0000: 0x00, // wxyz Water
    0b0001: 0x06, // wxyZ Water N
    0b0010: 0x07, // wxYz Water W
    0b0011: 0x02, // wxYZ Ramp SE
    0b0100: 0x08, // wXyz Water E
    0b0101: 0x03, // wXyZ Ramp SW
    0b0110: 0x0E, // wXYz Saddle_WE
    0b0111: 0x0A, // wXYZ Valley N
    0b1000: 0x09, // Wxyz Water S
    0b1001: 0x0F, // WxyZ Saddle_NS
    0b1010: 0x04, // WxYz Ramp NE
    0b1011: 0x0B, // WxYZ Valley W
    0b1100: 0x05, // WXyz Ramp NW
    0b1101: 0x0C, // WXyZ Valley E
    0b1110: 0x0D, // WXYz Valley S
    0b1111: 0x01, // WXYZ Ground
  }

  constructor() {
    
  }

  initialize(heightmapRaw) {
    this.NCOLS = split(heightmapRaw[0], ',').length;
    this.NROWS = heightmapRaw.length;
    this.board = Array.from(Array(this.NROWS), () => new Array(this.NCOLS));
    this.board2 = Array.from(Array(this.NROWS), () => new Array(this.NCOLS));

    this.populateBoard(heightmapRaw);
    this.filterPeninsulas();
    this.processHeightmap();
    //console.log(this.board2)
    this.tileHalfSize = createVector(4, 2);
  }
  
  // Given a grayscale image, returns a binary/ternary image to be used as heighmap
  imageToBoardStr(img) {
    let board = [];
    for (let row=0; row<img.height; row++) {
      let currentRow = "";
      for (let col=0; col<img.width; col++) {
        let b = brightness(img.get(col,row));
        if (b > 80) {
          img.set(col,row,2);
          currentRow += "0,";
        } else if (b > 40) {
          img.set(col,row,1);
          currentRow += "1,";
        } else {
          img.set(col,row,0);
          currentRow += "1,";
        }
      }
      currentRow = currentRow.slice(0, -1);
      board.push(currentRow);
    }
    return(board);
  }
  
  drawWater(points) {
    fill(0,100,200);
    noStroke();
    beginShape();  
    for (const point of points) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
  }

  drawEarth(points) {
    fill(150,150,150);
    strokeWeight(0.5);
    beginShape();  
    for (const point of points) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
  }

  drawEarthH(points) {
    fill(200,200,200);
    strokeWeight(0.5);
    beginShape();  
    for (const point of points) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
  }

  drawSmoothLine(points) {
    strokeWeight(0.1);
    line(points[0].x, points[0].y, points[1].x, points[1].y)
  }

  drawTile(id, pos) {
    push();
    let p1 = pos.copy().add(0, -this.tileHalfSize.y -this.tileHalfSize.y/2*(Boolean(id&0b1000)) - this.tileHalfSize.y/2*(Boolean(id&0b10000)));
    let p2 = pos.copy().add(-this.tileHalfSize.x, -this.tileHalfSize.y/2*(Boolean(id&0b0100)) - this.tileHalfSize.y/2*(Boolean(id&0b10000)));
    let p3 = pos.copy().add(this.tileHalfSize.x, -this.tileHalfSize.y/2*(Boolean(id&0b0010)) - this.tileHalfSize.y/2*(Boolean(id&0b10000)));
    let p4 = pos.copy().add(0, this.tileHalfSize.y -this.tileHalfSize.y/2*(Boolean(id&0b0001)) - this.tileHalfSize.y/2*(Boolean(id&0b10000)));

    //     p1
    //    / \
    // p2 \ / p3
    //    p4


    if (id==0) {
      //noStroke();
      this.drawWater([p1,p2,p4,p3]);
    }
    else if ([3, 5, 12, 10].includes(id)) {    
      // Ramps
      //   8       L      L      H      H
      // 4   2   L   H  H   L  H   L  L   H
      //   1       H      H      L      L
      this.drawEarth([p1, p2, p4, p3]);
    }
    else if ([19, 21, 28, 26].includes(id)) {    
      // Ramps
      //   8       L      L      H      H
      // 4   2   L   H  H   L  H   L  L   H
      //   1       H      H      L      L
      this.drawEarthH([p1, p2, p4, p3]);
    } 
    else if (id == 8) {    
      //   8       H      
      // 4   2   L   L  
      //   1       L
        this.drawEarth([p1,p2,p3]);
        this.drawWater([p2,p3,p4]);
    } 
    else if (id == 24) {
      this.drawEarthH([p1,p2,p3]);
      this.drawEarth([p2,p3,p4]);
      //this.drawSmoothLine([p2, p3]);
    }
    else if (id==1) {
      //   8       L      
      // 4   2   L   L  
      //   1       H    
      this.drawEarth([p2,p3,p4]);
      this.drawWater([p1,p2,p3]);
    } 
    else if (id == 17) {
      this.drawEarthH([p2,p3,p4]);
      this.drawEarth([p1,p2,p3]);
    }
    else if (id==2) {
      //   8       L      
      // 4   2   L   H  
      //   1       L  
      this.drawEarth([p1,p3,p4]);
      this.drawWater([p1,p2,p4]);
    } 
    else if (id == 18) {
      this.drawEarthH([p1,p3,p4]);
      this.drawEarth([p1,p2,p4]);
    }
    else if (id==4) {
      //   8       L      
      // 4   2   H   L  
      //   1       L  
      this.drawEarth([p1,p2,p4]);
      this.drawWater([p1,p3,p4]);      
    } 
    else if (id == 20) {
      this.drawEarthH([p1,p2,p4]);
      this.drawEarth([p1,p3,p4]);      
    }
    else if (id==9 ) {
      this.drawEarth([p1,p2,p4,p3]);
      line(p1.x,p1.y,p4.x,p4.y);
    } 
    else if (id == 25) {
      this.drawEarthH([p1,p2,p4,p3]);
      line(p1.x,p1.y,p4.x,p4.y);
    }
    else if (id==6 ) {
      this.drawEarth([p1,p2,p4,p3]);
      line(p2.x,p2.y,p3.x,p3.y);
    } 
    else if (id == 22) {
      this.drawEarthH([p1,p2,p4,p3]);
      line(p2.x,p2.y,p3.x,p3.y);
    }
    else if (id == 7) {
      this.drawEarth([p1,p2,p4,p3]);
      this.drawSmoothLine([p2,p3])
    }
    else if (id == 23) {
      this.drawEarthH([p1,p2,p4,p3]);
      this.drawSmoothLine([p2,p3])
    }
    else if (id == 14 ) {
      this.drawEarth([p1,p2,p4,p3]);
      this.drawSmoothLine([p2,p3])
    }
    else if (id == 30) {
      this.drawEarthH([p1,p2,p4,p3]);
      this.drawSmoothLine([p2,p3])
    }
    else if (id == 11) {
      this.drawEarth([p1,p2,p4,p3]);
      this.drawSmoothLine([p1,p4])
    }
    else if (id == 27) {
      this.drawEarthH([p1,p2,p4,p3]);
      this.drawSmoothLine([p1,p4])
    }
    else if (id == 13 ) {
      this.drawEarth([p1,p2,p4,p3]);
      this.drawSmoothLine([p1,p4])
    }
    else if (id == 29) {
      this.drawEarthH([p1,p2,p4,p3]);
      this.drawSmoothLine([p1,p4])
    }
    else if (id == 15){
      this.drawEarth([p1,p2,p4,p3]);
    } else if (id == 31){
      this.drawEarthH([p1,p2,p4,p3]);
    }
    
    // strokeWeight(0.1)
    // if ([8,7,1,14].includes(id)) 
    //     line(p2.x, p2.y, p3.x, p3.y);
    //   if ([2,13,4,11].includes(id)) 
    //     line(p1.x, p1.y, p4.x, p4.y);
   
    pop();
  }

  drawMap() {
    
    for (let x=0; x<this.NCOLS; x++) {
      for (let y=0; y<this.NROWS; y++) {
        let pos = this.map2screen(x, y);
        this.drawTile(int(this.board2[y][x]), p5.Vector.add(pos,createVector(1300,0)));
      }
    }  
  }

  populateBoard(boardRaw) {    
    for (const [row, txtLine] of boardRaw.entries()) {
      for (const [col, elem] of split(txtLine, ',').entries()) {
        this.board[row][col] = Number("0x" + elem);
        this.board2[row][col] = Number("0x" + elem);
      }
    }
  }

  filterPeninsulas() {
    for (let x=1; x<this.NCOLS-1; x++) {
      for (let y=1; y<this.NROWS-1; y++) {
        let ref = this.board[y][x];

        let tA = this.board[y][x-1]; 
        let tB = this.board[y-1][x];
        let tC = this.board[y+1][x];
        let tD = this.board[y][x+1];

        let tW = this.board[y-1][x-1]; 
        let tX = this.board[y+1][x-1];
        let tY = this.board[y-1][x+1];
        let tZ = this.board[y+1][x+1];

        if (
          tA==(ref-1) && tB==(ref-1) && tC==(ref-1) ||
          tB==(ref-1) && tC==(ref-1) && tD==(ref-1) ||
          tC==(ref-1) && tD==(ref-1) && tA==(ref-1) ||
          tD==(ref-1) && tA==(ref-1) && tB==(ref-1) ||

          tA==(ref-1) && tB==(ref-1) && tZ==(ref-1) ||
          tB==(ref-1) && tD==(ref-1) && tX==(ref-1) ||
          tC==(ref-1) && tD==(ref-1) && tW==(ref-1) ||
          tA==(ref-1) && tC==(ref-1) && tY==(ref-1) 
        ) {
          this.board[y][x] =  ref-1;
        }


      }
    }
  }

  processHeightmap() {
    for (let x=1; x<this.NCOLS-1; x++) {
      for (let y=1; y<this.NROWS-1; y++) {

        /* 
              w
           A / \ B
            x   y
           C \ / D
              z
        */

        let tA = this.board[y][x-1]; 
        let tB = this.board[y-1][x];
        let tC = this.board[y+1][x];
        let tD = this.board[y][x+1];

        let tW = this.board[y-1][x-1]; 
        let tX = this.board[y+1][x-1];
        let tY = this.board[y-1][x+1];
        let tZ = this.board[y+1][x+1];

        let vW = 8; 
        let vX = 4;   
        let vY = 2; 
        let vZ = 1;
        
        if(this.board[y][x]) {
          let ref = this.board[y][x];
          // Flat ramps
          if (tA==(ref-1) && tB>=ref && tC>=ref && tD>=ref) {    
            this.board2[y][x] = vY + vZ;
          }
          else if (tA>=ref && tB==(ref-1) && tC>=ref && tD>=ref) {    
            this.board2[y][x] = vX + vZ;
          }
          else if (tA>=ref && tB>=ref && tC==(ref-1) && tD>=ref) {    
            this.board2[y][x] = vW + vY;
          }
          else if (tA>=ref && tB>=ref && tC>=ref && tD==(ref-1)) {    
            this.board2[y][x] = vW + vX;
          }

          // 3 vertex low
          else if (tA==(ref-1) && tB==(ref-1) && tC>=ref && tD>=ref) {    
            this.board2[y][x] = vZ;
          }
          else if (tA>=ref && tB==(ref-1) && tC>=ref && tD==(ref-1)) {    
            this.board2[y][x] = vX;
          }
          else if (tA>=ref && tB>=ref && tC==(ref-1) && tD==(ref-1)) {    
            this.board2[y][x] = vW;
          }
          else if (tA==(ref-1) && tB>=ref && tC==(ref-1) && tD>=ref) {    
            this.board2[y][x] = vY;
          }

          // horse seat
          else if (tW==(ref-1) && tZ==(ref-1)) {    
            this.board2[y][x] = vX + vY;
          }
          else if (tX==(ref-1) && tY==(ref-1)) {    
            this.board2[y][x] = vW + vZ;
          }

          // 3 vertex up
          else if (tW==(ref-1)) {    
            this.board2[y][x] = vX + vY + vZ;
          }
          else if (tX==(ref-1)) {    
            this.board2[y][x] = vW + vY + vZ;
          }
          else if (tY==(ref-1)) {    
            this.board2[y][x] = vW + vX + vZ;
          }
          else if (tZ==(ref-1)) {    
            this.board2[y][x] = vW + vX + vY;
          }

          else {
            this.board2[y][x] = vW + vX + vY + vZ;
          }

          if(this.board[y][x] == 2) {
            this.board2[y][x] += 0b10000;
          }
        }
        else {
          this.board2[y][x] = 0;
        }

      }
    }
  }

  map2screen(x, y) {
    return createVector(
      (x - y) * this.tileHalfSize.x,
      (x + y) * this.tileHalfSize.y
    );
  }
}

function setup() {

}

function loop() {
  
}