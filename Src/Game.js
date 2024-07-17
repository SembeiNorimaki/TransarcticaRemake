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

    //this.currentScene = new Minimap();
    // this.currentScene = new CityTradeScene("Barcelona");
    
    //this.currentScene = this.navigationScene;

    //this.hud = new Hud();

    // In navigationScene or keep it here?
    this.industries = {};
    for (let i of Object.keys(industriesLocations)) {
      //this.industries[i] = new Industry();
    }

    this.cities = {};
    for (let [cityName, cityVal] of Object.entries(citiesData)) {
      this.cities[cityName] = new City(cityVal);
    }
  }

  initialize() {
    // Apply saveData
    this.playerTrain.initialize(this.saveData.PlayerTrain);
    this.enemyTrain.initialize(this.saveData.EnemyTrain);
    //this.currentScene = new CombatScene(this.playerTrain, this.enemyTrain);
    //this.currentScene = new CityTradeScene("Barcelona");
    //this.currentScene = new MapEditor();
    this.currentScene = this.navigationScene;
    this.currentScene.initialize();
  }

  update(){
    this.currentScene.update();    
    this.currentScene.show();    
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