// * Hàm 1: createSlug(text)
// Chuyển tên sản phẩm thành slug URL theo các bước:

// Chuyển toàn bộ về chữ thường

// Thay khoảng trắng bằng dấu -

// Xóa các ký tự đặc biệt (chỉ giữ lại chữ, số và dấu -)

const createSlug = (text) => {
    return typeof text !== "string"
        ? "Invalid Input"
        : text
              .toLowerCase()
              .replaceAll(/[^a-zA-Z0-9\s+]/g, "")
              .replaceAll(" ", "-");
};

console.log(createSlug("MacBook Pro 2024")); // "macbook-pro-2024"
console.log(createSlug("Bàn Phím Cơ RGB")); // "bn-phm-c-rgb"  ← tiếng Việt mất dấu là bình thường
console.log(createSlug("iPhone 15 Pro Max!!!")); // "iphone-15-pro-max"

// * Hàm 2: generateOrderId(productName, quantity)
// Tạo mã đơn hàng theo định dạng:

// ORD-[3 ký tự đầu tên sản phẩm viết hoa]-[quantity]-[độ dài tên sản phẩm]

const generateOrderId = (productName, quantity) => {
    return typeof productName !== "string" ||
        !Number.isInteger(quantity) ||
        quantity < 0
        ? "Invalid Input"
        : `ORD-${productName.slice(0, 3).toUpperCase()}-${quantity}-${productName.length}`;
};

console.log(generateOrderId("MacBook Pro", 2)); // "ORD-MAC-2-11"
console.log(generateOrderId("iPhone 15", 5)); // "ORD-IPH-5-9"
console.log(generateOrderId("Bàn phím cơ", 1)); // "ORD-BÀN-1-11"

// * Hàm 3: formatPrice(price, currency)
// Định dạng giá tiền thành chuỗi hiển thị:

// Nếu currency = "VND" → "2.000.000 ₫"

// Nếu currency = "USD" → "$2,000.00"

// Nếu không truyền currency → mặc định "VND"

const formatPrice = (price, currency = "VND") => {
    if (!Number.isInteger(price) || price < 0) return "Invalid Input";

    const strPrice = price.toString();
    let str = "";

    const formatCurrency = (strPrice, str, separate = ".") => {
        let count = 0;
        for (let i = strPrice.length - 1; i >= 0; i--) {
            count++;
            str = strPrice[i] + str;
            if (count % 3 === 0 && i !== 0) {
                str = separate + str;
            }
        }

        return str;
    };

    if (currency === "VND") {
        return `${formatCurrency(strPrice, str, ".")} ₫`;
    } else if (currency === "USD") {
        return `$${formatCurrency(strPrice, str, ",")}.00`;
    }

    // return new Intl.NumberFormat(currency === "VND" ? "vi-VN" : "en-US", {
    //     style: "currency",
    //     currency,
    // }).format(price);
};

console.log(formatPrice(2000000, "VND")); // "2.000.000 ₫"
console.log(formatPrice(2000, "USD")); // "$2,000.00"
console.log(formatPrice(500000)); // "500.000 ₫"  (mặc định VND)

// * Hàm 4: buildProductUrl(baseUrl, product)
// Tạo URL đầy đủ cho trang sản phẩm dùng template literal.

const buildProductUrl = (baseUrl, product) => {
    return typeof baseUrl !== "string" ||
        typeof product !== "object" ||
        product === null ||
        Array.isArray(product)
        ? "Invalid Input"
        : `${baseUrl}/${product.category.toLowerCase()}/${product.name.toLowerCase().replaceAll(/\s+/g, "-")}?id=${product.id}`;
};

const baseUrl = "https://shop.vn";
const product = { name: "MacBook Pro 2024", id: 101, category: "laptop" };

console.log(buildProductUrl(baseUrl, product));
// "https://shop.vn/laptop/macbook-pro-2024?id=101"

// * test cases
console.log(createSlug("MacBook Pro 2024")); // "macbook-pro-2024"
console.log(createSlug("iPhone 15 Pro Max!!!")); // "iphone-15-pro-max"
console.log(createSlug("Hello   World")); // "hello---world"

console.log(generateOrderId("MacBook Pro", 2)); // "ORD-MAC-2-11"
console.log(generateOrderId("iPhone 15", 5)); // "ORD-IPH-5-9"

console.log(formatPrice(2000000, "VND")); // "2.000.000 ₫"
console.log(formatPrice(1500, "USD")); // "$1,500.00"
console.log(formatPrice(300000)); // "300.000 ₫"

console.log(
    buildProductUrl("https://shop.vn", {
        name: "MacBook Pro 2024",
        id: 101,
        category: "laptop",
    }),
);
// "https://shop.vn/laptop/macbook-pro-2024?id=101"

console.log(
    buildProductUrl("https://shop.vn", {
        name: "iPhone 15",
        id: 55,
        category: "phone",
    }),
);
// "https://shop.vn/phone/iphone-15?id=55"
