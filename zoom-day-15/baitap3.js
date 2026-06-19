// Tách mảng chứa số điểm hợp lệ
const splitScores = (arr) => {
    let validScores = [],
        index = 0;
    for (let i = 0; i < arr.length; i++) {
        if (
            typeof arr[i] === "number" &&
            !isNaN(arr[i]) &&
            arr[i] >= 0 &&
            arr[i] <= 10
        ) {
            validScores[index] = arr[i];
            index++;
        }
    }
    return validScores;
};

// Tính điểm trung bình làm tròn 2 chữ số
const round2 = (num) => {
    let scaled = num * 100;

    // lấy phần nguyên
    let intPart = scaled - (scaled % 1); // hoặc toán tử bitwise: scaled | 0
 
    let decimal = scaled - intPart; // hoặc scaled % 1

    if (decimal >= 0.9) {
        intPart += 1;
    }

    return intPart / 100;
};

// Main
const analyzeClass = (scoresArr) => {
    const validScoresArr = splitScores(scoresArr);
    const evaluatedObj = {
        invalidScores: 0,
        validStudents: 0,
        excellent: 0,
        great: 0,
        good: 0,
        average: 0,
        weaks: 0,
        highestScore: -Infinity,
        lowestScore: Infinity,
        averageScore: 0,
        comment: "",
    };
    let averageScore = 0;

    // Số điểm không hợp lệ
    evaluatedObj.invalidScores = scoresArr.length - validScoresArr.length;

    // Số học sinh hợp lệ
    evaluatedObj.validStudents = validScoresArr.length;

    // Số học sinh xuất sắc, điểm cao nhất và thấp nhất
    for (let i = 0; i < validScoresArr.length; i++) {
        switch (true) {
            case validScoresArr[i] >= 9:
                evaluatedObj.excellent++;
                break;
            case validScoresArr[i] >= 8:
                evaluatedObj.great++;
                break;
            case validScoresArr[i] >= 6.5:
                evaluatedObj.good++;
                break;
            case validScoresArr[i] >= 5:
                evaluatedObj.average++;
                break;
            default:
                evaluatedObj.weaks++;
        }

        // điểm cao nhất
        if (evaluatedObj.highestScore < validScoresArr[i]) {
            evaluatedObj.highestScore = validScoresArr[i];
        }

        // điểm thấp nhất
        if (evaluatedObj.lowestScore > validScoresArr[i]) {
            evaluatedObj.lowestScore = validScoresArr[i];
        }

        averageScore += validScoresArr[i];
    }

    // Xử lý điểm lớn và thấp nhất nếu không có dữ liệu hợp lệ
    if (
        evaluatedObj.highestScore === -Infinity ||
        evaluatedObj.lowestScore === Infinity
    ) {
        evaluatedObj.highestScore = 0;
        evaluatedObj.lowestScore = 0;
    }

    // Điểm trung bình
    if (validScoresArr.length) {
        evaluatedObj.averageScore = round2(
            averageScore / validScoresArr.length,
        );
    }

    // Nhận xét
    const halfValidStudent =
        (evaluatedObj.validStudents - (evaluatedObj.validStudents % 2)) / 2;

    if (evaluatedObj.validStudents === 0) {
        evaluatedObj.comment = "Không có dữ liệu hợp lệ";
    } else if (
        evaluatedObj.good + evaluatedObj.great + evaluatedObj.excellent >
        halfValidStudent
    ) {
        evaluatedObj.comment = "Lớp học tốt";
    } else if (evaluatedObj.weaks > halfValidStudent) {
        evaluatedObj.comment = "Cần cải thiện";
    } else {
        evaluatedObj.comment = "Lớp học ở mức ổn";
    }

    return evaluatedObj;
};

const score = [
    9,
    7,
    -2,
    5.5,
    10,
    4,
    11,
    6.5,
    8,
    NaN,
    "sjkfkhgf",
    {},
    [],
    undefined,
    function () {},
    213n,
    Symbol("df"),
    null,
];

console.log(analyzeClass(score));