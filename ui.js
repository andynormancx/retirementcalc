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
    
    //setupOtherAnnualIncomes()
    setupLumpSums()
    setupGrossIncomeRates()

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

function updateProjection() {
    const modelCopy = structuredClone(model.getRawData())

    generateProjection(modelCopy)
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
        input.addEventListener('input', () => {
            console.log(`Setting ${key} to`, input.type === 'checkbox' ? input.checked : parseFloat(input.value) || 0);
            
            if (input.type === 'checkbox') {
                modelToBind[key] = input.checked;
            } else {
                modelToBind[key] = parseFloat(input.value) || 0;
            }
        });
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
    btn.addEventListener('click', function() {
        const emptyListItem = makeReactive(createEmptyItemHandler(), updateProjection)
        listData.push(emptyListItem)
        addListItem(listData, emptyListItem, container, template)
    })
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
    const index = listItems.findIndex(item => item.id === item.id);
    if (index !== -1) {
        // This reassigns a new array (which triggers Proxy set trap)
        listItems.splice(index, 1);
    }

    // Remove from DOM
    itemElement.remove();
    updateProjection(); // TODO do we need this or will the proxy handle this
}

function createEmptyListItemOtherAnnualIncome() {
    return {
        id: uuidv4(),
        age: model.firstStatePensionAge,
        amount: 0
    }    
}

function setupOtherAnnualIncomes() {
    document.getElementById('otherAnnualIncomeContainer').innerHTML = '';

    model.otherAnnualIncomes.forEach((income, index) => {
        addOtherAnnualIncome(income.id)
    })

    const btn = document.getElementById('otherAnnualIncomeAddBtn');
    btn.addEventListener('click', function () {
        addNewOtherAnnualIncome()
    })
}

function addOtherAnnualIncome(index) {
    const container = document.getElementById('otherAnnualIncomeContainer');
    const template = document.getElementById('otherAnnualIncomeTemplate');
    const clone = template.content.cloneNode(true);
  
    const removeBtn = clone.querySelector('.remove-btn');
  
    const incomeElement = clone.firstElementChild;

    const reactiveIncome = model.otherAnnualIncomes[index];
    bindChildElements(incomeElement, reactiveIncome, false);

    removeBtn.addEventListener('click', function () {
        model.otherAnnualIncomes.splice(index, 1);
        // Remove from DOM
        incomeElement.remove();
        updateProjection();
    });
  
    container.appendChild(clone);
}

function addNewOtherAnnualIncome(index) {
    model.otherAnnualIncomes.push({
        id: uuidv4(),
        age: model.firstStatePensionAge,
        amount: 0
    })
    addOtherAnnualIncome(model.otherAnnualIncomes.length - 1)
}

function setupLumpSums() {
    document.getElementById('lumpSumsContainer').innerHTML = '';

    model.lumpSums.forEach((_, index) => {
        addLumpSum(index)
    })

    const btn = document.getElementById('lumpSumsAddBtn');
    btn.addEventListener('click', function () {
        addNewLumpSum()
    })
}

function addLumpSum(index) {
    const container = document.getElementById('lumpSumsContainer');
    const template = document.getElementById('lumpSumTemplate');
    const clone = template.content.cloneNode(true);
  
    const removeBtn = clone.querySelector('.remove-btn');
  
    const incomeElement = clone.firstElementChild;

    const reactiveIncome = model.lumpSums[index];
    bindChildElements(incomeElement, reactiveIncome, false);

    removeBtn.addEventListener('click', function () {
        model.lumpSums.splice(index, 1);
        // Remove from DOM
        incomeElement.remove();
        updateProjection();
    });
  
    container.appendChild(clone);
}

function addNewLumpSum() {
    model.lumpSums.push({
        id: uuidv4(),
        age: model.firstStatePensionAge,
        amount: 0
    })
    addLumpSum(model.lumpSums.length - 1)
}

function setupGrossIncomeRates() {
    document.getElementById('grossIncomeRatesContainer').innerHTML = '';

    model.grossExpenditureRates.forEach((_, index) => {
        addGrossIncomeRate(index)
    })

    const btn = document.getElementById('grossIncomeRatesAddBtn');
    btn.addEventListener('click', function () {
        addNewGrossIncomeRate()
    })
}

function addGrossIncomeRate(index) {
    const container = document.getElementById('grossIncomeRatesContainer');
    const template = document.getElementById('grossIncomeRateTemplate');
    const clone = template.content.cloneNode(true);
  
    const removeBtn = clone.querySelector('.remove-btn');
  
    const incomeElement = clone.firstElementChild;

    const reactiveIncome = model.grossExpenditureRates[index];
    bindChildElements(incomeElement, reactiveIncome, false);

    removeBtn.addEventListener('click', function () {
        model.grossExpenditureRates.splice(index, 1);
        // Remove from DOM
        incomeElement.remove();
        updateProjection();
    });
  
    container.appendChild(clone);
}

function addNewGrossIncomeRate() {
    model.grossExpenditureRates.push({
        id: uuidv4(),
        age: model.firstStatePensionAge,
        amount: 0
    })
    addGrossIncomeRate(model.grossExpenditureRates.length - 1)
}


function refreshSavedModelsDropdown() {
    const dropdown = document.getElementById('savedModelsDropdown');
    if (!dropdown) return;

    const currentValue = dropdown.value;
    dropdown.innerHTML = '';

    const models = listSavedModels();
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
        model = createReactiveModel(loaded, () => updateProjection());
        setupUI(loaded);
        updateProjection();
    } else {
        alert(`Failed to load model "${name}".`);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveModelBtn');
    const loadBtn = document.getElementById('loadModelBtn');

    if (saveBtn) saveBtn.addEventListener('click', handleSave);
    if (loadBtn) loadBtn.addEventListener('click', handleLoad);

    refreshSavedModelsDropdown();
});