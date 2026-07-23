class BankAccount {
    #balance = 0;
    static totalMoney = 0;

    constructor(ownerName, blc) {
        if (!Number.isFinite(blc) || blc < 0) {
            throw new Error("Số dư không hợp lệ. Vui lòng kiểm tra lại!");
        }
        this.ownerName = ownerName;
        this.#balance = blc;
        BankAccount.totalMoney += blc;
    }

    get balance() {
        return this.#balance;
    }

    deposit(amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error(
                "Số tiền để nạp không hợp lệ. Vui lòng kiểm tra lại!",
            );
        }
        this.#balance += amount;
    }

    withdraw(amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error(
                "Số tiền để rút không hợp lệ. Vui lòng kiểm tra lại!",
            );
        }
        if (amount > this.#balance) {
            throw new Error("Số dư không đủ để rút. Vui lòng kiểm tra lại!");
        }

        this.#balance -= amount;
    }

    toString() {
        return `Chủ tài khoản: ${this.ownerName} - Số dư: ${this.#balance}`;
    }
}

class SavingsAccount extends BankAccount {
    constructor(ownerName, balance, interestRate) {
        super(ownerName, balance);
        this.interestRate = interestRate; // lãi suất
    }

    addInterest() {
        const interest = this.balance * this.interestRate;
        super.deposit(interest);
    }

    withdraw(amount) {
        if (amount > this.balance * 0.5) {
            throw new Error(
                "Không được rút quá 50% số dư hiện tại trong một lần. Vui lòng kiểm tra lại!",
            );
        }
        super.withdraw(amount);
    }
}

// * Test case 1
try {
    const testAccount = new BankAccount("An", -100);
} catch (error) {
    console.log(error.message); // Số dư không hợp lệ. Vui lòng kiểm tra lại!
}

// * Test case 2
const account = new BankAccount("An", 500000);
try {
    account.deposit("100");
} catch (error) {
    console.log(error.message); // Số tiền để nạp không hợp lệ. Vui lòng kiểm tra lại!
}
console.log(account.balance); // 500000

// * Test case 3
const account1 = new BankAccount("An", 500000);
try {
    account1.withdraw(700000);
} catch (error) {
    console.log(error.message); // Số dư không đủ để rút. Vui lòng kiểm tra lại!
}

// * Test case 4
const account2 = new SavingsAccount("Bình", 1000000, 0.05);
account2.addInterest();
console.log(account2.balance); // 1050000

// * Test case 5
try {
    account2.withdraw(600000);
} catch (error) {
    console.log(error.message); // Không được rút quá 50% số dư hiện tại trong một lần. Vui lòng kiểm tra lại!
}

// * Test case 6
const account3 = new SavingsAccount("Bình", 1000000, 0.05);
try {
    account3.withdraw(400000);
    console.log(account3.balance); // 600000
} catch (error) {
    console.log(error.message);
}

// * Test case 7
console.log(BankAccount.totalMoney); 
// 3000000
// account: 500000
// account1: 500000
// account2: 1000000
// account3: 1000000

console.log(account.toString());
console.log(account1.toString());
console.log(account2.toString());
console.log(account3.toString());
// Chủ tài khoản: An - Số dư: 500000
// Chủ tài khoản: An - Số dư: 500000
// Chủ tài khoản: Bình - Số dư: 1050000
// Chủ tài khoản: Bình - Số dư: 600000