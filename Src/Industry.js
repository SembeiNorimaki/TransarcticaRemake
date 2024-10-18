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

  static Data = {};  // Basically contains name, imgs and imgOffsets

  static initialize(data) {
    for (let [industryName, industryData] of Object.entries(data)) {
      Industry.Data[industryName] = industryData;
    }
  }

  // industryData contains:
  // name, industryType, produces, requires, resources, wagons
  constructor(industryData) {
    this.name = industryData.name;
    this.industryType = industryData.industryType;
    this.tileHalfSize = tileHalfSizes.Z2;
    
    this.resources = {};
    
    this.inputResourceLocations = [
      createVector(12, 5),
      createVector(10, 5),
      createVector(8, 5),
      createVector(6, 5),
    ];

    this.resourceLocations = [
      createVector(15, 3),
      createVector(15, 1),
      createVector(15, -1),
      createVector(15, -3),
    ];


    this.resourceLocationIdx = 0;
    this.inputResourceLocationIdx = 0;

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
    this.buildings.push(new BuildingFH(this.buildings.length, this.industryType, createVector(13,3)));   // was 11,5
    
    //this.buildings.at(-1).setImage(Industry.Data[this.industryType].imgTrade);

    this.imgTrade = Industry.Data[this.industryType].imgTrade;
    this.imgNav = Industry.Data[this.industryType].imgNav;

    this.offsetTrade = Industry.Data[this.industryType].offsetTrade;
    this.offsetNav = Industry.Data[this.industryType].offsetNav;

    this.panelInfo = {
      "title": this.name,
      "image": Industry.Data[this.industryType].imgInfo,
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
    if (resourceData.InputOrOutput == "Output") {
      this.resources[resourceData.Name].setPosition(Geometry.boardToScreen(this.resourceLocations[this.resourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
      this.resourceLocationIdx++;
    } else if (resourceData.InputOrOutput == "Input") {
      this.resources[resourceData.Name].setPosition(Geometry.boardToScreen(this.inputResourceLocations[this.inputResourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
      this.inputResourceLocationIdx++;
    } else {
      this.resources[resourceData.Name].setPosition(createVector(5000,5000));
    }

    
    for (let [dummy, resourceData] of Object.entries(this.produces)) {
      for (let [requiredResourceName, requiredResourceQty] of Object.entries(resourceData.require)) {
        if (requiredResourceName in this.resources) {
          continue;
        }
        let resourceData = {
          "Name": requiredResourceName,
          "Available": 0,
          "Production": 0,
          "InputOrOutput": "Input",
          "ManufacturedOrSold": "Manufactured",
          "Buy": 0,
          "Sell": 0
        }

        this.resources[requiredResourceName] = new Resource(requiredResourceName, resourceData);
        this.resources[requiredResourceName].setPosition(Geometry.boardToScreen(this.inputResourceLocations[this.inputResourceLocationIdx], createVector(mainCanvasDim[0]/2, mainCanvasDim[1]/2), this.tileHalfSize));
        this.inputResourceLocationIdx++;

        // this.accepts.push(requiredResourceName);
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
      resourceData.InputOrOutput = "Output";
      resourceData.ManufacturedOrSold = "Manufactured";
      this.addNewResource(resourceData);
    }
  }

  onClick() {

  }
}