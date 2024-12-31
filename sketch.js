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

  this.undoButton = createButton('⮪');
this.undoButton.position(20, 500);
this.redoButton = createButton('⮩');
this.redoButton.position(80, 500);
}


let dragManager = {
  isDragging: false,
  isCross: false,
  value: null,
  first: null,
  axis: null,
  x: null,
  y: null,
  reset: function(){
    this.isDragging = false;
    this.isCross = false;
    this.value = null;
    this.first = null;
    this.axis = null;
    this.x = null;
    this.y = null;
  },
  startDrag: function(){
    this.reset();
    let coords = board.coordinateToIndex(mouseX, mouseY);
    if (!coords.isWithinBoard || !coords.isWithinCell){
      return;
    }

    this.isDragging = true;
    this.x = coords.x;
    this.y = coords.y;
    this.first = [this.x, this.y];
    
    let cell = board.getCell(this.x, this.y);

    this.value = cell.value;
    this.isCross = mouseButton === RIGHT;
    cell.toggle(this.isCross);
    cell.draw();
  },
  drag: function(){
    if (!this.isDragging){
      return;
    }
    let coords = board.coordinateToIndex(mouseX, mouseY);
    this.x = coords.x;
    this.y = coords.y;

    if (this.axis == null){
      let xLength = Math.abs(this.first[0] - this.x);
      let yLength = Math.abs(this.first[1] - this.y);

      if (xLength > 1 || yLength > 1){
        this.axis = xLength > yLength ? "x" : "y";
      }
    }  

    this.x = Math.max( Math.min(this.x, board.columns - 1), 0);
    this.y = Math.max( Math.min(this.y, board.rows - 1), 0);

    if (this.axis == "x"){
      let minX = Math.min(this.first[0], this.x);
      let maxX = Math.max(this.first[0], this.x);

      for (let i = minX; i <= maxX; i++){
        let cell = board.getCell(i, this.first[1]);
        if (cell.value != this.value) continue; 
        cell.toggle(this.isCross);
        cell.draw();
      }
    }
    if (this.axis == "y"){
      let minY = Math.min(this.first[1], this.y);
      let maxY = Math.max(this.first[1], this.y);

      for (let i = minY; i <= maxY; i++){
        let cell = board.getCell(this.first[0], i);
        if (cell.value != this.value) continue; 
        cell.toggle(this.isCross);
        cell.draw();
      }
    }
  },
  endDrag: function(){
    this.reset();
  }

}

function mouseDragged() {
  dragManager.drag();
}

function mousePressed() {
  dragManager.startDrag();
}

function mouseReleased() {
  dragManager.endDrag();
}

