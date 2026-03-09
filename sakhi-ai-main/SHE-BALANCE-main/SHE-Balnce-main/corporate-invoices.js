// Corporate Invoices JavaScript - SheBalance

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUserData();
    loadInvoices('all');
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

// Dummy invoices data
const invoices = [
    {
        id: 'INV-2024-001',
        artisanName: 'Sunita Devi',
        amount: 144000,
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'Pending'
    },
    {
        id: 'INV-2024-002',
        artisanName: 'Meera Patel',
        amount: 90000,
        issueDate: '2024-01-10',
        dueDate: '2024-01-25',
        status: 'Overdue'
    },
    {
        id: 'INV-2023-089',
        artisanName: 'Kavya Singh',
        amount: 225000,
        issueDate: '2023-12-10',
        dueDate: '2024-01-10',
        status: 'Paid'
    },
    {
        id: 'INV-2024-003',
        artisanName: 'Priya Sharma',
        amount: 65000,
        issueDate: '2024-01-18',
        dueDate: '2024-02-18',
        status: 'Pending'
    },
    {
        id: 'INV-2023-088',
        artisanName: 'Anjali Verma',
        amount: 87500,
        issueDate: '2023-12-01',
        dueDate: '2023-12-31',
        status: 'Paid'
    },
    {
        id: 'INV-2024-004',
        artisanName: 'Lakshmi Reddy',
        amount: 95000,
        issueDate: '2024-01-05',
        dueDate: '2024-01-20',
        status: 'Overdue'
    },
    {
        id: 'INV-2024-005',
        artisanName: 'Fatima Khan',
        amount: 125000,
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        status: 'Pending'
    },
    {
        id: 'INV-2023-087',
        artisanName: 'Rukaiya Khan',
        amount: 160000,
        issueDate: '2023-11-15',
        dueDate: '2023-12-15',
        status: 'Paid'
    }
];

let currentFilter = 'all';

