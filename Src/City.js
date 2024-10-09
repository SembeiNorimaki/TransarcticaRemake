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
    this.position = null;

    this.tileHalfSize = tileHalfSizes.Z2;

    this.name = cityData.name;
    // this.resources = cityData.resources;
    this.wagons = cityData.wagons;
    this.location = null;
    this.objectivesData = [];
    this.objectives = [];

    for (let [i, objectiveData] of cityData.objectives.entries()) {
      this.objectivesData.push(objectiveData);    
      this.objectives.push(new Objective(objectiveData));
    }  

    this.buildings = [];
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,5)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,2)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,-1)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,5)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,2)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,-1)));    

    this.resources = {};   //  {resourceName: resourceInstance}
    this.resourceLocations = [
      createVector(12, 3),
      createVector(12, 1),
      createVector(12, -1),
      createVector(12, -3),
      createVector(12, -5),
      createVector(12, -7),
      createVector(12, -9),
      createVector(12, -11),
      createVector(12, -13),
      createVector(12, -15),
      createVector(12, -17),
      createVector(12, -19),
      createVector(12, -21),
      createVector(12, -23),
      createVector(12, -25),
    ];

    this.resourceLocationIdx = 0;

  }  

  addNewResource(resourceData) {
    this.resources[resourceData.Name] = new Resource(resourceData.Name, resourceData);
    if (this.resources[resourceData.Name].isBuyable) {
      // Assign the resource a position
      this.resources[resourceData.Name].setPosition(Geometry.boardToScreen(this.resourceLocations[this.resourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
      this.resourceLocationIdx++;
    }
  }
  editResource(resourceData) {
    if (resourceData.Name in this.resources) {
      this.resources[resourceData.Name].update(resourceData);
    } else {
      addNewResource(resourceData);
    }
  }
  addQtyToResource(resourceName, qty) {
    this.resources[resourceName].qtyAvailable += qty;
  }

  initialize(savedData) {
    for (let [resourceName, resourceData] of Object.entries(savedData.resources)) {
      resourceData.Name = resourceName;
      this.addNewResource(resourceData);
    }
  }

  setNavigationBuilding(navigationBuilding) {
    this.navigationBuilding = navigationBuilding;
  }

  setPosition(position) {
    this.position = position;
  }
}
