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

class Unit {
  constructor(id, position, owner) {
    this.id = id;
    this.owner = owner;
    this.position = position.copy();
    if (this.owner == Game.Players.Human) {
      this.defaultOrientation = 90;
    } else {
      this.defaultOrientation = 270;
    }
    this.orientation = this.defaultOrientation;
    this.direction = createVector(0, 0);
    
    this.path = [];
    this.selected = false;
    this.dead = false;
  }
}
