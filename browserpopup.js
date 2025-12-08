const inputDash = document.querySelector("input[name=enable-dash]");
const inputPasswords = document.querySelector("input[name=enable-passwords]");
const exchangeTableBody = document.getElementById("exchange-table-body");
const characterPackSelect = document.getElementById("character-pack-select");
let customExchange = [["--", "–"], ["---", "—"]];
const addAliasForm = document.getElementById("add-alias");
const addCharacterPack = document.getElementById("add-character-pack");
const removeCharacterPack = document.getElementById("remove-character-pack");
const removeAllAliasesOption = document.getElementById("remove-all-aliases");
const addBasicDashes = document.getElementById("add-basic-dashes");
const searchInput = document.getElementById("alias-search");

let currentNumFiles, saveCount;

const packFiles = {
	"LOWERCASE_GREEK": "packs/lowercase_greek.json",
	"UPPERCASE_GREEK": "packs/uppercase_greek.json",
	"ALL_LOWERCASE_ACCENTS": "packs/lowercase_accents.json",
	"ALL_UPPERCASE_ACCENTS": "packs/uppercase_accents.json",
	"MATH_SYMBOLS": "packs/math_symbols.json",
	"CURRENCY_AND_LEGAL": "packs/currency_legal.json",
	"PUNCTUATION": "packs/punctuation.json"
};

let characterPacks = {};

async function loadSystemPacks() {
	const promises = [];
	const packKeys = Object.keys(packFiles);

	for (const key of packKeys) {
		promises.push(fetch(packFiles[key]).then(response => response.json()));
	}

	try {
		const results = await Promise.all(promises);
		for (let i = 0; i < results.length; i++) {
			characterPacks[packKeys[i]] = results[i];
		}
		addCharacterPackOptions();
	} catch (error) {
		console.error("Failed to load character packs:", error);
	}
}

function addCharacterPackOptions() {
	let option, pack;
	const packKeys = Object.keys(characterPacks);

	// Add "Select a Pack..." default if not present (handled in HTML, but logic here assumes explicit addition)
	// Actually, the HTML has "EMPTY" value option. We should filter that or just append.

	for (const key of packKeys) {
		option = document.createElement("option");
		option.textContent = key.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
		option.value = key;
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
		event.preventDefault();
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
	addBasicDashes.addEventListener('click', async (event) => {
		try {
			const dashes = await fetch("packs/basic_dashes.json").then(r => r.json());
			addPack(dashes);
		} catch (e) {
			console.error("Failed to load basic dashes:", e);
		}
	});
	exchangeTableBody.addEventListener('click', (event) => {
		if (event.target.dataset.alias)
			removeAlias(event.target.dataset.alias, true);
	});

	// Add search listener
	searchInput.addEventListener('keyup', (event) => {
		filterAliases(event.target.value);
	});

	loadSystemPacks();
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
	autoSaveCustomExchange();
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
