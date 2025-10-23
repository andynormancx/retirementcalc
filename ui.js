import { createReactiveModel, makeReactive } from './model.js';
import { generateProjection } from './model.js';
import { uuidv4 } from './state.js'

let model = null

export function setupUI(defaultState) {
    model = createReactiveModel(defaultState, () => {
        updateProjection()
    });

    setupList('otherAnnualIncomeContainer', 'otherAnnualIncomeTemplate',
        model.otherAnnualIncomes, createEmptyListItemOtherAnnualIncome)

    setupList('lumpSumsContainer', 'lumpSumTemplate',
        model.lumpSums, createEmptyListItemLumpSums)

    setupList('grossIncomeRatesContainer', 'grossIncomeRateTemplate',
        model.grossExpenditureRates, createEmptyListItemGrossExpenditureRates)            

    bindInputs()
    updateProjection()
}

function listSavedModels() {
    const models = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('retirementModel:')) {
            models.push(key.replace('retirementModel:', ''));
        }
    }
    return models;
}

function saveModelToLocalStorage(model, name) {
    const data = model.getRawData();
    localStorage.setItem(`retirementModel:${name}`, JSON.stringify(data));
}

function loadModelFromLocalStorage(name) {
    const raw = localStorage.getItem(`retirementModel:${name}`);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        return parsed;
    } catch (e) {
        console.error('Failed to parse model:', e);
        return null;
    }
}

function updateProjectionInt() {
    const modelCopy = structuredClone(model.getRawData())

    generateProjection(modelCopy)
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function setRecalcStatus(isCalculating) {
    const status = document.getElementById('projectionStatus');
    if (!status) {
        return;
    }
    status.style.display = isCalculating ? 'flex' : 'none';
}

const debouncedProjection = debounce(() => {
    try {
        updateProjectionInt();
    } finally {
        setRecalcStatus(false);
    }
}, 300);

const updateProjection = (...args) => {
    setRecalcStatus(true);
    debouncedProjection(...args);
};

function getNoteTooltipText(note) {
    if (note === null || note === undefined) {
        return 'Add note';
    }
    const firstLine = String(note).split(/\r?\n/)[0].trim();
    return firstLine.length > 0 ? firstLine : 'Add note';
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
        return '£0';
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return String(value);
    }
    return `£${numeric.toLocaleString('en-GB')}`;
}

function getItemDetailsText(item) {
    if (!item || typeof item !== 'object') {
        return 'No additional details';
    }

    const details = [];

    if (item.age !== null && item.age !== undefined) {
        details.push(`Age: ${item.age}`);
    }

    if (item.amount !== null && item.amount !== undefined) {
        details.push(`Amount: ${formatCurrency(item.amount)}`);
    }

    if ('adjustForInflation' in item) {
        details.push(`Inflation-adjusted: ${item.adjustForInflation ? 'Yes' : 'No'}`);
    }

    if (details.length === 0) {
        return 'No additional details';
    }

    return details.join(' • ');
}

function ensureNumberValue(value, fallback = null) {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeList(list, defaults = {}) {
    if (!Array.isArray(list)) {
        return [];
    }

    return list.map(item => {
        const normalized = { ...defaults, ...item };
        if (!normalized.id) {
            normalized.id = uuidv4();
        }

        if ('age' in normalized) {
            normalized.age = ensureNumberValue(normalized.age, null);
        }

        if ('amount' in normalized) {
            normalized.amount = ensureNumberValue(normalized.amount, null);
        }

        if ('adjustForInflation' in normalized) {
            normalized.adjustForInflation = Boolean(normalized.adjustForInflation);
        }

        return normalized;
    });
}

function normalizeModelData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Model data is not a valid object.');
    }

    const normalized = { ...data };

    normalized.lumpSums = normalizeList(normalized.lumpSums, { notes: '' });
    normalized.grossExpenditureRates = normalizeList(normalized.grossExpenditureRates, { notes: '' });
    normalized.otherAnnualIncomes = normalizeList(normalized.otherAnnualIncomes, { adjustForInflation: false, notes: '' });

    normalized.initialBalance = ensureNumberValue(normalized.initialBalance, 0);
    normalized.annualReturn = ensureNumberValue(normalized.annualReturn, 0);
    normalized.inflationRate = ensureNumberValue(normalized.inflationRate, 0);
    normalized.grossIncome = ensureNumberValue(normalized.grossIncome, 0);
    normalized.firstBirthYear = ensureNumberValue(normalized.firstBirthYear, null);
    normalized.secondBirthYear = ensureNumberValue(normalized.secondBirthYear, null);
    normalized.firstStatePensionAge = ensureNumberValue(normalized.firstStatePensionAge, null);
    normalized.secondStatePensionAge = ensureNumberValue(normalized.secondStatePensionAge, null);
    normalized.initialStatePension = ensureNumberValue(normalized.initialStatePension, 0);

    if (normalized.name && typeof normalized.name !== 'string') {
        normalized.name = String(normalized.name);
    }

    return normalized;
}

