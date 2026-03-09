// Product Data
const products = {
    bakery: [
        { id: 101, name: 'Sourdough Bread', chef: 'Sunita Devi', price: 120, image: 'food marketplace/bakery/sour dough bread.jfif' },
        { id: 102, name: 'Butter Croissants', chef: 'Priya Sharma', price: 150, image: 'food marketplace/bakery/crossaint.jfif' },
        { id: 103, name: 'Whole Wheat Roti', chef: 'Meera Patel', price: 100, image: 'food marketplace/bakery/whole roti.jfif' },
        { id: 104, name: 'Pav Bread', chef: 'Anjali Verma', price: 80, image: 'food marketplace/bakery/pav bread.jfif' },
        { id: 105, name: 'Multigrain Bread', chef: 'Sunita Devi', price: 110, image: 'food marketplace/bakery/multi grain bread.jfif' },
        { id: 106, name: 'Naan Bread', chef: 'Priya Sharma', price: 90, image: 'food marketplace/bakery/naan bread.jfif' },
        { id: 107, name: 'Kulcha', chef: 'Meera Patel', price: 85, image: 'food marketplace/bakery/kulcha.jfif' },
        { id: 108, name: 'Paratha Pack', chef: 'Anjali Verma', price: 140, image: 'food marketplace/bakery/paratha pack.jfif' }
    ],
    produce: [
        { id: 201, name: 'Organic Vegetable Basket', chef: 'Kavya Singh', price: 250, image: 'food marketplace/farm fresh/organic basket.jfif' },
        { id: 202, name: 'Farm Fresh Eggs', chef: 'Neha Kapoor', price: 80, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop' },
        { id: 203, name: 'Seasonal Fruit Box', chef: 'Rukaiya Ghadiali', price: 300, image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop' },
        { id: 204, name: 'Organic Tomatoes', chef: 'Fatima Khan', price: 60, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop' },
        { id: 205, name: 'Fresh Spinach', chef: 'Kavya Singh', price: 40, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop' },
        { id: 206, name: 'Green Chillies', chef: 'Neha Kapoor', price: 30, image: 'food marketplace/farm fresh/green chillies.jfif' },
        { id: 207, name: 'Organic Carrots', chef: 'Rukaiya Ghadiali', price: 50, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop' },
        { id: 208, name: 'Fresh Coriander Bundle', chef: 'Fatima Khan', price: 20, image: 'food marketplace/farm fresh/corrainder bundle.jfif' }
    ],
    meals: [
        { id: 301, name: 'Rajma Chawal', chef: 'Rukaiya Ghadiali', price: 80, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop' },
        { id: 302, name: 'Chicken Biryani', chef: 'Fatima Khan', price: 150, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop' },
        { id: 303, name: 'Dal Tadka with Rice', chef: 'Kavya Singh', price: 70, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop' },
        { id: 304, name: 'Paneer Butter Masala', chef: 'Sunita Devi', price: 120, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop' },
        { id: 305, name: 'Chole Bhature', chef: 'Rukaiya Ghadiali', price: 90, image: 'food marketplace/ready meals/chole bhature.jfif' },
        { id: 306, name: 'Butter Chicken', chef: 'Fatima Khan', price: 160, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop' },
        { id: 307, name: 'Veg Pulao', chef: 'Kavya Singh', price: 100, image: 'food marketplace/ready meals/veg pulav.jfif' },
        { id: 308, name: 'Samosa (10 pcs)', chef: 'Priya Sharma', price: 100, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop' }
    ],
    sweets: [
        { id: 401, name: 'Gulab Jamun', chef: 'Meera Patel', price: 120, image: 'food marketplace/sweet delights/gulab jamuns.jfif' },
        { id: 402, name: 'Kaju Katli', chef: 'Anjali Verma', price: 250, image: 'food marketplace/sweet delights/kaju katli.jfif' },
        { id: 403, name: 'Besan Ladoo', chef: 'Priya Sharma', price: 200, image: 'food marketplace/sweet delights/besan ladoo.jfif' },
        { id: 404, name: 'Ras Malai', chef: 'Anjali Verma', price: 150, image: 'food marketplace/sweet delights/ras mallai.jfif' },
        { id: 405, name: 'Rasgulla', chef: 'Meera Patel', price: 100, image: 'food marketplace/sweet delights/rasgulla.jfif' },
        { id: 406, name: 'Jalebi', chef: 'Anjali Verma', price: 80, image: 'food marketplace/sweet delights/jalebi.jfif' },
        { id: 407, name: 'Barfi Assortment', chef: 'Priya Sharma', price: 220, image: 'food marketplace/sweet delights/barfi.jfif' },
        { id: 408, name: 'Kheer (Rice Pudding)', chef: 'Meera Patel', price: 90, image: 'food marketplace/sweet delights/kheer.jfif' }
    ],
    deli: [
        { id: 501, name: 'Homemade Paneer', chef: 'Neha Kapoor', price: 150, image: 'food marketplace/sweet delights/paneer.jfif' },
        { id: 502, name: 'Mango Pickle', chef: 'Rukaiya Ghadiali', price: 180, image: 'food marketplace/Deli/mango pickle.jfif' },
        { id: 503, name: 'Mixed Fruit Jam', chef: 'Kavya Singh', price: 200, image: 'food marketplace/Deli/mixed fruit jam.jfif' },
        { id: 504, name: 'Garlic Chutney', chef: 'Fatima Khan', price: 120, image: 'food marketplace/Deli/garlic chutney.jfif' },
        { id: 505, name: 'Mint Chutney', chef: 'Rukaiya Ghadiali', price: 100, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&h=300&fit=crop' },
        { id: 506, name: 'Tamarind Chutney', chef: 'Fatima Khan', price: 110, image: 'food marketplace/Deli/tarmarind chutney.jfif' },
        { id: 507, name: 'Lemon Pickle', chef: 'Kavya Singh', price: 160, image: 'food marketplace/Deli/lemon pickle.jfif' },
        { id: 508, name: 'Pure Desi Ghee', chef: 'Neha Kapoor', price: 300, image: 'food marketplace/Deli/pure desi ghee.jfif' }
    ],
    chefs: [
        { id: 601, name: 'Sunita Devi', specialty: 'North Indian Home-style', hourlyRate: 300, locality: 'Delhi NCR', experience: '15 years', rating: 4.9, reviews: 156, image: 'food marketplace/chefs/chef 1.jfif', description: 'Expert in traditional North Indian cuisine, rotis, and dal preparations' },
        { id: 602, name: 'Priya Sharma', specialty: 'Baking & Pastries', hourlyRate: 400, locality: 'Mumbai', experience: '10 years', rating: 5.0, reviews: 203, image: 'food marketplace/chefs/chef 2.jfif', description: 'Specialized in artisan breads, cakes, and European pastries' },
        { id: 603, name: 'Fatima Khan', specialty: 'Mughlai & Biryani', hourlyRate: 350, locality: 'Hyderabad', experience: '12 years', rating: 4.8, reviews: 178, image: 'food marketplace/chefs/chef 3.jfif', description: 'Master of authentic Mughlai cuisine and aromatic biryanis' },
        { id: 604, name: 'Meera Patel', specialty: 'Gujarati & Jain Food', hourlyRate: 280, locality: 'Ahmedabad', experience: '8 years', rating: 4.9, reviews: 134, image: 'food marketplace/chefs/chef 4.jfif', description: 'Expert in Gujarati thalis and pure vegetarian Jain cuisine' },
        { id: 605, name: 'Anjali Verma', specialty: 'South Indian Delicacies', hourlyRate: 320, locality: 'Bangalore', experience: '11 years', rating: 4.9, reviews: 167, image: 'food marketplace/chefs/chef 5.jfif', description: 'Specialist in dosas, idlis, and authentic South Indian meals' },
        { id: 606, name: 'Kavya Singh', specialty: 'Party & Event Catering', hourlyRate: 450, locality: 'Pune', experience: '14 years', rating: 5.0, reviews: 245, image: 'food marketplace/chefs/chef 6.jfif', description: 'Professional event chef for parties, weddings, and corporate events' },
        { id: 607, name: 'Rukaiya Ghadiali', specialty: 'Healthy & Keto Meals', hourlyRate: 380, locality: 'Chennai', experience: '7 years', rating: 4.8, reviews: 98, image: 'food marketplace/chefs/chef 7.jfif', description: 'Nutrition-focused chef specializing in keto, low-carb, and healthy meals' },
        { id: 608, name: 'Neha Kapoor', specialty: 'Bengali & East Indian', hourlyRate: 330, locality: 'Kolkata', experience: '9 years', rating: 4.9, reviews: 142, image: 'food marketplace/chefs/chef 8.jfif', description: 'Expert in Bengali sweets, fish curries, and East Indian cuisine' }
    ]
};

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('shebalance_cart')) || [];
let selectedPaymentMethod = 'card';
let currentChefBooking = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCartUI();
    
    // Handle hash navigation on page load
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1); // Remove the # symbol
        console.log('Hash detected:', sectionId);
        setTimeout(() => {
            scrollToSection(sectionId);
        }, 300); // Increased delay to ensure products are rendered
    }
});

// Render all products
function renderProducts() {
    Object.keys(products).forEach(category => {
        const gridId = category === 'produce' ? 'produceGrid' : 
                       category === 'sweets' ? 'sweetsGrid' : 
                       category === 'chefs' ? 'chefsGrid' : 
                       `${category}Grid`;
        const grid = document.getElementById(gridId);
        if (grid) {
            if (category === 'chefs') {
                grid.innerHTML = products[category].map(chef => createChefCard(chef)).join('');
            } else {
                grid.innerHTML = products[category].map(product => createProductCard(product)).join('');
            }
        }
    });
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/400x300/D4A574/4B3621?text=${encodeURIComponent(product.name)}'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-chef"><i class="fas fa-user-circle"></i> ${product.chef}</div>
                <div class="product-price">₹${product.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Add to cart
function addToCart(productId) {
    // Find product
    let product = null;
    for (let category in products) {
        product = products[category].find(p => p.id === productId);
        if (product) break;
    }
    
    if (!product) return;
    
    // Check if already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification('Added to cart!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('shebalance_cart', JSON.stringify(cart));
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalPrice}`;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/80x80/D4A574/4B3621?text=${encodeURIComponent(item.name)}'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    console.log('Scrolling to section:', sectionId, 'Found:', !!section);
    if (section) {
        const navbarHeight = 80; // Height of fixed navbar
        const sectionPosition = section.offsetTop - navbarHeight;
        
        window.scrollTo({
            top: sectionPosition,
            behavior: 'smooth'
        });
    }
}

// Open checkout
function openCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('open');
    updateOrderSummary();
}

// Close checkout
function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('open');
}

// Select payment method
function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('active');
    });
    event.target.closest('.payment-method').classList.add('active');
    
    // Show/hide card form
    const cardForm = document.getElementById('cardPaymentForm');
    if (method === 'card') {
        cardForm.style.display = 'block';
    } else {
        cardForm.style.display = 'none';
    }
}

// Update order summary
function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;
    
    document.getElementById('summarySubtotal').textContent = `₹${subtotal}`;
    document.getElementById('summaryDelivery').textContent = `₹${deliveryFee}`;
    document.getElementById('summaryTotal').textContent = `₹${total}`;
}

// Place order
function placeOrder() {
    // Validate form
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const postalCode = document.getElementById('postalCode').value;
    
    if (!fullName || !email || !phone || !address || !city || !postalCode) {
        showNotification('Please fill in all required fields!');
        return;
    }
    
    // Validate payment info if card selected
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholderName').value;
        
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
            showNotification('Please fill in all card details!');
            return;
        }
    }
    
    // Simulate order processing
    const orderData = {
        customer: { fullName, email, phone, address, city, postalCode },
        items: cart,
        paymentMethod: selectedPaymentMethod,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50,
        orderDate: new Date().toISOString()
    };
    
    console.log('Order placed:', orderData);
    
    // Show success message
    showNotification('Order placed successfully! 🎉');
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    
    // Close modals
    closeCheckout();
    toggleCart();
    
    // Reset form
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('city').value = '';
    document.getElementById('postalCode').value = '';
    
    // Show order confirmation
    setTimeout(() => {
        alert(`Thank you for your order, ${fullName}!\n\nOrder Total: ₹${orderData.total}\nPayment Method: ${selectedPaymentMethod.toUpperCase()}\n\nYour order will be delivered to:\n${address}, ${city} - ${postalCode}\n\nWe'll send a confirmation email to ${email}`);
    }, 500);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4B3621;
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
});


// Create chef card HTML
function createChefCard(chef) {
    return `
        <div class="product-card">
            <img src="${chef.image}" alt="${chef.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/400x300/D4A574/4B3621?text=${encodeURIComponent(chef.name)}'">
            <div class="product-info">
                <div class="product-name">${chef.name}</div>
                <div class="product-chef"><i class="fas fa-utensils"></i> ${chef.specialty}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0;">
                    <div style="color: var(--chocolate); font-size: 0.9rem;">
                        <i class="fas fa-star" style="color: #FFD700;"></i> ${chef.rating} (${chef.reviews})
                    </div>
                    <div style="color: var(--chocolate); font-size: 0.85rem;">
                        <i class="fas fa-map-marker-alt"></i> ${chef.locality}
                    </div>
                </div>
                <div style="color: var(--chocolate); font-size: 0.85rem; margin-bottom: 8px;">
                    <i class="fas fa-clock"></i> ${chef.experience} experience
                </div>
                <div class="product-price">₹${chef.hourlyRate}/hour</div>
                <button class="add-to-cart-btn" onclick="openChefBooking(${chef.id})" style="background: var(--terracotta);">
                    <i class="fas fa-calendar-check"></i> Book Now
                </button>
            </div>
        </div>
    `;
}

// Open chef booking modal
function openChefBooking(chefId) {
    const chef = products.chefs.find(c => c.id === chefId);
    if (!chef) return;
    
    currentChefBooking = chef;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
    document.getElementById('bookingDate').value = today;
    
    // Set default time
    document.getElementById('bookingTime').value = '10:00';
    
    // Display chef details
    const detailsDiv = document.getElementById('chefBookingDetails');
    detailsDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px; padding: 20px; background: var(--cream); border-radius: 15px;">
            <img src="${chef.image}" alt="${chef.name}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 4px solid var(--beige);">
            <h3 style="color: var(--deep-brown); margin-bottom: 8px;">${chef.name}</h3>
            <p style="color: var(--chocolate); font-size: 1.1rem; margin-bottom: 5px;"><i class="fas fa-utensils"></i> ${chef.specialty}</p>
            <p style="color: var(--chocolate); font-size: 0.95rem; margin-bottom: 5px;"><i class="fas fa-map-marker-alt"></i> ${chef.locality}</p>
            <p style="color: var(--chocolate); font-size: 0.95rem; margin-bottom: 10px;"><i class="fas fa-clock"></i> ${chef.experience} experience</p>
            <div style="display: inline-block; background: white; padding: 8px 20px; border-radius: 20px;">
                <i class="fas fa-star" style="color: #FFD700;"></i> ${chef.rating} (${chef.reviews} reviews)
            </div>
            <p style="color: var(--chocolate); margin-top: 15px; font-style: italic;">${chef.description}</p>
        </div>
    `;
    
    // Update pricing
    updateChefBookingPrice();
    
    // Add event listeners
    document.getElementById('bookingHours').addEventListener('input', updateChefBookingPrice);
    
    // Open modal
    document.getElementById('chefBookingModal').classList.add('open');
}

// Close chef booking modal
function closeChefBooking() {
    document.getElementById('chefBookingModal').classList.remove('open');
    currentChefBooking = null;
}

// Update chef booking price
function updateChefBookingPrice() {
    if (!currentChefBooking) return;
    
    const hours = parseInt(document.getElementById('bookingHours').value) || 3;
    const hourlyRate = currentChefBooking.hourlyRate;
    const serviceFee = 100;
    const total = (hourlyRate * hours) + serviceFee;
    
    document.getElementById('chefHourlyRate').textContent = `₹${hourlyRate}`;
    document.getElementById('chefHoursDisplay').textContent = hours;
    document.getElementById('chefBookingTotal').textContent = `₹${total}`;
}

// Confirm chef booking
function confirmChefBooking() {
    if (!currentChefBooking) return;
    
    // Validate form
    const bookingDate = document.getElementById('bookingDate').value;
    const bookingTime = document.getElementById('bookingTime').value;
    const bookingHours = document.getElementById('bookingHours').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const serviceAddress = document.getElementById('serviceAddress').value;
    
    if (!bookingDate || !bookingTime || !bookingHours || !customerName || !customerPhone || !customerEmail || !serviceAddress) {
        showNotification('Please fill in all required fields!');
        return;
    }
    
    // Validate hours
    const hours = parseInt(bookingHours);
    if (hours < 2 || hours > 12) {
        showNotification('Please select between 2 and 12 hours!');
        return;
    }
    
    // Calculate total
    const hourlyRate = currentChefBooking.hourlyRate;
    const serviceFee = 100;
    const total = (hourlyRate * hours) + serviceFee;
    
    // Create booking object
    const booking = {
        chef: currentChefBooking,
        date: bookingDate,
        time: bookingTime,
        hours: hours,
        eventType: document.getElementById('eventType').value,
        numberOfPeople: document.getElementById('numberOfPeople').value,
        specialRequirements: document.getElementById('specialRequirements').value,
        customer: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: serviceAddress
        },
        pricing: {
            hourlyRate: hourlyRate,
            hours: hours,
            serviceFee: serviceFee,
            total: total
        },
        bookingDate: new Date().toISOString()
    };
    
    console.log('Chef booking confirmed:', booking);
    
    // Show success message
    showNotification('Chef booking confirmed! 🎉');
    
    // Close modal
    closeChefBooking();
    
    // Reset form
    document.getElementById('bookingHours').value = 3;
    document.getElementById('eventType').value = 'daily';
    document.getElementById('numberOfPeople').value = 4;
    document.getElementById('specialRequirements').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('serviceAddress').value = '';
    
    // Show confirmation alert
    setTimeout(() => {
        alert(`Booking Confirmed!\n\nChef: ${currentChefBooking.name}\nSpecialty: ${currentChefBooking.specialty}\nDate: ${bookingDate}\nTime: ${bookingTime}\nDuration: ${hours} hours\nTotal: ₹${total}\n\nThe chef will contact you at ${customerPhone} to confirm details.\n\nA confirmation email has been sent to ${customerEmail}`);
    }, 500);
}
