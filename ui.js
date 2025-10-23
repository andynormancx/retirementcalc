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

    const notesOpenButton = document.getElementById("notesModalOpenButton")
    if (notesOpenButton) {
        notesOpenButton.addEventListener('click', openNotesModal)
    }

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

const updateProjection = debounce(updateProjectionInt, 300);

function openNotesModal() {
    const oldClasses = document.getElementById("notesModal").className

    document.getElementById("notesModal").className += " active"

    document.getElementById("notesModalUpdateButton").onclick = () => {
        document.getElementById("notesModal").className = oldClasses
    }

    document.getElementById("notesModalCancelButton").onclick = () => {
        document.getElementById("notesModal").className = oldClasses
    }

    document.getElementById("notesModalCloseButton").onclick = () => {
        document.getElementById("notesModal").className = oldClasses
    }
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

    removeBtn.addEventListener('click', function () {
        removeListItem(listItems, item, itemElement)
    });
  
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

    const titleNameSpan = document.getElementById('projectionName');

    const loaded = loadModelFromLocalStorage(name);
    if (loaded) {
        loaded.name = name;
        titleNameSpan.innerText = name;

        sortLists(loaded)

        model = createReactiveModel(loaded, () => updateProjection());
        setupUI(loaded);
    } else {
        alert(`Failed to load model "${name}".`);
    }
}

// when we load a scenario sort the lists by age
function sortLists(model) {
    model.grossExpenditureRates = model.grossExpenditureRates.sort((item1, item2) => item1.age > item2.age)
    model.lumpSums = model.lumpSums.sort((item1, item2) => item1.age > item2.age)
    model.otherAnnualIncomes = model.otherAnnualIncomes.sort((item1, item2) => item1.age > item2.age)
}

window.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveModelBtn');
    const loadBtn = document.getElementById('loadModelBtn');
    const savedModelsDropdown = document.getElementById('savedModelsDropdown');

    if (saveBtn) saveBtn.addEventListener('click', handleSave);
    if (loadBtn) loadBtn.addEventListener('click', handleLoad);
    if (savedModelsDropdown) savedModelsDropdown.addEventListener('change', handleLoad)

    refreshSavedModelsDropdown();
});