function applyModelData(rawData, nameHint) {
    const normalized = normalizeModelData(rawData);
    const displayName = nameHint ?? normalized.name ?? '';

    if (displayName) {
        normalized.name = displayName;
    }

    sortLists(normalized);
    setupUI(normalized);

    const titleNameSpan = document.getElementById('projectionName');
    if (titleNameSpan) {
        titleNameSpan.innerText = normalized.name || '';
    }

    return normalized.name || displayName || '';
}

function openNotesModal(item, onSaveCallback) {
    const modal = document.getElementById("notesModal")
    if (!modal) {
        return
    }

    const textarea = document.getElementById("notesModalTextarea")
    const detailsContainer = document.getElementById("notesModalDetails")
    const updateButton = document.getElementById("notesModalUpdateButton")
    const cancelButton = document.getElementById("notesModalCancelButton")
    const closeButton = document.getElementById("notesModalCloseButton")
    const overlay = modal.querySelector(".modal-overlay")

    if (!textarea || !updateButton || !cancelButton || !closeButton) {
        return
    }

    textarea.value = item.notes ?? ""
    if (detailsContainer) {
        detailsContainer.innerText = getItemDetailsText(item)
    }

    const cleanup = () => {
        modal.classList.remove("active")
        updateButton.onclick = null
        cancelButton.onclick = null
        closeButton.onclick = null
        if (overlay) {
            overlay.onclick = null
        }
    }

    const closeWithoutSaving = (event) => {
        if (event) {
            event.preventDefault()
        }
        cleanup()
    }

    updateButton.onclick = (event) => {
        event.preventDefault()
        item.notes = textarea.value
        if (typeof onSaveCallback === 'function') {
            onSaveCallback(item.notes)
        }
        cleanup()
    }

    cancelButton.onclick = closeWithoutSaving
    closeButton.onclick = closeWithoutSaving
    if (overlay) {
        overlay.onclick = closeWithoutSaving
    }

    modal.classList.add("active")
    textarea.focus()
}

function bindInputs() {
    bindChildElements(document, model, true)
}

function bindChildElements(parentElement, modelToBind, ignoreNestedBindings) {
    parentElement.querySelectorAll('[data-bind]').forEach(input => {
        const keyParts = input.dataset.bind.split('.')
        let key = null
        
        // for the bindings in the lists we use list.key
        // for the bingings in the other controls is it just the key
        if (keyParts.length == 2) {
            if (ignoreNestedBindings) {
                return
            }
            key = keyParts[1]
        } else {
            key = keyParts[0]
        }

        // Initialize input from model if it has a value
        if (modelToBind[key] !== undefined) {
            if (input.type === 'checkbox') {
                input.checked = modelToBind[key];
            } else {
                input.value = modelToBind[key];
            }
        } else {
            return
        }

        // Update model on user input
        input.oninput = function () {            
            if (input.type === 'checkbox') {
                modelToBind[key] = input.checked;
            } else {
                modelToBind[key] = parseFloat(input.value) || 0;
            }
        }
    });
}

function setupList(listContainerId, listTemplateId, listData, createEmptyItemHandler) {
    const container = document.getElementById(listContainerId);
    const template = document.getElementById(listTemplateId);

    container.innerHTML = '';

    listData.forEach((item, index) => {
        addListItem(listData, item, container, template)
    })

    const btn = container.parentElement.querySelector('.btn-add')
    btn.onclick = function () {
        const emptyListItem = makeReactive(createEmptyItemHandler(), updateProjection)
        listData.push(emptyListItem)
        addListItem(listData, emptyListItem, container, template)
    }
}

function addListItem(listItems, item, container, template) {
    const clone = template.content.cloneNode(true);
  
    const itemElement = clone.firstElementChild;
    bindChildElements(itemElement, item, false);

    const removeBtn = clone.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function () {
            removeListItem(listItems, item, itemElement)
        });
    }

    const notesBtn = clone.querySelector('.notes-btn');
    if (notesBtn) {
        const refreshTooltip = () => {
            notesBtn.setAttribute('data-tooltip', getNoteTooltipText(item.notes));
        }

        notesBtn.classList.add('tooltip', 'tooltip-left');
        refreshTooltip();

        notesBtn.addEventListener('click', function () {
            openNotesModal(item, refreshTooltip)
        });

        // keep tooltip current on hover in case notes changed elsewhere
        notesBtn.addEventListener('mouseenter', refreshTooltip);
    }
  
    container.appendChild(clone);    
}

