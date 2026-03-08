// Buyer Message Center JavaScript

// Artisan data (same as buyer-dashboard.js)
const artisans = [
    {
        id: 1,
        name: 'Sunita Devi',
        skill: 'Embroidery Specialist',
        category: 'embroidery',
        rating: 4.9,
        reviews: 127,
        price: '₹500-2000',
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Hand Embroidery', 'Traditional', 'Custom Orders'],
        image: '../../Buyer Images/Embroidery/Screenshot 2026-02-26 134417.png',
        orders: 156,
        phone: '+91-9876543210',
        email: 'sunita.devi@shebalance.com',
        whatsapp: '+91-9876543210',
        address: {
            street: 'Shop No. 12, Andheri Market Complex',
            area: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400058'
        }
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
        skillLevel: 'Advanced',
        tags: ['Handloom', 'Silk', 'Cotton'],
        image: '../../Buyer Images/Weaving/Screenshot 2026-02-26 131342.png',
        orders: 98,
        phone: '+91-9876543221',
        email: 'meera.patel@shebalance.com',
        whatsapp: '+91-9876543221',
        address: {
            street: '45, Textile Market Road',
            area: 'Maninagar',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380008'
        }
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
        skillLevel: 'Expert',
        tags: ['Custom Fit', 'Alterations', 'Designer Wear'],
        image: '../../Buyer Images/Embroidery/Screenshot 2026-02-26 134450.png',
        orders: 312,
        phone: '+91-9876543232',
        email: 'anjali.verma@shebalance.com',
        whatsapp: '+91-9876543232',
        address: {
            street: '78, 5th Cross, 100 Feet Road',
            area: 'Koramangala',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560034'
        }
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
        skillLevel: 'Intermediate',
        tags: ['Tiffin Service', 'Catering', 'South Indian'],
        image: '../../Buyer Images/Home Chef/Screenshot 2026-02-26 130937.png',
        orders: 145,
        phone: '+91-9876543243',
        email: 'lakshmi.reddy@shebalance.com',
        whatsapp: '+91-9876543243',
        address: {
            street: 'House No. 23, Road No. 12',
            area: 'Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500034'
        }
    },
    {
        id: 5,
        name: 'Priya Sharma',
        skill: 'Baker & Pastry Chef',
        category: 'bakery',
        rating: 4.9,
        reviews: 156,
        price: '₹300-2000',
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Custom Cakes', 'Cookies', 'Desserts'],
        image: '../../Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 123738.png',
        orders: 289,
        phone: '+91-9876543254',
        email: 'priya.sharma@shebalance.com',
        whatsapp: '+91-9876543254',
        address: {
            street: 'Shop 7, Bandra Linking Road',
            area: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050'
        }
    },
    {
        id: 6,
        name: 'Kavita Desai',
        skill: 'Henna Artist',
        category: 'henna',
        rating: 4.8,
        reviews: 142,
        price: '₹500-1500',
        location: 'Jaipur',
        skillLevel: 'Expert',
        tags: ['Bridal Mehndi', 'Arabic Design', 'Traditional Patterns'],
        image: '../../Buyer Images/Henna Artist/Screenshot 2026-02-26 124505.png',
        orders: 178,
        phone: '+91-9876543265',
        email: 'kavita.desai@shebalance.com',
        whatsapp: '+91-9876543265',
        address: {
            street: '34, Johari Bazaar',
            area: 'Pink City',
            city: 'Jaipur',
            state: 'Rajasthan',
            pincode: '302003'
        }
    },
    {
        id: 7,
        name: 'Aarti Kulkarni',
        skill: 'Mehndi Specialist',
        category: 'henna',
        rating: 4.7,
        reviews: 98,
        price: '₹400-1200',
        location: 'Pune',
        skillLevel: 'Advanced',
        tags: ['Party Bookings', 'Contemporary Designs', 'Quick Service'],
        image: '../../Buyer Images/Henna Artist/Screenshot 2026-02-26 124627.png',
        orders: 134,
        phone: '+91-9876543276',
        email: 'aarti.kulkarni@shebalance.com',
        whatsapp: '+91-9876543276',
        address: {
            street: '56, Lane 5, North Main Road',
            area: 'Koregaon Park',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
        }
    },
    {
        id: 8,
        name: 'Radha Iyer',
        skill: 'Henna Artist',
        category: 'henna',
        rating: 5.0,
        reviews: 87,
        price: '₹600-1500',
        location: 'Chennai',
        skillLevel: 'Expert',
        tags: ['Bridal Mehndi', 'Traditional Patterns', 'Intricate Work'],
        image: '../../Buyer Images/Henna Artist/Screenshot 2026-02-26 124918.png',
        orders: 156,
        phone: '+91-9876543287',
        email: 'radha.iyer@shebalance.com',
        whatsapp: '+91-9876543287',
        address: {
            street: '89, Usman Road',
            area: 'T Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600017'
        }
    },
    {
        id: 9,
        name: 'Geeta Nair',
        skill: 'Tailoring Specialist',
        category: 'tailoring',
        rating: 4.8,
        reviews: 165,
        price: '₹400-1500',
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Custom Fit', 'Blouse Stitching', 'Alterations', 'Quick Service'],
        image: '../../Buyer Images/Tailoring/Screenshot 2026-02-26 132951.png',
        orders: 234,
        phone: '+91-9876543298',
        email: 'geeta.nair@shebalance.com',
        whatsapp: '+91-9876543298',
        address: {
            street: 'Shop 15, Dadar Market',
            area: 'Dadar East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400014'
        }
    },
    {
        id: 10,
        name: 'Rekha Menon',
        skill: 'Designer Tailor',
        category: 'tailoring',
        rating: 4.9,
        reviews: 198,
        price: '₹500-1500',
        location: 'Bangalore',
        skillLevel: 'Expert',
        tags: ['Designer Wear', 'Custom Fit', 'Bridal Alterations', 'Premium Fabrics'],
        image: '../../Buyer Images/Tailoring/Screenshot 2026-02-26 133004.png',
        orders: 267,
        phone: '+91-9876543309',
        email: 'rekha.menon@shebalance.com',
        whatsapp: '+91-9876543309',
        address: {
            street: '23, 12th Main Road',
            area: 'Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560038'
        }
    },
    {
        id: 11,
        name: 'Sarita Joshi',
        skill: 'Stitching Expert',
        category: 'tailoring',
        rating: 4.6,
        reviews: 142,
        price: '₹300-1200',
        location: 'Delhi',
        skillLevel: 'Advanced',
        tags: ['Alterations', 'Quick Service', 'Custom Fit', 'Affordable Pricing'],
        image: '../../Buyer Images/Tailoring/Screenshot 2026-02-26 133138.png',
        orders: 189,
        phone: '+91-9876543310',
        email: 'sarita.joshi@shebalance.com',
        whatsapp: '+91-9876543310',
        address: {
            street: '67, Ajmal Khan Road',
            area: 'Karol Bagh',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110005'
        }
    },
    {
        id: 12,
        name: 'Nisha Kapoor',
        skill: 'Crochet Artist',
        category: 'crochet',
        rating: 4.8,
        reviews: 156,
        price: '₹600-2000',
        location: 'Mumbai',
        skillLevel: 'Expert',
        tags: ['Handmade', 'Custom Orders', 'Baby Items', 'Home Decor'],
        image: '../../Buyer Images/Crochet/Screenshot 2026-02-26 134626.png',
        orders: 178,
        phone: '+91-9876543321',
        email: 'nisha.kapoor@shebalance.com',
        whatsapp: '+91-9876543321',
        address: {
            street: 'Flat 302, Shivaji Park Apartments',
            area: 'Dadar West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400028'
        }
    },
    {
        id: 13,
        name: 'Pooja Malhotra',
        skill: 'Knitting Specialist',
        category: 'crochet',
        rating: 4.7,
        reviews: 134,
        price: '₹500-1800',
        location: 'Bangalore',
        skillLevel: 'Advanced',
        tags: ['Amigurumi', 'Blankets', 'Custom Orders', 'Handmade'],
        image: '../../Buyer Images/Crochet/Screenshot 2026-02-26 134639.png',
        orders: 145,
        phone: '+91-9876543332',
        email: 'pooja.malhotra@shebalance.com',
        whatsapp: '+91-9876543332',
        address: {
            street: '45, 7th Block, BDA Complex',
            area: 'Jayanagar',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560070'
        }
    },
    {
        id: 14,
        name: 'Divya Rao',
        skill: 'Crochet & Knitting Expert',
        category: 'crochet',
        rating: 4.9,
        reviews: 187,
        price: '₹400-1500',
        location: 'Pune',
        skillLevel: 'Expert',
        tags: ['Baby Items', 'Home Decor', 'Blankets', 'Custom Orders'],
        image: '../../Buyer Images/Crochet/Screenshot 2026-02-26 134814.png',
        orders: 203,
        phone: '+91-9876543343',
        email: 'divya.rao@shebalance.com',
        whatsapp: '+91-9876543343',
        address: {
            street: '12, FC Road, Deccan Corner',
            area: 'Shivaji Nagar',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411004'
        }
    }
];

