fn main(user_balance: Field, required_balance: pub Field) -> pub bool {
    let user_balance_int = user_balance as u64;
    let required_balance_int = required_balance as u64;
    let result = user_balance_int >= required_balance_int;
    result
}
