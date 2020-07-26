const EMPTY = 0, WP = 1, WN = 2, WB = 3, WR = 4, WQ = 5, WK = 6,
	BP = 7, BN = 8, BB = 9, BR = 10, BQ = 11, BK = 12;

// One liner functions
const randInt = (start, size) =>
	Math.floor(Math.random() * size) + start;
const isNotSame = (board, row, col, isWhite) =>
	board[row][col] == EMPTY || (board[row][col] < 7) != (isWhite);
const isInBounds = (row, col) =>
	0 <= row && row < 8 && 0 <= col && col < 8;

function pMoves(board, row, col, isWhite) {
	let moves = [];
	let forward = (isWhite ? 1 : -1);
	let r = row + forward, c = col;
	if (isInBounds(r, c) && board[r][c] == EMPTY) {
		moves.push([r, c]);
		r += forward;
		if ((isWhite && row == 1 || !isWhite && row == 6)
				&& board[r][c] == EMPTY)
			moves.push([r, c]);
	}
	let diagonals = [[forward, -1], [forward, 1]];
	for (let i = 0; i < 2; ++i) {
		r = row + diagonals[i][0], c = col + diagonals[i][1];
		if (isInBounds(r, c) && board[r][c] != EMPTY
				&& isNotSame(board, r, c, isWhite))
			moves.push([r, c]);
	}
	return moves;
}

const KDELTA = [[-1, -2], [-1, 2], [1, 2], [1, -2]]
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
			if (!isInBounds(r,c))
				break;
			if (isNotSame(board, r, c, isWhite))
				moves.push([r, c]);
			if (isInBounds(r, c) && board[r][c] != EMPTY)
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
function genMoves(board, row, col, isWhite) {
	const type = board[row][col] - (isWhite ? 1 : 7);
	return MOVES[type](board, row, col, isWhite);
}

function buildBoard() {
	let board = new Array(8)
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

function randomSquares() {
	let squares = [];
	for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c)
		squares.push([r, c]);
	for (let s1 = squares.length - 1;  s1 > 0; --s1) {
		const s2 = randInt(0, s1 + 1);
		[squares[s1], squares[s2]] = [squares[s2], squares[s1]];
	}
	return squares;
}

function randomMove(board, isWhite) {
	let squares = randomSquares();
	for (let i = 0; i < squares.length; ++i) {
		let r = squares[i][0], c = squares[i][1];
		if (board[r][c] !== EMPTY && (board[r][c] < 7 == isWhite)) {
			let moves = genMoves(board, r, c, isWhite);
			if (moves.length !== 0) {
				let move = moves[randInt(0, moves.length)];
				board[move[0]][move[1]] = board[r][c];
				if ((move[0] == 0 || move[0] == 7)
						&& board[r][c] - (isWhite ? 0 : 6) == WP)
					board[move[0]][move[1]] = randInt((isWhite ? 2 : 8), 4);
				board[r][c] = EMPTY;
				return true;
			}
		}
	}
	return false;
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
	for (let i = 0; i < 1000 && randomMove(board, turn); ++i, turn ^= 1)  {
		loadBoard(board);
		await new Promise(r => setTimeout(r, 250));
	}
}

play();
