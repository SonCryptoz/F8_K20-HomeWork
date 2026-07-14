const students = [
    { id: 1, name: "Khoa Nguyen" },
    { id: 2, name: "My Tran" },
    { id: 3, name: "Phong Le" },
    { id: 4, name: "Yen Vo" },
    { id: 5, name: "Bao Pham" },
];

const answerKey = [
    { question: 1, correctAnswer: "A", point: 2 },
    { question: 2, correctAnswer: "C", point: 1 },
    { question: 3, correctAnswer: "B", point: 3 },
    { question: 4, correctAnswer: "D", point: 2 },
    { question: 5, correctAnswer: "A", point: 2 },
];

const submissions = [
    {
        studentId: 1,
        submittedAt: "2026-07-10T08:00:00",
        answers: [
            { question: 1, answer: "A" },
            { question: 2, answer: "C" },
            { question: 3, answer: "B" },
            { question: 4, answer: "A" },
            { question: 5, answer: "A" },
        ],
    },
    {
        studentId: 2,
        submittedAt: "2026-07-10T08:05:00",
        answers: [
            { question: 1, answer: "A" },
            { question: 2, answer: "B" },
            { question: 3, answer: "B" },
            { question: 4, answer: "D" },
            { question: 5, answer: "C" },
        ],
    },
    {
        studentId: 3,
        submittedAt: "2026-07-10T07:58:00",
        answers: [
            { question: 1, answer: "A" },
            { question: 2, answer: "C" },
            { question: 3, answer: "B" },
            { question: 4, answer: "D" },
            { question: 5, answer: "A" },
        ],
    },
    {
        studentId: 4,
        submittedAt: "2026-07-10T08:02:00",
        answers: [
            { question: 1, answer: "B" },
            { question: 2, answer: "C" },
        ],
    },
    {
        studentId: 5,
        submittedAt: "2026-07-10T08:01:00",
        answers: [
            { question: 1, answer: "A" },
            { question: 2, answer: "C" },
            { question: 3, answer: "B" },
            { question: 4, answer: "D" },
            { question: 5, answer: "A" },
        ],
    },
];

function gradeExam(students, answerKey, submissions) {
    // Kiểm tra và lọc submissions sở hữu thuộc tính answers trực tiếp
    const validSubmissions = submissions.filter((submission) => {
        return Object.hasOwn(submission, "answers");
    });

    // Tra cứu kết quả để so sánh
    const answerKeyList = answerKey.reduce(
        (obj, { question, correctAnswer, point }) => {
            obj[question] = {
                question,
                correctAnswer,
                point,
            };

            return obj;
        },
        {},
    );

    // Lặp từng học sinh
    const result = students
        .map((student) => {
            // Tìm các kết quả của mỗi học sinh
            const submissionStudent = validSubmissions.find(
                (submission) => submission.studentId === student.id,
            );

            // Kiểm tra nếu học sinh không có submissions thì return
            if (!submissionStudent) {
                return {
                    id: student.id,
                    name: student.name,
                    score: 0,
                    correctCount: 0,
                    wrongQuestions: answerKey.map(({ question }) => question),
                    rank: null,
                    submittedAt: null,
                };
            }

            // Array lưu số thứ tự các kết quả sai và các câu đã trả lời
            const wrongQuestions = [],
                answeredQuestions = [];

            // Biến tính tổng câu đúng và điểm
            let score = 0,
                correctCount = 0;

            // Lặp từng answer của học sinh
            submissionStudent.answers.forEach((ans) => {
                // Lấy câu trả lời
                const a = answerKeyList[ans.question];

                // So sánh câu trả lời của học sinh với key
                if (ans.answer === a.correctAnswer) {
                    score += a.point;
                    correctCount++;
                } else {
                    wrongQuestions.push(ans.question);
                }

                answeredQuestions.push(ans.question);
            });

            // Kiểm tra học sinh đã trả lời hết câu hỏi chưa, nếu chưa các câu chưa trả lời mặc định là sai
            const defaultWrong = answerKey.filter((ans) => {
                return !answeredQuestions.includes(ans.question);
            });

            defaultWrong.forEach(({ question }) => {
                wrongQuestions.push(question);
            });

            return {
                id: student.id,
                name: student.name,
                score,
                correctCount,
                wrongQuestions: wrongQuestions.sort((a, b) => a - b),
                rank: null,
                submittedAt: submissionStudent.submittedAt,
            };
        })
        .sort((a, b) => {
            if (b.score === a.score) {
                // bằng điểm cũng như bằng rank với nhau thì sắp xếp theo thời gian submit sớm nhất
                return new Date(a.submittedAt) - new Date(b.submittedAt);
            }
            return b.score - a.score;
        });

    // Logic xếp đồng hạng (rank)
    for (let i = 0; i < result.length; i++) {
        if (i === 0) {
            result[i].rank = 1;
        } else {
            if (result[i].score === result[i - 1].score) {
                result[i].rank = result[i - 1].rank;
            } else {
                result[i].rank = i + 1;
            }
        }
    }

    return result.map(({ submittedAt, ...rest }) => rest);
}

