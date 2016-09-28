
function findExchangeIndex(alias) {
	var minIndex = 0, maxIndex = customExchange.length, midIndex, comparison;
	while (minIndex < maxIndex) {
		midIndex = (maxIndex + minIndex) / 2 | 0;
		comparison = alias.localeCompare(customExchange[midIndex][0]);
		if (comparison < 0)
			maxIndex = midIndex;
		else if (comparison > 0)
			minIndex = midIndex + 1;
		else return [true, midIndex];
	}
	return [false, comparison > 0 ? midIndex + 1:midIndex];
}

function getExchangeIndex(alias) {
	var minIndex = 0, maxIndex = customExchange.length, midIndex, comparison;
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
	mergesort(customExchange, function (exchange1, exchange2) {
		return exchange1[0].localeCompare(exchange2[0]);
	});
}

var mergesort = function (array, /* optional */ cmp) {
	/*
		Merge sort.
		On average, two orders of magnitude faster than Array.prototype.sort() for
		large arrays, with potentially many equal elements.
		Note that the default comparison function does not coerce its arguments to strings.
	*/

	if (cmp === undefined) {
		// Note: This is not the same as the default behavior for Array.prototype.sort(),
		// which coerces elements to strings before comparing them.
		cmp = function (a, b) {
			'use asm';
			return a < b ? -1 : a === b ? 0 : 1;
		};
	}

	function merge (begin, beginRight, end) {
		'use asm';
		// Create a copy of the left and right halves.
		var leftSize = beginRight - begin, rightSize = end - beginRight;
		var left = array.slice(begin, beginRight), right = array.slice(beginRight, end);
		// Merge left and right halves back into original array.
		var i = begin, j = 0, k = 0;
		while (j < leftSize && k < rightSize)
			if (cmp(left[j], right[k]) <= 0)
				array[i++] = left[j++];
			else
				array[i++] = right[k++];
		// At this point, at least one of the two halves is finished.
		// Copy any remaining elements from left array back to original array.
		while (j < leftSize) array[i++] = left[j++];
		// Copy any remaining elements from right array back to original array.
		while (k < rightSize) array[i++] = right[k++];
		return;
	}

	function msort (begin, end) {
		'use asm';
		var size = end - begin;
		if (size <= 8) {
			// By experimentation, the sort is fastest when using native sort for
			// arrays with a maximum size somewhere between 4 and 16.
			// This decreases the depth of the recursion for an array size where
			// O(n^2) sorting algorithms are acceptable.
			var subArray = array.slice(begin, end);
			subArray.sort(cmp);
			// Copy the sorted array back to the original array.
			for (var i = 0; i < size; ++i)
				array[begin + i] = subArray[i];
			return;
		}

		var beginRight = begin + (size >> 1);

		msort(begin, beginRight);
		msort(beginRight, end);
		merge(begin, beginRight, end);
	}

	msort(0, array.length);

	return array;
};

function trueElemWidth(elem) {
	var rect = elem.getBoundingClientRect();
	return rect.right - rect.left
}

function trueElemHeight(elem) {
	var rect = elem.getBoundingClientRect();
	return rect.bottom - rect.top
}