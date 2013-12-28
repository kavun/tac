!(function (root, undefined) {

	/**
	 * helper function to delegate/attach DOM events
	 * @param  {String}       root   selector for event root element
	 * @param  {Array|String} events single event name or array of event names
	 * @param  {String}       child  selector for target event element, if provided event handling will be delegated to root
	 * @param  {Function}     fn     event handler
	 */
	function on(root, events, child, fn) {
		var delegate = true;
		if (typeof child === 'function') {
			fn = child;
			child = root;
			delegate = false;
		}
		var to = document.querySelector(root);
		if (!Array.isArray(events)) {
			events = [events];
		}
		var handler = delegate ? on.delegate(child, fn) : fn;
		for (var i = 0, l = events.length; i < l; i++) {
			to.addEventListener(events[i], handler);
		}
	}

	/**
	 * fires event handler if event target matches selector
	 * @param  {String}   selecta selector to match
	 * @param  {Function} fn      event handler to call
	 */
	on.delegate = function (selecta, fn) {
		return function (e) {
			if (e.target.matchesSelector(selecta)) {
				fn.call(this, e);
			}
		}
	};

	/**
	 * array of winning board combinations
	 * @type {Array}
	 */
	var winningBoards = [
		[true, true, true, false, false, false, false, false, false],
		[true, false, false, true, false, false, true, false, false],
		[false, false, false, true, true, true, false, false, false],
		[false, false, true, false, false, true, false, false, true],
		[false, true, false, false, true, false, false, true, false],
		[false, false, false, false, false, false, true, true, true],
		[true, false, false, false, true, false, false, false, true],
		[false, false, true, false, true, false, true, false, false]
	];

	/**
	 * returns array of 9 false values
	 * @return {Array}
	 */
	function getEmptyBoard() {
		return Array.apply(null, Array(9)).map(function () { return false });
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
	function Tac() {
		var board = document.getElementById('board');
		var score = document.getElementById('score');
		
		/**
		 * main click handler, used for board and score
		 * @param  {Event} e
		 */
		var handleClick = function (e) {
			if (board.getAttribute('data-state') === 'end') {
				this.resetBoard();
				return;
			}

			if (e.target.matchesSelector('#score')) {
				return;
			}

			var pos = parseInt(e.target.getAttribute('data-pos'), 10);
			if (!changeState(e.target, pos)) {
				return;
			}
			if (checkForTie()) {
				handleTie();
			} else if (checkForVictor()) {
				handleVictory();
			} else {
				changeTurn();
			}
		}.bind(this);

		var handleTie = function () {
			score.innerHTML = 'tie';
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
			return winningBoards.some(function (board) {
				return board.every(function (state, i) {
					return !state || playerBoard[i] === state;
				});
			});
		}.bind(this);

		var checkForTie = function () {
			return joinBoards(getEmptyBoard(), this.boards.x, this.boards.o).every(function (s) { 
				return s === true;
			});
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
			[].slice.call(document.querySelectorAll('.tic')).forEach(function (tic) {
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
		on('#board', ['click'], '.tic', handleClick);
		on('#score', 'click', handleClick);
		this.resetBoard();
	};

	root.Tac = Tac;

})(window);