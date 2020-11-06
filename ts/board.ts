const canvas = <HTMLCanvasElement>document.querySelector('#maze')!;
// const slider = document.querySelector('#slider');
// const spans = document.querySelectorAll('span');
// const displayedTime = document.querySelector('#timer');
const ctx = canvas.getContext('2d')!;

type Tile = {
    cell: Cell,
    scale: number;
};

type LineOptions = {
    startX: number,
    startY: number,
    endX: number,
    endY: number;
};

function carve(tile: Tile, color1: string, color2: string) {
    fill(tile, color1);
    drawCell(tile, color2);
}

function fill(tile: Tile, color: string) {
    ctx.fillStyle = color;
    const { cell, scale } = tile;
    const { xAxis, yAxis } = cell;
    ctx.fillRect(xAxis * scale, yAxis * scale, scale, scale);
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