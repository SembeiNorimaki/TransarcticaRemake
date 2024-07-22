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


const TILE_WIDTH_HALF = 64;
const TILE_HEIGHT_HALF = 32;

// Minimap tile size
const TILE_MINI_WIDTH = 20;
const TILE_MINI_HEIGHT = 10;

let screenDim = [TILE_WIDTH_HALF*27 , TILE_HEIGHT_HALF*27+60];
let mainCanvas, hudCanvas;

let hudCanvasDim = [screenDim[0], 60];
let mainCanvasDim = [screenDim[0], screenDim[1]-hudCanvasDim[1]];


let game;

let tileCodes = {};
let tileImgs = {};

let mapBoard;  // contains the navigation map
let cityBoard; // conatins the city board template

let hudData = {};
// let roadsData = {};
let locomotiveData = {};
let citiesData = {}
let industriesData = {};
let trafficLightData = {};
let cannonballData = {};
let unitsData = {};

// TODO: Either events or industries and cities separated
let events;
let industriesLocations = {};
let citiesLocations = {};

let charactersData = {};
let backgroundImg;

let mapFile = "maps/spain.txt";

let i=0;

let saveData = {
  "PlayerTrain": {
    fuel: 123,
    gold: 456,
    wagons: [
      {"name": "Locomotive"},
      {"name": "Tender"},
      {"name": "Machinegun"},
      {"name": "Cannon"},
      {"name": "Cannon"},
    ]
  },
  "EnemyTrain": {
    fuel: 123,
    gold: 456,
    wagons: [
      {"name": "Locomotive_vu"},
      {"name": "Tender_vu"},
      {"name": "Cannon_vu"},
    ]
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

function preload() {
  
  backgroundImg = loadImage('resources/misc/Transarctica.jpg');
  charactersData.Yuri = loadImage('resources/misc/comrad.png');
  charactersData.Trader = loadImage('resources/misc/trader2.png');


  // Cities into CitiesData
  loadJSON("Src/Cities.json", jsonData => {
    citiesData = jsonData;
  });
  
  // Induestries into IndustriesData
  loadJSON("Src/Industries.json", jsonData => {
    industriesData = jsonData;
  });

  // Industries into industriesInfo
  loadJSON("Src/IndustriesInfo.json", jsonData => {
    industriesInfo = jsonData;
    for (const [key, val] of Object.entries(jsonData)) {
      industriesInfo[key].imgNav = loadImage(`resources/industries/${val.file}`);
      industriesInfo[key].imgTrade = loadImage(`resources/industries_big/${val.file}`);
      industriesInfo[key].imgs = [];
      for (let filename of val.files) {
        industriesInfo[key].imgs.push(loadImage(`resources/industries/${filename}`));
      }
    }
  });

  // Industry Locations
  loadJSON("Src/IndustriesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      industriesLocations[key] = val;
    }
  });

  // Cities Locations
  loadJSON("Src/CitiesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      citiesLocations[key] = val;
    }
  });


  // NavigationMap into mapBoard
  loadStrings(mapFile, mapData => {
    let NCOLS = split(mapData[0], ',').length - 1;
    let NROWS = mapData.length - 1;
    mapBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      if (row == 0)  // skip first row
        continue;
      for (const [col, elem] of split(txtLine, ',').entries()) {
        if (col == 0)  // skip first col
          continue;
        mapBoard[row-1][col-1] = Number("0x" + elem);
      }
    }
  });

  // City template map into cityBoard
  loadStrings("maps/cityTemplate.txt", mapData => {
    let NCOLS = split(mapData[0], ',').length;
    let NROWS = mapData.length;
    cityBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      for (const [col, elem] of split(txtLine, ',').entries()) {
        cityBoard[row][col] = Number("0x" + elem);
      }
    }
  });

  // Industry template map into industryBoard
  loadStrings("maps/industryTemplate.txt", mapData => {
    let NCOLS = split(mapData[0], ',').length;
    let NROWS = mapData.length;
    industryBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      for (const [col, elem] of split(txtLine, ',').entries()) {
        industryBoard[row][col] = Number("0x" + elem);
      }
    }
  });

  // CannonBall data into canonballData
  loadJSON("Src/Cannonball.json", jsonData => {
    cannonballData = {"move": {0: []}, "explode": {0: []}};
    cannonballData.move[0].push(loadImage(jsonData.move[0]));
    for (let spriteIdx=0; spriteIdx<7; spriteIdx++) {
      cannonballData.explode[0].push(loadImage(jsonData.explode[spriteIdx]));
    }
  });


  // Mamooth data into unitsData.mamooth
  // Structure: unitsData.mamooth[action][orientation][spriteId]
  loadJSON("Src/Mamooth.json", jsonData => {    
    unitsData.mamooth = {"move": {}, "idle": {}};
    for (let ori of [0,45,90,135,180,225,270,315]) {
      unitsData.mamooth.move[ori] = [loadImage(jsonData.move[`${ori}`])];
      unitsData.mamooth.idle[ori] = unitsData.mamooth.move[ori];  
    }    
  });

  // Load ultralisk
  loadImage("resources/units/ultralisk.png", atlasImg => {
    let spriteSize = [101, 108];
    unitsData.ultralisk = {"move": {}, "attack": {}};
    for (let [col, ori] of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].entries()) {
      unitsData.ultralisk.move[ori] = [];
      for (let spriteIdx=0; spriteIdx<9;spriteIdx++) {
        let x = spriteSize[0] * col+2;
        let y = spriteSize[1] * spriteIdx +2;
        unitsData.ultralisk.move[ori].push(atlasImg.get(x,y,spriteSize[0]-4,spriteSize[1]-4))
      }
    }
  });

  // Soldiers data into unitsData.soldier
  // Structure: unitsData.soldier[soldierId (type)][action][orientation][spriteId]
  loadImage("resources/units/soldier0.png", soldierAtlas => {
    loadJSON("Src/Soldier.json", jsonData => {
      const spriteSize = jsonData.spriteSize;
      const offset = jsonData.offset;
      unitsData.soldier = [];
      for (let soldierId=0; soldierId<5; soldierId++) {
        unitsData.soldier.push({});
        for (const [action, value] of Object.entries(jsonData.actions)) {
          unitsData.soldier[soldierId][action] = {};
          for (const [j, ori] of Object.entries(jsonData.orientations)) {
            unitsData.soldier[soldierId][action][ori] = [];
            for (let i of value) {
              let x = spriteSize[0] * i + offset[0];
              let y = spriteSize[1] * j + offset[1];
              unitsData.soldier[soldierId][action][ori].push(soldierAtlas.get(x, y, spriteSize[0], spriteSize[1]));
            }
          }
        }  
      }
    });
  });

  // Hud data into hudData
  loadJSON("Src/Hud.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      hudData[key] = loadImage(`resources/hud/${val}`);
    }
  });
  
  // Locomotive data into locomotiveData
  loadJSON("Src/Locomotive.json", jsonData => {  
    for (const [ori, val] of Object.entries(jsonData)) {
      locomotiveData[ori] = val;
      locomotiveData[ori].imgList = [];
      for (let filename of val.fileList) {
        locomotiveData[ori].imgList.push(loadImage("resources/locomotive/" + filename));
      }
    }
  });
  
  // Wagons into wagonsData
  loadJSON("Src/Wagons.json", jsonData => {
    wagonsData = jsonData;
    for (const [key, val] of Object.entries(jsonData)) {
      //wagonsData[key] = val;
      wagonsData[key].img = [];
      for (let filename of val.files) {
        wagonsData[key].img.push(loadImage(filename));
      }
    }
  });
  
  

  // Tiles into tileData and tileImgs
  // TileImgs contains images identified by a name. eg: { "Ground": image }
  // TileData contains hexadecimal codes linked to an image and offet: eg: {0x01 -> groundImage}
  loadJSON("Src/Tiles.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData.TileImages)) {
      tileImgs[key] = loadImage(val.filename);
    }   
    
    for (const [key, val] of Object.entries(jsonData.TileCodes)) {  
      tileCodes[Number(key)] = val;
    }
  });
  

  
  trafficLightData["green"] = loadImage("resources/TrafficLight/green.png");
  trafficLightData["red"] = loadImage("resources/TrafficLight/red.png");


  // Events
  events = loadJSON("Src/Events.json");
}

