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

class City {
  constructor(cityData) {
    this.building = null;
    this.position = null;

    this.name = cityData.name;
    this.resources = cityData.resources;
    this.wagons = cityData.wagons;
    this.location = null;
    this.objectiveData = cityData.objectives;    
    if (Object.keys(cityData.objectives).length === 0) {
      this.objectiveData = null;
      this.objective = null;
    } else {
      this.objectiveData = cityData.objectives;    
      this.objective = new Objective(this.objectiveData);    
    }    

    this.buildings = [];
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,5)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,2)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,-1)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,5)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,2)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,-1)));    

  }  

  initialize(savedData) {
    for (let [resourceName, resourceInfo] of Object.entries(savedData.resources)) {
      this.resources[resourceName].Available = resourceInfo.Available;
    }
  }

  setNavigationBuilding(navigationBuilding) {
    this.navigationBuilding = navigationBuilding;
  }

  setPosition(position) {
    this.position = position;
  }
}