const result = gradeExam(students, answerKey, submissions);
console.log(result);

// TODO: Test Case 1 - So khớp đáp án cơ bản => OK
// * Input: học sinh Bao Pham trả lời đúng câu 1 (2 điểm), sai câu 2, đúng câu 3 (3 điểm), sai câu 4, đúng câu 5 (2 điểm).
// * Output:
// {
//   score: 7,
//   correctCount: 3,
//   wrongQuestions: [2, 4],
// }

// TODO: Test Case 2 - Học sinh bỏ trống một số câu => OK
// * Input: học sinh Yen Vo chỉ trả lời câu 1 và câu 2, không có câu 3, 4, 5 trong answers.
// * Output: wrongQuestions phải chứa đầy đủ [3, 4, 5] cộng thêm câu nào trả lời sai trong số câu 1, 2 (nếu có)
// Yen Vo có 3 câu chưa trả lời và 1 câu trả lời sai => [1, 3, 4, 5]

// TODO: Test Case 3 - Học sinh không có submission nào => OK
// * Input: studentId không xuất hiện trong submissions.
// * Output:
// {
//   score: 0,
//   correctCount: 0,
//   wrongQuestions: [1, 2, 3, 4, 5],
// }

// TODO: Test Case 4 - Đồng điểm phải đồng rank => OK
// * Input:
// Khoa   : 10 diem
// Yen    : 10 diem
// Phong  : 10 diem
// Bao    :  7 diem
// * Output:
// Khoa, Yen, Phong  → rank: 1, 1, 1
// Bao               → rank: 4

// TODO: Test Case 5 - Thứ tự hiển thị khi đồng điểm và đồng rank => OK
// * Input: Khoa, Yen, Phong đều đạt 10 điểm nhưng nộp bài lúc 08:00:00, 08:01:00 (giả định), 07:58:00.
// * Output:
// Thứ tự hiển thị trong mảng kết quả: Phong, Khoa, Yen
// (vì nộp bài sớm hơn thì đứng trước, dù rank cả ba đều bằng 1)

// TODO: Test Case 6 - Nhảy cóc rank sau nhóm đồng hạng lớn => OK
// * Input:
// 4 học sinh cùng đạt điểm cao nhất
// 1 học sinh đạt điểm thấp hơn
// * Output:
// 4 học sinh đầu → rank: 1
// Học sinh còn lại → rank: 5

// TODO: Test Case 7 - submission thiếu thuộc tính answers riêng => OK
const brokenSubmission = Object.create({
    answers: [{ question: 1, answer: "A" }],
});
brokenSubmission.studentId = 2;
brokenSubmission.submittedAt = "2026-07-10T08:05:00";
// brokenSubmission không có "answers" là thuộc tính riêng

const submissions2 = [...submissions];
submissions2[1] = brokenSubmission;

const result2 = gradeExam(students, answerKey, submissions2);
console.log(result2);
// Học sinh My Tran có studentId = 2 được tính như không nộp bài, score = 0, wrongQuestions = [1, 2, 3, 4, 5]

// TODO: Test Case 8 - Kiểm tra khóa kết quả (chặn sửa, xóa, cho phép thêm mới) => OK
for (const item of result) {
    for (const key of Object.keys(item)) {
        Object.defineProperty(item, key, {
            writable: false,
            configurable: false,
        });
    }
}

result[0].score = 999; // không sửa được
result[0].note = "diem danh gia them"; // thêm note được
console.log(result);

// result[0].score vẫn giữ nguyên giá trị đã tính ban đầu, không đổi thành 999
// result[0].note được thêm thành công, xuất hiện trong object

// TODO: Test Case 9 - Iterator lọc câu sai => OK
class WrongAnswerIterator {
    constructor(studentResult) {
        this.studentResult = studentResult;
    }

    [Symbol.iterator]() {
        const length = this.studentResult.wrongQuestions.length;
        let index = 0;
        return {
            next: () => {
                if (index < length) {
                    const result = this.studentResult.wrongQuestions[index];
                    index++;
                    return { value: result, done: false };
                }
                return { value: undefined, done: true };
            },
        };
    }
}

const boa = result.find((r) => r.name === "Yen Vo");
const w = new WrongAnswerIterator(boa);
console.log([...w]);
// [1, 3, 4, 5]

const boa2 = result.find((r) => r.name === "Bao Pham");
console.log([...new WrongAnswerIterator(boa2)]);
// []

for (const wrongAns of w) {
    console.log(wrongAns);
}
// 1
// 3
// 4
// 5

// TODO: Test Case 10 - Không có dữ liệu => OK
// * Input
// students = [];
// answerKey = [];
// submissions = [];
// * Output
// []
