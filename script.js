// Product Data
const products = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        category: "electronics",
        price: 89.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        description: "Premium wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality."
    },
    {
        id: 2,
        name: "Smart Watch Series 5",
        category: "electronics",
        price: 299.99,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        description: "Latest smartwatch with health monitoring, GPS, and cellular connectivity."
    },
    {
        id: 3,
        name: "Organic Cotton T-Shirt",
        category: "clothing",
        price: 24.99,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        description: "Comfortable organic cotton t-shirt available in multiple colors and sizes."
    },
    {
        id: 4,
        name: "Denim Jacket",
        category: "clothing",
        price: 79.99,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&h=400&fit=crop",
        description: "Classic denim jacket with modern fit, perfect for any casual occasion."
    },
    {
        id: 5,
        name: "Ceramic Plant Pot Set",
        category: "home",
        price: 34.99,
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1485955900066-894d16c6e2a5?w=400&h=400&fit=crop",
        description: "Set of 3 ceramic plant pots with drainage holes and saucers."
    },
    {
        id: 6,
        name: "Aromatherapy Diffuser",
        category: "home",
        price: 45.99,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1600334129108-6dd453ef9577?w=400&h=400&fit=crop",
        description: "Ultrasonic essential oil diffuser with LED mood lighting and timer settings."
    },
    {
        id: 7,
        name: "Yoga Mat Premium",
        category: "sports",
        price: 39.99,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
        description: "Extra thick non-slip yoga mat with carrying strap, perfect for all yoga types."
    },
    {
        id: 8,
        name: "Resistance Bands Set",
        category: "sports",
        price: 29.99,
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
        description: "Set of 5 resistance bands with different tension levels for full body workouts."
    }
];

// Cart Data
let cart = JSON.parse(localStorage.getItem('shopHubCart')) || [];

// Utility Functions
function formatPrice(price) {
    return '$' + price.toFixed(2);
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    
    if (hasHalfStar) {
        stars += '☆';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }
    
    return stars;
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function saveCart() {
    localStorage.setItem('shopHubCart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    saveCart();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    renderCheckout();
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            renderCart();
            renderCheckout();
        }
    }
}

function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTotal() {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 0 ? 5.99 : 0;
    return subtotal + shipping;
}

function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #2c3e50;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render Functions
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;
    
    // Show first 4 products as featured
    const featuredProducts = products.slice(0, 4);
    
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-rating">${generateStars(product.rating)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function renderProducts(filterCategory = 'all', sortBy = 'default') {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (filterCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filterCategory);
    }
    
    // Sort products
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title"><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-rating">${generateStars(product.rating)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function renderProductDetail() {
    const container = document.getElementById('product-detail-content');
    const breadcrumb = document.getElementById('product-name-breadcrumb');
    if (!container) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        container.innerHTML = '<p>Product not found</p>';
        return;
    }
    
    if (breadcrumb) {
        breadcrumb.textContent = product.name;
    }
    
    container.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-details">
            <span class="product-category">${product.category}</span>
            <h1>${product.name}</h1>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-rating">${generateStars(product.rating)} (${product.rating})</div>
            <div class="product-description">
                <p>${product.description}</p>
            </div>
            <div class="quantity-selector">
                <label for="quantity">Quantity:</label>
                <div class="quantity-input">
                    <button class="quantity-btn" onclick="updateDetailQuantity(-1)">-</button>
                    <input type="number" id="quantity" class="quantity-value" value="1" min="1" max="99">
                    <button class="quantity-btn" onclick="updateDetailQuantity(1)">+</button>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="addToCartFromDetail(${product.id})">Add to Cart</button>
                <button class="btn" onclick="window.history.back()">Continue Shopping</button>
            </div>
        </div>
    `;
}

let detailQuantity = 1;

function updateDetailQuantity(change) {
    const input = document.getElementById('quantity');
    if (!input) return;
    
    detailQuantity = Math.max(1, Math.min(99, detailQuantity + change));
    input.value = detailQuantity;
}

function addToCartFromDetail(productId) {
    addToCart(productId, detailQuantity);
    detailQuantity = 1;
    const input = document.getElementById('quantity');
    if (input) input.value = 1;
}

function renderCart() {
    const container = document.getElementById('cart-content');
    const summary = document.getElementById('cart-summary');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <p>Your cart is empty</p>
                <a href="products.html" class="btn">Continue Shopping</a>
            </div>
        `;
        if (summary) summary.style.display = 'none';
        return;
    }
    
    if (summary) summary.style.display = 'block';
    
    container.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                    <tr>
                        <td>
                            <div class="cart-product">
                                <div class="cart-product-image">
                                    <img src="${item.image}" alt="${item.name}">
                                </div>
                                <div class="cart-product-info">
                                    <h4>${item.name}</h4>
                                </div>
                            </div>
                        </td>
                        <td>${formatPrice(item.price)}</td>
                        <td>
                            <div class="quantity-control">
                                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <input type="number" value="${item.quantity}" min="1" max="99" onchange="updateQuantity(${item.id}, parseInt(this.value))">
                                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                        </td>
                        <td>${formatPrice(item.price * item.quantity)}</td>
                        <td>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function renderCheckout() {
    const container = document.getElementById('checkout-items');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="products.html">Add some products</a> before checking out.</p>';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-info">
                <h4>${item.name}</h4>
                <span class="quantity">Qty: ${item.quantity}</span>
            </div>
            <div class="checkout-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
    
    updateCheckoutSummary();
}

function updateCheckoutSummary() {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Render featured products on homepage
    renderFeaturedProducts();
    
    // Render products on products page
    renderProducts();
    
    // Render product detail
    renderProductDetail();
    
    // Render cart
    renderCart();
    
    // Render checkout
    renderCheckout();
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const sortFilter = document.getElementById('sort-filter');
            renderProducts(e.target.value, sortFilter ? sortFilter.value : 'default');
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            const categoryFilter = document.getElementById('category-filter');
            renderProducts(categoryFilter ? categoryFilter.value : 'all', e.target.value);
        });
    }
    
    // Checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            
            // Simulate order processing
            showNotification('Order placed successfully! Thank you for shopping with us.');
            
            // Clear cart
            cart = [];
            saveCart();
            
            // Redirect to home after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }
});

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);