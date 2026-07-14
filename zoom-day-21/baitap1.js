const members = [
    { id: 1, name: "Minh Tran", email: "minh@example.com" },
    { id: 2, name: "Lan Pham", email: "lan@example.com" },
    { id: 3, name: "Huy Nguyen", email: "huy@example.com" },
    { id: 4, name: "Trang Le", email: "trang@example.com" },
    { id: 5, name: "Duc Vo", email: "duc@example.com" },
];

const books = [
    { id: 201, title: "Clean Code", finePerDay: 5000 },
    { id: 202, title: "Atomic Habits", finePerDay: 3000 },
    { id: 203, title: "Sapiens", finePerDay: 4000 },
    { id: 204, title: "Deep Work", finePerDay: 2000 },
    { id: 205, title: "The Pragmatic Programmer", finePerDay: 6000 },
];

const borrowRecords = [
    {
        id: 3001,
        memberId: 1,
        lines: [
            { bookId: 201, lateDays: 2 },
            { bookId: 202, lateDays: 0 },
        ],
    },
    {
        id: 3002,
        memberId: 2,
        lines: [
            { bookId: 202, lateDays: 1 },
            { bookId: 203, lateDays: 3 },
        ],
    },
    {
        id: 3003,
        memberId: 3,
        lines: [
            { bookId: 204, lateDays: 5 },
            { bookId: 205, lateDays: 2 },
        ],
    },
    {
        id: 3004,
        memberId: 4,
        lines: [
            { bookId: 201, lateDays: 1 },
            { bookId: 203, lateDays: 2 },
        ],
    },
    {
        id: 3005,
        memberId: 5,
        lines: [{ bookId: 205, lateDays: 10 }],
    },
    {
        id: 3006,
        memberId: 1,
        lines: [
            { bookId: 201, lateDays: 1 },
            { bookId: 205, lateDays: 3 },
        ],
    },
    {
        id: 3007,
        memberId: 2,
        lines: [
            { bookId: 204, lateDays: 2 },
            { bookId: 203, lateDays: 1 },
        ],
    },
    {
        id: 3008,
        memberId: 3,
        lines: [{ bookId: 202, lateDays: 2 }],
    },
    {
        id: 3009,
        memberId: 4,
        lines: [
            { bookId: 201, lateDays: 1 },
            { bookId: 202, lateDays: 1 },
        ],
    },
    {
        id: 3010,
        memberId: 5,
        lines: [
            { bookId: 203, lateDays: 4 },
            { bookId: 204, lateDays: 3 },
        ],
    },
];

function getMemberFineStatistics(members, books, borrowRecords) {
    // Kiểm tra dữ liệu đầu vào an toàn - borrowRecord có thuộc tính lines trực tiếp
    const validBorrowRecords = borrowRecords.filter((borrowRecord) =>
        Object.hasOwn(borrowRecord, "lines"),
    );

    // tạo 1 object book list chứa các key là id và value là object trong books (tra cứu)
    const bookList = books.reduce((obj, { id, title, finePerDay }) => {
        obj[id] = {
            id,
            title,
            finePerDay,
        };

        return obj;
    }, {});

    // Lặp từng thành viên
    const result = members
        .map((member) => {
            // Lọc lấy những bản ghi mà member mượn
            const memberBorrowRecords = validBorrowRecords.filter(
                (borrowRecord) => {
                    return borrowRecord.memberId === member.id;
                },
            );

            // Tạo object tạm thời lưu books
            const bookStats = {};

            // Biến cộng dồn tổng tiền phạt
            let totalFine = 0;

            // Lặp những bản ghi mà member mượn
            memberBorrowRecords.forEach((record) => {
                // Lặp các lines
                record.lines.forEach((line) => {
                    // Lấy sách mà member mượn
                    const book = bookList[line.bookId];

                    // Tính tổng số tiền phạt
                    const fine = book.finePerDay * line.lateDays;
                    totalFine += fine;

                    // Kiểm tra object tạm thời nếu chưa có id sách mượn thì thêm mới, ngược lại cập nhật số ngày trễ và tiền phạt
                    if (bookStats[line.bookId]) {
                        bookStats[line.bookId].lateDays += line.lateDays;
                        bookStats[line.bookId].fine += fine;
                    } else {
                        bookStats[line.bookId] = {
                            title: book.title,
                            lateDays: line.lateDays,
                            fine,
                        };
                    }
                });
            });

            // Đóng băng kết quả trả về
            return Object.freeze({
                id: member.id,
                name: member.name,
                totalFine,
                books: Object.values(bookStats).sort((a, b) => b.fine - a.fine),
            });
        })
        .sort((a, b) => b.totalFine - a.totalFine);

    // Đóng băng kết quả trả về
    return Object.freeze(result);
}

