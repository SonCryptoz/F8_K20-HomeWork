// TODO: Main Object
const item1 = {
    name: "Nguyễn Văn A",
    age: 28,
    department: "IT",
    salary: 15000000,
    introduce() {
        return `Tôi là ${this.name}, ${this.age} tuổi`;
    },
};

// * 1. Tạo một object gốc, bên trong có một method trả về câu giới thiệu ngắn dựa trên 2 thuộc tính (tên và tuổi) lấy từ this.
console.log(item1.introduce());
// Output: "Tôi là Nguyễn Văn A, 28 tuổi"

// * 2. Dùng Object.create() tạo tiếp một object khác có prototype là object gốc ở trên, đồng thời thêm vào một method
// * mới — trả về một câu mô tả dựa trên 2 thuộc tính khác (ví dụ phòng ban và lương) lấy từ this.
const item2 = Object.create(item1);
item2.getInfo = function () {
    return `${this.name} làm ở phòng ${this.department}, lương ${this.salary}`;
};

console.log(item2.getInfo());
// Output: "Nguyễn Văn A làm ở phòng IT, lương 15000000"

// * 3. Tạo ít nhất 5 object cụ thể, prototype của mỗi cái đều là object ở bước 2. Mỗi object này chỉ cần chứa đúng 4 thuộc tính riêng
// * của nó thôi (tên, tuổi, phòng ban, lương) — đừng viết lại các method đã có sẵn ở prototype làm gì.
const obj1 = Object.create(item2);
obj1.name = "Phạm Văn A";
obj1.age = 33;
obj1.department = "HR";
obj1.salary = 19000000;

const obj2 = Object.create(item2);
obj2.name = "Vũ Ngọc B";
obj2.age = 26;
obj2.department = "Marketing";
obj2.salary = 15000000;

const obj3 = Object.create(item2);
obj3.name = "Trần Đức C";
obj3.age = 30;
obj3.department = "HR";
obj3.salary = 17000000;

const obj4 = Object.create(item2);
obj4.name = "Nguyễn Thành D";
obj4.age = 28;
obj4.department = "Accountant";
obj4.salary = 15000000;

const obj5 = Object.create(item2);
obj5.name = "Lê Thị E";
obj5.age = 22;
obj5.department = "Marketing";
obj5.salary = 22000000;

console.log(obj1);
console.log(obj2);
console.log(obj3);
console.log(obj4);
console.log(obj5);

// * 4. Viết một hàm để kiểm tra xem một thuộc tính có phải là thuộc tính riêng của object hay không (tức không tính mấy cái kế thừa từ prototype).
// * Dùng cách viết hiện đại, đừng gọi trực tiếp qua chính object đó.
const checkOwnProperty = (objItem, property) => {
    if (
        objItem === null ||
        typeof objItem !== "object" ||
        Array.isArray(objItem) ||
        typeof property !== "string"
    )
        return "Invalid Input";
    return Object.hasOwn(objItem, property);
};

console.log(checkOwnProperty(item1, "name"));
// Output: true
console.log(checkOwnProperty(item1, "introduce"));
// Output: true

// * 5. Viết code chứng minh chuỗi prototype hoạt động đúng: từ một object cụ thể, truy ngược lên sẽ ra được object ở bước 2,
// * rồi từ đó truy tiếp lên sẽ ra object gốc ở bước 1. Sau đó tạo thêm một prototype hoàn toàn mới,
// * có method mô tả trả về câu khác hẳn, rồi đổi prototype của một trong các object cụ thể sang
// * cái mới này — chứng minh hành vi của nó đổi theo ngay lập tức.
console.log(Object.getPrototypeOf(obj1)); // obj1 kế thừa prototype của item2
console.log(Object.getPrototypeOf(item2)); // item2 kế thừa prototype của item1

const levelTwoProto = {
    hugs() {
        return "Hôm nay rất vui nên ôm bạn 1 phát thật lâu ^.^";
    },
};

const newProto = {
    describe() {
        return "Tôi là prototype hoàn toàn mới!";
    },
};

Object.setPrototypeOf(obj1, levelTwoProto);
Object.setPrototypeOf(levelTwoProto, newProto);

console.log(typeof obj1.introduce); // "undefined"
console.log(typeof obj1.getInfo); // "undefined"

console.log(obj1.hugs());
// "Hôm nay rất vui nên ôm bạn 1 phát thật lâu ^.^"

console.log(obj1.describe());
// "Tôi là prototype hoàn toàn mới!"

console.log(Object.getPrototypeOf(obj1) === levelTwoProto);
// Output: true
console.log(Object.getPrototypeOf(levelTwoProto) === newProto);
// Output: true

Object.setPrototypeOf(obj2, newProto);
console.log(obj2.describe());
// Output: câu mô tả khác hẳn, lấy từ newProto
// "Tôi là prototype hoàn toàn mới!"

// * 6. In ra tên toàn bộ các thuộc tính riêng (không tính kế thừa) của một object cụ thể bất kỳ.
console.log(Object.getOwnPropertyNames(item1));
// Output: ["name", "age", "department", "salary", "introduce"]

console.log(Object.getOwnPropertyNames(item2));
// Output: ["getInfo"]

// * 7. Lấy descriptor đầy đủ (value, writable, enumerable, configurable) của một thuộc tính bất kỳ trên object đó.
console.log(Object.getOwnPropertyDescriptor(item1, "salary"));
// Output: { value: 15000000, writable: true, enumerable: true, configurable: true }

console.log(Object.getOwnPropertyDescriptor(item2, "getInfo"));
// Output:  { value: [Function (anonymous)], writable: true, enumerable: true, configurable: true }

// * 8. Niêm phong một trong các object cụ thể lại, sao cho không ai thêm hay xóa thuộc tính được nữa, 
// * nhưng vẫn sửa được giá trị của thuộc tính đã có sẵn (ví dụ lương). Viết code kiểm chứng cả hai điều này luôn. 
Object.seal(item1);
item1.bonus = 1000000;
console.log(item1.bonus);
// Output: undefined

Object.seal(item2);
item2.address = "Ha Noi";
console.log(item2.address);
// Output: undefined

item1.salary = 20000000;
console.log(item1.salary);
// Output: 20000000

console.log(Object.isSealed(item2));
console.log(Object.isSealed(item1));
// Output: true

// * 9. Có sẵn một mảng chứa các object cụ thể ở bước 3, thuộc ít nhất 2-3 phòng ban khác nhau. 
// * Dùng Object.groupBy() để nhóm chúng lại theo phòng ban.
const items = [obj1, obj2, obj3, obj4, obj5];
const grouped = Object.groupBy(items, (item) => item.department);
console.log(grouped);
// Output: object chứa các mảng item, đã nhóm theo phòng ban

// * 10. Cho một mảng gồm các cặp [mã, tên], dùng Object.fromEntries() biến nó thành một object để tra cứu nhanh theo mã.
const lookup = Object.fromEntries([
    ["A001", obj1.name],
    ["A002", obj2.name],
    ["A003", obj3.name],
    ["A004", obj4.name],
    ["A005", obj5.name],
]);
console.log(lookup);
// Output: 
// {
//   A001: 'Phạm Văn A',
//   A002: 'Vũ Ngọc B',
//   A003: 'Trần Đức C',
//   A004: 'Nguyễn Thành D',
//   A005: 'Lê Thị E'
// }
console.log(lookup["A002"]);
// Output: "Vũ Ngọc B"
