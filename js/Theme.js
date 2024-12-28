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

