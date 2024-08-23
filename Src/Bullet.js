class Bullet {
  constructor(ori, dst, speed, strength) {
    this.position = ori.copy();
    this.dst = dst;
    this.speed = speed;
    this.strength = strength;
    this.delta = p5.Vector.sub(dst, ori).normalize().mult(speed);
    this.finished = false;
  }

  move(delta) {
    this.position.add(delta);
  }

  update() {
    this.move(this.delta);
    if(p5.Vector.sub(this.position, this.dst).mag() < 0.5) {
      this.delta = createVector(0,0);
      this.finished = true; 
    }
  }

  show(cameraPosition) {
    mainCanvas.push();
    mainCanvas.fill("red")
    let screenPos = boardToScreen(this.position, cameraPosition);
    mainCanvas.circle(screenPos.x, screenPos.y, 10);
    mainCanvas.pop();
  }
}