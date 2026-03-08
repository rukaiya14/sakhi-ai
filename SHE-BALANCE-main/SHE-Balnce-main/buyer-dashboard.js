// Buyer Dashboard JavaScript

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
        // Not logged in, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Check if user has buyer or corporate role
    if (user.role !== 'buyer' && user.role !== 'corporate') {
        // Wrong dashboard, redirect to appropriate one
        if (user.role === 'admin') {
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

// Sample artisan data
const artisans = [
    {
        id: 1,
        name: 'Sunita Devi',
        skill: 'Embroidery Specialist',
        category: 'embroidery',
        rating: 4.9,
        reviews: 127,
        price: '₹500-2000',
        pricePerPiece: 500,
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Hand Embroidery', 'Traditional', 'Custom Orders'],
        image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134417.png',
        orders: 156,
        favorite: false,
        phone: '+91-9876543210',
        email: 'sunita.devi@shebalance.com',
        whatsapp: '+91-9876543210'
    },
    {
        id: 2,
        name: 'Meera Patel',
        skill: 'Weaving Artist',
        category: 'weaving',
        rating: 4.8,
        reviews: 89,
        price: '₹800-3000',
        pricePerPiece: 800,
        location: 'Gujarat',
        skillLevel: 'Advanced',
        tags: ['Handloom', 'Silk', 'Cotton'],
        image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131342.png',
        orders: 98,
        favorite: false,
        phone: '+91-9876543221',
        email: 'meera.patel@shebalance.com',
        whatsapp: '+91-9876543221'
    },
    {
        id: 3,
        name: 'Anjali Verma',
        skill: 'Tailoring Expert',
        category: 'embroidery',
        rating: 4.9,
        reviews: 234,
        price: '₹400-1800',
        pricePerPiece: 400,
        location: 'Bangalore',
        skillLevel: 'Expert',
        tags: ['Custom Fit', 'Alterations', 'Designer Wear'],
        image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134450.png',
        orders: 312,
        favorite: false,
        phone: '+91-9876543232',
        email: 'anjali.verma@shebalance.com',
        whatsapp: '+91-9876543232'
    },
    {
        id: 4,
        name: 'Lakshmi Reddy',
        skill: 'Home Chef',
        category: 'food',
        rating: 4.6,
        reviews: 78,
        price: '₹200-1000',
        pricePerPiece: 200,
        location: 'Hyderabad',
        skillLevel: 'Intermediate',
        tags: ['Tiffin Service', 'Catering', 'South Indian'],
        image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 130937.png',
        orders: 145,
        favorite: false,
        phone: '+91-9876543243',
        email: 'lakshmi.reddy@shebalance.com',
        whatsapp: '+91-9876543243'
    },
    {
        id: 5,
        name: 'Priya Sharma',
        skill: 'Baker & Pastry Chef',
        category: 'bakery',
        rating: 4.9,
        reviews: 156,
        price: '₹300-2000',
        pricePerPiece: 300,
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Custom Cakes', 'Cookies', 'Desserts'],
        image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 123738.png',
        orders: 289,
        favorite: false,
        phone: '+91-9876543254',
        email: 'priya.sharma@shebalance.com',
        whatsapp: '+91-9876543254'
    },
    {
        id: 6,
        name: 'Kavita Desai',
        skill: 'Henna Artist',
        category: 'henna',
        rating: 4.8,
        reviews: 142,
        price: '₹500-1500',
        pricePerPiece: 500,
        location: 'Jaipur',
        skillLevel: 'Expert',
        tags: ['Bridal Mehndi', 'Arabic Design', 'Traditional Patterns'],
        image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124505.png',
        orders: 178,
        favorite: false,
        phone: '+91-9876543265',
        email: 'kavita.desai@shebalance.com',
        whatsapp: '+91-9876543265'
    },
    {
        id: 7,
        name: 'Aarti Kulkarni',
        skill: 'Mehndi Specialist',
        category: 'henna',
        rating: 4.7,
        reviews: 98,
        price: '₹400-1200',
        pricePerPiece: 400,
        location: 'Pune',
        skillLevel: 'Advanced',
        tags: ['Party Bookings', 'Contemporary Designs', 'Quick Service'],
        image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124627.png',
        orders: 134,
        favorite: false,
        phone: '+91-9876543276',
        email: 'aarti.kulkarni@shebalance.com',
        whatsapp: '+91-9876543276'
    },
    {
        id: 8,
        name: 'Radha Iyer',
        skill: 'Henna Artist',
        category: 'henna',
        rating: 5.0,
        reviews: 87,
        price: '₹600-1500',
        pricePerPiece: 600,
        location: 'Chennai',
        skillLevel: 'Expert',
        tags: ['Bridal Mehndi', 'Traditional Patterns', 'Intricate Work'],
        image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124918.png',
        orders: 156,
        favorite: false,
        phone: '+91-9876543287',
        email: 'radha.iyer@shebalance.com',
        whatsapp: '+91-9876543287'
    },
    {
        id: 9,
        name: 'Geeta Nair',
        skill: 'Tailoring Specialist',
        category: 'tailoring',
        rating: 4.8,
        reviews: 165,
        price: '₹400-1500',
        pricePerPiece: 400,
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Custom Fit', 'Blouse Stitching', 'Alterations', 'Quick Service'],
        image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 132951.png',
        orders: 234,
        favorite: false,
        phone: '+91-9876543298',
        email: 'geeta.nair@shebalance.com',
        whatsapp: '+91-9876543298'
    },
    {
        id: 10,
        name: 'Rekha Menon',
        skill: 'Designer Tailor',
        category: 'tailoring',
        rating: 4.9,
        reviews: 198,
        price: '₹500-1500',
        pricePerPiece: 500,
        location: 'Bangalore',
        skillLevel: 'Expert',
        tags: ['Designer Wear', 'Custom Fit', 'Bridal Alterations', 'Premium Fabrics'],
        image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133004.png',
        orders: 267,
        favorite: false,
        phone: '+91-9876543309',
        email: 'rekha.menon@shebalance.com',
        whatsapp: '+91-9876543309'
    },
    {
        id: 11,
        name: 'Sarita Joshi',
        skill: 'Stitching Expert',
        category: 'tailoring',
        rating: 4.6,
        reviews: 142,
        price: '₹300-1200',
        pricePerPiece: 300,
        location: 'Delhi',
        skillLevel: 'Advanced',
        tags: ['Alterations', 'Quick Service', 'Custom Fit', 'Affordable Pricing'],
        image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133138.png',
        orders: 189,
        favorite: false,
        phone: '+91-9876543310',
        email: 'sarita.joshi@shebalance.com',
        whatsapp: '+91-9876543310'
    },
    {
        id: 12,
        name: 'Nisha Kapoor',
        skill: 'Crochet Artist',
        category: 'crochet',
        rating: 4.8,
        reviews: 156,
        price: '₹600-2000',
        pricePerPiece: 600,
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Handmade', 'Custom Orders', 'Baby Items', 'Home Decor'],
        image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134626.png',
        orders: 178,
        favorite: false,
        phone: '+91-9876543321',
        email: 'nisha.kapoor@shebalance.com',
        whatsapp: '+91-9876543321'
    },
    {
        id: 13,
        name: 'Pooja Malhotra',
        skill: 'Knitting Specialist',
        category: 'crochet',
        rating: 4.7,
        reviews: 134,
        price: '₹500-1800',
        pricePerPiece: 500,
        location: 'Bangalore',
        skillLevel: 'Advanced',
        tags: ['Amigurumi', 'Blankets', 'Custom Orders', 'Handmade'],
        image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134639.png',
        orders: 145,
        favorite: false,
        phone: '+91-9876543332',
        email: 'pooja.malhotra@shebalance.com',
        whatsapp: '+91-9876543332'
    },
    {
        id: 14,
        name: 'Divya Rao',
        skill: 'Crochet & Knitting Expert',
        category: 'crochet',
        rating: 4.9,
        reviews: 187,
        price: '₹400-1500',
        pricePerPiece: 400,
        location: 'Pune',
        skillLevel: 'Expert',
        tags: ['Baby Items', 'Home Decor', 'Blankets', 'Custom Orders'],
        image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134814.png',
        orders: 203,
        favorite: false,
        phone: '+91-9876543343',
        email: 'divya.rao@shebalance.com',
        whatsapp: '+91-9876543343'
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
        <img src="${artisan.image}" alt="${artisan.name}" class="artisan-image" onerror="this.src='https://via.placeholder.com/300x200/667eea/FFFFFF?text=${artisan.name}'">
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
            <div class="artisan-tags">
                ${artisan.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="artisan-footer">
                <span class="price">${artisan.price}</span>
                <button class="btn-contact" onclick="contactArtisan(event, ${artisan.id})">
                    <i class="fas fa-envelope"></i> Contact
                </button>
            </div>
            <button class="btn-portfolio" onclick="openPortfolioModal('${artisan.category}', '${artisan.name}'); event.stopPropagation();">
                <i class="fas fa-images"></i> View Portfolio
            </button>
        </div>
    `;
    
    return card;
}

// Filter by category
function filterByCategory(category) {
    // Update active state
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.category-item').classList.add('active');
    
    // Load filtered artisans
    loadArtisans(category);
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

// Contact artisan
function contactArtisan(event, artisanId) {
    event.stopPropagation();
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
        // Redirect to message center with artisan ID
        window.location.href = `buyer-message-center.html?artisanId=${artisanId}`;
    }
}

// View artisan details
function viewArtisanDetails(artisanId) {
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
        showNotification(`📋 Loading ${artisan.name}'s profile...`, 'info');
        // In a real app, this would navigate to a detailed profile page
    }
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('active');
}

// Toggle notifications
function toggleNotifications() {
    showNotification('🔔 You have 3 new notifications', 'info');
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
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
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
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
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


// Portfolio Data with Labour Hours
const portfolioData = {
    embroidery: [
        {
            image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134417.png',
            title: 'Traditional Embroidered Saree',
            description: 'Intricate hand embroidery with traditional motifs',
            householdHours: 40,
            craftHours: 12,
            price: 8500,
            justification: 'Premium pricing reflects 52 hours of dedication, balancing household duties with skilled craftsmanship'
        },
        {
            image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134450.png',
            title: 'Embroidered Cushion Covers',
            description: 'Set of 4 cushion covers with floral patterns',
            householdHours: 35,
            craftHours: 8,
            price: 3200,
            justification: '43 hours of multitasking dedication, creating beauty while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134506.png',
            title: 'Designer Embroidered Dupatta',
            description: 'Elegant dupatta with contemporary embroidery designs',
            householdHours: 38,
            craftHours: 10,
            price: 4500,
            justification: '48 hours of artistic dedication, blending modern aesthetics with traditional craftsmanship'
        },
        {
            image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134523.png',
            title: 'Embroidered Wall Hanging',
            description: 'Decorative wall hanging with intricate embroidery work',
            householdHours: 36,
            craftHours: 15,
            price: 5500,
            justification: '51 hours of artistic dedication, creating stunning home decor while managing family responsibilities'
        }
    ],
    weaving: [
        {
            image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131342.png',
            title: 'Handwoven Silk Shawl',
            description: 'Pure silk shawl with traditional weaving patterns',
            householdHours: 45,
            craftHours: 30,
            price: 15000,
            justification: '75 hours of patient dedication, weaving threads while nurturing family - true artisan mastery'
        },
        {
            image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131356.png',
            title: 'Handloom Cotton Saree',
            description: 'Pure cotton saree with traditional handloom patterns',
            householdHours: 40,
            craftHours: 25,
            price: 8500,
            justification: '65 hours of meticulous weaving, creating timeless elegance while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131527.png',
            title: 'Traditional Weaving Patterns',
            description: 'Handwoven fabric showcasing traditional patterns',
            householdHours: 42,
            craftHours: 22,
            price: 7200,
            justification: '64 hours of skilled weaving, preserving traditional techniques while balancing household duties'
        },
        {
            image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131548.png',
            title: 'Silk Fabric Weaving',
            description: 'Premium silk fabric with intricate weaving work',
            householdHours: 44,
            craftHours: 28,
            price: 12000,
            justification: '72 hours of masterful weaving, creating luxurious fabric while managing family responsibilities'
        }
    ],
    food: [
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 130937.png',
            title: 'Traditional Thali Meal Service',
            description: 'Authentic home-cooked meals with love',
            householdHours: 38,
            craftHours: 5,
            price: 1200,
            justification: '43 hours weekly investment, bringing authentic flavors from a caring home kitchen'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 131030.png',
            title: 'Homemade Tiffin Service',
            description: 'Fresh daily meals prepared with traditional recipes',
            householdHours: 40,
            craftHours: 6,
            price: 1500,
            justification: '46 hours of culinary dedication, delivering nutritious home-cooked meals while managing household'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 131102.png',
            title: 'South Indian Specialties',
            description: 'Authentic South Indian dishes prepared with traditional methods',
            householdHours: 37,
            craftHours: 5,
            price: 1300,
            justification: '42 hours of culinary expertise, bringing regional flavors while balancing family responsibilities'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 131120.png',
            title: 'Daily Meal Packages',
            description: 'Nutritious daily meal packages for busy families',
            householdHours: 39,
            craftHours: 6,
            price: 1400,
            justification: '45 hours of dedicated meal preparation, nourishing families while managing household duties'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 133944.png',
            title: 'Homemade Pickles & Preserves',
            description: 'Traditional recipes passed through generations',
            householdHours: 35,
            craftHours: 8,
            price: 800,
            justification: '43 hours of culinary dedication, preserving tradition while managing household'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 134002.png',
            title: 'Traditional Snacks',
            description: 'Homemade traditional snacks and savories',
            householdHours: 34,
            craftHours: 7,
            price: 900,
            justification: '41 hours of culinary craftsmanship, creating delicious snacks while balancing family duties'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 134049.png',
            title: 'Catering Services',
            description: 'Professional catering for events and gatherings',
            householdHours: 42,
            craftHours: 10,
            price: 3500,
            justification: '52 hours of culinary dedication, creating memorable events while managing household responsibilities'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 134104.png',
            title: 'Festive Special Meals',
            description: 'Traditional festive meals prepared with authentic recipes',
            householdHours: 40,
            craftHours: 8,
            price: 2200,
            justification: '48 hours of festive preparation, bringing celebration flavors while balancing family duties'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 134219.png',
            title: 'Healthy Meal Options',
            description: 'Nutritious and balanced meal plans for health-conscious families',
            householdHours: 38,
            craftHours: 6,
            price: 1600,
            justification: '44 hours of mindful cooking, promoting wellness while managing household responsibilities'
        },
        {
            image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 134318.png',
            title: 'Party Food Platters',
            description: 'Delicious party platters for celebrations and gatherings',
            householdHours: 36,
            craftHours: 7,
            price: 2500,
            justification: '43 hours of culinary artistry, creating party delights while balancing family duties'
        }
    ],
    henna: [
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124505.png',
            title: 'Bridal Henna Design',
            description: 'Intricate bridal henna with traditional patterns',
            householdHours: 35,
            craftHours: 4,
            price: 3500,
            justification: '39 hours of weekly dedication, creating memorable art while balancing family duties'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124627.png',
            title: 'Party Henna Design',
            description: 'Beautiful henna designs for parties and celebrations',
            householdHours: 32,
            craftHours: 3,
            price: 1500,
            justification: '35 hours of artistic dedication, bringing joy to celebrations while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124918.png',
            title: 'Arabic Henna Patterns',
            description: 'Elegant Arabic-style henna designs',
            householdHours: 33,
            craftHours: 3,
            price: 1800,
            justification: '36 hours of artistic skill, creating beautiful patterns while balancing household duties'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124949.png',
            title: 'Traditional Mehndi',
            description: 'Classic traditional mehndi designs',
            householdHours: 34,
            craftHours: 4,
            price: 2000,
            justification: '38 hours of traditional artistry, preserving cultural heritage while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 125048.png',
            title: 'Contemporary Designs',
            description: 'Modern fusion henna designs',
            householdHours: 32,
            craftHours: 3,
            price: 1600,
            justification: '35 hours of creative innovation, blending tradition with modernity while balancing household duties'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 125102.png',
            title: 'Intricate Bridal Work',
            description: 'Detailed bridal henna with elaborate patterns',
            householdHours: 36,
            craftHours: 5,
            price: 4000,
            justification: '41 hours of meticulous artistry, creating bridal masterpieces while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 125125.png',
            title: 'Quick Party Designs',
            description: 'Fast and beautiful designs for party bookings',
            householdHours: 32,
            craftHours: 3,
            price: 1200,
            justification: '35 hours of efficient artistry, bringing joy to celebrations while balancing household duties'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 125151.png',
            title: 'Floral Henna Patterns',
            description: 'Beautiful floral-inspired henna designs',
            householdHours: 33,
            craftHours: 3,
            price: 1700,
            justification: '36 hours of artistic dedication, creating nature-inspired beauty while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 125204.png',
            title: 'Modern Fusion Designs',
            description: 'Contemporary henna with traditional elements',
            householdHours: 34,
            craftHours: 4,
            price: 1900,
            justification: '38 hours of creative fusion, bridging tradition and modernity while balancing household duties'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 130026.png',
            title: 'Full Hand Mehndi',
            description: 'Complete hand coverage with intricate patterns',
            householdHours: 35,
            craftHours: 4,
            price: 2500,
            justification: '39 hours of detailed artistry, creating stunning full-hand designs while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 130104.png',
            title: 'Minimalist Henna',
            description: 'Simple yet elegant minimalist designs',
            householdHours: 32,
            craftHours: 3,
            price: 1000,
            justification: '35 hours of refined artistry, creating elegant simplicity while balancing household duties'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 130200.png',
            title: 'Festive Special Designs',
            description: 'Special henna designs for festivals and celebrations',
            householdHours: 34,
            craftHours: 4,
            price: 2200,
            justification: '38 hours of festive artistry, celebrating traditions while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 130216.png',
            title: 'Engagement Henna',
            description: 'Beautiful henna designs for engagement ceremonies',
            householdHours: 35,
            craftHours: 4,
            price: 2800,
            justification: '39 hours of special occasion artistry, creating memorable designs while balancing household duties'
        }
    ],
    tailoring: [
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 132951.png',
            title: 'Custom Blouse Stitching',
            description: 'Perfectly fitted blouses with intricate detailing',
            householdHours: 38,
            craftHours: 6,
            price: 1200,
            justification: '44 hours of meticulous dedication, crafting perfect fits while managing household responsibilities'
        },
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133004.png',
            title: 'Salwar Kameez Alterations',
            description: 'Expert alterations for the perfect fit',
            householdHours: 35,
            craftHours: 4,
            price: 800,
            justification: '39 hours of skilled work, ensuring every stitch is perfect while balancing family duties'
        },
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133138.png',
            title: 'Designer Lehenga Alterations',
            description: 'Expert alterations for bridal and designer lehengas',
            householdHours: 36,
            craftHours: 8,
            price: 2500,
            justification: '44 hours of precision craftsmanship, perfecting bridal wear while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133151.png',
            title: 'Bridal Outfit Stitching',
            description: 'Complete bridal outfit stitching with intricate details',
            householdHours: 42,
            craftHours: 12,
            price: 5000,
            justification: '54 hours of bridal expertise, creating dream outfits while balancing household duties'
        },
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133437.png',
            title: 'Custom Fit Garments',
            description: 'Tailored garments for perfect fit and comfort',
            householdHours: 37,
            craftHours: 7,
            price: 1500,
            justification: '44 hours of tailoring precision, ensuring comfort and style while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133450.png',
            title: 'Traditional Wear Alterations',
            description: 'Expert alterations for traditional Indian wear',
            householdHours: 36,
            craftHours: 5,
            price: 1000,
            justification: '41 hours of skilled craftsmanship, preserving traditional elegance while balancing household duties'
        },
        {
            image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133511.png',
            title: 'Designer Wear Stitching',
            description: 'Custom stitching for designer outfits',
            householdHours: 40,
            craftHours: 10,
            price: 3500,
            justification: '50 hours of designer expertise, creating fashion statements while managing family responsibilities'
        }
    ],
    crochet: [
        {
            image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134626.png',
            title: 'Handmade Crochet Blanket',
            description: 'Cozy handcrafted blanket with intricate patterns',
            householdHours: 42,
            craftHours: 20,
            price: 3500,
            justification: '62 hours of patient dedication, creating warmth and comfort while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134639.png',
            title: 'Crochet Baby Set',
            description: 'Adorable handmade baby clothing set with matching accessories',
            householdHours: 36,
            craftHours: 8,
            price: 1800,
            justification: '44 hours of loving craftsmanship, creating precious items while balancing household duties'
        },
        {
            image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134814.png',
            title: 'Crochet Home Decor Set',
            description: 'Handmade crochet cushion covers and table runners',
            householdHours: 38,
            craftHours: 12,
            price: 2200,
            justification: '50 hours of creative dedication, beautifying homes while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134824.png',
            title: 'Amigurumi Toys',
            description: 'Cute handmade crochet toys and stuffed animals',
            householdHours: 35,
            craftHours: 10,
            price: 1500,
            justification: '45 hours of playful craftsmanship, creating joy for children while balancing household duties'
        },
        {
            image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134844.png',
            title: 'Crochet Cushion Covers',
            description: 'Beautiful handmade cushion covers in various designs',
            householdHours: 34,
            craftHours: 8,
            price: 1200,
            justification: '42 hours of decorative artistry, enhancing home comfort while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134903.png',
            title: 'Handmade Crochet Accessories',
            description: 'Stylish crochet bags, scarves, and accessories',
            householdHours: 36,
            craftHours: 9,
            price: 1600,
            justification: '45 hours of fashion craftsmanship, creating unique accessories while balancing household duties'
        }
    ],
    bakery: [
        {
            image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 123738.png',
            title: 'Custom Birthday Cake',
            description: 'Beautifully decorated custom cakes for special occasions',
            householdHours: 35,
            craftHours: 6,
            price: 2500,
            justification: '41 hours of sweet dedication, creating memorable celebrations while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 130443.png',
            title: 'Artisan Pastries & Cookies',
            description: 'Freshly baked pastries and cookies made with love',
            householdHours: 38,
            craftHours: 5,
            price: 1200,
            justification: '43 hours of baking passion, bringing joy through delicious treats while balancing household duties'
        },
        {
            image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 130451.png',
            title: 'Designer Cupcakes',
            description: 'Beautifully decorated cupcakes for all occasions',
            householdHours: 36,
            craftHours: 5,
            price: 1500,
            justification: '41 hours of creative baking, crafting sweet delights while managing family responsibilities'
        },
        {
            image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 130501.png',
            title: 'Specialty Breads',
            description: 'Artisan breads baked fresh daily',
            householdHours: 37,
            craftHours: 6,
            price: 800,
            justification: '43 hours of baking expertise, creating wholesome breads while balancing household duties'
        },
        {
            image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 130725.png',
            title: 'Wedding Cake Designs',
            description: 'Elegant multi-tier wedding cakes',
            householdHours: 40,
            craftHours: 15,
            price: 12000,
            justification: '55 hours of masterful baking, creating wedding dreams while managing family responsibilities'
        }
    ],
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
                        "Every piece tells a story of dedication, patience, and the invisible labor of balancing 
                        family responsibilities with skilled craftsmanship."
                    </p>
                </div>
                
                <div class="price-justification">
                    <div class="price">₹${item.price.toLocaleString('en-IN')}</div>
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

