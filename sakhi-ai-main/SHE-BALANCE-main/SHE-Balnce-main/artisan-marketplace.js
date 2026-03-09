// Artisan Marketplace JavaScript

// Products array - will be loaded from products-data.js
let products = [];

// Shopping cart
let cart = JSON.parse(localStorage.getItem('artisanCart')) || [];

// Initialize marketplace
document.addEventListener('DOMContentLoaded', () => {
    console.log('Marketplace initializing...');
    
    // Load products from productsData
    products = productsData || [];
    console.log('Loaded', products.length, 'products');
    console.log('First product:', products[0]);
    
    // Save to localStorage for persistence
    const PRODUCTS_VERSION = '5.0';
    localStorage.setItem('artisanProducts', JSON.stringify(products));
    localStorage.setItem('artisanProductsVersion', PRODUCTS_VERSION);
    
    checkUserRole();
    renderProducts();
    updateCartCount();
    
    // Check if URL has #add-product hash and open modal after page loads
    if (window.location.hash === '#add-product') {
        // Wait for page to fully render, then open modal
        setTimeout(() => {
            console.log('Auto-opening Add Product modal from hash');
            openAddProduct();
            // Scroll to top so modal is visible
            window.scrollTo(0, 0);
        }, 800);
    }
    
    // Add product form submission
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    
    // Navigation event listeners
    document.querySelectorAll('[data-section]').forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', function() {
            scrollToSection(this.dataset.section);
        });
    });
    
    document.getElementById('addProductBtn').addEventListener('click', openAddProduct);
    document.getElementById('floatingAddBtn').addEventListener('click', openAddProduct);
    document.getElementById('dashboardBtn').addEventListener('click', goToDashboard);
    document.getElementById('cartIcon').addEventListener('click', toggleCart);
    
    // Image upload event listeners
    const imageUploadDiv = document.getElementById('imageUploadDiv');
    const productImageInput = document.getElementById('productImage');
    
    imageUploadDiv.addEventListener('click', () => {
        productImageInput.click();
    });
    
    productImageInput.addEventListener('change', previewImage);
    
    // Modal control event listeners
    document.getElementById('cancelAddProduct').addEventListener('click', closeAddProduct);
    document.getElementById('closeCartBtn').addEventListener('click', toggleCart);
    document.getElementById('checkoutBtn').addEventListener('click', proceedToCheckout);
    
    // Form input event listeners for price calculation
    const priceInputs = ['materialCost', 'effortCost', 'heritageValue', 'sourcingEffort', 'qualityControl'];
    priceInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', calculateTotal);
        }
    });
});

// Check user role and show/hide buttons accordingly
function checkUserRole() {
    // Check both possible localStorage keys for user data
    let currentUser = JSON.parse(localStorage.getItem('shebalance_user'));
    
    // Fallback to old key if new one doesn't exist
    if (!currentUser) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    console.log('Current user:', currentUser); // Debug log
    
    // Show Add Product and Dashboard buttons only for artisans (users) and admins
    if (currentUser && (currentUser.role === 'user' || currentUser.role === 'admin')) {
        document.getElementById('addProductBtn').style.display = 'flex';
        document.getElementById('dashboardBtn').style.display = 'flex';
        document.getElementById('floatingAddBtn').style.display = 'flex';
        console.log('Showing artisan/admin buttons for role:', currentUser.role);
    } else {
        // Hide for buyers, corporate buyers, and guests
        document.getElementById('addProductBtn').style.display = 'none';
        document.getElementById('dashboardBtn').style.display = 'none';
        document.getElementById('floatingAddBtn').style.display = 'none';
        console.log('Hiding buttons - user role:', currentUser ? currentUser.role : 'guest');
    }
}

