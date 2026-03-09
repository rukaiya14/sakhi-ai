// Global variables
let isVoiceActive = false;
let recognition = null;

// Modal functions - Must be defined early for onclick handlers
function openLoginModal() {
    console.log('Opening login modal');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Login modal not found');
    }
}

function openSignupModal() {
    console.log('Opening signup modal');
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Signup modal not found');
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function switchToSignup() {
    closeModal('loginModal');
    openSignupModal();
}

function switchToLogin() {
    closeModal('signupModal');
    openLoginModal();
}

// Login handler
function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== LOGIN ATTEMPT ===');
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('Login form inputs not found');
        alert('Error: Login form not properly loaded');
        return false;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Email entered:', email);
    console.log('Password length:', password.length);

    // Valid credentials
    const validUsers = {
        'mariyam@gmail.com': {
            password: 'mariyam123',
            role: 'user',
            name: 'Mariyam'
        },
        'admin@shebalance.com': {
            password: 'admin123',
            role: 'admin',
            name: 'Admin'
        }
    };

    // Check credentials
    if (validUsers[email] && validUsers[email].password === password) {
        const user = validUsers[email];
        console.log('✅ LOGIN SUCCESSFUL for:', user.name);
        
        // Store user session FIRST
        const userData = {
            email: email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('shebalance_user', JSON.stringify(userData));
        console.log('User data stored in localStorage');
        
        // Use meta refresh redirect page
        console.log('REDIRECTING VIA INTERMEDIATE PAGE...');
        window.location.href = 'login-redirect.html';
        
        // Stop all further execution
        return false;
        
    } else {
        console.log('❌ LOGIN FAILED - Invalid credentials');
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = 'Invalid email or password. Please try again.';
            errorDiv.style.display = 'block';
        }
        alert('Invalid email or password!');
        return false;
    }
}

// Signup handler
function handleSignup(e) {
    e.preventDefault();
    console.log('=== SIGNUP ATTEMPT ===');
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const language = document.getElementById('signupLanguage').value;
    const password = document.getElementById('signupPassword').value;

    // Validate
    if (!name || !email || !phone || !language || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    // Check existing users
    const existingUsers = ['mariyam@gmail.com', 'admin@shebalance.com'];
    if (existingUsers.includes(email.toLowerCase())) {
        alert('This email is already registered. Please login instead.');
        return;
    }

    console.log('✅ SIGNUP SUCCESSFUL for:', name);
    
    // Create user session
    const userData = {
        name: name,
        email: email,
        phone: phone,
        language: language,
        role: 'user',
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('shebalance_user', JSON.stringify(userData));
    localStorage.setItem('shebalance_new_signup', 'true');
    
    // Close modal immediately
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    
    console.log('FORCING REDIRECT TO DASHBOARD...');
    
    // Force redirect using multiple methods
    window.location.href = 'dashboard.html';
    
    setTimeout(function() {
        window.location.href = 'dashboard.html';
    }, 100);
    
    setTimeout(function() {
        window.location.replace('dashboard.html');
    }, 200);
    
    setTimeout(function() {
        window.location.assign('dashboard.html');
    }, 300);
    
    return false;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);

    // Initialize speech recognition if available
    initializeSpeechRecognition();

    // Add form submission handlers
    setupFormHandlers();

    // Mobile menu toggle
    setupMobileMenu();
}

// Handle navbar scroll effect
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}

// Setup mobile menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navButtons = document.querySelector('.nav-buttons');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            navButtons.classList.toggle('active');
        });
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Form submission handlers
function setupFormHandlers() {
    // Note: Login and Signup forms now use onsubmit in HTML
    // No need to add event listeners here
}

function updateUIForLoggedInUser() {
    // Update navigation buttons
    const navButtons = document.querySelector('.nav-buttons');
    if (navButtons) {
        navButtons.innerHTML = `
            <button class="btn-secondary" onclick="openDashboard()">Dashboard</button>
            <button class="btn-primary" onclick="logout()">Logout</button>
        `;
    }
}

