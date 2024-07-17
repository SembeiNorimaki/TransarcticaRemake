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

class HorizontalTrainAI {
  constructor(ownerInstance) {
    this.ownerInstance = ownerInstance;
    this.cannonLocations = ownerInstance.findWagonIdxByName("CannonWagon");
    this.machinegunLocations = ownerInstance.findWagonIdxByName("MachinegunWagon");
    this.livestockLocations = ownerInstance.findWagonIdxByName("LivestockWagon");
    this.barracksLocations = ownerInstance.findWagonIdxByName("BarracksWagon");
  }

  requestOrders() {
    // check if cannon is ready to fire

  }
}