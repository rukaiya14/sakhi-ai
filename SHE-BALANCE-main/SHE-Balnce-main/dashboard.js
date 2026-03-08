


// ============================================
// USER AUTHENTICATION & PROFILE
// ============================================

// Load user data and display name
function loadUserProfile() {
    console.log('Loading user profile...');
    
    // Check if user is logged in
    const token = localStorage.getItem('shebalance_token');
    const userDataStr = localStorage.getItem('shebalance_user');
    
    if (!token || !userDataStr) {
        console.log('No user session found, redirecting to login...');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const userData = JSON.parse(userDataStr);
        console.log('User data loaded:', userData);
        
        // Update user name in header
        const userNameElement = document.getElementById('userName');
        const userNameProfileElement = document.getElementById('userNameProfile');
        
        if (userNameElement) {
            userNameElement.textContent = userData.name || userData.fullName || 'User';
            console.log('Updated userName element');
        }
        
        if (userNameProfileElement) {
            userNameProfileElement.textContent = userData.name || userData.fullName || 'User';
            console.log('Updated userNameProfile element');
        }
        
        // Fetch fresh profile data from backend
        fetchUserProfile(token);
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        // If there's an error, redirect to login
        window.location.href = 'index.html';
    }
}

// Fetch user profile from backend API
async function fetchUserProfile(token) {
    try {
        console.log('Fetching profile from backend...');
        const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        console.log('Profile data from backend:', data);
        
        // Update localStorage with fresh data
        if (data.user) {
            const userData = {
                email: data.user.email,
                name: data.user.fullName,
                role: data.user.role,
                userId: data.user.userId,
                status: data.user.status
            };
            localStorage.setItem('shebalance_user', JSON.stringify(userData));
            
            // Update UI with fresh data
            const userNameElement = document.getElementById('userName');
            const userNameProfileElement = document.getElementById('userNameProfile');
            
            if (userNameElement) {
                userNameElement.textContent = data.user.fullName;
            }
            
            if (userNameProfileElement) {
                userNameProfileElement.textContent = data.user.fullName;
            }
        }
        
    } catch (error) {
        console.error('Error fetching profile from backend:', error);
        // Continue with cached data if backend fails
    }
}

// Logout function
function logout() {
    console.log('Logging out...');
    localStorage.removeItem('shebalance_token');
    localStorage.removeItem('shebalance_user');
    window.location.href = 'index.html';
}

// ============================================
// BUSINESS CAROUSEL FUNCTIONALITY
// ============================================


// Business Carousel Functionality
let businessCurrentSlide = 0;
let businessAutoPlayInterval;

function moveBusinessCarousel(direction) {
    const track = document.getElementById('businessCarouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    businessCurrentSlide += direction;
    
    if (businessCurrentSlide < 0) {
        businessCurrentSlide = totalSlides - 1;
    } else if (businessCurrentSlide >= totalSlides) {
        businessCurrentSlide = 0;
    }
    
    updateBusinessCarousel();
}

function updateBusinessCarousel() {
    const track = document.getElementById('businessCarouselTrack');
    const indicators = document.querySelectorAll('#businessIndicators .carousel-indicator');
    
    if (track) {
        track.style.transform = `translateX(-${businessCurrentSlide * 100}%)`;
    }
    
    indicators.forEach((indicator, index) => {
        if (index === businessCurrentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function initBusinessCarousel() {
    const track = document.getElementById('businessCarouselTrack');
    const indicatorsContainer = document.getElementById('businessIndicators');
    
    if (track && indicatorsContainer) {
        const slides = track.querySelectorAll('.carousel-slide');
        
        // Create indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'carousel-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.onclick = () => {
                businessCurrentSlide = index;
                updateBusinessCarousel();
                resetBusinessAutoPlay();
            };
            indicatorsContainer.appendChild(indicator);
        });
        
        // Start auto-play
        startBusinessAutoPlay();
    }
}

function startBusinessAutoPlay() {
    businessAutoPlayInterval = setInterval(() => {
        moveBusinessCarousel(1);
    }, 5000); // Change slide every 5 seconds
}

function resetBusinessAutoPlay() {
    clearInterval(businessAutoPlayInterval);
    startBusinessAutoPlay();
}

// Initialize business carousel on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load user profile first
    loadUserProfile();
    
    // Initialize business carousel
    initBusinessCarousel();
});