function startOnboardingProcess() {
    // Simulate starting the onboarding process
    showNotification('Starting your skill assessment...', 'info');
    setTimeout(() => {
        showNotification('Welcome to SheBalance! Redirecting to dashboard...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1000);
}

// Voice functionality
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN'; // Default to Hindi
        
        recognition.onstart = function() {
            console.log('Voice recognition started');
            updateVoiceStatus('Listening... Speak now!');
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            console.log('Voice input:', transcript);
            handleVoiceCommand(transcript);
        };
        
        recognition.onerror = function(event) {
            console.error('Voice recognition error:', event.error);
            updateVoiceStatus('Sorry, I couldn\'t hear you clearly. Please try again.');
            stopVoiceDemo();
        };
        
        recognition.onend = function() {
            console.log('Voice recognition ended');
            stopVoiceDemo();
        };
    } else {
        console.log('Speech recognition not supported');
    }
}

function startVoiceDemo() {
    document.getElementById('voiceDemoModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openVoiceDemo() {
    startVoiceDemo();
}

function toggleVoiceDemo() {
    if (!isVoiceActive) {
        startVoiceListening();
    } else {
        stopVoiceDemo();
    }
}

function startVoiceListening() {
    if (recognition) {
        isVoiceActive = true;
        recognition.start();
        
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceCircle = document.querySelector('.voice-circle');
        
        if (voiceBtn) {
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            voiceBtn.style.background = '#ef4444';
        }
        
        if (voiceCircle) {
            voiceCircle.style.animation = 'pulse 1s infinite';
        }
        
        // Add wave animation
        document.querySelectorAll('.wave').forEach(wave => {
            wave.style.display = 'block';
        });
    } else {
        showNotification('Voice recognition not supported in your browser', 'error');
    }
}

function stopVoiceDemo() {
    if (recognition && isVoiceActive) {
        recognition.stop();
    }
    
    isVoiceActive = false;
    
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceCircle = document.querySelector('.voice-circle');
    
    if (voiceBtn) {
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
        voiceBtn.style.background = '#f59e0b';
    }
    
    if (voiceCircle) {
        voiceCircle.style.animation = 'none';
    }
    
    // Hide wave animation
    document.querySelectorAll('.wave').forEach(wave => {
        wave.style.display = 'none';
    });
    
    updateVoiceStatus('Click the microphone to start');
}

function updateVoiceStatus(message) {
    const statusElement = document.getElementById('voiceStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

function handleVoiceCommand(transcript) {
    const command = transcript.toLowerCase();
    
    // Simulate AI processing
    updateVoiceStatus('Processing your request...');
    
    setTimeout(() => {
        if (command.includes('कaam') || command.includes('काम') || command.includes('work') || command.includes('job')) {
            updateVoiceStatus('Great! I found 5 job opportunities matching your skills. Here are embroidery and cooking jobs near you.');
            showVoiceResponse('job-search');
        } else if (command.includes('skill') || command.includes('assessment') || command.includes('कौशल')) {
            updateVoiceStatus('Perfect! Let\'s assess your skills. Please upload photos of your work or describe your abilities.');
            showVoiceResponse('skill-assessment');
        } else if (command.includes('food') || command.includes('खाना') || command.includes('order')) {
            updateVoiceStatus('Wonderful! I see you have cooking skills. Here are 3 food orders waiting for you in your area.');
            showVoiceResponse('food-orders');
        } else {
            updateVoiceStatus('I understand you said: "' + transcript + '". How can I help you with your career goals?');
            showVoiceResponse('general');
        }
    }, 1500);
}

function showVoiceResponse(type) {
    const responses = {
        'job-search': {
            title: 'Job Opportunities Found!',
            content: `
                <div class="voice-response">
                    <h3>🎯 5 Jobs Matching Your Skills</h3>
                    <div class="job-list">
                        <div class="job-item">
                            <strong>Fashion Designer Assistant</strong><br>
                            ₹18,000/month • Remote<br>
                            <small>85% skill match</small>
                        </div>
                        <div class="job-item">
                            <strong>Home Chef for Office</strong><br>
                            ₹800/day • Nearby<br>
                            <small>92% skill match</small>
                        </div>
                        <div class="job-item">
                            <strong>Embroidery Trainer</strong><br>
                            ₹1,000/class • Online<br>
                            <small>88% skill match</small>
                        </div>
                    </div>
                </div>
            `
        },
        'skill-assessment': {
            title: 'Skill Assessment Ready!',
            content: `
                <div class="voice-response">
                    <h3>📸 Upload Your Work Photos</h3>
                    <p>I can analyze your:</p>
                    <ul>
                        <li>Embroidery and stitching work</li>
                        <li>Cooking and food presentation</li>
                        <li>Craft and handmade items</li>
                        <li>Any other creative work</li>
                    </ul>
                    <button class="btn-primary">Upload Photos</button>
                </div>
            `
        },
        'food-orders': {
            title: 'Food Orders Available!',
            content: `
                <div class="voice-response">
                    <h3>🍳 3 Orders Waiting</h3>
                    <div class="order-list">
                        <div class="order-item">
                            <strong>Rajma Chawal (5 portions)</strong><br>
                            ₹750 • Delivery: Tomorrow 1 PM
                        </div>
                        <div class="order-item">
                            <strong>Homemade Cookies (2 dozen)</strong><br>
                            ₹400 • Delivery: Friday
                        </div>
                        <div class="order-item">
                            <strong>Tiffin Service (Weekly)</strong><br>
                            ₹2,100 • Starting Monday
                        </div>
                    </div>
                </div>
            `
        },
        'general': {
            title: 'How Can I Help?',
            content: `
                <div class="voice-response">
                    <h3>🤖 I'm here to help you succeed!</h3>
                    <p>Try saying:</p>
                    <ul>
                        <li>"मुझे काम चाहिए" (I need work)</li>
                        <li>"मेरा skill assessment करो" (Assess my skills)</li>
                        <li>"Food orders दिखाओ" (Show food orders)</li>
                        <li>"मेरा progress दिखाओ" (Show my progress)</li>
                    </ul>
                </div>
            `
        }
    };
    
    const response = responses[type] || responses['general'];
    
    // Create and show response modal
    setTimeout(() => {
        showNotification(response.title, 'success');
        // You could create a more detailed response modal here
    }, 500);
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

// Add CSS animations for notifications
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
    
    .voice-response {
        text-align: left;
    }
    
    .job-list, .order-list {
        margin-top: 15px;
    }
    
    .job-item, .order-item {
        background: #f8fafc;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 4px solid #6366f1;
    }
    
    .job-item small, .order-item small {
        color: #10b981;
        font-weight: 600;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Utility functions
function openDashboard() {
    showNotification('Redirecting to your dashboard...', 'info');
    // Redirect to dashboard page
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

function logout() {
    showNotification('Logging out...', 'info');
    setTimeout(() => {
        // Reset UI to logged out state
        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            navButtons.innerHTML = `
                <button class="btn-secondary" onclick="openLoginModal()">Login</button>
                <button class="btn-primary" onclick="openSignupModal()">Join Now</button>
            `;
        }
        showNotification('Logged out successfully!', 'success');
    }, 1000);
}

// Add some interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }
});

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const isNumber = !isNaN(parseInt(finalValue));
        
        if (isNumber) {
            const finalNum = parseInt(finalValue.replace(/[^\d]/g, ''));
            let currentNum = 0;
            const increment = finalNum / 50;
            const timer = setInterval(() => {
                currentNum += increment;
                if (currentNum >= finalNum) {
                    stat.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(currentNum) + (finalValue.includes('M') ? 'M+' : finalValue.includes('K') ? 'K' : '');
                }
            }, 30);
        }
    });
}

// Add scroll animations for feature cards
const featureCards = document.querySelectorAll('.feature-card');
const cardObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, { threshold: 0.3 });

featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    cardObserver.observe(card);
});

