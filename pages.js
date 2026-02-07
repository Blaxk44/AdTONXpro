// Page Content for AdTONX

const Pages = {
    // Home Page
    home: async function() {
        if (!currentUser) return '<div class="card"><p>Loading...</p></div>';
        
        const tierInfo = getTierInfo(currentUser.ads_watched);
        
        return `
            <div class="fade-in">
                <!-- Balance Card -->
                <div class="balance-card card">
                    <div class="balance-title">Your Balance</div>
                    <div class="balance-main">${formatTON(currentUser.balance)}</div>
                    <div class="balance-subtitle">TON</div>
                    
                    <div class="earnings-today">
                        <div class="earning-item">
                            <span class="value">${formatTON(currentUser.today_earnings)}</span>
                            <span class="label">Today</span>
                        </div>
                        <div class="earning-item">
                            <span class="value">${formatTON(currentUser.total_earned)}</span>
                            <span class="label">Total</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <button class="btn btn-primary" onclick="navigateTo('ads')">
                        ⛏️ Start Mining TON
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('tasks')">
                        ✅ Complete Tasks
                    </button>
                </div>
                
                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-icon">📺</span>
                        <span class="stat-value">${formatNumber(currentUser.ads_watched)}</span>
                        <span class="stat-label">Ads Mined</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">✅</span>
                        <span class="stat-value">${formatNumber(currentUser.tasks_completed)}</span>
                        <span class="stat-label">Tasks Done</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🤝</span>
                        <span class="stat-value">${formatNumber(currentUser.referral_count)}</span>
                        <span class="stat-label">Referrals</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⚡</span>
                        <span class="stat-value">${tierInfo.name}</span>
                        <span class="stat-label">Current Tier</span>
                    </div>
                </div>
                
                <!-- Tier Info -->
                <div class="card" style="border-left: 4px solid ${tierInfo.color};">
                    <div class="card-header">
                        <h3 class="card-title">🏆 ${tierInfo.name} Tier</h3>
                        <span class="badge badge-success">${formatTON(tierInfo.reward)} TON/ad</span>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 10px;">
                        ${tierInfo.remaining > 0 
                            ? `Mine ${tierInfo.remaining} more ads to reach next tier and unlock ${formatTON(tierInfo.nextBonus)} TON bonus!` 
                            : 'Maximum tier achieved! You\'re earning the highest rewards.'}
                    </p>
                    ${tierInfo.remaining > 0 ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((platformSettings.tier1.limit - tierInfo.remaining) / platformSettings.tier1.limit) * 100}%"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // Ads/Earn Page
    ads: async function() {
        if (!currentUser) return '<div class="card"><p>Loading...</p></div>';
        
        const settings = platformSettings || PLATFORM_SETTINGS;
        const dailyProgress = (currentUser.daily_ad_count / settings.dailyAdLimit) * 100;
        const cooldown = currentUser.last_ad_watched ? getRemainingCooldown(currentUser.last_ad_watched) : 0;
        const reward = getAdReward(currentUser.ads_watched);
        
        return `
            <div class="fade-in">
                <!-- Daily Progress -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⛏️ Mining Progress</h3>
                        <span class="badge badge-info">${currentUser.daily_ad_count} / ${settings.dailyAdLimit}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${dailyProgress}%"></div>
                    </div>
                    <p style="margin-top: 10px; font-size: 13px; color: var(--text-secondary);">
                        ${settings.dailyAdLimit - currentUser.daily_ad_count} mining opportunities remaining today
                    </p>
                </div>
                
                ${cooldown > 0 ? `
                    <div class="card" style="background: rgba(255, 170, 0, 0.1); border-left: 4px solid var(--warning);">
                        <strong>⏳ Mining Cooldown</strong>
                        <p style="color: var(--text-secondary); margin-top: 8px;">
                            Next mining available in ${cooldown} seconds
                        </p>
                    </div>
                ` : ''}
                
                <!-- Ad Networks -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💎 Mining Networks</h3>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${this.getAdNetworkCard('monetag', 'Monetag', currentUser.ads_monetag, reward, cooldown > 0)}
                        ${this.getAdNetworkCard('adexium', 'Adexium', currentUser.ads_adexium, reward, cooldown > 0)}
                        ${this.getAdNetworkCard('adsgram', 'Adsgram', currentUser.ads_adsgram, reward, cooldown > 0)}
                    </div>
                </div>
            </div>
        `;
    },
    
    getAdNetworkCard(network, name, count, reward, disabled) {
        return `
            <div style="
                background: var(--bg-card-hover);
                padding: 16px;
                border-radius: 12px;
                border: 1px solid rgba(0, 212, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${name}</div>
                    <div style="font-size: 13px; color: var(--success);">+${formatTON(reward)} TON</div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                        Mined today: ${count}
                    </div>
                </div>
                <button 
                    class="btn btn-primary" 
                    onclick="AdWatchManager.watchAd('${network}')"
                    ${disabled ? 'disabled' : ''}
                    style="width: auto; padding: 10px 20px; margin: 0;">
                    ⛏️ Mine
                </button>
            </div>
        `;
    },
    
    // Tasks Page
    tasks: async function() {
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">✅ Available Tasks</h3>
                    </div>
                    <div id="tasks-list">
                        <div style="text-align: center; padding: 40px 20px;">
                            <div class="spinner" style="margin: 0 auto 15px;"></div>
                            <p style="color: var(--text-secondary);">Loading tasks...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Wallet Page
    wallet: async function() {
        if (!currentUser) return '<div class="card"><p>Loading...</p></div>';
        
        return `
            <div class="fade-in">
                <!-- Balance Card -->
                <div class="balance-card card">
                    <div class="balance-title">Available Balance</div>
                    <div class="balance-main">${formatTON(currentUser.balance)}</div>
                    <div class="balance-subtitle">TON</div>
                </div>
                
                <!-- Withdraw Button -->
                <div class="card">
                    <button class="btn btn-primary" onclick="showWithdrawModal()">
                        💸 Withdraw TON
                    </button>
                    <p style="font-size: 11px; color: var(--text-secondary); margin-top: 10px; text-align: center;">
                        Min: ${platformSettings?.minWithdrawal || 2} TON | Fee: ${(platformSettings?.withdrawalFee || 0.2) * 100}%
                    </p>
                </div>
                
                <!-- Wallet Info -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💰 Wallet Info</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0, 212, 255, 0.1);">
                            <span style="color: var(--text-secondary); font-size: 13px;">Address</span>
                            <span style="font-size: 13px; font-weight: 600;">${currentUser.wallet_address || 'Not set'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0, 212, 255, 0.1);">
                            <span style="color: var(--text-secondary); font-size: 13px;">Total Earned</span>
                            <span style="font-size: 13px; font-weight: 600; color: var(--success);">${formatTON(currentUser.total_earned)} TON</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: var(--text-secondary); font-size: 13px;">Today</span>
                            <span style="font-size: 13px; font-weight: 600; color: var(--secondary);">${formatTON(currentUser.today_earnings)} TON</span>
                        </div>
                    </div>
                    ${!currentUser.wallet_address ? `
                        <button class="btn btn-secondary" onclick="updateWalletAddress()">
                            Set Wallet Address
                        </button>
                    ` : ''}
                </div>
                
                <!-- Transactions -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📜 Recent Transactions</h3>
                    </div>
                    <div id="transactions-list">
                        <div style="text-align: center; padding: 20px;">
                            <div class="spinner" style="margin: 0 auto 15px; width: 30px; height: 30px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Profile Page
    profile: async function() {
        if (!currentUser) return '<div class="card"><p>Loading...</p></div>';
        
        const referralLink = generateReferralLink(currentUser.telegram_id);
        
        return `
            <div class="fade-in">
                <!-- Profile Info -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">👤 Profile</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: var(--text-secondary); font-size: 13px;">Name</span>
                            <span style="font-size: 13px; font-weight: 600;">${currentUser.first_name} ${currentUser.last_name}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: var(--text-secondary); font-size: 13px;">Username</span>
                            <span style="font-size: 13px; font-weight: 600;">@${currentUser.username || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: var(--text-secondary); font-size: 13px;">Member Since</span>
                            <span style="font-size: 13px; font-weight: 600;">${formatDate(currentUser.created_at)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Referral Card -->
                <div class="card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <h3 style="margin-bottom: 10px; color: white;">🤝 Invite Friends</h3>
                    <p style="font-size: 13px; margin-bottom: 15px; color: rgba(255,255,255,0.9);">
                        Earn ${(platformSettings?.referralCommission || 0.1) * 100}% commission + 
                        ${formatTON(platformSettings?.referralBonus || 0.005)} TON bonus per referral
                    </p>
                    
                    <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 8px; margin: 15px 0; word-break: break-all; font-size: 12px; color: white;">
                        ${referralLink}
                    </div>
                    
                    <button class="btn" style="background: white; color: #667eea;" onclick="copyToClipboard('${referralLink}')">
                        📋 Copy Referral Link
                    </button>
                    
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between; color: white;">
                        <div>
                            <div style="font-size: 11px; opacity: 0.8;">Referrals</div>
                            <div style="font-size: 20px; font-weight: 800;">${formatNumber(currentUser.referral_count)}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 11px; opacity: 0.8;">Earned</div>
                            <div style="font-size: 20px; font-weight: 800;">${formatTON(currentUser.referral_earnings)} TON</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Helper functions
async function loadTasks() {
    try {
        const tasks = await DatabaseService.getTasks();
        const container = document.getElementById('tasks-list');
        
        if (!container) return;
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <p style="color: var(--text-secondary);">No tasks available</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <div style="background: var(--bg-card-hover); padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(0, 212, 255, 0.1);">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">${task.title}</div>
                <div style="font-size: 13px; color: var(--success); margin-bottom: 8px;">+${formatTON(task.reward)} TON</div>
                <button class="btn btn-primary" style="width: 100%; margin: 0;">Start Task</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load tasks error:', error);
    }
}

async function loadTransactions() {
    try {
        const txs = await DatabaseService.getUserTransactions(currentUser.telegram_id, 10);
        const container = document.getElementById('transactions-list');
        
        if (!container) return;
        
        if (txs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px 20px;">
                    <p style="color: var(--text-secondary);">No transactions yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = txs.map(tx => `
            <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--bg-card-hover); border-radius: 8px; margin-bottom: 8px;">
                <div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${tx.description}</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${formatDate(tx.timestamp)}</div>
                </div>
                <div style="font-size: 16px; font-weight: 800; color: ${tx.amount > 0 ? 'var(--success)' : 'var(--danger)'};">
                    ${tx.amount > 0 ? '+' : ''}${formatTON(tx.amount)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load transactions error:', error);
    }
}

function showWithdrawModal() {
    if (!currentUser.wallet_address) {
        alertDialog('Please set your TON wallet address first');
        return;
    }
    
    const settings = platformSettings || PLATFORM_SETTINGS;
    if (currentUser.balance < settings.minWithdrawal) {
        alertDialog(`Minimum withdrawal is ${settings.minWithdrawal} TON`);
        return;
    }
    
    document.getElementById('withdraw-wallet').value = currentUser.wallet_address;
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-modal').classList.remove('hidden');
}

async function updateWalletAddress() {
    const address = prompt('Enter your TON wallet address:');
    if (!address) return;
    
    if (!isValidTONAddress(address)) {
        showToast('Invalid TON wallet address', 'error');
        return;
    }
    
    try {
        showLoading(true);
        await DatabaseService.updateWalletAddress(currentUser.telegram_id, address);
        currentUser.wallet_address = address;
        showLoading(false);
        showToast('Wallet address updated!', 'success');
        navigateTo('wallet');
    } catch (error) {
        showLoading(false);
        showToast('Failed to update wallet', 'error');
    }
}
