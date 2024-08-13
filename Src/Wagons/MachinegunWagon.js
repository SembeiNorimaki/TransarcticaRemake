class MachinegunWagon extends Wagon {
  constructor(id, name, wagonData) {
    super(id, name, wagonData);
    this.reloadTime = 50;
    this.reloadCount = this.reloadTime;
  }

  isReadyToFire() {
    return (this.reloadCount == 0);
  }

  update() {
    if (this.reloadCount > 0) {
      this.reloadCount--;
    }
  }

  fire() {
    if (this.isReadyToFire()) {
      this.reloadCount = this.reloadTime;
      let spawnPosition = createVector(this.position.x + this.halfSize.x, this.position.y-40); 
      game.currentScene.machinegunbullets = new MachinegunBullets(spawnPosition);
    }
  }

  showReloadBar(cameraPos) {
    mainCanvas.push();
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,this.halfSize.x*2,5);
    mainCanvas.fill("green");
    mainCanvas.rect(this.position.x-cameraPos.x, this.position.y+22,
      this.reloadCount*this.halfSize.x*2/this.reloadTime,5);
    mainCanvas.pop(); 
  }

}