// Add fadeInUp animation
const fadeInUpStyle = document.createElement('style');
fadeInUpStyle.textContent = `
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(fadeInUpStyle);
// Carousel functionality
let currentSlide = 0;
const totalSlides = 6;
let carouselInterval;

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
});

function initializeCarousel() {
    startCarouselAutoplay();
    
    // Pause autoplay on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopCarouselAutoplay);
        carouselContainer.addEventListener('mouseleave', startCarouselAutoplay);
    }
    
    // Touch/swipe support for mobile
    const carousel = document.querySelector('.carousel-slider');
    if (carousel) {
        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            previousSlide();
        } else if (event.key === 'ArrowRight') {
            nextSlide();
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function previousSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.pagination-dot');
    
    if (track) {
        // Move the carousel track
        const translateX = -currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;
        
        // Update active states
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        // Update pagination dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
}

function startCarouselAutoplay() {
    stopCarouselAutoplay(); // Clear any existing interval
    carouselInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
}

function stopCarouselAutoplay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe right - go to previous slide
            previousSlide();
        } else {
            // Swipe left - go to next slide
            nextSlide();
        }
    }
}

// Export functions for global access
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.goToSlide = goToSlide;
// ===== FOOD MARKETPLACE FUNCTIONALITY =====

// Cart management
let cart = [];
let cartTotal = 0;

// Sample dishes data
const dishes = {
    dish1: {
        id: 'dish1',
        name: 'Rajma Chawal',
        chef: 'Sunita Devi',
        price: 120,
        originalPrice: 150,
        image: 'image4.jpeg',
        rating: 4.9,
        reviews: 127,
        deliveryTime: '30-40 mins'
    },
    dish2: {
        id: 'dish2',
        name: 'Gujarati Thali',
        chef: 'Meera Patel',
        price: 200,
        originalPrice: 250,
        image: 'image5.jpg',
        rating: 4.8,
        reviews: 89,
        deliveryTime: '45-60 mins'
    },
    dish3: {
        id: 'dish3',
        name: 'Masala Dosa',
        chef: 'Kavya Singh',
        price: 80,
        originalPrice: 100,
        image: 'image6.jpg',
        rating: 4.7,
        reviews: 156,
        deliveryTime: '25-35 mins'
    },
    dish4: {
        id: 'dish4',
        name: 'Homemade Cookies (12 pcs)',
        chef: 'Rukaiya Ghadiali',
        price: 150,
        originalPrice: 180,
        image: 'image1.jpg',
        rating: 5.0,
        reviews: 43,
        deliveryTime: '20-30 mins'
    },
    dish5: {
        id: 'dish5',
        name: 'Weekly Tiffin Service',
        chef: 'Sunita Devi',
        price: 1200,
        originalPrice: 1500,
        image: 'image2.jpg',
        rating: 4.9,
        reviews: 234,
        deliveryTime: 'Daily 12-1 PM'
    },
    dish6: {
        id: 'dish6',
        name: 'Fresh Samosas (6 pcs)',
        chef: 'Meera Patel',
        price: 60,
        originalPrice: 80,
        image: 'image3.jpg',
        rating: 4.6,
        reviews: 78,
        deliveryTime: '15-25 mins'
    }
};

// Location detection
function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Simulate location detection
                document.getElementById('locationInput').value = 'Current Location Detected';
                showNotification('📍 Location detected successfully!', 'success');
            },
            function(error) {
                showNotification('❌ Unable to detect location. Please enter manually.', 'error');
            }
        );
    } else {
        showNotification('❌ Geolocation is not supported by this browser.', 'error');
    }
}

// Search functionality
function searchFood() {
    const searchTerm = document.getElementById('foodSearch').value.toLowerCase();
    if (searchTerm.trim() === '') {
        showNotification('🔍 Please enter a search term', 'info');
        return;
    }
    
    showNotification(`🔍 Searching for "${searchTerm}"...`, 'info');
    
    setTimeout(() => {
        showNotification(`✅ Found 12 results for "${searchTerm}"`, 'success');
        // Here you would filter the dishes based on search term
        filterDishes(searchTerm);
    }, 1000);
}

// Filter dishes by search term
function filterDishes(searchTerm) {
    const dishCards = document.querySelectorAll('.dish-card');
    let visibleCount = 0;
    
    dishCards.forEach(card => {
        const dishName = card.querySelector('h4').textContent.toLowerCase();
        const chefName = card.querySelector('.dish-chef').textContent.toLowerCase();
        
        if (dishName.includes(searchTerm) || chefName.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (visibleCount === 0) {
        showNotification('😔 No dishes found matching your search', 'info');
        // Reset display
        setTimeout(() => {
            dishCards.forEach(card => card.style.display = 'block');
        }, 2000);
    }
}

// Filter by category
function filterByCategory(category) {
    showNotification(`🍽️ Showing ${category.replace('-', ' ')} dishes...`, 'info');
    
    // Simulate category filtering
    const categoryMap = {
        'north-indian': ['dish1', 'dish5'],
        'south-indian': ['dish3'],
        'snacks': ['dish6', 'dish4'],
        'sweets': ['dish4'],
        'tiffin': ['dish5'],
        'beverages': []
    };
    
    const dishCards = document.querySelectorAll('.dish-card');
    const relevantDishes = categoryMap[category] || [];
    
    dishCards.forEach((card, index) => {
        const dishId = `dish${index + 1}`;
        if (relevantDishes.includes(dishId)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    setTimeout(() => {
        if (relevantDishes.length === 0) {
            showNotification('😔 No dishes found in this category', 'info');
            dishCards.forEach(card => card.style.display = 'block');
        }
    }, 100);
}

// View chef profile
function viewChefProfile(chefId) {
    const chefData = {
        chef1: { name: 'Sunita Devi', specialty: 'North Indian Specialist', dishes: 150, distance: '2.5 km' },
        chef2: { name: 'Meera Patel', specialty: 'Gujarati Delicacies', dishes: 85, distance: '1.8 km' },
        chef3: { name: 'Kavya Singh', specialty: 'South Indian Expert', dishes: 120, distance: '3.2 km' }
    };
    
    const chef = chefData[chefId];
    if (chef) {
        showNotification(`👩‍🍳 Opening ${chef.name}'s profile...`, 'info');
        
        setTimeout(() => {
            showChefModal(chef);
        }, 800);
    }
}

// Show chef modal
function showChefModal(chef) {
    const modal = document.createElement('div');
    modal.className = 'modal chef-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👩‍🍳 ${chef.name}</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="chef-profile">
                    <div class="chef-details">
                        <h4>${chef.specialty}</h4>
                        <div class="chef-stats-detailed">
                            <div class="stat-item">
                                <span class="stat-number">${chef.dishes}+</span>
                                <span class="stat-label">Dishes</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">4.8</span>
                                <span class="stat-label">Rating</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${chef.distance}</span>
                                <span class="stat-label">Away</span>
                            </div>
                        </div>
                        <p>Passionate home chef specializing in authentic ${chef.specialty.toLowerCase()} cuisine. Known for using traditional recipes passed down through generations.</p>
                        <div class="chef-actions">
                            <button class="btn-primary" onclick="viewChefMenu('${chef.name}')">
                                <i class="fas fa-utensils"></i> View Menu
                            </button>
                            <button class="btn-secondary" onclick="followChef('${chef.name}')">
                                <i class="fas fa-heart"></i> Follow Chef
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// View dish details
function viewDish(dishId) {
    const dish = dishes[dishId];
    if (dish) {
        showDishModal(dish);
    }
}

// Show dish modal
function showDishModal(dish) {
    const modal = document.createElement('div');
    modal.className = 'modal dish-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🍽️ ${dish.name}</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="dish-details">
                    <div class="dish-image-large">
                        <img src="${dish.image}" alt="${dish.name}" onerror="this.src='https://via.placeholder.com/400x300/8D6E63/FFFFFF?text=${dish.name}'">
                    </div>
                    <div class="dish-info-detailed">
                        <h4>${dish.name}</h4>
                        <p class="dish-chef">by ${dish.chef}</p>
                        <div class="dish-rating-detailed">
                            <span class="rating">⭐ ${dish.rating}</span>
                            <span class="reviews">(${dish.reviews} reviews)</span>
                            <span class="delivery-time">🕒 ${dish.deliveryTime}</span>
                        </div>
                        <div class="dish-price-detailed">
                            <span class="price">₹${dish.price}</span>
                            <span class="original-price">₹${dish.originalPrice}</span>
                            <span class="discount">${Math.round((1 - dish.price/dish.originalPrice) * 100)}% OFF</span>
                        </div>
                        <div class="dish-description">
                            <p>Authentic homemade ${dish.name} prepared with love and traditional recipes. Fresh ingredients sourced locally and cooked to perfection.</p>
                        </div>
                        <div class="dish-actions">
                            <div class="quantity-selector">
                                <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                                <span class="quantity" id="modalQuantity">1</span>
                                <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                            </div>
                            <button class="btn-add-large" onclick="addToCartFromModal('${dish.id}')">
                                <i class="fas fa-shopping-cart"></i> Add to Cart - ₹${dish.price}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Change quantity in modal
let modalQuantity = 1;
function changeQuantity(change) {
    modalQuantity = Math.max(1, modalQuantity + change);
    document.getElementById('modalQuantity').textContent = modalQuantity;
    
    // Update price in button
    const dishId = document.querySelector('.dish-modal').getAttribute('data-dish-id');
    if (dishId && dishes[dishId]) {
        const totalPrice = dishes[dishId].price * modalQuantity;
        document.querySelector('.btn-add-large').innerHTML = `
            <i class="fas fa-shopping-cart"></i> Add to Cart - ₹${totalPrice}
        `;
    }
}

// Add to cart from modal
function addToCartFromModal(dishId) {
    addToCart(dishId, null, modalQuantity);
    closeModal(document.querySelector('.dish-modal .close'));
    modalQuantity = 1; // Reset quantity
}

// Add to cart
function addToCart(dishId, event, quantity = 1) {
    if (event) {
        event.stopPropagation();
    }
    
    const dish = dishes[dishId];
    if (!dish) return;
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...dish,
            quantity: quantity
        });
    }
    
    updateCartUI();
    showNotification(`✅ ${dish.name} added to cart!`, 'success');
    
    // Animate button
    if (event) {
        const button = event.target.closest('.btn-add-to-cart');
        button.classList.add('adding');
        setTimeout(() => button.classList.remove('adding'), 300);
    }
}

