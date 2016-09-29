const facebookDivHostnames = ["www.facebook.com", "www.messenger.com"];

var customExchange = [["--", "–"], ["---", "—"]];
var storageCustomExchanges = {};
var justUndone = false;
var enabled;
var enablePasswords;
var previous;
var active;
var pastExchangeExists = false;
var futureCharacter = false;
var nextEnd = -1;

var facebookEditableDivs = false;

function checkHostname() {
	for (var i = 0; i < facebookDivHostnames.length; i++)
		if (window.location.hostname === facebookDivHostnames[i]) {
			facebookEditableDivs = true;
			break;
		}
}
checkHostname();

loadDataFromStorage();

document.onkeypress = function(evt) {
	evt = evt || window.event;
	var charCode = evt.which || evt.keyCode;
	var charString = String.fromCharCode(charCode);
	active = getActive(evt.target);
	if (!active)
		return;
	var current = getActiveText();
	var currentIndex = doGetCaretPosition(active);
	if (enabled && current && currentIndex !== false) {
		var nextString = current.substring(0, currentIndex) + charString + current.substring(currentIndex);
		var exchange = getExchange(nextString, currentIndex + 1);
		if (exchange) {
			futureCharacter = possibleFutureExchangeCharacter(nextString, currentIndex + 1, exchange);
			if (futureCharacter !== false)
				pastExchangeExists = exchange;
			else {
				current = swap(current, currentIndex, exchange[0].length - 1, exchange);
				evt.preventDefault();
			}
		}
		else if (pastExchangeExists && !justUndone && charString !== futureCharacter)
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
	if (nextEnd === 0)
		setCaretPosition(active, getActiveText().length);
	if (nextEnd >= 0)
		nextEnd--;
}

function swap(current, currentIndex, exchangeLength, exchange) {
	current = current.substring(0, currentIndex - exchangeLength) + exchange[1] + current.substring(currentIndex);
	setActiveText(current);
	setCaretPosition(active, currentIndex + exchange[1].length - exchangeLength);
	pastExchangeExists = false;
	if (facebookEditableDivs && active.value === undefined)
		nextEnd = 1;
	return current;
}

document.onkeydown = function(evt) {
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	if (enabled && charCode === 8 || charCode === 46) {
		active = getActive(evt.target);
		if (!active)
			return;
		current = getActiveText();
		var currentIndex = doGetCaretPosition(active);
		if (currentIndex === false)
			return;
		// console.log(facebookEditableDivs, active.value);
		if (facebookEditableDivs && active.value === undefined) {
			current = previous;
			currentIndex++;
		}
		// console.log(current, currentIndex, active, active.innerHTML);
		// var current = active.value === undefined ? previous:getActiveText();
		// if (current === undefined)
		// if (active.value === undefined)
		// 	currentIndex++;
		var exchange = getChange(current, currentIndex);
		if (exchange) {
			current = current.substring(0, currentIndex - exchange[1].length) + exchange[0] + current.substring(currentIndex);
			setActiveText(current);
			setCaretPosition(active, currentIndex - exchange[1].length + exchange[0].length);
			justUndone = true;
			previous = current;
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
	}
	// previous = getActiveText();
}

function getActiveText() {
	if (active.value !== undefined)
		return active.value;
	else return active.innerHTML;
}

function setActiveText(text) {
	if (active.value !== undefined)
		active.value = text;
	else active.firstChild.nodeValue = text;
}

function getActive(elem) {
	if (elem.value === undefined)
		while (elem.children.length > 0)
			elem = elem.children[0];
	if (!enablePasswords && elem.type && elem.type === 'password')
		return false;
	return elem;
}

function getDifferingIndex(s1, s2) {
	var shorterLength = s1.length < s2.length ? s1.length:s2.length;
	var i;
	for (i = 0; i < shorterLength; i++)
		if (s1.charAt(i) !== s2.charAt(i))
			return i;
	if (i === shorterLength)
		return shorterLength;
	return -1;
}

function countDashes(str, index) {
	var count = 0;
	for (index -= 1; index >= 0; index--, count++)
		if (str.charAt(index) !== '-')
			return count;
	return count;
}

function getExchange(str, index) {
	var longest = false;
	for (var i = 0; i < customExchange.length; i++)
		if (!longest || customExchange[i][0].length > longest[0].length)
			if (index >= customExchange[i][0].length && str.substring(index - customExchange[i][0].length, index) === customExchange[i][0])
				longest = customExchange[i];
	return longest;
}

function countExchanges(str, index, exchange) {
	var exchanges = 0;
	var len = exchange[0].length;
	for (var i = 0; i < customExchange.length; i++)
		if (exchange[0] === customExchange[i][0].substring(0, len))
			exchanges++;
	return exchanges;
}

function possibleFutureExchangeCharacter(str, index, exchange) {
	var len = exchange[0].length;
	for (var i = 0; i < customExchange.length; i++)
		if (customExchange[i][0].length > len && exchange[0] === customExchange[i][0].substring(0, len))
			return customExchange[i][0].charAt(len);
	return false;
}

function getChange(str, index) {
	for (var i = 0; i < customExchange.length; i++)
		if (index >= customExchange[i][1].length && str.substring(index - customExchange[i][1].length, index) === customExchange[i][1])
			return customExchange[i];
	return false;
}

/*
** Returns the caret (cursor) position of the specified text field.
** Return value range is 0-oField.value.length.
*/
function doGetCaretPosition (oField) {
	if (oField.value === undefined)
		return getCaretPosition(oField);
	if (oField.selectionStart !== oField.selectionEnd)
		return false;
	var iCaretPos = 0;
	if (document.selection) {
		oField.focus();
		var oSel = document.selection.createRange();
		oSel.moveStart('character', -oField.value.length);
		iCaretPos = oSel.text.length;
	}
	else if (oField.selectionStart || oField.selectionStart == '0')
		iCaretPos = oField.selectionStart;
	return iCaretPos;
}

function getCaretPosition(editableDiv) {
  var caretPos = 0,
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
	  var tempEl = document.createElement("span");
	  editableDiv.insertBefore(tempEl, editableDiv.firstChild);
	  var tempRange = range.duplicate();
	  tempRange.moveToElementText(tempEl);
	  tempRange.setEndPoint("EndToEnd", range);
	  caretPos = tempRange.text.length;
	}
  }
  if (caretPos < 0)
  	caretPos = 0;
  return caretPos;
}