let currentArtisan = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadArtisanData();
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

// Load artisan data from URL parameter
function loadArtisanData() {
    const urlParams = new URLSearchParams(window.location.search);
    const artisanId = parseInt(urlParams.get('artisanId'));
    
    if (!artisanId) {
        showNotification('❌ No artisan selected. Redirecting...', 'error');
        setTimeout(() => {
            window.location.href = 'buyer-dashboard.html';
        }, 2000);
        return;
    }
    
    currentArtisan = artisans.find(a => a.id === artisanId);
    
    if (!currentArtisan) {
        showNotification('❌ Artisan not found. Redirecting...', 'error');
        setTimeout(() => {
            window.location.href = 'buyer-dashboard.html';
        }, 2000);
        return;
    }
    
    displayArtisanProfile();
    displayContactInfo();
}

// Display artisan profile
function displayArtisanProfile() {
    if (!currentArtisan) return;
    
    // Update profile image
    document.getElementById('artisanImage').src = currentArtisan.image;
    document.getElementById('artisanImage').alt = currentArtisan.name;
    
    // Update profile info
    document.getElementById('artisanName').textContent = currentArtisan.name;
    document.getElementById('artisanSkill').textContent = currentArtisan.skill;
    document.getElementById('artisanLocation').textContent = currentArtisan.location;
    document.getElementById('artisanOrders').textContent = currentArtisan.orders;
    
    // Update rating
    const ratingContainer = document.getElementById('artisanRating');
    const starsElement = ratingContainer.querySelector('.stars');
    const ratingTextElement = ratingContainer.querySelector('.rating-text');
    
    starsElement.textContent = '★'.repeat(Math.floor(currentArtisan.rating)) + '☆'.repeat(5 - Math.floor(currentArtisan.rating));
    ratingTextElement.textContent = `${currentArtisan.rating} (${currentArtisan.reviews} reviews)`;
    
    // Update tags
    const tagsContainer = document.getElementById('artisanTags');
    tagsContainer.innerHTML = currentArtisan.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Display address
    if (currentArtisan.address) {
        const addressContainer = document.getElementById('artisanAddress');
        if (addressContainer) {
            addressContainer.innerHTML = `
                <i class="fas fa-map-marker-alt"></i>
                <div class="address-text">
                    <strong>Address:</strong><br>
                    ${currentArtisan.address.street}<br>
                    ${currentArtisan.address.area}, ${currentArtisan.address.city}<br>
                    ${currentArtisan.address.state} - ${currentArtisan.address.pincode}
                </div>
            `;
        }
    }
}

