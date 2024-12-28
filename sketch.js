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



// drag funuctionality
  // get initial index from mouse coordinates
  // assume that mouse click is from the center
  // determine the direction of the mouse if index is 1 away in only x or only y
  // get the x or y value based on the direction and mouse position


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
let selected = {
  first: null, // [x, y]
  value: null, // -1, 1, or 0
  x: null, // index
  y: null, // index
  axis: null, // x or y
  isCross: false,
  reset: function(){
    this.value = null;
    this.first = null;
    this.axis = null;
    this.x = null;
    this.y = null;
    this.isCross = false;
  }
}; 
let select = function(){

  if (selected.first == null){
    return;
  }

  // get indexes closest to mouse- x and y and record to range
  let coords = board.coordinateToIndex(mouseX, mouseY);
  selected.x = coords.x;
  selected.y = coords.y;

  if (selected.axis == null){
    let xLength = Math.abs(selected.first[0] - selected.x);
    let yLength = Math.abs(selected.first[1] - selected.y);

    if (xLength > 1 || yLength > 1){
      selected.axis = xLength > yLength ? "x" : "y";
    }
  }  

  selected.x = Math.max( Math.min(selected.x, board.columns - 1), 0);
  selected.y = Math.max( Math.min(selected.y, board.rows - 1), 0);

  if (selected.axis == "x"){
    let minX = Math.min(selected.first[0], selected.x);
    let maxX = Math.max(selected.first[0], selected.x);


    for (let i = minX; i <= maxX; i++){
      let cell = board.getCell(i, selected.first[1]);
      if (cell.value != selected.value) continue; 
      cell.toggle(selected.isCross);
      cell.draw();
    }
  }
  if (selected.axis == "y"){
    let minY = Math.min(selected.first[1], selected.y);
    let maxY = Math.max(selected.first[1], selected.y);

    for (let i = minY; i <= maxY; i++){
      let cell = board.getCell(selected.first[0], i);
      if (cell.value != selected.value) continue; 
      cell.toggle(selected.isCross);
      cell.draw();
    }
  }

}
   


function mouseDragged() {
  select();
}

function mousePressed() {
  selected.reset();
  let index = board.coordinateToIndex(mouseX, mouseY);
  if (index.isWithinBoard == false) {
    return;
  }
  const cell = board.getCell(index.x, index.y);
  selected.value = cell.value;
  selected.first = [index.x, index.y];
  selected.isCross = mouseButton === RIGHT;

  cell.toggle(selected.isCross);
  cell.draw();
}

function mouseReleased() {
  stroke('magenta');
  strokeWeight(5);
}

// function mousePressed() {
//   console.log("click!");
//   board.handleMouseClick(mouseButton);
// }


/*
TODO: Handling State Updates
Problem: mouseDragged and mousePressed are a bit unclear and partially redundant.
Solution:
Introduce a clear state machine to track drag state (e.g., whether dragging has started, what type of cell interaction is being performed).
Use a helper function to handle toggling cells during drag.


TODO: Coordinate Conversion
Problem: _singleCoordinateToIndex could be simplified and its logic made more robust to edge cases.
Solution: Refactor the logic into smaller reusable functions to avoid redundancy and improve readability.

TODO: Event Handling and Dragging Logic
Problem: The dragging logic (mouseDragged, mousePressed, mouseReleased) is partially implemented and could cause bugs in edge cases (e.g., dragging outside the board).
Solution: Refactor select and dragging functions for clarity and ensure out-of-bound drag events are handled gracefully.
 */