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
    this.coal = 0;
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
    this.owner = owner;
  }

  initialize(saveData) {
    this.gold = saveData.gold;
    this.coal = saveData.coal;
    
    for (let wagonSaveData of saveData.wagons) {
      this.addWagon(wagonSaveData.name);
      if ("content" in wagonSaveData) {
        let resourceName = wagonSaveData.content.resourceName;
        let qty = wagonSaveData.content.qty;
        this.wagons.at(-1).setCargo(resourceName);
        this.wagons.at(-1).addResource(qty, 0);
        if (resourceName in this.contents) {
          this.contents[resourceName] += qty;
        } else {
          this.contents[resourceName] = qty;
        }
      }
      if ("vehicles" in wagonSaveData) {
        for (let vehicleName of wagonSaveData.vehicles) {
          if (vehicleName == "Artillery") {
            this.wagons.at(-1).loadVehicle(new Artillery(vehicleName, null, Game.Players.Human));
          } else if (vehicleName == "Tank") {
            this.wagons.at(-1).loadVehicle(new Tank(vehicleName, null, Game.Players.Human));
          }
        }
      }
    }


    // let units = [];
    // units.push(new UnitFH("Tank", null, Game.Players.Human));
    // units.push(new UnitFH("Artillery", null, Game.Players.Human));
    // units.push(new UnitFH("Artillery", null, Game.Players.Human));
    // units.push(new UnitFH("Tank", null, Game.Players.Human));
    // units.push(new UnitFH("Tank", null, Game.Players.Human));

  }

  buyResource(resourceName, qty, unitCost) {
    // check if we have enough gold
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
          // Wagons that allow different cargos when empty can be repurposed
          wagon.setCargo(resourceName);
        }
        if (wagon.cargo != resourceName) {
          // A merchandise wagon might already contain another type of resource
          continue;
        }

        if (wagon.availableSpace >= qty) {
          // If the wagon has enough capacity to store all the qty then we are done
          wagon.addResource(qty, unitCost);
          this.contents[resourceName] += qty;
          this.gold -= unitCost * qty;
          return true;
        } else {
          // If there's not enough space to store all the qty, fill the wagon and continue iterating to find
          // a suitable wagon to store the remaider qty
          qty -= wagon.availableSpace;
          this.contents[resourceName] += wagon.availableSpace;
          this.gold -= unitCost * wagon.availableSpace;
          wagon.addResource(wagon.availableSpace, unitCost);          
        }
      }
    }
    return false;    
  }

  sellResource(wagonId, qty, unitPrice) {
    if (qty >= this.wagons[wagonId].usedSpace) {
      this.gold += this.wagons[wagonId].usedSpace * unitPrice;
      this.contents[this.wagons[wagonId].cargo] -= this.wagons[wagonId].usedSpace;
      this.wagons[wagonId].emptyWagon();      
    } else {
      this.gold += qty * unitPrice;
      this.contents[this.wagons[wagonId].cargo] -= qty;
      this.wagons[wagonId].removeResource(qty, unitPrice);
      
    }
  }

  
  sellResourceByName(resourceName, qty, unitPrice) {
    // Look for a wagon containing that resource
    for (let [wagonId, wagon] of this.wagons.entries()) {
      if (wagon.cargo === resourceName) {
        if (wagon.usedSpace >= qty) {
          this.sellResource(wagonId, qty, unitPrice);
          return true;
        } 
        else {
          qty -= wagon.usedSpace;
          this.sellResource(wagonId, wagon.usedSpace, unitPrice);
        }
      }
    }
    return false;
  }

  addWagon(wagonType) { 
    // TODO: wagon id, specify the initial load of the wagon 
    let newWagon;
    switch(wagonType) {
      case("Locomotive"):
        newWagon = new LocomotiveWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      case("Tender"):
        newWagon = new TenderWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      case("Cannon"):
      case("Cannon_vu"):
        newWagon = new CannonWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      case("Machinegun"):
      case("Machinegun_vu"):
        newWagon = new MachinegunWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      case("Barracks"):
        newWagon = new BarracksWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      case("Livestock"):
        newWagon = new LivestockWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      case("Vehicle Wagon"):
        newWagon = new VehicleWagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
      default:
        newWagon = new Wagon(this.wagons.length, wagonType, wagonsData[wagonType], this.owner);
      break;
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