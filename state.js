export function getDefaultState(currentYear) {
    const currentFirstAge = currentYear - 1971

    const defaults = {
        name: '',
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
                id: uuidv4(),
                age: currentFirstAge,
                amount: 6000,
                notes: ''
            },
            {
                id: uuidv4(),
                age: 65,
                amount: 5000,
                notes: ''
            },
            {
                id: uuidv4(),
                age: 75,
                amount: 3000,
                notes: ''
            },
        ],
        lumpSums: [
            {
                id: uuidv4(),
                age: currentFirstAge,
                amount: -90000,
                notes: ''
            },
            {
                id: uuidv4(),
                age: 65,
                amount: 100000,
                notes: ''
            },
        ],
        otherAnnualIncomes: [
            {
                id: uuidv4(),
                age: currentFirstAge,
                amount: 1000,
                adjustForInflation: false,
                notes: ''
            },
        ]
    }

    return defaults
}

export function uuidv4() {
    // we don't need anything super secure
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}