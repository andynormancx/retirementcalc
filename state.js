export function getDefaultState(currentYear) {
    const currentFirstAge = currentYear - 1971

    const defaults = {
        currentYear: currentYear,
        initialBalance: 950000,
        annualReturn: 4.5,
        inflationRate: 2.0,
        grossIncome: 3000,
        firstBirthYear: 1971,
        secondBirthYear: 1960,
        firstStatePensionAge: 67,
        secondStatePensionAge: 66,
        initialStatePension: 12000,
        grossExpenditureRates:[
            {
                age: currentFirstAge,
                amount: 6000
            },
            {
                age: 65,
                amount: 5000
            },
            {
                age: 75,
                amount: 3000
            },
        ],
        lumpSums: [
            {
                age: currentFirstAge,
                amount: -90000
            },
            {
                age: currentFirstAge + 65,
                amount: 100000
            },
        ],
        otherAnnualIncomes: [
            {
                age: currentFirstAge,
                amount: 1000,
                adjustForInflation: false
            }
        ]
    }

    return defaults
}