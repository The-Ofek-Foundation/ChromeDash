var inputDash = document.querySelector("input[name=enable-dash]");
var inputPasswords = document.querySelector("input[name=enable-passwords]");
var exchangeTableBody = document.getElementById("exchange-table-body");
var exchangeHeader = document.getElementById("exchange-header");
var characterPackSelect = document.getElementById("character-pack-select");
var customExchange = [["--", String.fromCharCode(8211)], ["---", String.fromCharCode(8212)]];
var headerWidths = new Array(3);
var addAliasForm = document.getElementById("add-alias");
var removeAliasForm = document.getElementById("remove-alias");
var addCharacterPack = document.getElementById("add-character-pack");
var removeCharacterPack = document.getElementById("remove-character-pack");
var removeAllAliases = document.getElementById("remove-all-aliases");
var addBasicDashes = document.getElementById("add-basic-dashes");
var currentNumFiles, saveCount;

const characterPacks = {
	"EMPTY": [],
	"LOWERCASE_GREEK": [["\\alpha", 945], ["\\beta", 946], ["\\gamma", 947], ["\\delta", 948], ["\\epsilon", 949], ["\\zeta", 950], ["\\eta", 951], ["\\theta", 952], ["\\iota", 953], ["\\kappa", 954], ["\\lambda", 955], ["\\mu", 956], ["\\nu", 957], ["\\xi", 958], ["\\omicron", 959], ["\\pi", 960], ["\\rho", 961], ["\\sigmaf", 962], ["\\sigma", 963], ["\\tau", 964], ["\\upsilon", 965], ["\\phi", 966], ["\\chi", 967], ["\\psi", 968], ["\\omega", 969]],
	"UPPERCASE_GREEK": [["\\Alpha", 913], ["\\Beta", 914], ["\\Gamma", 915], ["\\Delta", 916], ["\\Epsilon", 917], ["\\Zeta", 918], ["\\Eta", 919], ["\\Theta", 920], ["\\Iota", 921], ["\\Kappa", 922], ["\\Lambda", 923], ["\\Mu", 924], ["\\Nu", 925], ["\\Xi", 926], ["\\Omicron", 927], ["\\Pi", 928], ["\\Rho", 929], ["\\Sigma", 931], ["\\Tau", 932], ["\\Upsilon", 933], ["\\Phi", 934], ["\\Chi", 935], ["\\Psi", 936], ["\\Omega", 937]],
	"ALL_LOWERCASE_ACCENTS": [["oe", 339], ["s^", 353], ["a`", 224], ["a'", 225], ["a^", 226], ["a~", 227], ["a:", 228], ["a*", 229], ["ae", 230], ["c,", 231], ["e`", 232], ["e'", 233], ["e^", 234], ["e:", 235], ["i`", 236], ["i'", 237], ["i^", 238], ["i:", 239], ["d-", 240], ["n~", 241], ["o`", 242], ["o'", 243], ["o^", 244], ["o~", 245], ["o:", 246], ["o/", 248], ["u`", 249], ["u'", 250], ["u^", 251], ["u:", 252], ["y'", 253], ["|p", 254], ["y:", 255]],
	"ALL_UPPERCASE_ACCENTS": [["Y:", 376], ["OE", 338], ["S^", 352], ["A`", 192], ["A'", 193], ["A^", 194], ["A~", 195], ["A:", 196], ["A*", 197], ["AE", 198], ["C,", 199], ["E`", 200], ["E'", 201], ["E^", 202], ["E:", 203], ["I`", 204], ["I'", 205], ["I^", 206], ["I:", 207], ["D-", 208], ["N~", 209], ["O`", 210], ["O'", 211], ["O^", 212], ["O~", 213], ["O:", 214], ["O/", 216], ["U`", 217], ["U'", 218], ["U^", 219], ["U:", 220], ["Y'", 221], ["|P", 222], ["B3", 223]],
	"MATH_SYMBOLS": [["<=", 8804], [">=", 8805], ["+-", 177], ["=/", 8800], ["\\div", 247], ["\\mult", 215], ["\\minus", 8722], ["\\fract", 8260], ["\\sqrt", 8730], ["\\cbrt", 8731], ["\\4rt", 8732], ["\\rel", 8733], ["\\inf", 8734], ["\\aleph", 8501], ["\\func", 402], ["\\prime", 8242], ["\\there4", 8756], ["\\dot", 8901], ["^0", 8304], ["^1", 185], ["^2", 178], ["^3", 179], ["^4", 8308], ["^5", 8309], ["^6", 8310], ["^7", 8311], ["^8", 8312], ["^9", 8313], ["^+", 8314], ["^-", 8315], ["^i", 8305], ["^n", 8319], ["_0", 8320], ["_1", 8321], ["_2", 8322], ["_3", 8323], ["_4", 8324], ["_5", 8325], ["_6", 8326], ["_7", 8327], ["_8", 8328], ["_9", 8329], ["_+", 8330], ["_-", 8331], ["_n", 8345], ["_i", 7522], ["1/4", 188], ["1/2", 189], ["3/4", 190], ["1/3", 8531], ["2/3", 8532], ["1/5", 8533], ["2/5", 8534], ["3/5", 8535], ["4/5", 8536], ["1/6", 8537], ["5/6", 8538], ["1/8", 8539], ["3/8", 8540], ["5/8", 8541], ["7/8", 8542], ["\\sum", 8721], ["\\prod", 8719], ["\\deg", 176], ["\\permil", 8240], ["\\int", 8747], ["\\part", 8706]],
};

