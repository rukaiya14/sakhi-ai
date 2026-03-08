// Admin Dashboard JavaScript - SheBalance

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadDashboardData();
    initializeCharts();
    setupEventListeners();
    loadSettings();
});

// Check if user is authenticated as admin
function checkAuthentication() {
    const userData = localStorage.getItem('shebalance_user');
    
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    // Only admin can access this dashboard
    if (user.role !== 'admin') {
        if (user.role === 'buyer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.role === 'corporate') {
            window.location.href = 'corporate-dashboard.html';
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
        document.getElementById('adminName').textContent = user.name;
    }
}

// Load dashboard statistics
function loadDashboardData() {
    // Simulate loading platform statistics
    const stats = {
        totalUsers: 3566,
        activeArtisans: 1248,
        totalBuyers: 2318,
        monthlyRevenue: 125000
    };
    
    // Update stat cards with animation
    animateValue('totalUsers', 0, stats.totalUsers, 1500);
    animateValue('activeArtisans', 0, stats.activeArtisans, 1500);
    animateValue('totalBuyers', 0, stats.totalBuyers, 1500);
    animateValue('monthlyRevenue', 0, stats.monthlyRevenue, 1500, true);
    
    // Load recent users
    loadRecentUsers();
    
    // Load recent orders
    loadRecentOrders();
}

// Animate number counting
function animateValue(id, start, end, duration, isCurrency = false) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        if (isCurrency) {
            element.textContent = '₹' + Math.floor(current).toLocaleString('en-IN');
        } else {
            element.textContent = Math.floor(current).toLocaleString('en-IN');
        }
    }, 16);
}

