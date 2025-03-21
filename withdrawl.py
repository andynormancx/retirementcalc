import csv
from itertools import product
import argparse

def calculate_zero_balance_age_scenarios_adjusted(initial_balance, birth_year, start_year,
                                                   min_return, max_return, return_step,
                                                   min_inflation, max_inflation, inflation_step):
    # Generate return and inflation rates
    return_rates = [round(r, 2) for r in frange(min_return, max_return, return_step)]
    inflation_rates = [round(i, 2) for i in frange(min_inflation, max_inflation, inflation_step)]

    # Generate withdrawal amounts
    withdrawal_amounts = [w for w in frange(3000, 7000, 500)]

    # Initialize list to store results
    results = []

    current_age = start_year - birth_year
    max_year = start_year + 95 - current_age

    # Calculate age of zero balance for each scenario
    for annual_return, inflation_rate in product(return_rates, inflation_rates):
        row = {
            "Return (%)": annual_return,
            "Inflation (%)": inflation_rate
        }
        ages = []

        # Calculate age for each withdrawal amount
        for withdrawal in withdrawal_amounts:
            balance = initial_balance
            year = start_year
            annual_return_decimal = annual_return / 100
            inflation_rate_decimal = inflation_rate / 100

            # Simulate until balance reaches zero or max year reached
            while balance > 0 and year < max_year:
                andy_age = year - birth_year
                eryl_age = year - 1960
                
                annual_state_pension = 0
                
                if eryl_age >= 67:
                    annual_state_pension += 12000
                if andy_age >= 68:
                    annual_state_pension += 12000
                                
                # Apply investment return
                balance *= (1 + annual_return_decimal)

                # Calculate annual withdrawal with inflation adjustment
                annual_withdrawal = withdrawal * 12 * ((1 + inflation_rate_decimal) ** (year - start_year))
                annual_withdrawal = annual_withdrawal - annual_state_pension

                # Subtract the annual withdrawal
                balance -= annual_withdrawal
                
                # mum
                if year == 2035:
                    balance += 80000

                # Check if balance has dropped to zero or below
                if balance <= 0:
                    age = year - birth_year
                    row[f"{withdrawal}"] = age
                    ages.append(age)
                    break

                year += 1

            # If balance never hits zero, mark as N/A
            if f"{withdrawal}" not in row:
                row[f"{withdrawal}"] = "n/a"
                ages.append(0)

        # Only include rows where not all ages are over 90 or N/A
        valid_ages = [age for age in ages if age != "n/a"]
        if valid_ages and any(age <= 95 for age in valid_ages):
            results.append(row)

    # Write filtered results to CSV
    file_path = "retirement_zero_balance_scenarios_adjusted.csv"
    with open(file_path, mode="w", newline="", encoding="utf-8") as file:
        fieldnames = ["Return (%)", "Inflation (%)"] + [f"{w}" for w in withdrawal_amounts]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for result in results:
            writer.writerow(result)

    print(f"CSV file saved to: {file_path}")
    return file_path


def frange(start, stop, step):
    """Generate a range of floating-point numbers."""
    while start <= stop:
        yield start
        start += step


def main():
    parser = argparse.ArgumentParser(description="Calculate retirement zero-balance ages under different scenarios.")
    parser.add_argument("--initial_balance", type=float, default=900000, help="Initial balance (£)")
    parser.add_argument("--start_year", type=int, default=2025, help="Start year")
    parser.add_argument("--birth_year", type=int, default=1971, help="Birth year")
    parser.add_argument("--min_return", type=float, default=3.5, help="Minimum return rate (%)")
    parser.add_argument("--max_return", type=float, default=6.5, help="Maximum return rate (%)")
    parser.add_argument("--return_step", type=float, default=0.5, help="Return rate step (%)")
    parser.add_argument("--min_inflation", type=float, default=2, help="Minimum inflation rate (%)")
    parser.add_argument("--max_inflation", type=float, default=5, help="Maximum inflation rate (%)")
    parser.add_argument("--inflation_step", type=float, default=0.5, help="Inflation rate step (%)")

    args = parser.parse_args()

    calculate_zero_balance_age_scenarios_adjusted(
        start_year=args.start_year,
        initial_balance=args.initial_balance,
        birth_year=args.birth_year,
        min_return=args.min_return,
        max_return=args.max_return,
        return_step=args.return_step,
        min_inflation=args.min_inflation,
        max_inflation=args.max_inflation,
        inflation_step=args.inflation_step
    )


if __name__ == "__main__":
    main()