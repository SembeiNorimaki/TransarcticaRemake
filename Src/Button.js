class Button {
  constructor(id, position, halfSize, text=null, color=null, image=null) {
    this.id = id;
    this.position = position;
    this.halfSize = halfSize;
    this.text = text;
    this.color = color;
    this.image = image;
  }

  onClick(mousePos) {
    if (
      mousePos.x > this.position.x - this.halfSize.x &&
      mousePos.x < this.position.x + this.halfSize.x &&
      mousePos.y > this.position.y - this.halfSize.y &&
      mousePos.y < this.position.y + this.halfSize.y
    ) {
      return this.id;
    } else {
      return null;
    }
  }

  show(canvas) {
    canvas.push();
    
    if (this.color !== null) {
      canvas.fill(this.color);
    }
    canvas.rect(this.position.x - this.halfSize.x, this.position.y - this.halfSize.y, 2*this.halfSize.x, 2*this.halfSize.y);
    if (this.text !== null) {
      canvas.textAlign(CENTER, CENTER);
      canvas.textSize(32);
      canvas.text(this.text, this.position.x, this.position.y);
    }
    
    canvas.pop();
  }
}