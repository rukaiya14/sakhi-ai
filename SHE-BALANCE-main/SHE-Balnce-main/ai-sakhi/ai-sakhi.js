/**
 * AI Sakhi Frontend Integration
 * Connects to AWS Lambda backend
 */

const AI_SAKHI_API = 'https://7f9gp1fuwc.execute-api.us-east-1.amazonaws.com/prod/sakhi';

class AISakhi {
    constructor(artisanId) {
        this.artisanId = artisanId;
        this.conversationHistory = [];
    }

    /**
     * Send chat message to AI Sakhi
     */
    async chat(message) {
        try {
            const response = await fetch(AI_SAKHI_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'chat',
                    artisan_id: this.artisanId,
                    message: message
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.conversationHistory.push({
                    user: message,
                    sakhi: data.response,
                    timestamp: data.timestamp
                });
                return data.response;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Chat error:', error);
            return "I'm sorry, I'm having trouble connecting right now. Please try again.";
        }
    }

    /**
     * Update bulk order progress
     */
    async updateBulkOrder(orderId, progress, notes = '') {
        try {
            const response = await fetch(AI_SAKHI_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_bulk_order',
                    artisan_id: this.artisanId,
                    data: {
                        order_id: orderId,
                        progress: progress,
                        notes: notes
                    }
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Bulk order update error:', error);
            throw error;
        }
    }

    /**
     * Report health issue
     */
    async reportHealthIssue(issueType, severity, description) {
        try {
            const response = await fetch(AI_SAKHI_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'report_health_issue',
                    artisan_id: this.artisanId,
                    data: {
                        issue_type: issueType,
                        severity: severity,
                        description: description
                    }
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health issue report error:', error);
            throw error;
        }
    }

    /**
     * Request advance payment
     */
    async requestAdvancePayment(amount, reason, urgency = 'normal') {
        try {
            const response = await fetch(AI_SAKHI_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'request_advance_payment',
                    artisan_id: this.artisanId,
                    data: {
                        amount: amount,
                        reason: reason,
                        urgency: urgency
                    }
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Advance payment request error:', error);
            throw error;
        }
    }

    /**
     * Request payment for completed work
     */
    async requestPayment(orderId, amount, workDescription) {
        try {
            const response = await fetch(AI_SAKHI_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'request_payment',
                    artisan_id: this.artisanId,
                    data: {
                        order_id: orderId,
                        amount: amount,
                        work_description: workDescription
                    }
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Payment request error:', error);
            throw error;
        }
    }

    /**
     * Contact support
     */
    async contactSupport(message) {
        try {
            const response = await fetch(AI_SAKHI_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'contact_support',
                    artisan_id: this.artisanId,
                    message: message
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Support request error:', error);
            throw error;
        }
    }
}

// UI Functions

function initAISakhi() {
    const artisanId = localStorage.getItem('artisan_id') || 'guest';
    window.sakhi = new AISakhi(artisanId);
    
    // Add event listeners for quick actions
    document.getElementById('btn-update-order')?.addEventListener('click', showBulkOrderForm);
    document.getElementById('btn-health-issue')?.addEventListener('click', showHealthIssueForm);
    document.getElementById('btn-advance-payment')?.addEventListener('click', showAdvancePaymentForm);
    document.getElementById('btn-request-payment')?.addEventListener('click', showPaymentRequestForm);
    document.getElementById('btn-contact-support')?.addEventListener('click', showSupportForm);
    
    // Chat input
    document.getElementById('sakhi-send-btn')?.addEventListener('click', sendChatMessage);
    document.getElementById('sakhi-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

async function sendChatMessage() {
    const input = document.getElementById('sakhi-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Show user message
    addMessageToChat('user', message);
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get AI response
    const response = await window.sakhi.chat(message);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Show AI response
    addMessageToChat('sakhi', response);
}

function addMessageToChat(sender, message) {
    const chatContainer = document.getElementById('sakhi-chat');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    const chatContainer = document.getElementById('sakhi-chat');
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatContainer.appendChild(indicator);
}

function hideTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
}

// Quick Action Forms

function showBulkOrderForm() {
    const orderId = prompt('Enter Order ID:');
    const progress = prompt('Enter Progress (0-100):');
    const notes = prompt('Any notes? (optional)');
    
    if (orderId && progress) {
        window.sakhi.updateBulkOrder(orderId, parseInt(progress), notes || '')
            .then(data => {
                alert(data.response);
            })
            .catch(error => {
                alert('Error updating order. Please try again.');
            });
    }
}

function showHealthIssueForm() {
    const issueType = prompt('Issue type (illness/injury/stress/other):');
    const severity = prompt('Severity (low/medium/high):');
    const description = prompt('Please describe the issue:');
    
    if (issueType && severity && description) {
        window.sakhi.reportHealthIssue(issueType, severity, description)
            .then(data => {
                alert(data.response);
            })
            .catch(error => {
                alert('Error reporting health issue. Please try again.');
            });
    }
}

function showAdvancePaymentForm() {
    const amount = prompt('Enter amount needed (₹):');
    const reason = prompt('Reason for advance:');
    const urgency = prompt('Urgency (normal/urgent):');
    
    if (amount && reason) {
        window.sakhi.requestAdvancePayment(parseFloat(amount), reason, urgency || 'normal')
            .then(data => {
                alert(data.response);
            })
            .catch(error => {
                alert('Error requesting advance. Please try again.');
            });
    }
}

function showPaymentRequestForm() {
    const orderId = prompt('Enter Order ID:');
    const amount = prompt('Enter amount (₹):');
    const description = prompt('Work description:');
    
    if (orderId && amount && description) {
        window.sakhi.requestPayment(orderId, parseFloat(amount), description)
            .then(data => {
                alert(data.response);
            })
            .catch(error => {
                alert('Error requesting payment. Please try again.');
            });
    }
}

function showSupportForm() {
    const message = prompt('How can we help you?');
    
    if (message) {
        window.sakhi.contactSupport(message)
            .then(data => {
                alert(data.response);
            })
            .catch(error => {
                alert('Error contacting support. Please try again.');
            });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAISakhi);
