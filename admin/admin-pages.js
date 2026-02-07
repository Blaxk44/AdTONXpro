// Admin Page Content

const AdminPages = {
    // Dashboard Page
    dashboard: async function() {
        const stats = await getP latformStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-icon">👥</span>
                    <span class="stat-value">${formatNumber(stats.totalUsers)}</span>
                    <span class="stat-label">Total Users</span>
                    <span class="stat-change positive">+${stats.newUsersToday} today</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-icon">📺</span>
                    <span class="stat-value">${formatNumber(stats.totalAdsWatched)}</span>
                    <span class="stat-label">Ads Watched</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-icon">💰</span>
                    <span class="stat-value">${formatTON(stats.totalRevenue)}</span>
                    <span class="stat-label">Platform Revenue (TON)</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-icon">💎</span>
                    <span class="stat-value">${formatTON(stats.totalRewardsPaid)}</span>
                    <span class="stat-label">Rewards Paid (TON)</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-icon">📤</span>
                    <span class="stat-value">${formatNumber(stats.pendingWithdrawals)}</span>
                    <span class="stat-label">Pending Withdrawals</span>
                </div>
                
                <div class="stat-card">
                    <span class="stat-icon">✅</span>
                    <span class="stat-value">${formatNumber(stats.totalTasks)}</span>
                    <span class="stat-label">Active Tasks</span>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Activity</h3>
                </div>
                <div id="recent-activity">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading activity...</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Users Page
    users: async function() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">User Management</h3>
                    <input type="text" id="user-search" placeholder="Search users..." 
                        style="padding: 8px 12px; border: 2px solid var(--border); border-radius: 8px;">
                </div>
                <div id="users-table">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading users...</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Ads Management Page
    ads: async function() {
        const settings = await getPlatformSettings();
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Ad Network Settings</h3>
                </div>
                <div class="form-group">
                    <label>Monetag (ON/OFF)</label>
                    <input type="checkbox" id="monetag-enabled" ${settings.monetagEnabled ? 'checked' : ''}>
                </div>
                <div class="form-group">
                    <label>Adexium (ON/OFF)</label>
                    <input type="checkbox" id="adexium-enabled" ${settings.adexiumEnabled ? 'checked' : ''}>
                </div>
                <div class="form-group">
                    <label>Adsgram (ON/OFF)</label>
                    <input type="checkbox" id="adsgram-enabled" ${settings.adsgramEnabled ? 'checked' : ''}>
                </div>
                <button class="btn btn-primary" onclick="saveAdSettings()">Save Changes</button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Reward Settings</h3>
                </div>
                <div class="form-group">
                    <label>Tier 1 Reward (TON per ad)</label>
                    <input type="number" id="tier1-reward" value="${settings.tier1.reward}" step="0.001">
                </div>
                <div class="form-group">
                    <label>Tier 2 Reward (TON per ad)</label>
                    <input type="number" id="tier2-reward" value="${settings.tier2.reward}" step="0.001">
                </div>
                <div class="form-group">
                    <label>Tier 3 Reward (TON per ad)</label>
                    <input type="number" id="tier3-reward" value="${settings.tier3.reward}" step="0.001">
                </div>
                <div class="form-group">
                    <label>Daily Ad Limit</label>
                    <input type="number" id="daily-limit" value="${settings.dailyAdLimit}">
                </div>
                <button class="btn btn-primary" onclick="saveRewardSettings()">Save Changes</button>
            </div>
        `;
    },
    
    // Tasks Page
    tasks: async function() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tasks Management</h3>
                    <button class="btn btn-primary" onclick="openTaskModal()">Create Task</button>
                </div>
                <div id="tasks-table">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading tasks...</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Withdrawals Page
    withdrawals: async function() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Pending Withdrawals</h3>
                </div>
                <div id="withdrawals-table">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading withdrawals...</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Transactions Page
    transactions: async function() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Transaction History</h3>
                    <select id="tx-filter">
                        <option value="all">All Types</option>
                        <option value="ad_watched">Ads</option>
                        <option value="task">Tasks</option>
                        <option value="referral">Referrals</option>
                        <option value="withdraw">Withdrawals</option>
                    </select>
                </div>
                <div id="transactions-table">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading transactions...</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Settings Page
    settings: async function() {
        const settings = await getPlatformSettings();
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Platform Settings</h3>
                </div>
                <div class="form-group">
                    <label>Minimum Withdrawal (TON)</label>
                    <input type="number" id="min-withdrawal" value="${settings.minWithdrawal}" step="0.1">
                </div>
                <div class="form-group">
                    <label>Withdrawal Fee (%)</label>
                    <input type="number" id="withdrawal-fee" value="${settings.withdrawalFee * 100}" step="1">
                </div>
                <div class="form-group">
                    <label>Referral Commission (%)</label>
                    <input type="number" id="referral-commission" value="${settings.referralCommission * 100}" step="1">
                </div>
                <div class="form-group">
                    <label>Referral Bonus (TON)</label>
                    <input type="number" id="referral-bonus" value="${settings.referralBonus}" step="0.001">
                </div>
                <button class="btn btn-primary" onclick="savePlatformSettings()">Save All Settings</button>
            </div>
        `;
    }
};

// Helper functions for admin pages
async function getPlatformStats() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const transactionsSnapshot = await db.collection('transactions').get();
        const withdrawalsSnapshot = await db.collection('withdrawals').where('status', '==', 'pending').get();
        const tasksSnapshot = await db.collection('tasks').where('status', '==', 'active').get();
        
        let totalAds = 0;
        let totalRevenue = 0;
        let totalRewards = 0;
        let newUsersToday = 0;
        const today = new Date().toISOString().split('T')[0];
        
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            totalAds += user.ads_watched || 0;
            totalRewards += user.total_earned || 0;
            
            if (user.created_at && user.created_at.startsWith(today)) {
                newUsersToday++;
            }
        });
        
        transactionsSnapshot.forEach(doc => {
            const tx = doc.data();
            if (tx.type === 'ad_watched' && tx.amount > 0) {
                totalRevenue += tx.amount * 0.2; // 20% platform fee
            }
        });
        
        return {
            totalUsers: usersSnapshot.size,
            totalAdsWatched: totalAds,
            totalRevenue: totalRevenue,
            totalRewardsPaid: totalRewards,
            pendingWithdrawals: withdrawalsSnapshot.size,
            totalTasks: tasksSnapshot.size,
            newUsersToday: newUsersToday
        };
    } catch (error) {
        console.error('Error getting platform stats:', error);
        return {
            totalUsers: 0,
            totalAdsWatched: 0,
            totalRevenue: 0,
            totalRewardsPaid: 0,
            pendingWithdrawals: 0,
            totalTasks: 0,
            newUsersToday: 0
        };
    }
}

async function getPlatformSettings() {
    try {
        const doc = await db.collection('settings').doc('platform_config').get();
        if (doc.exists) {
            return doc.data();
        }
        return {};
    } catch (error) {
        console.error('Error getting settings:', error);
        return {};
    }
}
