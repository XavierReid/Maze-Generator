const canvas = <HTMLCanvasElement>document.querySelector('#maze')!;
// const slider = document.querySelector('#slider');
const spans = document.querySelectorAll('span');
// const displayedTime = document.querySelector('#timer');
const ctx = canvas.getContext('2d')!;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


type Tile = {
    scale: number,
    cell: Cell;
};

type LineOptions = {
    startX: number,
    startY: number,
    endX: number,
    endY: number;
};

function carve(tile: Tile, color1: string, color2: string) {
    fillTile(tile, color1);
    drawCell(tile, color2);
}

function fillTile(tile: Tile, color: string) {
    ctx.fillStyle = color;
    const { cell, scale } = tile;
    ctx.fillRect(cell.xAxis * scale, cell.yAxis * scale, scale, scale);
}

function drawTrail(tile: Tile, color: string) {
    ctx.fillStyle = color;
    const { cell, scale } = tile;
    ctx.fillRect(
        Math.round(cell.xAxis + scale / 4 + scale / 8),
        Math.round(cell.yAxis + scale / 4 + scale / 8),
        Math.round(scale / 4),
        Math.round(scale / 4)
    );
}

function drawCell(tile: Tile, color: string) {
    const { cell, scale } = tile;
    const scaledX = cell.xAxis * scale;
    const scaledY = cell.yAxis * scale;
    const { top, bottom, left, right } = cell.walls;
    if (top) {
        const options = {
            startX: scaledX,
            startY: scaledY,
            endX: scaledX + scale,
            endY: scaledY
        };
        drawLine(options, color);
    }
    if (bottom) {
        const options = {
            startX: scaledX,
            startY: scaledY + scale,
            endX: scaledX + scale,
            endY: scaledY + scale
        };
        drawLine(options, color);
    }
    if (left) {
        const options = {
            startX: scaledX,
            startY: scaledY,
            endX: scaledX,
            endY: scaledY + scale
        };
        drawLine(options, color);
    }
    if (right) {
        const options = {
            startX: scaledX + scale,
            startY: scaledY,
            endX: scaledX + scale,
            endY: scaledY + scale
        };
        drawLine(options, color);
    }
}

function drawLine(options: LineOptions, color: string) {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.moveTo(options.startX, options.startY);
    ctx.lineTo(options.endX, options.endY);
    ctx.stroke();
}

function drawBoard(board: Board) {
    const scale = canvas.width / board.size;
    board.grid.map(row => row.map(cell => {
        drawCell({ cell, scale }, 'white');
    }));
}

async function navigate(board: Board) {
    if (!board.isRunning || !board.isSolved) {
        return;
    }
    const scale = canvas.width / board.size;
    board.solution.forEach(async cell => {
        board.previousCell = cell;
        drawTrail({ cell, scale }, 'white');
        await sleep(100);
    });
    if (board.isRunning) {
        board.isCompleted = true;
    }

}

async function start(board: Board) {
    spans.forEach(span => (span.innerText = `${board.size}`));
    ctx.fillStyle = '#0f0a1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBoard(board);
    const randomX = Math.floor(Math.random() * board.size);
    const randomY = Math.floor(Math.random() * board.size);
    await board.buildMaze(randomX, randomY);
    // if (board.isInitialized) {
    //     board.previousCell = board.grid[0][0];
    //     const end = board.grid[board.size - 1][board.size - 1];
    //     // board.solve(board.previousCell, end);
    //     // await navigate(board);
    // }
}