// Initialize charts
function initializeCharts() {
    // User Activity Chart
    const userActivityCtx = document.getElementById('userActivityChart');
    if (userActivityCtx) {
        new Chart(userActivityCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'New Users',
                    data: [120, 190, 150, 220, 280, 310, 290, 340, 380, 420, 450, 480],
                    backgroundColor: '#C97D60',
                    borderRadius: 8
                }, {
                    label: 'Active Users',
                    data: [200, 250, 280, 320, 380, 420, 450, 480, 520, 580, 620, 680],
                    backgroundColor: '#5D4037',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [85000, 92000, 98000, 105000, 115000, 125000],
                    borderColor: '#5D4037',
                    backgroundColor: 'rgba(93, 64, 55, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }
    
    // User Distribution Chart
    const distributionCtx = document.getElementById('distributionChart');
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Artisans', 'Buyers', 'Corporate', 'Admin'],
                datasets: [{
                    data: [1248, 1918, 400, 10],
                    backgroundColor: ['#5D4037', '#C97D60', '#8D6E63', '#3E2723']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Load recent users
function loadRecentUsers() {
    const users = [
        { id: 1, name: 'Priya Sharma', email: 'priya@example.com', role: 'Artisan', status: 'active', joined: '2024-01-15' },
        { id: 2, name: 'Rahul Kumar', email: 'rahul@example.com', role: 'Buyer', status: 'active', joined: '2024-01-14' },
        { id: 3, name: 'Anjali Verma', email: 'anjali@example.com', role: 'Artisan', status: 'pending', joined: '2024-01-13' },
        { id: 4, name: 'Vikram Singh', email: 'vikram@example.com', role: 'Corporate', status: 'active', joined: '2024-01-12' },
        { id: 5, name: 'Meera Patel', email: 'meera@example.com', role: 'Artisan', status: 'active', joined: '2024-01-11' }
    ];
    
    const tbody = document.getElementById('recentUsersTable');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>${user.joined}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load recent orders
function loadRecentOrders() {
    const orders = [
        { id: 1001, customer: 'Rahul Kumar', artisan: 'Priya Sharma', amount: 2500, status: 'completed', date: '2024-01-15' },
        { id: 1002, customer: 'Vikram Singh', artisan: 'Meera Patel', amount: 5000, status: 'pending', date: '2024-01-14' },
        { id: 1003, customer: 'Anjali Verma', artisan: 'Sunita Devi', amount: 1800, status: 'active', date: '2024-01-13' },
        { id: 1004, customer: 'Priya Sharma', artisan: 'Kavya Singh', amount: 3200, status: 'completed', date: '2024-01-12' },
        { id: 1005, customer: 'Rahul Kumar', artisan: 'Rukaiya Khan', amount: 4500, status: 'active', date: '2024-01-11' }
    ];
    
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.artisan}</td>
            <td>₹${order.amount.toLocaleString('en-IN')}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>${order.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Section navigation
function showSection(sectionId, evt) {
    // Prevent default link behavior
    if (evt) {
        evt.preventDefault();
    }
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Add active class to clicked nav item
    if (evt && evt.target) {
        const navItem = evt.target.closest('.nav-item');
        if (navItem) {
            navItem.classList.add('active');
        }
    } else {
        // If no event, find the nav item by href
        const navItem = document.querySelector(`a[href="#${sectionId}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    }
    
    // Load section-specific data
    if (sectionId === 'users') {
        if (typeof loadAllUsers === 'function') {
            loadAllUsers();
        }
    } else if (sectionId === 'artisans') {
        if (typeof loadArtisanVerification === 'function') {
            loadArtisanVerification();
        }
    } else if (sectionId === 'orders') {
        if (typeof loadOrderManagement === 'function') {
            loadOrderManagement();
        }
    }
}

// User management functions
function viewUser(userId) {
    showNotification(`📋 Loading user #${userId} details...`, 'info');
}

function editUser(userId) {
    showNotification(`✏️ Opening edit form for user #${userId}...`, 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        showNotification(`🗑️ User #${userId} deleted successfully`, 'success');
        loadRecentUsers();
    }
}

// Order management functions
function viewOrder(orderId) {
    showNotification(`📋 Loading order #${orderId} details...`, 'info');
}

// Search functionality
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    showNotification(`🔍 Searching for "${searchTerm}"...`, 'info');
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
        if (user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (user.role === 'buyer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.role === 'corporate') {
            window.location.href = 'corporate-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        // Add any dropdown close logic here
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


// Invisible Labour Management Functions

// Sample labour data
const labourData = [
    {
        id: 1,
        artisanName: 'Sunita Devi',
        orderId: 'ORD-2024-001',
        product: 'Embroidered Saree',
        craftHours: 12,
        householdHours: 40,
        status: 'In Progress',
        notes: 'Intricate embroidery work with traditional patterns'
    },
    {
        id: 2,
        artisanName: 'Meera Patel',
        orderId: 'ORD-2024-002',
        product: 'Handwoven Shawl',
        craftHours: 28,
        householdHours: 45,
        status: 'Completed',
        notes: 'Complex weaving pattern, high quality wool'
    },
    {
        id: 3,
        artisanName: 'Kavya Singh',
        orderId: 'ORD-2024-003',
        product: 'Traditional Thali Meal Service',
        craftHours: 6,
        householdHours: 38,
        status: 'In Progress',
        notes: 'Daily meal preparation for corporate client'
    },
    {
        id: 4,
        artisanName: 'Priya Sharma',
        orderId: 'ORD-2024-004',
        product: 'Bridal Henna Design',
        craftHours: 4,
        householdHours: 35,
        status: 'Completed',
        notes: 'Full arm and leg bridal henna application'
    },
    {
        id: 5,
        artisanName: 'Anjali Reddy',
        orderId: 'ORD-2024-005',
        product: 'Embroidered Cushion Covers (Set of 6)',
        craftHours: 15,
        householdHours: 42,
        status: 'In Progress',
        notes: 'Matching set with floral patterns'
    },
    {
        id: 6,
        artisanName: 'Lakshmi Nair',
        orderId: 'ORD-2024-006',
        product: 'Handmade Pickles & Preserves',
        craftHours: 8,
        householdHours: 40,
        status: 'Completed',
        notes: 'Traditional Kerala style pickles, bulk order'
    }
];

// Load labour table
function loadLabourTable() {
    const tableBody = document.getElementById('labourTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    labourData.forEach(labour => {
        const totalHours = labour.craftHours + labour.householdHours;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${labour.artisanName}</strong></td>
            <td>${labour.orderId}</td>
            <td>${labour.product}</td>
            <td>
                <div class="labour-input-group">
                    <input type="number" value="${labour.craftHours}" 
                           id="craft-${labour.id}" min="0" step="0.5">
                    <span>h</span>
                </div>
            </td>
            <td>${labour.householdHours}h</td>
            <td><strong>${totalHours}h</strong></td>
            <td>
                <span class="status-badge ${labour.status === 'Completed' ? 'completed' : 'in-progress'}">
                    ${labour.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-save" onclick="saveLabourHours(${labour.id})">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <button class="btn-action btn-view" onclick="viewLabourDetails(${labour.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Save labour hours
function saveLabourHours(labourId) {
    const craftInput = document.getElementById(`craft-${labourId}`);
    const newHours = parseFloat(craftInput.value);
    
    const labour = labourData.find(l => l.id === labourId);
    if (labour) {
        labour.craftHours = newHours;
        
        // Show success message
        showNotification('Labour hours updated successfully!', 'success');
        
        // Reload table
        loadLabourTable();
    }
}

// View labour details
function viewLabourDetails(labourId) {
    const labour = labourData.find(l => l.id === labourId);
    if (!labour) return;
    
    const totalHours = labour.craftHours + labour.householdHours;
    
    const modalContent = document.getElementById('labourModalContent');
    modalContent.innerHTML = `
        <div class="labour-detail-section">
            <h3><i class="fas fa-user"></i> Artisan Information</h3>
            <div class="labour-info-grid">
                <div class="labour-info-item">
                    <label>Artisan Name</label>
                    <div class="value">${labour.artisanName}</div>
                </div>
                <div class="labour-info-item">
                    <label>Order ID</label>
                    <div class="value">${labour.orderId}</div>
                </div>
                <div class="labour-info-item">
                    <label>Product/Service</label>
                    <div class="value">${labour.product}</div>
                </div>
                <div class="labour-info-item">
                    <label>Status</label>
                    <div class="value">
                        <span class="status-badge ${labour.status === 'Completed' ? 'completed' : 'in-progress'}">
                            ${labour.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="labour-detail-section">
            <h3><i class="fas fa-clock"></i> Time Investment Breakdown</h3>
            <div class="labour-info-grid">
                <div class="labour-info-item">
                    <label><i class="fas fa-hands-helping"></i> Craft Hours</label>
                    <div class="value">${labour.craftHours}h</div>
                </div>
                <div class="labour-info-item">
                    <label><i class="fas fa-home"></i> Household Hours</label>
                    <div class="value">${labour.householdHours}h</div>
                </div>
                <div class="labour-info-item">
                    <label><i class="fas fa-hourglass-half"></i> Total Investment</label>
                    <div class="value">${totalHours}h</div>
                </div>
                <div class="labour-info-item">
                    <label><i class="fas fa-percentage"></i> Craft Percentage</label>
                    <div class="value">${Math.round((labour.craftHours / totalHours) * 100)}%</div>
                </div>
            </div>
            
            <div class="labour-aura">
                <h4><i class="fas fa-heart"></i> Labour Aura Visualization</h4>
                <div class="time-breakdown">
                    ${labour.householdHours}h household + ${labour.craftHours}h craft = ${totalHours}h total investment
                </div>
                <p style="margin-top: 15px; color: #666; font-style: italic;">
                    "This piece represents ${totalHours} hours of dedication, balancing family responsibilities 
                    with skilled craftsmanship."
                </p>
            </div>
        </div>
        
        <div class="labour-detail-section">
            <h3><i class="fas fa-sticky-note"></i> Notes</h3>
            <p style="color: #666; line-height: 1.6;">${labour.notes}</p>
        </div>
    `;
    
    document.getElementById('labourModal').style.display = 'block';
}

// Close labour modal
function closeLabourModal() {
    document.getElementById('labourModal').style.display = 'none';
}

// Export labour report
function exportLabourReport() {
    showNotification('Labour report exported successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize labour management when section is shown
document.addEventListener('DOMContentLoaded', function() {
    loadLabourTable();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('labourModal');
    if (event.target === modal) {
        closeLabourModal();
    }
};


// Admin Carousel Functionality
let adminCurrentSlide = 0;
const adminTotalSlides = 10;

function initAdminCarousel() {
    const indicators = document.getElementById('adminIndicators');
    if (indicators) {
        for (let i = 0; i < adminTotalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator' + (i === 0 ? ' active' : '');
            indicator.onclick = () => goToAdminSlide(i);
            indicators.appendChild(indicator);
        }
    }
    
    // Auto-advance carousel
    setInterval(() => {
        moveAdminCarousel(1);
    }, 5000);
}

function moveAdminCarousel(direction) {
    adminCurrentSlide += direction;
    
    if (adminCurrentSlide < 0) {
        adminCurrentSlide = adminTotalSlides - 1;
    } else if (adminCurrentSlide >= adminTotalSlides) {
        adminCurrentSlide = 0;
    }
    
    updateAdminCarousel();
}

function goToAdminSlide(index) {
    adminCurrentSlide = index;
    updateAdminCarousel();
}

function updateAdminCarousel() {
    const track = document.getElementById('adminCarouselTrack');
    const indicators = document.querySelectorAll('#adminIndicators .carousel-indicator');
    
    if (track) {
        track.style.transform = `translateX(-${adminCurrentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        if (index === adminCurrentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Initialize carousel when page loads
document.addEventListener('DOMContentLoaded', function() {
    initAdminCarousel();
});


// AI Health Monitoring Functions
function triggerPayout(artisanName, amount) {
    if (confirm(`Confirm emergency payout?\n\nArtisan: ${artisanName}\nAmount: ₹${amount}\n\nThis will initiate immediate disbursement.`)) {
        alert(`✅ Emergency Payout Initiated!\n\nArtisan: ${artisanName}\nAmount: ₹${amount}\n\nFunds will be transferred within 2 hours.\nCommunity care team has been notified.`);
        // In a real app, this would trigger the AWS Lambda function
    }
}

function alertCommunity(artisanName) {
    alert(`📢 Community Alert Sent!\n\nArtisan: ${artisanName}\n\nAI-Sakhi community members in the area have been notified via WhatsApp.\nLocal support coordinators will reach out within 24 hours.`);
    // In a real app, this would trigger WhatsApp notifications
}

function checkWellness(artisanName) {
    alert(`📞 Wellness Check Initiated!\n\nArtisan: ${artisanName}\n\nA wellness check call will be made within the next hour.\nCommunity support team has been assigned.`);
    // In a real app, this would schedule a wellness check
}

function viewHistory(artisanName) {
    alert(`📊 Activity History for ${artisanName}\n\nLast 30 Days:\n• Active Days: 24\n• Partial Activity: 4\n• Inactive Days: 2\n\nEarnings: ₹18,500\nOrders Completed: 12\nAverage Rating: 4.8\n\nNo previous health alerts.`);
    // In a real app, this would show detailed history
}


// Load all users for user management section
function loadAllUsers() {
    const users = [
        { id: 1, name: 'Priya Sharma', email: 'priya@example.com', role: 'Artisan', status: 'active', joined: '2024-01-15' },
        { id: 2, name: 'Rahul Kumar', email: 'rahul@example.com', role: 'Buyer', status: 'active', joined: '2024-01-14' },
        { id: 3, name: 'Anjali Verma', email: 'anjali@example.com', role: 'Artisan', status: 'pending', joined: '2024-01-13' },
        { id: 4, name: 'Vikram Singh', email: 'vikram@example.com', role: 'Corporate', status: 'active', joined: '2024-01-12' },
        { id: 5, name: 'Meera Patel', email: 'meera@example.com', role: 'Artisan', status: 'active', joined: '2024-01-11' },
        { id: 6, name: 'Sunita Devi', email: 'sunita@example.com', role: 'Artisan', status: 'active', joined: '2024-01-10' },
        { id: 7, name: 'Kavya Singh', email: 'kavya@example.com', role: 'Artisan', status: 'active', joined: '2024-01-09' },
        { id: 8, name: 'Rukaiya Khan', email: 'rukaiya@example.com', role: 'Artisan', status: 'active', joined: '2024-01-08' },
        { id: 9, name: 'Neha Gupta', email: 'neha@example.com', role: 'Buyer', status: 'active', joined: '2024-01-07' },
        { id: 10, name: 'Amit Patel', email: 'amit@example.com', role: 'Buyer', status: 'active', joined: '2024-01-06' },
        { id: 11, name: 'Rekha Kumari', email: 'rekha@example.com', role: 'Artisan', status: 'active', joined: '2024-01-05' },
        { id: 12, name: 'Sanjay Mehta', email: 'sanjay@example.com', role: 'Corporate', status: 'active', joined: '2024-01-04' }
    ];
    
    const tbody = document.getElementById('allUsersTable');
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>#${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>${user.joined}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewUser(${user.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteUser(${user.id})" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Search all users
function searchAllUsers() {
    const searchTerm = document.getElementById('allUsersSearch').value.toLowerCase();
    const table = document.getElementById('allUsersTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const text = row.textContent.toLowerCase();
        
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// Open add user modal
function openAddUserModal() {
    alert('Add User Modal - Coming Soon!\n\nThis will open a form to add new users with fields:\n- Name\n- Email\n- Role (Artisan/Buyer/Corporate/Admin)\n- Phone Number\n- Status');
}

// View user details
function viewUser(userId) {
    alert(`View details for User ID: ${userId}\n\nThis will show complete user profile, activity history, and statistics.`);
}

// Edit user
function editUser(userId) {
    alert(`Edit User ID: ${userId}\n\nThis will open a form to edit user details.`);
}

// Delete user
function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete User ID: ${userId}?\n\nThis action cannot be undone.`)) {
        alert(`User ID: ${userId} has been deleted.`);
        // Reload the table
        loadAllUsers();
    }
}


// Artisan Verification Data
const artisanApplications = [
    {
        id: 1,
        name: 'Lakshmi Devi',
        skill: 'Embroidery Artist',
        location: 'Jaipur, Rajasthan',
        phone: '+91 98765 43210',
        experience: '8 years',
        status: 'pending',
        appliedDate: '2024-02-25',
        documents: ['Aadhaar Card', 'Skill Certificate', 'Portfolio Images'],
        avatar: 'LD',
        color: '#E91E63'
    },
    {
        id: 2,
        name: 'Fatima Khan',
        skill: 'Henna Artist',
        location: 'Lucknow, UP',
        phone: '+91 98765 43211',
        experience: '5 years',
        status: 'pending',
        appliedDate: '2024-02-24',
        documents: ['Aadhaar Card', 'Training Certificate', 'Work Samples'],
        avatar: 'FK',
        color: '#9C27B0'
    },
    {
        id: 3,
        name: 'Geeta Sharma',
        skill: 'Home Chef',
        location: 'Delhi',
        phone: '+91 98765 43212',
        experience: '10 years',
        status: 'pending',
        appliedDate: '2024-02-23',
        documents: ['Aadhaar Card', 'Food Safety Certificate', 'Menu Samples'],
        avatar: 'GS',
        color: '#FF9800'
    },
    {
        id: 4,
        name: 'Asha Patel',
        skill: 'Tailoring',
        location: 'Ahmedabad, Gujarat',
        phone: '+91 98765 43213',
        experience: '12 years',
        status: 'pending',
        appliedDate: '2024-02-22',
        documents: ['Aadhaar Card', 'Tailoring Certificate', 'Client Reviews'],
        avatar: 'AP',
        color: '#3F51B5'
    },
    {
        id: 5,
        name: 'Priya Sharma',
        skill: 'Crochet Artist',
        location: 'Mumbai, Maharashtra',
        phone: '+91 98765 43214',
        experience: '6 years',
        status: 'verified',
        appliedDate: '2024-02-20',
        verifiedDate: '2024-02-21',
        documents: ['Aadhaar Card', 'Skill Certificate', 'Portfolio'],
        avatar: 'PS',
        color: '#4CAF50'
    },
    {
        id: 6,
        name: 'Meera Kumari',
        skill: 'Weaving',
        location: 'Varanasi, UP',
        phone: '+91 98765 43215',
        experience: '15 years',
        status: 'verified',
        appliedDate: '2024-02-18',
        verifiedDate: '2024-02-19',
        documents: ['Aadhaar Card', 'Weaving Certificate', 'Product Samples'],
        avatar: 'MK',
        color: '#00BCD4'
    },
    {
        id: 7,
        name: 'Radha Singh',
        skill: 'Bakery Chef',
        location: 'Bangalore, Karnataka',
        phone: '+91 98765 43216',
        experience: '4 years',
        status: 'rejected',
        appliedDate: '2024-02-15',
        rejectedDate: '2024-02-16',
        rejectionReason: 'Incomplete documentation',
        documents: ['Aadhaar Card'],
        avatar: 'RS',
        color: '#F44336'
    },
    {
        id: 8,
        name: 'Kavita Verma',
        skill: 'Pottery',
        location: 'Jaipur, Rajasthan',
        phone: '+91 98765 43217',
        experience: '7 years',
        status: 'pending',
        appliedDate: '2024-02-26',
        documents: ['Aadhaar Card', 'Craft Certificate', 'Gallery Photos'],
        avatar: 'KV',
        color: '#795548'
    }
];

// Load artisan verification cards
function loadArtisanVerification(filter = 'all') {
    const grid = document.getElementById('artisanVerificationGrid');
    if (!grid) return;
    
    let filteredArtisans = artisanApplications;
    if (filter !== 'all') {
        filteredArtisans = artisanApplications.filter(a => a.status === filter);
    }
    
    grid.innerHTML = filteredArtisans.map(artisan => `
        <div class="artisan-verification-card ${artisan.status}" data-status="${artisan.status}">
            <div class="artisan-card-header">
                <div class="artisan-card-avatar" style="background: ${artisan.color};">
                    ${artisan.avatar}
                </div>
                <div class="artisan-card-info">
                    <h3>${artisan.name}</h3>
                    <p>${artisan.skill}</p>
                    <span class="verification-status-badge ${artisan.status}">
                        <i class="fas fa-${artisan.status === 'pending' ? 'clock' : artisan.status === 'verified' ? 'check-circle' : 'times-circle'}"></i>
                        ${artisan.status.charAt(0).toUpperCase() + artisan.status.slice(1)}
                    </span>
                </div>
            </div>
            
            <div class="artisan-details-grid">
                <div class="detail-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${artisan.location}</span>
                </div>
                <div class="detail-row">
                    <i class="fas fa-phone"></i>
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${artisan.phone}</span>
                </div>
                <div class="detail-row">
                    <i class="fas fa-briefcase"></i>
                    <span class="detail-label">Experience:</span>
                    <span class="detail-value">${artisan.experience}</span>
                </div>
                <div class="detail-row">
                    <i class="fas fa-calendar"></i>
                    <span class="detail-label">Applied:</span>
                    <span class="detail-value">${artisan.appliedDate}</span>
                </div>
            </div>
            
            <div class="documents-section">
                <h4><i class="fas fa-file-alt"></i> Submitted Documents</h4>
                <div class="document-list">
                    ${artisan.documents.map(doc => `
                        <div class="document-item">
                            <span><i class="fas fa-file-pdf"></i> ${doc}</span>
                            <button onclick="viewDocument('${artisan.name}', '${doc}')">View</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${artisan.status === 'pending' ? `
                <div class="verification-actions">
                    <button class="btn-verify" onclick="verifyArtisan(${artisan.id}, '${artisan.name}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="rejectArtisan(${artisan.id}, '${artisan.name}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            ` : artisan.status === 'verified' ? `
                <button class="btn-review" onclick="viewArtisanProfile(${artisan.id})">
                    <i class="fas fa-user"></i> View Profile
                </button>
                <div class="verification-notes">
                    <strong>Verified on:</strong> ${artisan.verifiedDate}
                </div>
            ` : `
                <div class="verification-notes">
                    <strong>Rejection Reason:</strong> ${artisan.rejectionReason}
                    <br><strong>Rejected on:</strong> ${artisan.rejectedDate}
                </div>
                <button class="btn-review" onclick="reviewRejection(${artisan.id})">
                    <i class="fas fa-redo"></i> Review Again
                </button>
            `}
        </div>
    `).join('');
}

// Filter verification by status
function filterVerification(status, evt) {
    // Update active button
    if (evt) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        evt.target.classList.add('active');
    }
    
    // Load filtered artisans
    loadArtisanVerification(status);
}

// Search artisans
function searchArtisans() {
    const searchTerm = document.getElementById('artisanSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.artisan-verification-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// View document
function viewDocument(artisanName, docName) {
    alert(`Viewing Document\n\nArtisan: ${artisanName}\nDocument: ${docName}\n\nThis will open the document viewer with the uploaded file.`);
}

// Verify artisan
function verifyArtisan(artisanId, artisanName) {
    if (confirm(`Approve ${artisanName} as a verified artisan?\n\nThis will:\n- Grant full platform access\n- Enable them to receive orders\n- Add verification badge to profile`)) {
        alert(`✓ ${artisanName} has been successfully verified!\n\nNotification sent to artisan via SMS and email.`);
        
        // Update the artisan status
        const artisan = artisanApplications.find(a => a.id === artisanId);
        if (artisan) {
            artisan.status = 'verified';
            artisan.verifiedDate = new Date().toISOString().split('T')[0];
        }
        
        // Reload the grid
        loadArtisanVerification();
    }
}

// Reject artisan
function rejectArtisan(artisanId, artisanName) {
    const reason = prompt(`Reject ${artisanName}'s application?\n\nPlease provide a reason for rejection:`);
    
    if (reason && reason.trim()) {
        alert(`✗ ${artisanName}'s application has been rejected.\n\nReason: ${reason}\n\nNotification sent to artisan with feedback.`);
        
        // Update the artisan status
        const artisan = artisanApplications.find(a => a.id === artisanId);
        if (artisan) {
            artisan.status = 'rejected';
            artisan.rejectedDate = new Date().toISOString().split('T')[0];
            artisan.rejectionReason = reason;
        }
        
        // Reload the grid
        loadArtisanVerification();
    }
}

// View artisan profile
function viewArtisanProfile(artisanId) {
    const artisan = artisanApplications.find(a => a.id === artisanId);
    if (artisan) {
        alert(`View Full Profile\n\nArtisan: ${artisan.name}\nSkill: ${artisan.skill}\nStatus: Verified\n\nThis will open the complete artisan profile with:\n- Portfolio\n- Order history\n- Customer reviews\n- Earnings statistics`);
    }
}

// Review rejection
function reviewRejection(artisanId) {
    const artisan = artisanApplications.find(a => a.id === artisanId);
    if (artisan) {
        if (confirm(`Review ${artisan.name}'s rejected application again?\n\nPrevious rejection reason:\n${artisan.rejectionReason}\n\nChange status to pending for re-review?`)) {
            artisan.status = 'pending';
            delete artisan.rejectedDate;
            delete artisan.rejectionReason;
            alert(`${artisan.name}'s application moved back to pending queue.`);
            loadArtisanVerification();
        }
    }
}

// Add extended data to artisan applications
artisanApplications.forEach((artisan, index) => {
    const extendedData = [
        {
            bio: 'Specialized in traditional Rajasthani embroidery with intricate mirror work and thread designs.',
            portfolio: [
                { title: 'Bridal Lehenga Embroidery', type: 'Embroidery', image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134417.png' },
                { title: 'Wall Hanging Decorative', type: 'Decorative', image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134450.png' },
                { title: 'Cushion Covers Home Decor', type: 'Home Decor', image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134506.png' },
                { title: 'Saree Border', type: 'Traditional', image: 'Buyer Images/Embroidery/Screenshot 2026-02-26 134523.png' }
            ],
            reviews: [
                { author: 'Priya M.', rating: 5, text: 'Excellent work! The embroidery is stunning.', date: '2024-02-10' },
                { author: 'Rahul K.', rating: 5, text: 'Very professional and timely delivery.', date: '2024-01-28' }
            ],
            stats: { orders: 45, rating: 4.8, earnings: '₹85,000', completion: '98%' }
        },
        {
            bio: 'Expert in bridal henna designs with Arabic and Indian fusion patterns.',
            portfolio: [
                { title: 'Bridal Mehndi', type: 'Wedding', image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124505.png' },
                { title: 'Arabic Design', type: 'Modern', image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124627.png' },
                { title: 'Festival Special', type: 'Traditional', image: 'Buyer Images/Henna Artist/Screenshot 2026-02-26 124918.png' }
            ],
            reviews: [
                { author: 'Ayesha S.', rating: 5, text: 'Beautiful designs! Highly recommended.', date: '2024-02-15' }
            ],
            stats: { orders: 32, rating: 4.9, earnings: '₹48,000', completion: '100%' }
        },
        {
            bio: 'Specializing in North Indian cuisine with authentic home-style cooking.',
            portfolio: [
                { title: 'Wedding Catering', type: 'Events', image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 130937.png' },
                { title: 'Tiffin Service', type: 'Daily Meals', image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 131030.png' },
                { title: 'Party Menu', type: 'Special Occasions', image: 'Buyer Images/Home Chef/Screenshot 2026-02-26 131102.png' }
            ],
            reviews: [
                { author: 'Vikram P.', rating: 5, text: 'Delicious food! Tastes like home.', date: '2024-02-12' },
                { author: 'Neha G.', rating: 4, text: 'Great service and quality.', date: '2024-01-30' }
            ],
            stats: { orders: 78, rating: 4.7, earnings: '₹125,000', completion: '95%' }
        },
        {
            bio: 'Expert in custom tailoring for traditional and modern wear with perfect fitting.',
            portfolio: [
                { title: 'Bridal Blouse', type: 'Wedding', image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 132951.png' },
                { title: 'Salwar Kameez', type: 'Traditional', image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133004.png' },
                { title: 'Alterations', type: 'Services', image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133138.png' },
                { title: 'Designer Wear', type: 'Custom', image: 'Buyer Images/Tailoring/Screenshot 2026-02-26 133151.png' }
            ],
            reviews: [
                { author: 'Anjali V.', rating: 5, text: 'Perfect fitting! Very satisfied.', date: '2024-02-08' }
            ],
            stats: { orders: 156, rating: 4.9, earnings: '₹210,000', completion: '97%' }
        },
        {
            bio: 'Creating beautiful handmade crochet items including clothing, accessories, and home decor.',
            portfolio: [
                { title: 'Baby Blankets', type: 'Kids', image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134626.png' },
                { title: 'Handbags', type: 'Accessories', image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134639.png' },
                { title: 'Table Runners', type: 'Home Decor', image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134814.png' }
            ],
            reviews: [
                { author: 'Meera K.', rating: 5, text: 'Lovely crochet work!', date: '2024-02-05' }
            ],
            stats: { orders: 64, rating: 4.8, earnings: '₹92,000', completion: '99%' }
        },
        {
            bio: 'Traditional Banarasi weaving with silk and zari work for sarees and fabrics.',
            portfolio: [
                { title: 'Banarasi Saree', type: 'Traditional', image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131342.png' },
                { title: 'Silk Fabric', type: 'Material', image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131356.png' },
                { title: 'Dupattas', type: 'Accessories', image: 'Buyer Images/Weaving/Screenshot 2026-02-26 131527.png' }
            ],
            reviews: [
                { author: 'Sanjay M.', rating: 5, text: 'Authentic Banarasi work!', date: '2024-02-01' }
            ],
            stats: { orders: 89, rating: 4.9, earnings: '₹185,000', completion: '96%' }
        },
        {
            bio: 'Specializing in custom cakes and pastries for all occasions.',
            portfolio: [
                { title: 'Wedding Cake', type: 'Special', image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 123738.png' },
                { title: 'Birthday Cakes', type: 'Celebration', image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 130443.png' },
                { title: 'Pastries', type: 'Daily', image: 'Buyer Images/Bakery and Pastery chef/Screenshot 2026-02-26 130451.png' }
            ],
            reviews: [],
            stats: { orders: 0, rating: 0, earnings: '₹0', completion: '0%' }
        },
        {
            bio: 'Handcrafted pottery items including decorative pieces and functional kitchenware.',
            portfolio: [
                { title: 'Clay Pots', type: 'Functional', image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134824.png' },
                { title: 'Decorative Vases', type: 'Decor', image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134844.png' },
                { title: 'Terracotta Items', type: 'Traditional', image: 'Buyer Images/Crochet/Screenshot 2026-02-26 134903.png' }
            ],
            reviews: [],
            stats: { orders: 0, rating: 0, earnings: '₹0', completion: '0%' }
        }
    ];
    
    if (extendedData[index]) {
        Object.assign(artisan, extendedData[index]);
    }
});

// Override loadArtisanVerification to use table format
function loadArtisanVerification(filter = 'all') {
    const tbody = document.getElementById('artisanVerificationTable');
    if (!tbody) return;
    
    let filteredArtisans = artisanApplications;
    if (filter !== 'all') {
        filteredArtisans = artisanApplications.filter(a => a.status === filter);
    }
    
    tbody.innerHTML = filteredArtisans.map(artisan => `
        <tr data-status="${artisan.status}">
            <td>
                <div class="artisan-cell">
                    <div class="artisan-avatar-small" style="background: ${artisan.color};">
                        ${artisan.avatar}
                    </div>
                    <div class="artisan-name-info">
                        <strong>${artisan.name}</strong>
                        <small>${artisan.phone}</small>
                    </div>
                </div>
            </td>
            <td>${artisan.skill}</td>
            <td>${artisan.location}</td>
            <td>${artisan.experience}</td>
            <td>${artisan.appliedDate}</td>
            <td>
                <span class="documents-count" onclick="viewDocuments(${artisan.id})">
                    <i class="fas fa-file-alt"></i>
                    ${artisan.documents.length} docs
                </span>
            </td>
            <td>
                <span class="verification-status-badge ${artisan.status}">
                    <i class="fas fa-${artisan.status === 'pending' ? 'clock' : artisan.status === 'verified' ? 'check-circle' : 'times-circle'}"></i>
                    ${artisan.status.charAt(0).toUpperCase() + artisan.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="verification-actions-table">
                    <button class="btn-table-action btn-view-profile" onclick="openArtisanProfile(${artisan.id})">
                        <i class="fas fa-user"></i> Profile
                    </button>
                    ${artisan.status === 'pending' ? `
                        <button class="btn-table-action btn-approve" onclick="verifyArtisan(${artisan.id}, '${artisan.name}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn-table-action btn-reject-table" onclick="rejectArtisan(${artisan.id}, '${artisan.name}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : artisan.status === 'rejected' ? `
                        <button class="btn-table-action btn-review-again" onclick="reviewRejection(${artisan.id})">
                            <i class="fas fa-redo"></i> Review
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Open artisan profile modal
function openArtisanProfile(artisanId) {
    const artisan = artisanApplications.find(a => a.id === artisanId);
    if (!artisan) return;
    
    const modal = document.getElementById('artisanProfileModal');
    const content = document.getElementById('artisanProfileContent');
    
    content.innerHTML = `
        <div class="profile-header-section">
            <div class="profile-avatar-large" style="background: ${artisan.color};">
                ${artisan.avatar}
            </div>
            <div class="profile-info-section">
                <h2>${artisan.name}</h2>
                <h3>${artisan.skill}</h3>
                <span class="verification-status-badge ${artisan.status}">
                    <i class="fas fa-${artisan.status === 'pending' ? 'clock' : artisan.status === 'verified' ? 'check-circle' : 'times-circle'}"></i>
                    ${artisan.status.charAt(0).toUpperCase() + artisan.status.slice(1)}
                </span>
                <div class="profile-details-grid">
                    <div class="profile-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <strong>Location:</strong>
                        <span>${artisan.location}</span>
                    </div>
                    <div class="profile-detail-item">
                        <i class="fas fa-phone"></i>
                        <strong>Phone:</strong>
                        <span>${artisan.phone}</span>
                    </div>
                    <div class="profile-detail-item">
                        <i class="fas fa-briefcase"></i>
                        <strong>Experience:</strong>
                        <span>${artisan.experience}</span>
                    </div>
                    <div class="profile-detail-item">
                        <i class="fas fa-calendar"></i>
                        <strong>Applied:</strong>
                        <span>${artisan.appliedDate}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="profile-section">
            <h3><i class="fas fa-info-circle"></i> About</h3>
            <p style="color: #666; line-height: 1.6;">${artisan.bio}</p>
        </div>

        ${artisan.status === 'verified' ? `
        <div class="profile-section">
            <h3><i class="fas fa-chart-bar"></i> Performance Statistics</h3>
            <div class="stats-grid-profile">
                <div class="stat-card-profile">
                    <h4>${artisan.stats.orders}</h4>
                    <p>Total Orders</p>
                </div>
                <div class="stat-card-profile">
                    <h4>${artisan.stats.rating}</h4>
                    <p>Average Rating</p>
                </div>
                <div class="stat-card-profile">
                    <h4>${artisan.stats.earnings}</h4>
                    <p>Total Earnings</p>
                </div>
                <div class="stat-card-profile">
                    <h4>${artisan.stats.completion}</h4>
                    <p>Completion Rate</p>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="profile-section">
            <h3><i class="fas fa-file-alt"></i> Submitted Documents</h3>
            <div class="documents-grid">
                ${artisan.documents.map(doc => `
                    <div class="document-card">
                        <div class="document-card-info">
                            <i class="fas fa-file-pdf"></i>
                            <span>${doc}</span>
                        </div>
                        <button onclick="viewDocument('${artisan.name}', '${doc}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>

        ${artisan.portfolio && artisan.portfolio.length > 0 ? `
        <div class="profile-section">
            <h3><i class="fas fa-images"></i> Portfolio</h3>
            <div class="portfolio-grid">
                ${artisan.portfolio.map((item, index) => `
                    <div class="portfolio-item">
                        <div class="portfolio-image">
                            ${item.image ? 
                                `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px 8px 0 0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: #F5F5DC;">
                                    <i class="fas fa-image"></i>
                                </div>` 
                                : `<i class="fas fa-image"></i>`
                            }
                        </div>
                        <div class="portfolio-caption">
                            <strong>${item.title}</strong><br>
                            <small>${item.type}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${artisan.reviews && artisan.reviews.length > 0 ? `
        <div class="profile-section">
            <h3><i class="fas fa-star"></i> Customer Reviews</h3>
            <div class="reviews-list">
                ${artisan.reviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <span class="review-author">${review.author}</span>
                            <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                        </div>
                        <p class="review-text">${review.text}</p>
                        <span class="review-date">${review.date}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${artisan.status === 'rejected' ? `
        <div class="profile-section">
            <h3><i class="fas fa-exclamation-circle"></i> Rejection Details</h3>
            <div class="verification-notes">
                <strong>Reason:</strong> ${artisan.rejectionReason}<br>
                <strong>Date:</strong> ${artisan.rejectedDate}
            </div>
        </div>
        ` : ''}

        <div class="profile-actions-footer">
            ${artisan.status === 'pending' ? `
                <button class="btn-profile-action btn-profile-approve" onclick="verifyArtisanFromProfile(${artisan.id}, '${artisan.name}')">
                    <i class="fas fa-check-circle"></i> Approve Artisan
                </button>
                <button class="btn-profile-action btn-profile-reject" onclick="rejectArtisanFromProfile(${artisan.id}, '${artisan.name}')">
                    <i class="fas fa-times-circle"></i> Reject Application
                </button>
            ` : artisan.status === 'rejected' ? `
                <button class="btn-profile-action btn-profile-approve" onclick="reviewRejectionFromProfile(${artisan.id})">
                    <i class="fas fa-redo"></i> Review Again
                </button>
            ` : ''}
            <button class="btn-profile-action btn-profile-close" onclick="closeArtisanProfile()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close artisan profile modal
function closeArtisanProfile(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('artisanProfileModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// View documents list
function viewDocuments(artisanId) {
    const artisan = artisanApplications.find(a => a.id === artisanId);
    if (artisan) {
        alert(`Documents for ${artisan.name}:\n\n${artisan.documents.map((doc, i) => `${i+1}. ${doc}`).join('\n')}\n\nClick "Profile" to view and download documents.`);
    }
}

// Verify artisan from profile modal
function verifyArtisanFromProfile(artisanId, artisanName) {
    verifyArtisan(artisanId, artisanName);
    closeArtisanProfile();
}

// Reject artisan from profile modal
function rejectArtisanFromProfile(artisanId, artisanName) {
    rejectArtisan(artisanId, artisanName);
    closeArtisanProfile();
}

// Review rejection from profile modal
function reviewRejectionFromProfile(artisanId) {
    reviewRejection(artisanId);
    closeArtisanProfile();
}

// Override search to work with table
function searchArtisans() {
    const searchTerm = document.getElementById('artisanSearch').value.toLowerCase();
    const rows = document.querySelectorAll('.artisan-verification-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}


// Document viewer functionality
let currentDocument = null;

// View document with simulation
function viewDocument(artisanName, docName) {
    currentDocument = { artisanName, docName };
    const modal = document.getElementById('documentViewerModal');
    const content = document.getElementById('documentViewerContent');
    
    let documentHTML = '';
    
    // Generate different document types based on name
    if (docName.toLowerCase().includes('aadhaar') || docName.toLowerCase().includes('aadhar')) {
        documentHTML = generateAadhaarCard(artisanName);
    } else if (docName.toLowerCase().includes('certificate')) {
        documentHTML = generateCertificate(artisanName, docName);
    } else if (docName.toLowerCase().includes('portfolio') || docName.toLowerCase().includes('images') || docName.toLowerCase().includes('samples') || docName.toLowerCase().includes('photos') || docName.toLowerCase().includes('gallery')) {
        documentHTML = generatePortfolio(artisanName, docName);
    } else if (docName.toLowerCase().includes('menu')) {
        documentHTML = generateMenu(artisanName);
    } else if (docName.toLowerCase().includes('reviews') || docName.toLowerCase().includes('client')) {
        documentHTML = generateReviews(artisanName);
    } else {
        documentHTML = generateGenericDocument(artisanName, docName);
    }
    
    content.innerHTML = documentHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Generate Aadhaar Card simulation
function generateAadhaarCard(artisanName) {
    const aadhaarNumber = '#### #### ' + Math.floor(1000 + Math.random() * 9000);
    const dob = '15/08/' + (1970 + Math.floor(Math.random() * 30));
    
    return `
        <div class="document-preview">
            <div class="document-header-info">
                <div class="document-title-section">
                    <h3>Aadhaar Card</h3>
                    <p>Government of India Identity Document</p>
                </div>
                <span class="document-badge">VERIFIED</span>
            </div>
            
            <div class="document-image-placeholder">
                <i class="fas fa-id-card"></i>
                <p>Aadhaar Card Preview</p>
            </div>
            
            <div class="document-content">
                <div class="document-field">
                    <label>Full Name</label>
                    <div class="value">${artisanName}</div>
                </div>
                
                <div class="document-field">
                    <label>Aadhaar Number</label>
                    <div class="value">${aadhaarNumber}</div>
                </div>
                
                <div class="document-field">
                    <label>Date of Birth</label>
                    <div class="value">${dob}</div>
                </div>
                
                <div class="document-field">
                    <label>Gender</label>
                    <div class="value">Female</div>
                </div>
                
                <div class="document-field">
                    <label>Address</label>
                    <div class="value">House No. ${Math.floor(100 + Math.random() * 900)}, ${['Gandhi Nagar', 'Nehru Colony', 'Rajiv Chowk', 'Indira Market'][Math.floor(Math.random() * 4)]}, ${['Jaipur', 'Delhi', 'Mumbai', 'Lucknow'][Math.floor(Math.random() * 4)]}</div>
                </div>
                
                <p style="margin-top: 24px; padding: 16px; background: #FFF3E0; border-radius: 8px; color: #666; font-size: 14px;">
                    <i class="fas fa-info-circle" style="color: #f57c00;"></i>
                    This is a simulated document preview. In production, actual scanned documents would be displayed here.
                </p>
            </div>
        </div>
    `;
}

// Generate Certificate simulation
function generateCertificate(artisanName, certType) {
    const certName = certType.replace('Certificate', '').trim();
    const issueDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const certNumber = 'CERT-' + Math.floor(10000 + Math.random() * 90000);
    
    return `
        <div class="document-preview">
            <div class="document-header-info">
                <div class="document-title-section">
                    <h3>${certType}</h3>
                    <p>Professional Certification Document</p>
                </div>
                <span class="document-badge">AUTHENTIC</span>
            </div>
            
            <div class="certificate-frame">
                <h2>🏆 CERTIFICATE OF ACHIEVEMENT 🏆</h2>
                
                <p class="cert-text">This is to certify that</p>
                
                <p class="cert-name">${artisanName}</p>
                
                <p class="cert-text">
                    has successfully completed the professional training program in<br>
                    <strong style="font-size: 20px; color: #8B7355;">${certName}</strong>
                </p>
                
                <p class="cert-text">
                    and has demonstrated exceptional skills and proficiency<br>
                    in the craft and is hereby awarded this certificate.
                </p>
                
                <div style="margin: 32px 0;">
                    <p style="margin: 8px 0; color: #666;"><strong>Certificate No:</strong> ${certNumber}</p>
                    <p style="margin: 8px 0; color: #666;"><strong>Issue Date:</strong> ${issueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                
                <div class="cert-footer">
                    <div class="cert-signature">
                        <div class="signature-line"></div>
                        <p><strong>Director</strong></p>
                        <p>Skill Development Institute</p>
                    </div>
                    <div class="cert-signature">
                        <div class="signature-line"></div>
                        <p><strong>Authorized Signatory</strong></p>
                        <p>Ministry of Skill Development</p>
                    </div>
                </div>
            </div>
            
            <p style="margin-top: 24px; padding: 16px; background: #E8F5E9; border-radius: 8px; color: #666; font-size: 14px;">
                <i class="fas fa-check-circle" style="color: #2E7D32;"></i>
                Certificate verified and authenticated by issuing authority.
            </p>
        </div>
    `;
}

// Generate Portfolio simulation
function generatePortfolio(artisanName, docName) {
    const portfolioItems = [
        { title: 'Project 1', desc: 'Traditional Design', icon: 'fa-image' },
        { title: 'Project 2', desc: 'Modern Style', icon: 'fa-palette' },
        { title: 'Project 3', desc: 'Custom Work', icon: 'fa-star' },
        { title: 'Project 4', desc: 'Special Order', icon: 'fa-heart' }
    ];
    
    return `
        <div class="document-preview">
            <div class="document-header-info">
                <div class="document-title-section">
                    <h3>${docName}</h3>
                    <p>Work Samples and Portfolio by ${artisanName}</p>
                </div>
                <span class="document-badge">${portfolioItems.length} ITEMS</span>
            </div>
            
            <div class="portfolio-preview-grid">
                ${portfolioItems.map(item => `
                    <div class="portfolio-preview-item">
                        <div class="portfolio-preview-image">
                            <i class="fas ${item.icon}"></i>
                        </div>
                        <div class="portfolio-preview-caption">
                            <h4>${item.title}</h4>
                            <p>${item.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <p style="margin-top: 24px; padding: 16px; background: #F3E5F5; border-radius: 8px; color: #666; font-size: 14px;">
                <i class="fas fa-images" style="color: #7b1fa2;"></i>
                Portfolio showcasing ${artisanName}'s best work and craftsmanship. Click on individual items to view in detail.
            </p>
        </div>
    `;
}

// Generate Menu simulation
function generateMenu(artisanName) {
    const menuItems = [
        { category: 'Starters', items: ['Samosa', 'Pakora', 'Spring Rolls', 'Paneer Tikka'] },
        { category: 'Main Course', items: ['Dal Makhani', 'Paneer Butter Masala', 'Biryani', 'Roti/Naan'] },
        { category: 'Desserts', items: ['Gulab Jamun', 'Kheer', 'Jalebi', 'Rasgulla'] }
    ];
    
    return `
        <div class="document-preview">
            <div class="document-header-info">
                <div class="document-title-section">
                    <h3>Menu Samples</h3>
                    <p>Culinary Offerings by ${artisanName}</p>
                </div>
                <span class="document-badge">MENU CARD</span>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <i class="fas fa-utensils" style="font-size: 48px; color: #8B7355;"></i>
                <h2 style="margin: 16px 0; color: #8B7355; font-family: 'Georgia', serif;">Chef's Special Menu</h2>
                <p style="color: #666;">Authentic Home-Style Cooking</p>
            </div>
            
            ${menuItems.map(section => `
                <div class="document-field">
                    <label>${section.category}</label>
                    <div class="value">
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            ${section.items.map(item => `<li style="margin: 6px 0;">${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
            
            <div class="document-field" style="background: #FFF3E0; border-left-color: #f57c00;">
                <label>Special Notes</label>
                <div class="value">
                    • All dishes prepared with fresh ingredients<br>
                    • Customization available based on dietary requirements<br>
                    • Hygiene and quality assured<br>
                    • Advance booking recommended
                </div>
            </div>
        </div>
    `;
}

// Generate Reviews simulation
function generateReviews(artisanName) {
    const reviews = [
        { client: 'Mrs. Sharma', rating: 5, comment: 'Excellent work! Very professional and timely delivery.', date: '15 Jan 2024' },
        { client: 'Mr. Patel', rating: 5, comment: 'Outstanding quality. Highly recommended!', date: '08 Jan 2024' },
        { client: 'Ms. Gupta', rating: 4, comment: 'Good work. Will order again.', date: '22 Dec 2023' },
        { client: 'Mrs. Khan', rating: 5, comment: 'Beautiful craftsmanship. Very satisfied!', date: '10 Dec 2023' }
    ];
    
    return `
        <div class="document-preview">
            <div class="document-header-info">
                <div class="document-title-section">
                    <h3>Client Reviews</h3>
                    <p>Customer Testimonials for ${artisanName}</p>
                </div>
                <span class="document-badge">4.8 ★ RATING</span>
            </div>
            
            <div style="text-align: center; margin: 32px 0; padding: 24px; background: #E8F5E9; border-radius: 8px;">
                <h2 style="margin: 0; color: #2E7D32; font-size: 48px;">4.8/5.0</h2>
                <p style="margin: 8px 0; color: #666;">Based on ${reviews.length} customer reviews</p>
                <div style="color: #f57c00; font-size: 24px;">★★★★★</div>
            </div>
            
            ${reviews.map(review => `
                <div class="document-field">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <label style="margin: 0;">${review.client}</label>
                        <span style="color: #f57c00;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    </div>
                    <div class="value" style="font-style: italic; color: #666;">
                        "${review.comment}"
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: #999;">
                        <i class="fas fa-calendar"></i> ${review.date}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Generate generic document
function generateGenericDocument(artisanName, docName) {
    return `
        <div class="document-preview">
            <div class="document-header-info">
                <div class="document-title-section">
                    <h3>${docName}</h3>
                    <p>Document submitted by ${artisanName}</p>
                </div>
                <span class="document-badge">DOCUMENT</span>
            </div>
            
            <div class="document-image-placeholder">
                <i class="fas fa-file-pdf"></i>
                <p>${docName}</p>
            </div>
            
            <div class="document-content">
                <div class="document-field">
                    <label>Document Type</label>
                    <div class="value">${docName}</div>
                </div>
                
                <div class="document-field">
                    <label>Submitted By</label>
                    <div class="value">${artisanName}</div>
                </div>
                
                <div class="document-field">
                    <label>Upload Date</label>
                    <div class="value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
                
                <div class="document-field">
                    <label>Status</label>
                    <div class="value">✓ Verified and Approved</div>
                </div>
                
                <p style="margin-top: 24px; padding: 16px; background: #E3F2FD; border-radius: 8px; color: #666; font-size: 14px;">
                    <i class="fas fa-info-circle" style="color: #1565C0;"></i>
                    This document has been uploaded and is available for review.
                </p>
            </div>
        </div>
    `;
}

// Close document viewer
function closeDocumentViewer(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('documentViewerModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentDocument = null;
}

// Download document (simulation)
function downloadDocument() {
    if (currentDocument) {
        alert(`Downloading Document\n\nArtisan: ${currentDocument.artisanName}\nDocument: ${currentDocument.docName}\n\nIn production, this would download the actual PDF/image file.`);
    }
}


// Order Management Data
const ordersData = [
    {
        id: 1001,
        customer: { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 98765 12345' },
        artisan: { name: 'Priya Sharma', skill: 'Crochet Artist', phone: '+91 98765 43214' },
        product: 'Handmade Crochet Baby Blanket',
        category: 'Home Decor',
        amount: 2500,
        orderDate: '2024-02-20',
        deliveryDate: '2024-03-05',
        status: 'completed',
        paymentStatus: 'paid',
        timeline: [
            { event: 'Order Placed', date: '2024-02-20 10:30 AM', completed: true },
            { event: 'Payment Confirmed', date: '2024-02-20 10:35 AM', completed: true },
            { event: 'Artisan Accepted', date: '2024-02-20 02:15 PM', completed: true },
            { event: 'Work In Progress', date: '2024-02-22 09:00 AM', completed: true },
            { event: 'Quality Check', date: '2024-03-04 03:30 PM', completed: true },
            { event: 'Delivered', date: '2024-03-05 11:00 AM', completed: true }
        ]
    },
    {
        id: 1002,
        customer: { name: 'Anjali Verma', email: 'anjali@example.com', phone: '+91 98765 12346' },
        artisan: { name: 'Lakshmi Devi', skill: 'Embroidery Artist', phone: '+91 98765 43210' },
        product: 'Bridal Lehenga Embroidery Work',
        category: 'Wedding',
        amount: 15000,
        orderDate: '2024-02-25',
        deliveryDate: '2024-03-15',
        status: 'in-progress',
        paymentStatus: 'advance-paid',
        timeline: [
            { event: 'Order Placed', date: '2024-02-25 11:20 AM', completed: true },
            { event: 'Advance Payment Received', date: '2024-02-25 11:25 AM', completed: true },
            { event: 'Artisan Accepted', date: '2024-02-25 03:45 PM', completed: true },
            { event: 'Work In Progress', date: '2024-02-26 10:00 AM', completed: true },
            { event: 'Quality Check', date: 'Pending', completed: false },
            { event: 'Delivery', date: 'Pending', completed: false }
        ]
    },
    {
        id: 1003,
        customer: { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 12347' },
        artisan: { name: 'Geeta Sharma', skill: 'Home Chef', phone: '+91 98765 43212' },
        product: 'Wedding Catering Service (50 people)',
        category: 'Food Service',
        amount: 25000,
        orderDate: '2024-02-26',
        deliveryDate: '2024-03-10',
        status: 'pending',
        paymentStatus: 'pending',
        timeline: [
            { event: 'Order Placed', date: '2024-02-26 09:15 AM', completed: true },
            { event: 'Payment Confirmation', date: 'Awaiting', completed: false },
            { event: 'Artisan Acceptance', date: 'Pending', completed: false },
            { event: 'Service Delivery', date: 'Scheduled for 2024-03-10', completed: false }
        ]
    },
    {
        id: 1004,
        customer: { name: 'Meera Patel', email: 'meera@example.com', phone: '+91 98765 12348' },
        artisan: { name: 'Asha Patel', skill: 'Tailoring', phone: '+91 98765 43213' },
        product: 'Custom Salwar Kameez with Alterations',
        category: 'Clothing',
        amount: 3500,
        orderDate: '2024-02-24',
        deliveryDate: '2024-03-02',
        status: 'completed',
        paymentStatus: 'paid',
        timeline: [
            { event: 'Order Placed', date: '2024-02-24 02:30 PM', completed: true },
            { event: 'Payment Confirmed', date: '2024-02-24 02:35 PM', completed: true },
            { event: 'Measurements Taken', date: '2024-02-24 04:00 PM', completed: true },
            { event: 'Stitching Started', date: '2024-02-25 10:00 AM', completed: true },
            { event: 'First Fitting', date: '2024-02-28 03:00 PM', completed: true },
            { event: 'Final Delivery', date: '2024-03-02 05:30 PM', completed: true }
        ]
    },
    {
        id: 1005,
        customer: { name: 'Sanjay Mehta', email: 'sanjay@example.com', phone: '+91 98765 12349' },
        artisan: { name: 'Fatima Khan', skill: 'Henna Artist', phone: '+91 98765 43211' },
        product: 'Bridal Mehndi Service',
        category: 'Beauty Service',
        amount: 5000,
        orderDate: '2024-02-27',
        deliveryDate: '2024-03-08',
        status: 'in-progress',
        paymentStatus: 'advance-paid',
        timeline: [
            { event: 'Order Placed', date: '2024-02-27 01:00 PM', completed: true },
            { event: 'Advance Payment', date: '2024-02-27 01:10 PM', completed: true },
            { event: 'Design Consultation', date: '2024-02-27 04:00 PM', completed: true },
            { event: 'Service Scheduled', date: '2024-03-08 10:00 AM', completed: false }
        ]
    },
    {
        id: 1006,
        customer: { name: 'Priya Gupta', email: 'priya.g@example.com', phone: '+91 98765 12350' },
        artisan: { name: 'Meera Kumari', skill: 'Weaving', phone: '+91 98765 43215' },
        product: 'Banarasi Silk Saree',
        category: 'Traditional Wear',
        amount: 12000,
        orderDate: '2024-02-23',
        deliveryDate: '2024-03-01',
        status: 'completed',
        paymentStatus: 'paid',
        timeline: [
            { event: 'Order Placed', date: '2024-02-23 11:00 AM', completed: true },
            { event: 'Payment Confirmed', date: '2024-02-23 11:05 AM', completed: true },
            { event: 'Weaving Started', date: '2024-02-24 09:00 AM', completed: true },
            { event: 'Quality Inspection', date: '2024-02-29 02:00 PM', completed: true },
            { event: 'Shipped', date: '2024-02-29 06:00 PM', completed: true },
            { event: 'Delivered', date: '2024-03-01 10:30 AM', completed: true }
        ]
    },
    {
        id: 1007,
        customer: { name: 'Amit Sharma', email: 'amit@example.com', phone: '+91 98765 12351' },
        artisan: { name: 'Kavita Verma', skill: 'Pottery', phone: '+91 98765 43217' },
        product: 'Handcrafted Clay Dinner Set (24 pieces)',
        category: 'Kitchenware',
        amount: 4500,
        orderDate: '2024-02-26',
        deliveryDate: '2024-03-12',
        status: 'pending',
        paymentStatus: 'pending',
        timeline: [
            { event: 'Order Placed', date: '2024-02-26 03:45 PM', completed: true },
            { event: 'Payment Pending', date: 'Awaiting confirmation', completed: false },
            { event: 'Production', date: 'Will start after payment', completed: false }
        ]
    },
    {
        id: 1008,
        customer: { name: 'Neha Singh', email: 'neha@example.com', phone: '+91 98765 12352' },
        artisan: { name: 'Priya Sharma', skill: 'Crochet Artist', phone: '+91 98765 43214' },
        product: 'Crochet Handbag Set (3 pieces)',
        category: 'Accessories',
        amount: 1800,
        orderDate: '2024-02-21',
        deliveryDate: '2024-02-28',
        status: 'cancelled',
        paymentStatus: 'refunded',
        timeline: [
            { event: 'Order Placed', date: '2024-02-21 10:00 AM', completed: true },
            { event: 'Payment Confirmed', date: '2024-02-21 10:05 AM', completed: true },
            { event: 'Cancelled by Customer', date: '2024-02-22 02:30 PM', completed: true },
            { event: 'Refund Processed', date: '2024-02-22 03:00 PM', completed: true }
        ]
    }
];

// Load order management table
function loadOrderManagement(filter = 'all') {
    const tbody = document.getElementById('orderManagementTable');
    if (!tbody) return;
    
    let filteredOrders = ordersData;
    if (filter !== 'all') {
        filteredOrders = ordersData.filter(o => o.status === filter);
    }
    
    tbody.innerHTML = filteredOrders.map(order => `
        <tr data-status="${order.status}">
            <td class="order-id-cell">#${order.id}</td>
            <td>
                <div class="customer-cell">
                    <strong>${order.customer.name}</strong>
                    <small>${order.customer.email}</small>
                </div>
            </td>
            <td>
                <div class="artisan-cell-order">
                    <strong>${order.artisan.name}</strong>
                    <small>${order.artisan.skill}</small>
                </div>
            </td>
            <td>
                <div class="product-cell">
                    <strong>${order.product}</strong>
                    <small>${order.category}</small>
                </div>
            </td>
            <td class="amount-cell">₹${order.amount.toLocaleString('en-IN')}</td>
            <td>${order.orderDate}</td>
            <td>
                <span class="order-status-badge ${order.status}">
                    <i class="fas fa-${order.status === 'pending' ? 'clock' : order.status === 'in-progress' ? 'spinner' : order.status === 'completed' ? 'check-circle' : 'times-circle'}"></i>
                    ${order.status.replace('-', ' ')}
                </span>
            </td>
            <td>
                <div class="order-actions">
                    <button class="btn-order-action btn-view-order" onclick="openOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${order.status !== 'completed' && order.status !== 'cancelled' ? `
                        <button class="btn-order-action btn-update-status" onclick="updateOrderStatus(${order.id})">
                            <i class="fas fa-edit"></i> Update
                        </button>
                    ` : ''}
                    ${order.status === 'pending' ? `
                        <button class="btn-order-action btn-cancel-order" onclick="cancelOrder(${order.id})">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Open order details modal
function openOrderDetails(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    
    content.innerHTML = `
        <div class="order-detail-section">
            <h3><i class="fas fa-info-circle"></i> Order Information</h3>
            <div class="order-info-grid">
                <div class="order-info-item">
                    <label>Order ID</label>
                    <div class="value">#${order.id}</div>
                </div>
                <div class="order-info-item">
                    <label>Order Date</label>
                    <div class="value">${order.orderDate}</div>
                </div>
                <div class="order-info-item">
                    <label>Delivery Date</label>
                    <div class="value">${order.deliveryDate}</div>
                </div>
                <div class="order-info-item">
                    <label>Status</label>
                    <div class="value">
                        <span class="order-status-badge ${order.status}">
                            <i class="fas fa-${order.status === 'pending' ? 'clock' : order.status === 'in-progress' ? 'spinner' : order.status === 'completed' ? 'check-circle' : 'times-circle'}"></i>
                            ${order.status.replace('-', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
                <div class="order-info-item">
                    <label>Payment Status</label>
                    <div class="value">${order.paymentStatus.replace('-', ' ').toUpperCase()}</div>
                </div>
                <div class="order-info-item">
                    <label>Category</label>
                    <div class="value">${order.category}</div>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-user"></i> Customer Details</h3>
            <div class="contact-info-box">
                <div class="contact-item">
                    <i class="fas fa-user"></i>
                    <span><strong>${order.customer.name}</strong></span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${order.customer.email}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${order.customer.phone}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-user-check"></i> Artisan Details</h3>
            <div class="contact-info-box">
                <div class="contact-item">
                    <i class="fas fa-user"></i>
                    <span><strong>${order.artisan.name}</strong></span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-briefcase"></i>
                    <span>${order.artisan.skill}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${order.artisan.phone}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-shopping-bag"></i> Order Items</h3>
            <div class="order-items-list">
                <div class="order-item">
                    <div class="order-item-info">
                        <h4>${order.product}</h4>
                        <p>${order.category}</p>
                    </div>
                    <div class="order-item-price">₹${order.amount.toLocaleString('en-IN')}</div>
                </div>
                <div class="order-total">
                    <span>Total Amount</span>
                    <span>₹${order.amount.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h3><i class="fas fa-history"></i> Order Timeline</h3>
            <div class="order-timeline">
                ${order.timeline.map(item => `
                    <div class="timeline-item">
                        <div class="timeline-dot ${item.completed ? 'active' : ''}"></div>
                        <div class="timeline-content">
                            <h4>${item.event}</h4>
                            <p class="timeline-date">${item.date}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="order-actions-footer">
            ${order.status === 'pending' ? `
                <button class="btn-order-footer btn-mark-progress" onclick="markOrderInProgress(${order.id})">
                    <i class="fas fa-play"></i> Mark In Progress
                </button>
                <button class="btn-order-footer btn-cancel-order-footer" onclick="cancelOrderFromModal(${order.id})">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
            ` : order.status === 'in-progress' ? `
                <button class="btn-order-footer btn-mark-completed" onclick="markOrderCompleted(${order.id})">
                    <i class="fas fa-check"></i> Mark Completed
                </button>
            ` : ''}
            <button class="btn-order-footer btn-profile-close" onclick="closeOrderDetails()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close order details modal
function closeOrderDetails(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('orderDetailsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Filter orders
function filterOrders(status, evt) {
    if (evt) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        evt.target.classList.add('active');
    }
    
    loadOrderManagement(status);
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const rows = document.querySelectorAll('.order-management-table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update order status
function updateOrderStatus(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;
    
    const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const options = statuses.map((s, i) => 
        `${i === currentIndex ? '→ ' : ''}${s.replace('-', ' ').toUpperCase()}`
    ).join('\n');
    
    const newStatus = prompt(`Update Order #${orderId} Status:\n\nCurrent: ${order.status.toUpperCase()}\n\nSelect new status:\n1. PENDING\n2. IN-PROGRESS\n3. COMPLETED\n4. CANCELLED\n\nEnter number (1-4):`);
    
    if (newStatus && newStatus >= '1' && newStatus <= '4') {
        const statusMap = { '1': 'pending', '2': 'in-progress', '3': 'completed', '4': 'cancelled' };
        order.status = statusMap[newStatus];
        alert(`✓ Order #${orderId} status updated to: ${order.status.toUpperCase()}`);
        loadOrderManagement();
    }
}

// Mark order in progress
function markOrderInProgress(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        order.status = 'in-progress';
        alert(`✓ Order #${orderId} marked as IN PROGRESS`);
        closeOrderDetails();
        loadOrderManagement();
    }
}

// Mark order completed
function markOrderCompleted(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        if (confirm(`Mark Order #${orderId} as COMPLETED?\n\nThis will:\n- Update order status\n- Notify customer\n- Release payment to artisan`)) {
            order.status = 'completed';
            order.paymentStatus = 'paid';
            alert(`✓ Order #${orderId} marked as COMPLETED\n\nCustomer and artisan have been notified.`);
            closeOrderDetails();
            loadOrderManagement();
        }
    }
}

// Cancel order
function cancelOrder(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (order) {
        const reason = prompt(`Cancel Order #${orderId}?\n\nPlease provide cancellation reason:`);
        if (reason && reason.trim()) {
            order.status = 'cancelled';
            order.paymentStatus = 'refunded';
            alert(`✗ Order #${orderId} has been cancelled.\n\nReason: ${reason}\n\nRefund will be processed within 5-7 business days.`);
            loadOrderManagement();
        }
    }
}

// Cancel order from modal
function cancelOrderFromModal(orderId) {
    cancelOrder(orderId);
    closeOrderDetails();
}



// Reports Management
const recentReportsData = [
    {
        id: 1,
        name: 'User Activity Report - February 2024',
        type: 'User Analytics',
        generatedBy: 'Admin',
        date: '2024-02-26',
        size: '2.4 MB',
        format: 'PDF',
        status: 'ready'
    },
    {
        id: 2,
        name: 'Artisan Performance Q1 2024',
        type: 'Artisan Performance',
        generatedBy: 'Admin',
        date: '2024-02-25',
        size: '3.8 MB',
        format: 'Excel',
        status: 'ready'
    },
    {
        id: 3,
        name: 'Revenue Report - February 2024',
        type: 'Financial',
        generatedBy: 'Admin',
        date: '2024-02-27',
        size: '1.9 MB',
        format: 'PDF',
        status: 'ready'
    },
    {
        id: 4,
        name: 'Order Management Summary',
        type: 'Orders',
        generatedBy: 'Admin',
        date: '2024-02-24',
        size: '4.2 MB',
        format: 'Excel',
        status: 'ready'
    },
    {
        id: 5,
        name: 'Invisible Labour Analysis',
        type: 'Labour Tracking',
        generatedBy: 'Admin',
        date: '2024-02-22',
        size: '2.1 MB',
        format: 'PDF',
        status: 'ready'
    }
];

// Settings Management
function saveSettings() {
    const settings = {
        platformName: document.getElementById('platformName').value,
        platformEmail: document.getElementById('platformEmail').value,
        supportPhone: document.getElementById('supportPhone').value,
        platformStatus: document.getElementById('platformStatus').checked,
        commissionRate: document.getElementById('commissionRate').value,
        minOrderAmount: document.getElementById('minOrderAmount').value,
        paymentGateway: document.getElementById('paymentGateway').value,
        autoPayout: document.getElementById('autoPayout').checked,
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        whatsappNotifications: document.getElementById('whatsappNotifications').checked,
        pushNotifications: document.getElementById('pushNotifications').checked,
        twoFactorAuth: document.getElementById('twoFactorAuth').checked,
        sessionTimeout: document.getElementById('sessionTimeout').value,
        passwordExpiry: document.getElementById('passwordExpiry').value,
        loginAttemptLimit: document.getElementById('loginAttemptLimit').value
    };
    
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem('shebalance_admin_settings', JSON.stringify(settings));
    
    alert('✓ Settings Saved Successfully!\n\nAll platform settings have been updated and applied.');
}

function resetSettings() {
    if (confirm('Reset all settings to default values?\n\nThis action cannot be undone.')) {
        // Reset to default values
        document.getElementById('platformName').value = 'SheBalance';
        document.getElementById('platformEmail').value = 'admin@shebalance.com';
        document.getElementById('supportPhone').value = '+91 1800-123-4567';
        document.getElementById('platformStatus').checked = true;
        document.getElementById('commissionRate').value = '10';
        document.getElementById('minOrderAmount').value = '500';
        document.getElementById('paymentGateway').value = 'razorpay';
        document.getElementById('autoPayout').checked = true;
        document.getElementById('emailNotifications').checked = true;
        document.getElementById('smsNotifications').checked = true;
        document.getElementById('whatsappNotifications').checked = true;
        document.getElementById('pushNotifications').checked = false;
        document.getElementById('twoFactorAuth').checked = false;
        document.getElementById('sessionTimeout').value = '30';
        document.getElementById('passwordExpiry').value = '90';
        document.getElementById('loginAttemptLimit').value = '5';
        
        alert('✓ Settings Reset to Default\n\nAll settings have been restored to their default values.');
    }
}

// Load saved settings on page load
function loadSettings() {
    const savedSettings = localStorage.getItem('shebalance_admin_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        if (document.getElementById('platformName')) {
            document.getElementById('platformName').value = settings.platformName || 'SheBalance';
            document.getElementById('platformEmail').value = settings.platformEmail || 'admin@shebalance.com';
            document.getElementById('supportPhone').value = settings.supportPhone || '+91 1800-123-4567';
            document.getElementById('platformStatus').checked = settings.platformStatus !== false;
            document.getElementById('commissionRate').value = settings.commissionRate || '10';
            document.getElementById('minOrderAmount').value = settings.minOrderAmount || '500';
            document.getElementById('paymentGateway').value = settings.paymentGateway || 'razorpay';
            document.getElementById('autoPayout').checked = settings.autoPayout !== false;
            document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
            document.getElementById('smsNotifications').checked = settings.smsNotifications !== false;
            document.getElementById('whatsappNotifications').checked = settings.whatsappNotifications !== false;
            document.getElementById('pushNotifications').checked = settings.pushNotifications === true;
            document.getElementById('twoFactorAuth').checked = settings.twoFactorAuth === true;
            document.getElementById('sessionTimeout').value = settings.sessionTimeout || '30';
            document.getElementById('passwordExpiry').value = settings.passwordExpiry || '90';
            document.getElementById('loginAttemptLimit').value = settings.loginAttemptLimit || '5';
        }
    }
}

// Report generation functions
// Report generation functions with proper PDF generation
function generateReport(reportType) {
    const reportNames = {
        'user-activity': 'User Activity Report',
        'artisan-performance': 'Artisan Performance Report',
        'revenue-financial': 'Revenue & Financial Report',
        'order-management': 'Order Management Report',
        'invisible-labour': 'Invisible Labour Report'
    };
    
    const reportName = reportNames[reportType] || 'Report';
    
    showNotification(`Generating ${reportName}...`, 'info');
    
    // Simulate report generation delay
    setTimeout(() => {
        showNotification(`✓ ${reportName} Generated Successfully!`, 'success');
        // Auto-download after generation
        setTimeout(() => {
            downloadReport(reportType);
        }, 500);
    }, 1500);
}

function downloadReport(reportType) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get current date
        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        // Set document properties
        doc.setProperties({
            title: `SheBalance ${reportType} Report`,
            subject: 'Platform Analytics Report',
            author: 'SheBalance Admin',
            keywords: 'report, analytics, shebalance',
            creator: 'SheBalance Platform'
        });
        
        // Generate report based on type
        switch(reportType) {
            case 'user-activity':
                generateUserActivityPDF(doc, currentDate);
                break;
            case 'artisan-performance':
                generateArtisanPerformancePDF(doc, currentDate);
                break;
            case 'revenue-financial':
                generateRevenueFinancialPDF(doc, currentDate);
                break;
            case 'order-management':
                generateOrderManagementPDF(doc, currentDate);
                break;
            case 'invisible-labour':
                generateInvisibleLabourPDF(doc, currentDate);
                break;
            default:
                generateGenericPDF(doc, currentDate, reportType);
        }
        
        // Save the PDF
        const filename = `SheBalance_${reportType.replace(/-/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showNotification(`✓ Report downloaded: ${filename}`, 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('❌ Error generating PDF. Please try again.', 'error');
    }
}

// PDF Generation Functions for each report type

function generateUserActivityPDF(doc, currentDate) {
    // Header
    addPDFHeader(doc, 'User Activity Report', currentDate);
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 14, 50);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const summaryData = [
        ['Total Users', '1,247'],
        ['New Users (This Month)', '156'],
        ['Active Users (Last 30 Days)', '892'],
        ['Average Session Duration', '12 minutes'],
        ['Total Sessions', '15,234'],
        ['User Retention Rate', '78%']
    ];
    
    doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    // User Distribution
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('User Distribution by Role', 14, finalY);
    
    const roleData = [
        ['Artisans', '487', '39%'],
        ['Buyers', '623', '50%'],
        ['Corporate', '89', '7%'],
        ['Admin', '48', '4%']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Role', 'Count', 'Percentage']],
        body: roleData,
        theme: 'striped',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    // Recent Activity
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Recent User Registrations', 14, finalY);
    
    const recentUsers = [
        ['Priya Sharma', 'Artisan', '2024-03-01', 'Active'],
        ['Rahul Kumar', 'Buyer', '2024-03-01', 'Active'],
        ['Meera Patel', 'Artisan', '2024-02-29', 'Active'],
        ['Anjali Verma', 'Corporate', '2024-02-28', 'Active'],
        ['Sunita Devi', 'Artisan', '2024-02-27', 'Active']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Name', 'Role', 'Registration Date', 'Status']],
        body: recentUsers,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Footer
    addPDFFooter(doc);
}

function generateArtisanPerformancePDF(doc, currentDate) {
    addPDFHeader(doc, 'Artisan Performance Report', currentDate);
    
    // Performance Metrics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Overall Performance Metrics', 14, 50);
    
    const metricsData = [
        ['Total Active Artisans', '487'],
        ['Average Rating', '4.6 / 5.0'],
        ['Total Orders Completed', '3,456'],
        ['Average Completion Time', '5.2 days'],
        ['Customer Satisfaction', '92%'],
        ['On-Time Delivery Rate', '88%']
    ];
    
    doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    // Top Performers
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Top Performing Artisans', 14, finalY);
    
    const topArtisans = [
        ['Sunita Devi', 'Embroidery', '4.9', '156', '₹2,45,000'],
        ['Meera Patel', 'Weaving', '4.8', '142', '₹2,12,000'],
        ['Lakshmi Reddy', 'Home Chef', '4.8', '198', '₹1,98,000'],
        ['Priya Sharma', 'Tailoring', '4.7', '134', '₹1,87,000'],
        ['Anjali Verma', 'Crochet', '4.7', '128', '₹1,65,000']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Name', 'Skill', 'Rating', 'Orders', 'Revenue']],
        body: topArtisans,
        theme: 'striped',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Skill Distribution
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Artisan Distribution by Skill', 14, finalY);
    
    const skillData = [
        ['Embroidery', '98', '20%'],
        ['Cooking/Baking', '87', '18%'],
        ['Tailoring', '76', '16%'],
        ['Weaving', '65', '13%'],
        ['Henna Art', '54', '11%'],
        ['Crochet', '48', '10%'],
        ['Others', '59', '12%']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Skill Category', 'Count', 'Percentage']],
        body: skillData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    addPDFFooter(doc);
}

function generateRevenueFinancialPDF(doc, currentDate) {
    addPDFHeader(doc, 'Revenue & Financial Report', currentDate);
    
    // Financial Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Summary', 14, 50);
    
    const financialData = [
        ['Total Revenue', '₹45,67,890'],
        ['Platform Commission (15%)', '₹6,85,184'],
        ['Artisan Earnings', '₹38,82,706'],
        ['Total Transactions', '3,456'],
        ['Average Transaction Value', '₹13,215'],
        ['Pending Payments', '₹2,34,500']
    ];
    
    doc.autoTable({
        startY: 55,
        head: [['Metric', 'Amount']],
        body: financialData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    // Monthly Revenue Trend
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Monthly Revenue Trend (Last 6 Months)', 14, finalY);
    
    const monthlyData = [
        ['September 2023', '₹6,45,000', '2,345'],
        ['October 2023', '₹7,12,000', '2,567'],
        ['November 2023', '₹7,89,000', '2,789'],
        ['December 2023', '₹8,45,000', '2,934'],
        ['January 2024', '₹8,98,000', '3,123'],
        ['February 2024', '₹9,78,890', '3,456']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Month', 'Revenue', 'Transactions']],
        body: monthlyData,
        theme: 'striped',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Revenue by Category
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Revenue by Category', 14, finalY);
    
    const categoryData = [
        ['Embroidery & Textiles', '₹12,45,000', '27%'],
        ['Food Services', '₹10,23,000', '22%'],
        ['Tailoring & Alterations', '₹8,67,000', '19%'],
        ['Handicrafts', '₹7,89,000', '17%'],
        ['Beauty Services', '₹4,23,890', '9%'],
        ['Others', '₹2,20,000', '6%']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Category', 'Revenue', 'Share']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    addPDFFooter(doc);
}

function generateOrderManagementPDF(doc, currentDate) {
    addPDFHeader(doc, 'Order Management Report', currentDate);
    
    // Order Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Order Statistics', 14, 50);
    
    const orderStats = [
        ['Total Orders', '3,456'],
        ['Completed Orders', '2,789'],
        ['In Progress', '456'],
        ['Pending', '178'],
        ['Cancelled', '33'],
        ['Average Order Value', '₹13,215']
    ];
    
    doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: orderStats,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    // Recent Orders
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Recent Orders', 14, finalY);
    
    const recentOrders = [
        ['ORD-1008', 'Bridal Lehenga', '₹15,000', 'In Progress'],
        ['ORD-1007', 'Dinner Set', '₹4,500', 'Pending'],
        ['ORD-1006', 'Banarasi Saree', '₹12,000', 'Completed'],
        ['ORD-1005', 'Bridal Mehndi', '₹5,000', 'In Progress'],
        ['ORD-1004', 'Salwar Kameez', '₹3,500', 'Completed']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Order ID', 'Product', 'Amount', 'Status']],
        body: recentOrders,
        theme: 'striped',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Order Fulfillment Metrics
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Fulfillment Metrics', 14, finalY);
    
    const fulfillmentData = [
        ['On-Time Delivery Rate', '88%'],
        ['Average Delivery Time', '5.2 days'],
        ['Customer Satisfaction', '4.6 / 5.0'],
        ['Return Rate', '2.3%'],
        ['Cancellation Rate', '0.95%']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Metric', 'Value']],
        body: fulfillmentData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    addPDFFooter(doc);
}

function generateInvisibleLabourPDF(doc, currentDate) {
    addPDFHeader(doc, 'Invisible Labour Report', currentDate);
    
    // Overview
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Invisible Labour Overview', 14, 50);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('This report tracks and values the invisible labour hours contributed by artisans,', 14, 58);
    doc.text('including household work, childcare, and other unpaid domestic responsibilities.', 14, 64);
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 14, 75);
    
    const labourStats = [
        ['Total Artisans Tracked', '487'],
        ['Average Household Hours/Day', '6.2 hours'],
        ['Total Invisible Labour Hours', '93,894 hours'],
        ['Estimated Economic Value', '₹28,16,820'],
        ['Average Career Hours/Day', '3.8 hours'],
        ['Work-Life Balance Score', '72%']
    ];
    
    doc.autoTable({
        startY: 80,
        head: [['Metric', 'Value']],
        body: labourStats,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
    });
    
    // Labour Distribution
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Invisible Labour Distribution', 14, finalY);
    
    const distributionData = [
        ['Cooking & Meal Prep', '2.1 hours', '34%'],
        ['Childcare', '1.8 hours', '29%'],
        ['Cleaning & Maintenance', '1.2 hours', '19%'],
        ['Elder Care', '0.7 hours', '11%'],
        ['Shopping & Errands', '0.4 hours', '7%']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Activity', 'Avg Hours/Day', 'Percentage']],
        body: distributionData,
        theme: 'striped',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Time Optimization Impact
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Platform Impact on Time Optimization', 14, finalY);
    
    const impactData = [
        ['Before Platform', '8.5 hours', '1.2 hours'],
        ['After Platform', '6.2 hours', '3.8 hours'],
        ['Time Saved', '2.3 hours', '+2.6 hours'],
        ['Improvement', '-27%', '+217%']
    ];
    
    doc.autoTable({
        startY: finalY + 5,
        head: [['Period', 'Household Work', 'Career Time']],
        body: impactData,
        theme: 'grid',
        headStyles: { fillColor: [139, 115, 85], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    addPDFFooter(doc);
}

function generateGenericPDF(doc, currentDate, reportType) {
    addPDFHeader(doc, `${reportType} Report`, currentDate);
    
    doc.setFontSize(12);
    doc.text('Report data will be available here.', 14, 50);
    
    addPDFFooter(doc);
}

// Helper functions for PDF generation
function addPDFHeader(doc, title, date) {
    // Logo/Title area
    doc.setFillColor(139, 115, 85);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('SheBalance', 14, 15);
    
    doc.setFontSize(16);
    doc.text(title, 14, 25);
    
    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${date}`, 150, 15);
    doc.text('Confidential', 150, 22);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
}

function addPDFFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(139, 115, 85);
        doc.setLineWidth(0.5);
        doc.line(14, 280, 196, 280);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('SheBalance Platform - Empowering Women Artisans', 14, 285);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
        doc.text('www.shebalance.com | support@shebalance.com', 14, 290);
    }
}


// View all reports
function viewAllReports() {
    alert('View All Reports\n\nThis will open a comprehensive view of all generated reports with advanced filtering and search options.');
}

// Custom Report Builder Functions
function openCustomReportBuilder() {
    const modal = document.getElementById('customReportModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCustomReportBuilder(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modal = document.getElementById('customReportModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function generateCustomReport() {
    const reportName = document.getElementById('customReportName').value;
    const reportType = document.getElementById('customReportType').value;
    const startDate = document.getElementById('customReportStartDate').value;
    const endDate = document.getElementById('customReportEndDate').value;
    const format = document.getElementById('customReportFormat').value;
    
    if (!reportName || !reportType || !startDate || !endDate) {
        alert('⚠️ Please fill in all required fields:\n\n- Report Name\n- Report Type\n- Start Date\n- End Date');
        return;
    }
    
    alert(`✓ Custom Report Generated!\n\nReport Name: ${reportName}\nType: ${reportType}\nPeriod: ${startDate} to ${endDate}\nFormat: ${format.toUpperCase()}\n\nYour custom report is being generated and will be ready for download shortly.`);
    
    closeCustomReportBuilder();
    
    // Reset form
    document.getElementById('customReportName').value = '';
    document.getElementById('customReportType').value = '';
    document.getElementById('customReportStartDate').value = '';
    document.getElementById('customReportEndDate').value = '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load order management when orders section is shown
    if (document.getElementById('orderManagementTable')) {
        loadOrderManagement();
    }
});
