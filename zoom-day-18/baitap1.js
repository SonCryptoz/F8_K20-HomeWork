const examResults = [
    { student: "An", scores: [8.5, 7, 9, 6.5] },
    { student: "Bình", scores: [10, 9.5, 8, 10] },
    { student: "Chi", scores: [5, 4.5, 6, 5.5] },
    { student: "Duy", scores: [7, 7, 7, 7] },
];

// * Hàm 1: getAverage(scores)
// Tính điểm trung bình của một mảng điểm, làm tròn đến 1 chữ số thập phân (dùng toFixed, sau đó chuyển lại về số bằng Number()).

const getAverage = (scores) => {
    if (!Array.isArray(scores) || scores.length < 1)
        return "Invalid Input";
    return Number(
        (
            scores.reduce((total, score) => {
                return total + score;
            }, 0) / scores.length
        ).toFixed(1),
    );
};

console.log(getAverage([8.5, 7, 9, 6.5])); // 7.75 -> 7.8
console.log(getAverage([10, 9.5, 8, 10])); // 9.375 -> 9.4
console.log(getAverage([7.5, 9.1, 6.8, 7, 7.7])); // 7.62 -> 7.6
console.log(getAverage([6.2, 5.1, 10, 8.4, 5.9])); // 7.12 -> 7.1
console.log(getAverage([2.4, 9.1, 5.8, 7.1, 4.7, 7, 8.1, 10])); // 6.7749999999999995 -> 6.8

console.log(getAverage(examResults[0].scores)); // 7.75 -> 7.8
console.log(getAverage(examResults[1].scores)); // 9.375 -> 9.4
console.log(getAverage(examResults[2].scores)); // 5.25 -> 5.3
console.log(getAverage(examResults[3].scores)); // 7 -> 7

console.log(getAverage()); // Invalid
console.log(getAverage(123)); // Invalid
console.log(getAverage("qwe")); // Invalid
console.log(getAverage([])); // Invalid
console.log(getAverage({})); // Invalid

// * Hàm 2: classifyStudent(average)
// Phân loại học lực dựa trên điểm trung bình:

// >= 9 → "Xuất sắc"

// >= 8 → "Giỏi"

// >= 6.5 → "Khá"

// >= 5 → "Trung bình"

// còn lại → "Yếu"

const classifyStudent = (average) => {
    if (typeof average !== "number" || Number.isNaN(average))
        return "Invalid Input";
    switch (true) {
        case average >= 9:
            return "Xuất sắc";
        case average >= 8:
            return "Giỏi";
        case average >= 6.5:
            return "Khá";
        case average >= 5:
            return "Trung bình";
        default:
            return "Yếu";
    }
};

const classifyStudent2 = () => {
    return examResults.map(({ student, scores }) => {
        const average = getAverage(scores);
        return `${student}: ${classifyStudent(average)}`;
    });
};

console.log(classifyStudent(9.4)); // "Xuất sắc"
console.log(classifyStudent(7.8)); // "Khá"
console.log(classifyStudent(4.5)); // "Yếu"
console.log(classifyStudent(6)); // "Trung bình"
console.log(classifyStudent(8)); // "Giỏi"
console.log(classifyStudent(7)); // "Khá"

console.log(classifyStudent()); // "Invalid"
console.log(classifyStudent("123")); // "Invalid"
console.log(classifyStudent([])); // "Invalid"
console.log(classifyStudent({})); // "Invalid"
console.log(classifyStudent(NaN)); // "Invalid"

console.log(classifyStudent2()); // [ 'An: Khá', 'Bình: Xuất sắc', 'Chi: Trung bình', 'Duy: Khá' ]

// * Hàm 3: isValidScore(score)
// Kiểm tra một điểm số có hợp lệ không:

// Phải là số hữu hạn (dùng Number.isFinite)

// Phải nằm trong khoảng từ 0 đến 10

const isValidScore = (score) => {
    return Number.isFinite(score) && score >= 0 && score <= 10;
};

const isValidScore2 = () => {
    return examResults.map(({ scores }) => {
        return scores.map((score) => isValidScore(score));
    });
};

console.log(isValidScore(8.5)); // true
console.log(isValidScore(-1)); // false
console.log(isValidScore(11)); // false
console.log(isValidScore(Infinity)); // false
console.log(isValidScore(NaN)); // false
console.log(isValidScore("hello")); // false
console.log(isValidScore([])); // false
console.log(isValidScore({})); // false
console.log(isValidScore(undefined)); // false

console.log(isValidScore2());
// [
//   [ true, true, true, true ],
//   [ true, true, true, true ],
//   [ true, true, true, true ],
//   [ true, true, true, true ]
// ]

// * Hàm 4: getReportCard(examResults)
// Kết hợp các hàm trên, trả về mảng object báo cáo:

const isValidStudents = (data) => {
    return (
        Array.isArray(data) &&
        data.every((item) => {
            const keys = Object.keys(item);

            return (
                keys.length === 2 &&
                keys.includes("student") &&
                keys.includes("scores") &&
                typeof item.student === "string" &&
                Array.isArray(item.scores)
            );
        })
    );
};

const getReportCard = (examResults) => {
    if (!isValidStudents(examResults)) return "Invalid Input";

    return examResults.reduce((resultArr, result) => {
        const getAve = getAverage(result.scores);

        resultArr.push({
            student: result.student,
            average: getAve,
            classification: classifyStudent(getAve),
        });

        return resultArr;
    }, []);
};

console.log(getReportCard(examResults));
// [
//   { student: "An",   average: 7.8, classification: "Khá" },
//   { student: "Bình", average: 9.4, classification: "Xuất sắc" },
//   { student: "Chi",  average: 5.3, classification: "Trung bình" },
//   { student: "Duy",  average: 7,   classification: "Khá" },
// ]

console.log(getReportCard([1]));
console.log(getReportCard(2));
console.log(getReportCard());
console.log(getReportCard("dfghjdf"));
console.log(getReportCard({ name: "Viktor" }));
