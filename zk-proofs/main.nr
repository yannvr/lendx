// Solvency check
fn main(private user_balance: Field, public required_balance: Field) -> bool {
    return user_balance >= required_balance;
}

// TODO: 
