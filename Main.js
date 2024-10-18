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
let mapImage = "Src/maps/Europe.png";
let baseImage = "Src/maps/BaseTemplate.png";
let loadFromLocalStorage = false;

const TILE_WIDTH_HALF_Z1 = 32;
const TILE_HEIGHT_HALF_Z1 = 16;
const TILE_WIDTH_HALF_Z2 = 64;
const TILE_HEIGHT_HALF_Z2 = 32;

// Minimap tile size
const TILE_MINI_WIDTH = 3;
const TILE_MINI_HEIGHT = 3;

let screenDim = [64*27 , 32*27+60];
let mainCanvas, hudCanvas;

let hudCanvasDim = [screenDim[0], 60];
let mainCanvasDim = [screenDim[0], screenDim[1]-hudCanvasDim[1]];


let game;

let tileHalfSizes = {};

let tileCodes = {};  // contains tile Codes eg: 00: -> water
let tileImgs = {};   // contains imges referenced by name: eg: Water -> img

let arrowImg = {};

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
let events, dateEvents;
let industriesLocations = {};
let citiesLocations = {};
let basesLocations = {};
let bridgesLocations = {};
let minesLocations = {};

let charactersData = {};
let backgroundImg;
let resources = {};

let wolfImg;
let wagonsData;

let kar98Img;

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

// let ori = 7;
let sounds = {};
let explosionAnim = [];
// let table;
let bridgeImage;

// let imgBkg;

let characters = {};
// let baseTemplate = {};

// let atlasPlayer, atlasCpu;

let thingsToLoad = {
  "sounds": true,
  "unitsFH": true,
  "explosion": true,
  "worldmap": true,
  "resources": true,
  "citiesIndustriesBasesMines": true,
  "BuildingsFH": true,
  "resourdcePrices, wagonPrices": true,
  "IndustriesInfo": true,
  "citiesIndustriesBasesBridgesMinesLocations": true,
  "cityIndustryBaseTemplate": true,
  "cannonball": true,
  "hud": true,
  "locomotiveWagons": true,
  "tiles": true,
}


