const products = [
    {
        id: 1,
        name: "Tai nghe Bluetooth",
        category: "do-dien-tu",
        price: 350000,
        inStock: true,
    },
    {
        id: 2,
        name: "Áo thun cotton",
        category: "quan-ao",
        price: 150000,
        inStock: true,
    },
    {
        id: 3,
        name: "Sách Lập trình JS căn bản",
        category: "sach",
        price: 120000,
        inStock: false,
    },
    {
        id: 4,
        name: "Bàn phím cơ",
        category: "do-dien-tu",
        price: 890000,
        inStock: true,
    },
    {
        id: 5,
        name: "Quần jean nam",
        category: "quan-ao",
        price: 420000,
        inStock: false,
    },
    {
        id: 6,
        name: "Sách Tư duy nhanh và chậm",
        category: "sach",
        price: 95000,
        inStock: true,
    },
];

const $ = document.querySelector.bind(document);

const category = $("#category-filter");
const searchBox = $("#search-box");
const productList = $("#product-list");
const resultCount = $("#result-count");
const sortBtn = $("#sort-price-btn");

// TODO: 1. Render danh sách sản phẩm
// Khi trang vừa tải:

// Render toàn bộ 6 sản phẩm vào #product-list.

// Mỗi sản phẩm hiển thị đầy đủ:

// Tên sản phẩm

// Danh mục

// Giá

// Tình trạng còn hàng / hết hàng

// Giá tiền phải được định dạng có dấu chấm ngăn cách hàng nghìn, ví dụ:

// 350.000đ
// Những sản phẩm hết hàng phải có dấu hiệu phân biệt rõ ràng (ví dụ: làm mờ bằng CSS).
const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};

const categoryMap = {
    "do-dien-tu": "Đồ điện tử",
    "quan-ao": "Quần áo",
    sach: "Sách",
};

let isIncreasePrice = null;

const render = (searchValue = "", categoryValue = "", sortPrice = null) => {
    const result = products.filter((product) => {
        return (
            product.name.toLowerCase().includes(searchValue) &&
            (product.category === categoryValue ||
                categoryValue === "all" ||
                categoryValue === "")
        );
    });

    const html = result
        .sort((a, b) => {
            if (sortPrice === null) return 0;

            return sortPrice ? a.price - b.price : b.price - a.price;
        })
        .map((product) => {
            return `<div class="product-card" data-id="${product.id}">
                        <div class="title">${product.name}</div>
                        <div class="meta">
                            <div class="category">${categoryMap[product.category]}</div>
                            <div class="price">${formatVND(product.price)}</div>
                        </div>
                        <div class="stock ${product.inStock ? "in-stock" : "out-of-stock"}">${product.inStock ? "Còn hàng" : "Hết hàng"}</div>
                    </div>`;
        })
        .join("");

    const items = result.length;

    if (!html) {
        productList.innerHTML = "<p>Không tìm thấy sản phẩm nào phù hợp.</p>";
    } else {
        productList.innerHTML = html;
    }

    resultCount.innerHTML = `Tìm thấy <span>${items}</span> sản phẩm`;
};

render();

// TODO: 2. Tìm kiếm
// Khi người dùng nhập vào ô #search-box:

// Danh sách tự động lọc theo tên sản phẩm.

// Không phân biệt chữ hoa và chữ thường.

// Không cần bấm nút để tìm.
searchBox.addEventListener("input", (e) => {
    render(
        e.target.value.trim().toLowerCase(),
        category.value,
        isIncreasePrice,
    );
});

// TODO: 3. Lọc theo danh mục
// Khi chọn một danh mục trong #category-filter:

// Chỉ hiển thị các sản phẩm thuộc danh mục đó.
// Bộ lọc danh mục phải hoạt động đồng thời với ô tìm kiếm.

// Ví dụ:

// Chọn Đồ điện tử

// Đồng thời gõ bàn

// → Chỉ còn hiển thị sản phẩm Bàn phím cơ.
category.addEventListener("change", (e) => {
    render(
        searchBox.value.trim().toLowerCase(),
        e.target.value,
        isIncreasePrice,
    );
});

// TODO: 4. Sắp xếp theo giá
// Khi bấm nút Sắp xếp theo giá:

