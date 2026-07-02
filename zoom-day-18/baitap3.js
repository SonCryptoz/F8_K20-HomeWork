const orders = [
    {
        id: 1,
        customer: "An",
        product: "Áo thun",
        category: "fashion",
        amount: 300000,
        status: "completed",
    },
    {
        id: 2,
        customer: "Bình",
        product: "iPhone 15",
        category: "electronics",
        amount: 25000000,
        status: "completed",
    },
    {
        id: 3,
        customer: "An",
        product: "Quần jean",
        category: "fashion",
        amount: 450000,
        status: "canceled",
    },
    {
        id: 4,
        customer: "Chi",
        product: "Tai nghe",
        category: "electronics",
        amount: 1200000,
        status: "completed",
    },
    {
        id: 5,
        customer: "Bình",
        product: "Giày",
        category: "fashion",
        amount: 900000,
        status: "pending",
    },
    {
        id: 6,
        customer: "An",
        product: "Sạc dự phòng",
        category: "electronics",
        amount: 350000,
        status: "completed",
    },
    {
        id: 7,
        customer: "Duy",
        product: "Áo khoác",
        category: "fashion",
        amount: 600000,
        status: "completed",
    },
];

// * Hàm 1: getRevenueByCategory(orders)
// Tính tổng doanh thu theo từng category, chỉ tính đơn hàng có status === "completed".

const getRevenueByCategory = (orders) => {
    return orders.reduce((object, { category, amount, status }) => {
        if (status === "completed") {
            object[category] = (object[category] || 0) + amount;
        }

        return object;
    }, {});
};

console.log(getRevenueByCategory(orders));
// {
//   fashion: 900000,       // 300000 + 600000 (đơn canceled bị loại)
//   electronics: 26550000, // 25000000 + 1200000 + 350000
// }

// * Hàm 2: getSpendingByCustomer(orders)
// Tính tổng chi tiêu của mỗi khách hàng, chỉ tính đơn completed.

const getSpendingByCustomer = (orders) => {
    return orders.reduce((object, { customer, amount, status }) => {
        if (status === "completed") {
            object[customer] = (object[customer] || 0) + amount;
        }

        return object;
    }, {});
};

console.log(getSpendingByCustomer(orders));
// {
//   An: 650000,      // 300000 + 350000
//   Bình: 25000000,
//   Chi: 1200000,
//   Duy: 600000,
// }

// * Hàm 3: getOrderCountByStatus(orders)
// Đếm số lượng đơn hàng theo từng status (không lọc gì cả, đếm tất cả).

const getOrderCountByStatus = (orders) => {
    return orders.reduce((object, { status }) => {
        object[status] = (object[status] || 0) + 1;

        return object;
    }, {});
};

console.log(getOrderCountByStatus(orders));
// { completed: 5, canceled: 1, pending: 1 }

// * Hàm 4: getTopCustomer(orders)
// Tìm khách hàng chi tiêu nhiều nhất trong các đơn completed. Không được gọi lại getSpendingByCustomer
// — phải tự viết reduce() riêng để vừa cộng dồn vừa theo dõi ai đang dẫn đầu trong cùng một lượt duyệt.

const getTopCustomer = (orders) => {
    const result = orders.reduce(
        (object, { customer, amount, status }) => {
            if (status === "completed") {
                object.spendingByCustomer[customer] =
                    (object.spendingByCustomer[customer] || 0) + amount;
                if (object.ouput.total < object.spendingByCustomer[customer]) {
                    object.ouput = {
                        customer,
                        total: object.spendingByCustomer[customer],
                    };
                }
            }
            return object;
        },
        {
            spendingByCustomer: {},
            ouput: {
                customer: null,
                total: 0,
            },
        },
    );

    return result.ouput;
};

console.log(getTopCustomer(orders));
// { customer: "Bình", total: 25000000 }

// * Hàm 5: getFullReport(orders)
// Dùng một lần reduce() duy nhất để tạo ra báo cáo tổng hợp gồm cả 3 thông tin của hàm 1, 2, 3 cùng lúc
// — nghĩa là trong một lượt duyệt mảng,
// accumulator phải đồng thời cập nhật cả revenueByCategory, spendingByCustomer, statusCount, và totalRevenue.

const getFullReport = (orders) => {
    return orders.reduce(
        (object, { customer, category, amount, status }) => {
            if(status === "completed") {
                object.revenueByCategory[category] = (object.revenueByCategory[category] || 0) + amount;
                object.spendingByCustomer[customer] = (object.spendingByCustomer[customer] || 0) + amount;
                object.totalRevenue += amount;
            }
            object.statusCount[status] = (object.statusCount[status] || 0) + 1;

            return object;
        },
        {
            revenueByCategory: {},
            spendingByCustomer: {},
            statusCount: {},
            totalRevenue: 0,
        },
    );
};

console.log(getFullReport(orders));
// {
//   revenueByCategory: { fashion: 900000, electronics: 26550000 },
//   spendingByCustomer: { An: 650000, Bình: 25000000, Chi: 1200000, Duy: 600000 },
//   statusCount: { completed: 5, canceled: 1, pending: 1 },
//   totalRevenue: 27450000
// }
