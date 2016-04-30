var input_dash = document.querySelector("input[name=enable-dash]");
var exchange_table_body = document.getElementById("exchange-table-body");
var exchange_header = document.getElementById("exchange-header");
var character_pack_select = document.getElementById("character-pack-select");
var custom_exchange = [["--", String.fromCharCode(8211)], ["---", String.fromCharCode(8212)]];
var header_widths = new Array(3);
var add_alias_form = document.getElementById("add-alias");
var remove_alias_form = document.getElementById("remove-alias");
var add_character_pack = document.getElementById("add-character-pack");
var remove_character_pack = document.getElementById("remove-character-pack");
var remove_all_aliases = document.getElementById("remove-all-aliases");
var add_basic_dashes = document.getElementById("add-basic-dashes");
var current_num_files, save_count;

const character_packs = {
	"EMPTY": [],
	"LOWERCASE_GREEK": [["\\alpha", 945], ["\\beta", 946], ["\\gamma", 947], ["\\delta", 948], ["\\epsilon", 949], ["\\zeta", 950], ["\\eta", 951], ["\\theta", 952], ["\\iota", 953], ["\\kappa", 954], ["\\lambda", 955], ["\\mu", 956], ["\\nu", 957], ["\\xi", 958], ["\\omicron", 959], ["\\pi", 960], ["\\rho", 961], ["\\sigmaf", 962], ["\\sigma", 963], ["\\tau", 964], ["\\upsilon", 965], ["\\phi", 966], ["\\chi", 967], ["\\psi", 968], ["\\omega", 969]],
	"UPPERCASE_GREEK": [["\\Alpha", 913], ["\\Beta", 914], ["\\Gamma", 915], ["\\Delta", 916], ["\\Epsilon", 917], ["\\Zeta", 918], ["\\Eta", 919], ["\\Theta", 920], ["\\Iota", 921], ["\\Kappa", 922], ["\\Lambda", 923], ["\\Mu", 924], ["\\Nu", 925], ["\\Xi", 926], ["\\Omicron", 927], ["\\Pi", 928], ["\\Rho", 929], ["\\Sigma", 931], ["\\Tau", 932], ["\\Upsilon", 933], ["\\Phi", 934], ["\\Chi", 935], ["\\Psi", 936], ["\\Omega", 937]],
	"ALL_LOWERCASE_ACCENTS": [["oe", 339], ["s^", 353], ["a`", 224], ["a'", 225], ["a^", 226], ["a~", 227], ["a:", 228], ["a*", 229], ["ae", 230], ["c,", 231], ["e`", 232], ["e'", 233], ["e^", 234], ["e:", 235], ["i`", 236], ["i'", 237], ["i^", 238], ["i:", 239], ["d-", 240], ["n~", 241], ["o`", 242], ["o'", 243], ["o^", 244], ["o~", 245], ["o:", 246], ["o/", 248], ["u`", 249], ["u'", 250], ["u^", 251], ["u:", 252], ["y'", 253], ["|p", 254], ["y:", 255]],
	"ALL_UPPERCASE_ACCENTS": [["Y:", 376], ["OE", 338], ["S^", 352], ["A`", 192], ["A'", 193], ["A^", 194], ["A~", 195], ["A:", 196], ["A*", 197], ["AE", 198], ["C,", 199], ["E`", 200], ["E'", 201], ["E^", 202], ["E:", 203], ["I`", 204], ["I'", 205], ["I^", 206], ["I:", 207], ["D-", 208], ["N~", 209], ["O`", 210], ["O'", 211], ["O^", 212], ["O~", 213], ["O:", 214], ["O/", 216], ["U`", 217], ["U'", 218], ["U^", 219], ["U:", 220], ["Y'", 221], ["|P", 222], ["B3", 223]],
	"MATH_SYMBOLS": [["<=", 8804], [">=", 8805], ["+-", 177], ["=/", 8800], ["\\div", 247], ["\\mult", 215], ["\\minus", 8722], ["\\fract", 8260], ["\\sqrt", 8730], ["\\cbrt", 8731], ["\\4rt", 8732], ["\\rel", 8733], ["\\inf", 8734], ["\\aleph", 8501], ["\\func", 402], ["\\prime", 8242], ["\\there4", 8756], ["\\dot", 8901], ["^0", 8304], ["^1", 185], ["^2", 178], ["^3", 179], ["^4", 8308], ["^5", 8309], ["^6", 8310], ["^7", 8311], ["^8", 8312], ["^9", 8313], ["^+", 8314], ["^-", 8315], ["^i", 8305], ["^n", 8319], ["1/4", 188], ["1/2", 189], ["3/4", 190], ["1/3", 8531], ["2/3", 8532], ["1/5", 8533], ["2/5", 8534], ["3/5", 8535], ["4/5", 8536], ["1/6", 8537], ["5/6", 8538], ["1/8", 8539], ["3/8", 8540], ["5/8", 8541], ["7/8", 8542], ["\\sum", 8721], ["\\prod", 8719], ["\\deg", 176], ["\\permil", 8240], ["\\int", 8747], ["\\part", 8706]],
};

