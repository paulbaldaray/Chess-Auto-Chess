const EMPTY = 0, WP = 1, WN = 2, WB = 3, WR = 4, WQ = 5, WK = 6,
	BP = 7, BN = 8, BB = 9, BR = 10, BQ = 11, BK = 12;

// One liner functions
const randInt = (start, size) =>
	Math.floor(Math.random() * size) + start;
const isNotSame = (board, row, col, isWhite) =>
	board[row][col] == EMPTY || (board[row][col] < BP) != (isWhite);
const isInBounds = (row, col) =>
	0 <= row && row < 8 && 0 <= col && col < 8;

function pMoves(board, row, col, isWhite) {
	let moves = [];
	const forward = (isWhite ? 1 : -1);
	let r = row + forward, c = col;
	if (isInBounds(r, c) && board[r][c] == EMPTY) {
		moves.push([r, c]);
		r += forward;
		if (row == 6-5*isWhite && board[r][c] == EMPTY)
			moves.push([r, c]);
	}
	for (let i = 0; i < 2; ++i) {
		r = row + forward, c = col + (i ? -1 : 1);
		if (isInBounds(r, c) && board[r][c] != EMPTY
				&& isNotSame(board, r, c, isWhite))
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
			if (isInBounds(r, c) && isNotSame(board, r, c, isWhite))
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
			if (!isInBounds(r, c))
				break;
			if (isNotSame(board, r, c, isWhite))
				moves.push([r, c]);
			if (board[r][c] != EMPTY)
				break;
		}
	}
	return moves;
}

const DDIR = [[1, 0, 1], [0, 0, 0], [1, 0, 1]];
function bMoves(board, row, col, isWhite) {
	return dirMoves(board, row, col, isWhite, DDIR, 7);
}

const HDIR = [[0, 1, 0], [1, 0, 1], [0, 1, 0]];
function rMoves(board, row, col, isWhite) {
	return moves = dirMoves(board, row, col, isWhite, HDIR, 7);
}

const ADIR = [[1, 1, 1], [1, 0, 1], [1, 1, 1]];
function qMoves(board, row, col, isWhite) {
	return dirMoves(board, row, col, isWhite, ADIR, 7);
}

function kMoves(board, row, col, isWhite) {
	return moves = dirMoves(board, row, col, isWhite, ADIR, 1);
}

const MOVES = [pMoves, nMoves, bMoves, rMoves, qMoves, kMoves];
function genMoves(board, row, col, isWhite, type) {
	return MOVES[type-1](board, row, col, isWhite);
}

function inCheck(board, isWhite) {
	let row, col;
	outer:
	for (row = 0; row < 8; ++row) for (col = 0; col < 8; ++col)
		if (board[row][col] == WK + (isWhite ? 0 : 6))
			break outer;
	if (row == 8)
		return true;
	for (let piece = WP; piece <= WK; ++piece) {
		let moves = genMoves(board, row, col, isWhite, piece);
		let attacker = piece + (isWhite ? 6 : 0);
		for (let i = 0; i < moves.length; ++i)
			if (board[moves[i][0]][moves[i][1]] == attacker)
				return true;
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

const BACKRANK = [ WR, WN, WB, WQ, WK, WB, WN, WR ];
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

let SQUARES = Array(64);
for (let i = 0; i < 64; ++i)
	SQUARES[i] = [Math.floor(i/8), Math.floor(i%8)];
function randomize(arr) {
	for (let i = arr.length - 1;  i > 0; --i) {
		const j = randInt(0, i + 1);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function randomMove(board, isWhite) {
	let squares = randomize(SQUARES);
	for (let i = 0; i < squares.length; ++i) {
		let r = squares[i][0], c = squares[i][1];
		if (board[r][c] == EMPTY || (board[r][c] < BP) != isWhite)
			continue;
		let type = board[r][c] - (isWhite ? 0 : 6);
		let moves = randomize(genMoves(board, r, c, isWhite, type));
		if (moves.length == 0)
			continue;
		for (let j = 0; j < moves.length; ++j) {
			let rd = moves[j][0], cd = moves[j][1];
			let captured = board[rd][cd], piece = board[r][c];
			board[rd][cd] = piece;
			if ((rd == 0 || rd == 7) && type == WP)
				board[rd][cd] = randInt((isWhite ? 2 : 8), 4);
			board[r][c] = EMPTY;
			if (inCheck(board, isWhite))
				board[rd][cd] = captured, board[r][c] = piece;
			else
				return true;
		}
	}
	return false;
}

function isDraw(board) {
	let wbset = 0, bbset = 0;
	for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
		const isWhite = board[r][c] < BP;
		const type = board[r][c] - (isWhite ? 0 : 6);
		let bset = (isWhite ? wbset : bbset);
		switch (type) {
			case WN: bset += (1 << 0); break;
			case WB: bset += (1 << 2); break;
			case EMPTY: case WK: continue;
			default: return false;
		}
	}
	return (wbset < 3 || wbset == 4 || wbset == 8)
		&& (bbset < 3 || bbset == 4 || bbset == 8);
}

const UNI = [
	'','&#9817;','&#9816;','&#9815;','&#9814;','&#9813;','&#9812;',
	'&#9823;','&#9822;','&#9821;','&#9820;','&#9819;','&#9818;',
];
function loadBoard(board) {
	for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
		const id = '#' + 'ABCDEFGH'[c] + (r+1);
		document.querySelector(id).innerHTML = UNI[board[r][c]];
	}
}

async function play() {
	let board = defaultBoard();
	let turn = 1;
	while (!isDraw(board) && randomMove(board, turn))  {
		loadBoard(board);
		await new Promise(r => setTimeout(r, 0));
		turn ^= 1;
	}
	if (inCheck(board, 0)) console.log("White Wins");
	else if (inCheck(board, 1)) console.log("Black Wins");
	else console.log("Stalemate");
}

play();
