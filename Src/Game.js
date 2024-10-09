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

class Game {
  static Players = {
    "Human": 0,
    "Cpu": 1
  };

  constructor() {
    Tile.initialize();

    this.gameTime = new Date(1549312452 * 1000);
    
    this.cameraFollowsLocomotive = true;

    this.navigationScene = new NavigationScene();

    this.playerTrain = new Train(Game.Players.Human);
    
    // TODO: The game has a list of enemy trains
    this.enemyTrain = new Train(Game.Players.Cpu);

    this.hud = new Hud();

    this.dateEvents = dateEvents;

    this.events = {};
    this.cities = {};
    this.industries = {};
    this.bases = {};
    this.bridges = {};
    this.mines = {};

    this.newGame();


  
    this.objectives = [];
    this.objectivesVisible = false;

    this.currentScene = new MainMenu();

    // this.savedData = getItem("Save1");
    // if (this.savedData === null) {
    //   console.log("Starting a new game");
    //   this.newGame();
    // } else {
    //   console.log("Game loaded");
    // }

    
  }

  newGame() {
    this.savedData = {
      "PlayerTrain": {
        coal: 1000,
        gold: 1500,
        position: createVector(139, 401),
        orientation: 270,
        wagons: [
          {"name": "Locomotive"},
          {"name": "Tender", "content": {"resourceName": "Coal", "qty": 1000}},
          {"name": "Gondola", "content": {"resourceName": "Clay", "qty": 70}},
          // {"name": "Barracks"},
          // {"name": "Cannon"},
          // {"name": "Machinegun"},
          {"name": "Vehicle Wagon", "vehicles": [null, null, null, null, null]},
          {"name": "Merchandise", "content": {"resourceName": "Rails", "qty": 7}},
          // {"name": "Merchandise", "content": {"resourceName": "Mamooth Dung", "qty": 7}},
          // {"name": "Merchandise", "content": {"resourceName": "Missiles", "qty": 7}},
          // {"name": "Merchandise", "content": {"resourceName": "Antiques", "qty": 7}},
          // {"name": "Gondola", "content": {"resourceName": "Clay", "qty": 7}},
          //{"name": "Vehicle Wagon"},
          {"name": "Vehicle Wagon", "vehicles": ["Tank", "Tank", "Artillery", "Tank", "Artillery"]}
        ]
      },
      "EnemyTrain": {
        coal: 123,
        gold: 456,
        position: createVector(72, 354),
        orientation: 270,
        wagons: [
          {"name": "Locomotive_vu"},
          {"name": "Tender_vu"},
          {"name": "Merchandise_vu"},
          {"name": "Machinegun_vu"},
          {"name": "Barracks_vu"},
          {"name": "Cannon_vu"},
          {"name": "Vehicle Wagon", "vehicles": ["Artillery", "Artillery", "Artillery", "Tank", "Artillery"]}
        ]
      },
      "Cities": {},
      "Industries": {}
    }
  }

  saveGame() {
    let saveData = {
      "PlayerTrain": {
        coal: this.playerTrain.coal,
        gold: this.playerTrain.gold,
        position: this.navigationScene.locomotive.currentTile,
        orientation: this.navigationScene.locomotive.orientation,
        wagons: []
      },
      "EnemyTrain": {
        coal: 100,
        gold: 100,
        position: createVector(0,0),
        orientation: 0,
        wagons: []
      },
      "Cities": {}
    }
    
    // Save the cities available resources
    for (let [cityName, cityInstance] of Object.entries(this.cities)) {
      saveData.Cities[cityName] = {"resources": {}};
      for (let [resourceName, resourceInfo] of Object.entries(cityInstance.resources)) {
        saveData.Cities[cityName].resources[resourceName] = {"Available": resourceInfo.Available};
      }
    }

    for (let wagon of this.playerTrain.wagons) {
      let wagonData = {
        "name": wagon.name,
        "content": {"resourceName": wagon.cargo, "qty": wagon.usedSpace}
      };
      saveData.PlayerTrain.wagons.push(wagonData);
    }

    storeItem("Save1", saveData)
  }

  gameOver() {
    console.log("Game Over");
  }

  initializeCities() {
    for (let [name, value] of Object.entries(gameData.citiesData)) {
      this.cities[name] = new City(value);
      this.savedData.Cities[name] = value;
      this.cities[name].initialize(value);
    }

    for (let [location, name] of Object.entries(citiesLocations)) {
      let aux = location.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = name;
      this.cities[name].location = createVector(x, y);
      
      // this.navigationScene.tileBoard.board[y][x+1].setTileId(0xA0);
      this.navigationScene.tileBoard.placeBuilding(createVector(x, y), new BuildingFH(Object.keys(this.navigationScene.tileBoard.buildings).length, "Village", createVector(x, y)));

    }
  }

  initializeIndustries() {
    for (let [name, value] of Object.entries(gameData.industriesData)) {
      this.industries[name] = new Industry(value);
      this.savedData.Industries[name] = value;
      this.industries[name].initialize(value);
    }

    for (let [location, name] of Object.entries(industriesLocations)) {
      let aux = location.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = name;
      this.industries[name].location = createVector(x, y);
      this.navigationScene.tileBoard.placeBuilding(
        createVector(x, y), 
        new BuildingFH(
          Object.keys(this.navigationScene.tileBoard.buildings).length, 
          `${this.industries[name].industryType}_nav`, 
          createVector(x, y)
        )
      );
      
    }
  }

  initializeBases() {
    for (let [name, value] of Object.entries(gameData.basesData)) {
      this.bases[name] = new Base(value);
    }

    for (let [location, name] of Object.entries(basesLocations)) {
      let aux = location.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = name;
      this.bases[name].location = createVector(x, y);
      this.navigationScene.tileBoard.placeBuilding(createVector(x, y), new BuildingFH(Object.keys(this.navigationScene.tileBoard.buildings).length, "Base", createVector(x, y)));
    }
  }