// Update artisan card generation to include View Portfolio button
function generateArtisanCard(artisan) {
    return `
        <div class="artisan-card" data-category="${artisan.category}">
            <div class="artisan-image">
                <img src="${artisan.image}" alt="${artisan.name}">
                <div class="artisan-badge">${artisan.skillLevel}</div>
            </div>
            <div class="artisan-info">
                <h3>${artisan.name}</h3>
                <p class="artisan-skill">${artisan.skill}</p>
                <div class="artisan-rating">
                    <i class="fas fa-star"></i>
                    <span>${artisan.rating}</span>
                    <span class="reviews">(${artisan.reviews} reviews)</span>
                </div>
                <div class="artisan-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${artisan.location}</span>
                    <span><i class="fas fa-shopping-bag"></i> ${artisan.orders} orders</span>
                </div>
                <div class="artisan-price">
                    <span class="price-label">Starting from</span>
                    <span class="price">₹${artisan.price}</span>
                </div>
                <div class="artisan-actions">
                    <button class="btn-primary" onclick="contactArtisan('${artisan.name}')">
                        <i class="fas fa-envelope"></i> Contact
                    </button>
                    <button class="btn-secondary" onclick="addToFavorites('${artisan.name}')">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <button class="btn-portfolio" onclick="openPortfolioModal('${artisan.category}', '${artisan.name}')">
                    <i class="fas fa-images"></i> View Portfolio
                </button>
            </div>
        </div>
    `;
}


