const facebookDivHostnames = ["www.facebook.com", "www.messenger.com"];

let customExchange = [["--", "–"], ["---", "—"]];
let storageCustomExchanges = {};
let justUndone = false;
let enabled;
let enablePasswords;
let previous;
let active;
let pastExchangeExists = false;
let futureCharacter = false;
let nextEnd = -2;
let indexRetention = -1;
let facebookEditableDivs = false;

function checkHostname() {
	for (let i = 0; i < facebookDivHostnames.length; i++)
		if (window.location.hostname === facebookDivHostnames[i]) {
			facebookEditableDivs = true;
			break;
		}
}
checkHostname();

loadDataFromStorage();

document.onkeypress = function(evt) {
	evt = evt || window.event;
	let charCode = evt.which || evt.keyCode;
	let charString = String.fromCharCode(charCode);
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
		}	else if (pastExchangeExists && !justUndone && charString !== futureCharacter)
			current = swap(current, currentIndex, pastExchangeExists[0].length, pastExchangeExists);
		else	{
			pastExchangeExists = false;
			futureCharacter = false;
		}
		justUndone = false;
	}
	previous = current;
}

document.onkeyup = function (evt) {
	/* Handles some annoying facebook bug */
	if (nextEnd === 0 || nextEnd === -1) {
		if (indexRetention > getActiveText().length)
			indexRetention = getActiveText().length;
		setCaretPosition(active, indexRetention);
	}
	if (nextEnd >= -1)
		nextEnd--;
}

function swap(current, currentIndex, exchangeLength, exchange) {
	current = current.substring(0, currentIndex - exchangeLength) + exchange[1] + current.substring(currentIndex);
	setActiveText(current);
	indexRetention = currentIndex + exchange[1].length - exchangeLength;
	setCaretPosition(active, indexRetention);
	pastExchangeExists = false;
	if (facebookEditableDivs && !isString(active.value))
		nextEnd = 1;
	return current;
}

document.onkeydown = function(evt) {
	evt = evt || window.event;
	let charCode = evt.keyCode || evt.which;
	if (enabled && charCode === 8 || charCode === 46) {
		active = getActive(evt.target);
		// console.l");
		if (!active)
			return;
		indexRetention--;
		current = getActiveText();
		let currentIndex = doGetCaretPosition(active);
		if (currentIndex === false)
			return;
		if (facebookEditableDivs && !isString(active.value)) {
			current = previous;
			currentIndex++;
		}
		// console.log(current, currentIndex, active, active.innerHTML);
		// let current = active.value === undefined ? previous:getActiveText();
		// if (current === undefined)
		// if (active.value === undefined)
		// 	currentIndex++;
		let exchange = getChange(current, currentIndex);
		if (exchange) {
			current = current.substring(0, currentIndex - exchange[1].length) + exchange[0] + current.substring(currentIndex);
			setActiveText(current);
			indexRetention = currentIndex - exchange[1].length + exchange[0].length;
			setCaretPosition(active, indexRetention);
			justUndone = true;
			previous = current;
			nextEnd = 1;
			return false;
		}
		// if (active.value === undefined) {
		// 	current = current.substring(0, currentIndex) + current.substring(currentIndex + 1);
		// 	setActiveText(current);
		// 	setCaretPosition(active, currentIndex - 1);
		// 	previous = current;
		// 	return false;
		// }
		previous = getActiveText();
	}	else if (charCode === 37)
		indexRetention--;
	else if (charCode === 39)
		indexRetention++;
	// previous = getActiveText();
}

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

function getDifferingIndex(s1, s2) {
	let shorterLength = s1.length < s2.length ? s1.length:s2.length;
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
function doGetCaretPosition (oField) {
	if (oField.selectionStart && oField.selectionStart !== oField.selectionEnd)
		return false;
	if (isString(oField.nodeValue))
		return getCaretCharacterOffsetWithin(oField);
	if (!isString(oField.value))
		return getCaretPosition(oField);
	let iCaretPos = 0;
	if (document.selection) {
		oField.focus();
		let oSel = document.selection.createRange();
		oSel.moveStart('character', -oField.value.length);
		iCaretPos = oSel.text.length;
	}	else if (oField.selectionStart || oField.selectionStart == '0')
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
  } else if (document.selection && document.selection.createRange) {
	range = document.selection.createRange();
	if (range.parentElement() == editableDiv) {
	  let tempEl = document.createElement("span");
	  editableDiv.insertBefore(tempEl, editableDiv.firstChild);
	  let tempRange = range.duplicate();
	  tempRange.moveToElementText(tempEl);
	  tempRange.setEndPoint("EndToEnd", range);
	  caretPos = tempRange.text.length;
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
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        let textRange = sel.createRange();
        let preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

function setCaretPosition(ctrl, pos)	{
	if (!isString(ctrl.value)) {
		setCaretPositionDiv(ctrl, pos);
	} else if (ctrl.setSelectionRange)	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}	else if (ctrl.createTextRange) {
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
	} else if (document.selection) {
		let textRange = document.body.createTextRange();
		textRange.moveToElementText(containerEl);
		textRange.collapse(true);
		textRange.moveEnd("character", end);
		textRange.moveStart("character", start);
		textRange.select();
	}
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
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
				for (let i = 1; i <= customExchangeInfo.numFiles; i++) {
					let k = "customExchange" + (i === 1 ? '':i);
					let exchange = changes[k];
					if (exchange)
						storageCustomExchanges[k] = exchange.newValue;
				}
				concatCustomExchanges(customExchangeInfo);
				break;
		}
	}
});

function concatCustomExchanges(customExchangeInfo) {
	customExchange = new Array(customExchangeInfo.numExchanges);
	let count = 0;
	for (let a = 1; a <= customExchangeInfo.numFiles; a++) {
		let exchanges = storageCustomExchanges["customExchange" + (a === 1 ? '':a)];
		for (let i = 0; i < exchanges.length; i++, count++)
			customExchange[count] = exchanges[i];
	}
}

function loadAndConcatCustomExchanges(customExchangeInfo, index, count) {
	let key = "customExchange" + (index === 1 ? '':index);
	chrome.storage.sync.get(key, function (result) {
		let exchanges = result[key];
		storageCustomExchanges[key] = exchanges;
		for (let i = 0; i < exchanges.length; i++, count++)
			customExchange[count] = exchanges[i];
		if (index < customExchangeInfo.numFiles)
			loadAndConcatCustomExchanges(customExchangeInfo, index + 1, count);
		else if (customExchangeInfo.sorted !== true)
			sortCustomExchange();
	});
}

function loadDataFromStorage() {
	let details = ['initialMark', 'dashEnabled', 'enablePasswords', 'customExchangeInfo'];
	chrome.storage.sync.get("initialMark", function (result) {
		if (result.initialMark) {
			chrome.storage.sync.get("dashEnabled", function (result) {
				enabled = result.dashEnabled;
			});
			chrome.storage.sync.get("enablePasswords", function (result) {
				enablePasswords = result.enablePasswords;
			});
			chrome.storage.sync.get("customExchangeInfo", function (result) {
				let customExchangeInfo = result["customExchangeInfo"];
				customExchange = new Array(customExchangeInfo.numExchanges);
				loadAndConcatCustomExchanges(customExchangeInfo, 1, 0);
			});
		}	else {
			chrome.storage.sync.set({"dashEnabled": true});
			chrome.storage.sync.set({"enablePasswords": false});
			saveCustomExchange(customExchange, 0, 0);
			chrome.storage.sync.set({"initialMark": true});
		}
		chrome.storage.sync.set({"currentVersion": chrome.runtime.getManifest().version});
	});
}