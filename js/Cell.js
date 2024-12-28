class Cell {
    constructor(xPos, yPos, theme) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.theme = theme;
      this.value = 0; // 0: empty, 1: filled, -1: crossed
      this.isTemp = false;
      this.tempValue = null;
    }
  
    // Toggle the cell between 0 (empty) and 1 (filled)
    setCell(value) {
        this.isTemp = false;
        this.tempValue = null;
        this.value = value;
    }
  
    toggle(isCross) {
      if (isCross) {
        this.toggleCross();
      } else {
        this.toggleCell();
      }
    }
    toggleCell() {
      this.value = this.value === 0 ? 1 : 0;
    }
  
    // Toggle the cell between 0 (empty) and -1 (crossed)
    toggleCross() {
      this.value = this.value !== -1 ? -1 : 0;
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
      let drawValue = this.isTemp ? this.tempValue : this.value; 
      strokeWeight(0);
      let fillColor =
        drawValue === 1
          ? this.theme.cellBackgroundFilled
          : this.theme.cellBackground;
      fill(fillColor);
      rect(this.xPos, this.yPos, this.theme.cellSize, this.theme.cellSize);
  
      if (drawValue < 0) {
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
