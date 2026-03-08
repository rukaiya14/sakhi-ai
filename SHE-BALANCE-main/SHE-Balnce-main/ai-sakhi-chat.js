/**
 * AI Sakhi Chat - ChatGPT Style Interface
 * Continuous Q&A conversation with context
 */

let conversationHistory = [];
const API_URL = 'http://localhost:5000/api/ai-sakhi/chat';

/**
 * Initialize chat interface
 */
function initAISakhiChat() {
    console.log('🤖 Initializing AI Sakhi Chat...');
    
    // Add enter key handler
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatEnter);
    }
}

/**
 * Handle Enter key in chat input
 */
function handleChatEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

/**
 * Send chat message (ChatGPT style)
 */
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Clear input immediately
    input.value = '';
    
    // Hide suggestions after first message
    const suggestions = document.getElementById('chatSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get token
        const token = localStorage.getItem('shebalance_token');
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        // Send to backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                message: message,
                conversationHistory: conversationHistory
            })
        });
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (data.success || data.response) {
            // Add AI response to chat
            addMessageToChat('assistant', data.response, data.model);
            
            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: data.response
            });
            
            // Log model type
            console.log(`🤖 Response from: ${data.model || 'unknown'}`);
            if (data.model === 'llama3-70b') {
                console.log('✅ Using Llama 3 (70B) via Bedrock!');
            } else if (data.fallback) {
                console.log('⚠️  Using fallback mode');
            }
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Chat error:', error);
        hideTypingIndicator();
        addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.', 'error');
    }
}

/**
 * Send quick message from suggestion button
 */
function sendQuickMessage(message) {
    const input = document.getElementById('chatInput');
    input.value = message;
    sendChatMessage();
}

/**
 * Add message to chat (ChatGPT style)
 */
function addMessageToChat(role, content, model = null) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' 
        ? '<i class="fas fa-user"></i>' 
        : '<i class="fas fa-robot"></i>';
    
    // Content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Format message with line breaks
    const formattedContent = content.replace(/\n/g, '<br>');
    messageContent.innerHTML = `<p>${formattedContent}</p>`;
    
    // Add model badge if using AI models
    if (model === 'llama3-70b') {
        const badge = document.createElement('div');
        badge.className = 'model-badge';
        badge.innerHTML = '<i class="fas fa-brain"></i> Powered by Llama 3 (70B)';
        badge.style.cssText = 'font-size: 10px; color: #666; margin-top: 5px; display: flex; align-items: center; gap: 4px;';
        messageContent.appendChild(badge);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom smoothly
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'chat-message assistant typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Show AI chat interface
 */
function showAIChat() {
    const chatInterface = document.getElementById('aiChatInterface');
    if (chatInterface) {
        chatInterface.style.display = 'flex';
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 100);
    }
}

/**
 * Hide AI chat interface
 */
function hideAIChat() {
    const chatInterface = document.getElementById('aiChatInterface');
    if (chatInterface) {
        chatInterface.style.display = 'none';
    }
}

/**
 * Clear conversation
 */
function clearConversation() {
    if (confirm('Clear conversation history?')) {
        conversationHistory = [];
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Keep only the welcome message
            const welcomeMessage = chatMessages.querySelector('.chat-message.assistant');
            chatMessages.innerHTML = '';
            if (welcomeMessage) {
                chatMessages.appendChild(welcomeMessage.cloneNode(true));
            }
        }
        
        // Show suggestions again
        const suggestions = document.getElementById('chatSuggestions');
        if (suggestions) {
            suggestions.style.display = 'flex';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAISakhiChat);
} else {
    initAISakhiChat();
}

// Export functions to window
window.sendChatMessage = sendChatMessage;
window.sendQuickMessage = sendQuickMessage;
window.handleChatEnter = handleChatEnter;
window.showAIChat = showAIChat;
window.hideAIChat = hideAIChat;
window.clearConversation = clearConversation;

console.log('✅ AI Sakhi Chat module loaded');
