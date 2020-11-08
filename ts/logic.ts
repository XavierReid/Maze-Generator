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

type Route = {
    cell: Cell,
    pathTo: Cell[];
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

    constructor(row: number, col: number) {
        this.visited = false;
        this.walls = {
            top: true,
            bottom: true,
            left: true,
            right: true
        };
        this.xAxis = row;
        this.yAxis = col;
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
    isCompleted: boolean;
    time: number;

    constructor(size: number) {
        this.size = size;
        this.time = 0;
        this.isSolved = false;
        this.isRunning = true;
        this.isInitialized = false;
        this.isCompleted = false;
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

    async buildMaze(row: number, col: number) {
        const start = this.grid[row][col];
        const scale = canvas.width / this.size;
        this.initStack.push(start);
        while (this.initStack.length > 0 && this.isRunning) {
            const current = this.initStack[this.initStack.length - 1];
            console.log({ current });
            this.previousCell = current;
            current.visited = true;
            const neighbor = this.chooseNeighbor(current);
            console.log({ neighbor });
            const tile = { cell: current, scale };
            carve(tile, 'blue', 'teal');
            await sleep(100);
            if (neighbor) {
                this.removeWalls(neighbor, tile);
            }
            else {
                this.initStack.pop();
                carve(tile, 'blue', 'black');
            }
        }
        if (this.isRunning) {
            this.isInitialized = true;
        }
    }

    solve(start: Cell, end: Cell) {
        this.previousCell = start;
        const queue: Route[] = [{ cell: start, pathTo: [start] }];
        const visited: Set<Cell> = new Set<Cell>();
        while (queue.length > 0 && this.isRunning) {
            const { cell, pathTo } = queue.shift()!;
            if (!visited.has(cell)) {
                visited.add(cell);
                if (cell === end) {
                    this.solution = pathTo;
                    return;
                }
                const neighbors = this.getNeighbors(cell);
                neighbors.forEach(neighbor => {
                    let isValid = false;
                    switch (neighbor.direction) {
                        case Directions.Up:
                            isValid = !cell.walls.top && !neighbor.cell.walls.bottom;
                            break;
                        case Directions.Down:
                            isValid = !cell.walls.bottom && !neighbor.cell.walls.top;
                            break;
                        case Directions.Left:
                            isValid = !cell.walls.left && !neighbor.cell.walls.right;
                            break;
                        case Directions.Right:
                            isValid = !cell.walls.right && !neighbor.cell.walls.left;
                            break;
                        default:
                            break;
                    }
                    if (isValid) {
                        queue.push({ cell: neighbor.cell, pathTo: pathTo.concat([neighbor.cell]) });
                    }
                });

            }
        }
        if (this.isRunning) {
            this.isSolved = true;
        }
    }

    private removeWalls(neighbor: Neighbor, tile: Tile) {
        const neighborCell = neighbor.cell;
        const currentCell = tile.cell;
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

    private getNeighbors(cell: Cell): Neighbor[] {
        const directions = [[-1, 0, 1], [1, 0, 2], [0, -1, 3], [0, 1, 4]];
        const neighbors = directions.filter(direction => {
            const dirX = cell.xAxis + direction[0];
            const dirY = cell.yAxis + direction[1];
            return this.checkBounds(dirX, dirY);
        }).map(coords => ({
            cell: this.grid[coords[0] + cell.xAxis][coords[1] + cell.yAxis],
            direction: coords[2]
        }));
        console.log({ neighbors });
        return neighbors;


    }

    private chooseNeighbor(cell: Cell): Neighbor | null {
        const unvisited = this.getNeighbors(cell).filter(neighbor => !neighbor.cell.visited);
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

const board = new Board(25);
start(board);