// Update cart UI
function updateCartUI() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('cartTotalFloat').textContent = cartTotal;
    
    // Show/hide cart float
    const cartFloat = document.getElementById('cartFloat');
    if (cartCount > 0) {
        cartFloat.style.display = 'flex';
    } else {
        cartFloat.style.display = 'none';
    }
    
    // Update cart content
    updateCartContent();
}

// Update cart content
function updateCartContent() {
    const cartContent = document.getElementById('cartContent');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <span>Add some delicious items to get started!</span>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartContent.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60/8D6E63/FFFFFF?text=${item.name.charAt(0)}'">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-chef">by ${item.chef}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        </div>
                        <div class="cart-item-price">₹${item.price * item.quantity}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const delivery = 30;
        const total = subtotal + delivery;
        
        document.getElementById('cartSubtotal').textContent = `₹${subtotal}`;
        document.getElementById('cartDelivery').textContent = `₹${delivery}`;
        document.getElementById('cartTotal').textContent = `₹${total}`;
        
        cartFooter.style.display = 'block';
    }
}

// Update cart quantity
function updateCartQuantity(dishId, change) {
    const item = cart.find(item => item.id === dishId);
    if (item) {
        item.quantity = Math.max(0, item.quantity + change);
        if (item.quantity === 0) {
            cart = cart.filter(cartItem => cartItem.id !== dishId);
        }
        updateCartUI();
    }
}

// Open cart
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close cart
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.body.style.overflow = 'auto';
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('🛒 Your cart is empty!', 'info');
        return;
    }
    
    showNotification('🚀 Redirecting to checkout...', 'info');
    
    setTimeout(() => {
        showCheckoutModal();
    }, 1000);
}

