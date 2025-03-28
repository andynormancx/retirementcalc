import { setupUI } from './ui.js';
import { getDefaultState } from './state.js'

console.log("projection");

window.addEventListener('load', () => {
    console.log("projection loading");

    const defaultState = getDefaultState(2025);

    setupUI(defaultState);
});


window.onload = function () {
    return

    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - parseInt(document.getElementById('firstBirthYear').value);
    addGrossIncomeRate(currentAge, 6000);
    addGrossIncomeRate(65, 5000);
    addGrossIncomeRate(75, 3500);
    addLumpSum(currentAge, -90000);
    addLumpSum(65, 100000);
    addOtherAnnualIncome(54, 1000, false);
    const inputIds = [
        'initialBalance', 'annualReturn', 'inflationRate', 'grossIncome',
        'firstBirthYear', 'secondBirthYear', 'firstStatePensionAge',
        'secondStatePensionAge', 'initialStatePension'
    ];
    
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', generateProjection);
        }
    });

    generateProjection();
};