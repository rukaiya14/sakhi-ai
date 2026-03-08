// Payment Modal JavaScript

function openPaymentModal(courseName, amount, paymentType) {
    const modal = document.getElementById('paymentModal');
    const overlay = document.getElementById('paymentModalOverlay');
    
    // Update modal content
    document.getElementById('modalCourseName').textContent = courseName;
    document.getElementById('modalAmount').textContent = '₹' + amount;
    document.getElementById('modalPaymentType').textContent = paymentType === 'full' ? 'Full Payment' : 'EMI Payment';
    
    // Store payment details
    window.currentPayment = {
        courseName: courseName,
        amount: amount,
        paymentType: paymentType
    };
    
    // Show modal
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const overlay = document.getElementById('paymentModalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    setTimeout(() => {
        resetPaymentForm();
    }, 300);
}

function resetPaymentForm() {
    document.getElementById('paymentFormArea').style.display = 'block';
    document.getElementById('paymentSuccessArea').style.display = 'none';
    document.getElementById('cardForm').style.display = 'block';
    
    // Reset form fields
    document.querySelectorAll('.form-group-modal input').forEach(input => {
        input.value = '';
    });
    
    // Reset payment method selection
    document.querySelectorAll('.payment-method-modal').forEach(method => {
        method.classList.remove('selected');
    });
    document.querySelector('.payment-method-modal').classList.add('selected');
    document.querySelector('.payment-method-modal input[type="radio"]').checked = true;
}

function selectPaymentMethodModal(method, element) {
    // Remove selected class from all
    document.querySelectorAll('.payment-method-modal').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selected class to clicked
    element.classList.add('selected');
    
    // Check the radio button
    element.querySelector('input[type="radio"]').checked = true;
    
    // Show/hide card form
    if (method === 'card') {
        document.getElementById('cardForm').style.display = 'block';
    } else {
        document.getElementById('cardForm').style.display = 'none';
    }
}

function processPaymentModal() {
    const btn = document.getElementById('btnPayModal');
    const originalContent = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        showPaymentSuccess();
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }, 2000);
}

function showPaymentSuccess() {
    const payment = window.currentPayment;
    const transactionId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    document.getElementById('paymentFormArea').style.display = 'none';
    document.getElementById('paymentSuccessArea').style.display = 'block';
    
    document.getElementById('successCourseName').textContent = payment.courseName;
    document.getElementById('successTransactionId').textContent = transactionId;
}

function startLearning() {
    closePaymentModal();
    // Redirect to course or dashboard
    window.location.href = 'skills.html';
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const overlay = document.getElementById('paymentModalOverlay');
    if (event.target === overlay) {
        closePaymentModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const overlay = document.getElementById('paymentModalOverlay');
        if (overlay && overlay.classList.contains('active')) {
            closePaymentModal();
        }
    }
});
