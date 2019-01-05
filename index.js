const canvas = document.querySelector('#maze');
const slider = document.querySelector('#slider');
const spans = document.querySelectorAll('span');
const displayedTime = document.querySelector('#timer');
const ctx = canvas.getContext('2d');
const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

class Cell {
    constructor() {
        this.visited = false;
        this.walls = {
            top: true,
            bottom: true,
            left: true,
            right: true
        };
    }
}

class Board {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.initGrid();
        this.solution = [];
        this.stopped = false;
        this.time = 0;
        this.completed = false;
    }

    initGrid() {
        for (let i = 0; i < this.size; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.size; j++) {
                this.grid[i].push(new Cell());
            }
        }
    }

    async initMaze(row, col) {
        const stack = [[row, col]];
        while (stack.length > 0 && !this.stopped) {
            const curr = stack[stack.length - 1];
            const [nrow, ncol] = curr;
            this.grid[nrow][ncol].visited = true;
            const neighbor = this.chooseNeighbor(nrow, ncol);
            const s = canvas.width / maze.size;
            this.carve(this.grid[nrow][ncol], ncol, nrow, s, 'blue', 'teal');
            await sleep(100);
            if (neighbor) {
                this.removeWalls(neighbor, nrow, ncol, s, stack);
            } else {
                stack.pop();
                this.carve(
                    this.grid[nrow][ncol],
                    ncol,
                    nrow,
                    s,
                    'blue',
                    'black'
                );
            }
        }
    }

    removeWalls(neighbor, nrow, ncol, s, stack) {
        const xrow = nrow + neighbor[0];
        const xcol = ncol + neighbor[1];
        const dir = neighbor[2];
        const rn = this.grid[nrow][ncol];
        const next = this.grid[xrow][xcol];
        if (dir === 1) {
            rn.walls.top = false;
            next.walls.bottom = false;
        } else if (dir === 2) {
            rn.walls.bottom = false;
            next.walls.top = false;
        } else if (dir === 3) {
            rn.walls.right = false;
            next.walls.left = false;
        } else {
            rn.walls.left = false;
            next.walls.right = false;
        }
        stack.push([xrow, xcol]);
        this.carve(this.grid[nrow][ncol], ncol, nrow, s, 'blue', 'purple');
    }

    carve(cell, x, y, s, color1, color2) {
        fillTile(x, y, s, color2);
        drawCell(cell, x, y, s, color1);
    }

    chooseNeighbor(row, col) {
        const directions = [[-1, 0, 1], [1, 0, 2], [0, 1, 3], [0, -1, 4]];
        const unvisited = directions.filter(dir => {
            const nrow = row + dir[0];
            const ncol = col + dir[1];
            return (
                this.checkBounds(nrow, ncol) && !this.grid[nrow][ncol].visited
            );
        });
        this.shuffle(unvisited);
        return unvisited.length > 0 ? unvisited[0] : null;
    }

    checkBounds(row, col) {
        return row >= 0 && col >= 0 && row < this.size && col < this.size;
    }

    shuffle(arr) {
        let curr = arr.length;
        let temp, rand;
        while (curr > 0) {
            rand = Math.floor(Math.random() * curr);
            curr--;
            temp = arr[curr];
            arr[curr] = arr[rand];
            arr[rand] = temp;
        }
        return arr;
    }

    displayAscii() {
        console.log(' _'.repeat(this.size));
        for (let i = 0; i < this.size; i++) {
            let line = '|';
            for (let j = 0; j < this.size; j++) {
                const cell = this.grid[i][j];
                const { top, bottom, left, right } = cell.walls;
                line += bottom ? '_' : ' ';
                line += left ? '|' : ' ';
            }
            console.log(line);
        }
    }

    solve(start, end) {
        const directions = [[-1, 0, 1], [1, 0, 2], [0, 1, 3], [0, -1, 4]];
        const queue = [[start, [start]]];
        const visited = new Set();
        while (queue.length > 0 && !this.stopped) {
            let current = queue.shift();
            let [coord, path] = current;
            let pos = coord[0] + coord[1] * this.size;
            if (!visited.has(pos)) {
                visited.add(pos);
                if (coord[0] === end[0] && coord[1] === end[1]) {
                    this.solution = path;
                    return;
                }
                let neighbors = directions
                    .map(dir => {
                        let row = dir[0] + coord[0];
                        let col = dir[1] + coord[1];
                        return [row, col, dir[2]];
                    })
                    .filter(neighbor =>
                        this.checkBounds(neighbor[0], neighbor[1])
                    );
                neighbors.forEach(neighbor => {
                    const currentCell = this.grid[coord[0]][coord[1]];
                    const neighborCell = this.grid[neighbor[0]][neighbor[1]];
                    let isValid;
                    if (neighbor[2] === 1) {
                        isValid =
                            !currentCell.walls.top && !neighborCell.walls.bottom
                                ? true
                                : false;
                    } else if (neighbor[2] === 2) {
                        isValid =
                            !currentCell.walls.bottom && !neighborCell.walls.top
                                ? true
                                : false;
                    } else if (neighbor[2] === 3) {
                        isValid =
                            !currentCell.walls.right && !neighborCell.walls.left
                                ? true
                                : false;
                    } else {
                        isValid =
                            !currentCell.walls.left && !neighborCell.walls.right
                                ? true
                                : false;
                    }
                    if (isValid) {
                        queue.push([neighbor, path.concat([neighbor])]);
                    }
                });
            }
        }
    }

    async navigate() {
        if (this.stopped) {
            return;
        }
        const s = canvas.width / this.size;
        //Make the start and end tiles stand out more
        const start = this.solution[0];
        const end = this.solution[this.solution.length - 1];
        for (let i = 0; i < this.solution.length && !this.stopped; i++) {
            let pos = this.solution[i];
            let cell = this.grid[pos[0]][pos[1]];
            const x = pos[1] * s;
            const y = pos[0] * s;
            ctx.fillStyle = 'white';
            ctx.fillRect(
                Math.round(x + s / 4 + s / 8),
                Math.round(y + s / 4 + s / 8),
                Math.round(s / 4),
                Math.round(s / 4)
            );
            await sleep(100);
        }
        this.completed = true;
    }

    timer() {
        let timer = setInterval(() => {
            if (this.stopped || this.completed) {
                return clearInterval(timer);
            }
            this.time++;
            let toDisplay = this.formatTime();
            displayedTime.innerText = toDisplay;
            console.log(toDisplay);
        }, 1000);
    }

    formatTime() {
        let time = this.time;
        let hours = Math.floor(time / 3600);
        time = time % 3600;
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        function str_pad_left(string, pad, length) {
            return (new Array(length + 1).join(pad) + string).slice(-length);
        }
        const formattedTime = `${str_pad_left(hours, '0', 2)}:${str_pad_left(
            minutes,
            '0',
            2
        )}:${str_pad_left(seconds, '0', 2)}`;
        return formattedTime;
    }
}

