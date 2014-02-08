module.exports = function (elementPrototype) {
	'use strict';

	elementPrototype.matchesSelector = elementPrototype.matchesSelector ||
	elementPrototype.mozMatchesSelector ||
	elementPrototype.msMatchesSelector ||
	elementPrototype.oMatchesSelector ||
	elementPrototype.webkitMatchesSelector ||
	function (selector) {
		var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
		while (nodes[++i] && nodes[i] != node) {}
		return !!nodes[i];
	};
};