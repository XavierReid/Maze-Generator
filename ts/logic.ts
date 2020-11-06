type Walls = {
    top: boolean,
    bottom: boolean,
    left: boolean,
    right: boolean;
};

type Neighbor = {
    cell: Cell,
    direction: number;
};

enum Directions {
    Up = 1,
    Down,
    Left,
    Right
}

class Cell {
    visited: boolean;
    walls: Walls;
    xAxis: number;
    yAxis: number;
    constructor(x: number, y: number) {
        this.visited = true;
        this.walls = {
            top: true,
            bottom: true,
            left: true,
            right: true
        };
        this.xAxis = x;
        this.yAxis = y;
    }
}

class Board {
    size: number;
    grid: Cell[][];
    initStack: Cell[];
    solution: Cell[];
    previousCell: Cell | null;
    isSolved: boolean;
    isRunning: boolean;
    isInitialized: boolean;
    time: number;

    constructor(size: number) {
        this.size = size;
        this.time = 0;
        this.isSolved = false;
        this.isRunning = true;
        this.isInitialized = false;
        this.solution = [];
        this.initStack = [];
        this.grid = [];
        this.previousCell = null;
        this.buildGrid();
    }

    buildGrid() {
        for (let row = 0; row < this.size; row++) {
            this.grid.push([]);
            for (let col = 0; col < this.size; col++) {
                this.grid[row].push(new Cell(row, col));
            }
        }
    }

    buildMaze(row: number, col: number) {
        const start = this.grid[row][col];
        const scale = canvas.width / this.size;
        this.initStack.push(start);
        while (this.initStack.length > 0 && this.isRunning) {
            const current = this.initStack[this.initStack.length - 1];
            this.previousCell = current;
            current.visited = true;
            const neighbor = this.chooseNeighbor(current);
            const tile = { cell: current, scale };
            carve(tile, 'blue', 'teal');
            //add sleep later
            if (neighbor) {
                this.removeWalls(neighbor, tile);
            }
            else {
                this.initStack.pop();
                carve(tile, 'blue', 'black');
            }
            if (this.isRunning) {
                //TODO
            }

        }
    }

    private removeWalls(neighbor: Neighbor, tile: Tile) {
        const currentCell = tile.cell;
        const neighborCell = neighbor.cell;
        switch (neighbor.direction) {
            case Directions.Up:
                currentCell.walls.top = false;
                neighborCell.walls.bottom = false;
                break;
            case Directions.Down:
                currentCell.walls.bottom = false;
                neighborCell.walls.top = false;
                break;
            case Directions.Left:
                currentCell.walls.left = false;
                neighborCell.walls.right = false;
                break;
            case Directions.Right:
                currentCell.walls.right = false;
                neighborCell.walls.left = false;
                break;
            default:
                break;
        }
        this.initStack.push(neighborCell);
        carve(tile, 'blue', 'purple');
    }

    private chooseNeighbor(cell: Cell): Neighbor | null {
        const directions = [[-1, 0, 1], [1, 0, 2], [0, -1, 3], [0, 1, 4]];

        const unvisited: Neighbor[] = directions.filter(direction => {
            const dirX = cell.xAxis + direction[0];
            const dirY = cell.yAxis + direction[1];
            return this.checkBounds(dirX, dirY) && !this.grid[dirX][dirY].visited;
        }).map(coords => ({
            cell: this.grid[coords[0]][coords[1]],
            direction: coords[2]
        }));

        const shuffled = this.shuffle(unvisited);
        return shuffled.length > 0 ? shuffled[0] : null;

    }

    private checkBounds(row: number, col: number): boolean {
        return row >= 0 && col >= 0 && row < this.size && col < this.size;
    }

    private shuffle(unvisited: Neighbor[]): Neighbor[] {
        let currIdx = unvisited.length;
        let temp: Neighbor;
        let randIdx: number;
        while (currIdx > 0) {
            randIdx = Math.floor(Math.random() * currIdx);
            currIdx--;
            temp = unvisited[currIdx];
            unvisited[currIdx] = unvisited[randIdx];
            unvisited[randIdx] = temp;
        }
        return unvisited;
    }

}