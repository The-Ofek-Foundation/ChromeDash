const inputDash = document.querySelector("input[name=enable-dash]");
const inputPasswords = document.querySelector("input[name=enable-passwords]");
const exchangeTableBody = document.getElementById("exchange-table-body");
const characterPackSelect = document.getElementById("character-pack-select");
let customExchange = [["--", String.fromCharCode(8211)], ["---", String.fromCharCode(8212)]];
const addAliasForm = document.getElementById("add-alias");
const addCharacterPack = document.getElementById("add-character-pack");
const removeCharacterPack = document.getElementById("remove-character-pack");
const removeAllAliasesOption = document.getElementById("remove-all-aliases");
const addBasicDashes = document.getElementById("add-basic-dashes");
const searchInput = document.getElementById("alias-search");

let currentNumFiles, saveCount;

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
	let i, pack;
	for (let key in characterPacks) {
		pack = characterPacks[key];
		for (i = 0; i < pack.length; i++)
			if (typeof pack[i][1] === "number")
				pack[i][1] = String.fromCharCode(pack[i][1]);
	}
}
setCharacterPacks();

function addCharacterPackOptions() {
	let option, pack;
	for (pack in characterPacks) {
		if (pack === "EMPTY")
			continue;
		option = document.createElement("option");
		option.textContent = pack.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
		option.value = pack;
		characterPackSelect.add(option);
	}
}

document.addEventListener("DOMContentLoaded", (event) => {
	// alignAddRemoveAliasForms(); // Removed as UI has changed
	inputDash.addEventListener('change', (event) => {
		chrome.storage.sync.set({ "dashEnabled": inputDash.checked });
	});
	inputPasswords.addEventListener('change', (event) => {
		chrome.storage.sync.set({ "enablePasswords": inputPasswords.checked });
	});
	addAliasForm.addEventListener('submit', (event) => {
		// Use named inputs directly
		const aliasFrom = addAliasForm.querySelector("input[name='alias-from']");
		const aliasTo = addAliasForm.querySelector("input[name='alias-to']");
		addAlias(aliasFrom.value, aliasTo.value, true);
		aliasFrom.value = "";
		aliasTo.value = "";
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;
	});
	// Remove alias form listener removed as form is deleted

	addCharacterPack.addEventListener('click', (event) => {
		addPack(characterPacks[characterPackSelect.options[characterPackSelect.selectedIndex].value]);
	});
	removeCharacterPack.addEventListener('click', (event) => {
		removePack(characterPacks[characterPackSelect.options[characterPackSelect.selectedIndex].value]);
	});
	removeAllAliasesOption.addEventListener('click', (event) => {
		removeAllAliases();
	});
	addBasicDashes.addEventListener('click', (event) => {
		addPack([["--", String.fromCharCode(8211)], ["---", String.fromCharCode(8212)]]);
	});
	exchangeTableBody.addEventListener('click', (event) => {
		if (event.target.dataset.alias)
			removeAlias(event.target.dataset.alias, true);
	});

	// Add search listener
	searchInput.addEventListener('keyup', (event) => {
		filterAliases(event.target.value);
	});

	addCharacterPackOptions();
	// Dynamic header width calc removed
});

chrome.storage.sync.get("dashEnabled", (result) => {
	inputDash.checked = result.dashEnabled === undefined ? true : result.dashEnabled;
});

chrome.storage.sync.get("enablePasswords", (result) => {
	inputPasswords.checked = result.enablePasswords === undefined ? false : result.enablePasswords;
});

chrome.storage.sync.get("customExchangeInfo", async (result) => {
	let customExchangeInfo = result["customExchangeInfo"];
	if (customExchangeInfo !== undefined) {
		currentNumFiles = customExchangeInfo.numFiles;
		saveCount = customExchangeInfo.saveCount;
		if (saveCount === undefined)
			saveCount = 0;
		customExchange = await loadAllExchanges(customExchangeInfo);
		if (customExchangeInfo.sorted !== true)
			sortCustomExchange();
		newTableHtml();
	} else {
		autoSaveCustomExchange();
		newTableHtml();
	}
});

function addAlias(from, to, save) {
	if (typeof from !== "string" || typeof to !== "string") {
		console.error("Not String", from, to);
		return;
	}
	let index = removeAlias(from, false);
	customExchange.splice(index, 0, [from, to]);
	// Insert respecting sort order, but for now simple refresh is safest or insert at specific index
	// Re-rendering whole table is easier to keep consistent with search, but insertBefore is more performant.
	// Let's use insertBefore to keep with existing logic, but we might need to re-filter if search is active.

	// If search is active, it might be cleaner to just re-render table to ensure filtering applies
	if (searchInput.value.length > 0) {
		newTableHtml(); // This will re-render and apply filter
	} else {
		exchangeTableBody.insertBefore(generateNewRow([from, to]), exchangeTableBody.children[index]);
	}

	if (save)
		autoSaveCustomExchange();
}

function removeAlias(alias, save) {
	let index = findExchangeIndex(alias);
	if (index[0] === true) {
		customExchange.splice(index[1], 1);

		// To safely remove from DOM, we should find the row with the dataset-alias
		// The original index might not match DOM index if filtered.
		const buttons = exchangeTableBody.querySelectorAll(".delete-btn");
		for (let btn of buttons) {
			if (btn.dataset.alias === alias) {
				btn.closest("tr").remove();
				break;
			}
		}

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
	for (let i = 0; i < pack.length; i++)
		addAlias(pack[i][0], pack[i][1], false);
	autoSaveCustomExchange();
}

function removePack(pack) {
	for (let i = 0; i < pack.length; i++)
		removeAlias(pack[i][0], false);
	autoSaveCustomExchange();
}

function newTableHtml() {
	let tableBody = exchangeTableBody;
	while (tableBody.firstChild)
		tableBody.removeChild(tableBody.firstChild);

	const filterText = searchInput.value.toLowerCase();

	for (let i = 0; i < customExchange.length; i++) {
		const alias = customExchange[i];
		// Filter based on key or replacement
		if (filterText === "" || alias[0].toLowerCase().includes(filterText) || alias[1].toLowerCase().includes(filterText)) {
			tableBody.appendChild(generateNewRow(alias));
		}
	}
}

function filterAliases(text) {
	// Re-render table with filter
	newTableHtml();
}

function generateNewRow(alias) {
	let row = document.createElement("TR");
	let exchange = document.createElement("TD");
	exchange.textContent = alias[0];
	// exchange.style.width = headerWidths[0]; // Removed hardcoded width
	row.appendChild(exchange);

	let change = document.createElement("TD");
	change.textContent = alias[1];
	// change.style.width = headerWidths[1]; // Removed hardcoded width
	row.appendChild(change);

	let buttonTd = document.createElement("TD");
	buttonTd.className = "action-col";
	let button = document.createElement("BUTTON");
	button.innerHTML = "&times;"; // Standard close entity
	button.className = "delete-btn"; // Add class for styling
	button.title = "Delete Alias";
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
