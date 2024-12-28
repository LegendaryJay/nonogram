class Cell {
  constructor(xPos, yPos, theme) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.theme = theme;
    this.value = 0; // 0: empty, 1: filled, -1: crossed
    this.needsUpdate = true;
  }

  // Toggle the cell between 0 (empty) and 1 (filled)
  setCell(value) {
    if (value !== this.value){
        this.needsUpdate = true;
        this.value = value;
    }
  }

  toggle(isCross) {
    if (isCross) {
        this.setCell(this.value !== -1 ? -1 : 0)
    } else {
        this.setCell(this.value === 0 ? 1 : 0)
    }
  }

  isInCell(x, y) {
    return (
      x >= this.xPos &&
      x <= this.xPos + this.theme.cellSize &&
      y >= this.yPos &&
      y <= this.yPos + this.theme.cellSize
    );
  }

  draw() {
    if (this.needsUpdate == false) return;
    this.needsUpdate = false;
    strokeWeight(0);
    let fillColor =
      this.value === 1
        ? this.theme.cellBackgroundFilled
        : this.theme.cellBackground;
    fill(fillColor);
    rect(this.xPos, this.yPos, this.theme.cellSize, this.theme.cellSize);

    if (this.value < 0) {
      let xMiddle = this.xPos + this.theme.cellSize * 0.5;
      let yMiddle = this.yPos + this.theme.cellSize * 0.5;
      let length = this.theme.cellCrossSize * 0.5;
      strokeWeight(this.theme.cellCrossWidth);
      stroke(this.theme.cellCrossColor);
      line(
        xMiddle - length,
        yMiddle - length,
        xMiddle + length,
        yMiddle + length
      );
      line(
        xMiddle + length,
        yMiddle - length,
        xMiddle - length,
        yMiddle + length
      );
    }
  }
}
