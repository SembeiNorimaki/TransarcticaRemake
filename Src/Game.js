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
  constructor(saveData) {
    this.saveData = saveData;

    for (const [key, val] of Object.entries(tileCodes)) {
      tileCodes[key].img = tileImgs[val.imgName];
    }
    Tile.initialize();

    this.cameraFollowsLocomotive = true;

    this.navigationScene = new NavigationScene();
    this.navigationScene.initialize();

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

    this.events = {};
    
    // Cities are 2x2
    for (let [cityLocation, cityName] of Object.entries(citiesLocations)) {
      let aux = cityLocation.split(",");
      let x = int(aux[0]);
      let y = int(aux[1]); 
      this.events[`${x},${y}`] = cityName;
    //   this.events[`${x-1},${y-1}`] = cityName;
    //   this.events[`${x},${y-1}`] = cityName;
    //   this.events[`${x-1},${y}`] = cityName;
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
  }

  initialize() {
    // Apply saveData
    this.playerTrain.initialize(this.saveData.PlayerTrain);
    this.enemyTrain.initialize(this.saveData.EnemyTrain);

    // this.currentScene = new CombatScene(this.playerTrain, null);
    // this.currentScene = new CombatWolves(this.playerTrain);
    this.currentScene = new CombatIntro(this.playerTrain);
    // this.currentScene = new CityTradeScene(this.cities["Marrakesh"]);
    // this.currentScene = new IndustryTradeScene(this.industries["Barcelona_Mine"]);
    // this.currentScene = new MapEditor();
    // this.currentScene = new MainMenu();
    // this.currentScene = this.navigationScene;
    this.currentScene.initialize();

    this.conversationPanel.fillData({
      "characterName": "Yuri",
      "textLines": [
        "Welcome to Transarctica commander, I'm Yuri your second-in-command.",
        "Press Ctrl to start/stop Transarctica's engine. When stopped, press Shift to reverse direction",
        "Transarctica automatically selects the next rail intersection, press Space to change it",
        "There's a trade city to the North, let's go there. Click anywhere to close this dialog."
      ]
    });
    this.conversationPanel.active = true;
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

  update(){
    this.currentScene.update();    
    this.currentScene.show(); 
    if (this.objectivesVisible) 
      this.showObjectives();  
    //this.conversationPanel.show();
    //this.showCharacter();
  }

  onKeyPressed(key) {
    this.currentScene.processKey(key);
  }

  onMousePressed(mousePos) {
    if (mousePos.y > mainCanvasDim[1]) {
      // click on the Hud
      this.hud.onClick(mousePos);
    } else {
      // clicked on the mainCanvas
      this.currentScene.onClick(mousePos);  
    }    
  }
}