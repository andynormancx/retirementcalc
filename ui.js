import { createReactiveModel } from './model.js';
import { generateProjection } from './model.js';

let model = null

export function setupUI(defaultState) {
    model = createReactiveModel(defaultState, () => {
        updateProjection()
    });

    setupOtherAnnualIncomes()
    setupLumpSums()
    setupGrossIncomeRates()

    bindInputs()
    updateProjection()
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

function setupOtherAnnualIncomes() {
    model.otherAnnualIncomes.forEach((_, index) => {
        addOtherAnnualIncome(index)
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
        age: model.firstStatePensionAge,
        amount: 0
    })
    addOtherAnnualIncome(model.otherAnnualIncomes.length - 1)
}

function setupLumpSums() {
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
        age: model.firstStatePensionAge,
        amount: 0
    })
    addLumpSum(model.lumpSums.length - 1)
}

function setupGrossIncomeRates() {
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
        age: model.firstStatePensionAge,
        amount: 0
    })
    addGrossIncomeRate(model.grossExpenditureRates.length - 1)
}