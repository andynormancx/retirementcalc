export function generateProjection(model) {
    const initialBalance = parseFloat(model.initialBalance);
    const annualReturn = parseFloat(model.annualReturn) / 100;
    const inflationRate = parseFloat(model.inflationRate) / 100;
    const grossIncome = parseFloat(model.grossIncome);
    const firstBirthYear = parseInt(model.firstBirthYear);
    const secondBirthYear = parseInt(model.secondBirthYear);
    const initialStatePension = parseFloat(model.initialStatePension);
    const firstStatePensionAge = parseInt(model.firstStatePensionAge);
    const secondStatePensionAge = parseInt(model.secondStatePensionAge);

    const formatCurrency = value => Math.round(value).toLocaleString('en-UK');

    let balance = initialBalance;
    const years = [];
    const balances = [];
    const statePensions = [];
    const agesFirst = [];
    const agesSecond = [];
    const annualWithdrawls = [];
    const monthlyWithdrawlsBeforeInflation = [];

    const startYear = new Date().getFullYear();
    const maxYears = 100;

    const tableBody = document.getElementById('projectionTable').querySelector('tbody');
    tableBody.innerHTML = '';

    let year = startYear;
    let firstAge = year - firstBirthYear;
    let secondAge = year - secondBirthYear;

    let currentGrossIncome = grossIncome; // Initial value

    const lumpSums = model.lumpSums;

    const grossIncomeRates = model.grossExpenditureRates;
    grossIncomeRates.sort((a, b) => a.age - b.age); // Ensure chronological order


    const otherGrossAnnualIncomeRates = model.otherAnnualIncomes;

    years.push(startYear - 1);
    balances.push(Math.round(initialBalance, 0));
    agesFirst.push(firstAge - 1);
    agesSecond.push(secondAge - 1);
    statePensions.push(0);
    annualWithdrawls.push(0);
    monthlyWithdrawlsBeforeInflation.push(0);

    for (; year < startYear + maxYears && balance > 0 && firstAge <= 95; year++) {
        firstAge = year - firstBirthYear;
        secondAge = year - secondBirthYear;              
        let annualStatePensionInflationAdjusted = 0;
        const statePensionInflationAdjusted = initialStatePension * Math.pow(1 + inflationRate, year - startYear);

        if (firstAge >= firstStatePensionAge) {
          annualStatePensionInflationAdjusted += statePensionInflationAdjusted;
        }
        if (secondAge >= secondStatePensionAge) {
          annualStatePensionInflationAdjusted += statePensionInflationAdjusted;
        }
              
        grossIncomeRates.forEach(rate => {
            if (firstAge >= rate.age) {
                currentGrossIncome = rate.amount; // Update to latest applicable rate
            }
        });

        let otherGrossAnnualIncome = 0;
        otherGrossAnnualIncomeRates.forEach(rate => {
            if (firstAge >= rate.age) {
                if (rate.adjustForInflation) {
                    otherGrossAnnualIncome += rate.amount * Math.pow(1 + inflationRate, year - startYear);
                } else {
                    otherGrossAnnualIncome += rate.amount;
                }
            }
        })

        const otherGrossAnnualIncomeInflationAdjusted = otherGrossAnnualIncome;
        const annualGrossIncomeInflationAdjusted = currentGrossIncome * 12 * Math.pow(1 + inflationRate, year - startYear);

        const requiredAnnualWithdrawlInflationAdjusted =
            Math.max(annualGrossIncomeInflationAdjusted - annualStatePensionInflationAdjusted - otherGrossAnnualIncomeInflationAdjusted, 0);
        const investmentGain = balance * annualReturn;

        balance = balance + investmentGain;
        balance -= requiredAnnualWithdrawlInflationAdjusted
        //balance += annualStatePensionInflationAdjusted;

        let lumpTotal = 0;
        lumpSums.forEach(({ age, amount }) => {
            if (firstAge === age) {
                balance += amount;
                lumpTotal += amount;
            }
        });

        balance = Math.max(balance, 0);

        const prevBalance = balances.length > 0 ? balances[balances.length - 1] : initialBalance;
        const gainLoss = balance - prevBalance;
        const gainLossPct = prevBalance > 0 ? (gainLoss / prevBalance) * 100 : 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${firstAge}</td>
            <td>${secondAge}</td>
            <td>${formatCurrency(currentGrossIncome)}</td>
            <td>${formatCurrency(annualStatePensionInflationAdjusted/12)}</td>
            <td>${formatCurrency(annualGrossIncomeInflationAdjusted/12)}</td>                    
            <td>${formatCurrency(requiredAnnualWithdrawlInflationAdjusted/12)}</td>
            <td>${formatCurrency(otherGrossAnnualIncomeInflationAdjusted)}</td>
            <td>${formatCurrency(lumpTotal)}</td>
            <td>${formatCurrency(requiredAnnualWithdrawlInflationAdjusted)}</td>
            <td>${formatCurrency(requiredAnnualWithdrawlInflationAdjusted * 0.2)}</td>
            <td>${formatCurrency(requiredAnnualWithdrawlInflationAdjusted * 0.8)}</td>
            <td>${formatCurrency(investmentGain)}</td>                    
            <td>${formatCurrency(gainLoss)}</td>
            <td>${gainLossPct.toFixed(2)}%</td>
            <td>${formatCurrency(prevBalance)}</td>
            <td>${formatCurrency(balance)}</td>
        `;
        tableBody.appendChild(row);

        years.push(year);
        balances.push(Math.round(balance, 0));
        agesFirst.push(firstAge);
        agesSecond.push(secondAge);
        statePensions.push(Math.round(annualStatePensionInflationAdjusted, 0));
        annualWithdrawls.push(Math.round(requiredAnnualWithdrawlInflationAdjusted));
        monthlyWithdrawlsBeforeInflation.push(Math.round(currentGrossIncome));
    }

    const traceBalances = {
        x: agesFirst,
        y: balances,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Balance (£)'
    };

    // Define the second trace
    const traceStatePension = {
        x: agesFirst,
        y: statePensions,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'State Pension (£)',
        line: { color: 'green' }
    };

    const traceAnnualWithdrawls = {
        x: agesFirst,
        y: annualWithdrawls,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Annual (£)',
        line: { color: 'red' }
    };


    const data = [traceBalances, traceStatePension, traceAnnualWithdrawls];

    const layout = {
        xaxis: { title: 'Age', range: [startYear - firstBirthYear - 1, 95] },
        yaxis: { title: 'Balance (£)', tickformat: ',' },
        height: 600
    };

    const zeroBalanceIndex = balances.findIndex(b => b === 0);
    const messageDiv = document.getElementById('zeroBalanceAgeMessage');
    if (zeroBalanceIndex !== -1) {
        const zeroAge = agesFirst[zeroBalanceIndex];
        if (zeroAge < 95 && zeroAge > 85) {
            messageDiv.innerHTML = `<span class="label label-warning">Balance reaches zero at age ${zeroAge}.</label>`;
        } else if (zeroAge <= 85) {
            messageDiv.innerHTML = `<span class="label label-error">Balance reaches zero at age ${zeroAge}.</label>`;
        } else {
            messageDiv.innerHTML = `<span class="label label-success">Balance does not reach zero before age 95 (final age: ${zeroAge}).</label>`;
        }
    } else {
        messageDiv.innerHTML = '<span class="label label-success">Balance never reaches zero.</label>';
    }
    Plotly.newPlot('chart', data, layout);
}

export function createReactiveModel(data, onChange) {
    function makeReactive(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (obj.__isProxy) return obj;

        const proxy = new Proxy(obj, {
            set(target, prop, value) {
                const oldVal = target[prop];
                const newVal = makeReactive(value); // wrap new values
                target[prop] = newVal;

                if (oldVal !== newVal) {
                    onChange(prop, newVal, oldVal);
                }

                return true;
            },
            deleteProperty(target, prop) {
                const oldVal = target[prop];
                delete target[prop];
                onChange(prop, undefined, oldVal);
                return true;
            }
        });

        Object.defineProperty(proxy, '__isProxy', {
            value: true,
            enumerable: false
        });

        // Wrap existing fields
        for (const key in obj) {
            obj[key] = makeReactive(obj[key]);
        }

        return proxy;
    }

    const reactive = makeReactive(structuredClone(data));

    function deproxy(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        if (Array.isArray(obj)) {
            return obj.map(deproxy);
        }

        const result = {};
        for (const key in obj) {
            result[key] = deproxy(obj[key]);
        }
        return result;
    }

    Object.defineProperty(reactive, 'getRawData', {
        value: () => deproxy(reactive),
        enumerable: false
    });

    return reactive;
}
