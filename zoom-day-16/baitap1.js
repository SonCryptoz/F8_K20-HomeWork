
const products = [
    { id: 1, name: "MacBook Pro", price: 2000, category: "Laptop" },
    { id: 2, name: "iPhone 15", price: 1000, category: "Phone" },
    { id: 3, name: "Bàn phím cơ", price: 150, category: "Accessories" },
    { id: 4, name: "Màn hình Dell", price: 500, category: "Monitor" },
];

const orders = [
    { orderId: "ORD01", productId: 2, quantity: 2, status: "completed" },
    { orderId: "ORD02", productId: 1, quantity: 1, status: "pending" },
    { orderId: "ORD03", productId: 4, quantity: 3, status: "completed" },
    { orderId: "ORD04", productId: 3, quantity: 1, status: "canceled" },
    { orderId: "ORD05", productId: 2, quantity: 1, status: "completed" },
];

// * Main logic
const completedOrderDetails = orders
    .filter((item) => item.status === "completed")
    .map((itemInOrders) => {
        const product = products.find((itemInProducts) => {
            return itemInOrders.productId === itemInProducts.id;
        });

        return {
            idDonHang: itemInOrders.orderId,
            tenSanPham: product.name,
            tongTien: product.price * itemInOrders.quantity,
        };
    });

// Kiểm tra độ dài — chỉ có 3 đơn completed
console.log(completedOrderDetails.length);
// 3

// Kiểm tra toàn bộ kết quả
console.log(completedOrderDetails);
// [
//   { idDonHang: "ORD01", tenSanPham: "iPhone 15",    tongTien: 2000 },
//   { idDonHang: "ORD03", tenSanPham: "Màn hình Dell", tongTien: 1500 },
//   { idDonHang: "ORD05", tenSanPham: "iPhone 15",    tongTien: 1000 },
// ]

// Kiểm tra từng đơn
console.log(completedOrderDetails[0].idDonHang); // "ORD01"
console.log(completedOrderDetails[0].tenSanPham); // "iPhone 15"
console.log(completedOrderDetails[0].tongTien); // 2000  (1000 * 2)

console.log(completedOrderDetails[1].idDonHang); // "ORD03"
console.log(completedOrderDetails[1].tenSanPham); // "Màn hình Dell"
console.log(completedOrderDetails[1].tongTien); // 1500  (500 * 3)

console.log(completedOrderDetails[2].idDonHang); // "ORD05"
console.log(completedOrderDetails[2].tenSanPham); // "iPhone 15"
console.log(completedOrderDetails[2].tongTien); // 1000  (1000 * 1)

// Đơn bị loại — không xuất hiện trong kết quả
console.log(completedOrderDetails.find((o) => o.idDonHang === "ORD02")); // undefined (pending)
console.log(completedOrderDetails.find((o) => o.idDonHang === "ORD04")); // undefined (canceled)
