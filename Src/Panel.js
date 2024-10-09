class Panel {
  constructor(position, size) {
    this.elements = [];
    this.position = position;
    this.size = size;
    this.active = true;
  }

  addElement(element) {
    element.position.add(this.position)
    this.elements.push(element);
  }

  addElements(elements) {
    for (let element of elements) {
      this.addElement(element);
    }
  }

  onClick(mousePos) {
    let result = null;
    for (let element of this.elements) {
      if (element.constructor.name === "Button") {
        result = element.onClick(mousePos);
        if (result !== null) {
          return result;
        }
      }
    }
    return null;    
  }

  show() {
    if (this.active) {
      mainCanvas.fill(255,255,255,200)
      mainCanvas.rect(this.position.x, this.position.y, this.size.x, this.size.y)
      for (let element of this.elements) {
        element.show(mainCanvas);
      }
    }
  }
}