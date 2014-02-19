!(function (root, undefined) {

	'use strict';

	// polyfill matchesSelector onto Element.prototype
	require('./matchesSelector.js')(window.Element.prototype);

	var on = require('./on.js');

	// http://mathworld.wolfram.com/MagicSquare.html
	var magic = {
		square: [8, 1, 6, 3, 5, 7, 4, 9, 2],
		indices: [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[2, 4, 6],
			[0, 4, 8]
		],
		sum: 15
	};

	/**
	 * returns array of 9 false values
	 * @return {Array}
	 */
	function getEmptyBoard() {
		return Array.apply(null, new Array(9)).map(function () { return false; });
	}

	/**
	 * checks if a given element has a valid 'data-state' attribute
	 * @param  {HTMLElement} el
	 * @return {Boolean}
	 */
	function hasMove(el) {
		var current = el.getAttribute('data-state');
		if (current === 'x' || current === 'o') {
			return true;
		}
	}

	function identity(e) {
		return e;
	}

	var slice = Function.prototype.call.bind(Array.prototype.slice);

	/**
	 * joins two boards by keeping true values
	 * used to check for a tie
	 * @return {Array} board
	 */
	function joinBoards() {
		for (var i = 1; i < arguments.length; i++) {
			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key) && arguments[i][key] === true) {
					arguments[0][key] = arguments[i][key];
				}
			}
		}
		return arguments[0];
	}

	/**
	 * Tac
	 */
	function Tac(options) {
		var board = document.querySelector(options.board);
		var score = document.querySelector(options.score);

		/**
		 * main click handler, used for board and score
		 * @param  {Event} e
		 */
		var handleClick = function (e) {
			if (board.getAttribute('data-state') === 'end') {
				this.resetBoard();
				return;
			}

			if (e.target.matchesSelector(options.score)) {
				return;
			}

			var pos = parseInt(e.target.getAttribute('data-pos'), 10);
			if (!changeState(e.target, pos)) {
				return;
			}
			if (checkForVictor()) {
				handleVictory();
			} else if (checkForTie()) {
				handleTie();
			} else {
				changeTurn();
			}
		}.bind(this);

		var handleTie = function () {
			score.innerHTML = 'cat';
			endGame();
		}.bind(this);

		var handleVictory = function () {
			score.innerHTML = this.nextTurn + ' wins';
			endGame();
		}.bind(this);

		var endGame = function () {
			score.style.display = '';
			board.setAttribute('data-state', 'end');
		};

		var checkForVictor = function () {
			var playerBoard = this.boards[this.nextTurn];

			return magic.indices.some(function (axis) {
				return axis.reduce(function (sum, cur) {
					return sum + (playerBoard[cur] ? magic.square[cur] : 0);
				}, 0) === magic.sum;
			});

		}.bind(this);

		var checkForTie = function () {
			return joinBoards(getEmptyBoard(), this.boards.x, this.boards.o).every(identity);
		}.bind(this);

		var changeTurn = function () {
			if (this.nextTurn === 'x') {
				this.nextTurn = 'o';
			} else {
				this.nextTurn = 'x';
			}
		}.bind(this);

		var changeState = function (el, pos) {
			if (hasMove(el)) {
				return false;
			}

			el.setAttribute('data-state', this.nextTurn);
			this.boards[this.nextTurn][pos] = true;

			return true;
		}.bind(this);

		this.resetBoard = function () {
			board.setAttribute('data-state', 'start');
			score.style.display = 'none';
			slice(document.querySelectorAll('.tic')).forEach(function (tic) {
				tic.setAttribute('data-state', '');
			});

			this.boards = {
				'x': getEmptyBoard(),
				'o': getEmptyBoard()
			};

			this.nextTurn = 'x';
		};

		var createBoard = function () {
			while (board.firstChild) {
				board.removeChild(board.firstChild);
			}

			for (var i = 0, l = 9; i < l; i++) {
				var tic = document.createElement('div');
				tic.className = 'tic';
				tic.setAttribute('data-pos', i);
				board.appendChild(tic);
			}
		};
		
		createBoard();
		on(options.board, ['click'], '.tic', handleClick);
		on(options.score, 'click', handleClick);
		this.resetBoard();
	}

	module.exports = Tac;

})(window);
