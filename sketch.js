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

  setTemp(value) {
    this.isTemp = true;
    this.tempValue = value;
  }

  finalizeTemp(keepTemp) {
    if (keepTemp) {
      this.value = this.tempValue;
    } else {
      this.tempValue = null;
    }
    this.isTemp = false;
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

class ClueGroup {
  constructor(isVertical, coords, clues, theme) {
    this.isVertical = isVertical;
    this.clues = clues;
    this.theme = theme;
    this.length = clues.length;
    this.center = []

    let size = this.theme.cellSize
    this.startX = coords[0]
    this.startY = coords[1]
    this.sizeX = size
    this.sizeY = size
    if (this.isVertical){
      this.startY -= size * this.length
      this.sizeY *= this.length

      this.clues.forEach((clue, i) => {
        this.center.push([this.startX + this.sizeX * 0.5, (this.startY + (i + 0.5) * this.theme.cellSize)]) 
      });
    } else {
      this.startX -= size * this.length
      this.sizeX *= this.length
      this.clues.forEach((clue, i) => {
        this.center.push([(this.startX + (i + 0.5) * this.theme.cellSize), this.startY + this.sizeY * 0.5]) 
      });
    }

    this.startX += this.theme.clueGap
    this.startY += this.theme.clueGap
    this.sizeX -= 2 * this.theme.clueGap
    this.sizeY -= 2 * this.theme.clueGap
  }
  draw(){
    strokeWeight(0)
    fill(this.theme.clueColor)
    rect(this.startX, this.startY, this.sizeX, this.sizeY, this.theme.clueRound)

    textAlign(CENTER, CENTER); // Center alignment horizontally and vertically
    textSize(this.theme.clueFontSize); // Set the font size
    fill(this.theme.clueTextColor); // Set the text color
  
    for (let index = 0; index < this.clues.length; index++) {
      const textContent = this.clues[index];
      const [xText, yText] = this.center[index];
  
      // Draw the text at the calculated center position
      text(textContent, xText, yText);
    }
  
  }
}

class Board {
  constructor(clues, theme = new Theme()) {
    this.rows = clues.rows.length;
    this.columns = clues.columns.length;
    this.theme = theme.data;
    this.xStart = 10 + 3 * this.theme.cellSize;
    this.yStart = 10 + 3 * this.theme.cellSize;
    
    this.cellPositions = { rows: [], columns: [] };

    this.cellPositions.rows = Array.from({ length: this.rows }, (_, rowIndex) => {
      return this.xIndexToCoordinate(rowIndex);
    }
    );

    this.cellPositions.columns = Array.from({ length: this.columns }, (_, colIndex) => {
      return this.yIndexToCoordinate(colIndex);
    }
    );

    this.clues = []
    for (let columnI = 0; columnI < clues.columns.length; columnI++) {
      this.clues.push(
        new ClueGroup(
          true, 
          [this.xIndexToCoordinate(columnI), this.yStart - this.theme.outlineWideSize * 0.5 - this.theme.clueMargin], 
          clues.columns[columnI], 
          this.theme
        )
      )
    }

    for (let rowI = 0; rowI < clues.rows.length; rowI++) {
      this.clues.push(
        new ClueGroup(
          false, 
          [this.xStart - this.theme.outlineWideSize * 0.5 - this.theme.clueMargin, this.yIndexToCoordinate(rowI) ], 
          clues.rows[rowI], 
          this.theme
        )
      )
    }

    this.state = Array.from({ length: this.columns }, (_, colIndex) =>
      Array.from(
        { length: this.rows },
        (_, rowIndex) =>
          new Cell(
            this.xIndexToCoordinate(colIndex), // x position
            this.yIndexToCoordinate(rowIndex), // y position
            this.theme
          )
      )
    );
  }

  _indexToSingleCoordinate(startPos, index) {
    startPos += this.theme.outlineWideSize * 0.5;
    const thickLines = Math.floor(index / 5);
    const thinLines = index - thickLines;
    return (
      startPos +
      index * this.theme.cellSize +
      thinLines * this.theme.outlineSize +
      thickLines * this.theme.outlineWideSize
    );
  }

  xIndexToCoordinate(xIndex) {
    return this._indexToSingleCoordinate(this.xStart, xIndex);
  }

  yIndexToCoordinate(yIndex) {
    return this._indexToSingleCoordinate(this.yStart, yIndex);
  }


  indexToCoordinate(xIndex, yIndex) {
    return {
      x: this.xIndexToCoordinate(xIndex),
      y: this.yIndexToCoordinate(yIndex),
    };
  }


  coordinateToIndex(x, y) {
    let xIndex = null;
    let yIndex = null;

    for (let i = 0; i < this.cellPositions.columns.length; i++) {
      if (x < this.cellPositions.columns[i]) {
        return null;
      }
      if (x >= this.cellPositions.columns[i] && x <= this.cellPositions.columns[i] + this.theme.cellSize) {
        xIndex = i;
        break;
      }
    }
    for (let i = 0; i < this.cellPositions.rows.length; i++) {
      if (y < this.cellPositions.rows[i]) {
        return null;
      }
      if (y >= this.cellPositions.rows[i] && y <= this.cellPositions.rows[i] + this.theme.cellSize) {
        yIndex = i;
        break;
      }
    }
    if (xIndex == null || yIndex == null) {
      return null;
    }
    return { x: xIndex, y: yIndex };
  }

  handleMouseClick() {
    let index = this.coordinateToIndex(mouseX, mouseY);
    if (index != null) {
      let cell = this.getCell(index.x, index.y);
      if (mouseButton === LEFT) {
            cell.toggleCell();
            print("toggled cell");
          } else {
            print("toggled cross");
            cell.toggleCross();
          }
          cell.draw();
    }
    // let x = 0;
    // let y = 0;
    // let cell;
    // let success = false;

    // while (x < this.columns && y < this.rows) {
    //   cell = this.getCell(x, y);
    //   let dir = cell.cellDirection(mouseX, mouseY);
    //   let xDir = dir.xDir;
    //   let yDir = dir.yDir;
    //   if (xDir === -1 || yDir === -1) {
    //     break;
    //   }
    //   if (xDir === 0 && yDir === 0) {
    //     success = true;
    //     console.log("Clicked!", x + 1, y + 1);
    //     break;
    //   }

    //   x += xDir;
    //   y += yDir;
    // }
    // if (success === true) {
    //   if (mouseButton === LEFT) {
    //     cell.toggleCell();
    //   } else {
    //     cell.toggleCross();
    //   }
    //   cell.draw();
    // }
  }

  // Get the cell object at the specified coordinates
  getCell(x, y) {
    if (this.isValidCoordinate(x, y)) {
      return this.state[x][y];
    }
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }

  // Toggle a cell's value at specified coordinates
  toggleCell(x, y) {
    const cell = this.getCell(x, y);
    cell.toggleCell();
  }

  // Toggle a cell's cross state at specified coordinates
  toggleCross(x, y) {
    const cell = this.getCell(x, y);
    cell.toggleCross();
  }

  // Check if a coordinate is within bounds
  isValidCoordinate(x, y) {
    return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
  }

  // Get the linear index of a cell (useful for 1D storage)
  getIndex(x, y) {
    if (this.isValidCoordinate(x, y)) {
      return y * this.columns + x;
    }
    throw new Error(`Invalid coordinates: (${x}, ${y})`);
  }

  // Get the coordinates of a cell from a linear index
  getCoords(index) {
    if (index >= 0 && index < this.rows * this.columns) {
      const x = index % this.columns;
      const y = Math.floor(index / this.columns);
      return { x, y };
    }
    throw new Error(`Invalid index: ${index}`);
  }

  render() {
    // All thick lines
    background(this.theme.background);
    fill(this.theme.outlineWideColor);
    strokeWeight(0);
    let thickLineStartX = this.xStart - this.theme.outlineWideSize * 0.5;
    let thickLineStarty = this.yStart - this.theme.outlineWideSize * 0.5;
    let thickLineSizeY =
      this._indexToSingleCoordinate(0, this.rows - 1) +
      this.theme.cellSize +
      this.theme.outlineWideSize * 2;
    let thickLineSizeX =
      this._indexToSingleCoordinate(0, this.columns - 1) +
      this.theme.cellSize +
      this.theme.outlineWideSize * 2;
    rect(thickLineStartX, thickLineStarty, thickLineSizeX, thickLineSizeY);

    
    this.clues.forEach(clue => {
      clue.draw()
    });

    for (let y = 0; y < this.rows; y++) {
      let yPos = this.yIndexToCoordinate(y);
      for (let x = 0; x < this.columns; x++) {
        let xPos = this.xIndexToCoordinate(x);

        if (x % 5 == 0 && y % 5 == 0) {
          fill(this.theme.outlineColor);
          strokeWeight(0);
          const xLength =
            Math.min(5, this.columns - x) *
              (this.theme.outlineSize + this.theme.cellSize) -
            this.theme.outlineSize;
          const yLength =
            Math.min(5, this.rows - y) *
              (this.theme.outlineSize + this.theme.cellSize) -
            this.theme.outlineSize;

          rect(xPos, yPos, xLength, yLength);
        }

        let cell = this.getCell(x, y);
        cell.draw();

      }
    }
  }
}

let defaultTheme = {
  background: "#ffffff",
  cellBackground: "#f9f9f9",
  cellSize: 24,
  cellCrossSize: 13,
  cellCrossWidth: 1.5,
  cellCrossColor: "#666666",
  cellBackgroundFilled: "#450615",
  clueFontSize: 9,
  clueGap: 2,
  clueRound: 5,
  clueColor: "#F4F4FF",
  clueTextColor: "black",
  clueMargin: 3,
  outlineColor: "#888888",
  outlineWideColor: "#000000",
  outlineSize: 1,
  outlineWideSize: 2,
};

// let defaultTheme = {
//   background: "#222222", // Dark background
//   cellBackground: "#333333", // Slightly lighter dark for cells
//   cellSize: 24,
//   cellCrossSize: 13,
//   cellCrossWidth: 1.5,
//   cellCrossColor: "#AAAAAA", // Lighter gray for crosses
//   cellBackgroundFilled: "#440E2F", // Dark, rich color for filled cells
//   clueFontSize: 9,
//   clueGap: 2,
//   clueRound: 5,
//   clueColor: "#444444", // Muted dark color for clues
//   clueTextColor: "#FFFFFF", // White for text contrast
//   outlineColor: "#555555", // Subtle dark gray for outlines
//   outlineWideColor: "#FFFFFF", // White for wide outlines
//   outlineSize: 1,
//   outlineWideSize: 2,
// };
class Theme {
  constructor(data = {}) {
    // Start with a copy of the default theme
    this.data = { ...defaultTheme };

    // Override with user-provided data
    Object.assign(this.data, data);
  }

  // Method to update the theme
  setTheme(data) {
    Object.assign(this.data, data);
  }

  // Method to convert the theme object to JSON
  toJSON() {
    return { ...this.data };
  }

  // Method to update properties dynamically
  updateTheme(newData) {
    Object.assign(this.data, newData);
  }

  // Getter for theme properties
  get(key) {
    return this.data[key];
  }

  // Setter for theme properties
  set(key, value) {
    this.data[key] = value;
  }
}

let board;
function setup() {
  createCanvas(2000, 2000);
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  let clues = {
    rows: [
      [1, 1],    // Row 1
      [ 2],    // Row 2
      [1, 1],    // Row 3
      [ 1],    // Row 4
      [1, 1, 1], // Row 5
      [1, 1, 1], // Row 6
      [1, 1, 1], // Row 7
      [1, 1, 1], // Row 8
      [1, 1],    // Row 9
      [1, 1],    // Row 10
      [1, 1, 1, 1], // Row 11
      [1, 1, 1, 1], // Row 12
      [1, 1],    // Row 13
      [7]        // Row 14
    ],
    columns: [
      [2],       // Column 1
      [1, 1],    // Column 2
      [1, 1],    // Column 3
      [1, 1],    // Column 4
      [6],       // Column 5
      [1, 1],    // Column 6
      [2, 2],    // Column 7
      [2],       // Column 8
      [1, 1],    // Column 9
      [1, 1],    // Column 10
      [2],       // Column 11
      [2]        // Column 12
    ]
  };

  board = new Board(clues);
  board.render();

  console.log(board.state);
}

// ########### //
// ########### //
// messing with click and drag functions
let mouseInfo = {
  reset : function(){
    //set all properties to null
    for (let key in this){
      this[key] = null;
    }
  }
}
mouseInfo.reset();

function draw() {
  if (mouseInfo.currentPos != null) {

  }
  //background(220);
}

function mouseDragged() {
  mouseInfo.currentPos = [mouseX, mouseY]
}

function mousePressed() {
  let index = board.coordinateToIndex(mouseX, mouseY);
  if (index != null) {
    let cell = board.getCell(index.x, index.y);
    if (mouseButton === LEFT) {
      cell.setTemp(1);
    } else {
      cell.setTemp(-1);
    }
    cell.draw();
  }
  print(index)
  mouseInfo.mouseButton = mouseButton
  mouseInfo.initialPos = [mouseX, mouseY]
  mouseInfo.currentPos = [mouseX, mouseY]

}

function mouseReleased() {
  stroke('magenta');
  strokeWeight(5);

  line( mouseInfo.initialPos[0], mouseInfo.initialPos[1], mouseInfo.currentPos[0], mouseInfo.currentPos[1]);
  //mouseInfo.reset();
}

// function mousePressed() {
//   console.log("click!");
//   board.handleMouseClick(mouseButton);
// }
