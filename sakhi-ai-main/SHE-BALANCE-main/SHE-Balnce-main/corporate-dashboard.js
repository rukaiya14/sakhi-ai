// Corporate Dashboard JavaScript - SheBalance

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadArtisans();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthentication() {
    const userData = localStorage.getItem('shebalance_user');
    
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Check if user has corporate role
    if (user.role !== 'corporate') {
        if (user.role === 'buyer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (user.role === 'artisan') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
}

// Load user data
function loadUserData() {
    const userData = localStorage.getItem('shebalance_user');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('userName').textContent = user.name;
    }
}

// Sample artisan data with bulk order capabilities
const artisans = [
    {
        id: 1,
        name: 'Sunita Devi',
        skill: 'Embroidery Specialist',
        category: 'embroidery',
        rating: 4.9,
        reviews: 127,
        price: '₹400-1800',
        bulkDiscount: '15%',
        capacity: '200 units/month',
        location: 'Mumbai',
        tags: ['Bulk Orders', 'Custom Design', 'Fast Delivery'],
        image: 'Dashboard/buyer/atisian profile/embrodiery.jpg',
        favorite: false
    },
    {
        id: 2,
        name: 'Meera Patel',
        skill: 'Weaving Artist',
        category: 'weaving',
        rating: 4.8,
        reviews: 89,
        price: '₹600-2500',
        bulkDiscount: '20%',
        capacity: '150 units/month',
        location: 'Gujarat',
        tags: ['Handloom', 'Bulk Discount', 'Quality Assured'],
        image: 'Dashboard/buyer/atisian profile/weaving.jpg',
        favorite: false
    },
    {
        id: 3,
        name: 'Kavya Singh',
        skill: 'Pottery Master',
        category: 'pottery',
        rating: 4.7,
        reviews: 156,
        price: '₹250-1200',
        bulkDiscount: '25%',
        capacity: '300 units/month',
        location: 'Rajasthan',
        tags: ['Corporate Gifts', 'Bulk Orders', 'Custom Branding'],
        image: 'Dashboard/buyer/atisian profile/potter.jpg',
        favorite: false
    },
    {
        id: 4,
        name: 'Rukaiya Khan',
        skill: 'Jewelry Designer',
        category: 'jewelry',
        rating: 5.0,
        reviews: 43,
        price: '₹800-4000',
        bulkDiscount: '18%',
        capacity: '100 units/month',
        location: 'Delhi',
        tags: ['Corporate Gifts', 'Premium Quality', 'Custom Design'],
        image: 'Dashboard/buyer/atisian profile/jwellery designer.jpg',
        favorite: false
    },
    {
        id: 5,
        name: 'Anjali Verma',
        skill: 'Tailoring Expert',
        category: 'tailoring',
        rating: 4.9,
        reviews: 234,
        price: '₹350-1500',
        bulkDiscount: '22%',
        capacity: '250 units/month',
        location: 'Bangalore',
        tags: ['Uniform Orders', 'Bulk Discount', 'Fast Turnaround'],
        image: 'Dashboard/buyer/atisian profile/tailoring.jpg',
        favorite: false
    },
    {
        id: 6,
        name: 'Lakshmi Reddy',
        skill: 'Catering Services',
        category: 'food',
        rating: 4.6,
        reviews: 78,
        price: '₹150-800/person',
        bulkDiscount: '30%',
        capacity: '500 servings/day',
        location: 'Hyderabad',
        tags: ['Corporate Events', 'Bulk Catering', 'Multi-Cuisine'],
        image: 'Dashboard/buyer/atisian profile/cook.jfif',
        favorite: false
    },
    {
        id: 7,
        name: 'Fatima Khan',
        skill: 'Event Decorator',
        category: 'events',
        rating: 4.8,
        reviews: 92,
        price: '₹5000-25000',
        bulkDiscount: '15%',
        capacity: '10 events/month',
        location: 'Lucknow',
        tags: ['Corporate Events', 'Full Service', 'Professional'],
        image: 'Dashboard/buyer/atisian profile/corporate event.jpg',
        favorite: false
    },
    {
        id: 8,
        name: 'Priya Sharma',
        skill: 'Corporate Baker',
        category: 'food',
        rating: 4.9,
        reviews: 156,
        price: '₹250-1500',
        bulkDiscount: '25%',
        capacity: '1000 units/week',
        location: 'Mumbai',
        tags: ['Bulk Orders', 'Corporate Gifts', 'Custom Branding'],
        image: 'Dashboard/buyer/atisian profile/corporate baker.jpg',
        favorite: false
    }
];

// Load artisans into grid
function loadArtisans(filter = 'all') {
    const grid = document.getElementById('artisanGrid');
    grid.innerHTML = '';
    
    let filteredArtisans = artisans;
    
    if (filter !== 'all') {
        filteredArtisans = artisans.filter(a => a.category === filter);
    }
    
    filteredArtisans.forEach(artisan => {
        const card = createArtisanCard(artisan);
        grid.appendChild(card);
    });
}

// Create artisan card element
function createArtisanCard(artisan) {
    const card = document.createElement('div');
    card.className = 'artisan-card';
    card.onclick = () => viewArtisanDetails(artisan.id);
    
    card.innerHTML = `
        <img src="${artisan.image}" alt="${artisan.name}" class="artisan-image" onerror="this.src='https://via.placeholder.com/300x200/1976d2/FFFFFF?text=${artisan.name}'">
        <div class="artisan-content">
            <div class="artisan-header">
                <div class="artisan-info">
                    <h3>${artisan.name}</h3>
                    <p class="artisan-skill">${artisan.skill}</p>
                </div>
                <button class="favorite-btn ${artisan.favorite ? 'active' : ''}" onclick="toggleFavorite(event, ${artisan.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="artisan-rating">
                <span class="stars">
                    ${'★'.repeat(Math.floor(artisan.rating))}${'☆'.repeat(5 - Math.floor(artisan.rating))}
                </span>
                <span class="rating-text">${artisan.rating} (${artisan.reviews} reviews)</span>
            </div>
            <div style="margin-bottom: 12px;">
                <div style="font-size: 13px; color: #666; margin-bottom: 5px;">
                    <i class="fas fa-box"></i> Capacity: ${artisan.capacity}
                </div>
                <div style="font-size: 13px; color: #10b981; font-weight: 600;">
                    <i class="fas fa-tag"></i> Bulk Discount: ${artisan.bulkDiscount}
                </div>
            </div>
            <div class="artisan-tags">
                ${artisan.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="artisan-footer">
                <span class="price">${artisan.price}</span>
                <div class="action-buttons">
                    <button class="btn-contact" onclick="contactArtisan(event, ${artisan.id})">
                        <i class="fas fa-file-invoice"></i> Request Quote
                    </button>
                    <button class="btn-message" onclick="sendWhatsAppMessage(event, ${artisan.id})">
                        <i class="fab fa-whatsapp"></i> Send Message
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Filter by category
function filterByCategory(category) {
    // Update category buttons if they exist
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        // Check if this item matches the category
        const itemCategory = item.getAttribute('data-category') || item.textContent.toLowerCase();
        if (itemCategory.includes(category) || category === 'all') {
            item.classList.add('active');
        }
    });
    
    // Load artisans for the category
    loadArtisans(category);
    
    console.log('✅ Filtered to category:', category);
}

// Toggle favorite
function toggleFavorite(event, artisanId) {
    event.stopPropagation();
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
        artisan.favorite = !artisan.favorite;
        loadArtisans();
        showNotification(
            artisan.favorite ? '❤️ Added to favorites!' : 'Removed from favorites',
            artisan.favorite ? 'success' : 'info'
        );
    }
}

// Contact artisan via WhatsApp
function contactArtisan(event, artisanId) {
    event.stopPropagation();
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
        // Get corporate user data
        const userData = localStorage.getItem('shebalance_user');
        const user = userData ? JSON.parse(userData) : { name: 'Corporate Buyer' };
        
        // Your WhatsApp number
        const whatsappNumber = '917666544797'; // Your number
        
        // Create custom message
        const message = `Hello! I'm ${user.name} from ${user.company || 'my company'}.

I'm interested in requesting a quote for bulk orders from *${artisan.name}* (${artisan.skill}).

*Details:*
• Artisan: ${artisan.name}
• Skill: ${artisan.skill}
• Location: ${artisan.location}
• Capacity: ${artisan.capacity}
• Bulk Discount: ${artisan.bulkDiscount}
• Price Range: ${artisan.price}

I would like to discuss:
- Bulk order pricing
- Delivery timelines
- Customization options
- Quality assurance

Please connect me with ${artisan.name} or provide more information.

Thank you!`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappURL, '_blank');
        
        showNotification(`📱 Opening WhatsApp to request quote from ${artisan.name}...`, 'success');
    }
}

// Send direct WhatsApp message
function sendWhatsAppMessage(event, artisanId) {
    event.stopPropagation();
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
        // Get corporate user data
        const userData = localStorage.getItem('shebalance_user');
        const user = userData ? JSON.parse(userData) : { name: 'Corporate Buyer' };
        
        // Your WhatsApp number (replace with your actual number)
        const whatsappNumber = '917666544797'; // Your number
        
        // Create custom message for general inquiry
        const message = `Hi! I'm ${user.name} from ${user.company || 'my company'}.

I came across *${artisan.name}*'s profile on SheBalance and I'm interested in learning more about their ${artisan.skill} services.

*Artisan Profile:*
• Name: ${artisan.name}
• Skill: ${artisan.skill}
• Location: ${artisan.location}
• Rating: ${artisan.rating}⭐ (${artisan.reviews} reviews)

I'd like to discuss potential collaboration opportunities.

Looking forward to connecting!`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappURL, '_blank');
        
        showNotification(`💬 Opening WhatsApp to message ${artisan.name}...`, 'success');
    }
}

// View artisan details - Opens portfolio modal
function viewArtisanDetails(artisanId) {
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
        openPortfolioModal(artisan.category, artisan.name);
    }
}

// Quick actions
function createBulkOrder() {
    window.location.href = 'corporate-bulk-orders.html';
}

function requestQuote() {
    showNotification('📄 Opening quote request form...', 'info');
}

function viewContracts() {
    window.location.href = 'corporate-contracts.html';
}

function viewInvoices() {
    window.location.href = 'corporate-invoices.html';
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('active');
}

// Toggle notifications
function toggleNotifications() {
    showNotification('🔔 You have 5 new notifications', 'info');
}

// Logout function
function logout() {
    localStorage.removeItem('shebalance_user');
    localStorage.removeItem('shebalance_new_signup');
    showNotification('👋 Logging out...', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Go to dashboard (for navigation)
function goToDashboard() {
    const userData = localStorage.getItem('shebalance_user');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'corporate') {
            window.location.href = 'corporate-dashboard.html';
        } else if (user.role === 'buyer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterArtisansBySearch(searchTerm);
        });
    }
    
    // Close user menu when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.getElementById('userMenu');
        const userProfile = document.querySelector('.user-profile');
        
        if (userMenu && !userMenu.contains(event.target) && !userProfile.contains(event.target)) {
            userMenu.classList.remove('active');
        }
    });
}

// Filter artisans by search
function filterArtisansBySearch(searchTerm) {
    const grid = document.getElementById('artisanGrid');
    const cards = grid.querySelectorAll('.artisan-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);


// Portfolio Data with Labour Hours and Portfolio Images
const portfolioData = {
    embroidery: [
        {
            image: 'Dashboard/buyer/portfolio/portfolio%20img%201.jpg',
            title: 'Traditional Embroidered Saree',
            description: 'Intricate hand embroidery with traditional motifs. Scalable for bulk orders through Virtual Factory network.',
            householdHours: 40,
            craftHours: 12,
            price: 8500,
            bulkPrice: 7200,
            justification: 'Premium pricing reflects 52 hours of dedication per piece. Bulk discounts available for orders of 50+ units.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%20img%202.jpg',
            title: 'Embroidered Cushion Covers',
            description: 'Set of 4 cushion covers with floral patterns. Perfect for corporate gifting.',
            householdHours: 35,
            craftHours: 8,
            price: 3200,
            bulkPrice: 2800,
            justification: '43 hours of multitasking dedication per set. Volume pricing for orders of 100+ sets.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%20img%203.jpg',
            title: 'Designer Blouse Work',
            description: 'Custom embroidery for designer blouses with intricate patterns.',
            householdHours: 30,
            craftHours: 10,
            price: 4500,
            bulkPrice: 3800,
            justification: '40 hours of skilled craftsmanship. Bulk orders for boutiques available.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%20img%204.jpg',
            title: 'Wall Hanging Art',
            description: 'Decorative embroidered wall hangings for home and office decor.',
            householdHours: 25,
            craftHours: 15,
            price: 5500,
            bulkPrice: 4700,
            justification: '40 hours of artistic dedication. Corporate bulk orders welcome.'
        }
    ],
    weaving: [
        {
            image: 'Dashboard/buyer/portfolio/portfolio%202%20img%201.jpg',
            title: 'Handwoven Silk Shawl',
            description: 'Pure silk shawl with traditional weaving patterns. Ideal for executive gifts.',
            householdHours: 45,
            craftHours: 30,
            price: 15000,
            bulkPrice: 13500,
            justification: '75 hours of patient dedication per piece. Collaborative production available for large orders.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%202%20img%202.jpg',
            title: 'Traditional Handloom Saree',
            description: 'Authentic handloom saree with intricate border work.',
            householdHours: 50,
            craftHours: 35,
            price: 18000,
            bulkPrice: 16000,
            justification: '85 hours of traditional weaving expertise. Bulk orders for corporate gifting.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%202img%203.jpg',
            title: 'Cotton Handloom Fabric',
            description: 'Premium cotton fabric with traditional patterns for tailoring.',
            householdHours: 40,
            craftHours: 25,
            price: 8000,
            bulkPrice: 7000,
            justification: '65 hours per piece. Volume discounts for fashion designers.'
        },
        {
            image: 'Dashboard/buyer/portfolio/potfolio%202%20img%204.jpg',
            title: 'Designer Stole Collection',
            description: 'Handwoven designer stoles perfect for corporate gifts.',
            householdHours: 35,
            craftHours: 20,
            price: 6500,
            bulkPrice: 5500,
            justification: '55 hours of craftsmanship. Minimum order: 50 pieces.'
        }
    ],
    food: [
        {
            image: 'Dashboard/buyer/portfolio/cooking%20portfolio.jpg',
            title: 'Corporate Catering Service',
            description: 'Authentic home-cooked meals for corporate events and daily office catering.',
            householdHours: 38,
            craftHours: 5,
            price: 1200,
            bulkPrice: 950,
            justification: 'Fresh, authentic flavors with consistent quality. Scalable for events up to 500 people.'
        },
        {
            image: 'Dashboard/buyer/portfolio/vegthali.webp',
            title: 'Traditional Thali Service',
            description: 'Complete traditional vegetarian meals with multiple dishes.',
            householdHours: 35,
            craftHours: 6,
            price: 800,
            bulkPrice: 650,
            justification: 'Authentic home-style cooking. Daily catering contracts available.'
        },
        {
            image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800',
            title: 'Corporate Gift Hampers',
            description: 'Traditional pickles and preserves in premium packaging for corporate gifting.',
            householdHours: 40,
            craftHours: 8,
            price: 800,
            bulkPrice: 650,
            justification: 'Artisanal quality with bulk order capabilities. Minimum order: 100 units.'
        },
        {
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
            title: 'Premium Bakery Items',
            description: 'Fresh baked goods for corporate events and gifting.',
            householdHours: 30,
            craftHours: 10,
            price: 1500,
            bulkPrice: 1200,
            justification: 'Made fresh daily. Bulk orders for events and celebrations.'
        }
    ],
    pottery: [
        {
            image: 'Dashboard/buyer/portfolio/portfolio%203%20img%201.jpg',
            title: 'Handcrafted Pottery Set',
            description: 'Traditional pottery items for corporate decor and gifting.',
            householdHours: 42,
            craftHours: 20,
            price: 5500,
            bulkPrice: 4800,
            justification: '62 hours of skilled craftsmanship. Virtual Factory network enables large-scale production.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%203%20img%202.jpg',
            title: 'Decorative Vases',
            description: 'Handmade decorative pottery vases for office spaces.',
            householdHours: 35,
            craftHours: 18,
            price: 4200,
            bulkPrice: 3600,
            justification: '53 hours of artistic work. Bulk orders for corporate offices.'
        },
        {
            image: 'Dashboard/buyer/portfolio/potfolio%203%20img%203.jpg',
            title: 'Artisan Clay Pots',
            description: 'Traditional clay pots for home and office decoration.',
            householdHours: 30,
            craftHours: 15,
            price: 3500,
            bulkPrice: 3000,
            justification: '45 hours of traditional pottery skills. Bulk orders available.'
        },
        {
            image: 'Dashboard/buyer/portfolio/portfolio%203%20img%204.jpg',
            title: 'Handmade Ceramic Collection',
            description: 'Beautiful ceramic pieces for corporate gifting.',
            householdHours: 38,
            craftHours: 22,
            price: 6000,
            bulkPrice: 5200,
            justification: '60 hours of ceramic artistry. Custom designs for bulk orders.'
        }
    ],
    tailoring: [
        {
            image: 'dataset%20images/tailoring/advanced/1000054624.jpg',
            title: 'Corporate Uniform Tailoring',
            description: 'Professional uniform tailoring for corporate offices and hospitality.',
            householdHours: 35,
            craftHours: 8,
            price: 2500,
            bulkPrice: 2000,
            justification: '43 hours per piece. Bulk orders for 100+ uniforms available.'
        },
        {
            image: 'dataset%20images/tailoring/advanced/1000054625.jpg',
            title: 'Custom Business Attire',
            description: 'Tailored business suits and formal wear for executives.',
            householdHours: 40,
            craftHours: 12,
            price: 4500,
            bulkPrice: 3800,
            justification: '52 hours of precision tailoring. Corporate bulk orders welcome.'
        },
        {
            image: 'dataset%20images/tailoring/advanced/1000054626.jpg',
            title: 'Traditional Wear Tailoring',
            description: 'Custom tailoring for traditional and ethnic wear.',
            householdHours: 38,
            craftHours: 10,
            price: 3200,
            bulkPrice: 2700,
            justification: '48 hours of skilled work. Volume discounts for events.'
        },
        {
            image: 'dataset%20images/tailoring/advanced/1000054627.jpg',
            title: 'Alterations & Fitting Services',
            description: 'Professional alterations and custom fitting for all garments.',
            householdHours: 30,
            craftHours: 6,
            price: 1500,
            bulkPrice: 1200,
            justification: '36 hours of detailed work. Fast turnaround for bulk orders.'
        }
    ],
    jewelry: [
        {
            image: 'dataset%20images/crafts/advanced/1000055349.jpg',
            title: 'Handmade Jewelry Collection',
            description: 'Traditional jewelry pieces perfect for corporate gifts and events.',
            householdHours: 38,
            craftHours: 10,
            price: 4200,
            bulkPrice: 3600,
            justification: '48 hours of artisan dedication. Customization available for bulk orders.'
        },
        {
            image: 'dataset%20images/crafts/advanced/1000055350.jpg',
            title: 'Corporate Gift Jewelry',
            description: 'Elegant jewelry sets ideal for employee appreciation and client gifts.',
            householdHours: 40,
            craftHours: 12,
            price: 5500,
            bulkPrice: 4700,
            justification: '52 hours of craftsmanship. Volume discounts for 100+ pieces.'
        },
        {
            image: 'dataset%20images/crafts/advanced/1000055360.jpg',
            title: 'Artisan Accessories',
            description: 'Handcrafted accessories and decorative jewelry for corporate events.',
            householdHours: 35,
            craftHours: 15,
            price: 3800,
            bulkPrice: 3200,
            justification: '50 hours of detailed work. Bulk orders for corporate gifting.'
        },
        {
            image: 'dataset%20images/crafts/advanced/1000055361.jpg',
            title: 'Premium Jewelry Sets',
            description: 'Exclusive jewelry collections for high-end corporate gifts.',
            householdHours: 42,
            craftHours: 18,
            price: 6500,
            bulkPrice: 5800,
            justification: '60 hours of premium craftsmanship. Custom designs available.'
        }
    ],
    events: [
        {
            image: 'Dashboard/buyer/portfolio/event.jpg',
            title: 'Corporate Event Decoration',
            description: 'Full-service event decoration for corporate functions and celebrations.',
            householdHours: 45,
            craftHours: 20,
            price: 15000,
            bulkPrice: 13000,
            justification: '65 hours of creative planning and execution. Multiple events discounts available.'
        },
        {
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            title: 'Conference & Seminar Setup',
            description: 'Professional setup and decoration for corporate conferences and seminars.',
            householdHours: 40,
            craftHours: 15,
            price: 12000,
            bulkPrice: 10000,
            justification: '55 hours of professional service. Bulk booking discounts for annual contracts.'
        },
        {
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            title: 'Product Launch Events',
            description: 'Creative decoration and setup for product launches and brand events.',
            householdHours: 50,
            craftHours: 25,
            price: 20000,
            bulkPrice: 18000,
            justification: '75 hours of premium event management. Custom themes available.'
        },
        {
            image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
            title: 'Team Building Events',
            description: 'Fun and engaging decoration for team building and corporate celebrations.',
            householdHours: 35,
            craftHours: 12,
            price: 10000,
            bulkPrice: 8500,
            justification: '47 hours of creative work. Package deals for multiple events.'
        }
    ]
};

let currentPortfolioIndex = 0;
let currentPortfolioCategory = '';

// Open portfolio modal
function openPortfolioModal(category, artisanName) {
    currentPortfolioCategory = category;
    currentPortfolioIndex = 0;
    
    const modal = document.getElementById('portfolioModal');
    const title = document.getElementById('portfolioTitle');
    
    title.textContent = `${artisanName}'s Portfolio - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    loadPortfolioItems();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close portfolio modal
function closePortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Load portfolio items
function loadPortfolioItems() {
    const container = document.getElementById('portfolioItemContainer');
    const dotsContainer = document.getElementById('carouselDots');
    const items = portfolioData[currentPortfolioCategory] || [];
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">No portfolio items available.</p>';
        return;
    }
    
    container.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    items.forEach((item, index) => {
        const totalHours = item.householdHours + item.craftHours;
        
        const portfolioItem = document.createElement('div');
        portfolioItem.className = `portfolio-item ${index === 0 ? 'active' : ''}`;
        portfolioItem.innerHTML = `
            <div class="portfolio-image-wrapper">
                <img src="${item.image}" alt="${item.title}">
                <div class="labour-aura-overlay"></div>
            </div>
            <div class="portfolio-details">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                
                <div class="labour-breakdown">
                    <h4><i class="fas fa-heart"></i> Labour Aura Visualization</h4>
                    <div class="time-investment">
                        ${item.householdHours}h household + ${item.craftHours}h craft = ${totalHours}h total investment
                    </div>
                    <p style="color: #666; font-style: italic; text-align: center; margin-top: 10px;">
                        "Every piece represents dedication, patience, and the invisible labor of balancing 
                        family responsibilities with skilled craftsmanship. Collective labour hours scale through 
                        our Virtual Factory network for large orders."
                    </p>
                </div>
                
                <div class="price-justification">
                    <div>
                        <div class="price">₹${item.price.toLocaleString('en-IN')}</div>
                        <div style="font-size: 14px; color: #2E7D32; margin-top: 5px;">
                            Bulk: ₹${item.bulkPrice.toLocaleString('en-IN')} per unit
                        </div>
                    </div>
                    <div class="justification">
                        <i class="fas fa-info-circle"></i> ${item.justification}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(portfolioItem);
        
        // Create dot
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToPortfolioItem(index);
        dotsContainer.appendChild(dot);
    });
}

// Navigate to specific portfolio item
function goToPortfolioItem(index) {
    const items = portfolioData[currentPortfolioCategory] || [];
    if (index < 0 || index >= items.length) return;
    
    currentPortfolioIndex = index;
    
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const dots = document.querySelectorAll('.dot');
    
    portfolioItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Previous portfolio item
function prevPortfolioItem() {
    const items = portfolioData[currentPortfolioCategory] || [];
    currentPortfolioIndex = (currentPortfolioIndex - 1 + items.length) % items.length;
    goToPortfolioItem(currentPortfolioIndex);
}

// Next portfolio item
function nextPortfolioItem() {
    const items = portfolioData[currentPortfolioCategory] || [];
    currentPortfolioIndex = (currentPortfolioIndex + 1) % items.length;
    goToPortfolioItem(currentPortfolioIndex);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('portfolioModal');
    if (event.target === modal) {
        closePortfolioModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('portfolioModal');
    if (modal.style.display === 'block') {
        if (event.key === 'ArrowLeft') {
            prevPortfolioItem();
        } else if (event.key === 'ArrowRight') {
            nextPortfolioItem();
        } else if (event.key === 'Escape') {
            closePortfolioModal();
        }
    }
});


// Corporate Carousel Functionality
let corporateCurrentSlide = 0;
let corporateAutoPlayInterval;

function moveCorporateCarousel(direction) {
    const track = document.getElementById('corporateCarouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    corporateCurrentSlide += direction;
    
    if (corporateCurrentSlide < 0) {
        corporateCurrentSlide = totalSlides - 1;
    } else if (corporateCurrentSlide >= totalSlides) {
        corporateCurrentSlide = 0;
    }
    
    updateCorporateCarousel();
}

function updateCorporateCarousel() {
    const track = document.getElementById('corporateCarouselTrack');
    const indicators = document.querySelectorAll('#corporateIndicators .carousel-indicator');
    
    if (track) {
        track.style.transform = `translateX(-${corporateCurrentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        if (index === corporateCurrentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function initCorporateCarousel() {
    const track = document.getElementById('corporateCarouselTrack');
    const indicatorsContainer = document.getElementById('corporateIndicators');
    
    if (track && indicatorsContainer) {
        const slides = track.querySelectorAll('.carousel-slide');
        
        // Create indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.onclick = () => {
                corporateCurrentSlide = index;
                updateCorporateCarousel();
                resetCorporateAutoPlay();
            };
            indicatorsContainer.appendChild(indicator);
        });
        
        // Start auto-play
        startCorporateAutoPlay();
    }
}

function startCorporateAutoPlay() {
    corporateAutoPlayInterval = setInterval(() => {
        moveCorporateCarousel(1);
    }, 5000); // Change slide every 5 seconds
}

function resetCorporateAutoPlay() {
    clearInterval(corporateAutoPlayInterval);
    startCorporateAutoPlay();
}

// Initialize corporate carousel on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCorporateCarousel);
} else {
    initCorporateCarousel();
}