// Show checkout modal
function showCheckoutModal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 30;
    const total = subtotal + delivery;
    
    const modal = document.createElement('div');
    modal.className = 'modal checkout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🛒 Checkout</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="checkout-content">
                    <div class="delivery-info">
                        <h4>📍 Delivery Address</h4>
                        <div class="address-input">
                            <input type="text" placeholder="Enter your full address" value="Sector 15, Noida, UP 201301">
                        </div>
                        <div class="contact-input">
                            <input type="tel" placeholder="Phone number" value="+91 9876543210">
                        </div>
                    </div>
                    
                    <div class="order-summary">
                        <h4>📋 Order Summary</h4>
                        <div class="order-items">
                            ${cart.map(item => `
                                <div class="order-item">
                                    <span>${item.name} x ${item.quantity}</span>
                                    <span>₹${item.price * item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>₹${subtotal}</span>
                            </div>
                            <div class="total-row">
                                <span>Delivery:</span>
                                <span>₹${delivery}</span>
                            </div>
                            <div class="total-row total">
                                <span>Total:</span>
                                <span>₹${total}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-methods">
                        <h4>💳 Payment Method</h4>
                        <div class="payment-options">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="upi" checked>
                                <span class="payment-icon">📱</span>
                                <span>UPI Payment</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card">
                                <span class="payment-icon">💳</span>
                                <span>Credit/Debit Card</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="cod">
                                <span class="payment-icon">💵</span>
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="checkout-actions">
                        <button class="btn-secondary" onclick="closeModal(this)">Back to Cart</button>
                        <button class="btn-primary btn-place-order" onclick="placeOrder()">
                            <i class="fas fa-check"></i> Place Order - ₹${total}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Place order
function placeOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    showNotification('🔄 Processing your order...', 'info');
    
    setTimeout(() => {
        showNotification('✅ Order placed successfully!', 'success');
        
        setTimeout(() => {
            showOrderConfirmation();
        }, 1000);
    }, 2000);
}

// Show order confirmation
function showOrderConfirmation() {
    const orderId = 'ORD' + Date.now().toString().slice(-6);
    
    closeModal(document.querySelector('.checkout-modal .close'));
    closeCart();
    
    const modal = document.createElement('div');
    modal.className = 'modal confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎉 Order Confirmed!</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="confirmation-content">
                    <div class="success-icon">✅</div>
                    <h4>Your order has been placed successfully!</h4>
                    <div class="order-details">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
                        <p><strong>Total Amount:</strong> ₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 30}</p>
                    </div>
                    <div class="tracking-info">
                        <p>📱 You will receive SMS updates about your order status</p>
                        <p>🚚 Our delivery partner will contact you shortly</p>
                    </div>
                    <div class="confirmation-actions">
                        <button class="btn-primary" onclick="trackOrder('${orderId}')">
                            <i class="fas fa-map-marker-alt"></i> Track Order
                        </button>
                        <button class="btn-secondary" onclick="closeModal(this)">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Clear cart
    cart = [];
    updateCartUI();
}

// Track order
function trackOrder(orderId) {
    showNotification(`📍 Tracking order ${orderId}...`, 'info');
    
    setTimeout(() => {
        showNotification('🚚 Your order is being prepared by the chef!', 'success');
    }, 1000);
}

// Close modal
function closeModal(element) {
    const modal = element.closest('.modal');
    modal.remove();
    document.body.style.overflow = 'auto';
}

// Follow chef
function followChef(chefName) {
    showNotification(`❤️ You are now following ${chefName}!`, 'success');
}

// View chef menu
function viewChefMenu(chefName) {
    showNotification(`📋 Loading ${chefName}'s menu...`, 'info');
    
    setTimeout(() => {
        showNotification(`🍽️ ${chefName} has 25+ dishes available!`, 'success');
    }, 1000);
}

// Notification system (if not already defined)
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
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Add CSS for modals and notifications
const foodMarketplaceStyles = document.createElement('style');
foodMarketplaceStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    
    .modal.show {
        display: flex;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1e293b;
    }
    
    .modal-header .close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .modal-header .close:hover {
        background: #f1f5f9;
        color: #1e293b;
    }
    
    .modal-body {
        padding: 24px;
    }
    
    .dish-image-large {
        width: 100%;
        height: 250px;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 20px;
    }
    
    .dish-image-large img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .dish-info-detailed h4 {
        font-size: 1.5rem;
        margin-bottom: 5px;
        color: #1e293b;
    }
    
    .dish-rating-detailed {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 10px 0;
        flex-wrap: wrap;
    }
    
    .dish-price-detailed {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 15px 0;
    }
    
    .dish-price-detailed .price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
    }
    
    .dish-actions {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    
    .quantity-selector {
        display: flex;
        align-items: center;
        gap: 15px;
        background: #f8fafc;
        padding: 10px 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }
    
    .btn-add-large {
        background: linear-gradient(135deg, #8B4513, #D2691E);
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        justify-content: center;
        min-width: 200px;
    }
    
    .btn-add-large:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
    }
    
    .chef-stats-detailed {
        display: flex;
        gap: 30px;
        margin: 20px 0;
        justify-content: center;
    }
    
    .chef-stats-detailed .stat-item {
        text-align: center;
    }
    
    .chef-stats-detailed .stat-number {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
    }
    
    .chef-stats-detailed .stat-label {
        font-size: 14px;
        color: #64748b;
    }
    
    .chef-actions {
        display: flex;
        gap: 15px;
        margin-top: 20px;
        flex-wrap: wrap;
    }
    
    .chef-actions button {
        flex: 1;
        min-width: 150px;
    }
    
    .checkout-content {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    
    .delivery-info input {
        width: 100%;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 10px;
        font-size: 14px;
    }
    
    .order-items {
        margin-bottom: 15px;
    }
    
    .order-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
    }
    
    .order-totals .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .order-totals .total-row.total {
        font-weight: 700;
        font-size: 1.1rem;
        padding-top: 8px;
        border-top: 1px solid #e2e8f0;
    }
    
    .payment-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .payment-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .payment-option:hover {
        border-color: #8B4513;
        background: #fef7ed;
    }
    
    .payment-option input[type="radio"] {
        margin: 0;
    }
    
    .payment-icon {
        font-size: 1.2rem;
    }
    
    .checkout-actions {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .checkout-actions button {
        flex: 1;
        min-width: 150px;
    }
    
    .btn-place-order {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .btn-place-order:hover {
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .confirmation-content {
        text-align: center;
    }
    
    .success-icon {
        font-size: 4rem;
        margin-bottom: 20px;
    }
    
    .confirmation-content h4 {
        color: #1e293b;
        margin-bottom: 20px;
    }
    
    .order-details {
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: left;
    }
    
    .tracking-info {
        margin: 20px 0;
        color: #64748b;
    }
    
    .confirmation-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 20px;
        }
        
        .dish-actions {
            flex-direction: column;
            align-items: stretch;
        }
        
        .quantity-selector {
            justify-content: center;
        }
        
        .chef-actions {
            flex-direction: column;
        }
        
        .checkout-actions {
            flex-direction: column;
        }
        
        .confirmation-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(foodMarketplaceStyles);

console.log('🍳 Food Marketplace functionality loaded successfully!');

// ===== ADDITIONAL FOOD MARKETPLACE FUNCTIONS =====

// Sample dishes data
const dishesData = {
    dish1: {
        id: 'dish1',
        name: 'Rajma Chawal',
        chef: 'Sunita Devi',
        price: 120,
        originalPrice: 150,
        image: 'image4.jpeg',
        rating: 4.9,
        reviews: 127,
        description: 'Authentic North Indian rajma with perfectly cooked basmati rice',
        ingredients: 'Rajma, Basmati Rice, Onions, Tomatoes, Spices',
        prepTime: '30-40 mins'
    },
    dish2: {
        id: 'dish2',
        name: 'Gujarati Thali',
        chef: 'Meera Patel',
        price: 200,
        originalPrice: 250,
        image: 'image5.jpg',
        rating: 4.8,
        reviews: 89,
        description: 'Complete Gujarati thali with dal, sabzi, roti, rice, and sweets',
        ingredients: 'Dal, Mixed Vegetables, Roti, Rice, Pickle, Sweet',
        prepTime: '45-60 mins'
    },
    dish3: {
        id: 'dish3',
        name: 'Masala Dosa',
        chef: 'Kavya Singh',
        price: 80,
        originalPrice: 100,
        image: 'image6.jpg',
        rating: 4.7,
        reviews: 156,
        description: 'Crispy South Indian dosa with spiced potato filling',
        ingredients: 'Rice, Urad Dal, Potatoes, Onions, Spices',
        prepTime: '25-35 mins'
    },
    dish4: {
        id: 'dish4',
        name: 'Homemade Cookies (12 pcs)',
        chef: 'Rukaiya Ghadiali',
        price: 150,
        originalPrice: 180,
        image: 'image1.jpg',
        rating: 5.0,
        reviews: 43,
        description: 'Freshly baked homemade cookies with love and care',
        ingredients: 'Flour, Butter, Sugar, Chocolate Chips, Vanilla',
        prepTime: '20-30 mins'
    },
    dish5: {
        id: 'dish5',
        name: 'Weekly Tiffin Service',
        chef: 'Sunita Devi',
        price: 1200,
        originalPrice: 1500,
        image: 'image2.jpg',
        rating: 4.9,
        reviews: 234,
        description: 'Complete weekly tiffin service with variety of dishes',
        ingredients: 'Daily changing menu with dal, sabzi, roti, rice',
        prepTime: 'Daily 12-1 PM'
    },
    dish6: {
        id: 'dish6',
        name: 'Fresh Samosas (6 pcs)',
        chef: 'Meera Patel',
        price: 60,
        originalPrice: 80,
        image: 'image3.jpg',
        rating: 4.6,
        reviews: 78,
        description: 'Crispy samosas with spiced potato and pea filling',
        ingredients: 'Flour, Potatoes, Peas, Onions, Spices',
        prepTime: '15-25 mins'
    }
};

// Location Detection
function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Simulate location detection
            document.getElementById('locationInput').value = 'Current Location - Sector 15, Noida';
            showNotification('📍 Location detected successfully!', 'success');
        }, function() {
            showNotification('❌ Unable to detect location. Please enter manually.', 'error');
        });
    } else {
        showNotification('❌ Geolocation not supported by this browser.', 'error');
    }
}