// Bulk Order Management Functions
function updateBulkOrder(orderId) {
    const orderData = {
        'BO-2024-001': {
            title: 'Taj Hotels - Embroidered Table Linens',
            total: 500,
            completed: 320
        },
        'BO-2024-002': {
            title: 'FabIndia - Handwoven Scarves',
            total: 200,
            completed: 0
        }
    };
    
    const order = orderData[orderId];
    if (!order) return;
    
    const newCompleted = prompt(`Update progress for ${order.title}\n\nTotal Quantity: ${order.total} pieces\nCurrent Progress: ${order.completed} pieces\n\nEnter new completed quantity:`, order.completed);
    
    if (newCompleted !== null && !isNaN(newCompleted)) {
        const completed = parseInt(newCompleted);
        if (completed >= 0 && completed <= order.total) {
            // Progress updated - no alert
            console.log(`Progress updated: ${order.title} - ${completed}/${order.total} pieces`);
            // In a real app, this would update the database
        } else {
            console.log('Invalid quantity entered');
        }
    }
}

function contactSupport(orderId) {
    const orderData = {
        'BO-2024-001': 'Taj Hotels - Embroidered Table Linens',
        'BO-2024-002': 'FabIndia - Handwoven Scarves'
    };
    
    const orderTitle = orderData[orderId] || 'Unknown Order';
    
    const reasons = [
        '1. Health issues',
        '2. Family emergency',
        '3. Material shortage',
        '4. Equipment breakdown',
        '5. Need deadline extension',
        '6. Other'
    ];
    
    const reason = prompt(`Contact Support for: ${orderTitle}\n\nPlease select a reason:\n${reasons.join('\n')}\n\nEnter number (1-6):`);
    
    if (reason && reason >= '1' && reason <= '6') {
        const details = prompt('Please provide additional details about your situation:');
        if (details) {
            console.log(`Support request submitted for ${orderTitle}`);
            // In a real app, this would send the support request to the admin
        }
    }
}


// AI Sakhi Panel Functions
function openAISakhi() {
    console.log('🤖 Opening AI Sakhi panel...');
    
    const panel = document.getElementById('aiSakhiPanel');
    const overlay = document.getElementById('aiSakhiOverlay');
    
    if (!panel) {
        console.error('❌ aiSakhiPanel element not found!');
        alert('AI Sakhi panel not found. Please refresh the page.');
        return;
    }
    
    if (!overlay) {
        console.error('❌ aiSakhiOverlay element not found!');
        alert('AI Sakhi overlay not found. Please refresh the page.');
        return;
    }
    
    console.log('✅ Elements found, adding active classes...');
    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    console.log('✅ AI Sakhi panel opened successfully!');
}

