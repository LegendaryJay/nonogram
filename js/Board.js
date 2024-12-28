
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
      const isWithinBoard = xIndex.index >= 0 && xIndex.index < this.columns && yIndex.index >= 0 && yIndex.index < this.rows;
  
      return { x: xIndex.index, y: yIndex.index, isWithinCell, isWithinBoard };
    }
    
  
    // coordinateToIndex(x, y) {
    //   let xIndex = null;
    //   let yIndex = null;
  
    //   for (let i = 0; i < this.cellPositions.columns.length; i++) {
    //     if (x < this.cellPositions.columns[i]) {
    //       return null;
    //     }
    //     if (x >= this.cellPositions.columns[i] && x <= this.cellPositions.columns[i] + this.theme.cellSize) {
    //       xIndex = i;
    //       break;
    //     }
    //   }
    //   for (let i = 0; i < this.cellPositions.rows.length; i++) {
    //     if (y < this.cellPositions.rows[i]) {
    //       return null;
    //     }
    //     if (y >= this.cellPositions.rows[i] && y <= this.cellPositions.rows[i] + this.theme.cellSize) {
    //       yIndex = i;
    //       break;
    //     }
    //   }
    //   if (xIndex == null || yIndex == null) {
    //     return null;
    //   }
    //   return { x: xIndex, y: yIndex };
    // }
  
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