// Search Food
function searchFood() {
    const searchTerm = document.getElementById('foodSearch').value.toLowerCase();
    if (searchTerm.trim() === '') {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    showNotification(`🔍 Searching for "${searchTerm}"...`, 'info');
    
    setTimeout(() => {
        showNotification(`Found 12 results for "${searchTerm}"`, 'success');
        // Here you would filter the dishes based on search term
    }, 1000);
}

// Filter by Category
function filterByCategory(category) {
    showNotification(`🍽️ Showing ${category.replace('-', ' ')} dishes...`, 'info');
    
    // Add visual feedback
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    event.target.closest('.category-card').classList.add('active');
    
    setTimeout(() => {
        showNotification(`Found 8 ${category.replace('-', ' ')} dishes near you`, 'success');
    }, 800);
}

// View Chef Profile
function viewChefProfile(chefId) {
    showNotification('👩‍🍳 Loading chef profile...', 'info');
    
    const chefData = {
        chef1: { name: 'Sunita Devi', specialty: 'North Indian', dishes: 150 },
        chef2: { name: 'Meera Patel', specialty: 'Gujarati', dishes: 85 },
        chef3: { name: 'Kavya Singh', specialty: 'South Indian', dishes: 120 }
    };
    
    const chef = chefData[chefId];
    
    setTimeout(() => {
        const modal = document.createElement('div');
        modal.className = 'modal chef-profile-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👩‍🍳 ${chef.name}</h3>
                    <span class="close" onclick="closeModal(this)">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="chef-profile">
                        <div class="chef-details">
                            <h4>Specialty: ${chef.specialty} Cuisine</h4>
                            <p>📍 2.5 km away from you</p>
                            <p>🍽️ ${chef.dishes}+ dishes available</p>
                            <p>⭐ 4.9 rating (500+ reviews)</p>
                            <p>🚚 Average delivery: 30-45 mins</p>
                        </div>
                        <div class="chef-stats">
                            <div class="stat">
                                <span class="stat-number">500+</span>
                                <span class="stat-label">Happy Customers</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">2 years</span>
                                <span class="stat-label">Experience</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }, 800);
}

// View Dish Details
function viewDish(dishId) {
    const dish = dishesData[dishId];
    if (!dish) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal dish-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🍽️ ${dish.name}</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="dish-detail">
                    <div class="dish-image-large">
                        <img src="${dish.image}" alt="${dish.name}" onerror="this.src='https://via.placeholder.com/400x300/8D6E63/FFFFFF?text=${dish.name}'">
                    </div>
                    <div class="dish-info-detailed">
                        <h4>${dish.name}</h4>
                        <p class="chef-name">by ${dish.chef}</p>
                        <div class="rating-detailed">
                            <span class="rating">⭐ ${dish.rating}</span>
                            <span class="reviews">(${dish.reviews} reviews)</span>
                        </div>
                        <p class="description">${dish.description}</p>
                        <div class="ingredients">
                            <h5>Ingredients:</h5>
                            <p>${dish.ingredients}</p>
                        </div>
                        <div class="prep-time">
                            <h5>Preparation Time:</h5>
                            <p>🕐 ${dish.prepTime}</p>
                        </div>
                        <div class="price-section">
                            <span class="price">₹${dish.price}</span>
                            <span class="original-price">₹${dish.originalPrice}</span>
                            <span class="discount">${Math.round((1 - dish.price/dish.originalPrice) * 100)}% OFF</span>
                        </div>
                        <div class="quantity-selector">
                            <label>Quantity:</label>
                            <div class="quantity-controls">
                                <button onclick="changeQuantity(-1)">-</button>
                                <span id="dishQuantity">1</span>
                                <button onclick="changeQuantity(1)">+</button>
                            </div>
                        </div>
                        <button class="btn-add-large" onclick="addToCartFromModal('${dishId}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart - ₹${dish.price}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Change Quantity in Modal
function changeQuantity(change) {
    const quantityElement = document.getElementById('dishQuantity');
    let quantity = parseInt(quantityElement.textContent);
    quantity = Math.max(1, quantity + change);
    quantityElement.textContent = quantity;
    
    // Update price in button
    const dishId = document.querySelector('.dish-detail-modal').getAttribute('data-dish-id');
    if (dishId && dishesData[dishId]) {
        const totalPrice = dishesData[dishId].price * quantity;
        document.querySelector('.btn-add-large').innerHTML = `
            <i class="fas fa-shopping-cart"></i> Add to Cart - ₹${totalPrice}
        `;
    }
}

// Add to Cart
function addToCart(dishId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const dish = dishesData[dishId];
    if (!dish) return;
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...dish,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification(`✅ ${dish.name} added to cart!`, 'success');
}

// Add to Cart from Modal
function addToCartFromModal(dishId) {
    const quantity = parseInt(document.getElementById('dishQuantity').textContent);
    const dish = dishesData[dishId];
    
    if (!dish) return;
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...dish,
            quantity: quantity
        });
    }
    
    updateCartUI();
    closeModal(document.querySelector('.dish-detail-modal .close'));
    showNotification(`✅ ${dish.name} (${quantity}) added to cart!`, 'success');
}

// Update Cart UI
function updateCartUI() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cartSubtotal > 0 ? 30 : 0;
    const cartTotal = cartSubtotal + deliveryFee;
    
    // Update cart count and total in float button
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('cartTotalFloat').textContent = cartTotal;
    
    // Show/hide cart float button
    const cartFloat = document.getElementById('cartFloat');
    if (cartCount > 0) {
        cartFloat.style.display = 'flex';
    } else {
        cartFloat.style.display = 'none';
    }
    
    // Update cart content
    const cartContent = document.getElementById('cartContent');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <span>Add some delicious items to get started!</span>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartContent.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60/8D6E63/FFFFFF?text=${item.name.charAt(0)}'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>by ${item.chef}</p>
                    <div class="cart-item-price">₹${item.price} each</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button onclick="updateCartQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', 1)">+</button>
                    </div>
                    <div class="item-total">₹${item.price * item.quantity}</div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update totals
        document.getElementById('cartSubtotal').textContent = `₹${cartSubtotal}`;
        document.getElementById('cartDelivery').textContent = `₹${deliveryFee}`;
        document.getElementById('cartTotal').textContent = `₹${cartTotal}`;
        
        cartFooter.style.display = 'block';
    }
}

// Update Cart Quantity
function updateCartQuantity(dishId, change) {
    const item = cart.find(item => item.id === dishId);
    if (!item) return;
    
    item.quantity = Math.max(0, item.quantity + change);
    
    if (item.quantity === 0) {
        removeFromCart(dishId);
    } else {
        updateCartUI();
    }
}

// Remove from Cart
function removeFromCart(dishId) {
    cart = cart.filter(item => item.id !== dishId);
    updateCartUI();
    showNotification('Item removed from cart', 'info');
}

// Open Cart
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close Cart
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.body.style.overflow = 'auto';
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    
    showNotification('🚀 Redirecting to checkout...', 'info');
    
    setTimeout(() => {
        showCheckoutModal();
    }, 1000);
}

