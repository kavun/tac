!(function () {

	'use strict';

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
		};
	};

	module.exports = on;

})();