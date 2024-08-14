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

class Train {
  constructor(owner) {
    this.fuel = 0;
    this.gold = 0;
    this.weight = 0;
    this.maxWeight = 1500;
    this.wagons = [];
    this.capacity = {
      "Coal": 0,
      "Iron": 0,
      "Copper": 0,
      "Oil": 0,
      "Livestock": 0,
      "Wood": 0,
      "Container": 0
    }

    this.contents = {};
  }

  initialize(saveData) {
    this.gold = saveData.gold;
    this.fuel = saveData.fuel;
    for (let wagonSaveData of saveData.wagons) {
      this.addWagon(wagonSaveData.name);
      if ("content" in wagonSaveData) {
        this.wagons.at(-1).setCargo(wagonSaveData.content.resourceName);
        this.wagons.at(-1).addResource(wagonSaveData.content.qty, 0);
      }
    }
  }

  buyResource(resourceName, qty, unitCost) {
    // adds the resource to the train. Returns true if possible and false if not possible
    if (unitCost*qty > this.gold) {
      return false;
    }

    if (resourceName in this.contents === false) {
      this.contents[resourceName] = 0;
    }

    // find a suitable wagon to store the resource
    let wagonName = Wagon.resourceToWagon[resourceName];

    for (let [i, wagon] of this.wagons.entries()) {
      if (wagon.name == wagonName) {
        if (wagon.usedSpace == 0) {
          wagon.setCargo(resourceName);
        }
        if (wagon.availableSpace >= qty) {
          wagon.addResource(qty, unitCost);
          this.contents[resourceName] += qty;
          wagon.purchasePrice = unitCost * qty;
          this.gold -= unitCost * qty;
          return true;
        } else {
          wagon.addResource(wagon.availableSpace, unitCost);
          this.contents[resourceName] += wagon.availableSpace;
          wagon.purchasePrice = unitCost * wagon.availableSpace;
          this.gold -= unitCost * wagon.availableSpace;
          qty -= wagon.availableSpace;
        }
      }
    }
    return false;    
  }

  // TODO: Wrong, we must pass a qty param
  sellResource(wagonId, qty, totalPrice) {
    this.wagons[wagonId].emptyWagon();
    this.gold += totalPrice;
  }

  
  sellResourceByName(resourceName, qty, totalPrice) {
    // Look for a wagon containing that resource
  }

  addWagon(wagonType) { 
    // TODO: wagon id, specify the initial load of the wagon 
    let newWagon;
    if (wagonType == "Locomotive") {
      newWagon = new LocomotiveWagon(1, wagonType, wagonsData[wagonType]);
    } else if (wagonType == "Cannon") {
      newWagon = new CannonWagon(1, wagonType, wagonsData[wagonType]);
    } else if (wagonType == "Cannon_vu") {
      newWagon = new CannonWagon(1, wagonType, wagonsData[wagonType]);
    } else if (wagonType == "Machinegun") {
      newWagon = new MachinegunWagon(1, wagonType, wagonsData[wagonType]);
    } else if (wagonType == "Machinegun_vu") {
      newWagon = new MachinegunWagon(1, wagonType, wagonsData[wagonType]);
    } else if (wagonType == "Barracks") {
      newWagon = new BarracksWagon(1, wagonType, wagonsData[wagonType]);
    } else if (wagonType == "Livestock") {
      newWagon = new LivestockWagon(1, wagonType, wagonsData[wagonType]);
    } else {
      newWagon = new Wagon(1, wagonType, wagonsData[wagonType]);
    }
    this.wagons.push(newWagon);
    
    // update train capacities
    this.weight += newWagon.weight;
    this.capacity[wagonType] += newWagon.capacity;
  } 

  removeWagon(idx) {
    this.weight -= this.wagons[idx].weight;
    this.wagons.splice(idx, 1);
  }
};