// Danh sách đang hiển thị (sau khi đã lọc) được sắp xếp theo giá.

// Lần bấm đầu:

// Giá tăng dần.
// Lần bấm tiếp theo:

// Giá giảm dần.
// Các lần sau tiếp tục luân phiên:

// Tăng → Giảm → Tăng → ...
// Đồng thời, nội dung nút cũng phải thay đổi để phản ánh trạng thái hiện tại
sortBtn.addEventListener("click", () => {
    if (isIncreasePrice === null) {
        isIncreasePrice = true;
    } else {
        isIncreasePrice = !isIncreasePrice;
    }
    render(
        searchBox.value.trim().toLowerCase(),
        category.value,
        isIncreasePrice,
    );
    sortBtn.textContent = isIncreasePrice
        ? "Giá: Thấp → Cao"
        : "Giá: Cao → Thấp";
});

// TODO: 5. Hiển thị số lượng kết quả => OK
// #result-count luôn hiển thị số lượng sản phẩm đang được hiển thị.

// Ví dụ:
// Tìm thấy 3 sản phẩm

// Nếu không có kết quả:
// #result-count hiển thị:

// Tìm thấy 0 sản phẩm
// Trong #product-list hiển thị thông báo:
// Không tìm thấy sản phẩm nào phù hợp.

// TODO: 6. Cách xử lý dữ liệu => OK
// Toàn bộ thao tác:

// Tìm kiếm

// Lọc

// Sắp xếp

// đều phải thực hiện trên mảng products gốc.

// Mỗi khi có thay đổi (gõ tìm kiếm, đổi danh mục hoặc bấm sắp xếp):

// Tính toán lại danh sách kết quả từ mảng products.

// Xóa nội dung cũ của #product-list.

// Render lại toàn bộ danh sách mới.

// Không xử lý bằng cách thêm/xóa từng phần tử DOM riêng lẻ.

// TODO: Test case
// * Mới load trang. => OK

// Hiển thị đủ 6 sản phẩm.

// #result-count hiển thị:

// Tìm thấy 6 sản phẩm
// Hai sản phẩm hết hàng (id 3 và 5) được đánh dấu rõ ràng.

// * Nhập vào ô tìm kiếm => OK
// sách
// → Chỉ còn hiển thị:

// id 3

// id 6

// #result-count:

// Tìm thấy 2 sản phẩm

// * 3. Xóa toàn bộ nội dung ô tìm kiếm. => OK

// → Hiển thị lại đầy đủ 6 sản phẩm.

// * 4. Chọn danh mục => OK

// Đồ điện tử
// → Chỉ còn:

// id 1

// id 4

// * 5. Đang chọn => OK

// Đồ điện tử
// Tiếp tục nhập:

// bàn
// → Chỉ còn đúng sản phẩm:

// Bàn phím cơ

// * 6. Nhập vào ô tìm kiếm => OK

// xe máy
// → #product-list hiển thị:

// Không tìm thấy sản phẩm nào phù hợp.
// #result-count:

// Tìm thấy 0 sản phẩm

// * 7. Xóa ô tìm kiếm. => OK

// Chọn lại:

// Tất cả danh mục
// Bấm nút sắp xếp lần đầu.
// Kết quả:

// Danh sách được sắp theo giá từ thấp đến cao:
// 95.000đ
// 120.000đ
// 150.000đ
// 350.000đ
// 420.000đ
// 890.000đ
// Nội dung nút đổi thành:
// Giá: Thấp → Cao

// * 8. Bấm nút sắp xếp lần thứ hai. => OK

// Kết quả:

// Danh sách đảo ngược từ giá cao xuống thấp.

// Nội dung nút đổi thành:

// Giá: Cao → Thấp

// * 9. Chọn danh mục => OK
// Quần áo
// Sau đó bấm sắp xếp theo giá.
// Kết quả:

// Chỉ có hai sản phẩm:

// id 2

// id 5

// Hai sản phẩm này được sắp xếp với nhau.

// Không xuất hiện sản phẩm thuộc danh mục khác.

// * 10. Giá tiền hiển thị đúng định dạng có dấu chấm phân tách hàng nghìn. => OK

// Ví dụ:

// 350000
// phải được hiển thị thành:

// 350.000đ
// không phải:
// 350000đ
