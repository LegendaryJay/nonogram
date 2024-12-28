class History {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];

        this.push = function (state) {
            this.undoStack.push(state);
            this.redoStack = [];
        };
        this.pop = function () {
            if (this.undoStack.length === 0) {
                return null;
            }
            let state = this.undoStack.pop();
            this.redoStack.push(state);
            return state;
        };
    }
}