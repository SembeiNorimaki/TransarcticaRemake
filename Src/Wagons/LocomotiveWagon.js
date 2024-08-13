class LocomotiveWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
  }

  showWeightBar(cameraPos) {
    mainCanvas.push();
    mainCanvas.rect(this.position.x-this.halfSize.x-cameraPos.x, this.position.y+20,this.halfSize.x*2,5);
    //mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22, 100,100);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x-this.halfSize.x-cameraPos.x, this.position.y+20,
      game.playerTrain.weight * this.halfSize.x * 2 / game.playerTrain.maxWeight, 5);
    mainCanvas.pop(); 
  }

  showHorizontal(cameraPos) {
    super.showHorizontal(cameraPos);
    // this.showWeightBar(cameraPos);
  }
}