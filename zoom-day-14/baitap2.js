// Hàm xử lý logic
const calculateScore = (
    level = 0, // đối số mặc định khi không truyền tham số
    kills = 0, // đối số mặc định khi không truyền tham số
    boosted = false, // đối số mặc định khi không truyền tham số
) => {
    // điều kiện nếu level hoặc kills không phải số hoặc nhỏ hơn 0, trả về chuỗi "Dữ liệu không hợp lệ".
    if (
        typeof level === "number" &&
        typeof kills === "number" &&
        level >= 0 &&
        kills >= 0 && 
        !isNaN(level) &&
        !isNaN(kills)
    ) {
        // kiểm tra nếu boosted không phải boolean -> fallback false
        boosted = typeof boosted === "boolean" ? boosted : false; 

        // công thức tính điểm thưởng
        const baseScore = kills * 10;
        const bonusScore = level >= 5 ? baseScore * 0.5 : baseScore * 0.2;
        const finalScore = boosted
            ? (baseScore + bonusScore) * 2
            : baseScore + bonusScore;

        return Math.floor(finalScore); // làm tròn xuống số nguyên gần nhất
    }
    return "Dữ liệu không hợp lệ";
};

console.log(calculateScore(5, 20, true)); // 600
console.log(calculateScore(3, 10, false)); // 120
console.log(calculateScore(5, 15, false)); // 225
console.log(calculateScore(1, 50, true)); // 1200

console.log(calculateScore(-1, 10, true)); // "Dữ liệu không hợp lệ"
console.log(calculateScore(2, -5, false)); // "Dữ liệu không hợp lệ"
console.log(calculateScore("abc", 10, true)); // "Dữ liệu không hợp lệ"
console.log(calculateScore(2, "abc", false)); // "Dữ liệu không hợp lệ"

console.log(calculateScore(5, 15, null)); // 225  (boosted = false)
console.log(calculateScore(5, 15, "yes")); // 225  (boosted = false)
console.log(calculateScore(5, 15, undefined)); // 225  (boosted = false)
