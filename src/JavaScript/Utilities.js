export default class Utilities {

	/**
	 * Checks if the given node (as a string) is a valid fluid node. It has to starts with <myNamespace:myViewHelper...>
	 * and has to be a valid HTML.
	 *
	 * @param fluidNodeRaw
	 * @returns {boolean}
	 */
	static isFluidNode(fluidNodeRaw) {
		let a = document.createElement('div');
		let fluidRegExp = new RegExp('\<[a-zA-Z]+\:[a-zA-Z]+(.+?)\>');
		a.innerHTML = fluidNodeRaw;
		if (fluidRegExp.test(fluidNodeRaw)) {
			for (let c = a.childNodes, i = c.length; i--;) {
				if (c[i].nodeType === 1) return true;
			}
		}

		return false;
	}

	/**
	 * Returns the viewhelper name.
	 *
	 * @param fluidNode
	 * @returns {string}
	 */
	static getFluidViewHelperName(fluidNode) {
		return fluidNode[0].tagName;
	}

	/**
	 * Removes all indentation (tab, space) from the given fluid node.
	 *
	 * @param fluidNode
	 * @returns {Array}
	 */
	static sanitizeFluidNode(fluidNode) {
		fluidNode.forEach((tag, index) => {
			if (tag.chars) {
				if (!tag.chars.match(/[a-z]/i) && (/\r|\n/.exec(tag.chars) || /\s+/g.exec(tag.chars))) {
					fluidNode.splice(index, 1);
				} else {
					tag.chars = tag.chars.replace(/\n|\r/g, "");
					tag.chars = tag.chars.trim();
				}
			}
		});

		return fluidNode;
	}

	/**
	 * Converts a fluid node to its inline notation
	 *
	 * @param fluidNodeToConvert
	 * @returns {string}
	 */
	static convertFluidNode(fluidNodeToConvert) {
		let inline = '';
		let isComparaison;
		let attrs = fluidNodeToConvert[0].attributes;

		if (attrs) {
			let viewHelperName = Utilities.getFluidViewHelperName(fluidNodeToConvert);
			if (viewHelperName) {
				if (fluidNodeToConvert[1] && fluidNodeToConvert[1].type === 'Chars' && fluidNodeToConvert[0].tagName !== 'f:if') {
					inline = '{' + fluidNodeToConvert[1].chars.replace('{', '').replace('}', '') + ' -> ' + viewHelperName + '(';
				} else {
					inline = '{' + viewHelperName + '(';
				}
				attrs.forEach((attr, index) => {
					// Check if the attribute value contains an other fluid node
					if(/^((.*){[a-zA-Z]+:[a-zA-Z]+(.+?)}(.*))/.test(attr[1]) === true) {
						attr[1] = attr[1].replace(/'/g, "\\'");
					}
					// Check if the attribute value is a property. If it is, remove the useless {...}
					isComparaison = /^((.*) == (.*))/.test(attr[1]);
					if(/^({.*})/.test(attr[1]) === false && !isComparaison) {
						inline += attr[0] + ': \'' + attr[1];
						if (index < attrs.length - 1) {
							inline += '\', ';
						} else {
							inline += '\'';
						}
					} else if (isComparaison) {
						inline += attr[0] + ': ' + '\'<span class="hljs-string">' + attr[1] + '</span>\'';
						if (index < attrs.length - 1) {
							inline += ', ';
						}
					} else {
						inline += attr[0] + ': ' + '<span class="hljs-string">' + attr[1].replace('{', '').replace('}', '') + '</span>';
						if (index < attrs.length - 1) {
							inline += ', ';
						}
					}
				});
				if (viewHelperName === 'f:if' && fluidNodeToConvert[1]) {
					inline += ', then: \'' + fluidNodeToConvert[2].chars + '\'';
					if (fluidNodeToConvert[4] && (fluidNodeToConvert[5].chars)) {
						inline += ', ' + 'else: \'' + fluidNodeToConvert[5].chars + '\'';
					}
				}
				inline += ')}';
			}
		}

		return inline;
	}

    static printNode(node) {
		let line = '';
        if (node.chars) {
            line += node.chars;
        } else {
        	line += (node.type === 'EndTag' ? '&lt;/' : '&lt;') + node.tagName + '&gt;';
		}
        return line
    }
}