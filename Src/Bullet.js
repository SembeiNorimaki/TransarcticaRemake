class Bullet {
  constructor(ori, dst, speed, strength) {
    this.position = ori.copy();
    this.dst = dst;
    this.distance = ori.dist(this.dst);
    this.speed = 0.2;
    this.strength = strength;
    this.delta = p5.Vector.sub(this.dst, ori).normalize().mult(this.speed);
    this.deltaY = 0.08 / this.distance;
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
    mainCanvas.fill("black")
    let screenPos = boardToScreen(p5.Vector.add(this.position, this.verticalPosition), cameraPosition);
    mainCanvas.circle(screenPos.x, screenPos.y, 5);
    mainCanvas.pop();
  }
}


class BallisticBullet extends Bullet {
  constructor(ori, dst, speed, strength) {
    super(ori, dst, speed, strength);
    this.verticalSpeed = createVector(-this.speed, -this.speed);
    this.verticalPosition = createVector(0, 0);
  }

  move() {
    this.position.add(this.delta);
    this.verticalPosition.add(this.verticalSpeed);
    this.verticalSpeed.add(this.deltaY, this.deltaY)
  }

  update() {
    this.move(this.delta);
    if(this.verticalPosition.x > 0 || this.verticalPosition.y > 0) {
      this.finished = true; 
    }
  }
  show(cameraPosition) {
    mainCanvas.push();
    mainCanvas.fill("black")
    let screenPos = boardToScreen(p5.Vector.add(this.position, this.verticalPosition), cameraPosition);
    mainCanvas.circle(screenPos.x, screenPos.y, 5);
    mainCanvas.pop();
  }

}