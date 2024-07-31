let imageFile = "maps/Tutorial_map.png";
let img;

class ImageConverter {
  static idToTileCode = {
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
  }

  constructor() {
    this.tileHalfSize = createVector(8, 4);
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
  imageToBinaryListStr(img) {
    let board = [];
    let currentRow = [];
    for (let row=0; row<img.height; row++) {
      currentRow = [];
      for (let col=0; col<img.width; col++) {
        let b = brightness(img.get(col,row));
        if (b > 80) {
          img.set(col,row,2);
          currentRow.push("00");
        } else if (b > 40) {
          img.set(col,row,1);
          currentRow.push("00");
        } else {
          img.set(col,row,0);
          currentRow.push("01");
        }
      }
      
      board.push(currentRow.join(",") + "\n");
    }
    //downloadText(board)
    return(board);
  }

  binaryListStrToBoard(mapData) {
    // NavigationMap into gameData.mapBoard
    let NCOLS = split(mapData[0], ',').length;
    let NROWS = mapData.length;
    let board = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      // if (row == 0)  // skip first row
      //   continue;
      for (const [col, elem] of split(txtLine, ',').entries()) {
        // if (col == 0)  // skip first col
        //   continue;
        board[row][col] = Number("0x" + elem);
      }
    }
    return board;    
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

  drawMap(board) {
    let NCOLS = board[0].length - 1;
    let NROWS = board.length - 1;
    for (let x=0; x<NCOLS; x++) {
      for (let y=0; y<NROWS; y++) {
        let pos = this.map2screen(x, y);
        this.drawTile(int(board[y][x]), p5.Vector.add(pos,createVector(1300,0)));
      }
    }  
  }

  convertTileCodes(board) {
    let NCOLS = board[0].length - 1;
    let NROWS = board.length - 1;
    for (let x=0; x<NCOLS; x++) {
      for (let y=0; y<NROWS; y++) {
        board[y][x] = ImageConverter.idToTileCode[board[y][x]];
      }
    }
    return board;
  }

  // populateBoard(boardRaw) {    
  //   for (const [row, txtLine] of boardRaw.entries()) {
  //     for (const [col, elem] of split(txtLine, ',').entries()) {
  //       this.board[row][col] = Number("0x" + elem);
  //       this.board2[row][col] = Number("0x" + elem);
  //     }
  //   }
  // }

  filterPeninsulas(board) {
    let NCOLS = board[0].length - 1;
    let NROWS = board.length - 1;
    for (let x=1; x<NCOLS-1; x++) {
      for (let y=1; y<NROWS-1; y++) {
        let ref = board[y][x];
        let tA = board[y][x-1]; 
        let tB = board[y-1][x];
        let tC = board[y+1][x];
        let tD = board[y][x+1];
        let tW = board[y-1][x-1]; 
        let tX = board[y+1][x-1];
        let tY = board[y-1][x+1];
        let tZ = board[y+1][x+1];

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
          console.log("aa")
          board[y][x] =  1;
        }
      }
    }
    return board;
  }

  processHeightmap(board) {
    let NCOLS = board[0].length - 1;
    let NROWS = board.length - 1;

    let board2 = Array.from(Array(NROWS), () => new Array(NCOLS));

    for (let x=0; x<NCOLS; x++) {
      for (let y=0; y<NROWS; y++) {
        if (x==0 || y==0 || x==NCOLS-1 || y==NROWS-1) {
          board2[y][x] = 0;
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

  map2screen(x, y) {
    return createVector(
      (x - y) * this.tileHalfSize.x,
      (x + y) * this.tileHalfSize.y
    );
  }
}

function preload() {
  img = loadImage(imageFile);
}

function setup() {
  createCanvas(5000,3000);
  converter = new ImageConverter();
  let imgStr = converter.imageToBinaryListStr(img);
  let board = converter.binaryListStrToBoard(imgStr);
  board = converter.processHeightmap(board);
  board = converter.filterPeninsulas(board);
  //converter.drawMap(board);
  board = converter.convertTileCodes(board);
  
  let str = []
  for (let row of board) {
    let str2 = [];
    for (let tile of row) {
      try {
      str2.push(tile.toString(16).toUpperCase().padStart(2, '0'));
      }catch{

      }
    }
    str.push(str2.join(","))
  }
  downloadText(str.join("\r\n"))
  
  // console.log(board2)
}

function loop() {
  
}