function setCaretPosition(ctrl, pos)	{
	if (ctrl.value === undefined) {
		setCaretPositionDiv(ctrl, pos);
	} else if (ctrl.setSelectionRange)	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}	else if (ctrl.createTextRange) {
		var range = ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd('character', pos);
		range.moveStart('character', pos);
		range.select();
	}
}

function setCaretPositionDiv(containerEl, pos) {
	start = end = pos;

	if (window.getSelection && document.createRange) {
		var charIndex = 0, range = document.createRange();
		range.setStart(containerEl, 0);
		range.collapse(true);
		var nodeStack = [containerEl], node, foundStart = false, stop = false;

		while (!stop && (node = nodeStack.pop())) {
			if (node.nodeType == 3) {
				var nextCharIndex = charIndex + node.length;
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
				var i = node.childNodes.length;
				while (i--) {
					nodeStack.push(node.childNodes[i]);
				}
			}
		}

		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else if (document.selection) {
		var textRange = document.body.createTextRange();
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
				var customExchangeInfo = changes[key].newValue;
				for (var i = 1; i <= customExchangeInfo.numFiles; i++) {
					var k = "customExchange" + (i === 1 ? '':i);
					var exchange = changes[k];
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
	var count = 0;
	for (var a = 1; a <= customExchangeInfo.numFiles; a++) {
		var exchanges = storageCustomExchanges["customExchange" + (a === 1 ? '':a)];
		for (var i = 0; i < exchanges.length; i++, count++)
			customExchange[count] = exchanges[i];
	}
}

function loadAndConcatCustomExchanges(customExchangeInfo, index, count) {
	var key = "customExchange" + (index === 1 ? '':index);
	chrome.storage.sync.get(key, function (result) {
		var exchanges = result[key];
		storageCustomExchanges[key] = exchanges;
		for (var i = 0; i < exchanges.length; i++, count++)
			customExchange[count] = exchanges[i];
		if (index < customExchangeInfo.numFiles)
			loadAndConcatCustomExchanges(customExchangeInfo, index + 1, count);
		else if (customExchangeInfo.sorted !== true)
			sortCustomExchange();
	});
}

function loadDataFromStorage() {
	var details = ['initialMark', 'dashEnabled', 'enablePasswords', 'customExchangeInfo'];
	chrome.storage.sync.get("initialMark", function (result) {
		if (result.initialMark) {
			chrome.storage.sync.get("dashEnabled", function (result) {
				enabled = result.dashEnabled;
			});
			chrome.storage.sync.get("enablePasswords", function (result) {
				enablePasswords = result.enablePasswords;
			});
			chrome.storage.sync.get("customExchangeInfo", function (result) {
				var customExchangeInfo = result["customExchangeInfo"];
				customExchange = new Array(customExchangeInfo.numExchanges);
				loadAndConcatCustomExchanges(customExchangeInfo, 1, 0);
			});
		}
		else {
			chrome.storage.sync.set({"dashEnabled": true});
			chrome.storage.sync.set({"enablePasswords": false});
			saveCustomExchange(customExchange, 0, 0);
			chrome.storage.sync.set({"initialMark": true});
		}
		chrome.storage.sync.set({"currentVersion": chrome.runtime.getManifest().version});
	});
}