function setupCanvas() {
  hudCanvas.imageMode(CENTER);
  hudCanvas.textAlign(CENTER, CENTER);
  hudCanvas.background(100);
  hudCanvas.textSize(28);
  hudCanvas.fill(200);
  hudCanvas.noStroke();

  mainCanvas.background(100);
}

function setup() {
  frameRate(50);
  document.addEventListener('contextmenu', event => event.preventDefault());

  createCanvas(screenDim[0], screenDim[1]);
  mainCanvas = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
  hudCanvas = createGraphics(hudCanvasDim[0], hudCanvasDim[1]);
  
  setupCanvas();
  
  // TODO: Check if theres a game saved, if so, load it instead of starting a new one
  game = new Game(saveData);  
  game.initialize();
  
}

function draw() {  
  mainCanvas.background(0)
  game.update();

  image(mainCanvas, 0, 0);
  image(hudCanvas, 0, mainCanvasDim[1]);

  //showTrainSummary();

  // image(unitsData.ultralisk.move[9][int(i/10)%8],500,100+i/2);
  // i++;
  // if (i>8*5) {
  //   i=0;
  // }
}

function keyPressed() {
  game.onKeyPressed(key);
}

function mousePressed() {
  game.onMousePressed(createVector(mouseX, mouseY));
}
