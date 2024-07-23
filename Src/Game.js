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

    this.navigationScene = new NavigationScene();

    this.playerTrain = new Train("Player");
    
    // TODO: The game has a list of enemy trains
    this.enemyTrain = new Train("CPU");

    //this.hud = new Hud();

    // In navigationScene or keep it here?
    this.industries = {};
    for (let [industryName, industryVal] of Object.entries(industriesData)) {
      this.industries[industryName] = new Industry(industryVal);
    }

    this.cities = {};
    for (let [cityName, cityVal] of Object.entries(citiesData)) {
      this.cities[cityName] = new City(cityVal);
    }

    this.events = {};
    for (let [cityLocation, cityName] of Object.entries(citiesLocations)) {
      this.events[cityLocation] = cityName;
    }
    for (let [industryLocation, industryName] of Object.entries(industriesLocations)) {
      this.events[industryLocation] = industryName;
    }

    this.objectives = [];
  }

  initialize() {
    // Apply saveData
    this.playerTrain.initialize(this.saveData.PlayerTrain);
    this.enemyTrain.initialize(this.saveData.EnemyTrain);
    //this.currentScene = new CombatScene(this.playerTrain, this.enemyTrain);
    this.currentScene = new CityTradeScene(this.cities["Barcelona"]);
    // this.currentScene = new IndustryTradeScene(this.industries["Barcelona"]);
    // this.currentScene = new MapEditor();
    // this.currentScene = new MainMenu();
    // this.currentScene = this.navigationScene;
    this.currentScene.initialize();
  }

  showObjectives() {
    mainCanvas.fill(255,255,255,200);
    mainCanvas.rect(0,50,500,400,20)
    mainCanvas.fill(0);
    mainCanvas.text("Objectives:", 20, 100);
    let x = 30;
    let y = 140;
    for (let objective of this.objectives) {
      mainCanvas.text(objective.title, x, y);
      y += 30;
      mainCanvas.text(objective.summary, x, y);
      y += 50;
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
    //this.showObjectives();  
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