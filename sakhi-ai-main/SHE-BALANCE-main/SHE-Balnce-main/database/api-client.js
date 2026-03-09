// API Client for SHE-BALANCE Backend
class SheBalanceAPI {
    constructor() {
        this.db = window.db;
        this.baseURL = window.location.origin;
    }

    generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    async createUser(userData) {
        const userId = this.generateId('USR');
        const user = {
            user_id: userId,
            email: userData.email,
            password_hash: btoa(userData.password),
            full_name: userData.fullName,
            phone: userData.phone || '',
            role: userData.role,
            status: 'active',
            created_at: new Date().toISOString()
        };
        
        const result = await this.db.save('users', user, userId);
        if (result.success) {
            await this.createRoleProfile(userId, userData.role, userData);
        }
        return result;
    }

    async createRoleProfile(userId, role, data) {
        if (role === 'artisan') {
            const artisanId = this.generateId('ART');
            return await this.db.save('artisanProfiles', {
                artisan_id: artisanId,
                user_id: userId,
                skills: data.skills || [],
                verification_status: 'pending',
                rating: 0,
                total_orders: 0
            }, artisanId);
        }
        return { success: true };
    }

    async getUserByEmail(email) {
        const users = await this.db.query('users', { email });
        return users.length > 0 ? users[0] : null;
    }

    async saveSkillScanResult(artisanId, scanData) {
        const scanId = this.generateId('SCN');
        return await this.db.save('skillScanResults', {
            scan_id: scanId,
            artisan_id: artisanId,
            skill_category: scanData.category,
            overall_score: scanData.overallScore,
            skill_level: scanData.skillLevel,
            breakdown_scores: scanData.breakdown,
            strengths: scanData.strengths,
            improvements: scanData.improvements,
            created_at: new Date().toISOString()
        }, scanId);
    }

    async login(email, password) {
        const user = await this.getUserByEmail(email);
        if (!user || btoa(password) !== user.password_hash) {
            return { success: false, error: 'Invalid credentials' };
        }
        
        localStorage.setItem('shebalance_user', JSON.stringify({
            userId: user.user_id,
            email: user.email,
            name: user.full_name,
            role: user.role
        }));
        
        return { success: true, user };
    }
}

const api = new SheBalanceAPI();
if (typeof window !== 'undefined') window.api = api;
