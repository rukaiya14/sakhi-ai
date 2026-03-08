// Frontend API Client for SHE-BALANCE
// Use this in your HTML/JS files to connect to the backend

class SheBalanceAPI {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('shebalance_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('shebalance_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('shebalance_token');
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH METHODS ====================

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    logout() {
        this.clearToken();
        localStorage.removeItem('shebalance_user');
    }

    // ==================== USER METHODS ====================

    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // ==================== ARTISAN METHODS ====================

    async getArtisans(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/artisans?${params}`);
    }

    async getArtisanDetails(artisanId) {
        return await this.request(`/artisans/${artisanId}`);
    }

    // ==================== SKILLSCAN METHODS ====================

    async submitSkillScan(category, imageFiles) {
        const formData = new FormData();
        formData.append('category', category);
        
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }

        const url = `${this.baseURL}/skillscan/analyze`;
        const headers = {};
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'SkillScan failed');
        }

        return data;
    }

    async getSkillScanHistory() {
        return await this.request('/skillscan/history');
    }

    // ==================== ORDER METHODS ====================

    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request('/orders');
    }

    async updateOrderStatus(orderId, status) {
        return await this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ==================== LABOUR TRACKING METHODS ====================

    async logLabourHours(labourData) {
        return await this.request('/labour/log', {
            method: 'POST',
            body: JSON.stringify(labourData)
        });
    }

    async getLabourHistory() {
        return await this.request('/labour/history');
    }

    // ==================== ADMIN METHODS ====================

    async getAllUsers() {
        return await this.request('/admin/users');
    }

    async getPlatformStatistics() {
        return await this.request('/admin/statistics');
    }
}

// Create global instance
const api = new SheBalanceAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheBalanceAPI;
}
