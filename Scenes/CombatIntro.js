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

class CombatIntro {
  constructor(playerTrain) {
    // super(playerTrain, null);
    this.backgroundImg = this.generateCombatBackground();
    this.camera = new Camera(createVector(0,0));
    
    this.train1 = new Train(Game.Players.Cpu);
    this.train1.initialize(
      {wagons: [
        {"name": "Locomotive"},
        {"name": "Tender"}
      ]});
    this.train2 = new Train(Game.Players.Cpu);
    this.train2.initialize(
      {wagons: [
      {"name": "Locomotive_vu"},
      {"name": "Tender_vu"},
      {"name": "Livestock_vu"},
      {"name": "Livestock_vu"},
      {"name": "Barracks_vu"},
      {"name": "Cannon_vu"},
      {"name": "Livestock_vu"},
      {"name": "Livestock_vu"},
      {"name": "Barracks_vu"},     
      {"name": "Livestock_vu"}      
       
    ]});
    this.train3 = new Train(Game.Players.Cpu);
    this.train3.initialize(
      {wagons: [
        {"name": "Locomotive_vu"},
        {"name": "Tender_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Barracks_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Merchandise_vu"}        
      ]});
    this.train4 = new Train(Game.Players.Cpu);
    this.train4.initialize(  {wagons: [
      {"name": "Locomotive_vu"},
      {"name": "Tender_vu"},
      {"name": "Barracks_vu"},
      {"name": "Livestock_vu"},
      {"name": "Machinegun_vu"},
      {"name": "Livestock_vu"},
      {"name": "Livestock_vu"},
      {"name": "Merchandise_vu"},
      {"name": "Merchandise_vu"},
      {"name": "Merchandise_vu"},
      {"name": "Merchandise_vu"},

    ]});
    this.train5 = new Train(Game.Players.Cpu);
    this.train5.initialize(
      {wagons: [
        {"name": "Locomotive_vu"},
        {"name": "Tender_vu"},
        {"name": "Barracks_vu"},
        {"name": "Livestock_vu"},
        {"name": "Cannon_vu"}
      ]});
    this.train6 = new Train(Game.Players.Cpu);
    this.train6.initialize(
      {wagons: [
        {"name": "Locomotive_vu"},
        {"name": "Tender_vu"},
        {"name": "Barracks_vu"},
        {"name": "Cannon_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Livestock_vu"},
        {"name": "Livestock_vu"},
        {"name": "Merchandise_vu"},      
      ]});
    this.train7 = new Train(Game.Players.Cpu);
    this.train7.initialize(
      {wagons: [
        {"name": "Locomotive_vu"},
        {"name": "Tender_vu"},
        {"name": "Livestock_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Barracks_vu"},
        {"name": "Merchandise_vu"},
        {"name": "Livestock_vu"},
        {"name": "Livestock_vu"}      
      ]});

    this.trainH1 = new HorizontalTrain(Game.Players.Cpu);
    this.trainH2 = new HorizontalTrain(Game.Players.Cpu);
    this.trainH3 = new HorizontalTrain(Game.Players.Cpu);
    this.trainH4 = new HorizontalTrain(Game.Players.Cpu);
    this.trainH5 = new HorizontalTrain(Game.Players.Cpu);
    this.trainH6 = new HorizontalTrain(Game.Players.Cpu);
    this.trainH7 = new HorizontalTrain(Game.Players.Cpu);

    this.combatAI = new CombatAI();

    this.trainH1.setPosition(createVector(500,80));
    this.trainH2.setPosition(createVector(1200,80+32*4));
    // this.trainH3.setPosition(createVector(1500,80+32*8));
    this.trainH4.setPosition(createVector(1630,80+32*12));
    // this.trainH5.setPosition(createVector(1000,80+32*16));
    this.trainH6.setPosition(createVector(960,80+32*20));
    // this.trainH7.setPosition(createVector(1400,80+32*24));

    this.trainH1.update();
    this.trainH2.update();
    this.trainH3.update();
    this.trainH4.update();
    this.trainH5.update();
    this.trainH6.update();
    this.trainH7.update();

    this.playerSoldiers = [];
    this.enemySoldiers = [];

    this.playerSoldiers.push(new Rifleman(0, createVector(50,800), 0, Game.Players.Player));

    this.enemySoldiers.push(new Rifleman(0, createVector(1300,800), 0, Game.Players.Cpu));
    this.enemySoldiers.push(new Rifleman(0, createVector(500,500), 0, Game.Players.Cpu));
    this.enemySoldiers.push(new Rifleman(0, createVector(1200,300), 0, Game.Players.Cpu));
    this.enemySoldiers.push(new Rifleman(0, createVector(1000,100), 0, Game.Players.Cpu));
    this.enemySoldiers.push(new Rifleman(0, createVector(500,600), 0, Game.Players.Cpu));

    
    this.enemySoldiers[0].setRole({
      "role": "patrol",
      "waypoints": [
        createVector(1500,800),
        createVector(900,800),
      ]
    });

    this.enemySoldiers[1].setRole({
      "role": "patrol",
      "waypoints": [
        createVector(200,500),
        createVector(1300,500),
      ]
    });

    this.enemySoldiers[2].setRole({
      "role": "patrol",
      "waypoints": [
        createVector(200,300),
        createVector(1300,300),
      ]
    });

    this.enemySoldiers[3].setRole({
      "role": "patrol",
      "waypoints": [
        createVector(200,100),
        createVector(1300,100),
      ]
    });

    this.enemySoldiers[4].setRole({
      "role": "patrol",
      "waypoints": [        
        createVector(1300,600),
        createVector(200,600),
      ]
    });
  }

    
  initialize() {
    this.combatAI.initialize();
  }

