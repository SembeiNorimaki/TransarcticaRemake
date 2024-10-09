class Text {
  constructor(text, position) {
    this.text = text;
    this.position = position;
  }

  show(canvas) {
    canvas.fill(0);
    canvas.textAlign(CENTER);
    canvas.textSize(24);
    canvas.text(this.text, this.position.x, this.position.y)
  }
  text
}