// Show Checkout Modal
function showCheckoutModal() {
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 30;
    const cartTotal = cartSubtotal + deliveryFee;
    
    const modal = document.createElement('div');
    modal.className = 'modal checkout-modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>🛒 Checkout</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="checkout-container">
                    <div class="checkout-left">
                        <div class="delivery-info">
                            <h4>📍 Delivery Information</h4>
                            <div class="form-group">
                                <label>Delivery Address</label>
                                <textarea placeholder="Enter your complete delivery address..." rows="3"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" placeholder="+91 9876543210">
                                </div>
                                <div class="form-group">
                                    <label>Delivery Time</label>
                                    <select>
                                        <option>ASAP (45-60 mins)</option>
                                        <option>Schedule for later</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="payment-info">
                            <h4>💳 Payment Method</h4>
                            <div class="payment-options">
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="online" checked>
                                    <div class="payment-card">
                                        <i class="fas fa-credit-card"></i>
                                        <span>Online Payment</span>
                                        <small>UPI, Cards, Net Banking</small>
                                    </div>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment" value="cod">
                                    <div class="payment-card">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <span>Cash on Delivery</span>
                                        <small>Pay when you receive</small>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="checkout-right">
                        <div class="order-summary">
                            <h4>📋 Order Summary</h4>
                            <div class="order-items">
                                ${cart.map(item => `
                                    <div class="summary-item">
                                        <span>${item.name} x${item.quantity}</span>
                                        <span>₹${item.price * item.quantity}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="summary-totals">
                                <div class="summary-row">
                                    <span>Subtotal:</span>
                                    <span>₹${cartSubtotal}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Delivery Fee:</span>
                                    <span>₹${deliveryFee}</span>
                                </div>
                                <div class="summary-row total">
                                    <span>Total:</span>
                                    <span>₹${cartTotal}</span>
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn-place-order" onclick="placeOrder()">
                            <i class="fas fa-check"></i>
                            Place Order - ₹${cartTotal}
                        </button>
                        
                        <div class="checkout-security">
                            <p><i class="fas fa-shield-alt"></i> Your payment information is secure and encrypted</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Place Order
function placeOrder() {
    showNotification('🔄 Processing your order...', 'info');
    
    setTimeout(() => {
        // Clear cart
        cart = [];
        updateCartUI();
        
        // Close modals
        closeModal(document.querySelector('.checkout-modal .close'));
        closeCart();
        
        // Show success
        showNotification('🎉 Order placed successfully! You will receive a confirmation shortly.', 'success');
        
        setTimeout(() => {
            showNotification('📱 SMS sent with order details and tracking information', 'info');
        }, 2000);
        
        setTimeout(() => {
            showNotification('👩‍🍳 Your chef has been notified and will start preparing your order', 'info');
        }, 4000);
    }, 2000);
}

// Close Modal
function closeModal(element) {
    const modal = element.closest('.modal');
    modal.remove();
    document.body.style.overflow = 'auto';
}

// Enhanced notification system for food marketplace
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
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Initialize food marketplace when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart UI
    updateCartUI();
    
    // Add smooth scrolling for food marketplace navigation
    const foodMarketplaceLink = document.querySelector('a[href="#food-marketplace"]');
    if (foodMarketplaceLink) {
        foodMarketplaceLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('food-marketplace').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});

// ===== FOOD MARKETPLACE FUNCTIONALITY =====

// Sample dishes data (continued)
const dishesExtended = {
    'dish1': {
        id: 'dish1',
        name: 'Rajma Chawal',
        chef: 'Sunita Devi',
        price: 120,
        originalPrice: 150,
        image: 'image4.jpeg',
        rating: 4.9,
        reviews: 127,
        deliveryTime: '30-40 mins'
    },
    'dish2': {
        id: 'dish2',
        name: 'Gujarati Thali',
        chef: 'Meera Patel',
        price: 200,
        originalPrice: 250,
        image: 'image5.jpg',
        rating: 4.8,
        reviews: 89,
        deliveryTime: '45-60 mins'
    },
    'dish3': {
        id: 'dish3',
        name: 'Masala Dosa',
        chef: 'Kavya Singh',
        price: 80,
        originalPrice: 100,
        image: 'image6.jpg',
        rating: 4.7,
        reviews: 156,
        deliveryTime: '25-35 mins'
    },
    'dish4': {
        id: 'dish4',
        name: 'Homemade Cookies (12 pcs)',
        chef: 'Rukaiya Ghadiali',
        price: 150,
        originalPrice: 180,
        image: 'image1.jpg',
        rating: 5.0,
        reviews: 43,
        deliveryTime: '20-30 mins'
    },
    'dish5': {
        id: 'dish5',
        name: 'Weekly Tiffin Service',
        chef: 'Sunita Devi',
        price: 1200,
        originalPrice: 1500,
        image: 'image2.jpg',
        rating: 4.9,
        reviews: 234,
        deliveryTime: 'Daily 12-1 PM'
    },
    'dish6': {
        id: 'dish6',
        name: 'Fresh Samosas (6 pcs)',
        chef: 'Meera Patel',
        price: 60,
        originalPrice: 80,
        image: 'image3.jpg',
        rating: 4.6,
        reviews: 78,
        deliveryTime: '15-25 mins'
    }
};

// Location Detection
function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Simulate location detection
            document.getElementById('locationInput').value = 'Current Location - Sector 15, Noida';
            showNotification('📍 Location detected successfully!', 'success');
        }, function() {
            showNotification('❌ Unable to detect location. Please enter manually.', 'error');
        });
    } else {
        showNotification('❌ Geolocation is not supported by this browser.', 'error');
    }
}

// Search Food
function searchFood() {
    const searchTerm = document.getElementById('foodSearch').value;
    if (searchTerm.trim()) {
        showNotification(`🔍 Searching for "${searchTerm}"...`, 'info');
        setTimeout(() => {
            showNotification(`✅ Found 12 results for "${searchTerm}"`, 'success');
        }, 1000);
    }
}

// Filter by Category
function filterByCategory(category) {
    showNotification(`🍽️ Filtering by ${category.replace('-', ' ')} cuisine...`, 'info');
    setTimeout(() => {
        showNotification(`✅ Showing ${category.replace('-', ' ')} dishes`, 'success');
    }, 800);
}

// View Chef Profile
function viewChefProfile(chefId) {
    const chefNames = {
        'chef1': 'Sunita Devi',
        'chef2': 'Meera Patel',
        'chef3': 'Kavya Singh'
    };
    
    showNotification(`👩‍🍳 Opening ${chefNames[chefId]}'s profile...`, 'info');
    setTimeout(() => {
        showChefModal(chefId);
    }, 500);
}

// Show Chef Modal
function showChefModal(chefId) {
    const chefData = {
        'chef1': {
            name: 'Sunita Devi',
            specialty: 'North Indian Specialist',
            rating: 4.9,
            dishes: 150,
            distance: '2.5 km',
            image: 'image1.jpg',
            bio: 'Expert in traditional North Indian cuisine with 15+ years of experience.',
            specialties: ['Rajma Chawal', 'Butter Chicken', 'Naan', 'Tiffin Service']
        },
        'chef2': {
            name: 'Meera Patel',
            specialty: 'Gujarati Delicacies',
            rating: 4.8,
            dishes: 85,
            distance: '1.8 km',
            image: 'image2.jpg',
            bio: 'Authentic Gujarati home cooking passed down through generations.',
            specialties: ['Gujarati Thali', 'Dhokla', 'Khandvi', 'Samosas']
        },
        'chef3': {
            name: 'Kavya Singh',
            specialty: 'South Indian Expert',
            rating: 4.7,
            dishes: 120,
            distance: '3.2 km',
            image: 'image3.jpg',
            bio: 'Traditional South Indian recipes with modern presentation.',
            specialties: ['Masala Dosa', 'Idli Sambar', 'Uttapam', 'Filter Coffee']
        }
    };
    
    const chef = chefData[chefId];
    
    const modal = document.createElement('div');
    modal.className = 'modal chef-profile-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>👩‍🍳 Chef Profile</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="chef-profile">
                    <div class="chef-profile-header">
                        <div class="chef-profile-image">
                            <img src="${chef.image}" alt="${chef.name}" onerror="this.src='https://via.placeholder.com/150x150/8D6E63/FFFFFF?text=${chef.name.charAt(0)}'">
                            <div class="chef-rating-badge">⭐ ${chef.rating}</div>
                        </div>
                        <div class="chef-profile-info">
                            <h2>${chef.name}</h2>
                            <p class="chef-specialty">${chef.specialty}</p>
                            <div class="chef-profile-stats">
                                <div class="stat">
                                    <span class="stat-number">${chef.dishes}+</span>
                                    <span class="stat-label">Dishes</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">${chef.distance}</span>
                                    <span class="stat-label">Away</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">${chef.rating}</span>
                                    <span class="stat-label">Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chef-bio">
                        <h4>About ${chef.name}</h4>
                        <p>${chef.bio}</p>
                    </div>
                    
                    <div class="chef-specialties">
                        <h4>Specialties</h4>
                        <div class="specialties-grid">
                            ${chef.specialties.map(specialty => `
                                <div class="specialty-item">${specialty}</div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="chef-actions">
                        <button class="btn-secondary" onclick="closeModal(this)">Close</button>
                        <button class="btn-primary" onclick="viewChefMenu('${chefId}')">View Menu</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// View Dish Details
function viewDish(dishId) {
    const dish = dishes[dishId];
    if (!dish) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal dish-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🍽️ ${dish.name}</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="dish-detail">
                    <div class="dish-detail-image">
                        <img src="${dish.image}" alt="${dish.name}" onerror="this.src='https://via.placeholder.com/400x300/8D6E63/FFFFFF?text=${dish.name}'">
                    </div>
                    <div class="dish-detail-info">
                        <h2>${dish.name}</h2>
                        <p class="dish-chef">by ${dish.chef}</p>
                        <div class="dish-rating">
                            <span class="rating">⭐ ${dish.rating}</span>
                            <span class="reviews">(${dish.reviews} reviews)</span>
                        </div>
                        <div class="dish-price">
                            <span class="price">₹${dish.price}</span>
                            <span class="original-price">₹${dish.originalPrice}</span>
                            <span class="discount">${Math.round((1 - dish.price/dish.originalPrice) * 100)}% OFF</span>
                        </div>
                        <div class="delivery-info">
                            <i class="fas fa-clock"></i>
                            <span>Delivery in ${dish.deliveryTime}</span>
                        </div>
                        <div class="dish-description">
                            <p>Authentic homemade ${dish.name} prepared with love and traditional recipes. Fresh ingredients and hygienic preparation guaranteed.</p>
                        </div>
                        <div class="dish-actions">
                            <button class="btn-secondary" onclick="closeModal(this)">Close</button>
                            <button class="btn-primary" onclick="addToCart('${dish.id}', event); closeModal(this);">
                                <i class="fas fa-plus"></i> Add to Cart - ₹${dish.price}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Add to Cart
function addToCart(dishId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const dish = dishes[dishId];
    if (!dish) return;
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...dish,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification(`✅ ${dish.name} added to cart!`, 'success');
}

// Update Cart UI
function updateCartUI() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cartSubtotal > 0 ? 30 : 0;
    const cartTotal = cartSubtotal + deliveryFee;
    
    // Update cart count
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('cartTotalFloat').textContent = cartTotal;
    
    // Update cart sidebar
    document.getElementById('cartSubtotal').textContent = `₹${cartSubtotal}`;
    document.getElementById('cartDelivery').textContent = `₹${deliveryFee}`;
    document.getElementById('cartTotal').textContent = `₹${cartTotal}`;
    
    // Show/hide cart float button
    const cartFloat = document.getElementById('cartFloat');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cartCount > 0) {
        cartFloat.style.display = 'flex';
        cartFooter.style.display = 'block';
        updateCartContent();
    } else {
        cartFloat.style.display = 'none';
        cartFooter.style.display = 'none';
        showEmptyCart();
    }
}

// Update Cart Content
function updateCartContent() {
    const cartContent = document.getElementById('cartContent');
    
    cartContent.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60/8D6E63/FFFFFF?text=${item.name.charAt(0)}'">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>by ${item.chef}</p>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="cart-item-price">₹${item.price * item.quantity}</div>
        </div>
    `).join('');
}

// Show Empty Cart
function showEmptyCart() {
    const cartContent = document.getElementById('cartContent');
    cartContent.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <p>Your cart is empty</p>
            <span>Add some delicious items to get started!</span>
        </div>
    `;
}

// Update Quantity
function updateQuantity(dishId, change) {
    const item = cart.find(item => item.id === dishId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== dishId);
    }
    
    updateCartUI();
}

// Open Cart
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Close Cart
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.body.style.overflow = 'auto';
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('❌ Your cart is empty!', 'error');
        return;
    }
    
    showNotification('🛒 Proceeding to checkout...', 'info');
    setTimeout(() => {
        showCheckoutModal();
    }, 1000);
}

// Show Checkout Modal
function showCheckoutModal() {
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 30;
    const cartTotal = cartSubtotal + deliveryFee;
    
    const modal = document.createElement('div');
    modal.className = 'modal checkout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🛒 Checkout</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="checkout-content">
                    <div class="delivery-address">
                        <h4>📍 Delivery Address</h4>
                        <div class="address-input">
                            <input type="text" value="Sector 15, Noida" placeholder="Enter delivery address">
                            <button class="btn-secondary">Change</button>
                        </div>
                    </div>
                    
                    <div class="order-summary">
                        <h4>📋 Order Summary</h4>
                        <div class="order-items">
                            ${cart.map(item => `
                                <div class="order-item">
                                    <span>${item.name} x ${item.quantity}</span>
                                    <span>₹${item.price * item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>₹${cartSubtotal}</span>
                            </div>
                            <div class="total-row">
                                <span>Delivery Fee:</span>
                                <span>₹${deliveryFee}</span>
                            </div>
                            <div class="total-row total">
                                <span>Total:</span>
                                <span>₹${cartTotal}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="payment-methods">
                        <h4>💳 Payment Method</h4>
                        <div class="payment-options">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="upi" checked>
                                <span>UPI Payment</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card">
                                <span>Credit/Debit Card</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="cod">
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="checkout-actions">
                        <button class="btn-secondary" onclick="closeModal(this)">Back to Cart</button>
                        <button class="btn-primary" onclick="placeOrder()">
                            <i class="fas fa-credit-card"></i> Place Order - ₹${cartTotal}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Place Order
function placeOrder() {
    showNotification('🔄 Processing your order...', 'info');
    
    setTimeout(() => {
        showNotification('✅ Order placed successfully!', 'success');
        setTimeout(() => {
            showNotification('📱 You will receive SMS updates about your order', 'info');
            cart = [];
            updateCartUI();
            closeCart();
            closeModal(document.querySelector('.checkout-modal .close'));
        }, 1500);
    }, 2000);
}

// Close Modal
function closeModal(element) {
    const modal = element.closest('.modal');
    modal.remove();
    document.body.style.overflow = 'auto';
}

// View Chef Menu
function viewChefMenu(chefId) {
    closeModal(document.querySelector('.chef-profile-modal .close'));
    showNotification('📋 Loading chef menu...', 'info');
    setTimeout(() => {
        showNotification('✅ Menu loaded! Scroll down to see dishes.', 'success');
    }, 1000);
}

// Enhanced notification system for food marketplace
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.food-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `food-notification food-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
});


// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values - check for all possible field IDs
            const name = document.getElementById('contactName')?.value || 
                        document.getElementById('fullName')?.value || 
                        document.getElementById('firstName')?.value;
            const email = document.getElementById('contactEmail')?.value || 
                         document.getElementById('email')?.value;
            const phone = document.getElementById('phone')?.value || '';
            const subject = document.getElementById('contactSubject')?.value || 
                           document.getElementById('subject')?.value || '';
            const message = document.getElementById('contactMessage')?.value || 
                           document.getElementById('message')?.value;
            
            // Simulate form submission (in production, this would send to a server)
            console.log('Contact Form Submitted:', {
                name: name,
                email: email,
                phone: phone,
                subject: subject,
                message: message
            });
            
            // Hide form and show success message
            contactForm.style.display = 'none';
            const successElement = document.getElementById('contactSuccess') || 
                                  document.getElementById('editorialSuccess') || 
                                  document.getElementById('centeredSuccess') ||
                                  document.getElementById('professionalSuccess') ||
                                  document.getElementById('modernSuccess');
            if (successElement) {
                successElement.style.display = 'block';
            }
            
            // Reset form after 3 seconds and show it again
            setTimeout(function() {
                contactForm.reset();
                contactForm.style.display = 'flex';
                if (successElement) {
                    successElement.style.display = 'none';
                }
            }, 3000);
        });
    }
});
