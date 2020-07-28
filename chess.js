const EMPTY = 0, WP = 1, WN = 2, WB = 3, WR = 4, WQ = 5, WK = 6,
	BP = 7, BN = 8, BB = 9, BR = 10, BQ = 11, BK = 12;

// One liner functions
const notSame = (piece, isWhite) =>
	piece == EMPTY || (piece < BP) != (isWhite);
const inBounds = (row, col) =>
	0 <= row && row < 8 && 0 <= col && col < 8;

function pMoves(board, row, col, isWhite) {
	let moves = [];
	const forward = (isWhite ? 1 : -1);
	let r = row + forward, c = col;
	if (inBounds(r, c) && board[r][c] == EMPTY) {
		moves.push([r, c]);
		r += forward;
		if (row == (isWhite ? 1 : 6) && board[r][c] == EMPTY)
			moves.push([r, c]);
	}
	for (let i = 0; i < 2; ++i) {
		r = row + forward, c = col + (i ? -1 : 1);
		if (inBounds(r, c) && board[r][c] != EMPTY
				&& notSame(board[r][c], isWhite))
			moves.push([r, c]);
	}
	return moves;
}

const KDELTA = [[-1, -2], [-1, 2], [1, 2], [1, -2]];
function nMoves(board, row, col, isWhite) {
	let moves = [];
	for (let colFirst = 0; colFirst < 2; ++colFirst)
		for (let i = 0; i < KDELTA.length; ++i) {
			let	r = KDELTA[i][0], c = KDELTA[i][1];
			if (colFirst)
				[r, c] = [c, r];
			r += row, c += col;
			if (inBounds(r, c) && notSame(board[r][c], isWhite))
				moves.push([r, c]);
		}
	return moves;
}

function dirMoves(board, row, col, isWhite, directions, distance) {
	let moves = [];
	for (let i = 0; i < 3; ++i) for (let j = 0; j < 3; ++j) {
		if (!directions[i][j])
			continue;
		let r = row + 1-i, c = col + j-1;
		for (let k = 0; k < distance; ++k, r += 1-i, c += j-1) {
			if (!inBounds(r, c))
				break;
			if (notSame(board[r][c], isWhite))
				moves.push([r, c]);
			if (board[r][c] != EMPTY)
				break;
		}
	}
	return moves;
}

const DDIR = [[1, 0, 1], [0, 0, 0], [1, 0, 1]];
const HDIR = [[0, 1, 0], [1, 0, 1], [0, 1, 0]];
const ADIR = [[1, 1, 1], [1, 0, 1], [1, 1, 1]];
function genMoves(board, row, col, isWhite, type) {
	switch (type) {
		case WP: return pMoves(board, row, col, isWhite);
		case WN: return nMoves(board, row, col, isWhite);
		case WB: return dirMoves(board, row, col, isWhite, DDIR, 7);
		case WR: return dirMoves(board, row, col, isWhite, HDIR, 7);
		case WQ: return dirMoves(board, row, col, isWhite, ADIR, 7);
		case WK: return dirMoves(board, row, col, isWhite, ADIR, 1);
		default: return [];
	}
}

function inCheck(board, isWhite) {
	let row, col;
	for (row = 0; row < 8; ++row) for (col = 0; col < 8; ++col) {
		if (board[row][col] != WK + (isWhite ? 0 : 6))
			continue;
		for (let piece = WP; piece <= WK; ++piece) {
			let moves = genMoves(board, row, col, isWhite, piece);
			let attacker = piece + (isWhite ? 6 : 0);
			for (let i = 0; i < moves.length; ++i)
				if (board[moves[i][0]][moves[i][1]] == attacker)
					return true;
		}
	}
	return false;
}

function buildBoard() {
	let board = new Array(8);
	for (let r = 0; r < 8; ++r) {
		board[r] = new Array(8);
		for (let c = 0; c < 8; ++c)
			board[r][c] = EMPTY;
	}
	return board;
}

const BACKRANK = [WR, WN, WB, WQ, WK, WB, WN, WR];
function defaultBoard() {
	let board = buildBoard();
	board[0] = [...BACKRANK];
	for (let c = 0; c < 8; ++c) {
		board[1][c] = WP;
		board[6][c] = BP;
		board[7][c] = board[0][c] + 6;
	}
	return board;
}

