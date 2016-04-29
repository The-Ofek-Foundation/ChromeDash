const bad_div_hostnames = ["www.facebook.com", "www.messenger.com"];

var custom_exchange = [["--", "–"], ["---", "—"]];
var storage_custom_exchanges = {};
var just_undone = false;
var enabled;
var previous;
var active;
var past_exchange_exists = false;
var future_char = false;

var bad_editable_divs = false;

document.onload = function (evt) {
	for (var i = 0; i < bad_div_domains.length; i++)
		if (window.location.hostname === bad_div_hostnames[i]) {
			bad_editable_divs = true;
			break;
		}
}

load_data_from_storage();

document.onkeypress = function(evt) {
	evt = evt || window.event;
	var charCode = evt.which || evt.keyCode;
	var charString = String.fromCharCode(charCode);
	active = get_active(evt.target);
	var current = get_active_text();
	var curr_index = doGetCaretPosition(active);
	if (enabled && current) {
		var next_str = current.substring(0, curr_index) + charString + current.substring(curr_index);
		var exchange = get_exchange(next_str, curr_index + 1);
		if (exchange) {
			future_char = possible_future_exchange_char(next_str, curr_index + 1, exchange);
			if (future_char !== false)
				past_exchange_exists = exchange;
			else {
				current = swap(current, curr_index, exchange[0].length - 1, exchange);
				evt.preventDefault();
			}
		}
		else if (past_exchange_exists && !just_undone && charString !== future_char)
			current = swap(current, curr_index, past_exchange_exists[0].length, past_exchange_exists);
		else	{
			past_exchange_exists = false;
			future_char = false;
		}
		just_undone = false;
	}
	previous = current;
}

function swap(current, curr_index, exchange_len, exchange) {
	current = current.substring(0, curr_index - exchange_len) + exchange[1] + current.substring(curr_index);
	set_active_text(current);
	setCaretPosition(active, curr_index + exchange[1].length - exchange_len);
	past_exchange_exists = false;
	return current;
}

document.onkeydown = function(evt) {
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	if (enabled && charCode === 8 || charCode === 46) {
		active = get_active(evt.target);
		current = get_active_text();
		var curr_index = doGetCaretPosition(active);
		if (bad_editable_divs && active.value === undefined) {
			current = previous;
			curr_index++;
		}
		// console.log(current, curr_index, active, active.innerHTML);
		// var current = active.value === undefined ? previous:get_active_text();
		// if (current === undefined)
		// if (active.value === undefined)
		// 	curr_index++;
		var exchange = get_change(current, curr_index);
		if (exchange) {
			current = current.substring(0, curr_index - exchange[1].length) + exchange[0] + current.substring(curr_index);
			set_active_text(current);
			setCaretPosition(active, curr_index - exchange[1].length + exchange[0].length);
			just_undone = true;
			previous = current;
			return false;
		}
		// if (active.value === undefined) {
		// 	current = current.substring(0, curr_index) + current.substring(curr_index + 1);
		// 	set_active_text(current);
		// 	setCaretPosition(active, curr_index - 1);
		// 	previous = current;
		// 	return false;
		// }
		previous = get_active_text();
	}
	// previous = get_active_text();
}

function get_active_text() {
	if (active.value !== undefined)
		return active.value;
	else return active.innerHTML;
}

function set_active_text(text) {
	if (active.value !== undefined)
		active.value = text;
	else active.innerHTML = text;
}

function get_active(elem) {
	if (elem.value !== undefined)
		return elem;
	else while (elem.children.length > 0)
		elem = elem.children[0];
	return elem;
}

function get_diff_index(s1, s2) {
	var shorter_len = s1.length < s2.length ? s1.length:s2.length;
	var i;
	for (i = 0; i < shorter_len; i++)
		if (s1.charAt(i) !== s2.charAt(i))
			return i;
	if (i === shorter_len)
		return shorter_len;
	return -1;
}

function count_dashs(str, index) {
	var count = 0;
	for (index -= 1; index >= 0; index--, count++)
		if (str.charAt(index) !== '-')
			return count;
	return count;
}

