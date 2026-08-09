const productWrapper = document.querySelector(".product-wrapper");

const mainImage = document.querySelector("#mainImage");

const thumbnailList = document.querySelector("#thumbnailList");

const productTitle = document.querySelector("#productTitle");

const productCategory = document.querySelector("#productCategory");

const productCategoryInfo = document.querySelector("#productCategoryInfo");

const reviewCount = document.querySelector("#reviewCount");

const salePrice = document.querySelector("#salePrice");

const originalPrice = document.querySelector("#originalPrice");

const discount = document.querySelector("#discount");

const shortDescription = document.querySelector("#shortDescription");

const stockStatus = document.querySelector("#stockStatus");

const productBrand = document.querySelector("#productBrand");

const productSku = document.querySelector("#productSku");

const description = document.querySelector("#description");

const tagsList = document.querySelector("#tagsList");

const weight = document.querySelector("#weight");

const width = document.querySelector("#width");

const height = document.querySelector("#height");

const depth = document.querySelector("#depth");

const reviewsList = document.querySelector("#reviewsList");

const loader = document.querySelector(".product-loading");

const productNotFound = document.querySelector(".product-not-found");

// * Helpers
const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
};

const formatCategory = (category) => {
    return category
        .replaceAll("-", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const createStars = (rating) => {
    return "★".repeat(Math.round(rating));
};

// * render image list
const renderProductImages = (product) => {
    mainImage.src = product.images[0];

    mainImage.title = product.title;

    thumbnailList.innerHTML = product.images
        .map((image, index) => {
            return `<button
                    type="button"
                    class="thumbnail ${index === 0 ? "active" : ""}"
                    data-image="${image}"
                >
                    <img
                        src="${image}"
                        alt="${product.title} ${index + 1}"
                        loading="lazy"
                    >
                </button>`;
        })
        .join("");
};

// * Render
const renderProductInfo = (product) => {
    const sale_price = product.price * (1 - product.discountPercentage / 100);

    productTitle.textContent = product.title;

    productCategory.textContent = formatCategory(product.category);

    productCategoryInfo.textContent = formatCategory(product.category);

    reviewCount.textContent = `${product.reviews.length} reviews`;

    salePrice.textContent = formatPrice(sale_price);

    originalPrice.textContent = formatPrice(product.price);

    discount.textContent = `-${product.discountPercentage}%`;

    shortDescription.textContent = product.description;

    description.textContent = product.description;

    productBrand.textContent = product.brand;

    productSku.textContent = product.sku;

    if (product.stock > 0) {
        stockStatus.textContent = `${product.stock} in stock`;
    } else {
        stockStatus.textContent = `Out of stock`;
        stockStatus.style.color = "var(--color-danger)";
    }

    weight.textContent = `${product.weight} kg`;

    width.textContent = `${product.dimensions.width} cm`;
    height.textContent = `${product.dimensions.height} cm`;
    depth.textContent = `${product.dimensions.depth} cm`;

    // * Render tags
    tagsList.innerHTML = product.tags
        .map(
            (tag) => `
                <span class="tag">
                    #${tag}
                </span>
            `,
        )
        .join("");

    // * Render Reviews
    const date = new Date(product.reviews[0].date).toString().split(" ").slice(0, 5).join(" ");
    reviewsList.innerHTML = product.reviews
        .map((review) => {
            return `
                    <article class="review">
                        <div class="review-header">
                            <span class="review-user">
                                ${review.reviewerName}
                            </span>
                            <time class="review-date">
                                ${date}
                            </time>
                        </div>

                        <div class="review-rating">
                            ${createStars(review.rating)}
                        </div>

                        <p class="review-comment">
                            ${review.comment}
                        </p>
                    </article>
                `;
        })
        .join("");
};

// * Get product details
const params = new URLSearchParams(location.search);

const fetchProductDetails = async () => {
    try {
        productWrapper.hidden = true;

        const result = await fetch(
            `https://dummyjson.com/products/${params.get("id")}`,
        );
        const data = await result.json();
        renderProductImages(data);
        renderProductInfo(data);
    } catch (error) {
        console.log(error.message);
    } finally {
        loader.hidden = true;
        productWrapper.hidden = false;
    }
};

if(params.get("id")) {
    fetchProductDetails();
} else {
    loader.hidden = true
    productNotFound.hidden = false;
    productWrapper.hidden = true;
}


// * Thumbnails click
thumbnailList.addEventListener("click", (e) => {
    const thumbnail = event.target.closest(".thumbnail");

    if (!thumbnail) return;

    const image = thumbnail.dataset.image;

    mainImage.src = image;

    const activedThumbnail = document.querySelector(".thumbnail.active");
    if (activedThumbnail) {
        activedThumbnail.classList.remove("active");
    }

    thumbnail.classList.add("active");
});