// Buyer Carousel Functionality
let buyerCurrentSlide = 0;
let buyerAutoPlayInterval;

function moveBuyerCarousel(direction) {
    const track = document.getElementById('buyerCarouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    buyerCurrentSlide += direction;
    
    if (buyerCurrentSlide < 0) {
        buyerCurrentSlide = totalSlides - 1;
    } else if (buyerCurrentSlide >= totalSlides) {
        buyerCurrentSlide = 0;
    }
    
    updateBuyerCarousel();
}

function updateBuyerCarousel() {
    const track = document.getElementById('buyerCarouselTrack');
    const indicators = document.querySelectorAll('#buyerIndicators .carousel-indicator');
    
    if (track) {
        track.style.transform = `translateX(-${buyerCurrentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        if (index === buyerCurrentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function initBuyerCarousel() {
    const track = document.getElementById('buyerCarouselTrack');
    const indicatorsContainer = document.getElementById('buyerIndicators');
    
    if (track && indicatorsContainer) {
        const slides = track.querySelectorAll('.carousel-slide');
        
        // Create indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.onclick = () => {
                buyerCurrentSlide = index;
                updateBuyerCarousel();
                resetBuyerAutoPlay();
            };
            indicatorsContainer.appendChild(indicator);
        });
        
        // Start auto-play
        startBuyerAutoPlay();
    }
}

function startBuyerAutoPlay() {
    buyerAutoPlayInterval = setInterval(() => {
        moveBuyerCarousel(1);
    }, 5000); // Change slide every 5 seconds
}

function resetBuyerAutoPlay() {
    clearInterval(buyerAutoPlayInterval);
    startBuyerAutoPlay();
}

// Initialize buyer carousel on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuyerCarousel);
} else {
    initBuyerCarousel();
}

