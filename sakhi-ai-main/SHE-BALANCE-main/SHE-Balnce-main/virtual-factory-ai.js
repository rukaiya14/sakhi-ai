/**
 * Virtual Factory - Frontend AI Integration
 * Connects to AWS Lambda + Titan Text Embeddings V2
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthToken() {
    return localStorage.getItem('shebalance_token') || localStorage.getItem('token');
}

// API headers
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };
}

/**
 * Find matching artisans for an order
 */
async function findMatchingArtisans(orderDetails) {
    try {
        const token = getAuthToken();
        if (!token) {
            showError('Please login first to use this feature.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        showLoadingState(`Finding best artisans for ${orderDetails.product}...`);

        const response = await fetch(`${API_BASE_URL}/virtual-factory/find-artisans`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderDetails)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            
            if (response.status === 401 || response.status === 403) {
                hideLoadingState();
                showError('Your session has expired. Please login again.');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            throw new Error(errorData.error || errorData.message || 'Failed to find artisans');
        }

        const data = await response.json();
        hideLoadingState();

        return data;

    } catch (error) {
        console.error('❌ Find artisans error:', error);
        showError(`Failed to find artisans: ${error.message}`);
        hideLoadingState();
        throw error;
    }
}

/**
 * Create virtual factory
 */
async function createVirtualFactory(orderDetails) {
    try {
        showLoadingState('Creating virtual factory...');

        const response = await fetch(`${API_BASE_URL}/virtual-factory/create`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderDetails)
        });

        if (!response.ok) {
            throw new Error('Failed to create virtual factory');
        }

        const data = await response.json();
        hideLoadingState();

        return data;

    } catch (error) {
        console.error('❌ Create factory error:', error);
        showError('Failed to create virtual factory. Please try again.');
        hideLoadingState();
        throw error;
    }
}

/**
 * Get factory details
 */
async function getFactoryDetails(factoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/virtual-factory/${factoryId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get factory details');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('❌ Get factory details error:', error);
        throw error;
    }
}

/**
 * Show loading state
 */
function showLoadingState(message) {
    const loader = document.createElement('div');
    loader.id = 'ai-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    loader.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px;">
            <i class="fas fa-brain fa-spin" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
            <p style="font-size: 1.2rem; color: #333; font-weight: 600; margin-bottom: 10px;">${message}</p>
            <p style="color: #666; margin-top: 10px;"><strong>Powered by Amazon Titan Text Embeddings V2</strong></p>
            <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 10px;">
                <p style="font-size: 0.9rem; color: #666; margin: 0;">
                    <i class="fas fa-brain" style="color: #8b5cf6;"></i>
                    Using semantic similarity matching with 512-dimensional embeddings...
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loader = document.getElementById('ai-loader');
    if (loader) loader.remove();
}

/**
 * Show error message
 */
function showError(message) {
    alert('❌ ' + message);
}

/**
 * Show success message
 */
function showSuccess(message) {
    alert('✅ ' + message);
}

/**
 * View cluster details (modal)
 */
async function viewCluster(company, artisanCount) {
    const orderDetails = getOrderDetailsForCompany(company);
    
    if (!orderDetails) {
        showError('Order details not found');
        return;
    }
    
    try {
        const result = await findMatchingArtisans(orderDetails);
        
        if (result && result.artisans) {
            displayClusterModal(company, result.artisans, result);
        }
    } catch (error) {
        console.error('Error viewing cluster:', error);
    }
}

/**
 * Display cluster modal
 */