  update() {
    
    
    // remove dead soldiers
    for (let i=0; i<this.playerSoldiers.length; i++) {
      if (this.playerSoldiers[i].dead) {
        this.playerSoldiers.splice(i, 1);
        i--;
      }
    }
    for (let i=0; i<this.enemySoldiers.length; i++) {
      if (this.enemySoldiers[i].dead) {
        this.enemySoldiers.splice(i, 1);
        i--;
      }
    }
  
    // check if enemy in range and engage
    for (let soldier of this.playerSoldiers) {
      for(let enemy of this.enemySoldiers) {
        if (soldier.inViewRange(enemy.position)) {
          soldier.setAction(Soldier.Action.Shoot);
          soldier.setTargetUnit(enemy);
        }
      }
      soldier.update();
    }




    for (let enemy of this.enemySoldiers) {
      enemy.update();
    }
   
  }

  generateCombatBackground() {
    let backgroundImg = createGraphics(mainCanvasDim[0], mainCanvasDim[1]);
    let x,y;
    for (let row=-1; row<14; row++) {
      y = row*tileHalfSizes.Z1.y*2;
      for (let col=0; col<15; col++) {
        x = col*tileHalfSizes.Z1.x*2;
        Tile.draw(backgroundImg, 0x01, createVector(x,y));
        Tile.draw(backgroundImg, 0x01, createVector(x-tileHalfSizes.Z1.x, y+tileHalfSizes.Z1.y));
      }
    }
    for (let i=-1;i<30;i++) {
      if (!(i%2)) {
        
        Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 2*tileHalfSizes.Z1.y));
        Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 6*tileHalfSizes.Z1.y));
        // Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 10*tileHalfSizes.Z1.y));
        Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 14*tileHalfSizes.Z1.y));
        // Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 18*tileHalfSizes.Z1.y));
        Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 22*tileHalfSizes.Z1.y));
        // Tile.draw(backgroundImg, 0x33, createVector(i*tileHalfSizes.Z1.x, 26*tileHalfSizes.Z1.y));
        
      }
      else {
        
        Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 3*tileHalfSizes.Z1.y));
        Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 7*tileHalfSizes.Z1.y));
        // Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 11*tileHalfSizes.Z1.y));
        Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 15*tileHalfSizes.Z1.y));
        // Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 19*tileHalfSizes.Z1.y));
        Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 23*tileHalfSizes.Z1.y));
        // Tile.draw(backgroundImg , 0x32, createVector(i*tileHalfSizes.Z1.x, 27*tileHalfSizes.Z1.y));
      }
    }
    
    return backgroundImg;
  }

  show() {
    mainCanvas.image(this.backgroundImg, 0, 0);
    
    this.trainH1.show(this.camera.position);
    this.trainH2.show(this.camera.position);
    this.trainH4.show(this.camera.position);
    this.trainH6.show(this.camera.position);
    
    for (let soldier of this.playerSoldiers) {
      soldier.show(this.camera.position);
    }
    for (let soldier of this.enemySoldiers) {
      soldier.show(this.camera.position);
    }
  }
}