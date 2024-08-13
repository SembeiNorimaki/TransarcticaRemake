class Button {
  constructor(id, active, position, halfSize, text=null, color=null, image=null) {
    this.id = id;
    this.position = position;
    this.halfSize = halfSize;
    this.text = text;
    this.color = color;
    this.image = image;
    this.active = active;
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
    if (!this.active) {
      return;
    }
    canvas.push();    
    if (this.image !== null) {
      canvas.image(this.image, this.position.x, this.position.y)
    } else {
      if (this.color !== null) {
        canvas.fill(this.color);
      }
      canvas.rect(this.position.x - this.halfSize.x, this.position.y - this.halfSize.y, 2*this.halfSize.x, 2*this.halfSize.y);
    
    }

    if (this.text !== null) {
      canvas.fill(0);
      canvas.textAlign(CENTER, CENTER);
      canvas.textSize(32);
      canvas.text(this.text, this.position.x, this.position.y);
    }  
    
    canvas.pop();
  }
}