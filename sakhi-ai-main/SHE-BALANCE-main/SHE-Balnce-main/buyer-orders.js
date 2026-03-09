// Buyer Orders JavaScript

// Sample orders data
const sampleOrders = [
    {
        id: 'ORD-2024-001',
        date: '2024-01-15',
        artisan: {
            name: 'Sunita Devi',
            skill: 'Embroidery Specialist',
            avatar: 'SD'
        },
        items: ['Hand Embroidered Saree', 'Cushion Covers (2)'],
        total: 3500,
        status: 'completed'
    },
    {
        id: 'ORD-2024-002',
        date: '2024-01-18',
        artisan: {
            name: 'Meera Patel',
            skill: 'Weaving Artist',
            avatar: 'MP'
        },
        items: ['Handloom Cotton Saree'],
        total: 2800,
        status: 'in-progress'
    },
    {
        id: 'ORD-2024-003',
        date: '2024-01-20',
        artisan: {
            name: 'Priya Sharma',
            skill: 'Baker & Pastry Chef',
            avatar: 'PS'
        },
        items: ['Custom Birthday Cake', 'Cookies Box'],
        total: 1500,
        status: 'pending'
    },
    {
        id: 'ORD-2024-004',
        date: '2024-01-10',
        artisan: {
            name: 'Anjali Verma',
            skill: 'Tailoring Expert',
            avatar: 'AV'
        },
        items: ['Custom Blouse', 'Alterations'],
        total: 800,
        status: 'completed'
    },
    {
        id: 'ORD-2024-005',
        date: '2024-01-12',
        artisan: {
            name: 'Lakshmi Reddy',
            skill: 'Home Chef',
            avatar: 'LR'
        },
        items: ['Weekly Tiffin Service'],
        total: 2000,
        status: 'cancelled'
    }
];

let currentFilter = 'all';
let orders = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadOrders();
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

// Load orders
function loadOrders() {
    // Try to load from localStorage, otherwise use sample data
    const storedOrders = localStorage.getItem('shebalance_orders');
    orders = storedOrders ? JSON.parse(storedOrders) : sampleOrders;
    
    // Save to localStorage if using sample data
    if (!storedOrders) {
        localStorage.setItem('shebalance_orders', JSON.stringify(orders));
    }
    
    updateOrderCounts();
    displayOrders();
}

// Update order counts
function updateOrderCounts() {
    const counts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        'in-progress': orders.filter(o => o.status === 'in-progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    
    document.getElementById('allCount').textContent = counts.all;
    document.getElementById('pendingCount').textContent = counts.pending;
    document.getElementById('progressCount').textContent = counts['in-progress'];
    document.getElementById('completedCount').textContent = counts.completed;
    document.getElementById('cancelledCount').textContent = counts.cancelled;
}

// Display orders
function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.orders-table-container');
    
    let filteredOrders = orders;
    
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(o => o.status === currentFilter);
    }
    
    if (filteredOrders.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';
    
    tbody.innerHTML = '';
    
    filteredOrders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

// Create order row
function createOrderRow(order) {
    const tr = document.createElement('tr');
    
    const statusClass = `status-${order.status}`;
    const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    tr.innerHTML = `
        <td><span class="order-id">${order.id}</span></td>
        <td>${formattedDate}</td>
        <td>
            <div class="artisan-cell">
                <div class="artisan-avatar">${order.artisan.avatar}</div>
                <div class="artisan-info">
                    <h4>${order.artisan.name}</h4>
                    <p>${order.artisan.skill}</p>
                </div>
            </div>
        </td>
        <td>
            <div class="items-list">
                ${order.items.join(', ')}
            </div>
        </td>
        <td><span class="order-total">₹${order.total.toLocaleString()}</span></td>
        <td><span class="status-badge ${statusClass}">${order.status.replace('-', ' ')}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn-action" onclick="viewOrderDetails('${order.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${order.status !== 'cancelled' ? `
                    <button class="btn-action" onclick="trackOrder('${order.id}')" title="Track Order">
                        <i class="fas fa-map-marker-alt"></i>
                    </button>
                ` : ''}
                ${order.status === 'completed' ? `
                    <button class="btn-action" onclick="reorder('${order.id}')" title="Reorder">
                        <i class="fas fa-redo"></i>
                    </button>
                ` : ''}
            </div>
        </td>
    `;
    
    return tr;
}

// Filter orders
function filterOrders(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.closest('.filter-tab').classList.add('active');
    
    displayOrders();
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailsContent');
    
    const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const statusClass = `status-${order.status}`;
    
    content.innerHTML = `
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value order-id">${order.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status-badge ${statusClass}">${order.status.replace('-', ' ')}</span>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3>Artisan Details</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${order.artisan.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Skill:</span>
                <span class="detail-value">${order.artisan.skill}</span>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3>Order Items</h3>
            <ul class="order-items">
                ${order.items.map(item => `<li><span>${item}</span></li>`).join('')}
            </ul>
        </div>
        
        <div class="order-detail-section">
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value order-total">₹${order.total.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="modal-actions">
            ${order.status !== 'cancelled' ? `
                <button class="btn-modal btn-modal-primary" onclick="contactArtisan('${order.artisan.name}')">
                    <i class="fas fa-envelope"></i> Contact Artisan
                </button>
            ` : ''}
            ${order.status === 'completed' ? `
                <button class="btn-modal btn-modal-secondary" onclick="reorder('${order.id}')">
                    <i class="fas fa-redo"></i> Reorder
                </button>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
}

// Track order
function trackOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showNotification(`📍 Tracking order ${orderId}...`, 'info');
        setTimeout(() => {
            showNotification(`✅ Order is ${order.status.replace('-', ' ')}`, 'success');
        }, 1000);
    }
}

// Reorder
function reorder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        showNotification(`🔄 Creating new order based on ${orderId}...`, 'info');
        setTimeout(() => {
            showNotification('✅ Items added to cart! Redirecting to artisan page...', 'success');
            setTimeout(() => {
                window.location.href = 'buyer-dashboard.html';
            }, 1500);
        }, 1000);
    }
}

// Contact artisan
function contactArtisan(artisanName) {
    showNotification(`📧 Opening chat with ${artisanName}...`, 'info');
    setTimeout(() => {
        showNotification('✅ Message sent! They will respond shortly.', 'success');
        closeOrderModal();
    }, 1500);
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
            searchOrders(searchTerm);
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
    
    // Close modal when clicking outside
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeOrderModal();
            }
        });
    }
}

// Search orders
function searchOrders(searchTerm) {
    const tbody = document.getElementById('ordersTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
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