// Render products by category
function renderProducts() {
    console.log('=== renderProducts START ===');
    console.log('Products array length:', products.length);
    console.log('First product:', products[0]);
    
    const categories = {
        embroidery: document.getElementById('embroideryGrid'),
        henna: document.getElementById('hennaGrid'),
        crochet: document.getElementById('crochetGrid'),
        weaving: document.getElementById('weavingGrid'),
        jewelry: document.getElementById('jewelryGrid'),
        pottery: document.getElementById('potteryGrid')
    };
    
    console.log('Category grids found:', Object.keys(categories).filter(k => categories[k] !== null));
    
    // Clear all grids
    Object.values(categories).forEach(grid => {
        if (grid) {
            console.log('Clearing grid:', grid.id);
            grid.innerHTML = '';
        }
    });
    
    // Render products
    let renderedCount = 0;
    products.forEach(product => {
        console.log(`Rendering product ${product.id}: ${product.name} in category: ${product.category}`);
        const grid = categories[product.category];
        if (grid) {
            const cardHTML = createProductCard(product);
            console.log('Card HTML length:', cardHTML.length);
            grid.innerHTML += cardHTML;
            renderedCount++;
            console.log(`✓ Added to grid: ${product.category}`);
        } else {
            console.error(`✗ Grid not found for category: ${product.category}`);
        }
    });
    
    console.log(`Total products rendered: ${renderedCount}`);
    
    // Add event listeners using event delegation
    document.querySelectorAll('.product-image, .product-name').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            console.log('Product clicked:', productId);
            viewProductDetail(productId);
        });
    });
    
    // Add error handlers for images
    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('error', function() {
            console.error('Image failed to load:', this.src);
            this.src = 'https://via.placeholder.com/300x250?text=Artisan+Product';
        });
    });
    
    document.querySelectorAll('.labor-badge').forEach(el => {
        el.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            console.log('Labor badge clicked:', productId);
            showLaborDetails(productId);
        });
    });
    
    document.querySelectorAll('.add-to-cart-btn').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = parseInt(this.dataset.productId);
            console.log('Add to cart clicked:', productId);
            addToCart(productId);
        });
    });
    
    console.log('=== renderProducts END ===');
}

// Create product card HTML
function createProductCard(product) {
    const totalInvisibleLabor = 
        product.invisibleLabor.heritageValue +
        product.invisibleLabor.sourcingEffort +
        product.invisibleLabor.qualityControl;
    
    console.log('Creating card for product:', product.name, 'Image:', product.image);
    
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" data-product-id="${product.id}">
            <div class="product-info">
                <h3 class="product-name" data-product-id="${product.id}">${product.name}</h3>
                <div class="product-artisan">
                    <i class="fas fa-user-circle"></i>
                    <span>By ${product.artisan}</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="labor-badge" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                    <span>View Invisible Labor</span>
                </div>
                <div class="product-price">₹${product.price.toFixed(2)}</div>
                <div class="price-breakdown">
                    Materials: ₹${product.materialCost} | Effort: ₹${product.effortCost} | Labor: ₹${totalInvisibleLabor}
                </div>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Show invisible labor details
function showLaborDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const totalInvisibleLabor = 
        product.invisibleLabor.heritageValue +
        product.invisibleLabor.sourcingEffort +
        product.invisibleLabor.qualityControl;
    
    const modalBody = document.getElementById('laborModalBody');
    modalBody.innerHTML = `
        <div class="labor-section">
            <h3><i class="fas fa-box"></i> ${product.name}</h3>
            <p style="color: var(--chocolate); margin-bottom: 20px;">By ${product.artisan}</p>
        </div>
        
        <div class="labor-section">
            <h3><i class="fas fa-coins"></i> Cost Breakdown</h3>
            <div class="labor-item">
                <div class="labor-item-label">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Raw Materials</span>
                </div>
                <div class="labor-item-value">₹${product.materialCost.toFixed(2)}</div>
            </div>
            <div class="labor-item">
                <div class="labor-item-label">
                    <i class="fas fa-hands"></i>
                    <span>Artisan Effort</span>
                </div>
                <div class="labor-item-value">₹${product.effortCost.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="labor-section">
            <h3><i class="fas fa-heart"></i> Invisible Labor</h3>
            <div class="labor-item">
                <div class="labor-item-label">
                    <i class="fas fa-pencil-ruler"></i>
                    <span>Design & Planning (${product.invisibleLabor.designHours} hours)</span>
                </div>
                <div class="labor-item-value">Time Investment</div>
            </div>
            <div class="labor-item">
                <div class="labor-item-label">
                    <i class="fas fa-landmark"></i>
                    <span>Heritage & Traditional Skills</span>
                </div>
                <div class="labor-item-value">₹${product.invisibleLabor.heritageValue.toFixed(2)}</div>
            </div>
            <div class="labor-item">
                <div class="labor-item-label">
                    <i class="fas fa-search"></i>
                    <span>Material Sourcing Effort</span>
                </div>
                <div class="labor-item-value">₹${product.invisibleLabor.sourcingEffort.toFixed(2)}</div>
            </div>
            <div class="labor-item">
                <div class="labor-item-label">
                    <i class="fas fa-check-circle"></i>
                    <span>Quality Control & Finishing</span>
                </div>
                <div class="labor-item-value">₹${product.invisibleLabor.qualityControl.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="labor-total">
            <span>Total Product Value</span>
            <span>₹${product.price.toFixed(2)}</span>
        </div>
        
        <div style="background: var(--cream); padding: 15px; border-radius: 10px; margin-top: 20px;">
            <p style="color: var(--chocolate); font-size: 0.95rem; line-height: 1.6;">
                <i class="fas fa-info-circle"></i> <strong>Why This Matters:</strong> 
                This breakdown shows the true value of handcrafted work. Your purchase supports fair wages, 
                preserves traditional crafts, and recognizes the invisible labor that goes into every piece.
            </p>
        </div>
        
        <button class="close-modal" data-modal="laborModal">Close</button>
    `;
    
    document.getElementById('laborModal').classList.add('open');
    
    // Add event listener for close button
    const closeBtn = document.querySelector('[data-modal="laborModal"]');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLaborModal);
    }
}