function get_exchange(str, index) {
	var longest = false;
	for (var i = 0; i < custom_exchange.length; i++)
		if (!longest || custom_exchange[i][0].length > longest[0].length)
			if (index >= custom_exchange[i][0].length && str.substring(index - custom_exchange[i][0].length, index) === custom_exchange[i][0])
				longest = custom_exchange[i];
	return longest;
}

function count_exchanges(str, index, exchange) {
	var exchanges = 0;
	var len = exchange[0].length;
	for (var i = 0; i < custom_exchange.length; i++)
		if (exchange[0] === custom_exchange[i][0].substring(0, len))
			exchanges++;
	return exchanges;
}

function possible_future_exchange_char(str, index, exchange) {
	var len = exchange[0].length;
	for (var i = 0; i < custom_exchange.length; i++)
		if (custom_exchange[i][0].length > len && exchange[0] === custom_exchange[i][0].substring(0, len))
			return custom_exchange[i][0].charAt(len);
	return false;
}

function get_change(str, index) {
	for (var i = 0; i < custom_exchange.length; i++)
		if (index >= custom_exchange[i][1].length && str.substring(index - custom_exchange[i][1].length, index) === custom_exchange[i][1])
			return custom_exchange[i];
	return false;
}

/*
** Returns the caret (cursor) position of the specified text field.
** Return value range is 0-oField.value.length.
*/
function doGetCaretPosition (oField) {
	if (oField.value === undefined)
		return getCaretPosition(oField);
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
		return;
	}
	if (ctrl.setSelectionRange)	{
		ctrl.focus();
		ctrl.setSelectionRange(pos,pos);
	}
	else if (ctrl.createTextRange) {
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
			case "dash_enabled":
				enabled = changes[key].newValue;
				break;
			case "custom_exchange_info":
				var custom_exchange_info = changes[key].newValue;
				for (var i = 1; i <= custom_exchange_info.num_files; i++) {
					var k = "custom_exchange" + (i === 1 ? '':i);
					var exchange = changes[k];
					if (exchange)
						storage_custom_exchanges[k] = exchange.newValue;
				}
				concat_custom_exchanges(custom_exchange_info);
				break;
		}
	}
});

function concat_custom_exchanges(custom_exchange_info) {
	custom_exchange = new Array(custom_exchange_info.num_exchanges);
	var count = 0;
	for (var a = 1; a <= custom_exchange_info.num_files; a++) {
		var exchanges = storage_custom_exchanges["custom_exchange" + (a === 1 ? '':a)];
		for (var i = 0; i < exchanges.length; i++, count++)
			custom_exchange[count] = exchanges[i];
	}
}

function load_and_concat_custom_exchanges(custom_exchange_info, index, count) {
	var key = "custom_exchange" + (index === 1 ? '':index);
	chrome.storage.sync.get(key, function (result) {
		var exchanges = result[key];
		storage_custom_exchanges[key] = exchanges;
		for (var i = 0; i < exchanges.length; i++, count++)
			custom_exchange[count] = exchanges[i];
		if (index < custom_exchange_info.num_files)
			load_and_concat_custom_exchanges(custom_exchange_info, index + 1, count);
		else if (custom_exchange_info.sorted !== true)
			sort_custom_exchange();
	});
}

function load_data_from_storage() {
	chrome.storage.sync.get("initial_mark", function (result) {
		if (result.initial_mark) {
			chrome.storage.sync.get("dash_enabled", function (result) {
				enabled = result.dash_enabled;
			});
			chrome.storage.sync.get("custom_exchange_info", function (result) {
				var custom_exchange_info = result["custom_exchange_info"];
				custom_exchange = new Array(custom_exchange_info.num_exchanges);
				load_and_concat_custom_exchanges(custom_exchange_info, 1, 0);
			});
		}
		else {
			chrome.storage.sync.set({"dash_enabled": true});
			chrome.storage.sync.set({"custom_exchange": custom_exchange});
			chrome.storage.sync.set({"initial_mark": true});
		}
		chrome.storage.sync.set({"curr_version": chrome.runtime.getManifest().version});
	});
}