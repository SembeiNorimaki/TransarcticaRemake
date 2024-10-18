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
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(13,3)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(13,0)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(13,-3)));

    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,3)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,0)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(10,-3)));    

    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,3)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,0)));
    this.buildings.push(new BuildingFH(this.buildings.length, "House2", createVector(7,-3)));    

    this.resources = {};   //  {resourceName: resourceInstance}
    this.resourceLocations = [
      createVector(15,  3),
      createVector(15,  1),
      createVector(15, -1),
      createVector(15, -3),

      createVector(16,  2),
      createVector(16,  0),
      createVector(16, -2),
      
      createVector(17,  3),
      createVector(17,  1),
      createVector(17, -1),
      createVector(17, -3),

      createVector(18,  2),
      createVector(18,  0),
      createVector(18, -2),
      
    ];

    this.resourceLocationIdx = 0;

  }  

  addNewResource(resourceData) {
    this.resources[resourceData.Name] = new Resource(resourceData.Name, resourceData);
    if (resourceData.InputOrOutput == "Output" && resourceData.Sell > 0) {
      console.log(this.resourceLocationIdx)
      this.resources[resourceData.Name].setPosition(Geometry.boardToScreen(this.resourceLocations[this.resourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
      this.resourceLocationIdx++;
    } else if (resourceData.InputOrOutput == "Input") {
      this.resources[resourceData.Name].setPosition(Geometry.boardToScreen(this.inputResourceLocations[this.inputResourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
      this.inputResourceLocationIdx++;
    } else {
      this.resources[resourceData.Name].setPosition(createVector(5000,5000));
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
      resourceData.InputOrOutput = "Output";
      resourceData.ManufacturedOrSold = "Sold";
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
