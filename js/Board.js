class Board {
  constructor(clues, theme = new Theme()) {
    this.rows = clues.rows.length;
    this.columns = clues.columns.length;
    this.theme = theme.data;

    this.clueWidth = clues.rows.reduce((acc, clue) => Math.max(acc, clue.length), 0);
    this.clueHeight = clues.columns.reduce((acc, clue) => Math.max(acc, clue.length), 0);

    let startOffset = this.theme.clueBoardMargin + this.theme.clueMargin;

    this.xStart = this.clueWidth * this.theme.cellSize + startOffset;
    this.yStart = this.clueHeight * this.theme.cellSize + startOffset;
    this.clues = [];
  
    this.createClueGroup = function(isVertical, index, clues) {
      let coord;
      if (isVertical) {
        let constCoord = this.yStart - this.theme.clueBoardMargin
        let variableCoord = this.xIndexToCoordinate(index) 
        coord = [variableCoord, constCoord];
      } else {
        let constCoord = this.xStart - this.theme.clueBoardMargin
        let variableCoord = this.yIndexToCoordinate(index) 
        coord = [constCoord, variableCoord];
      }

      this.clues.push(
        new ClueGroup(
          isVertical,
          coord,
          clues,
          this.theme
        )
      );

    }

    clues.columns.forEach((clue, index) => {
      let isVertical = true;
      this.createClueGroup(isVertical, index, clue);
    });

    clues.rows.forEach((clue, index) => {
      let isVertical = false;
      this.createClueGroup(isVertical, index, clue);
    });


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

  _singleCoordinateToIndex(startPos, coordinate) {
    startPos += this.theme.outlineWideSize * 0.5; // Adjust start position like in _indexToSingleCoordinate

    const { cellSize, outlineSize, outlineWideSize } = this.theme;

    // Calculate the distance from startPos to the coordinate
    const distance = coordinate - startPos;

    if (distance < 0) {
      return { index: -1, isWithinCell: false };
    }

    // Calculate the number of thick lines (every 5 cells) and thin lines
    const combinedCellSize = cellSize + outlineSize; // Standard size of a cell plus a thin line
    const thickBlockSize = combinedCellSize * 5 + outlineWideSize; // Size of 5 cells with 4 thin lines and a thick line

    // Find the thick block and adjust for negative coordinates
    let thickBlockIndex = Math.floor(distance / thickBlockSize);
    let remainingDistance = distance % thickBlockSize;

    if (remainingDistance < 0) {
      thickBlockIndex -= 1;
      remainingDistance += thickBlockSize;
    }

    // Calculate the thin line index within the block
    let thinLines = Math.floor(remainingDistance / combinedCellSize);
    let offset = remainingDistance - thinLines * combinedCellSize;

    if (offset >= cellSize) {
      thinLines += 1; // Move to the next thin line if offset exceeds cell size
    }

    const index = thickBlockIndex * 5 + thinLines;

    // Calculate the actual start and end of the cell for this index
    const thickLines = Math.floor(index / 5);
    const thinLinesWithinIndex = index - thickLines;

    const cellStart =
      startPos +
      index * cellSize +
      thinLinesWithinIndex * outlineSize +
      thickLines * outlineWideSize;
    const cellEnd = cellStart + cellSize;

    // Check if the coordinate is within the cell
    const isWithinCell = coordinate >= cellStart && coordinate < cellEnd;

    return { index, isWithinCell };
  }
  coordinateToIndex(x, y) {
    const xIndex = this._singleCoordinateToIndex(this.xStart, x);
    const yIndex = this._singleCoordinateToIndex(this.yStart, y);

    const isWithinCell = xIndex.isWithinCell && yIndex.isWithinCell;
    const isWithinBoard =
      xIndex.index >= 0 &&
      xIndex.index < this.columns &&
      yIndex.index >= 0 &&
      yIndex.index < this.rows;

    return { x: xIndex.index, y: yIndex.index, isWithinCell, isWithinBoard };
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
      this.theme.outlineWideSize * 1.5;
    let thickLineSizeX =
      this._indexToSingleCoordinate(0, this.columns - 1) +
      this.theme.cellSize +
      this.theme.outlineWideSize * 1.5;
    rect(thickLineStartX, thickLineStarty, thickLineSizeX, thickLineSizeY);

    this.clues.forEach((clue) => {
      clue.draw();
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