// Load invoices
function loadInvoices(filter) {
    currentFilter = filter;
    const container = document.getElementById('invoicesContainer');
    container.innerHTML = '';
    
    let filteredInvoices = invoices;
    
    if (filter !== 'all') {
        filteredInvoices = invoices.filter(inv => inv.status.toLowerCase() === filter);
    }
    
    if (filteredInvoices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px;">
                <i class="fas fa-file-invoice" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No ${filter !== 'all' ? filter : ''} invoices found</h3>
                <p style="color: #999;">There are no invoices matching this filter</p>
            </div>
        `;
        return;
    }
    
    filteredInvoices.forEach(invoice => {
        const invoiceCard = createInvoiceCard(invoice);
        container.appendChild(invoiceCard);
    });
}

// Create invoice card
function createInvoiceCard(invoice) {
    const card = document.createElement('div');
    card.className = 'invoice-card';
    
    const statusClass = invoice.status.toLowerCase();
    
    // Calculate days until due
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    card.innerHTML = `
        <div class="invoice-header">
            <div class="invoice-id">${invoice.id}</div>
            <div class="invoice-status status-${statusClass}">${invoice.status}</div>
        </div>
        <div class="invoice-details">
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-user"></i> Artisan Name</span>
                <span class="detail-value">${invoice.artisanName}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-rupee-sign"></i> Amount</span>
                <span class="detail-value">₹${invoice.amount.toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-calendar-plus"></i> Issue Date</span>
                <span class="detail-value">${formatDate(invoice.issueDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label"><i class="fas fa-calendar-check"></i> Due Date</span>
                <span class="detail-value">${formatDate(invoice.dueDate)}</span>
            </div>
            ${invoice.status !== 'Paid' ? `
                <div class="detail-item">
                    <span class="detail-label"><i class="fas fa-clock"></i> Days ${daysUntilDue >= 0 ? 'Until Due' : 'Overdue'}</span>
                    <span class="detail-value" style="color: ${daysUntilDue < 0 ? '#ef4444' : daysUntilDue < 7 ? '#f57c00' : '#2E7D32'}">
                        ${Math.abs(daysUntilDue)} days
                    </span>
                </div>
            ` : ''}
        </div>
        <div class="invoice-actions">
            <button class="btn-secondary" onclick="viewInvoiceDetails('${invoice.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
            <button class="btn-secondary" onclick="downloadInvoice('${invoice.id}')">
                <i class="fas fa-download"></i> Download
            </button>
            ${invoice.status !== 'Paid' ? `
                <button class="btn-action btn-pay" onclick="payInvoice('${invoice.id}')">
                    <i class="fas fa-credit-card"></i> Pay Now
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

// Filter invoices
function filterInvoices(filter) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.filter-btn').classList.add('active');
    
    // Load filtered invoices
    loadInvoices(filter);
}

// View invoice details
function viewInvoiceDetails(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const modal = document.getElementById('invoiceDetailsModal');
    const content = document.getElementById('invoiceDetailsContent');
    
    const subtotal = invoice.amount;
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const total = subtotal + cgst + sgst;
    
    // Generate line items
    const itemCount = Math.floor(Math.random() * 3) + 2;
    const lineItems = [];
    let remainingAmount = subtotal;
    
    for (let i = 0; i < itemCount; i++) {
        const isLast = i === itemCount - 1;
        const itemAmount = isLast ? remainingAmount : Math.floor(remainingAmount / (itemCount - i) * (0.5 + Math.random()));
        remainingAmount -= itemAmount;
        
        const quantity = Math.floor(Math.random() * 50) + 10;
        const unitPrice = Math.floor(itemAmount / quantity);
        
        lineItems.push({
            description: `Handcrafted Item ${i + 1}`,
            quantity: quantity,
            unitPrice: unitPrice,
            amount: quantity * unitPrice
        });
    }
    
    // Payment history for paid invoices
    const paymentHistory = invoice.status === 'Paid' ? [
        { date: invoice.dueDate, amount: total, method: 'Credit Card' }
    ] : [];
    
    content.innerHTML = `
        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Invoice Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Invoice ID</div>
                    <div class="info-value">${invoice.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Artisan Name</div>
                    <div class="info-value">${invoice.artisanName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Issue Date</div>
                    <div class="info-value">${formatDate(invoice.issueDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Due Date</div>
                    <div class="info-value">${formatDate(invoice.dueDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${invoice.status === 'Paid' ? '#2E7D32' : invoice.status === 'Overdue' ? '#ef4444' : '#f57c00'}">${invoice.status}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Payment Terms</div>
                    <div class="info-value">Net 30 Days</div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-list"></i> Line Items</h3>
            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineItems.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity} units</td>
                            <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
                            <td>₹${item.amount.toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="tax-breakdown">
            <h4><i class="fas fa-calculator"></i> Tax Breakdown</h4>
            <div class="tax-item">
                <span>Subtotal:</span>
                <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="tax-item">
                <span>CGST (9%):</span>
                <span>₹${cgst.toLocaleString('en-IN')}</span>
            </div>
            <div class="tax-item">
                <span>SGST (9%):</span>
                <span>₹${sgst.toLocaleString('en-IN')}</span>
            </div>
            <div class="tax-item">
                <span>Total Amount:</span>
                <span>₹${total.toLocaleString('en-IN')}</span>
            </div>
        </div>

        ${paymentHistory.length > 0 ? `
            <div class="info-section">
                <h3><i class="fas fa-history"></i> Payment History</h3>
                <div class="payment-history">
                    ${paymentHistory.map(payment => `
                        <div class="history-item">
                            <div>
                                <div style="font-weight: 600; color: var(--primary-brown); margin-bottom: 5px;">
                                    Payment Received
                                </div>
                                <div class="history-date">
                                    ${formatDate(payment.date)} via ${payment.method}
                                </div>
                            </div>
                            <div class="history-amount">
                                ₹${payment.amount.toLocaleString('en-IN')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div class="info-section">
            <h3><i class="fas fa-file-alt"></i> Payment Terms</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; color: #666; line-height: 1.6;">
                Payment is due within 30 days of invoice date. Late payments may incur additional charges. 
                Please include invoice number in payment reference. For any queries, contact our accounts department.
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Download invoice
function downloadInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const modal = document.getElementById('downloadModal');
    const content = document.getElementById('downloadContent');
    
    content.innerHTML = `
        <div class="download-status">
            <div class="download-icon">
                <i class="fas fa-file-download"></i>
            </div>
            <div class="download-message">Preparing your invoice...</div>
            <div class="download-filename">${invoice.id}_Invoice.pdf</div>
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
                    <div class="download-filename">${invoice.id}_Invoice.pdf</div>
                </div>
            `;
            
            // Create and download blob
            const total = invoice.amount * 1.18;
            const invoiceContent = `SheBalance Invoice\n\nInvoice ID: ${invoice.id}\nArtisan: ${invoice.artisanName}\nAmount: ₹${invoice.amount.toLocaleString('en-IN')}\nGST (18%): ₹${(invoice.amount * 0.18).toLocaleString('en-IN')}\nTotal: ₹${total.toLocaleString('en-IN')}\nIssue Date: ${formatDate(invoice.issueDate)}\nDue Date: ${formatDate(invoice.dueDate)}\nStatus: ${invoice.status}\n\nThis is a simulated invoice document.`;
            const blob = new Blob([invoiceContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${invoice.id}_Invoice.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Close modal after 2 seconds
            setTimeout(() => {
                closeModal('downloadModal');
                showNotification('✅ Invoice downloaded successfully!', 'success');
            }, 2000);
        }
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
            progressBar.textContent = Math.floor(progress) + '%';
        }
    }, 100);
}

// Pay invoice
function payInvoice(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const modal = document.getElementById('paymentModal');
    const content = document.getElementById('paymentContent');
    
    const total = invoice.amount * 1.18; // Including 18% GST
    
    content.innerHTML = `
        <div class="amount-display">
            <div class="amount-label">Total Amount to Pay</div>
            <div class="amount-value">₹${total.toLocaleString('en-IN')}</div>
            <div class="amount-label" style="margin-top: 5px; font-size: 12px;">
                (Including 18% GST)
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-credit-card"></i> Select Payment Method</h3>
            <div class="payment-methods">
                <div class="payment-method" onclick="selectPaymentMethod('credit-card', this)">
                    <i class="fas fa-credit-card"></i>
                    <div class="payment-method-name">Credit Card</div>
                </div>
                <div class="payment-method" onclick="selectPaymentMethod('debit-card', this)">
                    <i class="fas fa-credit-card"></i>
                    <div class="payment-method-name">Debit Card</div>
                </div>
                <div class="payment-method" onclick="selectPaymentMethod('upi', this)">
                    <i class="fas fa-mobile-alt"></i>
                    <div class="payment-method-name">UPI</div>
                </div>
                <div class="payment-method" onclick="selectPaymentMethod('net-banking', this)">
                    <i class="fas fa-university"></i>
                    <div class="payment-method-name">Net Banking</div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3><i class="fas fa-info-circle"></i> Payment Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Invoice ID</div>
                    <div class="info-value">${invoice.id}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Artisan</div>
                    <div class="info-value">${invoice.artisanName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Due Date</div>
                    <div class="info-value">${formatDate(invoice.dueDate)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${invoice.status === 'Overdue' ? '#ef4444' : '#f57c00'}">${invoice.status}</div>
                </div>
            </div>
        </div>

        <button class="btn-pay-now" id="payNowBtn" onclick="processPayment('${invoice.id}')" disabled>
            <i class="fas fa-lock"></i> Select Payment Method to Continue
        </button>
    `;
    
    modal.classList.add('active');
}

let selectedPaymentMethod = null;

function selectPaymentMethod(method, element) {
    // Remove selected class from all methods
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selected class to clicked method
    element.classList.add('selected');
    selectedPaymentMethod = method;
    
    // Enable pay button
    const payBtn = document.getElementById('payNowBtn');
    if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = '<i class="fas fa-check-circle"></i> Proceed to Pay';
    }
}

function processPayment(invoiceId) {
    if (!selectedPaymentMethod) {
        showNotification('⚠️ Please select a payment method', 'error');
        return;
    }
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const content = document.getElementById('paymentContent');
    
    // Show processing animation
    content.innerHTML = `
        <div class="processing-animation">
            <div class="processing-spinner"></div>
            <div class="processing-message">Processing Payment...</div>
            <div class="processing-detail">Please wait while we process your payment securely</div>
        </div>
    `;
    
    // Simulate payment processing
    setTimeout(() => {
        // Random success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
            
            content.innerHTML = `
                <div class="payment-result">
                    <div class="result-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="result-message success">Payment Successful!</div>
                    <div class="result-detail">Your payment has been processed successfully</div>
                    
                    <div class="transaction-id">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Transaction ID</div>
                        <div style="font-size: 16px; font-weight: 600;">${transactionId}</div>
                    </div>
                    
                    <div class="info-grid" style="margin-top: 20px;">
                        <div class="info-item">
                            <div class="info-label">Invoice ID</div>
                            <div class="info-value">${invoice.id}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Amount Paid</div>
                            <div class="info-value">₹${(invoice.amount * 1.18).toLocaleString('en-IN')}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Payment Method</div>
                            <div class="info-value">${selectedPaymentMethod.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Date & Time</div>
                            <div class="info-value">${new Date().toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    
                    <button class="btn-pay-now" onclick="closePaymentAndRefresh()">
                        <i class="fas fa-check"></i> Done
                    </button>
                </div>
            `;
            
            // Update invoice status
            invoice.status = 'Paid';
            
        } else {
            content.innerHTML = `
                <div class="payment-result">
                    <div class="result-icon error">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="result-message error">Payment Failed</div>
                    <div class="result-detail">We couldn't process your payment. Please try again.</div>
                    
                    <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; color: #666;">
                        <strong>Possible reasons:</strong><br>
                        • Insufficient funds<br>
                        • Network connectivity issues<br>
                        • Payment gateway timeout
                    </div>
                    
                    <button class="btn-pay-now" onclick="payInvoice('${invoice.id}')">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
        }
    }, 3500);
}

function closePaymentAndRefresh() {
    closeModal('paymentModal');
    selectedPaymentMethod = null;
    loadInvoices(currentFilter);
    showNotification('✅ Payment completed successfully!', 'success');
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
    selectedPaymentMethod = null;
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        selectedPaymentMethod = null;
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        selectedPaymentMethod = null;
    }
});