function randomize(arr) {
	for (let i = arr.length - 1;  i > 0; --i) {
		const j = Math.floor(Math.random() * (i+1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function undoMove(board, move) {
	let [r1, c1, r2, c2, p1, p2, promote] = move;
	board[r1][c1] = p1, board[r2][c2] = p2;
}

function makeMove(board, move) {
	let [r1, c1, r2, c2, p1, p2, promote] = move;
	board[r2][c2] = p1, board[r1][c1] = EMPTY;
	if ((r2 == 0 || r2 == 7) && (p1 == WP || p1 == BP))
		board[r2][c2] = promote;
}

function randomMove(board, isWhite, hist) {
	let moves = [];
	for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
		if (board[r][c] == EMPTY || (board[r][c] < BP) != isWhite)
			continue;
		let dest = genMoves(board, r, c, isWhite, board[r][c] - (isWhite ? 0 : 6));
		for (let j = 0; j < dest.length; ++j)
			moves.push([r, c].concat(dest[j]));
	}
	randomize(moves);
	for (let j = 0; j < moves.length; ++j) {
		let [r1, c1, r2, c2] = moves[j];
		let promote = Math.floor(Math.random() * 4) + (isWhite ? 2 : 8);
		hist.push([r1, c1, r2, c2, board[r1][c1], board[r2][c2], promote]);
		makeMove(board, hist[hist.length-1]);
		if (!inCheck(board, isWhite))
			return true;
		undoMove(board, hist.pop());
	}
	return false;
}

function isDraw(board) {
	if (inCheck(board, 0) || inCheck(board, 1))
		return false;
	let pieces = [[0, 0, 0], [0, 0, 0]]
	for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c)
		switch(board[r][c]) {
			case WK: ++pieces[0][0]; continue;
			case WN: ++pieces[0][1]; continue;
			case WB: ++pieces[0][2]; continue;
			case BK: ++pieces[1][0]; continue;
			case BN: ++pieces[1][1]; continue;
			case BB: ++pieces[1][2]; continue;
			case EMPTY: continue;
			default: return false;
		}
	for (let w = 0; w < 2; ++w)
		if ((pieces[w][0] > 1 && (pieces[x^1][1] || pieces[x^1][2]))
				|| (pieces[w][1] > 2 || pieces[w][2] > 1)
				|| (pieces[w][1] && pieces[w][2]))
			return false;
	return true;
}

const IMG = ["0", "WP", "WN", "WB", "WR", "WQ", "WK",
	"BP", "BN", "BB", "BR", "BQ", "BK"];
function loadBoard(board) {
	for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
		const id = 'ABCDEFGH'[c] + (r+1);
		if (board[r][c] != EMPTY)
			document.getElementById(id).src = "img/" + IMG[board[r][c]] + ".png";
		else
			document.getElementById(id).removeAttribute('src');
	}
}

const RESULTS =['Stalemate...', 'Black Wins!', 'White Wins!'];
let gameBoard, gameHistory, gamePosition, gameResult;
let gameRunning = false, gamePaused = true, pauseConfirm = false;
let maxDelay = 2048, gameDelay = 128;
function reset() {
	if (!gamePaused)
		return;
	document.querySelector('.title').innerHTML = 'Game!';
	gameBoard = defaultBoard();
	loadBoard(gameBoard);
	gamePosition = 0;
	gameHistory = [];
	for (let x = 1; !isDraw(gameBoard) && randomMove(gameBoard, x, gameHistory); x^=1);
	gameResult = inCheck(gameBoard, 0) ? 2 : inCheck(gameBoard, 1) ? 1 : 0;
	gameBoard = defaultBoard();
}

async function run() {
	gameRunning = true;
	for (; gamePosition < gameHistory.length; ++gamePosition) {
		if (gamePaused) {
			gameRunning = false;
			break;
		}
		ready = 1;
		makeMove(gameBoard, gameHistory[gamePosition]);
		loadBoard(gameBoard);
		await new Promise(r => setTimeout(r, gameDelay));
	}
	gamePaused = true;
	document.getElementById('play').innerHTML = '►';
	if (gameRunning)
		document.querySelector('.title').innerHTML = RESULTS[gameResult];
	gameRunning = false;
}

function play() {
	gamePaused = !gamePaused;
	let icon = gamePaused ? '►' : '❚❚';
	document.getElementById('play').innerHTML = icon;
	if (!gameRunning)
		run();
}

function prev() {
	if (gameRunning || gamePosition == 0)
		return;
	undoMove(gameBoard, gameHistory[--gamePosition]);
	loadBoard(gameBoard);
}

function next() {
	if (gameRunning || gamePosition == gameHistory.length)
		return;
	makeMove(gameBoard, gameHistory[gamePosition++]);
	loadBoard(gameBoard);
}

function speed() {
	if (gameDelay > 4)
		gameDelay /= 2;
	document.getElementById('speedText').innerHTML
		= 'speed: ' + (12-Math.log2(gameDelay));
}

function slow() {
	if (gameDelay*2 <= maxDelay)
		gameDelay *= 2;
	document.getElementById('speedText').innerHTML
		= 'speed: ' + (12-Math.log2(gameDelay));
}

function main() {
	reset();
}

main();
