// * Hàm 1: createCalculator()
// Viết một function expression trả về một object chứa 4 hàm tính toán, mỗi hàm là arrow function:

const createCalculator = function () {
    return {
        add: (a, b) => {
            return Number.isFinite(a) && Number.isFinite(b)
                ? a + b
                : "Invalid Input";
        },

        subtract: (a, b) => {
            return Number.isFinite(a) && Number.isFinite(b)
                ? a - b
                : "Invalid Input";
        },

        multiply: (a, b) => {
            return Number.isFinite(a) && Number.isFinite(b)
                ? a * b
                : "Invalid Input";
        },

        divide: (a, b) => {
            return !Number.isFinite(a) || !Number.isFinite(b)
                ? "Invalid Input"
                : b === 0
                  ? "Lỗi: chia cho 0"
                  : a / b;
        },
    };
};

const calculator = createCalculator();

console.log(calculator.add(2, 3)); // 5
console.log(calculator.subtract(10, 4)); // 6
console.log(calculator.multiply(3, 5)); // 15
console.log(calculator.divide(10, 2)); // 5
console.log(calculator.divide(10, 0)); // "Lỗi: chia cho 0"
console.log(calculator.add(9, 123)); // 132
console.log(calculator.subtract(10, 99)); // -89
console.log(calculator.multiply(3, 10)); // 30
console.log(calculator.divide(2354, 3)); // 784.6666666666666
console.log(calculator.divide(0, 0)); // "Lỗi: chia cho 0"
console.log(calculator.divide(0, "112")); // "Invalid"
console.log(calculator.divide("12", "112")); // "Invalid"
console.log(calculator.divide("12", 0)); // "Invalid"
console.log(calculator.divide("12", [])); // "Invalid"
console.log(calculator.divide([], {})); // "Invalid"
console.log(calculator.divide(NaN, {})); // "Invalid"

// * Hàm 2: average(...numbers)
// Dùng rest parameter, tính trung bình cộng của số lượng tham số bất kỳ.

// Nếu không truyền tham số nào → trả về 0

const isNumberArr = (arr) => {
    return arr.every((number) => Number.isFinite(number));
};

const average = (...numbers) => {
    if (!isNumberArr(numbers)) return "Invalid Input";
    return numbers.length
        ? numbers.reduce((total, number) => {
              return total + number;
          }, 0) / numbers.length
        : 0;
};

console.log(average(10, 20, 30)); // 20
console.log(average(5)); // 5
console.log(average()); // 0
console.log(average(1, 2, 3, 4, 5)); // 3
console.log(average(1, "2", 3, undefined, NaN)); // Invalid
console.log(average({}, [])); // Invalid
console.log(average({}, [1, 2, 3])); // Invalid
console.log(average([])); // Invalid

// * Hàm 3: applyDiscount(price, discountPercent = 10)
// Tính giá sau khi giảm giá, discountPercent có giá trị mặc định là 10.

// Nếu price không phải số hợp lệ → trả về "Giá không hợp lệ"

// Kết quả làm tròn xuống số nguyên

const applyDiscount = (price, discountPercent = 10) => {
    if (
        !Number.isFinite(price) ||
        !Number.isFinite(discountPercent) ||
        price < 0 ||
        discountPercent < 0 ||
        discountPercent > 100
    )
        return "Giá không hợp lệ";

    return Math.floor(price * (1 - discountPercent / 100));
};

console.log(applyDiscount(100000)); // 90000  (giảm 10% mặc định)
console.log(applyDiscount(100000, 20)); // 80000
console.log(applyDiscount(100000, 0)); // 100000
console.log(applyDiscount(123456, 25)); // 92592
console.log(applyDiscount(12083456, 12)); // 10633441
console.log(applyDiscount(12083456, 1223454)); // "Giá không hợp lệ"
console.log(applyDiscount(12083456, -12234)); // "Giá không hợp lệ"
console.log(applyDiscount(-999, 1223454)); // "Giá không hợp lệ"
console.log(applyDiscount("abc", 10)); // "Giá không hợp lệ"
console.log(applyDiscount(NaN, 10)); // "Giá không hợp lệ"
console.log(applyDiscount({}, [])); // "Giá không hợp lệ"

// * Hàm 4: safeCalculate(operation, ...numbers)
// Hàm nhận vào tên phép tính ("add", "subtract", "multiply", "average") và số lượng số bất kỳ, thực hiện phép tính tương ứng.

// Nếu kết quả tính ra là NaN → trả về "Kết quả không hợp lệ"

// Nếu operation không hợp lệ → trả về "Phép tính không được hỗ trợ"

const safeCalculate = (operation, ...numbers) => {
    if (typeof operation !== "string") {
        return "Biểu thức không hợp lệ";
    }

    if (!isNumberArr(numbers)) {
        return "Kết quả không hợp lệ";
    }

    let result;

    switch (operation) {
        case "add":
            result = numbers.reduce((a, b) => a + b, 0);
            break;

        case "subtract":
            result = numbers.length ? numbers.reduce((a, b) => a - b) : 0;
            break;

        case "multiply":
            result = numbers.reduce((a, b) => a * b, 1);
            break;

        case "average":
            result = numbers.length
                ? numbers.reduce((a, b) => a + b, 0) / numbers.length
                : 0;
            break;

        default:
            return "Phép tính không được hỗ trợ";
    }

    return Number.isNaN(result) ? "Kết quả không hợp lệ" : result;
};

console.log(safeCalculate("add", 1, 2, 3)); // 6
console.log(safeCalculate("multiply", 2, 3, 4)); // 24
console.log(safeCalculate("average", 10, 20)); // 15
console.log(safeCalculate("divide", 10, 2)); // "Phép tính không được hỗ trợ"
console.log(safeCalculate("add", 1, "abc", 3)); // "Kết quả không hợp lệ"
console.log(safeCalculate("add", 1, "2", 3)); // "Kết quả không hợp lệ"
console.log(safeCalculate("multiply", 1, "2", "abc")); // "Kết quả không hợp lệ"
console.log(safeCalculate("multiply", 1, "2")); // "Kết quả không hợp lệ"

console.log(safeCalculate("add")); // 0
console.log(safeCalculate("subtract")); // 0
console.log(safeCalculate("multiply")); // 1
console.log(safeCalculate("average")); // 0

console.log(safeCalculate("sdfnkds")); // "Phép tính không được hỗ trợ"
console.log(safeCalculate("average", NaN, "helo", 123, [])); // "Kết quả không hợp lệ"
console.log(safeCalculate({}, 1, 2, [])); // "Biểu thức không hợp lệ"
