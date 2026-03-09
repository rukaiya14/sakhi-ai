// Buyer Favorites JavaScript

// Sample artisan data (same as buyer-dashboard)
const allArtisans = [
    {
        id: 1,
        name: 'Sunita Devi',
        skill: 'Embroidery Specialist',
        category: 'embroidery',
        rating: 4.9,
        reviews: 127,
        price: '₹500-2000',
        location: 'Mumbai',
        tags: ['Hand Embroidery', 'Traditional', 'Custom Orders'],
        image: 'image1.jpg',
        favorite: true
    },
    {
        id: 2,
        name: 'Meera Patel',
        skill: 'Weaving Artist',
        category: 'weaving',
        rating: 4.8,
        reviews: 89,
        price: '₹800-3000',
        location: 'Gujarat',
        tags: ['Handloom', 'Silk', 'Cotton'],
        image: 'image2.jpg',
        favorite: true
    },
    {
        id: 3,
        name: 'Anjali Verma',
        skill: 'Tailoring Expert',
        category: 'embroidery',
        rating: 4.9,
        reviews: 234,
        price: '₹400-1800',
        location: 'Bangalore',
        tags: ['Custom Fit', 'Alterations', 'Designer Wear'],
        image: 'image3.jpg',
        favorite: false
    },
    {
        id: 4,
        name: 'Lakshmi Reddy',
        skill: 'Home Chef',
        category: 'food',
        rating: 4.6,
        reviews: 78,
        price: '₹200-1000',
        location: 'Hyderabad',
        tags: ['Tiffin Service', 'Catering', 'South Indian'],
        image: 'image4.jpeg',
        favorite: true
    },
    {
        id: 5,
        name: 'Priya Sharma',
        skill: 'Baker & Pastry Chef',
        category: 'food',
        rating: 4.9,
        reviews: 156,
        price: '₹300-2000',
        location: 'Mumbai',
        tags: ['Custom Cakes', 'Cookies', 'Desserts'],
        image: 'image5.jpg',
        favorite: false
    }
];

let favorites = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadFavorites();
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
    
    if (user.role !== 'buyer' && user.role !== 'corporate') {
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

// Load favorites
function loadFavorites() {
    // Try to load from localStorage
    const storedFavorites = localStorage.getItem('shebalance_favorites');
    
    if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        favorites = allArtisans.filter(a => favoriteIds.includes(a.id));
    } else {
        // Use default favorites from sample data
        favorites = allArtisans.filter(a => a.favorite);
        saveFavorites();
    }
    
    displayFavorites();
}

// Save favorites to localStorage
function saveFavorites() {
    const favoriteIds = favorites.map(f => f.id);
    localStorage.setItem('shebalance_favorites', JSON.stringify(favoriteIds));
}

// Display favorites
function displayFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (favorites.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    favorites.forEach(artisan => {
        const card = createArtisanCard(artisan);
        grid.appendChild(card);
    });
}

// Create artisan card element
function createArtisanCard(artisan) {
    const card = document.createElement('div');
    card.className = 'artisan-card';
    
    card.innerHTML = `
        <img src="${artisan.image}" alt="${artisan.name}" class="artisan-image" onerror="this.src='https://via.placeholder.com/300x200/${artisan.category === 'embroidery' ? '8D6E63' : artisan.category === 'weaving' ? '5D4037' : 'CC5500'}/FFFFFF?text=${artisan.name}'">
        <div class="artisan-content">
            <div class="artisan-header">
                <div class="artisan-info">
                    <h3>${artisan.name}</h3>
                    <p class="artisan-skill">${artisan.skill}</p>
                </div>
                <button class="favorite-btn" onclick="removeFromFavorites(event, ${artisan.id})" title="Remove from favorites">
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
        </div>
    `;
    
    // Add click handler to card (but not on buttons)
    card.addEventListener('click', function(e) {
        if (!e.target.closest('button')) {
            viewArtisanDetails(artisan.id);
        }
    });
    
    return card;
}

// Remove from favorites
function removeFromFavorites(event, artisanId) {
    event.stopPropagation();
    
    favorites = favorites.filter(f => f.id !== artisanId);
    saveFavorites();
    displayFavorites();
    
    showNotification('Removed from favorites', 'info');
}

// Contact artisan
function contactArtisan(event, artisanId) {
    event.stopPropagation();
    const artisan = favorites.find(a => a.id === artisanId);
    if (artisan) {
        showNotification(`📧 Opening chat with ${artisan.name}...`, 'info');
        setTimeout(() => {
            showNotification('✅ Message sent! They will respond shortly.', 'success');
        }, 1500);
    }
}

// View artisan details
function viewArtisanDetails(artisanId) {
    const artisan = favorites.find(a => a.id === artisanId);
    if (artisan) {
        showNotification(`📋 Loading ${artisan.name}'s profile...`, 'info');
        // In a real app, this would navigate to a detailed profile page
        setTimeout(() => {
            window.location.href = 'buyer-dashboard.html';
        }, 1000);
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
    // Close user menu when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.getElementById('userMenu');
        const userProfile = document.querySelector('.user-profile');
        
        if (userMenu && !userMenu.contains(event.target) && !userProfile.contains(event.target)) {
            userMenu.classList.remove('active');
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
        background: ${type === 'success' ? '#2E7D32' : type === 'error' ? '#ef4444' : '#5D4037'};
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
