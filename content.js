let customExchange = [["--", "–"], ["---", "—"]];

let justUndone = false;
let enabled;
let enablePasswords;
let previous;
let active;
let pastExchangeExists = false;
let futureCharacter = false;
let nextEnd = -2;
let indexRetention = -1;

loadDataFromStorage();

document.addEventListener('keypress', (evt) => {
	if (evt.ctrlKey)
		return;
	let charString = evt.key;
	active = getActive(evt.target);
	if (!active)
		return;
	indexRetention++;
	let current = getActiveText();
	let currentIndex = doGetCaretPosition(active);
	if (enabled && current && currentIndex !== false) {
		let nextString = current.substring(0, currentIndex) + charString + current.substring(currentIndex);
		let exchange = getExchange(nextString, currentIndex + 1);
		if (exchange) {
			futureCharacter = possibleFutureExchangeCharacter(nextString, currentIndex + 1, exchange);
			if (futureCharacter !== false)
				pastExchangeExists = exchange;
			else {
				current = swap(current, currentIndex, exchange[0].length - 1, exchange);
				evt.preventDefault();
			}
		} else if (pastExchangeExists && !justUndone && charString !== futureCharacter)
			current = swap(current, currentIndex, pastExchangeExists[0].length, pastExchangeExists);
		else {
			pastExchangeExists = false;
			futureCharacter = false;
		}
		justUndone = false;
	}
	previous = current;
}, true);




document.addEventListener('keyup', (evt) => {
	/* Handles some annoying facebook bug */
	if (nextEnd === 0 || nextEnd === -1) {
		if (indexRetention > getActiveText().length)
			indexRetention = getActiveText().length;
		setCaretPosition(active, indexRetention);
	}
	if (nextEnd >= -1)
		nextEnd--;
}, true);


function swap(current, currentIndex, exchangeLength, exchange) {
	current = current.substring(0, currentIndex - exchangeLength) + exchange[1] + current.substring(currentIndex);
	setActiveText(current);
	indexRetention = currentIndex + exchange[1].length - exchangeLength;
	setCaretPosition(active, indexRetention);
	pastExchangeExists = false;
	if (needsComplexHandling(active))
		nextEnd = 1;
	return current;
}


document.addEventListener('keydown', (evt) => {
	if (evt.ctrlKey)
		return;
	if (enabled && (evt.key === 'Backspace' || evt.key === 'Delete')) {
		active = getActive(evt.target);
		if (!active)
			return;
		indexRetention--;
		current = getActiveText();
		let currentIndex = doGetCaretPosition(active);
		if (currentIndex === false)
			return;
		if (needsComplexHandling(active)) {
			current = previous;
			currentIndex++;
		}
		let exchange = getChange(current, currentIndex);
		if (exchange) {
			current = current.substring(0, currentIndex - exchange[1].length) + exchange[0] + current.substring(currentIndex);
			setActiveText(current);
			indexRetention = currentIndex - exchange[1].length + exchange[0].length;
			setCaretPosition(active, indexRetention);
			justUndone = true;
			previous = current;
			nextEnd = 1;
			evt.preventDefault();
			return;
		}
		previous = getActiveText();
	} else if (evt.key === 'ArrowLeft')
		indexRetention--;
	else if (evt.key === 'ArrowRight')
		indexRetention++;
}, true);


function getActiveText() {
	if (isString(active.value))
		return active.value;
	else if (isString(active.nodeValue))
		return active.nodeValue;
	else return active.innerHTML;
}

function setActiveText(text) {
	if (isString(active.value))
		active.value = text;
	else if (isString(active.nodeValue))
		active.nodeValue = text;
	else active.firstChild.nodeValue = text;
}

function getActive(elem) {
	const selection = window.getSelection();
	if ((!isString(elem.value) && !isString(elem.nodeValue)) &&
		selection && selection.rangeCount > 0 && selection.focusNode && selection.focusNode.nodeType === 3) {
		return selection.focusNode;
	}

	while (!isString(elem.value) && !isString(elem.nodeValue) && elem.childNodes.length > 0)
		elem = chooseChild(elem);
	if (!enablePasswords && elem.type && elem.type === 'password')
		return false;
	return elem;
}

function chooseChild(elem) {
	let children = elem.childNodes;
	for (let i = 0; i < children.length; i++)
		if (isString(children[i].value))
			return children[i];

	for (let i = 0; i < children.length; i++)
		if (isString(children[i].nodeValue))
			return children[i];

	return children[0];
}

function isString(value) {
	return typeof value === 'string';
}

function needsComplexHandling(elem) {
	if (isString(elem.value)) return false;
	// Check for Lexical editor
	if (elem.closest && elem.closest('[data-lexical-editor="true"]')) return true;
	return false;
}

function getDifferingIndex(s1, s2) {
	let shorterLength = s1.length < s2.length ? s1.length : s2.length;
	let i;
	for (i = 0; i < shorterLength; i++)
		if (s1.charAt(i) !== s2.charAt(i))
			return i;
	if (i === shorterLength)
		return shorterLength;
	return -1;
}

function countDashes(str, index) {
	let count = 0;
	for (index -= 1; index >= 0; index--, count++)
		if (str.charAt(index) !== '-')
			return count;
	return count;
}