function closeLaborModal() {
    document.getElementById('laborModal').classList.remove('open');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('artisanCart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    
    // Show feedback
    const btn = event.target.closest('.add-to-cart-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.style.background = 'var(--sage)';
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 1500);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.toggle('open');
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" data-product-id="${item.id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-product-id="${item.id}" data-change="1">+</button>
                        <button class="remove-item" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = `₹${total.toFixed(2)}`;
    
    // Add error handlers for cart images
    document.querySelectorAll('.cart-item-image').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/80?text=Product';
        });
    });
    
    // Add event listeners for cart item buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            const change = parseInt(this.dataset.change);
            updateQuantity(productId, change);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            removeFromCart(productId);
        });
    });
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    localStorage.setItem('artisanCart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('artisanCart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
}

// Open add product modal
function openAddProduct() {
    document.getElementById('addProductModal').classList.add('open');
}

function closeAddProduct() {
    document.getElementById('addProductModal').classList.remove('open');
    document.getElementById('addProductForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
}

// Preview uploaded image
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Calculate total price
function calculateTotal() {
    const materialCost = parseFloat(document.getElementById('materialCost').value) || 0;
    const effortCost = parseFloat(document.getElementById('effortCost').value) || 0;
    const heritageValue = parseFloat(document.getElementById('heritageValue').value) || 0;
    const sourcingEffort = parseFloat(document.getElementById('sourcingEffort').value) || 0;
    const qualityControl = parseFloat(document.getElementById('qualityControl').value) || 0;
    
    const total = materialCost + effortCost + heritageValue + sourcingEffort + qualityControl;
    document.getElementById('totalPrice').textContent = `₹${total.toFixed(2)}`;
}

// Handle add product form submission
function handleAddProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        artisan: 'Rukaiya', // Current user
        description: document.getElementById('productDescription').value,
        image: document.getElementById('imagePreview').src || 'https://via.placeholder.com/300x250?text=Artisan+Product',
        materialCost: parseFloat(document.getElementById('materialCost').value),
        effortCost: parseFloat(document.getElementById('effortCost').value),
        invisibleLabor: {
            designHours: parseFloat(document.getElementById('designHours').value),
            heritageValue: parseFloat(document.getElementById('heritageValue').value),
            sourcingEffort: parseFloat(document.getElementById('sourcingEffort').value),
            qualityControl: parseFloat(document.getElementById('qualityControl').value)
        },
        price: parseFloat(document.getElementById('totalPrice').textContent.replace('₹', ''))
    };
    
    products.push(newProduct);
    localStorage.setItem('artisanProducts', JSON.stringify(products));
    
    renderProducts();
    closeAddProduct();
    
    // Show success message
    alert('Product added successfully! 🎉');
    
    // Scroll to the product's category
    scrollToSection(newProduct.category);
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Navigation functions
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty! Please add some products before checkout.');
        return;
    }
    
    // Save cart data for payment page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    localStorage.setItem('checkoutTotal', document.getElementById('cartTotal').textContent);
    localStorage.setItem('checkoutType', 'artisan-products');
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

// View product detail page
function viewProductDetail(productId) {
    window.location.href = `artisan-product-detail.html?id=${productId}`;
}

// ===== CAROUSEL FUNCTIONALITY =====
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dot');
const totalSlides = slides.length;
let autoSlideInterval;

// Show specific slide
function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentSlide = index;
}

// Next slide
function nextSlide() {
    let next = (currentSlide + 1) % totalSlides;
    showSlide(next);
}

// Previous slide
function prevSlide() {
    let prev = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(prev);
}

// Auto slide every 5 seconds
function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    // Arrow button event listeners
    document.getElementById('prevSlide').addEventListener('click', () => {
        prevSlide();
        stopAutoSlide();
        startAutoSlide(); // Restart auto-slide after manual navigation
    });
    
    document.getElementById('nextSlide').addEventListener('click', () => {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
    });
    
    // Dot navigation event listeners
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    // Start auto-slide
    startAutoSlide();
    
    // Pause on hover
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
});