function displayClusterModal(company, artisans, stats) {
    const modal = document.getElementById('clusterModal');
    const modalTitle = document.getElementById('modalTitle');
    const artisanGrid = document.getElementById('artisanGrid');
    
    modalTitle.textContent = `${company} - Virtual Factory Cluster`;
    
    artisanGrid.innerHTML = artisans.map(artisan => `
        <div class="artisan-card">
            <div class="artisan-card-avatar">${getInitials(artisan.fullName)}</div>
            <h4>${artisan.fullName}</h4>
            <p>${artisan.location}</p>
            ${artisan.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
            <div class="capacity-info">
                <strong>Match Score:</strong> ${artisan.matchScore}%<br>
                <strong>Capacity:</strong> ${artisan.capacity} units<br>
                <strong>Rating:</strong> ${artisan.rating}/5.0<br>
                <strong>Experience:</strong> ${artisan.experienceYears} years
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'block';
}

/**
 * Get order details for company
 */
function getOrderDetailsForCompany(company) {
    const orders = {
        'Taj Hotels': {
            product: 'Hand-Embroidered Table Runners',
            quantity: 500,
            skills: ['embroidery', 'tailoring'],
            deadline: 45,
            budget: 1250000,
            company: 'Taj Hotels'
        },
        'FabIndia': {
            product: 'Handwoven Cotton Stoles',
            quantity: 800,
            skills: ['weaving', 'textile'],
            deadline: 60,
            budget: 1600000,
            company: 'FabIndia'
        },
        'Infosys': {
            product: 'Handcrafted Pottery Gift Sets',
            quantity: 350,
            skills: ['pottery', 'ceramics'],
            deadline: 30,
            budget: 875000,
            company: 'Infosys'
        }
    };
    
    return orders[company];
}

/**
 * Accept order
 */
async function acceptOrder(company, quantity) {
    const orderDetails = getOrderDetailsForCompany(company);
    
    if (!orderDetails) {
        showError('Order details not found');
        return;
    }
    
    try {
        const result = await createVirtualFactory(orderDetails);
        
        if (result && result.success) {
            showSuccess(`Virtual factory created successfully! Factory ID: ${result.factory.factoryId}`);
            // Refresh page or update UI
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    } catch (error) {
        console.error('Error accepting order:', error);
    }
}

/**
 * View order details
 */
function viewDetails(company) {
    const orderDetails = getOrderDetailsForCompany(company);
    
    if (!orderDetails) {
        showError('Order details not found');
        return;
    }
    
    alert(`Order Details:\n\nCompany: ${company}\nProduct: ${orderDetails.product}\nQuantity: ${orderDetails.quantity} units\nDeadline: ${orderDetails.deadline} days\nBudget: ₹${orderDetails.budget.toLocaleString()}`);
}

/**
 * Get initials from name
 */
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('clusterModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('clusterModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

/**
 * Get AI-based match types
 */
async function getAIMatchTypes(orderDetails) {
    try {
        showLoadingState('Analyzing order with AI to generate match categories...');

        const response = await fetch(`${API_BASE_URL}/virtual-factory/match-types`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(orderDetails)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.message || data.error || 'Failed to get AI match types');
        }

        hideLoadingState();
        return data;

    } catch (error) {
        console.error('❌ Get match types error:', error);
        hideLoadingState();
        showError(`Failed to get AI match types: ${error.message}`);
        throw error;
    }
}

/**
 * Show AI match types modal
 */
async function showAIMatchTypes(company) {
    const orderDetails = getOrderDetailsForCompany(company);
    
    if (!orderDetails) {
        showError('Order details not found');
        return;
    }
    
    try {
        const result = await getAIMatchTypes(orderDetails);
        
        if (result && result.matchTypes) {
            displayMatchTypesModal(company, result);
        }
    } catch (error) {
        console.error('Error showing match types:', error);
    }
}

/**
 * Display match types modal
 */
function displayMatchTypesModal(company, result) {
    // Create modal HTML
    const modalHTML = `
        <div id="matchTypesModal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2><i class="fas fa-brain"></i> AI Match Categories - ${company}</h2>
                    <button class="close-modal" onclick="closeMatchTypesModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                            <i class="fas fa-robot" style="font-size: 2rem;"></i>
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem;">AI-Powered Match Analysis</h3>
                                <p style="margin: 5px 0 0 0; opacity: 0.9;">Generated by Amazon Bedrock Llama 3 70B using real DynamoDB data</p>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px;">
                            <div style="text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: 700;">${result.totalArtisans || 0}</div>
                                <div style="font-size: 0.9rem; opacity: 0.9;">Total Artisans</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: 700;">${result.matchTypes.length}</div>
                                <div style="font-size: 0.9rem; opacity: 0.9;">Match Categories</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: 700;">${result.availableSkills?.length || 0}</div>
                                <div style="font-size: 0.9rem; opacity: 0.9;">Skill Types</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; gap: 20px;">
                        ${result.matchTypes.map((type, index) => `
                            <div style="background: white; border: 2px solid ${type.priority === 'High' ? '#10b981' : type.priority === 'Medium' ? '#f59e0b' : '#6b7280'}; border-radius: 15px; padding: 25px; transition: all 0.3s;" onmouseover="this.style.boxShadow='0 8px 25px rgba(0,0,0,0.15)'" onmouseout="this.style.boxShadow='none'">
                                <div style="display: flex; align-items: start; gap: 20px;">
                                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1e40af); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <i class="${type.icon}" style="font-size: 1.8rem; color: white;"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                            <h3 style="margin: 0; color: #333; font-size: 1.3rem;">${type.category}</h3>
                                            <span style="background: ${type.priority === 'High' ? '#10b981' : type.priority === 'Medium' ? '#f59e0b' : '#6b7280'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${type.priority} Priority</span>
                                        </div>
                                        <p style="color: #666; margin: 10px 0; line-height: 1.6;">${type.description}</p>
                                        <div style="background: #f3f4f6; padding: 12px; border-radius: 10px; margin-top: 12px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <strong style="color: #333;">Criteria:</strong>
                                                    <span style="color: #666; margin-left: 8px;">${type.criteria}</span>
                                                </div>
                                                <div style="text-align: right;">
                                                    <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${type.estimatedCount}</div>
                                                    <div style="font-size: 0.85rem; color: #666;">Estimated Artisans</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 25px; padding: 20px; background: #f9fafb; border-radius: 15px; border-left: 4px solid #8b5cf6;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <i class="fas fa-info-circle" style="color: #8b5cf6; font-size: 1.2rem;"></i>
                            <strong style="color: #333;">AI Model Information</strong>
                        </div>
                        <div style="color: #666; font-size: 0.95rem; line-height: 1.6;">
                            <p style="margin: 5px 0;"><strong>Model:</strong> ${result.aiModel}</p>
                            <p style="margin: 5px 0;"><strong>Data Source:</strong> ${result.dataSource}</p>
                            <p style="margin: 5px 0;"><strong>Available Skills:</strong> ${result.availableSkills?.slice(0, 10).join(', ')}${result.availableSkills?.length > 10 ? '...' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('matchTypesModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Close match types modal
 */
function closeMatchTypesModal() {
    const modal = document.getElementById('matchTypesModal');
    if (modal) {
        modal.remove();
    }
}

console.log('🏭 Virtual Factory AI initialized');
console.log('🤖 Using Amazon Titan Text Embeddings V2 for semantic matching');
console.log('📊 Embedding dimensions: 512, Cosine similarity scoring');
