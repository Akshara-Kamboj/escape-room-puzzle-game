
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 2499,
        originalPrice: 3499,
        discount: 29,
        description: "Comfortable wireless headphones with clear sound and deep bass.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics",
        rating: 4.5,
        inStock: true
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 1999,
        originalPrice: 2999,
        discount: 33,
        description: "A stylish smartwatch for fitness tracking and daily use.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Accessories",
        rating: 4.2,
        inStock: true
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 1799,
        originalPrice: 2499,
        discount: 28,
        description: "Lightweight running shoes designed for comfort and everyday workouts.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        category: "Footwear",
        rating: 4.4,
        inStock: true
    },
    {
        id: 4,
        name: "Travel Backpack",
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        description: "A spacious backpack suitable for college, office, and travel.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Bags",
        rating: 4.3,
        inStock: true
    },
    {
        id: 5,
        name: "Digital Camera",
        price: 15999,
        originalPrice: 18999,
        discount: 16,
        description: "Capture memorable moments with a compact digital camera.",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        category: "Electronics",
        rating: 4.6,
        inStock: true
    },
    {
        id: 6,
        name: "Sunglasses",
        price: 899,
        originalPrice: 1499,
        discount: 40,
        description: "Modern sunglasses with a stylish frame for everyday wear.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
        category: "Fashion",
        rating: 4.1,
        inStock: true
    },
    {
        id: 7,
        name: "Coffee Maker",
        price: 3499,
        originalPrice: 4499,
        discount: 22,
        description: "Prepare fresh coffee at home with this easy-to-use coffee maker.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
        category: "Home Appliances",
        rating: 4.4,
        inStock: false
    }
];

// Stores the selected products and their quantities.
let cart = [];

// Format prices in Indian Rupees.
function formatPrice(price) {
    return "₹" + price.toLocaleString("en-IN");
}

// Display all products dynamically.
function displayProducts() {
    const productList = document.getElementById("product-list");

    productList.innerHTML = products.map(product => `
        <div class="col-xl-4 col-lg-6 col-sm-6">
            <div class="card product-card">
                <img
                    src="${product.image}"
                    class="product-image"
                    alt="${product.name}"
                >

                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>

                    <p class="card-text">${product.description}</p>

                    <p class="mb-2">
                        <span class="badge bg-secondary">
                            ${product.category}
                        </span>
                        <span class="ms-2">⭐ ${product.rating}</span>
                    </p>

                    <div class="mb-2">
                        <span class="price">
                            ${formatPrice(product.price)}
                        </span>
                        <span class="original-price ms-2">
                            ${formatPrice(product.originalPrice)}
                        </span>
                    </div>

                    <span class="discount">
                        ${product.discount}% OFF
                    </span>

                    ${product.inStock
                        ? `<button
                               class="btn btn-primary w-100 mt-2"
                               onclick="addToCart(${product.id})">
                               Add to Cart
                           </button>`
                        : `<button
                               class="btn btn-secondary w-100 mt-2"
                               disabled>
                               Out of Stock
                           </button>`
                    }
                </div>
            </div>
        </div>
    `).join("");
}

// Add a product to the shopping cart.
function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    // Prevent adding products that are out of stock.
    if (!product || !product.inStock) {
        alert("Sorry, this product is out of stock!");
        return;
    }

    // Check whether the product is already in the cart.
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        // Increase quantity instead of creating a duplicate.
        cartItem.quantity++;
    } else {
        // Add a new product with quantity 1.
        cart.push({
            ...product,
            quantity: 1
        });
    }

    displayCart();
}

// Display cart products, quantities, subtotals and total.
function displayCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const grandTotalElement = document.getElementById("grand-total");

    let grandTotal = 0;
    let totalQuantity = 0;

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="text-muted">Your cart is empty.</p>';
    } else {
        cartItems.innerHTML = cart.map(item => {
            const subtotal = item.price * item.quantity;

            grandTotal += subtotal;
            totalQuantity += item.quantity;

            return `
                <div class="cart-item">
                    <img
                        src="${item.image}"
                        class="cart-image"
                        alt="${item.name}"
                    >

                    <div class="cart-details">
                        <h6>${item.name}</h6>

                        <p>
                            Price: ${formatPrice(item.price)}
                        </p>

                        <p>
                            Quantity: ${item.quantity}
                        </p>

                        <p class="fw-bold mb-0">
                            Subtotal: ${formatPrice(subtotal)}
                        </p>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Update cart count and grand total.
    cartCount.textContent = totalQuantity;
    grandTotalElement.textContent = formatPrice(grandTotal);
}

// Run when the page loads.
displayProducts();
displayCart();