// Display contact information
function displayContactInfo() {
    if (!currentArtisan) return;
    
    // Update WhatsApp
    document.getElementById('whatsappNumber').textContent = currentArtisan.whatsapp;
    
    // Update Email
    document.getElementById('emailAddress').textContent = currentArtisan.email;
    
    // Update Phone
    document.getElementById('phoneNumber').textContent = currentArtisan.phone;
}

// Open WhatsApp
function openWhatsApp() {
    if (!currentArtisan) return;
    
    // Get buyer name from localStorage
    const userData = localStorage.getItem('shebalance_user');
    let buyerName = 'A Buyer';
    if (userData) {
        const user = JSON.parse(userData);
        buyerName = user.name || 'A Buyer';
    }
    
    // Get artisan first name
    const artisanFirstName = currentArtisan.name.split(' ')[0];
    
    const phoneNumber = currentArtisan.whatsapp.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    const message = encodeURIComponent(`Hello ${artisanFirstName}, I am ${buyerName}. I saw your portfolio and wish to order/buy some pieces. Can we discuss the details?`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    showNotification('📱 Opening WhatsApp...', 'info');
    window.open(whatsappUrl, '_blank');
}

// Open Email
function openEmail() {
    if (!currentArtisan) return;
    
    // Get buyer name from localStorage
    const userData = localStorage.getItem('shebalance_user');
    let buyerName = 'A Buyer';
    if (userData) {
        const user = JSON.parse(userData);
        buyerName = user.name || 'A Buyer';
    }
    
    const subject = encodeURIComponent(`Order Inquiry from ${buyerName}`);
    const body = encodeURIComponent(`Dear ${currentArtisan.name},\n\nI am ${buyerName}. I saw your portfolio on SheBalance and I'm interested in ordering some pieces from your collection.\n\nCould we discuss the details, pricing, and delivery options?\n\nLooking forward to hearing from you.\n\nBest regards,\n${buyerName}`);
    const mailtoUrl = `mailto:${currentArtisan.email}?subject=${subject}&body=${body}`;
    
    showNotification('📧 Opening email client...', 'info');
    window.location.href = mailtoUrl;
}

// Make Phone Call
function makePhoneCall() {
    if (!currentArtisan) return;
    
    const telUrl = `tel:${currentArtisan.phone}`;
    
    showNotification('📞 Initiating call...', 'info');
    window.location.href = telUrl;
}

// Go back to dashboard
function goBackToDashboard() {
    window.location.href = 'buyer-dashboard.html';
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

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const userProfile = document.querySelector('.user-profile');
    
    if (userMenu && !userMenu.contains(event.target) && !userProfile.contains(event.target)) {
        userMenu.classList.remove('active');
    }
});
