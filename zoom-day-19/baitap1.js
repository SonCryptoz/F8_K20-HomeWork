function Order(orderId, customerName, items, status = "pending") {
    this.orderId = orderId;
    this.customerName = customerName;
    this.items = items;
    this.status = status;
}

// tính tổng tiền đơn hàng (price * quantity của tất cả items)
Order.prototype.getTotalAmount = function () {
    return this.items.reduce((total, { price, quantity }) => {
        return total + price * quantity;
    }, 0);
};

// tổng số lượng sản phẩm trong đơn
Order.prototype.getItemCount = function () {
    return this.items.reduce((total, { quantity }) => {
        return total + quantity;
    }, 0);
};

// cập nhật status, trả về chuỗi thông báo
Order.prototype.updateStatus = function (newStatus) {
    if (typeof newStatus !== "string" || newStatus.trim() === "") {
        return "Invalid status!";
    }

    this.status = newStatus;

    return `Đơn hàng ${this.orderId} đã chuyển sang: ${this.status}`;
};

// thêm sản phẩm vào items, trả về tổng tiền mới
Order.prototype.addItem = function (item) {
    if (typeof item !== "object" || item === null || Array.isArray(item))
        return "Invalid products";

    this.items.push(item);

    return this.getTotalAmount();
};

// trả về object tóm tắt đơn hàng gồm orderId, customerName, totalAmount, itemCount, status
Order.prototype.getSummary = function () {
    return {
        orderId: this.orderId,
        customerName: this.customerName,
        totalAmount: this.getTotalAmount(),
        itemCount: this.getItemCount(),
        status: this.status,
    };
};

const order1 = new Order("ORD01", "Nguyễn An", [
    { name: "Áo thun", price: 150000, quantity: 2 },
    { name: "Quần jean", price: 350000, quantity: 1 },
]);

const order2 = new Order("ORD02", "Trần Bình", [
    { name: "iPhone 15", price: 25000000, quantity: 1 },
]);

console.log(order1.getTotalAmount()); // 650000
console.log(order2.getTotalAmount()); // 25000000

console.log(order1.getItemCount()); // 3
console.log(order2.getItemCount()); // 1

console.log(order1.updateStatus("completed"));
// "Đơn hàng ORD01 đã chuyển sang: completed"
console.log(order2.updateStatus("completed"));
// "Đơn hàng ORD02 đã chuyển sang: completed"

console.log(order1.addItem({ name: "Mũ", price: 120000, quantity: 2 }));
// 890000  (tổng tiền mới sau khi thêm)
console.log(
    order2.addItem({
        name: "Samsung Galaxy S26 Ultra",
        price: 31000000,
        quantity: 1,
    }),
);
// 56000000

console.log(order1.getSummary());
// * Nếu không updateStatus hoặc addItem
// {
//   orderId: "ORD01",
//   customerName: "Nguyễn An",
//   totalAmount: 650000,
//   itemCount: 3,
//   status: "pending"
// }
console.log(order2.getSummary());
// * Nếu không updateStatus hoặc addItem
// {
//   orderId: 'ORD02',
//   customerName: 'Trần Bình',
//   totalAmount: 25000000,
//   itemCount: 1,
//   status: 'pending'
// }

// * Nếu không updateStatus hoặc addItem
console.log(order2.getTotalAmount()); // 25000000
console.log(order2.status); // "pending"

// Kiểm tra instanceof
console.log(order1 instanceof Order); // true
console.log(order2 instanceof Order); // true

console.log(order1.test);