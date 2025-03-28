import { createReactiveModel } from './model.js';
import { generateProjection } from './model.js';

export function setupUI(defaultState) {
    const model = createReactiveModel(defaultState, () => {
        generateProjection(model);
    });

    bindInputs(model)
}

function bindInputs(model) {
    document.querySelectorAll('[data-bind]').forEach(input => {
        const key = input.dataset.bind;

        // Initialize input from model if it has a value
        if (model[key] !== undefined) {
            input.value = model[key];
        }

        // Update model on user input
        input.addEventListener('input', () => {
            model[key] = parseFloat(input.value) || 0;
        });
    });
}

function addOtherAnnualIncome(age = '', amount = '', adjust = true) {
    const container = document.getElementById('otherAnnualIncomeContainer');
    const template = document.getElementById('otherAnnualIncomeTemplate');
    const clone = template.content.cloneNode(true);
  
    const ageInput = clone.querySelector('.otherAnnualIncomeAge');
    const amountInput = clone.querySelector('.otherAnnualIncomeAmount');
    const adjustCheckbox = clone.querySelector('.otherAnnualIncomeAdjust');
    const removeBtn = clone.querySelector('.remove-btn');
  
    ageInput.value = age;
    amountInput.value = amount;
    adjustCheckbox.checked = adjust;
  
    ageInput.addEventListener('input', generateProjection);
    amountInput.addEventListener('input', generateProjection);
    adjustCheckbox.addEventListener('change', generateProjection);
    removeBtn.addEventListener('click', function () {
      this.parentElement.remove();
      generateProjection();
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