const result = getMemberFineStatistics(members, books, borrowRecords);
console.log(result);

// TODO: Test Case 1 - Member mượn nhiều lần cùng một cuốn sách => OK
// * Input
// [
//   { bookId: 201, lateDays: 2 },
//   { bookId: 201, lateDays: 1 },
// ]
// * Output
// [
//   {
//     title: "Clean Code",
//     lateDays: 3,
//     fine: 15000,
//   },
// ]

// TODO: Test Case 2 - Member không có lượt mượn nào => OK
// * Input
// const members = [
//   { id: 10, name: "Khanh" },
// ];
// * Output
// [
//   {
//     id: 10,
//     name: "Khanh",
//     totalFine: 0,
//     books: [],
//   },
// ]

// TODO: Test Case 3 - Một lượt mượn có nhiều sách => OK
//  * Input
// lines = [
//   { bookId: 201, lateDays: 1 },
//   { bookId: 202, lateDays: 2 },
// ];
// * Output
// Clean Code: 5000
// Atomic Habits: 6000
// Member Total: 11000

// TODO: Test Case 4 - Nhiều lượt mượn cùng một cuốn sách => OK
// * Input
// Record 1: Clean Code, lateDays 1
// Record 2: Clean Code, lateDays 2
// Record 3: Clean Code, lateDays 4
// * Output
// {
//   title: "Clean Code",
//   lateDays: 7,
//   fine: 35000,
// }

// TODO: Test Case 5 - Kiểm tra sắp xếp member => OK
// * Input
// Huy   : 28000
// Lan   : 33000
// Minh  : 30500
// * Output
// Lan
// Minh
// Huy

// TODO: Test Case 6 - Kiểm tra sắp xếp sách => OK
// * Input
// Clean Code                  18000
// The Pragmatic Programmer    24000
// Atomic Habits                6000
// Deep Work                        0
// * Output
// The Pragmatic Programmer
// Clean Code
// Atomic Habits
// Deep Work

// TODO: Test Case 7 - Member chỉ mượn một cuốn sách => OK
// * Output
// {
//   id: 5,
//   name: "Duc",
//   totalFine: 60000,
//   books: [
//     {
//       title: "The Pragmatic Programmer",
//       lateDays: 10,
//       fine: 60000,
//     },
//   ],
// }

// TODO: Test Case 8 - Không có dữ liệu => OK
// * Input
// members = [];
// books = [];
// borrowRecords = [];
// * Output
// []

// TODO: Test Case 9 - Kiểm tra tính bất biến của kết quả
// result[0].totalFine = 999999; // Error
// result[0].extraField = "hack"; // Error
// delete result[0].books; // Error

// result.push(124); // Error
// result.pop(); // Error
// result.splice(3, 1, 123); // Error

// console.log(result); // OK
// console.log(result[0]); // OK

// TODO: Test Case 10 - borrowRecord thiếu thuộc tính lines riêng
const brokenRecord = Object.create({ lines: [{ bookId: 201, lateDays: 5 }] });
brokenRecord.id = 3099;
brokenRecord.memberId = 1;

borrowRecords.push(brokenRecord);
const result2 = getMemberFineStatistics(members, books, borrowRecords);
console.log(result2); // kết quả như result 1
// brokenRecord không có "lines" là thuộc tính riêng, chỉ kế thừa từ prototype

// TODO: Test Case 11 - Kiểm tra phân trang kết quả
// Duyệt kết quả theo trang
class MemberPaginator {
    constructor(resultList, amountPerPage) {
        this.resultList = resultList;
        this.amountPerPage = amountPerPage > 0 ? amountPerPage : 1;
    }

    [Symbol.iterator]() {
        let currentIndex = 0;
        return {
            next: () => {
                if (currentIndex < this.resultList.length) {
                    const value = this.resultList.slice(
                        currentIndex,
                        this.amountPerPage + currentIndex,
                    );

                    currentIndex += this.amountPerPage;

                    return {
                        value,
                        done: false,
                    };
                }
                return { value: undefined, done: true };
            },
        };
    }
}

const memberPaginator = new MemberPaginator(result, 2);

console.log([...memberPaginator]);

let page = 0;

for (const pageMembers of memberPaginator) {
    console.log(
        `Trang ${++page}: ${pageMembers
            .map((member) => member.name)
            .join(", ")}`,
    );
}

// Trang 1: Duc Vo, Minh Tran
// Trang 2: Huy Nguyen, Lan Pham
// Trang 3: Trang Le