function closeAISakhi() {
    document.getElementById('aiSakhiPanel').classList.remove('active');
    document.getElementById('aiSakhiOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('sakhiFormArea').innerHTML = '';
}

function showBulkOrderUpdate() {
    const formArea = document.getElementById('sakhiFormArea');
    formArea.innerHTML = `
        <div class="sakhi-form">
            <h4><i class="fas fa-tasks"></i> Update Bulk Order Progress</h4>
            <div class="form-group-sakhi">
                <label>Select Order</label>
                <select id="orderSelect">
                    <option value="">Choose an order...</option>
                    <option value="BO-2024-001">Taj Hotels - Embroidered Table Linens (500 pcs)</option>
                    <option value="BO-2024-002">FabIndia - Handwoven Scarves (200 pcs)</option>
                </select>
            </div>
            <div class="form-group-sakhi">
                <label>Completed Quantity</label>
                <input type="number" id="completedQty" placeholder="Enter number of pieces completed">
            </div>
            <div class="form-group-sakhi">
                <label>Progress Notes (Optional)</label>
                <textarea id="progressNotes" placeholder="Any updates or challenges you want to share..."></textarea>
            </div>
            <div class="sakhi-form-actions">
                <button class="btn-sakhi-cancel" onclick="document.getElementById('sakhiFormArea').innerHTML=''">Cancel</button>
                <button class="btn-sakhi-submit" onclick="submitBulkOrderUpdate()">Submit Update</button>
            </div>
        </div>
    `;
    formArea.scrollIntoView({ behavior: 'smooth' });
}

function submitBulkOrderUpdate() {
    const order = document.getElementById('orderSelect').value;
    const qty = document.getElementById('completedQty').value;
    
    if (!order || !qty) {
        console.log('Missing required fields');
        return;
    }
    
    document.getElementById('sakhiFormArea').innerHTML = `
        <div class="sakhi-success-message">
            <i class="fas fa-check-circle"></i>
            <h4>Progress Updated Successfully!</h4>
            <p>Your bulk order progress has been recorded. The admin team has been notified and your work will be reviewed shortly.</p>
        </div>
    `;
}

function showHealthIssue() {
    const formArea = document.getElementById('sakhiFormArea');
    formArea.innerHTML = `
        <div class="sakhi-form">
            <h4><i class="fas fa-heartbeat"></i> Report Health Issue</h4>
            <div class="form-group-sakhi">
                <label>How are you feeling?</label>
                <select id="healthStatus">
                    <option value="">Select...</option>
                    <option value="mild">Mild discomfort - Can work with rest</option>
                    <option value="moderate">Moderate illness - Need a few days off</option>
                    <option value="severe">Severe illness - Need immediate support</option>
                </select>
            </div>
            <div class="form-group-sakhi">
                <label>Describe your situation</label>
                <textarea id="healthDescription" placeholder="Tell us what's happening so we can help you better..."></textarea>
            </div>
            <div class="form-group-sakhi">
                <label>Do you need emergency support?</label>
                <select id="emergencySupport">
                    <option value="no">No, just informing</option>
                    <option value="yes">Yes, I need immediate help</option>
                </select>
            </div>
            <div class="sakhi-form-actions">
                <button class="btn-sakhi-cancel" onclick="document.getElementById('sakhiFormArea').innerHTML=''">Cancel</button>
                <button class="btn-sakhi-submit" onclick="submitHealthIssue()">Submit Report</button>
            </div>
        </div>
    `;
    formArea.scrollIntoView({ behavior: 'smooth' });
}

function submitHealthIssue() {
    const status = document.getElementById('healthStatus').value;
    const description = document.getElementById('healthDescription').value;
    
    if (!status || !description) {
        console.log('Missing required fields');
        return;
    }
    
    document.getElementById('sakhiFormArea').innerHTML = `
        <div class="sakhi-success-message">
            <i class="fas fa-check-circle"></i>
            <h4>Health Report Submitted</h4>
            <p>We're sorry to hear you're not feeling well. Our support team and community care coordinators have been notified. Someone will reach out to you within 2 hours via WhatsApp. Take care! 💚</p>
        </div>
    `;
}

function showAdvancePayment() {
    const formArea = document.getElementById('sakhiFormArea');
    formArea.innerHTML = `
        <div class="sakhi-form">
            <h4><i class="fas fa-hand-holding-usd"></i> Request Advance Payment</h4>
            <div class="form-group-sakhi">
                <label>Amount Needed (₹)</label>
                <input type="number" id="advanceAmount" placeholder="Enter amount">
            </div>
            <div class="form-group-sakhi">
                <label>Reason for Advance</label>
                <select id="advanceReason">
                    <option value="">Select reason...</option>
                    <option value="materials">Need to buy materials</option>
                    <option value="medical">Medical emergency</option>
                    <option value="family">Family emergency</option>
                    <option value="education">Children's education</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group-sakhi">
                <label>Explain your situation</label>
                <textarea id="advanceExplanation" placeholder="Help us understand why you need this advance..."></textarea>
            </div>
            <div class="form-group-sakhi">
                <label>When do you need it?</label>
                <select id="advanceUrgency">
                    <option value="urgent">Urgent (within 24 hours)</option>
                    <option value="soon">Soon (within 3 days)</option>
                    <option value="flexible">Flexible (within a week)</option>
                </select>
            </div>
            <div class="sakhi-form-actions">
                <button class="btn-sakhi-cancel" onclick="document.getElementById('sakhiFormArea').innerHTML=''">Cancel</button>
                <button class="btn-sakhi-submit" onclick="submitAdvancePayment()">Submit Request</button>
            </div>
        </div>
    `;
    formArea.scrollIntoView({ behavior: 'smooth' });
}

function submitAdvancePayment() {
    const amount = document.getElementById('advanceAmount').value;
    const reason = document.getElementById('advanceReason').value;
    const explanation = document.getElementById('advanceExplanation').value;
    
    if (!amount || !reason || !explanation) {
        console.log('Missing required fields');
        return;
    }
    
    document.getElementById('sakhiFormArea').innerHTML = `
        <div class="sakhi-success-message">
            <i class="fas fa-check-circle"></i>
            <h4>Advance Payment Request Submitted</h4>
            <p>Your request for ₹${amount} has been submitted to the admin team. They will review it and get back to you within 24 hours. We understand your situation and will do our best to help! 🙏</p>
        </div>
    `;
}

function showPaymentRequest() {
    const formArea = document.getElementById('sakhiFormArea');
    formArea.innerHTML = `
        <div class="sakhi-form">
            <h4><i class="fas fa-money-check-alt"></i> Request Payment for Work Done</h4>
            <div class="form-group-sakhi">
                <label>Select Order/Work</label>
                <select id="paymentOrder">
                    <option value="">Choose work...</option>
                    <option value="BO-2024-001">Taj Hotels - Embroidered Table Linens</option>
                    <option value="BO-2024-002">FabIndia - Handwoven Scarves</option>
                    <option value="custom">Custom/Other Work</option>
                </select>
            </div>
            <div class="form-group-sakhi">
                <label>Work Completed (%)</label>
                <input type="number" id="workCompleted" placeholder="Enter percentage (e.g., 50)" min="0" max="100">
            </div>
            <div class="form-group-sakhi">
                <label>Amount to be Paid (₹)</label>
                <input type="number" id="paymentAmount" placeholder="Enter amount">
            </div>
            <div class="form-group-sakhi">
                <label>Work Details</label>
                <textarea id="workDetails" placeholder="Describe the work you've completed..."></textarea>
            </div>
            <div class="form-group-sakhi">
                <label>Upload Proof (Optional)</label>
                <input type="file" accept="image/*" style="padding: 8px;">
            </div>
            <div class="sakhi-form-actions">
                <button class="btn-sakhi-cancel" onclick="document.getElementById('sakhiFormArea').innerHTML=''">Cancel</button>
                <button class="btn-sakhi-submit" onclick="submitPaymentRequest()">Submit Request</button>
            </div>
        </div>
    `;
    formArea.scrollIntoView({ behavior: 'smooth' });
}

function submitPaymentRequest() {
    const order = document.getElementById('paymentOrder').value;
    const completed = document.getElementById('workCompleted').value;
    const amount = document.getElementById('paymentAmount').value;
    
    if (!order || !completed || !amount) {
        console.log('Missing required fields');
        return;
    }
    
    document.getElementById('sakhiFormArea').innerHTML = `
        <div class="sakhi-success-message">
            <i class="fas fa-check-circle"></i>
            <h4>Payment Request Submitted</h4>
            <p>Your payment request for ₹${amount} has been submitted. The admin will verify your work and process the payment within 2-3 business days. Thank you for your hard work! 💪</p>
        </div>
    `;
}

function showContactSupport() {
    const formArea = document.getElementById('sakhiFormArea');
    formArea.innerHTML = `
        <div class="sakhi-form">
            <h4><i class="fas fa-headset"></i> Contact Support</h4>
            <div class="form-group-sakhi">
                <label>Issue Category</label>
                <select id="supportCategory">
                    <option value="">Select category...</option>
                    <option value="technical">Technical Issue</option>
                    <option value="payment">Payment Related</option>
                    <option value="order">Order/Work Related</option>
                    <option value="account">Account Issue</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group-sakhi">
                <label>Subject</label>
                <input type="text" id="supportSubject" placeholder="Brief description of your issue">
            </div>
            <div class="form-group-sakhi">
                <label>Describe Your Issue</label>
                <textarea id="supportMessage" placeholder="Please provide as much detail as possible..."></textarea>
            </div>
            <div class="form-group-sakhi">
                <label>Priority</label>
                <select id="supportPriority">
                    <option value="low">Low - Can wait</option>
                    <option value="medium">Medium - Need help soon</option>
                    <option value="high">High - Urgent</option>
                </select>
            </div>
            <div class="sakhi-form-actions">
                <button class="btn-sakhi-cancel" onclick="document.getElementById('sakhiFormArea').innerHTML=''">Cancel</button>
                <button class="btn-sakhi-submit" onclick="submitSupportRequest()">Submit Ticket</button>
            </div>
        </div>
    `;
    formArea.scrollIntoView({ behavior: 'smooth' });
}

function submitSupportRequest() {
    const category = document.getElementById('supportCategory').value;
    const subject = document.getElementById('supportSubject').value;
    const message = document.getElementById('supportMessage').value;
    
    if (!category || !subject || !message) {
        console.log('Missing required fields');
        return;
    }
    
    document.getElementById('sakhiFormArea').innerHTML = `
        <div class="sakhi-success-message">
            <i class="fas fa-check-circle"></i>
            <h4>Support Ticket Created</h4>
            <p>Your support ticket has been created successfully. Our support team will respond to you within 24 hours via WhatsApp or phone. Ticket ID: #SK${Math.floor(Math.random() * 10000)}</p>
        </div>
    `;
}

// ============================================
// BULK ORDERS MANAGEMENT
// ============================================

// Load bulk orders from backend
async function loadBulkOrders() {
    const bulkOrdersList = document.getElementById('bulkOrdersList');
    const reminderAlert = document.getElementById('reminderAlert');
    const reminderCount = document.getElementById('reminderCount');
    
    console.log('🔍 loadBulkOrders: Starting...');
    console.log('🔍 bulkOrdersList element:', bulkOrdersList);
    
    if (!bulkOrdersList) {
        console.error('❌ bulkOrdersList element not found!');
        return;
    }
    
    // Get current language
    const currentLang = getCurrentLanguage();
    
    try {
        // Show loading state
        bulkOrdersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 10px;"></i>
                <p>${t('loadingOrders', currentLang)}</p>
            </div>
        `;
        
        // Get token
        const token = localStorage.getItem('shebalance_token');
        console.log('🔍 Token found:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        
        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }
        
        // Fetch orders from backend
        console.log('🔍 Fetching orders from http://localhost:5000/api/orders');
        const response = await fetch('http://localhost:5000/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response ok:', response.ok);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ API Error:', errorData);
            throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch orders`);
        }
        
        const data = await response.json();
        console.log('🔍 Orders data received:', data);
        
        const orders = data.orders || [];
        console.log('🔍 Total orders:', orders.length);
        
        // Filter bulk orders
        const bulkOrders = orders.filter(order => order.orderType === 'bulk');
        console.log('🔍 Bulk orders:', bulkOrders.length);
        
        if (bulkOrders.length === 0) {
            console.log('ℹ️ No bulk orders found');
            bulkOrdersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p style="font-size: 18px; margin-bottom: 10px;">${t('noBulkOrders', currentLang)}</p>
                    <p style="font-size: 14px;">${t('bulkOrdersWillAppear', currentLang)}</p>
                </div>
            `;
            return;
        }
        
        // Calculate which orders need reminders
        const currentTime = new Date();
        const ordersNeedingReminders = bulkOrders.filter(order => {
            if (order.status === 'completed' || order.status === 'cancelled') return false;
            const lastUpdate = new Date(order.lastProgressUpdate || order.createdAt);
            const daysSinceUpdate = Math.floor((currentTime - lastUpdate) / (1000 * 60 * 60 * 24));
            return daysSinceUpdate >= 3;
        });
        
        // Show/hide reminder alert
        if (ordersNeedingReminders.length > 0 && reminderAlert && reminderCount) {
            reminderAlert.style.display = 'block';
            reminderCount.textContent = ordersNeedingReminders.length;
        } else if (reminderAlert) {
            reminderAlert.style.display = 'none';
        }
        
        // Render orders
        bulkOrdersList.innerHTML = bulkOrders.map(order => {
            const lastUpdate = new Date(order.lastProgressUpdate || order.createdAt);
            const daysSinceUpdate = Math.floor((currentTime - lastUpdate) / (1000 * 60 * 60 * 24));
            const needsReminder = daysSinceUpdate >= 3 && order.status !== 'completed' && order.status !== 'cancelled';
            const progress = order.progressPercentage || 0;
            
            // Status badge color
            let statusColor = '#2196F3'; // blue for in-progress
            if (order.status === 'completed') statusColor = '#4CAF50'; // green
            if (order.status === 'pending') statusColor = '#FF9800'; // orange
            if (order.status === 'cancelled') statusColor = '#f44336'; // red
            
            // Translate status
            const statusText = t(order.status, currentLang);
            
            return `
                <div class="bulk-order-item" style="
                    border: 2px solid ${needsReminder ? '#f44336' : '#e0e0e0'};
                    background: ${needsReminder ? '#FFEBEE' : 'white'};
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                ">
                    ${needsReminder ? `
                        <div style="background: #f44336; color: white; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>⚠️ ${t('reminderNeeded', currentLang)}</strong> ${t('noProgressUpdate', currentLang)} ${daysSinceUpdate} ${t('daysAgo', currentLang)}
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="color: #5D4037; margin-bottom: 5px; font-size: 18px;">
                                ${order.title}
                            </h4>
                            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                                ${order.description || 'No description'}
                            </p>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                                <span style="color: #666; font-size: 14px;">
                                    <i class="fas fa-box"></i> ${order.quantity} ${t('pieces', currentLang)}
                                </span>
                                <span style="color: #666; font-size: 14px;">
                                    <i class="fas fa-rupee-sign"></i> ₹${order.price?.toLocaleString()}
                                </span>
                                <span style="color: #666; font-size: 14px;">
                                    <i class="fas fa-calendar"></i> ${daysSinceUpdate} ${t('daysSinceUpdate', currentLang)}
                                </span>
                            </div>
                        </div>
                        <span style="
                            background: ${statusColor};
                            color: white;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            text-transform: uppercase;
                        ">
                            ${statusText}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #666; font-size: 14px;">${t('progressPercentage', currentLang)}</span>
                            <span style="color: #5D4037; font-weight: 600;">${progress}%</span>
                        </div>
                        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="
                                background: ${progress === 100 ? '#4CAF50' : '#8D6E63'};
                                height: 100%;
                                width: ${progress}%;
                                transition: width 0.3s;
                            "></div>
                        </div>
                    </div>
                    
                    ${order.progressNote ? `
                        <div style="background: #F5F5DC; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                            <strong style="color: #5D4037; font-size: 14px;">Latest Note:</strong>
                            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">${order.progressNote}</p>
                        </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;" id="order-buttons-${order.orderId}">
                        <button onclick="updateOrderProgress('${order.orderId}')" style="
                            background: #8D6E63;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 14px;
                        ">
                            <i class="fas fa-edit"></i> ${t('updateProgress', currentLang)}
                        </button>
                        ${needsReminder ? `
                            <button onclick="initiateVoiceCall('${order.orderId}')" style="
                                background: #2196F3;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 14px;
                            ">
                                <i class="fas fa-phone"></i> Voice Call
                            </button>
                            <button onclick="contactSupportForOrder('${order.orderId}')" style="
                                background: #f44336;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 14px;
                            ">
                                <i class="fas fa-headset"></i> Need Help
                            </button>
                        ` : ''}
                    </div>
                    
                    <div id="voice-call-status-${order.orderId}" style="margin-top: 15px;"></div>
                </div>
            `;
        }).join('');
        
        // Check voice call status for each order
        bulkOrders.forEach(async (order) => {
            const voiceStatus = await checkVoiceCallStatus(order.orderId);
            if (voiceStatus) {
                const statusDiv = document.getElementById(`voice-call-status-${order.orderId}`);
                if (statusDiv) {
                    const callDate = new Date(voiceStatus.callInitiatedAt).toLocaleString();
                    const language = voiceStatus.language === 'hi-IN' ? 'Hindi' : 'English';
                    statusDiv.innerHTML = `
                        <div style="background: #E3F2FD; padding: 12px; border-radius: 5px; border-left: 4px solid #2196F3;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-phone" style="color: #2196F3; font-size: 20px;"></i>
                                <div style="flex: 1;">
                                    <strong style="color: #1976D2; font-size: 14px;">Voice Call Initiated</strong>
                                    <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">
                                        ${callDate} • ${language} • ${voiceStatus.phoneNumber}
                                    </p>
                                </div>
                                <button onclick="showVoiceCallDetails('${order.orderId}')" style="
                                    background: transparent;
                                    color: #2196F3;
                                    border: 1px solid #2196F3;
                                    padding: 6px 12px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 12px;
                                ">
                                    Details
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error loading bulk orders:', error);
        console.error('❌ Error stack:', error.stack);
        bulkOrdersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #f44336;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p style="font-size: 18px; margin-bottom: 10px;">Failed to load orders</p>
                <p style="font-size: 14px; color: #666;">${error.message}</p>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">Check browser console (F12) for details</p>
                <button onclick="loadBulkOrders()" style="
                    background: #8D6E63;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                ">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Update order progress
async function updateOrderProgress(orderId) {
    const newProgress = prompt('Enter progress percentage (0-100):');
    
    if (newProgress === null) return;
    
    const progress = parseInt(newProgress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
        alert('Please enter a valid number between 0 and 100');
        return;
    }
    
    const note = prompt('Add a progress note (optional):');
    
    try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/progress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('shebalance_token')}`
            },
            body: JSON.stringify({
                progressPercentage: progress,
                progressNote: note || '',
                sendWhatsAppNotification: true // Enable WhatsApp notification
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update progress');
        }
        
        const data = await response.json();
        console.log('Progress updated successfully');
        
        // Show success message with WhatsApp notification status
        if (data.whatsappSent) {
            alert(`✅ Progress updated to ${progress}%\n📱 WhatsApp notification sent to buyer!`);
        } else {
            alert(`✅ Progress updated to ${progress}%`);
        }
        
        loadBulkOrders(); // Reload orders
        
    } catch (error) {
        console.error('Error updating progress:', error);
        alert('❌ Failed to update progress. Please try again.');
    }
}

// Contact support for specific order
function contactSupportForOrder(orderId) {
    const reasons = [
        '1. Health issues',
        '2. Family emergency',
        '3. Material shortage',
        '4. Equipment breakdown',
        '5. Need deadline extension',
        '6. Other'
    ];
    
    const reason = prompt(`Contact Support\n\nPlease select a reason:\n${reasons.join('\n')}\n\nEnter number (1-6):`);
    
    if (reason && reason >= '1' && reason <= '6') {
        const details = prompt('Please provide additional details about your situation:');
        if (details) {
            console.log(`Support request submitted for order ${orderId}`);
            // In a real app, this would send the support request to the backend
        }
    }
}

// Initialize bulk orders on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load user profile first
    loadUserProfile();
    
    // Initialize business carousel
    initBusinessCarousel();
    
    // Load bulk orders
    loadBulkOrders();
});


// ============================================
// VOICE CALL FUNCTIONALITY
// ============================================

// Initiate voice call for an order
async function initiateVoiceCall(orderId) {
    try {
        const confirmed = confirm('Initiate voice call reminder for this order?\n\nThis will generate a personalized voice message and simulate a call to the artisan.');
        
        if (!confirmed) return;
        
        // Show loading
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calling...';
        button.disabled = true;
        
        const response = await fetch('http://localhost:5000/api/voice-call/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('shebalance_token')}`
            },
            body: JSON.stringify({ orderId })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log(`Voice call initiated: ${data.call.callId}`);
            
            // Reload orders to show updated status
            loadBulkOrders();
        } else {
            throw new Error(data.error || 'Failed to initiate voice call');
        }
        
    } catch (error) {
        console.error('Error initiating voice call:', error);
    }
}

