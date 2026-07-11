// * 1. Tạo một object cấu hình, bên trong có vài thuộc tính tùy ý (một số, một chuỗi, một số khác cũng được). Sau khi tạo xong thì "khóa cứng" lại
// * — không cho ai sửa, thêm hay xóa bất kỳ thuộc tính nào của nó nữa, dù có cố tình gán đè cũng vô hiệu.
const configurationObject = {
    type: "GAME",
    name: "Super Mario",
    size: 30,
    character: [
        {
            id: 1,
            name: "Mario",
        },
        {
            id: 2,
            name: "Luigi",
        },
    ],
    surcharge: 0.1,
};

Object.freeze(configurationObject);

configurationObject.map = "Sunny Garden";
console.log(configurationObject.map); // undefined

configurationObject.size = 50;
console.log(configurationObject.size); // 30

delete configurationObject.name;
console.log(configurationObject.name); // Super Mario

console.log(Object.isFrozen(configurationObject));
// Output: true

// * 2. Viết một class, trong đó:
//      Constructor nhận vào một cái tên, và tự tạo sẵn một danh sách rỗng bên trong để sau này chứa các phần tử.

//      Có một method để thêm phần tử vào danh sách (mỗi phần tử gồm: tên, đơn giá, số lượng).

//      Có một getter để tính tổng giá trị của cả danh sách — cộng thêm phần phụ phí lấy từ object cấu hình ở bước 1.
//      Getter này gọi như một thuộc tính bình thường (không có dấu ngoặc đơn phía sau).

//      Có một setter để gán phần trăm giảm giá. Lần tính tổng tiếp theo sẽ áp dụng mức giảm này.
//      Nếu ai đó gán một con số ngoài khoảng 0–100 thì phải báo lỗi ngay.

class MyClass {
    constructor(name) {
        this.name = name;
        this.list = [];
    }

    addItem(name, price, amount) {
        this.list.push({
            name,
            price,
            amount,
        });
    }

    get total() {
        const result = this.list.reduce((total, { price, amount }) => {
            return total + price * amount;
        }, 0);

        return (
            result *
            (1 + configurationObject.surcharge) *
            (this.discount !== undefined ? 1 - this.discount / 100 : 1)
        );
    }

    set discountPercent(discount) {
        if (!Number.isFinite(discount) || discount < 0 || discount > 100)
            throw new Error("Discount phải từ 0 đến 100 và phải là số");
        this.discount = discount;
    }
}

const instance = new MyClass("Danh sách của An");
instance.addItem("Bàn phím", 500000, 2);
instance.addItem("Chuột", 200000, 1);

console.log(instance.total);
// Output: 1320000

instance.discountPercent = 10;
console.log(instance.total);
// Output: 1188000

try {
    instance.discountPercent = 150;
} catch (e) {
    console.log(e.message);
}
// Output: một câu báo lỗi cho dễ hiểu, kiểu "Discount phải từ 0 đến 100"

// * 3. Viết một hàm riêng, đứng ngoài class, hàm này khi được gọi với this là một instance của class ở trên thì
// * sẽ in ra tên và tổng giá trị hiện tại. Vấn đề là: nếu đem hàm này gán làm callback cho setTimeout hay một sự kiện nào đó,
// * this bên trong sẽ bị "quên mất" nó đang thuộc về instance nào. Bạn cần xử lý để dù gọi ở đâu, hàm vẫn nhớ đúng context của nó.
const logSummary = function () {
    console.log(`${this.name}: ${this.total}`);
};

setTimeout(logSummary.bind(instance), 1000);
// Output sau 1000ms: "Danh sách của An: 1188000"

// * 4. Dùng Object.defineProperty để gắn thêm một cái id riêng cho mỗi instance, với 3 tính chất:

//      Không ai ghi đè được giá trị của nó.

//      Không hiện ra khi lặp bằng for...in hay gọi Object.keys().

//      Không thể bị xóa đi.

Object.defineProperty(instance, "id", {
    value: "A01",
    writable: false,
    enumerable: false,
    configurable: false,
});

console.log(Object.keys(instance));
// Output: mảng không có chữ "id" trong đó => [ 'name', 'list', 'discount' ]

for (const key in instance) {
    console.log(key);
}
// Không có id

instance.id = "hack123";
console.log(instance.id);
// Output: vẫn là id lúc đầu, không bị thay => A01

delete instance.id;
console.log(instance.id); // A01

// * 5. Có sẵn hai object đơn giản, object thứ hai có vài thuộc tính trùng tên với object thứ nhất.
// * Hãy gộp chúng lại thành một object mới (cái nào trùng tên thì lấy giá trị của object thứ hai),
// * nhưng nhớ là không được đụng chạm hay làm thay đổi gì tới hai object gốc.
const obj1 = { name: "John", age: 22, address: "Ha Noi" };
const obj2 = {
    name: "Alice",
    age: 20,
    sexual: "Female",
    major: "Marketing",
    hobbies: ["Read Books", "Swimming", "Cycling"],
};

// const merged = { ...obj1, ...obj2 };
const merged = Object.assign({}, obj1, obj2);

console.log(merged);
// Output: object đã gộp xong, ưu tiên giá trị của object thứ hai\

console.log(obj1);
console.log(obj2);
// Output: object gốc vẫn y nguyên, không bị đụng tới
