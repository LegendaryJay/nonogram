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
