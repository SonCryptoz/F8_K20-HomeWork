// Kiểm tra số hợp lệ
const isNumber = (num) => {
    return typeof num === "number" && !isNaN(num);
};

// Kiểm tra số nguyên tố
const isPrime = (num) => {
    if (num > 1) {
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                return false;
            }
        }
        return true;
    }
    return false;
};

// Kiểm tra chia hết cho 3 và 5
const isDivisibleBy15 = (num) => {
    return num % 3 === 0 && num % 5 === 0; // only 15;
};

// Main
const numTriangle = (num) => {
    if (!isNumber(num) || num < 1) {
        console.log("Invalid number");
    } else {
        for (let i = 1; i <= num; i++) {
            let str = "";

            for (let j = 1; j <= i; j++) {
                if (isDivisibleBy15(j)) {
                    str += "# ";
                } else if (isPrime(j)) {
                    str += "* ";
                } else {
                    str += j + " ";
                }       
            }

            console.log(str);

            if (i % 2 === 0) {
                console.log("-".repeat(i));
            }
        }
    }
};

numTriangle(15);