// chrome.storage.sync.get(function (result) {
// 	console.log(result);
// });

function set_character_packs() {
	var i, pack;
	for (var key in character_packs) {
		pack = character_packs[key];
		for (i = 0; i < pack.length; i++)
			if (typeof pack[i][1] === "number")
				pack[i][1] = String.fromCharCode(pack[i][1]);
	}
}
set_character_packs();

function add_character_pack_options() {
	var option, pack;
	for (pack in character_packs) {
		if (pack === "EMPTY")
			continue;
		option = document.createElement("option");
		option.textContent = pack.replace(/_/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		option.value = pack;
		character_pack_select.add(option);
	}
}

document.addEventListener("DOMContentLoaded", function (event) {
	alignAddRemoveAliasForms();
	input_dash.addEventListener('change', function (event) {
		chrome.storage.sync.set({"dash_enabled": input_dash.checked});
	});
	add_alias_form.addEventListener('submit', function (event) {
		add_alias(add_alias_form.children[0].value, add_alias_form.children[1].value, true);
		add_alias_form.children[0].value = "";
		add_alias_form.children[1].value = "";
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;
	});
	remove_alias_form.addEventListener('submit', function (event) {
		remove_alias(remove_alias_form.children[0].value);
		remove_alias_form.children[0].value = "";
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;
	});
	add_character_pack.addEventListener('click', function (event) {
		add_pack(character_packs[character_pack_select.options[character_pack_select.selectedIndex].value]);
	});
	remove_character_pack.addEventListener('click', function (event) {
		remove_pack(character_packs[character_pack_select.options[character_pack_select.selectedIndex].value]);
	});
	remove_all_aliases.addEventListener('click', function (event) {
		removeAllAliases();
	});
	add_basic_dashes.addEventListener('click', function (event) {
		add_pack([["--", String.fromCharCode(8211)], ["---", String.fromCharCode(8212)]]);
	});
	exchange_table_body.addEventListener('click', function (event) {
		if (event.target.dataset.alias)
			remove_alias(event.target.dataset.alias, true);
	});
	add_character_pack_options();
	for (var i = 1; i <= 3; i++)
		header_widths[i-1] = exchange_header.querySelector("th:nth-child(" + i + ")").offsetWidth + "px";
});

function alignAddRemoveAliasForms() {
	var widthtop = add_alias_form.children[2].getBoundingClientRect().right - add_alias_form.children[0].getBoundingClientRect().left
	var widthbot = remove_alias_form.children[1].getBoundingClientRect().right - remove_alias_form.children[0].getBoundingClientRect().left
	remove_alias_form.children[1].style.width = trueElemWidth(remove_alias_form.children[1]) + widthtop - widthbot + "px";
}

chrome.storage.sync.get("dash_enabled", function (result) {
	var dash_enabled = result.dash_enabled;
	if (dash_enabled !== false)
		input_dash.checked = true;
	else input_dash.checked = false;
});

chrome.storage.sync.get("custom_exchange_info", function (result) {
	var custom_exchange_info = result["custom_exchange_info"];
	if (custom_exchange_info !== undefined) {
		custom_exchange = new Array(custom_exchange_info.num_exchanges);
		current_num_files = custom_exchange_info.num_files;
		save_count = custom_exchange_info.save_count;
		if (save_count === undefined)
			save_count = 0;
		load_and_concat_custom_exchanges(custom_exchange_info, 1, 0);
	}
	else {
		save_custom_exchange();
		new_table_html();
	}
});

function add_alias(from, to, save) {
	if (typeof from !== "string" || typeof to !== "string") {
		console.error("Not String", from, to);
		return;
	}
	var index = remove_alias(from, false);
	custom_exchange.splice(index, 0, [from, to]);
	exchange_table_body.insertBefore(generate_new_row([from, to]), exchange_table_body.children[index]);
	if (save)
		save_custom_exchange();
}

function remove_alias(alias, save) {
	var index = find_exchange_index(alias);
	if (index[0] === true) {
		custom_exchange.splice(index[1], 1);
		exchange_table_body.removeChild(exchange_table_body.childNodes[index[1]]);
		if (save)
			save_custom_exchange();
	}
	return index[1];
}

function removeAllAliases() {
	custom_exchange = [];
	new_table_html();
	save_custom_exchange();
}

function add_pack(pack) {
	for (var i = 0; i < pack.length; i++)
		add_alias(pack[i][0], pack[i][1], false);
	save_custom_exchange();
}

function remove_pack(pack) {
	for (var i = 0; i < pack.length; i++)
		remove_alias(pack[i][0], false);
	save_custom_exchange();
}

function new_table_html() {
	var table_body = exchange_table_body;
	while (table_body.firstChild)
		table_body.removeChild(table_body.firstChild);

	for (var i = 0; i < custom_exchange.length; i++)
		table_body.appendChild(generate_new_row(custom_exchange[i]));
}

function generate_new_row(alias) {
	var row = document.createElement("TR");
	var exchange = document.createElement("TD");
	exchange.innerHTML = alias[0];
	exchange.style.width = header_widths[0];
	row.appendChild(exchange);

	var change = document.createElement("TD");
	change.innerHTML = alias[1];
	change.style.width = header_widths[1];
	row.appendChild(change);

	var button_td = document.createElement("TD");
	var button = document.createElement("BUTTON");
	button.innerHTML = "X";
	button.dataset.alias = alias[0];
	button_td.appendChild(button);
	row.appendChild(button_td);
	return row;
}

function save_custom_exchange() {
	var ce_json = JSON.stringify(custom_exchange);
	var ce_size = byteCount(ce_json);
	var num_splits = 1;
	var set = {};
	var file_size_cutoff = 7500;
	if (ce_size > 100000) {
		alert("Too many aliases!");
		return;
	}
	else if (ce_size > file_size_cutoff) {
		num_splits = ce_size / file_size_cutoff + 1 | 0;
		var split_start = 0, split_end;
		for (var i = 1; i <= num_splits; i++) {
			split_end = get_split_end(split_start, file_size_cutoff);
			set["custom_exchange" + (i === 1 ? '':i)] = custom_exchange.slice(split_start, split_end);
			split_start = split_end;
		}
	}
	else	set["custom_exchange"] = custom_exchange;
	save_count++;
	set["custom_exchange_info"] = {
		"num_exchanges": custom_exchange.length,
		"num_files": num_splits,
		"byte_count": ce_size,
		"save_count": save_count, // to trigger change event
		"sorted": true,
	};
	chrome.storage.sync.set(set);
	if (num_splits < current_num_files) {
		var remove = new Array(current_num_files - num_splits);
		for (var i = num_splits + 1, count = 0; i <= current_num_files; i++, count++)
			remove[count] = "custom_exchange" + (i === 1 ? '':i);
		chrome.storage.sync.remove(remove);
	}
	current_num_files = num_splits;
}

function get_split_end(start, size) {
	for (; start < custom_exchange.length && size > 0; start++)
		size -= byteCount(custom_exchange[start][0] + custom_exchange[start][1]) + 8;
	return size <= 0 ? (start-1):start;
}

function load_and_concat_custom_exchanges(custom_exchange_info, index, count) {
	var key = "custom_exchange" + (index === 1 ? '':index);
	chrome.storage.sync.get(key, function (result) {
		if (result[key] === undefined || result[key].length === 0) {
			custom_exchange = custom_exchange.slice(0, count);
			new_table_html();
			return;
		}
		var exchanges = result[key];
		for (var i = 0; i < exchanges.length; i++, count++)
			custom_exchange[count] = exchanges[i];

		if (index < custom_exchange_info.num_files)
			load_and_concat_custom_exchanges(custom_exchange_info, index + 1, count);
		else {
			if (custom_exchange_info.sorted !== true)
				sort_custom_exchange();
			new_table_html();
		}
	});
}

function byteCount(s) {
	return encodeURI(s).split(/%..|./).length - 1;
}