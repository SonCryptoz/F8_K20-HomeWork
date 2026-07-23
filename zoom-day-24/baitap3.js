class Employee {
    constructor(name, baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    getMonthlySalary() {
        return this.baseSalary;
    }

    describe() {
        return `${this.name} - Lương: ${this.getMonthlySalary()}đ`;
    }
}

class Manager extends Employee {
    constructor(name, baseSalary, teamSize) {
        super(name, baseSalary);
        this.teamSize = teamSize;
    }

    getMonthlySalary() {
        return super.getMonthlySalary() + this.teamSize * 500000;
    }

    describe() {
        return `[Quản lý] ${super.describe()} (Đội ${this.teamSize} người)`;
    }
}

const emp = new Employee("An", 10000000);
console.log(emp.getMonthlySalary()); // 10000000
console.log(emp.describe()); // "An - Lương: 10000000đ"

const manager = new Manager("Bình", 15000000, 5);
console.log(manager.getMonthlySalary());
// 17500000   (15000000 + 5 * 500000)

console.log(manager.describe());
// "[Quản lý] Bình - Lương: 17500000đ (Đội 5 người)"

console.log(manager instanceof Employee); // true
console.log(manager instanceof Manager); // true
console.log(emp instanceof Manager); // false
