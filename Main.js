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


//let mapFile = "maps/Tutorial.txt";
let mapImage = "maps/Europe.png";
let loadFromLocalStorage = false;

// const TILE_WIDTH_HALF = 65;
// const TILE_HEIGHT_HALF = 33;

const TILE_WIDTH_HALF = 35;
const TILE_HEIGHT_HALF = 18;



// Minimap tile size
const TILE_MINI_WIDTH = 3;
const TILE_MINI_HEIGHT = 3;

let screenDim = [64*27 , 32*27+60];
let mainCanvas, hudCanvas;

let hudCanvasDim = [screenDim[0], 60];
let mainCanvasDim = [screenDim[0], screenDim[1]-hudCanvasDim[1]];


let game;

let tileCodes = {};  // contains tile Codes eg: 00: -> water
let tileImgs = {};   // contains imges referenced by name: eg: Water -> img



let gameData = {
  "mapBoard": null,       // contains the navigation map
  "cityBoard": null,      // conatins the city board template
  "baseBoard": null,      // conatins the base board template
  "locomotiveData": null,
  "citiesData": {},       // contains info abou the cities in the map: eg: Barcelona -> info
  "hudData": {},
  "industriesData": {},   // same for industries
  "bridgesData": {},   
  "trafficLightData": {},
  "cannonballData": {},
  "unitsData": {},
  "buildingsFHData": {}
}

// TODO: Either events or industries and cities separated
let events;
let industriesLocations = {};
let citiesLocations = {};
let bridgesLocations = {};
let minesLocations = [];

let charactersData = {};
let backgroundImg;
let resources = {};

let wolfImg;

let i=0;

let savedGames = [];
savedGames.push(
  {
    "PlayerTrain": {
      coal: 1230,
      gold: 4560,
      wagons: [
        {"name": "Locomotive"},
        {"name": "Merchandise"},
        {"name": "Merchandise"},
        {"name": "Livestock"}
      ]
    },
    "EnemyTrain": {
      coal: 123,
      gold: 456,
      wagons: [
        {"name": "Locomotive_vu"}
      ]
    }
  }
);

let ori = 7;
let sounds = {};
let table;
let bridgeImage;

let characters = {};

