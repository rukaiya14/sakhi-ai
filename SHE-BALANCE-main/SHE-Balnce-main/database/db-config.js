// Database Configuration for SHE-BALANCE
// Supports both local development and AWS production

const DB_CONFIG = {
    // Environment
    environment: 'local', // 'local' or 'production'
    
    // Local Database (for development)
    local: {
        type: 'localStorage', // Using browser localStorage for demo
        prefix: 'shebalance_'
    },
    
    // AWS DynamoDB (for production)
    aws: {
        region: 'us-east-1',
        tables: {
            users: 'SheBalance-Users',
            artisanProfiles: 'SheBalance-ArtisanProfiles',
            buyerProfiles: 'SheBalance-BuyerProfiles',
            corporateProfiles: 'SheBalance-CorporateProfiles',
            products: 'SheBalance-Products',
            orders: 'SheBalance-Orders',
            skillScanResults: 'SheBalance-SkillScanResults',
            messages: 'SheBalance-Messages',
            reviews: 'SheBalance-Reviews',
            favorites: 'SheBalance-Favorites',
            learningProgress: 'SheBalance-LearningProgress',
            aiConversations: 'SheBalance-AISakhiConversations',
            supportTickets: 'SheBalance-SupportTickets',
            paymentRequests: 'SheBalance-PaymentRequests',
            healthAlerts: 'SheBalance-HealthAlerts',
            activityLogs: 'SheBalance-ActivityLogs',
            notifications: 'SheBalance-Notifications'
        },
        // API Gateway endpoints (to be configured after deployment)
        apiEndpoint: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'
    }
};

// Database Manager Class
class DatabaseManager {
    constructor() {
        this.config = DB_CONFIG;
        this.isProduction = this.config.environment === 'production';
    }

    // Generate unique ID
    generateId(prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `${prefix}${timestamp}_${random}`;
    }

    // Local Storage Operations
    async saveLocal(table, id, data) {
        try {
            const key = `${this.config.local.prefix}${table}_${id}`;
            localStorage.setItem(key, JSON.stringify({
                ...data,
                _id: id,
                _table: table,
                _created_at: data._created_at || new Date().toISOString(),
                _updated_at: new Date().toISOString()
            }));
            return { success: true, id };
        } catch (error) {
            console.error('Local save error:', error);
            return { success: false, error: error.message };
        }
    }

    async getLocal(table, id) {
        try {
            const key = `${this.config.local.prefix}${table}_${id}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Local get error:', error);
            return null;
        }
    }

    async queryLocal(table, filter = {}) {
        try {
            const prefix = `${this.config.local.prefix}${table}_`;
            const results = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    const data = JSON.parse(localStorage.getItem(key));
                    
                    // Apply filters
                    let matches = true;
                    for (const [field, value] of Object.entries(filter)) {
                        if (data[field] !== value) {
                            matches = false;
                            break;
                        }
                    }
                    
                    if (matches) {
                        results.push(data);
                    }
                }
            }
            
            return results;
        } catch (error) {
            console.error('Local query error:', error);
            return [];
        }
    }

    async deleteLocal(table, id) {
        try {
            const key = `${this.config.local.prefix}${table}_${id}`;
            localStorage.removeItem(key);
            return { success: true };
        } catch (error) {
            console.error('Local delete error:', error);
            return { success: false, error: error.message };
        }
    }

    // AWS DynamoDB Operations (via API Gateway)
    async saveAWS(table, id, data) {
        try {
            const tableName = this.config.aws.tables[table];
            const response = await fetch(`${this.config.aws.apiEndpoint}/${table}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    id,
                    ...data,
                    created_at: data.created_at || Date.now(),
                    updated_at: Date.now()
                })
            });
            
            const result = await response.json();
            return { success: response.ok, data: result };
        } catch (error) {
            console.error('AWS save error:', error);
            return { success: false, error: error.message };
        }
    }

    async getAWS(table, id) {
        try {
            const response = await fetch(`${this.config.aws.apiEndpoint}/${table}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('AWS get error:', error);
            return null;
        }
    }

    async queryAWS(table, filter = {}) {
        try {
            const queryParams = new URLSearchParams(filter);
            const response = await fetch(`${this.config.aws.apiEndpoint}/${table}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.items || [];
            }
            return [];
        } catch (error) {
            console.error('AWS query error:', error);
            return [];
        }
    }

    async deleteAWS(table, id) {
        try {
            const response = await fetch(`${this.config.aws.apiEndpoint}/${table}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            return { success: response.ok };
        } catch (error) {
            console.error('AWS delete error:', error);
            return { success: false, error: error.message };
        }
    }

    // Unified API (automatically uses local or AWS based on environment)
    async save(table, data, id = null) {
        const recordId = id || this.generateId(table.substring(0, 3).toUpperCase());
        
        if (this.isProduction) {
            return await this.saveAWS(table, recordId, data);
        } else {
            return await this.saveLocal(table, recordId, data);
        }
    }

    async get(table, id) {
        if (this.isProduction) {
            return await this.getAWS(table, id);
        } else {
            return await this.getLocal(table, id);
        }
    }

    async query(table, filter = {}) {
        if (this.isProduction) {
            return await this.queryAWS(table, filter);
        } else {
            return await this.queryLocal(table, filter);
        }
    }

    async delete(table, id) {
        if (this.isProduction) {
            return await this.deleteAWS(table, id);
        } else {
            return await this.deleteLocal(table, id);
        }
    }

    async update(table, id, updates) {
        const existing = await this.get(table, id);
        if (!existing) {
            return { success: false, error: 'Record not found' };
        }
        
        const updated = { ...existing, ...updates };
        return await this.save(table, updated, id);
    }

    // Helper: Get auth token
    getAuthToken() {
        const userData = localStorage.getItem('shebalance_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.token || '';
        }
        return '';
    }

    // Switch environment
    setEnvironment(env) {
        this.config.environment = env;
        this.isProduction = env === 'production';
        console.log(`Database environment switched to: ${env}`);
    }
}

// Export singleton instance
const db = new DatabaseManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.db = db;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { db, DatabaseManager, DB_CONFIG };
}