// chrome.storage.sync.get(function (result) {
// 	console.log(result);
// });

function setCharacterPacks() {
	var i, pack;
	for (var key in characterPacks) {
		pack = characterPacks[key];
		for (i = 0; i < pack.length; i++)
			if (typeof pack[i][1] === "number")
				pack[i][1] = String.fromCharCode(pack[i][1]);
	}
}
setCharacterPacks();

function addCharacterPackOptions() {
	var option, pack;
	for (pack in characterPacks) {
		if (pack === "EMPTY")
			continue;
		option = document.createElement("option");
		option.textContent = pack.replace(/_/g, ' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		option.value = pack;
		characterPackSelect.add(option);
	}
}

document.addEventListener("DOMContentLoaded", function (event) {
	alignAddRemoveAliasForms();
	inputDash.addEventListener('change', function (event) {
		chrome.storage.sync.set({"dashEnabled": inputDash.checked});
	});
	inputPasswords.addEventListener('change', function (event) {
		chrome.storage.sync.set({"enablePasswords": inputPasswords.checked});
	});
	addAliasForm.addEventListener('submit', function (event) {
		addAlias(addAliasForm.children[0].value, addAliasForm.children[1].value, true);
		addAliasForm.children[0].value = "";
		addAliasForm.children[1].value = "";
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;
	});
	removeAliasForm.addEventListener('submit', function (event) {
		removeAlias(removeAliasForm.children[0].value);
		removeAliasForm.children[0].value = "";
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;
	});
	addCharacterPack.addEventListener('click', function (event) {
		addPack(characterPacks[characterPackSelect.options[characterPackSelect.selectedIndex].value]);
	});
	removeCharacterPack.addEventListener('click', function (event) {
		removePack(characterPacks[characterPackSelect.options[characterPackSelect.selectedIndex].value]);
	});
	removeAllAliases.addEventListener('click', function (event) {
		removeAllAliases();
	});
	addBasicDashes.addEventListener('click', function (event) {
		addPack([["--", String.fromCharCode(8211)], ["---", String.fromCharCode(8212)]]);
	});
	exchangeTableBody.addEventListener('click', function (event) {
		if (event.target.dataset.alias)
			removeAlias(event.target.dataset.alias, true);
	});
	addCharacterPackOptions();
	for (var i = 1; i <= 3; i++)
		headerWidths[i-1] = exchangeHeader.querySelector("th:nth-child(" + i + ")").offsetWidth + "px";
});

function alignAddRemoveAliasForms() {
	var widthtop = addAliasForm.children[2].getBoundingClientRect().right - addAliasForm.children[0].getBoundingClientRect().left
	var widthbot = removeAliasForm.children[1].getBoundingClientRect().right - removeAliasForm.children[0].getBoundingClientRect().left
	removeAliasForm.children[1].style.width = trueElemWidth(removeAliasForm.children[1]) + widthtop - widthbot + "px";
}

chrome.storage.sync.get("dashEnabled", function (result) {
	inputDash.checked = result.dashEnabled === undefined ? true:result.dashEnabled;
});

chrome.storage.sync.get("enablePasswords", function (result) {
	inputPasswords.checked = result.enablePasswords === undefined ? false:result.enablePasswords;
});

chrome.storage.sync.get("customExchangeInfo", function (result) {
	var customExchangeInfo = result["customExchangeInfo"];
	if (customExchangeInfo !== undefined) {
		customExchange = new Array(customExchangeInfo.numExchanges);
		currentNumFiles = customExchangeInfo.numFiles;
		saveCount = customExchangeInfo.saveCount;
		if (saveCount === undefined)
			saveCount = 0;
		loadAndConcatCustomExchanges(customExchangeInfo, 1, 0);
	}
	else {
		autoSaveCustomExchange();
		newTableHtml();
	}
});

function addAlias(from, to, save) {
	if (typeof from !== "string" || typeof to !== "string") {
		console.error("Not String", from, to);
		return;
	}
	var index = removeAlias(from, false);
	customExchange.splice(index, 0, [from, to]);
	exchangeTableBody.insertBefore(generateNewRow([from, to]), exchangeTableBody.children[index]);
	if (save)
		autoSaveCustomExchange();
}

function removeAlias(alias, save) {
	var index = findExchangeIndex(alias);
	if (index[0] === true) {
		customExchange.splice(index[1], 1);
		exchangeTableBody.removeChild(exchangeTableBody.childNodes[index[1]]);
		if (save)
			autoSaveCustomExchange();
	}
	return index[1];
}

function removeAllAliases() {
	customExchange = [];
	newTableHtml();
	customExchangeExchange(customExchange);
}

function addPack(pack) {
	for (var i = 0; i < pack.length; i++)
		addAlias(pack[i][0], pack[i][1], false);
	autoSaveCustomExchange();
}

function removePack(pack) {
	for (var i = 0; i < pack.length; i++)
		removeAlias(pack[i][0], false);
	autoSaveCustomExchange();
}

function newTableHtml() {
	var tableBody = exchangeTableBody;
	while (tableBody.firstChild)
		tableBody.removeChild(tableBody.firstChild);

	for (var i = 0; i < customExchange.length; i++)
		tableBody.appendChild(generateNewRow(customExchange[i]));
}

function generateNewRow(alias) {
	var row = document.createElement("TR");
	var exchange = document.createElement("TD");
	exchange.innerHTML = alias[0];
	exchange.style.width = headerWidths[0];
	row.appendChild(exchange);

	var change = document.createElement("TD");
	change.innerHTML = alias[1];
	change.style.width = headerWidths[1];
	row.appendChild(change);

	var buttonTd = document.createElement("TD");
	var button = document.createElement("BUTTON");
	button.innerHTML = "X";
	button.dataset.alias = alias[0];
	buttonTd.appendChild(button);
	row.appendChild(buttonTd);
	return row;
}

function autoSaveCustomExchange() {
	let results = saveCustomExchange(customExchange, saveCount, currentNumFiles);
	saveCount = results[0];
	currentNumFiles = results[1];
}

function loadAndConcatCustomExchanges(customExchangeInfo, index, count) {
	var key = "customExchange" + (index === 1 ? '':index);
	chrome.storage.sync.get(key, function (result) {
		if (result[key] === undefined || result[key].length === 0) {
			customExchange = customExchange.slice(0, count);
			newTableHtml();
			return;
		}
		var exchanges = result[key];
		for (var i = 0; i < exchanges.length; i++, count++)
			customExchange[count] = exchanges[i];

		if (index < customExchangeInfo.numFiles)
			loadAndConcatCustomExchanges(customExchangeInfo, index + 1, count);
		else {
			if (customExchangeInfo.sorted !== true)
				sortCustomExchange();
			newTableHtml();
		}
	});
}