function preload() {
  kar98Img = loadImage("resources/kar98.png")

  arrowImg.NE = loadImage("resources/ArrowNE.png");
  arrowImg.SE = loadImage("resources/ArrowSE.png");
  // Sounds
  loadJSON("Src/Sounds.json", jsonData => {
    for (let [name, val] of Object.entries(jsonData)) {
      sounds[name] = loadSound(val.filename);
    }
  });

  // Explosion
  loadImage("resources/units/x1s.png", atlas => {
    let spriteSize = [170, 150];
    for (let i=0; i<16; i++) {
      explosionAnim.push(atlas.get(0, i*spriteSize[1], spriteSize[0], spriteSize[1]));
    }
  });
  
  // Load worldmap image, processHeightmap, tilecodes, rails and other into board
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


  // Load resource images
  loadJSON("Src/Resources.json", jsonData => {
    for (const [name, data] of Object.entries(jsonData)) {
      resources[name] = {}
      resources[name].img = loadImage(data.filename);
      resources[name].requires = data.requires;
    }
  });

  /* #region UNITS */

  // UnitsFH (Tank, Artillery and turret)
  loadJSON("Src/UnitsFH.json", jsonData => {
    for (let [name, val] of Object.entries(jsonData)) {
      const spriteSize = createVector(70, 54);
      gameData.unitsData[name] = {"Human": {"Idle": {}}, "Cpu": {"Idle": {}}};

      loadImage(val.Human, atlas => {
        for (let [i, ori] of [270, 225, 180, 135, 90, 45, 0, 315].entries()) {
          gameData.unitsData[name].Human.Idle[ori] = [
            atlas.get(i*spriteSize.x,0,spriteSize.x, spriteSize.y)
          ];
        }
      });
      loadImage(val.Cpu, atlas => {
        for (let [i, ori] of [270,225,180,135,90,45,0,315].entries()) {
          gameData.unitsData[name].Cpu.Idle[ori] = [
            atlas.get(i*spriteSize.x,0,spriteSize.x, spriteSize.y)
          ];
        }
      });
    }
  });  

  // Soldiers data into gameData.unitsData.soldier
  // Structure: gameData.unitsData.soldier[soldierId (type)][action][orientation][spriteId]
  loadImage("resources/units/soldierBlue.png", soldierAtlas => {
    loadJSON("Src/Units/Soldier.json", jsonData => {
      const spriteSize = jsonData.spriteSize;
      const offset = jsonData.offset;
      gameData.unitsData.Soldier = {"Human": {}, "Cpu": {}};
      for (const [action, value] of Object.entries(jsonData.actions)) {  // Idle, Move, Attack
        gameData.unitsData.Soldier.Human[action] = {};
        gameData.unitsData.Soldier.Cpu[action] = {};
        for (const [j, ori] of Object.entries(jsonData.orientations)) {
          gameData.unitsData.Soldier.Human[action][ori] = [];
          gameData.unitsData.Soldier.Cpu[action][ori] = [];
          for (let i of value) {
            let x = spriteSize[0] * i + offset[0];
            let y = spriteSize[1] * j + offset[1];
            gameData.unitsData.Soldier.Human[action][ori].push(soldierAtlas.get(x, y, spriteSize[0], spriteSize[1]));
            gameData.unitsData.Soldier.Cpu[action][ori].push(soldierAtlas.get(x, y, spriteSize[0], spriteSize[1]));
          }
        }
      }  
      
    });
  });

  loadImage("resources/units/Wolf_walk.png", wolfAtlas => {
    loadJSON("Src/Units/Wolf.json", jsonData => {
      const spriteSize = jsonData.spriteSize;
      const separation = jsonData.separation;
      // const offset = jsonData.offset;
      gameData.unitsData.Wolf = {"Human": {}, "Cpu": {}};
      for (const [action, value] of Object.entries(jsonData.actions)) {
        gameData.unitsData.Wolf.Human[action] = {};
        gameData.unitsData.Wolf.Cpu[action] = {};
        for (const [j, ori] of Object.entries(jsonData.orientations)) {
          gameData.unitsData.Wolf.Human[action][ori] = [];
          gameData.unitsData.Wolf.Cpu[action][ori] = [];
          let offset = jsonData.offsets[str(ori)];
          for (let i of value) {
            let x = separation[0]*i+offset[0];
            let y = offset[1];
            gameData.unitsData.Wolf.Human[action][ori].push(wolfAtlas.get(x, y, spriteSize[0], spriteSize[1]));
            gameData.unitsData.Wolf.Cpu[action][ori].push(wolfAtlas.get(x, y, spriteSize[0], spriteSize[1]));
          }
        }
      }
    });
  });

  // load Wolf

  // loadImage("resources/units/Wolf_walk.png", wolfAtlas => {
  //   let spriteSize = [70, 70];
  //   let x = 101
  //   gameData.unitsData.wolf = [{
  //     "idle":{0:[],45:[],90:[],135:[],180:[],225:[],270:[],315:[]}, 
  //     "walk":{0:[],45:[],90:[],135:[],180:[],225:[],270:[],315:[]},
  //     "attack":{0:[],45:[],90:[],135:[],180:[],225:[],270:[],315:[]}
  //   }];

  //   //wolfImg = wolfAtlas.get(0,0,124,105);
  //   gameData.unitsData.wolf[0]["idle"]["90"].push(wolfAtlas.get(69-spriteSize[0]/2, 0,     30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69-spriteSize[0]/2, 0,     30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+x-spriteSize[0]/2, 0,   30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+2*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+3*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+4*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+5*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+6*x-spriteSize[0]/2, 0, 30, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["90"].push(wolfAtlas.get(69+7*x-spriteSize[0]/2, 0, 30, spriteSize[1]));

  //   gameData.unitsData.wolf[0]["idle"]["45"].push(wolfAtlas.get(61-spriteSize[0]/2,     80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61-spriteSize[0]/2,     80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+x-spriteSize[0]/2,   80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+2*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+3*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+4*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+5*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+6*x-spriteSize[0]/2, 80, 60, spriteSize[1]));
  //   gameData.unitsData.wolf[0]["walk"]["45"].push(wolfAtlas.get(61+7*x-spriteSize[0]/2, 80, 60, spriteSize[1]));

  //   gameData.unitsData.wolf[0]["idle"]["0"].push(wolfAtlas.get(48    -30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48    -30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+x  -30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+2*x-30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+3*x-30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+4*x-30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+5*x-30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+6*x-30, 175, 74, 50));
  //   gameData.unitsData.wolf[0]["walk"]["0"].push(wolfAtlas.get(48+7*x-30, 175, 74, 50));

  //   gameData.unitsData.wolf[0]["idle"]["315"].push(wolfAtlas.get(51    -30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51    -30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+x  -30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+2*x-30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+3*x-30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+4*x-30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+5*x-30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+6*x-30, 262, spriteSize[0], 52));
  //   gameData.unitsData.wolf[0]["walk"]["315"].push(wolfAtlas.get(51+7*x-30, 262, spriteSize[0], 52));

  //   gameData.unitsData.wolf[0]["idle"]["270"].push(wolfAtlas.get(61    -30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61    -30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+x  -30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+2*x-30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+3*x-30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+4*x-30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+5*x-30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+6*x-30, 340, 35, 62));
  //   gameData.unitsData.wolf[0]["walk"]["270"].push(wolfAtlas.get(61+7*x-30, 340, 35, 62));

  //   gameData.unitsData.wolf[0]["idle"]["225"].push(wolfAtlas.get(41    -30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41    -30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+x  -30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+2*x-30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+3*x-30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+4*x-30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+5*x-30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+6*x-30, 424, spriteSize[0], 55));
  //   gameData.unitsData.wolf[0]["walk"]["225"].push(wolfAtlas.get(41+7*x-30, 424, spriteSize[0], 55));

  //   gameData.unitsData.wolf[0]["idle"]["180"].push(wolfAtlas.get(31    -30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31    -30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+x  -30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+2*x-30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+3*x-30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+4*x-30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+5*x-30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+6*x-30, 500, 80, 52));
  //   gameData.unitsData.wolf[0]["walk"]["180"].push(wolfAtlas.get(31+7*x-30, 500, 80, 52));

  //   gameData.unitsData.wolf[0]["idle"]["135"].push(wolfAtlas.get(41    -30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41    -30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+x  -30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+2*x-30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+3*x-30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+4*x-30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+5*x-30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+6*x-30, 576, 70, 62));
  //   gameData.unitsData.wolf[0]["walk"]["135"].push(wolfAtlas.get(41+7*x-30, 576, 70, 62));


  // });
  

  
  // Mamooth data into gameData.unitsData.mamooth
  // Structure: gameData.unitsData.mamooth[action][orientation][spriteId]
  // loadJSON("Src/Units/Mamooth.json", jsonData => {    
  //   gameData.unitsData.mamooth = {"move": {}, "idle": {}};
  //   for (let ori of [0,45,90,135,180,225,270,315]) {
  //     gameData.unitsData.mamooth.move[ori] = [loadImage(jsonData.move[`${ori}`])];
  //     gameData.unitsData.mamooth.idle[ori] = gameData.unitsData.mamooth.move[ori];  
  //   }    
  // });

  // Load ultralisk
  // loadImage("resources/units/ultralisk.png", atlasImg => {
  //   let spriteSize = [101, 108];
  //   gameData.unitsData.ultralisk = {"move": {}, "attack": {}};
  //   for (let [col, ori] of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].entries()) {
  //     gameData.unitsData.ultralisk.move[ori] = [];
  //     for (let spriteIdx=0; spriteIdx<9;spriteIdx++) {
  //       let x = spriteSize[0] * col+2;
  //       let y = spriteSize[1] * spriteIdx +2;
  //       gameData.unitsData.ultralisk.move[ori].push(atlasImg.get(x,y,spriteSize[0]-4,spriteSize[1]-4))
  //     }
  //   }
  // });

  /* #endregion */
  

  /* #region CITY, INDUSTRIES, BASES, MINES */

  // Cities into gameData.citiesData
  loadJSON("Src/Cities.json", jsonData => {
    gameData.citiesData = jsonData;
  });

  // Industries into gameData.industriesData
  loadJSON("Src/Industries.json", jsonData => {
    gameData.industriesData = jsonData;
  });
  
  // Industries into industriesInfo
  loadJSON("Src/IndustriesInfo.json", jsonData => {
    industriesInfo = {};
    for (const [industryName, industryData] of Object.entries(jsonData)) {
      loadImage(`resources/industries/${industryData.file}`, img => {
        let imgHalf = createImage(img.width/2, img.height/2);
        let imgQuarter = createImage(img.width/4, img.height/4);
        imgHalf.copy(img, 0, 0, img.width/2, img.height/2, 0, 0, img.width/2, img.height/2);
        imgQuarter.copy(img, 0, 0, img.width/4, img.height/4, 0, 0, img.width/4, img.height/4);

        industriesInfo[industryName] = {};
        industriesInfo[industryName].imgTrade = img;
        industriesInfo[industryName].imgNav  = imgHalf;
        industriesInfo[industryName].imgInfo = imgQuarter;
        industriesInfo[industryName].name = industryData.name;
        industriesInfo[industryName].offsetNav = industryData.offsetNav;
        industriesInfo[industryName].offsetTrade = industryData.offsetTrade;
        industriesInfo[industryName].offsetInfo = industryData.offsetInfo;

        // industriesInfo[industryName].imgTrade = img.get(0,0,img.width,img.height);
        // industriesInfo[industryName].imgNav  = img.get(0,0,img.width,img.height);
        // industriesInfo[industryName].imgInfo = img.get(0,0,img.width,img.height);
        // industriesInfo[industryName].imgNav.resize(img.width/2, 0);
        // industriesInfo[industryName].imgInfo.resize(img.width/4, 0);
      });
    }
    //Industry.initialize(industriesInfo);

  });

  // Cities into gameData.citiesData
  loadJSON("Src/Bases.json", jsonData => {
    gameData.basesData = jsonData;
  });

  // Mines into gameData.minesData
  loadJSON("Src/Mines.json", jsonData => {
    gameData.minesData = jsonData;
  });

  // Cities Locations
  loadJSON("Src/CitiesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      citiesLocations[key] = val;
    }
  });

  // Industry Locations
  loadJSON("Src/IndustriesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      industriesLocations[key] = val;
    }
  });

  // Bases Locations
  loadJSON("Src/BasesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      basesLocations[key] = val;
    }
  });

  // Bridges Locations
  loadJSON("Src/BridgesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      bridgesLocations[key] = val;
    }
  });

  // Bridges into gameData.bridgesData
  loadJSON("Src/Bridges.json", jsonData => {
    gameData.bridgesData = jsonData;
  });

  // Mines Locations
  loadJSON("Src/MinesLocations.json", jsonData => {
    for (const [key, val] of Object.entries(jsonData)) {
      minesLocations[key] = val;
    }
  });

  /* #endregion */
  
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
 
  
  // City template map into gameData.cityBoard
  loadStrings("Src/maps/cityTemplate.txt", mapData => {
    let NCOLS = split(mapData[0], ',').length;
    let NROWS = mapData.length;
    gameData.cityBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
    for (const [row, txtLine] of mapData.entries()) {
      for (const [col, elem] of split(txtLine, ',').entries()) {
        gameData.cityBoard[row][col] = Number("0x" + elem);
      }
    }
  });

  // Base template
  // loadJSON("Src/maps/baseTemplate.json", jsonData => {
  //   baseTemplate = jsonData;
  // });

  // Base template map into gameData.baseBoard
  // loadStrings("Src/maps/baseTemplate.txt", mapData => {
  //   let NCOLS = split(mapData[0], ',').length;
  //   let NROWS = mapData.length;
  //   gameData.baseBoard = Array.from(Array(NROWS), () => new Array(NCOLS));
  //   for (const [row, txtLine] of mapData.entries()) {
  //     for (const [col, elem] of split(txtLine, ',').entries()) {
  //       gameData.baseBoard[row][col] = Number("0x" + elem);
  //     }
  //   }
  // });



  // Industry template map into industryBoard
  loadStrings("Src/maps/industryTemplate.txt", mapData => {
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






  // loadImage("resources/units/soldierRed.png", soldierAtlas => {
  //   loadJSON("Src/Units/Soldier.json", jsonData => {
  //     const spriteSize = jsonData.spriteSize;
  //     const offset = jsonData.offset;
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
  
  //Locomotive data into gameData.locomotiveData
  loadJSON("Src/Locomotive.json", jsonData => {  
    gameData.locomotiveData = {};
    for (const [playerName, playerData] of Object.entries(jsonData)) {
      gameData.locomotiveData[playerName] = {};
      for (const [ori, val] of Object.entries(playerData)) {
        gameData.locomotiveData[playerName][ori] = {};
        gameData.locomotiveData[playerName][ori].offset = val.offset;
        gameData.locomotiveData[playerName][ori].img = loadImage(val.fileName);
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

  
  // // Transarctica pixel font
  // loadImage("resources/font.png", img => {
  //   let alphabet = ' abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  //   for (let [x, character] of alphabet.entries()) {
  //     characters[character] = img.get(16*x,0,16,19);
  //   }
  // });
  
  gameData.trafficLightData["green"] = loadImage("resources/TrafficLight/green.png");
  gameData.trafficLightData["red"] = loadImage("resources/TrafficLight/red.png");

  bridgeImage = loadImage("resources/bridgeScene.png")
  questImage = loadImage("resources/exclamation.png")
  backgroundImg = loadImage('resources/misc/Transarctica.jpg');
  charactersData.Yuri = loadImage('resources/misc/comrad.png');
  charactersData.Trader = loadImage('resources/misc/trader2.png');

  // Events
  dateEvents = loadJSON("Src/DateEvents.json");
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
  createCanvas(screenDim[0], screenDim[1]);

  tileHalfSizes.Z1 = createVector(TILE_WIDTH_HALF_Z1, TILE_HEIGHT_HALF_Z1); 
  tileHalfSizes.Z2 = createVector(TILE_WIDTH_HALF_Z2, TILE_HEIGHT_HALF_Z2);

  frameRate(50);
  document.addEventListener('contextmenu', event => event.preventDefault());

  mainCanvas = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
  hudCanvas = createGraphics(hudCanvasDim[0], hudCanvasDim[1]);
  panelCanvas = createGraphics(300, mainCanvasDim[1]-300);
  
  setupCanvas();
  
  game = new Game();   
  game.initialize(); 

}

function draw() { 
  
  // showSoldiersWalk("Wolf")
  game.update();
  
  image(mainCanvas, 0, 0);
  image(hudCanvas, 0, mainCanvasDim[1]);
  image(panelCanvas, mainCanvasDim[0]-300, 0);
}

function keyPressed() {
  game.onKeyPressed(key);
}

function mousePressed() {
  game.onMousePressed(createVector(mouseX, mouseY));
}

function mouseReleased() {
  game.onMouseReleased();
}
