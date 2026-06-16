// Hàm xử lý logic
const classifyUser = (
    object = {} /* đối số mặc định khi không truyền tham số */,
) => {
    // displayName — dùng user.name nếu có, nếu không (kể cả chuỗi rỗng) thì dùng "Ẩn danh"
    const displayName = object.name || "Ẩn danh";

    // isAdult — true nếu age >= 18, ngược lại false
    const isAdult = object.age >= 18;

    // hasEmail — true nếu email là chuỗi không rỗng, ngược lại false
    const hasEmail = typeof object.email === "string" && object.email !== "";

    // role — dùng user.role nếu không phải null/undefined, ngược lại dùng "guest"
    const role =
        object.role !== null && typeof object.role !== "undefined"
            ? object.role
            : "guest";

    // status — dựa theo score
    const status =
        object.score >= 80 ? "vip" : object.score >= 50 ? "normal" : "new";
        
    const result = {
        displayName,
        isAdult,
        hasEmail,
        role,
        status,
        canAccess: isAdult && role !== "guest", // canAccess — true nếu isAdult là true VÀ role không phải "guest"
    };

    return result;
};

console.log(
    classifyUser({ name: "", age: 17, email: "", score: 0, role: null }),
);
// {
//   displayName: "Ẩn danh",  // name = "" là falsy
//   isAdult: false,
//   hasEmail: false,
//   role: "guest",
//   status: "new",
//   canAccess: false
// }

console.log(
    classifyUser({
        name: "Bình",
        age: 22,
        email: "binh@gmail.com",
        score: 85,
        role: "admin",
    }),
);
// {
//   displayName: "Bình",
//   isAdult: true,
//   hasEmail: true,
//   role: "admin",
//   status: "vip",
//   canAccess: true
// }

console.log(
    classifyUser({
        name: "Chi",
        age: 20,
        email: "chi@gmail.com",
        score: 55,
        role: undefined,
    }),
);
// {
//   displayName: "Chi",
//   isAdult: true,
//   hasEmail: true,
//   role: "guest",
//   status: "normal",
//   canAccess: false
// }

console.log(
    classifyUser({ name: "", age: 30, email: "", score: 80, role: "member" }),
);
// {
//   displayName: "Ẩn danh",
//   isAdult: true,
//   hasEmail: false,
//   role: "member",
//   status: "vip",
//   canAccess: true
// }

console.log(
    classifyUser({
        name: "Duy",
        age: 16,
        email: "duy@gmail.com",
        score: 90,
        role: "admin",
    }),
);
// {
//   displayName: "Duy",
//   isAdult: false,
//   hasEmail: true,
//   role: "admin",
//   status: "vip",
//   canAccess: false   <- chưa đủ 18 dù là admin
// }
