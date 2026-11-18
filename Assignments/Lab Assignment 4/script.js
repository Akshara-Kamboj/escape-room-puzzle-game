// Product details stored in an array
const products = [
    {
        id: 1, name: "Wireless Headphones", price: 2499, originalPrice: 3499,
        discount: 29, description: "Comfortable wireless headphones with clear sound and deep bass.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics", rating: 4.5, inStock: true
    },
    {
        id: 2, name: "Smart Watch", price: 1999, originalPrice: 2999,
        discount: 33, description: "A stylish smartwatch for fitness tracking and daily use.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Accessories", rating: 4.2, inStock: true
    },
    {
        id: 3, name: "Running Shoes", price: 1799, originalPrice: 2499,
        discount: 28, description: "Lightweight running shoes designed for comfort and workouts.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        category: "Footwear", rating: 4.4, inStock: true
    },
    {
        id: 4, name: "Travel Backpack", price: 1299, originalPrice: 1999,
        discount: 35, description: "A spacious backpack for college, office, and travel.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Bags", rating: 4.3, inStock: true
    },
    {
        id: 5, name: "Digital Camera", price: 15999, originalPrice: 18999,
        discount: 16, description: "Capture memorable moments with a compact digital camera.",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        category: "Electronics", rating: 4.6, inStock: true
    },
    {
        id: 6, name: "Sunglasses", price: 899, originalPrice: 1499,
        discount: 40, description: "Modern sunglasses with a stylish frame for everyday wear.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
        category: "Fashion", rating: 4.1, inStock: true
    },
    {
        id: 7, name: "Coffee Maker", price: 3499, originalPrice: 4499,
        discount: 22, description: "Prepare fresh coffee at home with this easy-to-use coffee maker.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
        category: "Home Appliances", rating: 4.4, inStock: false
    }
];

// Stores products added to the cart
let cart = [];

// Format prices in Indian Rupees
function formatPrice(price) {
    return "₹" + price.toLocaleString("en-IN");
}

// Display all product cards
function displayProducts() {
    let productList = document.getElementById("product-list");

    productList.innerHTML = products.map(product => `
        <div class="col-xl-4 col-lg-6 col-sm-6">
            <div class="card product-card">
                <img src="${product.image}" class="product-image" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p>
                        <span class="badge bg-secondary">${product.category}</span>
                        <span class="ms-2">⭐ ${product.rating}</span>
                    </p>
                    <p>
                        <span class="price">${formatPrice(product.price)}</span>
                        <del class="original-price">${formatPrice(product.originalPrice)}</del>
                    </p>
                    <p class="discount">${product.discount}% OFF</p>
                    <button class="btn ${product.inStock ? "btn-primary" : "btn-secondary"} w-100"
                        onclick="addToCart(${product.id})"
                        ${product.inStock ? "" : "disabled"}>
                        ${product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Add a product or increase its quantity
function addToCart(id) {
    let product = products.find(item => item.id === id);

    if (!product || !product.inStock) {
        alert("This product is out of stock!");
        return;
    }

    let cartItem = cart.find(item => item.id === id);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    displayCart();
}

// Increase or decrease quantity in the cart
function changeQuantity(id, change) {
    let item = cart.find(product => product.id === id);

    if (item) {
        item.quantity += change;

        // Remove the product if its quantity becomes zero
        if (item.quantity === 0) {
            cart = cart.filter(product => product.id !== id);
        }
    }

    displayCart();
}

// Display cart products and calculate totals
function displayCart() {
    let cartItems = document.getElementById("cart-items");
    let totalQuantity = 0;
    let grandTotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    } else {
        cartItems.innerHTML = cart.map(item => {
            let subtotal = item.price * item.quantity;
            totalQuantity += item.quantity;
            grandTotal += subtotal;

            return `
                <div class="cart-item">
                    <img src="${item.image}" class="cart-image" alt="${item.name}">
                    <div class="cart-details">
                        <h6>${item.name}</h6>
                        <p>Price: ${formatPrice(item.price)}</p>
                        <div class="quantity-controls">
                            <button class="btn btn-sm btn-outline-secondary"
                                onclick="changeQuantity(${item.id}, -1)">−</button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary"
                                onclick="changeQuantity(${item.id}, 1)">+</button>
                        </div>
                        <p class="fw-bold mt-2 mb-0">Subtotal: ${formatPrice(subtotal)}</p>
                    </div>
                </div>
            `;
        }).join("");
    }

    document.getElementById("cart-count").textContent = cart.length;
    document.getElementById("item-count").textContent = totalQuantity;
    document.getElementById("grand-total").textContent = formatPrice(grandTotal);
}

// Simple checkout message
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
    } else {
        alert("Your order total is " + formatPrice(
            cart.reduce((total, item) => total + item.price * item.quantity, 0)
        ));
    }
}

// Run these functions when the page loads
displayProducts();
displayCart();