function preload() {

  loadImage("resources/font.png", img => {
    let alphabet = ' abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    for (let [x, character] of alphabet.entries()) {
      characters[character] = img.get(16*x,0,16,19);
    }
  });

  loadImage("resources/units/artillery.png", img => {
    const spriteSize = createVector(70, 54);
    gameData.unitsData.Artillery = {"idle": {}};
    for (let [i, ori] of [270,225,180,135,90,45,0,315].entries()) {
      gameData.unitsData.Artillery.idle[ori] = [];
      gameData.unitsData.Artillery.idle[ori].push(img.get(i*spriteSize.x,0,spriteSize.x, spriteSize.y));
    }
  });
  loadImage("resources/units/tank.png", img => {
    const spriteSize = createVector(70, 54);
    gameData.unitsData.Tank = {"idle": {}};
    for (let [i, ori] of [270,225,180,135,90,45,0,315].entries()) {
      gameData.unitsData.Tank.idle[ori] = [];
      gameData.unitsData.Tank.idle[ori].push(img.get(i*spriteSize.x,0,spriteSize.x, spriteSize.y));
    }
  });

  loadJSON("Src/MinesLocations.json", jsonData => {
    for (let loc of Object.values(jsonData)) {
      minesLocations.push(createVector(loc[0], loc[1]));
    }
  });

  bridgeImage = loadImage("resources/bridgeScene.png")

  // Load worldmap image into board
  loadImage(mapImage, img => {
    let NCOLS = img.width;
    let NROWS = img.height;
    gameData.mapBoard = Array.from(Array(NROWS), () => new Array(NCOLS));

    gameData.mapBoard = segmentImage(img);
    gameData.mapBoard = processEvents(gameData.mapBoard);
    gameData.mapBoard = processHeightmap(gameData.mapBoard);
    gameData.mapBoard = convertTileCodes(gameData.mapBoard);
    gameData.mapBoard = processRails(gameData.mapBoard);
    gameData.mapBoard = processOther(gameData.mapBoard);
    

  });

  //sounds.travelling = loadSound('/music/travelling.mp3');

  // Load resource images
  loadJSON("Src/Resources.json", jsonData => {
    for (const [name, filename] of Object.entries(jsonData)) {
      resources[name] = loadImage(filename);
    }
  });


  // load wolf
  loadImage("resources/units/Wolf_walk.png", wolfAtlas => {
    let spriteSize = [70, 70];
    let x = 101
    gameData.unitsData.wolf = [{
      "idle":{0:[],45:[],90:[],135:[],180:[],225:[],270:[],315:[]}, 
      "walk":{0:[],45:[],90:[],135:[],180:[],225:[],270:[],315:[]},
      "attack":{0:[],45:[],90:[],135:[],180:[],225:[],270:[],315:[]}
    }];

    //wolfImg = wolfAtlas.get(0,0,124,105);
    gameData.unitsData.wolf[0]["idle"]["90"].push(wolfAtlas.get(69-spriteSize[0]/2, 0,     30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69-spriteSize[0]/2, 0,     30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+x-spriteSize[0]/2, 0,   30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+2*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+3*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+4*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+5*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+6*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+7*x-spriteSize[0]/2, 0, 30, spriteSize[1]));

    gameData.unitsData.wolf[0]["idle"]["45"].push(wolfAtlas.get(61-spriteSize[0]/2,     80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61-spriteSize[0]/2,     80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+x-spriteSize[0]/2,   80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+2*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+3*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+4*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+5*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+6*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
    gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+7*x-spriteSize[0]/2, 80, 60, spriteSize[1]));

    gameData.unitsData.wolf[0]["idle"]["0"].push(wolfAtlas.get(48    -30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48    -30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+x  -30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+2*x-30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+3*x-30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+4*x-30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+5*x-30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+6*x-30, 175, 74, 50));
    gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+7*x-30, 175, 74, 50));

    gameData.unitsData.wolf[0]["idle"]["315"].push(wolfAtlas.get(51    -30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51    -30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+x  -30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+2*x-30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+3*x-30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+4*x-30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+5*x-30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+6*x-30, 262, spriteSize[0], 52));
    gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+7*x-30, 262, spriteSize[0], 52));

    gameData.unitsData.wolf[0]["idle"]["270"].push(wolfAtlas.get(61    -30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61    -30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+x  -30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+2*x-30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+3*x-30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+4*x-30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+5*x-30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+6*x-30, 340, 35, 62));
    gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+7*x-30, 340, 35, 62));

    gameData.unitsData.wolf[0]["idle"]["225"].push(wolfAtlas.get(41    -30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41    -30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+x  -30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+2*x-30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+3*x-30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+4*x-30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+5*x-30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+6*x-30, 424, spriteSize[0], 55));
    gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+7*x-30, 424, spriteSize[0], 55));

    gameData.unitsData.wolf[0]["idle"]["180"].push(wolfAtlas.get(31    -30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31    -30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+x  -30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+2*x-30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+3*x-30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+4*x-30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+5*x-30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+6*x-30, 500, 80, 52));
    gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+7*x-30, 500, 80, 52));

    gameData.unitsData.wolf[0]["idle"]["135"].push(wolfAtlas.get(41    -30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41    -30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+x  -30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+2*x-30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+3*x-30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+4*x-30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+5*x-30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+6*x-30, 576, 70, 62));
    gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+7*x-30, 576, 70, 62));


  });
  
  backgroundImg = loadImage('resources/misc/Transarctica.jpg');
  charactersData.Yuri = loadImage('resources/misc/comrad.png');
  charactersData.Trader = loadImage('resources/misc/trader2.png');


  // Cities into gameData.citiesData
  loadJSON("Src/Cities.json", jsonData => {
    gameData.citiesData = jsonData;
  });

  // Industries into gameData.industriesData
  loadJSON("Src/Industries.json", jsonData => {
    gameData.industriesData = jsonData;
  });

  // Cities into gameData.citiesData
  loadJSON("Src/Bases.json", jsonData => {
    gameData.basesData = jsonData;
  });

  // Load buildingsFH images
  loadJSON("Src/BuildingsFH.json", jsonData => {
    gameData.buildingsFHData = jsonData;
    for (let [name, data] of Object.entries(jsonData)) {
      gameData.buildingsFHData[name].img = loadImage(data.filename)    
    }
  });

  // Load resource prices csv
  loadTable("resource_prices.csv", "csv", "header", table => {
    let resourceList = table.columns.slice(2);
    for (let row of table.rows) {
      let cityName = row.arr[0];
      let action = row.arr[1]
      for (let [i, resourceName] of resourceList.entries()) {
        if (resourceName in gameData.citiesData[cityName].resources) {
          gameData.citiesData[cityName].resources[resourceName][action] = Number(row.arr[i+2]);
        } else {
          gameData.citiesData[cityName].resources[resourceName] = {};
          gameData.citiesData[cityName].resources[resourceName][action] = Number(row.arr[i+2]);
        }
      }
    }
  });

  // Wagon prices
  loadTable("wagon_prices.csv", "csv", "header", table => {
    let wagonList = table.columns.slice(2);
    for (let row of table.rows) {
      let cityName = row.arr[0];
      let action = row.arr[1]
      for (let [i, wagonName] of wagonList.entries()) {
        if (wagonName in gameData.citiesData[cityName].wagons) {
          gameData.citiesData[cityName].wagons[wagonName][action] = Number(row.arr[i+2]);
        } else {
          gameData.citiesData[cityName].wagons[wagonName] = {};
          gameData.citiesData[cityName].wagons[wagonName][action] = Number(row.arr[i+2]);
        }
      }
    }
  });
  


  // Industries into industriesInfo
  loadJSON("Src/IndustriesInfo.json", jsonData => {
    industriesInfo = jsonData;
    for (const [key, val] of Object.entries(jsonData)) {
      loadImage(`resources/industries/${val.file}`, img => {
        industriesInfo[key].imgTrade = img.get(0,0,img.width,img.height);
        industriesInfo[key].imgNav  = img.get(0,0,img.width,img.height);
        industriesInfo[key].imgInfo = img.get(0,0,img.width,img.height);
        industriesInfo[key].imgNav.resize(img.width/2, 0);
        industriesInfo[key].imgInfo.resize(img.width/4, 0);
      });
      
      // industriesInfo[key].imgTrade = loadImage(`resources/industries_big/${val.file}`);
      // industriesInfo[key].imgInfo = loadImage(`resources/industries_small/${val.file}`);
      
      // industriesInfo[key].imgs = [];
      // for (let filename of val.files) {
      //   industriesInfo[key].imgs.push(loadImage(`resources/industries/${filename}`));
      // }
    }
  });




  // Bridges into gameData.bridgesData
  loadJSON("Src/Bridges.json", jsonData => {
    gameData.bridgesData = jsonData;
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

  // Bridges Locations
  loadJSON("Src/BridgesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      bridgesLocations[key] = val;
    }
  });
  


  // NavigationMap into gameData.mapBoard
  // let mapData = getItem("SavedMap");
  // if (mapData !== null && loadFromLocalStorage) {
  //   // aux is an array of arrays of strings [["00", "01"],["00", "0A"]]
  //   let NCOLS = mapData[0].length;
  //   let NROWS = mapData.length;
  //   gameData.mapBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
  //   for (const [rowId, rowData] of mapData.entries()) {
  //     for (const [colId, elem] of rowData.entries()) {
  //       gameData.mapBoard[rowId][colId] = Number("0x" + elem);
  //     }
  //   }
  // } else {
  //   loadStrings("maps/Europe.txt", mapData => {
      
    
  //     let NCOLS = split(mapData[0], ',').length;
  //     let NROWS = mapData.length;
  //     gameData.mapBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
  //     for (const [rowId, rowData] of mapData.entries()) {
  //       for (const [colId, elem] of split(rowData, ',').entries()) {
  //         gameData.mapBoard[rowId][colId] = Number("0x" + elem);
  //       }
  //     }
  //   });
  // }

  // City template map into gameData.cityBoard
  loadStrings("maps/cityTemplate.txt", mapData => {
    let NCOLS = split(mapData[0], ',').length;
    let NROWS = mapData.length;
    gameData.cityBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      for (const [col, elem] of split(txtLine, ',').entries()) {
        gameData.cityBoard[row][col] = Number("0x" + elem);
      }
    }
  });

  // Base template map into gameData.baseBoard
  loadStrings("maps/baseTemplate.txt", mapData => {
    let NCOLS = split(mapData[0], ',').length;
    let NROWS = mapData.length;
    gameData.baseBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      for (const [col, elem] of split(txtLine, ',').entries()) {
        gameData.baseBoard[row][col] = Number("0x" + elem);
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
    gameData.cannonballData = {"move": {0: []}, "explode": {0: []}};
    gameData.cannonballData.move[0].push(loadImage(jsonData.move[0]));
    for (let spriteIdx=0; spriteIdx<7; spriteIdx++) {
      gameData.cannonballData.explode[0].push(loadImage(jsonData.explode[spriteIdx]));
    }
  });


  // Mamooth data into gameData.unitsData.mamooth
  // Structure: gameData.unitsData.mamooth[action][orientation][spriteId]
  loadJSON("Src/Units/Mamooth.json", jsonData => {    
    gameData.unitsData.mamooth = {"move": {}, "idle": {}};
    for (let ori of [0,45,90,135,180,225,270,315]) {
      gameData.unitsData.mamooth.move[ori] = [loadImage(jsonData.move[`${ori}`])];
      gameData.unitsData.mamooth.idle[ori] = gameData.unitsData.mamooth.move[ori];  
    }    
  });

  // Load ultralisk
  loadImage("resources/units/ultralisk.png", atlasImg => {
    let spriteSize = [101, 108];
    gameData.unitsData.ultralisk = {"move": {}, "attack": {}};
    for (let [col, ori] of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].entries()) {
      gameData.unitsData.ultralisk.move[ori] = [];
      for (let spriteIdx=0; spriteIdx<9;spriteIdx++) {
        let x = spriteSize[0] * col+2;
        let y = spriteSize[1] * spriteIdx +2;
        gameData.unitsData.ultralisk.move[ori].push(atlasImg.get(x,y,spriteSize[0]-4,spriteSize[1]-4))
      }
    }
  });

  // Soldiers data into gameData.unitsData.soldier
  // Structure: gameData.unitsData.soldier[soldierId (type)][action][orientation][spriteId]
  loadImage("resources/units/soldierBlue.png", soldierAtlas => {
    loadJSON("Src/Units/Soldier.json", jsonData => {
      const spriteSize = jsonData.spriteSize;
      const offset = jsonData.offset;
      gameData.unitsData.soldier = [];
      for (let soldierId=0; soldierId<1; soldierId++) {
        gameData.unitsData.soldier.push({});
        for (const [action, value] of Object.entries(jsonData.actions)) {
          gameData.unitsData.soldier[soldierId][action] = {};
          for (const [j, ori] of Object.entries(jsonData.orientations)) {
            gameData.unitsData.soldier[soldierId][action][ori] = [];
            for (let i of value) {
              let x = spriteSize[0] * i + offset[0];
              let y = spriteSize[1] * j + offset[1];
              gameData.unitsData.soldier[soldierId][action][ori].push(soldierAtlas.get(x, y, spriteSize[0], spriteSize[1]));
            }
          }
        }  
      }
    });
  });

  // loadImage("resources/units/soldierRed.png", soldierAtlas => {
  //   loadJSON("Src/Units/Soldier.json", jsonData => {
  //     const spriteSize = jsonData.spriteSize;
  //     const offset = jsonData.offset;
  //     // gameData.unitsData.soldier = [];
  //     for (let soldierId=1; soldierId<2; soldierId++) {
  //       gameData.unitsData.soldier.push({});
  //       for (const [action, value] of Object.entries(jsonData.actions)) {
  //         gameData.unitsData.soldier[soldierId][action] = {};
  //         for (const [j, ori] of Object.entries(jsonData.orientations)) {
  //           gameData.unitsData.soldier[soldierId][action][ori] = [];
  //           for (let i of value) {
  //             let x = spriteSize[0] * i + offset[0];
  //             let y = spriteSize[1] * j + offset[1];
  //             gameData.unitsData.soldier[soldierId][action][ori].push(soldierAtlas.get(x, y, spriteSize[0], spriteSize[1]));
  //           }
  //         }
  //       }  
  //     }
  //   });
  // });

  // Hud data into gameData.hudData
  loadJSON("Src/Hud.json", jsonData => {
    gameData.hudData = {};
    for (const [key, val] of Object.entries(jsonData)) {
      gameData.hudData[key] = loadImage(`resources/hud/${val}`);
    }
  });
  
  // Locomotive data into gameData.locomotiveData
  loadJSON("Src/Locomotive.json", jsonData => {  
    gameData.locomotiveData = {};
    for (const [ori, val] of Object.entries(jsonData)) {
      gameData.locomotiveData[ori] = {};
      gameData.locomotiveData[ori].offset = val.offset;
      gameData.locomotiveData[ori].imgList = [];
      for (let filename of val.fileList) {
        gameData.locomotiveData[ori].imgList.push(loadImage("resources/locomotive/" + filename));
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
  
  gameData.trafficLightData["green"] = loadImage("resources/TrafficLight/green.png");
  gameData.trafficLightData["red"] = loadImage("resources/TrafficLight/red.png");


  // Events
  //events = loadJSON("Src/Events.json");
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
  //sounds.travelling.play();
  frameRate(50);
  document.addEventListener('contextmenu', event => event.preventDefault());

  createCanvas(screenDim[0], screenDim[1]);
  mainCanvas = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
  hudCanvas = createGraphics(hudCanvasDim[0], hudCanvasDim[1]);
  
  setupCanvas();
  
  // TODO: Check if theres a game saved, if so, load it instead of starting a new one
  game = new Game();   
  game.initialize(); 
}

function draw() {  
  game.update();

  image(mainCanvas, 0, 0);
  image(hudCanvas, 0, mainCanvasDim[1]);
}

function keyPressed() {
  game.onKeyPressed(key);
}

function mousePressed() {
  game.onMousePressed(createVector(mouseX, mouseY));
}

function mouseMoved() {
  // game.currentScene.mouseMoved();
}


function mouseReleased() {
  game.onMouseReleased();
}
