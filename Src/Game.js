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
  constructor() {
    //this.saveData = saveData;

    Tile.initialize();

    this.gameTime = new Date(1549312452 * 1000);

    
    this.cameraFollowsLocomotive = false;

    this.navigationScene = new NavigationScene();
    //this.navigationScene.initialize();

    this.playerTrain = new Train("Player");
    
    // TODO: The game has a list of enemy trains
    this.enemyTrain = new Train("CPU");

    this.hud = new Hud();
    this.conversationPanel = new ConversationPanel();

    // In navigationScene or keep it here?
    this.industries = {};
    for (let [industryName, industryVal] of Object.entries(gameData.industriesData)) {
      this.industries[industryName] = new Industry(industryVal);
    }

    this.cities = {};
    for (let [cityName, cityVal] of Object.entries(gameData.citiesData)) {
      this.cities[cityName] = new City(cityVal);
    }

    this.bases = {};
    for (let [baseName, baseVal] of Object.entries(gameData.basesData)) {
      this.bases[baseName] = new Base(baseVal);
    }

    this.bridges = {};
    for (let [bridgeName, bridgeVal] of Object.entries(gameData.bridgesData)) {
      this.bridges[bridgeName] = new Bridge(bridgeVal);
    }



    this.events = {};
    
    for (let [cityLocation, cityName] of Object.entries(citiesLocations)) {
      let aux = cityLocation.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = cityName;
    }

    for (let [bridgeLocation, bridgeName] of Object.entries(bridgesLocations)) {
      let aux = bridgeLocation.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = bridgeName;
    }

    // // Industries are 3x3
    // for (let [industryLocation, industryName] of Object.entries(industriesLocations)) {
    //   let aux = industryLocation.split(",");
    //   let x = int(aux[0]);
    //   let y = int(aux[1]); 
    //   this.events[`${x},${y}`] = industryName;
    //   this.events[`${x-1},${y}`] = industryName;
    //   this.events[`${x-2},${y}`] = industryName;
    //   this.events[`${x},${y-1}`] = industryName;
    //   this.events[`${x-2},${y-1}`] = industryName;
    //   this.events[`${x},${y-2}`] = industryName;
    //   this.events[`${x-1},${y-2}`] = industryName;
    //   this.events[`${x-2},${y-2}`] = industryName;
      
    // }
    

    this.objectives = [];
    this.objectivesVisible = false;

    this.currentScene = new MainMenu();

    this.newGame();
  }

  newGame() {
    this.savedData = {
      "PlayerTrain": {
        coal: 123,
        gold: 456,
        position: createVector(73, 366),
        orientation: 180,
        wagons: [
          {"name": "Locomotive"},
          {"name": "Tender"},
          {"name": "Merchandise"},
          // {"name": "Merchandise", "content": {"resourceName": "Furs", "qty": 7}},
          // {"name": "Merchandise", "content": {"resourceName": "Mamooth Dung", "qty": 7}},
          // {"name": "Merchandise", "content": {"resourceName": "Missiles", "qty": 7}},
          // {"name": "Merchandise", "content": {"resourceName": "Antiques", "qty": 7}},
          // {"name": "Gondola", "content": {"resourceName": "Clay", "qty": 7}},
          {"name": "Container Wagon"},
          {"name": "Container Wagon"}
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
  }

  loadGame() {
    this.savedData = savedGames[0];
  }

  saveGame() {
    this.savedData = {
      "PlayerTrain": {
        coal: this.playerTrain.coal,
        gold: this.playerTrain.gold,
        position: this.navigationScene.locomotive.currentTile,
        orientation: this.navigationScene.locomotive.orientation,
        wagons: []
      },
      "EnemyTrain": {
        coal: 123,
        gold: 456,
        wagons: [
          {"name": "Locomotive_vu"}
        ]
      }
    }
    for (let wagon of this.playerTrain.wagons) {
      this.savedData.PlayerTrain.wagons.push(wagon.name);
    }
  }




  initialize() {
    // Apply saveData
    this.playerTrain.initialize(this.savedData.PlayerTrain);
    this.enemyTrain.initialize(this.savedData.EnemyTrain);
    
    // this.navigationScene.tileBoard.board[366][75].setTileId(0x60)
    // this.navigationScene.tileBoard.board[365][75].setTileId(0x61)
    // this.navigationScene.tileBoard.board[364][76].setTileId(0x62)

    // this.currentScene = this.navigationScene;
    // this.currentScene = new CombatScene(this.playerTrain, null);
    // this.currentScene = new CombatWolves(this.playerTrain);
    // this.currentScene = new CombatIntro(this.playerTrain);
    // this.currentScene = new CityTradeScene(this.cities["Ruhr"]);
    //this.currentScene = new CityTradeScene(this.cities["Taoudeni"]);
    //this.currentScene = new BaseScene(this.bases["BarcelonaBase"]);
    this.currentScene = new BaseCombat(this.bases["BarcelonaBase"]);
    // this.currentScene = new IndustryTradeScene(this.industries["Barcelona_Mine"]);
    // this.currentScene = new IndustryTradeScene(this.industries["Madrid_Mine"]);
    // this.currentScene = new MapEditor();
    // this.currentScene = new MainMenu();
    // this.currentScene = new BridgeScene(bridgeImage);
    

    // this.currentScene.initialize();

    

    this.navigationScene.locomotive.initialize(this.savedData.PlayerTrain);

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

  checkTimedEvents() {
    if (this.gameTime.getMinutes() == 0) {
      let mineLocation = minesLocations[Math.floor(Math.random() * minesLocations.length)];
      game.navigationScene.tileBoard.board[mineLocation.y][mineLocation.x].setTileId(0x4A);
    }
  }

  update(){
    this.currentScene.update();    
    this.currentScene.show(); 
    if (this.objectivesVisible) 
      this.showObjectives();  
    this.conversationPanel.show();
    // this.hud.show();
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
    this.currentScene.onMouseReleased();  
  }
}