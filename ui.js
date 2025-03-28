import { createReactiveModel } from './model.js';
import { generateProjection } from './model.js';

let model = null

export function setupUI(defaultState) {
    model = createReactiveModel(defaultState, () => {
        updateProjection()
    });

    setupOtherAnnualIncomes()

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
            input.value = modelToBind[key];
        }

        // Update model on user input
        input.addEventListener('input', () => {
            modelToBind[key] = parseFloat(input.value) || 0;
        });
    });
}

function setupOtherAnnualIncomes() {
    model.otherAnnualIncomes.forEach((income, index) => {
        addOtherAnnualIncome(income)
    })    
}

function addOtherAnnualIncome(income) {
    const container = document.getElementById('otherAnnualIncomeContainer');
    const template = document.getElementById('otherAnnualIncomeTemplate');
    const clone = template.content.cloneNode(true);
  
    const ageInput = clone.querySelector('.otherAnnualIncomeAge');
    const amountInput = clone.querySelector('.otherAnnualIncomeAmount');
    const adjustCheckbox = clone.querySelector('.otherAnnualIncomeAdjust');
    const removeBtn = clone.querySelector('.remove-btn');
  
    const incomeElement = clone.firstElementChild;

    ageInput.value = income.age;
    amountInput.value = income.amount;
    adjustCheckbox.checked = income.adjustForInflation;
  
    ageInput.addEventListener('input', () => {
        income.age = parseFloat(ageInput.value) || 0
        updateProjection()
    });
    
    amountInput.addEventListener('input', () => {
        income.amount = parseFloat(amountInput.value) || 0
        updateProjection()
    });

    adjustCheckbox.addEventListener('change', () => {
        income.adjustCheckbox = adjustCheckbox.checked
        updateProjection()
    });

    removeBtn.addEventListener('click', function () {
        // Remove from model
        const index = model.otherAnnualIncomes.indexOf(income);
        if (index !== -1) {
            model.otherAnnualIncomes.splice(index, 1);
        }

        // Remove from DOM
        incomeElement.remove();
        updateProjection();
    });
  
    container.appendChild(clone);
}

function getOtherAnnualIncome() {
    const entries = document.querySelectorAll('.otherAnnualIncome-entry');
    const otherAnnualIncomes = [];
    entries.forEach(entry => {
        const age = parseInt(entry.querySelector('.otherAnnualIncomeAge').value);
        const amount = parseFloat(entry.querySelector('.otherAnnualIncomeAmount').value);
        const adjust = entry.querySelector('.otherAnnualIncomeAdjust').checked;
        
        if (!isNaN(age) && !isNaN(amount)) {
            otherAnnualIncomes.push({ age, amount, adjust });
        }
    });
    return otherAnnualIncomes;
}

function addLumpSum(age = '', amount = '') {
    const container = document.getElementById('lumpSumsContainer');
    const template = document.getElementById('lumpSumTemplate');
    const clone = template.content.cloneNode(true);
  
    const ageInput = clone.querySelector('.lumpAge');
    const amountInput = clone.querySelector('.lumpAmount');
    const removeBtn = clone.querySelector('.remove-btn');
  
    ageInput.value = age;
    amountInput.value = amount;
  
    ageInput.addEventListener('input', generateProjection);
    amountInput.addEventListener('input', generateProjection);
    removeBtn.addEventListener('click', function () {
      this.parentElement.remove();
      generateProjection();
    });
  
    container.appendChild(clone);
}

function getLumpSums() {
    const entries = document.querySelectorAll('.lump-sum-entry');
    const lumpSums = [];
    entries.forEach(entry => {
        const age = parseInt(entry.querySelector('.lumpAge').value);
        const amount = parseFloat(entry.querySelector('.lumpAmount').value);
        if (!isNaN(age) && !isNaN(amount)) {
            lumpSums.push({ age, amount });
        }
    });
    return lumpSums;
}

function addGrossIncomeRate(age = '', amount = '') {
    const container = document.getElementById('grossIncomeRatesContainer');
    const template = document.getElementById('grossIncomeRateTemplate');
    const clone = template.content.cloneNode(true);
  
    const ageInput = clone.querySelector('.withdrawalAge');
    const amountInput = clone.querySelector('.grossIncomeAmount');
    const removeBtn = clone.querySelector('.remove-btn');
  
    ageInput.value = age;
    amountInput.value = amount;
  
    ageInput.addEventListener('input', generateProjection);
    amountInput.addEventListener('input', generateProjection);
    removeBtn.addEventListener('click', function () {
      this.parentElement.remove();
      generateProjection();
    });
  
    container.appendChild(clone);
}

function getGrossIncomeRateRates() {
    const entries = document.querySelectorAll('.grossincome-rate-entry');
    const rates = [];
    entries.forEach(entry => {
        const age = parseInt(entry.querySelector('.withdrawalAge').value);
        const amount = parseFloat(entry.querySelector('.grossIncomeAmount').value);
        if (!isNaN(age) && !isNaN(amount)) {
            rates.push({ age, amount });
        }
    });
    return rates;
}