// Check voice call status for an order
async function checkVoiceCallStatus(orderId) {
    try {
        const response = await fetch(`http://localhost:5000/api/voice-call/status/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('shebalance_token')}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.hasVoiceCall) {
            return data.reminder;
        }
        
        return null;
    } catch (error) {
        console.error('Error checking voice call status:', error);
        return null;
    }
}

// Show voice call details modal
function showVoiceCallDetails(orderId) {
    checkVoiceCallStatus(orderId).then(reminder => {
        if (!reminder) {
            console.log('No voice call found for this order');
            return;
        }
        
        const callDate = new Date(reminder.callInitiatedAt).toLocaleString();
        const language = reminder.language === 'hi-IN' ? 'Hindi' : 'English';
        
        console.log(`Voice call status: ${reminder.status} - ${callDate}`);
    });
}


// ============================================
// INLINE BALANCE EDITOR FUNCTIONALITY
// ============================================

// Balance data storage
let balanceData = {
    household: 4.5,
    career: 2,
    selfcare: 1.5,
    overall: 65
};

// Load balance data from localStorage
function loadBalanceData() {
    const saved = localStorage.getItem('shebalance_daily_balance');
    if (saved) {
        try {
            balanceData = JSON.parse(saved);
            updateBalanceDisplay();
        } catch (e) {
            console.error('Error loading balance data:', e);
        }
    }
}

// Update balance display on dashboard
function updateBalanceDisplay() {
    // Calculate total hours for overall progress
    const totalHours = balanceData.household + balanceData.career + balanceData.selfcare;
    const overallProgressPercent = Math.min(Math.round((totalHours / 24) * 100), 100);
    
    // Update household
    const householdEl = document.getElementById('household-time');
    if (householdEl) {
        householdEl.textContent = `${balanceData.household}`;
        // Progress based on 8 hours as 100%
        const householdPercent = Math.min((balanceData.household / 8) * 100, 100);
        document.getElementById('household-progress').style.width = `${householdPercent}%`;
    }
    
    // Update career
    const careerEl = document.getElementById('career-time');
    if (careerEl) {
        careerEl.textContent = `${balanceData.career}`;
        // Progress based on 8 hours as 100%
        const careerPercent = Math.min((balanceData.career / 8) * 100, 100);
        document.getElementById('career-progress').style.width = `${careerPercent}%`;
    }
    
    // Update selfcare
    const selfcareEl = document.getElementById('selfcare-time');
    if (selfcareEl) {
        selfcareEl.textContent = `${balanceData.selfcare}`;
        // Progress based on 4 hours as 100%
        const selfcarePercent = Math.min((balanceData.selfcare / 4) * 100, 100);
        document.getElementById('selfcare-progress').style.width = `${selfcarePercent}%`;
    }
    
    // Update overall progress - based on total hours out of 24
    const overallEl = document.getElementById('overall-progress-text');
    if (overallEl) {
        overallEl.textContent = `${overallProgressPercent}`;
        document.getElementById('overall-progress').style.width = `${overallProgressPercent}%`;
        // Auto-update the stored value
        balanceData.overall = overallProgressPercent;
    }
}

// Select all text when clicking on editable field
function selectText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Handle Enter key to save and blur
function handleEnterKey(event, element) {
    if (event.key === 'Enter') {
        event.preventDefault();
        element.blur(); // This triggers onblur which calls saveInlineEdit
        return false;
    }
}

// Save inline edit
function saveInlineEdit(element) {
    const type = element.getAttribute('data-type');
    const text = element.textContent.trim();
    
    console.log(`🔄 Saving ${type}: ${text}`); // Debug log
    
    // Extract number from text (remove any non-numeric characters except decimal point)
    const numberMatch = text.match(/[\d.]+/);
    if (!numberMatch) {
        // Invalid input, restore previous value
        updateBalanceDisplay();
        showNotification('Please enter a valid number', 'error');
        return;
    }
    
    let value = parseFloat(numberMatch[0]);
    
    // Validate hours
    if (value < 0 || value > 24) {
        showNotification('Hours must be between 0 and 24', 'error');
        updateBalanceDisplay();
        return;
    }
    
    // Round to nearest 0.5
    value = Math.round(value * 2) / 2;
    
    // Check total hours don't exceed 24
    const tempData = { ...balanceData, [type]: value };
    const total = tempData.household + tempData.career + tempData.selfcare;
    if (total > 24) {
        showNotification('Total hours cannot exceed 24 hours per day!', 'error');
        updateBalanceDisplay();
        return;
    }
    
    // Update data
    balanceData[type] = value;
    
    // Update display (just the number)
    element.textContent = `${value}`;
    
    console.log(`✅ Updated ${type} to ${value} hours`); // Debug log
    
    // Get progress bar element
    const progressBar = document.getElementById(`${type}-progress`);
    
    // Force reflow to ensure animation triggers
    if (progressBar) {
        // Remove transition temporarily to reset
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        
        // Force browser reflow
        void progressBar.offsetWidth;
        
        // Re-enable transition
        progressBar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    
    // Update progress bar (this will also update overall progress)
    updateProgressBar(type, value);
    
    console.log(`📊 Progress bar animated for ${type}`); // Debug log
    
    // Save to storage
    saveBalanceData();
    
    // Show success
    showNotification('✓ Progress bar updated!', 'success');
    
    // Add pulse animation to the number
    element.style.animation = 'successPulse 0.5s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
    
    // Add glow effect to progress bar
    if (progressBar) {
        progressBar.style.boxShadow = '0 0 20px rgba(141, 110, 99, 0.6)';
        setTimeout(() => {
            progressBar.style.boxShadow = '';
        }, 800);
    }
}

// Update progress bar
function updateProgressBar(type, value) {
    console.log(`📊 Updating progress bar for ${type} with value ${value}`);
    
    let percentage;
    
    if (type === 'overall') {
        // Overall progress is auto-calculated from total hours
        const totalHours = balanceData.household + balanceData.career + balanceData.selfcare;
        percentage = Math.min((totalHours / 24) * 100, 100);
        balanceData.overall = Math.round(percentage);
    } else if (type === 'household') {
        // Household: 8 hours = 100%
        percentage = Math.min((value / 8) * 100, 100);
    } else if (type === 'career') {
        // Career: 8 hours = 100%
        percentage = Math.min((value / 8) * 100, 100);
    } else if (type === 'selfcare') {
        // Self care: 4 hours = 100%
        percentage = Math.min((value / 4) * 100, 100);
    }
    
    console.log(`📈 Calculated percentage: ${percentage}%`);
    
    const progressBar = document.getElementById(`${type === 'overall' ? 'overall' : type}-progress`);
    if (progressBar) {
        // Use setTimeout to ensure the width change happens after reflow
        setTimeout(() => {
            progressBar.style.width = `${percentage}%`;
            console.log(`✅ Progress bar width set to ${percentage}%`);
        }, 10);
    } else {
        console.error(`❌ Progress bar not found: ${type}-progress`);
    }
    
    // Update overall progress text if any hours changed
    if (type !== 'overall') {
        const totalHours = balanceData.household + balanceData.career + balanceData.selfcare;
        const overallPercent = Math.min(Math.round((totalHours / 24) * 100), 100);
        const overallText = document.getElementById('overall-progress-text');
        const overallBar = document.getElementById('overall-progress');
        
        if (overallText) {
            overallText.textContent = `${overallPercent}`;
            console.log(`📝 Overall text updated to ${overallPercent}%`);
        }
        
        if (overallBar) {
            setTimeout(() => {
                overallBar.style.width = `${overallPercent}%`;
                console.log(`📊 Overall bar updated to ${overallPercent}%`);
            }, 10);
        }
        
        balanceData.overall = overallPercent;
    }
}

// Save balance data
async function saveBalanceData() {
    // Save to localStorage
    localStorage.setItem('shebalance_daily_balance', JSON.stringify(balanceData));
    
    // Try to save to backend
    try {
        const token = localStorage.getItem('shebalance_token');
        if (token) {
            const response = await fetch('http://localhost:5000/api/users/balance', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(balanceData)
            });
            
            if (response.ok) {
                console.log('✅ Balance saved to backend');
            }
        }
    } catch (error) {
        console.error('Error saving to backend:', error);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.inline-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `inline-notification ${type}`;
    notification.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type] || colors.success};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10001;
        font-weight: 600;
        font-size: 14px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadBalanceData();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes successPulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);
