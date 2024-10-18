class RayCast {
  constructor(ori, dst) {
    this.setOriginDestination(ori, dst);
    this.points = [];
  }

  setOriginDestination(ori, dst) {
    this.ori = ori;
    this.dst = dst;
    this.delta = p5.Vector.sub(this.dst, this.ori).normalize().mult(1);
  }
  
  compute() {
    let currentPos = this.ori.copy();
    let currentTilePos;
    for (let i=0; i<40; i++) {
      currentPos.add(this.delta);
      currentTilePos = createVector(round(currentPos.x), round(currentPos.y));
      if (game.currentScene.base.tileBoard.board[currentTilePos.y][currentTilePos.x].isWall()) {
        break;
      }
      this.points.push(currentPos.copy());
    }
  }

  show(cameraPos) {
    for (let pt of this.points) {
      let screenPos = Geometry.boardToScreen(pt, cameraPos, game.currentScene.tileHalfSize);
      mainCanvas.circle(screenPos.x, screenPos.y, 5);
    }
  }

}