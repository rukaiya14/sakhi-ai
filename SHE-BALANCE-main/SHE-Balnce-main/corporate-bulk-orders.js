// Corporate Bulk Orders JavaScript - SheBalance

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadOrders();
});

// Check if user is authenticated
function checkAuthentication() {
    const userData = localStorage.getItem('shebalance_user');
    
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    
    if (user.role !== 'corporate') {
        window.location.href = 'index.html';
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

// Dummy bulk orders data
const bulkOrders = [
    {
        id: 'BO-2024-001',
        artisanName: 'Sunita Devi',
        product: 'Embroidered Corporate Scarves',
        quantity: 200,
        totalAmount: 144000,
        status: 'In Progress',
        orderDate: '2024-01-15',
        deliveryDate: '2024-02-15'
    },
    {
        id: 'BO-2024-002',
        artisanName: 'Meera Patel',
        product: 'Handwoven Table Runners',
        quantity: 150,
        totalAmount: 90000,
        status: 'Pending',
        orderDate: '2024-01-20',
        deliveryDate: '2024-02-28'
    },
    {
        id: 'BO-2024-003',
        artisanName: 'Kavya Singh',
        product: 'Pottery Gift Sets',
        quantity: 300,
        totalAmount: 225000,
        status: 'Completed',
        orderDate: '2023-12-10',
        deliveryDate: '2024-01-10'
    },
    {
        id: 'BO-2024-004',
        artisanName: 'Priya Sharma',
        product: 'Corporate Gift Hampers',
        quantity: 500,
        totalAmount: 325000,
        status: 'In Progress',
        orderDate: '2024-01-18',
        deliveryDate: '2024-02-20'
    },
    {
        id: 'BO-2023-089',
        artisanName: 'Anjali Verma',
        product: 'Uniform Embroidery',
        quantity: 250,
        totalAmount: 87500,
        status: 'Completed',
        orderDate: '2023-12-01',
        deliveryDate: '2023-12-28'
    },
    {
        id: 'BO-2024-005',
        artisanName: 'Lakshmi Reddy',
        product: 'Corporate Event Catering',
        quantity: 400,
        totalAmount: 380000,
        status: 'Pending',
        orderDate: '2024-01-22',
        deliveryDate: '2024-02-10'
    }
];

// Load orders
function loadOrders() {
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '';
    
    if (bulkOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px;">
                <i class="fas fa-shopping-cart" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No bulk orders yet</h3>
                <p style="color: #999;">Create your first bulk order to get started</p>
            </div>
        `;
        return;
    }
    
    bulkOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        container.appendChild(orderCard);
    });
}

// Create order card
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    const statusClass = order.status.toLowerCase().replace(' ', '-');
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-id">${order.id}</div>
            <div class="order-status status-${statusClass}">${order.status}</div>
        </div>
        <div class="order-details">
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-user"></i> Artisan Name</span>
                <span class="detail-value">${order.artisanName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-box"></i> Product</span>
                <span class="detail-value">${order.product}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-cubes"></i> Quantity</span>
                <span class="detail-value">${order.quantity} units</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-rupee-sign"></i> Total Amount</span>
                <span class="detail-value">₹${order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-calendar"></i> Order Date</span>
                <span class="detail-value">${formatDate(order.orderDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-truck"></i> Delivery Date</span>
                <span class="detail-value">${formatDate(order.deliveryDate)}</span>
            </div>
        </div>
        <div class="order-actions">
            <button class="btn-secondary" onclick="viewOrderDetails('${order.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
            ${order.status !== 'Completed' ? `
                <button class="btn-action" onclick="trackOrder('${order.id}')">
                    <i class="fas fa-map-marker-alt"></i> Track Order
                </button>
            ` : ''}
            <button class="btn-secondary" onclick="contactArtisan('${order.artisanName}')">
                <i class="fas fa-envelope"></i> Contact Artisan
            </button>
        </div>
    `;
    
    return card;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Create new order
function createNewOrder() {
    showNotification('📦 Opening bulk order form...', 'info');
    setTimeout(() => {
        showNotification('✨ Feature coming soon! You will be able to create bulk orders directly.', 'info');
    }, 1000);
}

// View order details
function viewOrderDetails(orderId) {
    const order = bulkOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    
    content.innerHTML = `
        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Order Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Order ID</div>
                    <div class="info-value">${order.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${order.status === 'Completed' ? '#2E7D32' : order.status === 'In Progress' ? '#1976d2' : '#f57c00'}">${order.status}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Order Date</div>
                    <div class="info-value">${formatDate(order.orderDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Delivery Date</div>
                    <div class="info-value">${formatDate(order.deliveryDate)}</div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-tasks"></i> Order Progress</h3>
            <div class="order-timeline">
                <div class="timeline-item">
                    <div class="timeline-icon completed">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">Order Placed</div>
                        <div class="timeline-date">${formatDate(order.orderDate)}</div>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon ${order.status !== 'Pending' ? 'completed' : ''}">
                        <i class="fas fa-${order.status !== 'Pending' ? 'check' : 'clock'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">Production Started</div>
                        <div class="timeline-date">${order.status !== 'Pending' ? formatDate(new Date(new Date(order.orderDate).getTime() + 2 * 24 * 60 * 60 * 1000)) : 'Pending'}</div>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon ${order.status === 'Completed' ? 'completed' : order.status === 'In Progress' ? 'active' : ''}">
                        <i class="fas fa-${order.status === 'Completed' ? 'check' : 'hammer'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">In Production</div>
                        <div class="timeline-date">${order.status === 'In Progress' || order.status === 'Completed' ? 'In Progress' : 'Not Started'}</div>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-icon ${order.status === 'Completed' ? 'completed' : ''}">
                        <i class="fas fa-${order.status === 'Completed' ? 'check' : 'truck'}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">Delivered</div>
                        <div class="timeline-date">${order.status === 'Completed' ? formatDate(order.deliveryDate) : 'Expected: ' + formatDate(order.deliveryDate)}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-box"></i> Itemized Breakdown</h3>
            <table class="order-items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${order.product}</td>
                        <td>${order.quantity} units</td>
                        <td>₹${(order.totalAmount / order.quantity).toLocaleString('en-IN')}</td>
                        <td>₹${order.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: 600;">Subtotal:</td>
                        <td style="font-weight: 600;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: 600;">GST (18%):</td>
                        <td style="font-weight: 600;">₹${(order.totalAmount * 0.18).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: 700; color: var(--primary-brown);">Grand Total:</td>
                        <td style="font-weight: 700; color: var(--primary-brown);">₹${(order.totalAmount * 1.18).toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="artisan-contact">
            <h3><i class="fas fa-user-circle"></i> Artisan Contact Information</h3>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-user"></i>
                    <span>${order.artisanName}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${order.artisanName.toLowerCase().replace(' ', '.')}@shebalance.com</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Workshop Location Available</span>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Track order
function trackOrder(orderId) {
    const order = bulkOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('trackOrderModal');
    const content = document.getElementById('trackOrderContent');
    
    const trackingStages = [
        { status: 'Order Confirmed', location: 'SheBalance HQ, Mumbai', date: order.orderDate, completed: true },
        { status: 'Production Started', location: `${order.artisanName}'s Workshop`, date: new Date(new Date(order.orderDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: order.status !== 'Pending' },
        { status: 'Quality Check', location: 'Quality Assurance Center', date: new Date(new Date(order.deliveryDate).getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: order.status === 'Completed' },
        { status: 'Out for Delivery', location: 'In Transit', date: new Date(new Date(order.deliveryDate).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: order.status === 'Completed' },
        { status: 'Delivered', location: 'Your Location', date: order.deliveryDate, completed: order.status === 'Completed' }
    ];
    
    content.innerHTML = `
        <div class="tracking-map">
            <i class="fas fa-map-marked-alt"></i>
            <div class="tracking-status">
                ${order.status === 'Completed' ? 'Order Delivered Successfully!' : 
                  order.status === 'In Progress' ? 'Order In Production' : 
                  'Order Confirmed - Production Starting Soon'}
            </div>
            <div class="tracking-location">
                Current Location: ${trackingStages.find(s => s.completed && !trackingStages[trackingStages.indexOf(s) + 1]?.completed)?.location || trackingStages[trackingStages.length - 1].location}
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-route"></i> Delivery Timeline</h3>
            <div class="order-timeline">
                ${trackingStages.map(stage => `
                    <div class="timeline-item">
                        <div class="timeline-icon ${stage.completed ? 'completed' : ''}">
                            <i class="fas fa-${stage.completed ? 'check' : 'clock'}"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">${stage.status}</div>
                            <div class="timeline-date">${stage.location} - ${stage.completed ? formatDate(stage.date) : 'Expected: ' + formatDate(stage.date)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Delivery Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Tracking Number</div>
                    <div class="info-value">TRK${order.id.replace('BO-', '')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Carrier</div>
                    <div class="info-value">SheBalance Logistics</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Expected Delivery</div>
                    <div class="info-value">${formatDate(order.deliveryDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Delivery Type</div>
                    <div class="info-value">Express Delivery</div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Contact artisan
function contactArtisan(artisanName) {
    showNotification(`📧 Opening message to ${artisanName}...`, 'info');
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

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const userProfile = document.querySelector('.user-profile');
    
    if (userMenu && !userMenu.contains(event.target) && !userProfile.contains(event.target)) {
        userMenu.classList.remove('active');
    }
});

// Close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
