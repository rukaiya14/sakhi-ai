/**
 * Quick Actions for AI Sakhi
 * These functions open the AI chat and pre-fill messages
 */

function openAISakhiPanel() {
    console.log('🤖 Opening AI Sakhi panel...');
    
    const panel = document.getElementById('aiSakhiPanel');
    const overlay = document.getElementById('aiSakhiOverlay');
    const chatInterface = document.getElementById('aiChatInterface');
    
    if (!panel) {
        console.error('❌ AI Sakhi panel not found!');
        alert('AI Sakhi panel not found. Please refresh the page.');
        return false;
    }
    
    // Open panel
    panel.classList.add('active');
    if (overlay) overlay.classList.add('active');
    
    // Show chat interface
    if (chatInterface) {
        chatInterface.style.display = 'flex';
    }
    
    console.log('✅ AI Sakhi panel opened');
    return true;
}

function showBulkOrderUpdate() {
    console.log('📦 Bulk Order Update clicked');
    
    if (!openAISakhiPanel()) return;
    
    // Wait for chat to open, then send pre-filled message
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = "I want to update my bulk order progress";
            chatInput.focus();
        }
    }, 300);
}

function showHealthIssue() {
    console.log('🏥 Health Issue clicked');
    
    if (!openAISakhiPanel()) return;
    
    // Wait for chat to open, then send pre-filled message
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = "I'm facing health issues and need support";
            chatInput.focus();
        }
    }, 300);
}

function showAdvancePayment() {
    console.log('💰 Advance Payment clicked');
    
    if (!openAISakhiPanel()) return;
    
    // Wait for chat to open, then send pre-filled message
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = "I need to request an advance payment for materials";
            chatInput.focus();
        }
    }, 300);
}

function showPaymentRequest() {
    console.log('💵 Payment Request clicked');
    
    if (!openAISakhiPanel()) return;
    
    // Wait for chat to open, then send pre-filled message
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = "I want to request payment for my completed work";
            chatInput.focus();
        }
    }, 300);
}

function showContactSupport() {
    console.log('🤝 Contact Support clicked');
    
    if (!openAISakhiPanel()) return;
    
    // Wait for chat to open, then send pre-filled message
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = "I need help and want to contact support";
            chatInput.focus();
        }
    }, 300);
}

function showAIChat() {
    console.log('💬 AI Chat clicked');
    
    if (!openAISakhiPanel()) return;
    
    // Just focus on input
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.focus();
        }
    }, 300);
}

// Make functions globally available
window.showBulkOrderUpdate = showBulkOrderUpdate;
window.showHealthIssue = showHealthIssue;
window.showAdvancePayment = showAdvancePayment;
window.showPaymentRequest = showPaymentRequest;
window.showContactSupport = showContactSupport;
window.showAIChat = showAIChat;
window.openAISakhiPanel = openAISakhiPanel;

console.log('✅ Quick Actions module loaded');
console.log('✅ All AI Sakhi button functions are ready');
