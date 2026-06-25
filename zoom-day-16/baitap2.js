const text =
    "javascript là ngôn ngữ lập trình phổ biến javascript chạy trên trình duyệt và javascript cũng chạy trên server";

// * Tách đoạn văn thành mảng các từ.
const getWords = (text) => {
    return text.split(" ");
};

console.log(getWords(text));
// ["javascript", "là", "ngôn", "ngữ", "lập", "trình", "phổ", "biến", "javascript", "chạy", "trên", "trình", "duyệt", "và", "javascript", "cũng", "chạy", "trên", "server"]

// * Đếm số lần xuất hiện của một từ trong đoạn văn (phân biệt chữ hoa/thường).
const countWord = (text, currentText) => {
    if (typeof currentText !== "string") return "Invalid Input";
    const hasCurrentText = text.split(" ");

    return hasCurrentText.filter((text) => {
        return text === currentText;
    }).length;
};

console.log(countWord(text, "javascript")); // 3
console.log(countWord(text, "chạy")); // 2
console.log(countWord(text, "python")); // 0

// * Trả về mảng các từ không trùng lặp, sắp xếp theo thứ tự alphabet.
const getUniqueWords = (text) => {
    const uniqueWords = text.split(" ");
    return uniqueWords
        .filter((word, index) => {
            return uniqueWords.indexOf(word) === index;
        })
        .sort();
};

console.log(getUniqueWords(text));
// ! ouput bên dưới không đúng vì theo alphabet chữ "và" không thể đứng đầu trong danh sách mà phải đứng cuối
// ["và", "biến", "chạy", "cũng", "duyệt", "javascript", "là", "lập", "ngôn", "ngữ", "phổ", "server", "trên", "trình"]
// (sắp xếp alphabet, không trùng)

// * Trả về mảng n từ xuất hiện nhiều nhất, mỗi phần tử là object { word, count }, sắp xếp theo count giảm dần.
const getTopWords = (text, n) => {
    if (!Number.isInteger(n) || n < 0) return "Invalid Input";

    const words = text.split(" ");

    const obj = {};

    for (const w of words) {
        obj[w] = (obj[w] || 0) + 1;
    }

    const result = [];

    for(const item in obj) {
        result.push({
            word: item,
            count: obj[item],
        });
    }

    return result.sort((a, b) => b.count - a.count).slice(0, n);
};
console.log(getTopWords(text, 3));
// [
//   { word: "javascript", count: 3 },
//   { word: "chạy", count: 2 },
//   { word: "trên", count: 2 },
// ]

// * Trả về chuỗi gốc nhưng mỗi lần xuất hiện từ word được bọc trong **...**.
const highlight = (text, currentText) => {
    if (typeof currentText !== "string") return "Invalid Input";

    return text.split(" ").map((word) => {
        return word === currentText ? `**${word}**` : word;
    }).join(" ");
};

console.log(highlight(text, "javascript"));
// "**javascript** là ngôn ngữ lập trình phổ biến **javascript** chạy trên trình duyệt và **javascript** cũng chạy trên server"
