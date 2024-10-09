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

class Industry {
  constructor(industryData) {
    this.name = industryData.name;
    this.industryType = industryData.industryType;
    this.tileHalfSize = tileHalfSizes.Z2;
    
    this.resources = {};
    this.resourceLocations = [
      createVector(12, 3),
      createVector(12, 1),
      createVector(12, -1),
      createVector(12, -3),
    ];
    this.resourceLocationIdx = 0;

    this.accepts = [];

    this.wagons = industryData.wagons;

    this.location = null;  // TODO: What is location?
    
    this.objectivesData = [];
    this.objectives = [];

    // this.resourceName = Object.keys(this.resources)[0];
    this.produces = industryData.produces;
    this.qty = industryData.qty;


    this.objectiveData = industryData.objectives;    
    if (Object.keys(industryData.objectives).length === 0) {
      this.objectiveData = null;
      this.objective = null;
    } else {
      this.objectiveData = industryData.objectives;    
      this.objective = new Objective(this.objectiveData);    
    }    

    this.buildings = [];
    this.buildings.push(new BuildingFH(this.buildings.length, this.industryType, createVector(11,5)));
    this.buildings.at(-1).setImage(industriesInfo[this.industryType].imgTrade, this.offsetTrade = industriesInfo[this.industryType].offsetTrade);

    this.imgTrade = industriesInfo[this.industryType].imgTrade;
    this.imgNav = industriesInfo[this.industryType].imgNav;

    this.offsetTrade = industriesInfo[this.industryType].offsetTrade;
    this.offsetNav = industriesInfo[this.industryType].offsetNav;

    this.panelInfo = {
      "title": this.name,
      "image": industriesInfo[this.industryType].imgInfo,
      "lines": [
        `Produces: ${this.resourceName}`, 
        "Requires: ", 
      ],
      "buttons": "Buy",
    }
    // let i = 2;
    // for (let [resourceName, requiredQty] of Object.entries(this.requires)) {
    //   this.panelInfo.lines[i] = `  - ${requiredQty} wagons of ${resourceName}`
    //   i++;
    // }


  }

  addNewResource(resourceData) {
    this.resources[resourceData.Name] = new Resource(resourceData.Name, resourceData);
    if (this.resources[resourceData.Name].isBuyable) {
      // Assign the resource a position
      this.resources[resourceData.Name].setPosition(Geometry.boardToScreen(this.resourceLocations[this.resourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
      this.resourceLocationIdx++;
      console.log(this.resourceLocationIdx)
    }

    
    for (let [dummy, resourceData] of Object.entries(this.produces)) {
      for (let [requiredResourceName, requiredResourceQty] of Object.entries(resourceData.require)) {
        this.accepts.push(requiredResourceName);
      }
    }
      
    
  }
  editResource(resourceData) {
    if (resourceData.Name in this.resources) {
      this.resources[resourceData.Name].update(resourceData);
    } else {
      this.addNewResource(resourceData);
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

  onClick() {

  }
}