function removeListItem(listItems, item, itemElement) {
    let matchedIndex = -1;

    listItems.forEach((itemToCheck, index) => {
        if (matchedIndex !== -1) {
            return
        }
        if (itemToCheck.id === item.id) {
            matchedIndex = index
            return
        }
    })

    if (matchedIndex !== -1) {
        // This reassigns a new array (which triggers Proxy set trap)
        listItems.splice(matchedIndex, 1);
    }

    // Remove from DOM
    itemElement.remove();

    updateProjection(); // TODO do we need this or will the proxy handle this
}

function createEmptyListItemOtherAnnualIncome() {
    return {
        id: uuidv4(),
        age: null,
        amount: null,
        notes: ''
    }    
}

function createEmptyListItemLumpSums() {
    return {
        id: uuidv4(),
        age: null,
        amount: null,
        notes: ''
    }
}

function createEmptyListItemGrossExpenditureRates() {
    return {
        id: uuidv4(),
        age: null,
        amount: null,
        notes: ''
    }
}

function refreshSavedModelsDropdown() {
    const dropdown = document.getElementById('savedModelsDropdown');
    if (!dropdown) return;

    const currentValue = dropdown.value;
    dropdown.innerHTML = '';

    const models = listSavedModels().sort();
    models.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dropdown.appendChild(option);
    });

    dropdown.value = currentValue;
}

function handleSave() {
    const input = document.getElementById('saveModelName');
    if (!input) return;

    const name = input.value.trim();
    if (!name) {
        alert('Please enter a name to save the model.');
        return;
    }

    const titleNameSpan = document.getElementById('projectionName');
    titleNameSpan.innerText = name;

    saveModelToLocalStorage(model, name);
    refreshSavedModelsDropdown();
    alert(`Model "${name}" saved.`);
}

function handleLoad() {
    const dropdown = document.getElementById('savedModelsDropdown');
    if (!dropdown) return;

    const name = dropdown.value;
    if (!name) {
        alert('Please select a saved model to load.');
        return;
    }

    const loaded = loadModelFromLocalStorage(name);
    if (loaded) {
        try {
            applyModelData(loaded, name);
        } catch (error) {
            console.error('Failed to load model:', error);
            alert(`Failed to load model "${name}": ${error.message || error}`);
        }
    } else {
        alert(`Failed to load model "${name}".`);
    }
}

function handleImportFile(event) {
    const input = event.target;
    if (!input || !input.files || input.files.length === 0) {
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        try {
            const text = reader.result;
            const parsed = JSON.parse(text);
            const fallbackName = (file.name || 'Imported Model').replace(/\.[^.]+$/, '');
            const appliedName = applyModelData(parsed, parsed.name || fallbackName);
            alert(`Imported model "${appliedName || fallbackName}".`);
        } catch (error) {
            console.error('Failed to import model:', error);
            alert(`Failed to import model: ${error.message || error}`);
        } finally {
            input.value = '';
        }
    };

    reader.onerror = () => {
        console.error('Failed to read file:', reader.error);
        alert('Failed to read the selected file.');
        input.value = '';
    };

    reader.readAsText(file);
}

function cleanModelBeforeExport(rawModel) {
    const cleaned = structuredClone(rawModel);
    delete cleaned.__isOurProxy;
    for (const key in cleaned) {
        if (cleaned[key] && typeof cleaned[key] === 'object') {
            delete cleaned[key].__isOurProxy;
        }
    }
    return cleaned;
}

function handleExport() {
    if (!model) {
        alert('No model available to export.');
        return;
    }

    const currentData = cleanModelBeforeExport(model.getRawData());
    const name = currentData.name ? String(currentData.name).trim() : 'model';
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 15);
    const fileName = `${name || 'model'}-${timestamp}.json`;

    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// when we load a scenario sort the lists by age
function sortLists(model) {
    const compareByAge = (item1, item2) => {
        const age1 = item1 && typeof item1.age === 'number' ? item1.age : Number.MAX_SAFE_INTEGER;
        const age2 = item2 && typeof item2.age === 'number' ? item2.age : Number.MAX_SAFE_INTEGER;
        return age1 - age2;
    };

    model.grossExpenditureRates = (model.grossExpenditureRates || []).sort(compareByAge);
    model.lumpSums = (model.lumpSums || []).sort(compareByAge);
    model.otherAnnualIncomes = (model.otherAnnualIncomes || []).sort(compareByAge);
}

window.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveModelBtn');
    const loadBtn = document.getElementById('loadModelBtn');
    const savedModelsDropdown = document.getElementById('savedModelsDropdown');
    const importBtn = document.getElementById('importModelBtn');
    const importInput = document.getElementById('importModelInput');
    const exportBtn = document.getElementById('exportModelBtn');

    if (saveBtn) saveBtn.addEventListener('click', handleSave);
    if (loadBtn) loadBtn.addEventListener('click', handleLoad);
    if (savedModelsDropdown) savedModelsDropdown.addEventListener('change', handleLoad)
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', handleImportFile);
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }

    refreshSavedModelsDropdown();
});
