class Bullet {
  constructor(ori, dst, speed, strength) {
    this.position = ori.copy();
    this.dst = dst;
    this.distance = ori.dist(this.dst);
    this.speed = 0.2;
    this.strength = strength;
    this.delta = p5.Vector.sub(this.dst, ori).normalize().mult(this.speed);
    
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
    let screenPos = Geometry.boardToScreen(p5.Vector.add(this.position, this.verticalPosition), cameraPosition, tileHalfSizes.Z1);
    mainCanvas.circle(screenPos.x, screenPos.y, 5);
    mainCanvas.pop();
  }
}


class BallisticBullet extends Bullet {
  constructor(ori, dst, speed, strength) {
    super(ori, dst, speed, strength);
    this.verticalSpeed = createVector(this.speed, this.speed);
    this.verticalPosition = createVector(0, 0);
    // We want artillery to always launch at 45 degrees and the bullet speed to be always the same.
    // So it's gravity the one that changes according to the target distance
    this.gravity = -0.08 / this.distance;
  }

  update() {
    this.position.add(this.delta);
    this.verticalPosition.add(this.verticalSpeed);
    this.verticalSpeed.add(this.gravity, this.gravity)

    
    if(this.verticalPosition.x <= 0 || this.verticalPosition.y <= 0) {
      this.finished = true; 
    }
  }

  show(cameraPosition) {
    mainCanvas.push();
    mainCanvas.fill("black")
    // Sub because in the screen UP is negative
    let screenPos = Geometry.boardToScreen(p5.Vector.sub(this.position, this.verticalPosition), cameraPosition, tileHalfSizes.Z1);
    mainCanvas.circle(screenPos.x, screenPos.y, 5);
    mainCanvas.pop();
  }

}