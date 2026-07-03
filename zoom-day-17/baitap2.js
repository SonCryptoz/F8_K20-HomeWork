const comments = [
    {
        id: 1,
        user: "An",
        content: "Sản phẩm rất tốt!",
        rating: 5,
        verified: true,
        likes: 12,
    },
    { id: 2, user: "", content: "ok", rating: 3, verified: false, likes: 0 },
    {
        id: 3,
        user: "Bình",
        content: "Mua lần 2 rồi, vẫn chất lượng",
        rating: 4,
        verified: true,
        likes: 8,
    },
    {
        id: 4,
        user: "Chi",
        content: "   ",
        rating: null,
        verified: false,
        likes: 2,
    },
    {
        id: 5,
        user: "Duy",
        content: "Giao hàng nhanh, đóng gói cẩn thận, sẽ ủng hộ tiếp!",
        rating: 5,
        verified: true,
        likes: 20,
    },
    {
        id: 6,
        user: null,
        content: "Tệ quá",
        rating: 1,
        verified: false,
        likes: 0,
    },
    {
        id: 7,
        user: "Em",
        content: "Bình thường",
        rating: 3,
        verified: true,
        likes: 1,
    },
];

// * Hàm 1: isValidComment(comment)
// Một bình luận hợp lệ khi:

// user là chuỗi không rỗng và không phải null/undefined

// content là chuỗi có ít nhất 5 ký tự sau khi xóa khoảng trắng 2 đầu

// rating là số từ 1 đến 5

// Trả về true hoặc false.

const isValidComment = (comment) => {
    return (
        typeof comment.user === "string" &&
        comment.user !== "" &&
        typeof comment.content === "string" &&
        comment.content.trim().length >= 5 &&
        typeof comment.rating === "number" &&
        comment.rating >= 1 &&
        comment.rating <= 5
    );
};

console.log(isValidComment(comments[0])); // true
console.log(isValidComment(comments[1])); // false  (user rỗng, content quá ngắn)
console.log(isValidComment(comments[3])); // false  (content chỉ có khoảng trắng, rating null)
console.log(isValidComment(comments[5])); // false  (user null)

// * Hàm 2: filterValidComments(comments)
// Trả về mảng chỉ gồm các bình luận hợp lệ (dùng isValidComment).
const filterValidComments = (comments) => {
    return comments.filter((comment) => isValidComment(comment));
};

console.log(filterValidComments(comments));
console.log(filterValidComments(comments)[0].id); // 1
console.log(filterValidComments(comments)[1].id); // 3
console.log(filterValidComments(comments)[2].id); // 5
console.log(filterValidComments(comments)[3].id); // 7
// [comments[0], comments[2], comments[4], comments[6]]
// id: 1, 3, 5, 7

// * Hàm 3: getCommentStats(validComments)
// Tính thống kê từ mảng bình luận hợp lệ, trả về object:

// total — tổng số bình luận hợp lệ

// avgRating — rating trung bình (làm tròn 1 chữ số thập phân)

// totalLikes — tổng lượt thích

// verifiedCount — số bình luận từ người dùng đã xác thực

// topComment — bình luận có likes cao nhất

const getCommentStats = (validComments) => {
    let maxLikes = -Infinity;
    const newObj = validComments.reduce((obj, commentObj) => {
        if (maxLikes < commentObj.likes) {
            maxLikes = commentObj.likes;
        }

        obj.total = validComments.length;
        obj.avgRating = (obj.avgRating || 0) + commentObj.rating;
        obj.totalLikes = (obj.totalLikes || 0) + commentObj.likes;
        obj.verifiedCount =
            (obj.verifiedCount || 0) + (commentObj.verified ? 1 : 0);
        obj.topComment =
            commentObj.likes === maxLikes ? commentObj : obj.topComment;

        return obj;
    }, {});

    newObj.avgRating =
        Math.round((newObj.avgRating / validComments.length) * 10) / 10;

    return newObj;
};

console.log(getCommentStats(filterValidComments(comments)));
// {
//   total: 4,
//   avgRating: 4.3,
//   totalLikes: 41,
//   verifiedCount: 3,
//   topComment: { id: 5, user: "Duy", content: "Giao hàng nhanh...", likes: 20, ... }
// }

// * Hàm 4: formatComment(comment)
// Trả về chuỗi hiển thị bình luận dùng template literal:
// Số sao ⭐ bằng đúng giá trị rating

// Nếu verified = true thêm ✓ sau tên, ngược lại không có

// Tên hiển thị dùng user ?? "Ẩn danh"

const formatComment = (comment) => {
    return `${"⭐".repeat(comment.rating)} | ${comment.user || "Ẩn danh"} ${comment.verified ? "✓" : ""} | ${comment.content} | 👍 ${comment.likes}`;
};

console.log(formatComment(comments[0]));
// "⭐⭐⭐⭐⭐ | An ✓ | Sản phẩm rất tốt! | 👍 12"

console.log(formatComment(comments[2]));
// "⭐⭐⭐⭐ | Bình ✓ | Mua lần 2 rồi, vẫn chất lượng | 👍 8"

console.log(formatComment(comments[6]));
// "⭐⭐⭐ | Em ✓ | Bình thường | 👍 1"
