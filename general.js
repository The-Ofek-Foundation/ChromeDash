function saveCustomExchange(customExchange, saveCount, currentNumFiles) {
	let customExchangesJson = JSON.stringify(customExchange);
	let customExchangesByteCount = byteCount(customExchangesJson);
	let numSplits = 1;
	let set = {};
	let fileSizeCutoff = 7500;
	if (customExchangesByteCount > 100000) {
		alert("Too many aliases!");
		return;
	} else if (customExchangesByteCount > fileSizeCutoff) {
		numSplits = customExchangesByteCount / fileSizeCutoff + 1 | 0;
		let splitStart = 0, splitEnd;
		for (let i = 1; i <= numSplits; i++) {
			splitEnd = getSplitEnd(splitStart, fileSizeCutoff);
			set["customExchange" + (i === 1 ? '' : i)] = customExchange.slice(splitStart, splitEnd);
			splitStart = splitEnd;
		}
	} else set["customExchange"] = customExchange;
	saveCount++;
	set["customExchangeInfo"] = {
		"numExchanges": customExchange.length,
		"numFiles": numSplits,
		"byteCount": customExchangesByteCount,
		"saveCount": saveCount, // to trigger change event
		"sorted": true,
	};
	chrome.storage.sync.set(set);
	if (numSplits < currentNumFiles) {
		let remove = new Array(currentNumFiles - numSplits);
		for (let i = numSplits + 1, count = 0; i <= currentNumFiles; i++, count++)
			remove[count] = "customExchange" + (i === 1 ? '' : i);
		chrome.storage.sync.remove(remove);
	}
	currentNumFiles = numSplits;
	return [saveCount, currentNumFiles];
}

function getSplitEnd(start, size) {
	for (; start < customExchange.length && size > 0; start++)
		size -= byteCount(customExchange[start][0] + customExchange[start][1]) + 8;
	return size <= 0 ? (start - 1) : start;
}

function byteCount(s) {
	return encodeURI(s).split(/%..|./).length - 1;
}

function findExchangeIndex(alias) {
	let minIndex = 0, maxIndex = customExchange.length, midIndex, comparison;
	while (minIndex < maxIndex) {
		midIndex = (maxIndex + minIndex) / 2 | 0;
		comparison = alias.localeCompare(customExchange[midIndex][0]);
		if (comparison < 0)
			maxIndex = midIndex;
		else if (comparison > 0)
			minIndex = midIndex + 1;
		else return [true, midIndex];
	}
	return [false, comparison > 0 ? midIndex + 1 : midIndex];
}

function getExchangeIndex(alias) {
	let minIndex = 0, maxIndex = customExchange.length, midIndex, comparison;
	while (minIndex < maxIndex) {
		midIndex = (maxIndex + minIndex) / 2 | 0;
		comparison = alias.localeCompare(customExchange[midIndex][0]);
		if (comparison < 0)
			maxIndex = midIndex;
		else if (comparison > 0)
			minIndex = midIndex + 1;
		else return midIndex;
	}
	return -1;
}

function sortCustomExchange() {
	customExchange.sort((exchange1, exchange2) => {
		return exchange1[0].localeCompare(exchange2[0]);
	});
}

function trueElemWidth(elem) {
	let rect = elem.getBoundingClientRect();
	return rect.right - rect.left
}

function trueElemHeight(elem) {
	let rect = elem.getBoundingClientRect();
	return rect.bottom - rect.top
}