function drawLine(xStart, yStart, xEnd, yEnd, color) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

function fillTile(x, y, s, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * s, y * s, s, s);
}

function drawCell(cell, x, y, s, color) {
    y *= s;
    x *= s;
    const { top, bottom, left, right } = cell.walls;
    if (top) {
        drawLine(x, y, x + s, y, color);
    }
    if (left) {
        drawLine(x, y, x, y + s, color);
    }
    if (right) {
        drawLine(x + s, y, x + s, y + s, color);
    }
    if (bottom) {
        drawLine(x, y + s, x + s, y + s, color);
    }
}

function drawBoard(board) {
    for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
            const cell = board.grid[i][j];
            let s = canvas.width / board.size;
            drawCell(cell, j, i, s, 'white');
        }
    }
}

async function start(board) {
    spans.forEach(span => (span.innerText = size));
    ctx.fillStyle = '#0f0a1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBoard(board);
    let randomX = Math.floor(Math.random() * maze.size);
    let randomY = Math.floor(Math.random() * maze.size);
    maze.timer();
    displayedTime.innerText = maze.formatTime();
    await maze.initMaze(randomX, randomY);
    maze.solve([0, 0], [maze.size - 1, maze.size - 1]);
    await maze.navigate();
}

async function handleUpdate() {
    size = this.value;
    maze.stopped = true;
    await sleep(100);
    maze = new Board(size);
    start(maze);
}

slider.addEventListener('mouseup', handleUpdate);

let size = slider.value;
let maze = new Board(size);
start(maze);
