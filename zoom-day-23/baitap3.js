// TODO: Viết một hàm createOrderSystem() — mỗi lần gọi hàm này sẽ tạo ra một hệ thống đặt hàng độc lập,
// TODO: hoàn toàn riêng biệt với các lần gọi khác. Hệ thống trả về phải cho phép:

// * Thêm sản phẩm vào giỏ — nhận vào tên, giá, số lượng; giỏ hàng thật sự phải nằm ở một nơi mà không ai từ bên ngoài có
// * thể truy cập trực tiếp, chỉ có thể thao tác gián tiếp qua các hàm được cung cấp.

// * Thanh toán — nhận vào khoảng cách giao hàng, tính toán theo trình tự sau:

// Cộng dồn tổng tiền tất cả sản phẩm đang có trong giỏ (price * qty của từng món)

// Tính phí ship dựa theo khoảng cách: ≤ 5km → 15000, ≤ 20km → 30000, còn lại → 50000

// Nếu tổng tiền hàng (chưa tính ship) đạt từ 500000 trở lên → miễn phí ship hoàn toàn

// Trả về đủ 3 thông tin: tiền hàng, phí ship, và tổng cộng cuối cùng

// Sau khi thanh toán xong, giỏ hàng phải tự động được làm trống để sẵn sàng cho đơn tiếp theo

// * Kiểm tra số lượng sản phẩm hiện có trong giỏ — trả về một con số.

const createOrderSystem = () => {
    let cart = [];

    return {
        addToCart(name, price, amount) {
            if (
                typeof name !== "string" ||
                !Number.isFinite(price) ||
                !Number.isInteger(amount)
            ) {
                console.log("Invalid Input");
                return;
            }

            cart.push({
                productName: name,
                productPrice: price > 0 ? price : 0,
                productAmount: amount > 0 ? amount : 0,
            });
        },

        getCartSize() {
            return cart.length;
        },

        checkout(distance) {
            if (!Number.isFinite(distance) || !cart.length)
                return "Invalid distance or your cart is empty!";
            const result = {
                subTotal: 0,
                shippingFee: 0,
                finalTotal: 0,
            };

            cart.forEach(({ productName, productPrice, productAmount }) => {
                result.subTotal += productPrice * productAmount;
            });

            if (result.subTotal >= 500000) {
                result.shippingFee = 0;
            } else {
                if (distance <= 5) {
                    result.shippingFee = 15000;
                } else if (distance <= 20) {
                    result.shippingFee = 30000;
                } else {
                    result.shippingFee = 50000;
                }
            }

            result.finalTotal = result.subTotal + result.shippingFee;

            cart = [];

            return result;
        },
    };
};

const store = createOrderSystem();

store.addToCart("Mũ lưỡi trai", 120000, 1); // 1  (số sản phẩm hiện có trong giỏ)
console.log(store.getCartSize()); // 1

console.log(store.checkout(15));
// { subtotal: 120000, shippingFee: 30000, finalTotal: 150000 }

console.log(store.getCartSize()); // 0  (giỏ hàng đã tự làm trống sau khi thanh toán)

// --- Một hệ thống khác, hoàn toàn độc lập ---
const store2 = createOrderSystem();
store2.addToCart("Tất", 30000, 2); // 1
console.log(store2.checkout(3));
// { subtotal: 60000, shippingFee: 15000, finalTotal: 75000 }

// --- Đơn hàng lớn, được miễn phí ship dù khoảng cách xa ---
const store3 = createOrderSystem();
store3.addToCart("Áo khoác", 600000, 1); // 1
console.log(store3.checkout(30));
// { subtotal: 600000, shippingFee: 0, finalTotal: 600000 }

// store gốc và store2, store3 không hề ảnh hưởng lẫn nhau
console.log(store.getCartSize()); // 0
console.log(store2.getCartSize()); // 0
console.log(store3.getCartSize()); // 0

// Khách mua nhiều sản phẩm
const store4 = createOrderSystem();
store4.addToCart("Iphone 17", 25990000, 1);
store4.addToCart(1, 2, 4); // Invalid Input
store4.addToCart(); // Invalid Input
store4.addToCart("Áo khoác Nike", 2000000, 2);
store4.addToCart("Nho Mỹ size L", 70000, 1);
store4.addToCart("Nước thơm Downy hương Huyền bí", 42500, 5);

console.log(store4.getCartSize()); // 4

console.log(store4.checkout()); // Invalid distance or your cart is empty!
console.log(store4.checkout(0));
// { subTotal: 30272500, shippingFee: 0, finalTotal: 30272500 }

// Kiểm tra tính bao đóng
console.log(store.cart); // undefined
console.log(store2.cart); // undefined
console.log(store3.cart); // undefined
console.log(store4.cart); // undefined