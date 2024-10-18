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

class Objective {
  constructor(data) {
    this.title = data.title;
    this.summary = data.summary;
    this.completed = data.completed;
    this.resources = data.resources;
  }

  generateConversationPanelData() {
    return {
      "characterName": "Trader",
      "textLines": this.summary,
      "buttons": {
        "Accept": {id: "Accept", "text": "Accept", "row": 0, "color": "green"},
        "Reject": {id: "Reject", "text": "Reject", "row": 1, "color": "red"},
      }
    }
  }
  checkCompleted() {
    for (let [resource, val] of Object.entries(this.resources)) {
      if (!val.completed) {
        return false;
      }
    }
    this.completed = true;
    console.log("Objective completed");
    return true;
  }
  updateResource(resourceName, resourceQty) {
    if (resourceName in this.resources) {
      this.resources[resourceName].delivered += resourceQty;
      if (this.resources[resourceName].delivered >= this.resources[resourceName].needed) {
        this.resources[resourceName].delivered = this.resources[resourceName].needed;
        this.resources[resourceName].completed = true;
        this.checkCompleted();
      }
    }
  }
}