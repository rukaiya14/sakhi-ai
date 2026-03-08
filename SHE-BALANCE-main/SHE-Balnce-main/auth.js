// ============================================
// SHEBALANCE AUTHENTICATION SYSTEM
// Clean implementation from scratch
// ============================================

console.log('Auth.js loaded successfully');

// ============================================
// MODAL FUNCTIONS
// ============================================

function openLoginModal() {
    console.log('Opening login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Login modal opened');
    } else {
        console.error('Login modal element not found!');
    }
}

function openSignupModal() {
    console.log('Opening signup modal...');
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Signup modal opened');
    } else {
        console.error('Signup modal element not found!');
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Modal closed');
    }
}

function switchToSignup() {
    console.log('Switching to signup...');
    closeModal('loginModal');
    setTimeout(() => openSignupModal(), 100);
}

function switchToLogin() {
    console.log('Switching to login...');
    closeModal('signupModal');
    setTimeout(() => openLoginModal(), 100);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// ============================================
// LOGIN FUNCTION
// ============================================

async function handleLogin(event) {
    event.preventDefault();
    console.log('==========================================');
    console.log('LOGIN ATTEMPT STARTED');
    console.log('==========================================');
    
    // Get form elements
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    
    // Validate elements exist
    if (!emailInput || !passwordInput) {
        console.error('ERROR: Form inputs not found!');
        alert('Error: Login form not properly loaded. Please refresh the page.');
        return;
    }
    
    // Get values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    console.log('Email entered:', email);
    console.log('Password length:', password.length);
    
    // Clear previous errors
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
    }
    
    try {
        // Call backend API
        console.log('Calling backend API...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('Backend response:', data);
        
        if (!response.ok) {
            // Login failed
            console.log('ERROR: Login failed');
            if (errorDiv) {
                errorDiv.textContent = data.error || 'Invalid email or password!';
                errorDiv.style.display = 'block';
            }
            alert(data.error || 'Invalid email or password!');
            
            // Reset button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
            return;
        }
        
        // Login successful!
        console.log('✅ LOGIN SUCCESSFUL!');
        console.log('User:', data.user.fullName);
        console.log('Role:', data.user.role);
        console.log('Token:', data.token.substring(0, 20) + '...');
        
        // Save to localStorage
        localStorage.setItem('shebalance_token', data.token);
        localStorage.setItem('shebalance_user', JSON.stringify(data.user));
        
        // Create user session for backward compatibility
        const userData = {
            email: data.user.email,
            name: data.user.fullName,
            role: data.user.role,
            userId: data.user.userId,
            loginTime: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('shebalance_user', JSON.stringify(userData));
        console.log('User data saved to localStorage');
        
        // Close modal
        closeModal('loginModal');
        
        // Show success message
        alert('Login successful! Welcome back, ' + data.user.fullName + '!');
        
        // Redirect based on role
        console.log('Redirecting based on role:', data.user.role);
        console.log('==========================================');
        
        switch(data.user.role) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'buyer':
                window.location.href = 'buyer-dashboard.html';
                break;
            case 'corporate':
                window.location.href = 'corporate-dashboard.html';
                break;
            case 'artisan':
            default:
                window.location.href = 'dashboard.html';
                break;
        }
        
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Connection error. Please check if the backend server is running.';
            errorDiv.style.display = 'block';
        }
        alert('Connection error: ' + error.message);
        
        // Reset button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

// ============================================
// SIGNUP FUNCTION
// ============================================

function handleSignup(event) {
    event.preventDefault();
    console.log('==========================================');
    console.log('SIGNUP ATTEMPT STARTED');
    console.log('==========================================');
    
    // Get form values
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const phone = document.getElementById('signupPhone').value.trim();
    const language = document.getElementById('signupLanguage').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');
    
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Language:', language);
    
    // Clear previous errors
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    // Validate all fields
    if (!name || !email || !phone || !language || !password) {
        console.log('ERROR: Missing required fields');
        if (errorDiv) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.style.display = 'block';
        }
        alert('Please fill in all fields!');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        console.log('ERROR: Password too short');
        if (errorDiv) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            errorDiv.style.display = 'block';
        }
        alert('Password must be at least 6 characters!');
        return;
    }
    
    // Check if email already exists
    const existingEmails = ['mariyam@gmail.com', 'admin@shebalance.com'];
    if (existingEmails.includes(email)) {
        console.log('ERROR: Email already registered');
        if (errorDiv) {
            errorDiv.textContent = 'This email is already registered. Please login instead.';
            errorDiv.style.display = 'block';
        }
        alert('This email is already registered. Please login instead.');
        return;
    }
    
    // Signup successful!
    console.log('✅ SIGNUP SUCCESSFUL!');
    
    // Create user session
    const userData = {
        name: name,
        email: email,
        phone: phone,
        language: language,
        role: 'user',
        loginTime: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('shebalance_user', JSON.stringify(userData));
    localStorage.setItem('shebalance_new_signup', 'true');
    console.log('User data saved to localStorage');
    
    // Close modal
    closeModal('signupModal');
    
    // Show success message
    alert('Account created successfully! Welcome, ' + name + '!');
    
    // Redirect to dashboard
    console.log('Redirecting to dashboard.html...');
    console.log('==========================================');
    window.location.href = 'dashboard.html';
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Auth system ready');
    
    // Test if modals exist
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (loginModal) {
        console.log('✅ Login modal found');
    } else {
        console.error('❌ Login modal NOT found');
    }
    
    if (signupModal) {
        console.log('✅ Signup modal found');
    } else {
        console.error('❌ Signup modal NOT found');
    }
});

console.log('Auth.js fully loaded and ready!');
