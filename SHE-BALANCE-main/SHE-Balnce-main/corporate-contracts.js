// Corporate Contracts JavaScript - SheBalance

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadContracts();
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

// Dummy contracts data
const contracts = [
    {
        id: 'CT-2024-001',
        artisanName: 'Sunita Devi',
        contractType: 'Annual Supply Agreement',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'Active',
        value: 500000
    },
    {
        id: 'CT-2024-002',
        artisanName: 'Meera Patel',
        contractType: 'Quarterly Partnership',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        status: 'Expiring Soon',
        value: 150000
    },
    {
        id: 'CT-2023-045',
        artisanName: 'Kavya Singh',
        contractType: 'Project-Based Contract',
        startDate: '2023-10-01',
        endDate: '2023-12-31',
        status: 'Expired',
        value: 200000
    },
    {
        id: 'CT-2024-003',
        artisanName: 'Priya Sharma',
        contractType: 'Monthly Catering Agreement',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        status: 'Active',
        value: 300000
    },
    {
        id: 'CT-2024-004',
        artisanName: 'Anjali Verma',
        contractType: 'Bi-Annual Supply Contract',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        status: 'Active',
        value: 250000
    }
];

// Load contracts
function loadContracts() {
    const container = document.getElementById('contractsContainer');
    container.innerHTML = '';
    
    if (contracts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px;">
                <i class="fas fa-file-contract" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No contracts yet</h3>
                <p style="color: #999;">Create your first contract to get started</p>
            </div>
        `;
        return;
    }
    
    contracts.forEach(contract => {
        const contractCard = createContractCard(contract);
        container.appendChild(contractCard);
    });
}

// Create contract card
function createContractCard(contract) {
    const card = document.createElement('div');
    card.className = 'contract-card';
    
    const statusClass = contract.status.toLowerCase().replace(' ', '-');
    
    // Calculate days until expiry
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    card.innerHTML = `
        <div class="contract-header">
            <div class="contract-id">${contract.id}</div>
            <div class="contract-status status-${statusClass}">${contract.status}</div>
        </div>
        <div class="contract-details">
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-user"></i> Artisan Name</span>
                <span class="detail-value">${contract.artisanName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-file-alt"></i> Contract Type</span>
                <span class="detail-value">${contract.contractType}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-calendar-check"></i> Start Date</span>
                <span class="detail-value">${formatDate(contract.startDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-calendar-times"></i> End Date</span>
                <span class="detail-value">${formatDate(contract.endDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-rupee-sign"></i> Contract Value</span>
                <span class="detail-value">₹${contract.value.toLocaleString('en-IN')}</span>
            </div>
            ${contract.status !== 'Expired' ? `
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-clock"></i> Days Remaining</span>
                    <span class="detail-value" style="color: ${daysUntilExpiry < 30 ? '#f57c00' : '#2E7D32'}">
                        ${daysUntilExpiry > 0 ? daysUntilExpiry + ' days' : 'Expired'}
                    </span>
                </div>
            ` : ''}
        </div>
        <div class="contract-actions">
            <button class="btn-secondary" onclick="viewContractDetails('${contract.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
            <button class="btn-secondary" onclick="downloadContract('${contract.id}')">
                <i class="fas fa-download"></i> Download
            </button>
            ${contract.status === 'Expiring Soon' ? `
                <button class="btn-action" onclick="renewContract('${contract.id}')">
                    <i class="fas fa-redo"></i> Renew Contract
                </button>
            ` : ''}
            ${contract.status === 'Active' ? `
                <button class="btn-secondary" onclick="contactArtisan('${contract.artisanName}')">
                    <i class="fas fa-envelope"></i> Contact Artisan
                </button>
            ` : ''}
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

// Create new contract
function createNewContract() {
    showNotification('📄 Opening contract creation form...', 'info');
    setTimeout(() => {
        showNotification('✨ Feature coming soon! You will be able to create contracts directly.', 'info');
    }, 1000);
}

// View contract details
function viewContractDetails(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    const modal = document.getElementById('contractDetailsModal');
    const content = document.getElementById('contractDetailsContent');
    
    const paymentSchedule = [
        { milestone: 'Contract Signing', amount: contract.value * 0.25, dueDate: contract.startDate, status: 'Paid' },
        { milestone: 'Mid-term Review', amount: contract.value * 0.25, dueDate: new Date(new Date(contract.startDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: contract.status === 'Active' ? 'Pending' : 'Paid' },
        { milestone: 'Quality Approval', amount: contract.value * 0.25, dueDate: new Date(new Date(contract.endDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Pending' },
        { milestone: 'Contract Completion', amount: contract.value * 0.25, dueDate: contract.endDate, status: 'Pending' }
    ];
    
    content.innerHTML = `
        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Contract Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Contract ID</div>
                    <div class="info-value">${contract.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Artisan Name</div>
                    <div class="info-value">${contract.artisanName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Contract Type</div>
                    <div class="info-value">${contract.contractType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${contract.status === 'Active' ? '#2E7D32' : contract.status === 'Expiring Soon' ? '#f57c00' : '#ef4444'}">${contract.status}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Start Date</div>
                    <div class="info-value">${formatDate(contract.startDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">End Date</div>
                    <div class="info-value">${formatDate(contract.endDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Contract Value</div>
                    <div class="info-value">₹${contract.value.toLocaleString('en-IN')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Duration</div>
                    <div class="info-value">${Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} days</div>
                </div>
            </div>
        </div>

        <div class="contract-terms">
            <h4><i class="fas fa-file-signature"></i> Terms and Conditions</h4>
            <ul class="terms-list">
                <li>
                    <i class="fas fa-check-circle"></i>
                    <span>The artisan agrees to provide high-quality handcrafted products as per specifications agreed upon in this contract.</span>
                </li>
                <li>
                    <i class="fas fa-check-circle"></i>
                    <span>Payment will be made in installments as per the payment schedule outlined below.</span>
                </li>
                <li>
                    <i class="fas fa-check-circle"></i>
                    <span>All products must meet SheBalance quality standards and undergo quality inspection before delivery.</span>
                </li>
                <li>
                    <i class="fas fa-check-circle"></i>
                    <span>The artisan retains intellectual property rights to their designs while granting SheBalance exclusive distribution rights.</span>
                </li>
                <li>
                    <i class="fas fa-check-circle"></i>
                    <span>Either party may terminate this contract with 30 days written notice, subject to completion of ongoing orders.</span>
                </li>
                <li>
                    <i class="fas fa-check-circle"></i>
                    <span>Contract renewal options available 60 days before expiration date.</span>
                </li>
            </ul>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-money-check-alt"></i> Payment Schedule</h3>
            <table class="payment-schedule-table">
                <thead>
                    <tr>
                        <th>Milestone</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${paymentSchedule.map(payment => `
                        <tr>
                            <td>${payment.milestone}</td>
                            <td>₹${payment.amount.toLocaleString('en-IN')}</td>
                            <td>${formatDate(payment.dueDate)}</td>
                            <td>
                                <span style="color: ${payment.status === 'Paid' ? '#2E7D32' : '#f57c00'}; font-weight: 600;">
                                    ${payment.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="1" style="text-align: right; font-weight: 700; color: var(--primary-brown);">Total:</td>
                        <td style="font-weight: 700; color: var(--primary-brown);">₹${contract.value.toLocaleString('en-IN')}</td>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="contract-terms">
            <h4><i class="fas fa-tasks"></i> Deliverables</h4>
            <ul class="terms-list">
                <li>
                    <i class="fas fa-box"></i>
                    <span>Monthly delivery of ${Math.floor(Math.random() * 50) + 20} handcrafted items as per order specifications</span>
                </li>
                <li>
                    <i class="fas fa-certificate"></i>
                    <span>Quality certification and authenticity documentation for all products</span>
                </li>
                <li>
                    <i class="fas fa-images"></i>
                    <span>Product photography and marketing materials for promotional use</span>
                </li>
                <li>
                    <i class="fas fa-chart-line"></i>
                    <span>Monthly progress reports and production updates</span>
                </li>
            </ul>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-redo"></i> Renewal Options</h3>
            <div class="contract-terms">
                <ul class="terms-list">
                    <li>
                        <i class="fas fa-calendar-check"></i>
                        <span>Automatic renewal option available with same terms and conditions</span>
                    </li>
                    <li>
                        <i class="fas fa-edit"></i>
                        <span>Renegotiation of terms available 60 days before contract expiration</span>
                    </li>
                    <li>
                        <i class="fas fa-percentage"></i>
                        <span>10% discount on contract value for early renewal (45+ days before expiration)</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Download contract
function downloadContract(contractId) {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    const modal = document.getElementById('downloadModal');
    const content = document.getElementById('downloadContent');
    
    content.innerHTML = `
        <div class="download-status">
            <div class="download-icon">
                <i class="fas fa-file-download"></i>
            </div>
            <div class="download-message">Preparing your contract...</div>
            <div class="download-filename">${contract.id}_Contract.pdf</div>
        </div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="downloadProgress" style="width: 0%">0%</div>
            </div>
            <div class="progress-text">Generating PDF document...</div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Simulate download progress
    let progress = 0;
    const progressBar = document.getElementById('downloadProgress');
    const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Show success message
            content.innerHTML = `
                <div class="download-status">
                    <div class="download-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="download-message">Download Complete!</div>
                    <div class="download-filename">${contract.id}_Contract.pdf</div>
                </div>
            `;
            
            // Create and download blob
            const contractContent = `SheBalance Corporate Contract\n\nContract ID: ${contract.id}\nArtisan: ${contract.artisanName}\nType: ${contract.contractType}\nValue: ₹${contract.value.toLocaleString('en-IN')}\nPeriod: ${formatDate(contract.startDate)} to ${formatDate(contract.endDate)}\n\nThis is a simulated contract document.`;
            const blob = new Blob([contractContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${contract.id}_Contract.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Close modal after 2 seconds
            setTimeout(() => {
                closeModal('downloadModal');
                showNotification('✅ Contract downloaded successfully!', 'success');
            }, 2000);
        }
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.floor(progress) + '%';
        }
    }, 100);
}

// Renew contract
function renewContract(contractId) {
    showNotification(`🔄 Opening renewal form for ${contractId}...`, 'info');
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
