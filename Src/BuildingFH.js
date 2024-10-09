class BuildingFH {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
    console.log(name)
    this.img = gameData.buildingsFHData[this.name].img;
    this.halfSize = createVector(this.img.width/2, this.img.height/2);
    this.offset = gameData.buildingsFHData[this.name].offset;
    this.hasQuest = true;
  }


  generateConversationPanelData() {
    
  }

  generatePanelInfoData() {
    let data = {
      "title": this.name,
      "image": this.img,
      "lines": [
      ],
      "buttons": ""
    };

    if (this.name == "Factory") {
      data.buttons = ["Tank", "Artillery"];
    } else {
      data.buttons = ["Wagon1", "Wagon2"];
    }
    return data;
  }

  setImage(img, offset) {
    this.img = img;
    this.halfSize = createVector(this.img.width/2, this.img.height/2);
    this.offset = offset;
  }

  setPosition(position) {
    this.position.set(position.x, position.y);
  }

  showBoundingBox(canvas, cameraPosition) {
    canvas.noFill();
    let screenPos = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    canvas.rect(screenPos.x-this.img.width/2, screenPos.y-this.img.height, this.img.width, this.img.height)
  }

  checkClick(mousePos, cameraPosition) {
    let screenPosition = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    return (
      mousePos.x > screenPosition.x - this.halfSize.x &&
      mousePos.x < screenPosition.x + this.halfSize.x &&
      mousePos.y > screenPosition.y - 2*this.halfSize.y &&
      mousePos.y < screenPosition.y
    );
  }
  
  show(canvas, cameraPosition) {
    let screenPos = Geometry.boardToScreen(this.position, cameraPosition, game.currentScene.tileHalfSize);
    canvas.image(this.img, screenPos.x-this.offset[0], screenPos.y-this.offset[1], this.img.width, this.img.height);
    if (this.hasQuest) {
      canvas.image(questImage, screenPos.x-7, screenPos.y-this.halfSize.y*2.7);
    }
    canvas.circle(screenPos.x, screenPos.y, 10)
    this.showBoundingBox(canvas, cameraPosition);
  }
}

class Factory extends BuildingFH {
  constructor(id, name, position) {
    super(id, name, position);
    this.unitList = ["Tank", "Tank", "Artillery"]
  }

  generatePanelData() {
    let elements = [
      new Button(null, true, createVector(125,100), createVector(125,100), null, null, gameData.buildingsFHData.Factory.img),
      new Text("Factory", createVector(400,50))
    ];

    for (let [i, unitName] of this.unitList.entries()) {
      elements.push(new Button(`Build_${unitName}`, true, createVector(400+100*i,100), createVector(50,30), null, (0,0,0,200), gameData.unitsData[unitName].Human.idle[270][0]));
      elements.push(new Text(unitName, createVector(400+100*i,150)));
    }

    // new Button("Build_Artillery", true, createVector(400,100), createVector(50,30), null, (0,0,0,200), gameData.unitsData["Artillery"].Human.idle[270][0]),
    //   new Text("Artillery", createVector(100,150)),
    //   new Button("Build_Tank", true, createVector(500,100), createVector(50,30), null, (0,0,0,200), gameData.unitsData["Tank"].Human.idle[270][0]),
    //   new Text("Tank", createVector(200,150)),

    return elements;
    
  }
}

class Bay extends BuildingFH {
  constructor(id, name, position) {
    super(id, name, position);
    this.wagonList = ["Tender", "Merchandise", "Crane", "Livestock", "Prison", "Cannon", "Machinegun", "Harpoon", "Command"]
  }

  generatePanelData() {
    let elements = [
      new Button(null, true, createVector(150,100), createVector(150,100), null, null, gameData.buildingsFHData.ConstructionBay.img),
      // new Text("ConstructionBay", createVector(400,50))
    ];

    let x = 400;
    let y = 50; 
    for (let [i, wagonName] of this.wagonList.entries()) {
      elements.push(new Button(`BuildWagon_${wagonName}`, true, createVector(x,y), createVector(90,30), null, (255,255,255,200), wagonsData[wagonName].img[0]));
      elements.push(new Text(wagonName, createVector(x,y+50)));
      x += 200;
      if (x >= 1800) {
        y += 100;
        x = 400;
      }
    }
    return elements;
    
  }
}

// class ClayMine extends BuildingFH