  initializeMines() {
    for (let [name, value] of Object.entries(gameData.minesData)) {
      this.mines[name] = new Mine(value);
      this.dateEvents[value.revealDate] = name;
    }

    for (let [location, name] of Object.entries(minesLocations)) {
      let aux = location.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.mines[name].location = createVector(x, y);
    }
  }

  initializeBridges() {
    for (let [name, value] of Object.entries(gameData.bridgesData)) {
      this.bridges[name] = new Bridge(value);
    }

    for (let [location, name] of Object.entries(bridgesLocations)) {
      let aux = location.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = name;
      this.bridges[name].locations.push(createVector(x, y));
    }
  }

  initialize() {
    this.initializeCities();
    this.initializeIndustries();
    this.initializeBases();
    this.initializeBridges();
    this.initializeMines();

    // Apply saveData
    this.playerTrain.initialize(this.savedData.PlayerTrain);
    this.enemyTrain.initialize(this.savedData.EnemyTrain);
   
    
    this.currentScene = this.navigationScene;
    // this.currentScene = new CombatScene(this.playerTrain, this.enemyTrain);
    // this.currentScene = new BaseScene(this.bases["BarcelonaBase"]);
    this.currentScene = new BaseCombat(this.bases["MadridBase"]);
    
    // this.currentScene = new TradeScene(this.industries["Madrid_Mine"]);
   
    // this.currentScene = new TradeScene(this.cities["Alexandria"]);
    // this.currentScene = new TradeScene(this.cities["Granada"]);

    // this.currentScene = new TradeScene(this.cities["Ruhr"]);
  
    this.navigationScene.locomotive.initialize(this.savedData.PlayerTrain);
    this.navigationScene.enemyLocomotive.initialize(this.savedData.EnemyTrain);

    this.currentScene.initialize();

    // this.conversationPanel.fillData({
    //   "characterName": "Yuri",
    //   "textLines": [
    //     "Welcome to Transarctica commander, I'm Yuri your second-in-command.",
    //     "Press Ctrl to start/stop Transarctica's engine. When stopped, press Shift to reverse direction",
    //     "Transarctica automatically selects the next rail intersection, press Space to change it",
    //     "There's a trade city to the North, let's go there. Click anywhere to close this dialog."
    //   ]
    // });
    // this.conversationPanel.active = true;
  }

  showObjectives() {
    mainCanvas.fill(255,255,255,200);
    mainCanvas.rect(0,50,700,500,20)
    mainCanvas.fill(0);
    mainCanvas.text("Objectives:", 20, 100);
    let x = 30;
    let y = 140;
    for (let objective of this.objectives) {
      if (objective.completed) {
        mainCanvas.fill("green");
      } else {
        mainCanvas.fill(0);
      }
      mainCanvas.text(`- ${objective.title}`, x, y);
      y += 30;
      let line = "";
      for (let [resource, val] of Object.entries(objective.resources)) {
        line += `    ${resource}: ${val.delivered} / ${val.needed}  `;
      }
      mainCanvas.text(line, x, y);
      y += 30;
      
    }    
  }

  showCharacter() {
    mainCanvas.push();
    mainCanvas.fill(255,255,255,200);
    mainCanvas.noStroke();
    mainCanvas.rect(0,mainCanvasDim[1]-200,mainCanvasDim[0],200);
    mainCanvas.image(charactersData.Yuri,0,mainCanvasDim[1]-200);
    mainCanvas.pop();
    mainCanvas.text("awervcwser svtrswertve ervwervwser ewsrvwservwserv", 200, mainCanvasDim[1]-150)
  }

  processTimeEvent(eventName) {
    if (eventName.startsWith("Mine")) {
      this.mines[eventName].reveal();
    }
  }

  checkTimedEvents() {
    let currentTimeStr = this.gameTime.toISOString().slice(0,16);
    if (currentTimeStr in this.dateEvents) {
      console.log(`Time event ${currentTimeStr}`)
      this.processTimeEvent(this.dateEvents[currentTimeStr]);
      // this.currentScene.conversationPanel.fillData(this.dateEvents[currentTimeStr]);
      // this.currentScene.conversationPanel.active = true;
    }



    if (this.gameTime.getDay() == 0 && this.gameTime.getHours() == 0 && this.gameTime.getMinutes() == 0) {
      // let mineLocation = minesLocations[Math.floor(Math.random() * minesLocations.length)];
      // game.navigationScene.tileBoard.board[mineLocation.y][mineLocation.x].setTileId(0x4A);

      // update all cities
      //console.log("Upodate cities")
      for (let [cityName, cityInstance] of Object.entries(this.cities)) {
        for (let [resourceName, resourceInfo] of Object.entries(cityInstance.resources)) {
          this.cities[cityName].resources[resourceName].Available += resourceInfo.Production;
          //console.log(cityName, resourceName)
        }
      }
    }
  }

  update() {
    this.currentScene.update();    
    this.currentScene.show(); 
    if (this.objectivesVisible) 
      this.showObjectives();  
    
    this.hud.show();
    this.gameTime.setMinutes(this.gameTime.getMinutes()+1)
    this.checkTimedEvents();

    //this.showCharacter();
  }

  onKeyPressed(key) {
    this.currentScene.processKey(key);
  }

  onMousePressed(mousePos) {
    if (mousePos.y > mainCanvasDim[1]) {
      this.hud.onClick(mousePos);
    } else {
      this.currentScene.onClick(mousePos);  
    }    
  }
  onMouseReleased() {
    //this.currentScene.onMouseReleased();  
  }
}