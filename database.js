// Database Service - Neon PostgreSQL Integration via Netlify Functions

const DatabaseService = {
    // Make API request to backend
    async request(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Database request error:', error);
            throw error;
        }
    },
    
    // Get or create user
    async getOrCreateUser(telegramUser) {
        try {
            return await this.request('user', 'POST', { telegramUser });
        } catch (error) {
            console.error('Error getting/creating user:', error);
            throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
        }
    },
    
    // Update user balance
    async updateBalance(userId, amount, type, description) {
        try {
            return await this.request('balance', 'PUT', {
                userId,
                amount,
                type,
                description
            });
        } catch (error) {
            console.error('Error updating balance:', error);
            throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
        }
    },
    
    // Record ad watched
    async recordAdWatched(userId, network) {
        try {
            return await this.request('ad-watch', 'POST', {
                userId,
                network
            });
        } catch (error) {
            console.error('Error recording ad:', error);
            throw error;
        }
    },
    
    // Get tasks
    async getTasks(type = 'all') {
        try {
            return await this.request(`tasks?type=${type}`, 'GET');
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    },
    
    // Complete task
    async completeTask(userId, taskId) {
        try {
            return await this.request('task-complete', 'POST', {
                userId,
                taskId
            });
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    },
    
    // Create withdrawal request
    async createWithdrawalRequest(userId, amount, walletAddress) {
        try {
            return await this.request('withdrawal', 'POST', {
                userId,
                amount,
                walletAddress
            });
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            throw error;
        }
    },
    
    // Get user transactions
    async getUserTransactions(userId, limit = 50) {
        try {
            return await this.request(`transactions?userId=${userId}&limit=${limit}`, 'GET');
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },
    
    // Get leaderboard
    async getLeaderboard(limit = 100) {
        try {
            return await this.request(`leaderboard?limit=${limit}`, 'GET');
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    },
    
    // Get platform settings
    async getPlatformSettings() {
        try {
            const settings = await this.request('settings', 'GET');
            return settings || PLATFORM_SETTINGS;
        } catch (error) {
            console.error('Error getting settings:', error);
            return PLATFORM_SETTINGS;
        }
    },
    
    // Update wallet address
    async updateWalletAddress(userId, walletAddress) {
        try {
            return await this.request('wallet-address', 'PUT', {
                userId,
                walletAddress
            });
        } catch (error) {
            console.error('Error updating wallet:', error);
            throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
        }
    },
    
    // Admin: Get all users
    async getAllUsers(page = 1, limit = 100) {
        try {
            return await this.request(`admin/users?page=${page}&limit=${limit}`, 'GET');
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },
    
    // Admin: Get platform stats
    async getPlatformStats() {
        try {
            return await this.request('admin/stats', 'GET');
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    },
    
    // Admin: Ban user
    async banUser(userId) {
        try {
            return await this.request('admin/ban-user', 'POST', { userId });
        } catch (error) {
            console.error('Error banning user:', error);
            throw error;
        }
    },
    
    // Admin: Create task
    async createTask(taskData) {
        try {
            return await this.request('admin/create-task', 'POST', taskData);
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },
    
    // Admin: Approve withdrawal
    async approveWithdrawal(withdrawalId) {
        try {
            return await this.request('admin/approve-withdrawal', 'POST', { withdrawalId });
        } catch (error) {
            console.error('Error approving withdrawal:', error);
            throw error;
        }
    },
    
    // Admin: Reject withdrawal
    async rejectWithdrawal(withdrawalId) {
        try {
            return await this.request('admin/reject-withdrawal', 'POST', { withdrawalId });
        } catch (error) {
            console.error('Error rejecting withdrawal:', error);
            throw error;
        }
    },
    
    // Admin: Update settings
    async updateSettings(settings) {
        try {
            return await this.request('admin/settings', 'PUT', settings);
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    },
    
    // Admin: Login
    async adminLogin(username, password) {
        try {
            return await this.request('admin/login', 'POST', {
                username,
                password
            });
        } catch (error) {
            console.error('Admin login error:', error);
            throw new Error(ERROR_MESSAGES.AUTH_ERROR);
        }
    }
};

// Cache for user data
let userCache = null;
let settingsCache = null;
const CACHE_DURATION = 30000; // 30 seconds

// Cached get user
DatabaseService.getCachedUser = function() {
    return userCache;
};

// Cached get settings
DatabaseService.getCachedSettings = function() {
    return settingsCache || PLATFORM_SETTINGS;
};
