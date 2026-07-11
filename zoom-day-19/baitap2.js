const customers = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", email: "alice@example.com" },
    { id: 4, name: "Bob Brown", email: "bob@example.com" },
    { id: 5, name: "Charlie Green", email: "charlie@example.com" },
];

const products = [
    { id: 101, name: "Laptop", price: 1200 },
    { id: 102, name: "Phone", price: 800 },
    { id: 103, name: "Tablet", price: 500 },
    { id: 104, name: "Smartwatch", price: 300 },
    { id: 105, name: "Headphones", price: 150 },
];

const orders = [
    {
        id: 1001,
        customerId: 1,
        items: [
            {
                productId: 101,
                quantity: 1,
            },
            {
                productId: 102,
                quantity: 2,
            },
        ],
    },
    {
        id: 1002,
        customerId: 2,
        items: [
            { productId: 102, quantity: 1 },
            { productId: 103, quantity: 3 },
        ],
    },
    {
        id: 1003,
        customerId: 3,
        items: [
            { productId: 104, quantity: 5 },
            { productId: 105, quantity: 2 },
        ],
    },
    {
        id: 1004,
        customerId: 4,
        items: [
            { productId: 101, quantity: 1 },
            { productId: 103, quantity: 2 },
        ],
    },
    {
        id: 1005,
        customerId: 5,
        items: [{ productId: 105, quantity: 10 }],
    },
    {
        id: 1006,
        customerId: 1,
        items: [
            { productId: 101, quantity: 1 },
            { productId: 105, quantity: 3 },
        ],
    },
    {
        id: 1007,
        customerId: 2,
        items: [
            { productId: 104, quantity: 2 },
            { productId: 103, quantity: 1 },
        ],
    },
    {
        id: 1008,
        customerId: 3,
        items: [{ productId: 102, quantity: 2 }],
    },
    {
        id: 1009,
        customerId: 4,
        items: [
            { productId: 101, quantity: 1 },
            { productId: 102, quantity: 1 },
        ],
    },
    {
        id: 1010,
        customerId: 5,
        items: [
            { productId: 103, quantity: 4 },
            { productId: 104, quantity: 3 },
        ],
    },
];

function getCustomerStatistics(customers, products, orders) {
    // tạo ra object product chứa các key là id đơn hàng
    const productMap = products.reduce((obj, { id, name, price }) => {
        obj[id] = {
            id,
            name,
            price,
        };

        return obj;
    }, {});

    // tạo đơn hàng của khách hàng bằng cách ánh xạ qua mảng khách hàng
    return customers
        .map((customer) => {
            // lấy orders của customer
            const ordersCustomer = orders.filter(
                (order) => order.customerId === customer.id,
            );

            // object tạm thời lưu products
            const productStats = {};

            // biến cộng dồn tổng tiền
            let totalSpent = 0;

            // duyệt ordersCustomer
            ordersCustomer.forEach((order) => {
                // duyệt items
                order.items.forEach((item) => {
                    // lấy product theo key của productMap
                    const product = productMap[item.productId];

                    // tính tổng tiền theo item
                    const itemTotal = product.price * item.quantity;

                    // Cộng dồn tổng tiền
                    totalSpent += itemTotal;

                    // kiểm tra nếu productStats chưa tồn tại id thì thêm mới, ngược lại cập nhật số lượng item và tổng tiền
                    if (!productStats[product.id]) {
                        productStats[product.id] = {
                            name: product.name,
                            quantity: item.quantity,
                            totalSpent: itemTotal,
                        };
                    } else {
                        productStats[product.id].quantity += item.quantity;
                        productStats[product.id].totalSpent += itemTotal;
                    }
                });
            });

            return {
                id: customer.id,
                name: customer.name,
                totalSpent,
                products: Object.values(productStats).sort( // lấy các values productStats để khớp với đầu ra
                    (a, b) => b.totalSpent - a.totalSpent, // totalSpent giảm dần.
                ),
            };
        })
        .sort((a, b) => b.totalSpent - a.totalSpent); // totalSpent giảm dần.
}

console.log(getCustomerStatistics(customers, products, orders));

// TODO: Test Case 1 - Customer mua nhiều lần cùng một sản phẩm => OK
// * Input
// [
//   { productId: 101, quantity: 2 },
//   { productId: 101, quantity: 3 },
// ]
// * Output
// [
//   {
//     name: "Laptop",
//     quantity: 5,
//     totalSpent: 6000,
//   },
// ]

// TODO: Test Case 2 - Customer không có đơn hàng => OK
// * Input
// const customers = [
//   {
//     id: 10,
//     name: "David",
//   },
// ];
// * Output
// [
//   {
//     id: 10,
//     name: "David",
//     totalSpent: 0,
//     products: [],
//   },
// ]

// TODO: Test Case 3 - Một đơn hàng có nhiều sản phẩm => OK
//  * Input
// items = [
//   {
    //     productId: 101,
//     quantity: 1,
//   },
//   {
    //     productId: 102,
//     quantity: 2,
//   },
// ];
// * Output
// Laptop: 1200
// Phone: 1600
// Customer Total: 2800

// TODO: Test Case 4 - Nhiều đơn hàng cùng sản phẩm => OK
// * Input
// Order 1
// Laptop x1

// Order 2
// Laptop x2

// Order 3
// Laptop x5
// * Output
// {
//   name: "Laptop",
//   quantity: 8,
//   totalSpent: 9600,
// }

// TODO: Test Case 5 - Kiểm tra sắp xếp Customer => OK
// * Input
// An    : 3500
// Bình  : 5200
// Chi   : 4100
// * Output
// Bình
// Chi
// An

// TODO: Test Case 6 - Kiểm tra sắp xếp Products => OK
// * Input
// Laptop      3600
// Phone        800
// Tablet      2000
// Headphones   450
// * Output
// Laptop
// Tablet
// Phone
// Headphones

// TODO: Test Case 7 - Customer chỉ mua một sản phẩm => OK
// * Output
// {
//   id: 5,
//   name: "Charlie",
//   totalSpent: 1500,
//   products: [
    //     {
//       name: "Headphones",
//       quantity: 10,
//       totalSpent: 1500,
//     },
//   ],
// }

// TODO: Test Case 8 - Không có dữ liệu => OK
// * Input
// customers = [];
// products = [];
// orders = [];
// * Output
// []