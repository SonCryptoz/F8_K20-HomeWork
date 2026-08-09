const productGrid = document.querySelector("#productGrid");
const pagination = document.querySelector("#pagination");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const sortSelect = document.querySelector("#sortSelect");
const emptyState = document.querySelector("#emptyState");
const emptySearch = document.querySelector("#emptySearch");

const loader = document.querySelector(".products-loading");

let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
const limitPage = 12;

// * Helpers
const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
};

const formatCategory = (category) => {
    return category
        .replaceAll("-", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// * Category
const renderCategory = (products) => {
    const categories = products
        .filter((product, index) => {
            return (
                products.findIndex((p) => p.category === product.category) ===
                index
            );
        })
        .reduce((array, product) => {
            array.push(product.category);

            return array;
        }, []);

    categoryFilter.innerHTML = `
        <option value="all">
            All
        </option>

        ${categories
            .map(
                (category) => `
                <option value="${category}">
                    ${formatCategory(category)}
                </option>
            `,
            )
            .join("")}
    `;
};

// * Product Card
const createProductCard = (product) => {
    const stockClass = product.stock > 0 ? "in-stock" : "out-of-stock";

    const stockText =
        product.stock > 0 ? `${product.stock} in stock` : "Out of stock";

    const salePrice = product.price * (1 - product.discountPercentage / 100);

    return `
        <article class="product-card">

            <div class="product-image-wrapper">

                <img
                    class="product-image"
                    src="${product.thumbnail}"
                    alt="${product.title}"
                    loading="lazy"
                >

                <span class="discount-badge">
                    -${product.discountPercentage}%
                </span>

            </div>


            <div class="product-content">

                <h2 class="product-title">
                    ${product.title}
                </h2>


                <div class="product-rating">

                    <span
                        class="rating-star"
                        aria-hidden="true"
                    >
                        ★
                    </span>

                    <span class="rating-value">
                        ${product.rating}
                    </span>

                </div>


                <div class="product-price">

                    <span class="sale-price">
                        ${formatPrice(salePrice)}
                    </span>

                    <span class="original-price">
                        ${formatPrice(product.price)}
                    </span>

                </div>


                <div class="product-meta">

                    <span>
                        ${formatCategory(product.category)}
                    </span>

                    <span class="stock ${stockClass}">
                        ${stockText}
                    </span>

                </div>


                <a
                    class="product-link"
                    href="./pages/ProductDetails/?id=${product.id}"
                >
                    View Details
                </a>

            </div>

        </article>
    `;
};

const renderPagination = (totalPages) => {
    if (totalPages <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let res = "";

    const prev = ` <button
                        type="button"
                        class="pagination-button"
                        data-page="${currentPage - 1}"
                        ${currentPage === 1 ? "disabled" : ""}
                    >
                        Prev
                    </button>
                    `;
    res += prev;

    for (let page = 1; page <= totalPages; page++) {
        res += `
            <button
                type="button"
                class="pagination-button ${
                    page === currentPage ? "active" : ""
                }"
                data-page="${page}"
            >
                ${page}
            </button>
        `;
    }

    const next = ` <button
                        type="button"
                        class="pagination-button"
                        data-page="${currentPage + 1}"
                        ${currentPage === totalPages ? "disabled" : ""}
                    >
                        Next
                    </button>
                    `;
    res += next;

    pagination.innerHTML = res;
};

// * Sort Params
const getSortParams = (sort) => {
    switch (sort) {
        case "title-asc":
            return {
                sortBy: "title",
                order: "asc",
            };

        case "title-desc":
            return {
                sortBy: "title",
                order: "desc",
            };

        case "price-asc":
            return {
                sortBy: "price",
                order: "asc",
            };

        case "price-desc":
            return {
                sortBy: "price",
                order: "desc",
            };

        default:
            return null;
    }
};

// * Render
const renderProducts = (products) => {
    if (!products.length) {
        productGrid.innerHTML = "";
        emptySearch.classList.remove("hidden");
        pagination.innerHTML = "";

        return;
    }
    const result = products
        .map((product) => {
            return createProductCard(product);
        })
        .join("");

    emptySearch.classList.add("hidden");
    emptyState.classList.add("hidden");
    productGrid.innerHTML = result;
};

// * Get Products - Pagination
const fetchProducts = async (
    value = "",
    page = 1,
    category = "all",
    sort = "default",
) => {
    try {
        loader.style.display = "flex";

        const skip = (page - 1) * limitPage;
        const sortParams = getSortParams(sort);

        let result = null;

        const filteredSortParams = sortParams
            ? `&sortBy=${sortParams.sortBy}&order=${sortParams.order}`
            : "";

        if (value) {
            result = await fetch(
                `https://dummyjson.com/products/search?q=${encodeURIComponent(
                    value,
                )}&limit=${limitPage}&skip=${skip}${filteredSortParams}`,
            );
        } else if (category !== "all" && sort === "default") {
            result = await fetch(
                `https://dummyjson.com/products/category/${category}?limit=${limitPage}&skip=${skip}`,
            );
            
        // API của DummyJSON không hỗ trợ kết hợp filter và sort 
        } else if (sort !== "default") {
            result = await fetch(
                `https://dummyjson.com/products?limit=${limitPage}&skip=${skip}${filteredSortParams}`,
            );
        } else {
            result = await fetch(
                `https://dummyjson.com/products?limit=${limitPage}&skip=${skip}`,
            );
        }

        const data = await result.json();

        renderProducts(data.products);

        const totalPages = Math.ceil(data.total / limitPage);

        renderPagination(totalPages);
    } catch (error) {
        productGrid.innerHTML = "";
        emptyState.classList.remove("hidden");
        pagination.innerHTML = "";
        console.log(error.message);
    } finally {
        loader.style.display = "none";
    }
};

fetchProducts();

// * fetch categories
const fetchCategories = async () => {
    try {
        const result = await fetch(`https://dummyjson.com/products?limit=0`);
        const data = await result.json();
        renderCategory(data.products);
    } catch (error) {
        console.log(error.message);
    }
};

fetchCategories();

// * Search
let timerId = null;
searchInput.addEventListener("input", (e) => {
    clearTimeout(timerId);

    timerId = setTimeout(() => {
        fetchProducts(e.target.value.trim());
    }, 600);
});

// * Paginating
pagination.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");

    if (!btn || btn.disabled) {
        return;
    }

    currentPage = Number(btn.dataset.page);

    fetchProducts(searchInput.value.trim(), currentPage, currentCategory);
});

// * Filter Category
categoryFilter.addEventListener("change", (e) => {
    currentCategory = e.target.value;
    currentPage = 1;
    fetchProducts(searchInput.value.trim(), currentPage, currentCategory);
});

// * Sort
sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    fetchProducts(
        searchInput.value.trim(),
        currentPage,
        currentCategory,
        currentSort,
    );
});
