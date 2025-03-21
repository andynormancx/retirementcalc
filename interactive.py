import csv
import matplotlib.pyplot as plt

def calculate_zero_balance_age_single(initial_balance, annual_return, inflation_rate, withdrawal,
                                      first_birth_year, second_birth_year,
                                      first_state_pension_age, second_state_pension_age,
                                      initial_state_pension=12000,
                                      start_year=2025, years=100):
    # Convert percentages to decimals
    annual_return /= 100
    inflation_rate /= 100

    # Initialize list to store results
    results = []

    balance = initial_balance
    year = start_year

    age_first = year - first_birth_year
    age_second = year - second_birth_year
    
    previous_balance = initial_balance

    # Simulate each year until balance reaches zero or max year reached
    while balance > 0 and year < start_year + years and age_first < 90:
        # Apply investment return
        balance *= (1 + annual_return)

        # Calculate annual withdrawal with inflation adjustment
        annual_withdrawal = withdrawal * 12 * ((1 + inflation_rate) ** (year - start_year))
        
        state_penion = initial_state_pension * ((1 + inflation_rate) ** (year - start_year))

        # Calculate the ages
        age_first = year - first_birth_year
        age_second = year - second_birth_year

        annual_state_pension = 0
        if age_first >= first_state_pension_age:
            annual_state_pension += state_penion
        if age_second >= second_state_pension_age:
            annual_state_pension += state_penion

        # Subtract the annual withdrawal but take into account state pension
        balance -= annual_withdrawal
        balance += annual_state_pension

        # Prevent negative balance
        balance = max(balance, 0)

        # Append the data for this year
        results.append({
            "year": year,
            "age_first": age_first,
            "age_second": age_second,
            "balance": int(balance),
            "annual_withdrawal": int(annual_withdrawal),
            "annual_state_pension": int(annual_state_pension),
            "annual_withdrawal_minus_state_pension": int(annual_withdrawal - annual_state_pension),
            "balance_change": int(balance - previous_balance),
        })

        previous_balance = balance
        year += 1

    return results

def plot_balance_by_year(results):
    # Extract data for plotting
    first_ages = [entry["age_first"] for entry in results]
    balances = [entry["balance"] for entry in results]
    withdrawls = [entry["annual_withdrawal"] for entry in results]
    state_pensions = [entry["annual_state_pension"] for entry in results]

    plt.rcParams['axes.formatter.useoffset'] = False
    plt.rcParams['axes.formatter.use_locale'] = False
    plt.rcParams['axes.formatter.use_mathtext'] = False

    # Plot the data
    plt.figure(figsize=(10, 6))
    #plt.plot(first_ages, balances, marker='o', linestyle='-', color='blue')
    plt.plot(first_ages, withdrawls, marker='+', linestyle='--', color='red')
    plt.plot(first_ages, state_pensions, marker='*', linestyle='-.', color='green')
    plt.title("Retirement Balance Over Time")
    plt.xlabel("Age")
    plt.ylabel("£")
    plt.grid(True)
    plt.tight_layout()
    plt.show()


# Example usage
initial_balance = 1000000
annual_return = 4.5
inflation_rate = 2.0
withdrawal = 4000
first_birth_year = 1971
second_birth_year = 1960
first_state_pension_age = 68
second_state_pension_age = 67
initial_state_pension = 12000

results = calculate_zero_balance_age_single(initial_balance, annual_return, inflation_rate, withdrawal,
                                           first_birth_year, second_birth_year,
                                           first_state_pension_age, second_state_pension_age)

# Print the result
for entry in results:
  print(f"Year: {entry['year']}, Age (First): {entry['age_first']}, Age (Second): " +
        f"{entry['age_second']}, Balance: {entry['balance']}, Annual Withdrawal: {entry['annual_withdrawal']}, (minus state pension): {entry['annual_withdrawal_minus_state_pension']} " +
        f"Annual State Pension: {entry['annual_state_pension']} Balance change: {entry['balance_change']}")

plot_balance_by_year(results)