function getExchange(str, index) {
	let longest = false;
	for (let i = 0; i < customExchange.length; i++)
		if (!longest || customExchange[i][0].length > longest[0].length)
			if (index >= customExchange[i][0].length && str.substring(index - customExchange[i][0].length, index) === customExchange[i][0])
				longest = customExchange[i];
	return longest;
}

function countExchanges(str, index, exchange) {
	let exchanges = 0;
	let len = exchange[0].length;
	for (let i = 0; i < customExchange.length; i++)
		if (exchange[0] === customExchange[i][0].substring(0, len))
			exchanges++;
	return exchanges;
}

function possibleFutureExchangeCharacter(str, index, exchange) {
	let len = exchange[0].length;
	for (let i = 0; i < customExchange.length; i++)
		if (customExchange[i][0].length > len && exchange[0] === customExchange[i][0].substring(0, len))
			return customExchange[i][0].charAt(len);
	return false;
}

function getChange(str, index) {
	for (let i = 0; i < customExchange.length; i++)
		if (index >= customExchange[i][1].length && str.substring(index - customExchange[i][1].length, index) === customExchange[i][1])
			return customExchange[i];
	return false;
}

/*
** Returns the caret (cursor) position of the specified text field.
** Return value range is 0-oField.value.length.
*/
function doGetCaretPosition(oField) {
	if (oField.tagName === 'INPUT' && oField.type !== 'text')
		return false;
	if (oField.selectionStart && oField.selectionStart !== oField.selectionEnd)
		return false;
	if (isString(oField.nodeValue))
		return getCaretCharacterOffsetWithin(oField);
	if (needsComplexHandling(oField))
		return getCaretPosition(oField);
	let iCaretPos = 0;
	if (oField.selectionStart || oField.selectionStart == '0')
		iCaretPos = oField.selectionStart;
	return iCaretPos;
}

function getCaretPosition(editableDiv) {
	let caretPos = 0,
		sel, range;
	if (window.getSelection) {
		sel = window.getSelection();
		if (sel.rangeCount) {
			range = sel.getRangeAt(0);
			if (range.commonAncestorContainer.parentNode == editableDiv) {
				caretPos = range.endOffset;
				if (range.endOffset !== range.startOffset)
					return false;
			}
		}
	}
	if (caretPos < 0)
		caretPos = 0;
	return caretPos;
}

/* Originally from here:
 * http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
 */
function getCaretCharacterOffsetWithin(element) {
	let caretOffset = 0;
	let doc = element.ownerDocument || element.document;
	let win = doc.defaultView || doc.parentWindow;
	let sel;
	if (typeof win.getSelection != "undefined") {
		sel = win.getSelection();
		if (sel.rangeCount > 0) {
			let range = win.getSelection().getRangeAt(0);
			let preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
		}
	}
	return caretOffset;
}

function setCaretPosition(ctrl, pos) {
	if (!isString(ctrl.value)) {
		setCaretPositionDiv(ctrl, pos);
	} else if (ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(pos, pos);
	} else if (ctrl.createTextRange) {
		let range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}

function setCaretPositionDiv(containerEl, pos) {
	start = end = pos;

	if (window.getSelection && document.createRange) {
		let charIndex = 0, range = document.createRange();
		range.setStart(containerEl, 0);
		range.collapse(true);
		let nodeStack = [containerEl], node, foundStart = false, stop = false;

		while (!stop && (node = nodeStack.pop())) {
			if (node.nodeType == 3) {
				let nextCharIndex = charIndex + node.length;
				if (!foundStart && start >= charIndex && start <= nextCharIndex) {
					range.setStart(node, start - charIndex);
					foundStart = true;
				}
				if (foundStart && end >= charIndex && end <= nextCharIndex) {
					range.setEnd(node, end - charIndex);
					stop = true;
				}
				charIndex = nextCharIndex;
			} else {
				let i = node.childNodes.length;
				while (i--) {
					nodeStack.push(node.childNodes[i]);
				}
			}
		}

		let sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

chrome.storage.onChanged.addListener((changes, namespace) => {
	for (key in changes) {
		switch (key) {
			case "dashEnabled":
				enabled = changes[key].newValue;
				break;
			case "enablePasswords":
				enablePasswords = changes[key].newValue;
				break;
			case "customExchangeInfo":
				let customExchangeInfo = changes[key].newValue;
				loadAllExchanges(customExchangeInfo).then((exchanges) => {
					customExchange = exchanges;
				});
				break;
		}
	}
});

function loadDataFromStorage() {
	let details = ['initialMark', 'dashEnabled', 'enablePasswords', 'customExchangeInfo'];
	chrome.storage.sync.get("initialMark", (result) => {
		if (result.initialMark) {
			chrome.storage.sync.get("dashEnabled", (result) => {
				enabled = result.dashEnabled;
			});
			chrome.storage.sync.get("enablePasswords", (result) => {
				enablePasswords = result.enablePasswords;
			});
			chrome.storage.sync.get("customExchangeInfo", async (result) => {
				let customExchangeInfo = result["customExchangeInfo"];
				customExchange = await loadAllExchanges(customExchangeInfo);
			});
		} else {
			chrome.storage.sync.set({ "dashEnabled": true });
			chrome.storage.sync.set({ "enablePasswords": false });
			saveCustomExchange(customExchange, 0, 0);
			chrome.storage.sync.set({ "initialMark": true });
		}
		chrome.storage.sync.set({ "currentVersion": chrome.runtime.getManifest().version });
	});
}
