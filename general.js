
function find_exchange_index(alias) {
	var min_index = 0, max_index = custom_exchange.length, mid_index, comparison;
	while (min_index < max_index) {
		mid_index = (max_index + min_index) / 2 | 0;
		comparison = alias.localeCompare(custom_exchange[mid_index][0]);
		if (comparison < 0)
			max_index = mid_index;
		else if (comparison > 0)
			min_index = mid_index + 1;
		else return [true, mid_index];
	}
	return [false, comparison > 0 ? mid_index + 1:mid_index];
}

function get_exchange_index(alias) {
	var min_index = 0, max_index = custom_exchange.length, mid_index, comparison;
	while (min_index < max_index) {
		mid_index = (max_index + min_index) / 2 | 0;
		comparison = alias.localeCompare(custom_exchange[mid_index][0]);
		if (comparison < 0)
			max_index = mid_index;
		else if (comparison > 0)
			min_index = mid_index + 1;
		else return mid_index;
	}
	return -1;
}

function sort_custom_exchange() {
	mergesort(custom_exchange, function (exchange1, exchange2) {
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

	function merge (begin, begin_right, end) {
		'use asm';
		// Create a copy of the left and right halves.
		var left_size = begin_right - begin, right_size = end - begin_right;
		var left = array.slice(begin, begin_right), right = array.slice(begin_right, end);
		// Merge left and right halves back into original array.
		var i = begin, j = 0, k = 0;
		while (j < left_size && k < right_size)
			if (cmp(left[j], right[k]) <= 0)
				array[i++] = left[j++];
			else
				array[i++] = right[k++];
		// At this point, at least one of the two halves is finished.
		// Copy any remaining elements from left array back to original array.
		while (j < left_size) array[i++] = left[j++];
		// Copy any remaining elements from right array back to original array.
		while (k < right_size) array[i++] = right[k++];
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
			var sub_array = array.slice(begin, end);
			sub_array.sort(cmp);
			// Copy the sorted array back to the original array.
			for (var i = 0; i < size; ++i)
				array[begin + i] = sub_array[i];
			return;
		}

		var begin_right = begin + (size >> 1);

		msort(begin, begin_right);
		msort(begin_right, end);
		merge(begin, begin_right, end);
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