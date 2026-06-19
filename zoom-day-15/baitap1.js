const classifyTriangle = (a, b, c) => {
    if (a <= 0 || b <= 0 || c <= 0) {
        return "Cạnh không hợp lệ";
    } else if (a + b <= c || b + c <= a || a + c <= b) {
        return "Không tạo thành tam giác";
    } else if (a === b && b === c) {
        return "Tam giác đều";
    } else if (a === b || b === c || a === c) {
        return "Tam giác cân";
    } else if (
        a ** 2 + b ** 2 === c ** 2 ||
        a ** 2 + c ** 2 === b ** 2 ||
        b ** 2 + c ** 2 === a ** 2
    ) {
        return "Tam giác vuông";
    } else {
        return "Tam giác thường";
    }
};

console.log(classifyTriangle(3, 4, 5));
// Tam giác vuông

console.log(classifyTriangle(5, 3, 4));
// Tam giác vuông

console.log(classifyTriangle(2, 2, 2));
// Tam giác đều

console.log(classifyTriangle(2, 2, 3));
// Tam giác cân

console.log(classifyTriangle(1, 2, 10));
// Không tạo thành tam giác

console.log(classifyTriangle(-1, 2, 3));
// Cạnh không hợp lệ