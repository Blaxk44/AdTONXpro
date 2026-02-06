// Page Content Manager

const Pages = {
    // Home Page
    home: function() {
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
                            <span class="label">Total Earned</span>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <button class="btn btn-primary" onclick="navigateTo('ads')">
                        📺 Watch Ads & Earn
                    </button>
                    <button class="btn btn-secondary" onclick="navigateTo('tasks')">
                        ✅ Complete Tasks
                    </button>
                </div>
                
                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${formatNumber(currentUser.ads_watched)}</span>
                        <span class="stat-label">Ads Watched</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${formatNumber(currentUser.tasks_completed)}</span>
                        <span class="stat-label">Tasks Done</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${formatNumber(currentUser.referral_count)}</span>
                        <span class="stat-label">Referrals</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${formatTON(currentUser.referral_earnings)}</span>
                        <span class="stat-label">Ref. Earned</span>
                    </div>
                </div>
                
                <!-- Tutorial -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💡 How to Earn</h3>
                    </div>
                    <div class="tutorial-content">
                        <p style="margin-bottom: 15px; color: var(--text-secondary); line-height: 1.6;">
                            <strong>1. Watch Ads:</strong> Earn TON by watching ads from our networks. 
                            The more you watch, the higher your rewards!<br><br>
                            <strong>2. Complete Tasks:</strong> Join channels, follow accounts, and complete 
                            simple tasks for rewards.<br><br>
                            <strong>3. Refer Friends:</strong> Get 10% commission from your referrals' 
                            lifetime earnings plus bonus!<br><br>
                            <strong>4. Withdraw:</strong> Cash out your earnings to your TON wallet 
                            (minimum 2 TON).
                        </p>
                    </div>
                </div>
                
                <!-- Latest Announcements -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📢 Announcements</h3>
                    </div>
                    <div class="announcement-content">
                        <p style="color: var(--text-secondary); line-height: 1.6;">
                            🎉 <strong>Welcome to AdTONX!</strong><br>
                            Start earning TON cryptocurrency by watching ads and completing tasks. 
                            Daily limit: ${PLATFORM_SETTINGS.dailyAdLimit} ads. 
                            Referral commission: ${PLATFORM_SETTINGS.referralCommission * 100}%. 
                            Withdrawal fee: ${PLATFORM_SETTINGS.withdrawalFee * 100}%.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Ads Page
    ads: function() {
        const dailyProgress = (currentUser.daily_ad_count / PLATFORM_SETTINGS.dailyAdLimit) * 100;
        const cooldownRemaining = currentUser.last_ad_watched ? 
            getRemainingCooldown(currentUser.last_ad_watched) : 0;
        
        const currentReward = getAdReward(currentUser.ads_watched);
        
        return `
            <div class="fade-in">
                <!-- Daily Progress -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Daily Progress</h3>
                        <span class="badge badge-info">
                            ${currentUser.daily_ad_count} / ${PLATFORM_SETTINGS.dailyAdLimit}
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${dailyProgress}%"></div>
                    </div>
                    <p style="margin-top: 10px; font-size: 14px; color: var(--text-secondary);">
                        ${PLATFORM_SETTINGS.dailyAdLimit - currentUser.daily_ad_count} ads remaining today
                    </p>
                </div>
                
                <!-- Tier Info -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🎯 Current Tier</h3>
                    </div>
                    <div class="tier-info">
                        <p style="margin-bottom: 15px; color: var(--text-secondary);">
                            <strong>Your Reward:</strong> 
                            <span style="color: var(--success-color); font-size: 18px; font-weight: bold;">
                                ${formatTON(currentReward)} TON
                            </span> per ad
                        </p>
                        
                        ${this.getTierDisplay()}
                    </div>
                </div>
                
                <!-- Ad Networks -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📺 Watch Ads</h3>
                    </div>
                    
                    ${cooldownRemaining > 0 ? `
                        <div class="cooldown-notice" style="
                            background: rgba(255, 152, 0, 0.1);
                            border-left: 4px solid var(--warning-color);
                            padding: 12px;
                            margin-bottom: 15px;
                            border-radius: 4px;
                        ">
                            <strong>⏳ Cooldown:</strong> Wait ${cooldownRemaining} seconds before next ad
                        </div>
                    ` : ''}
                    
                    <div class="ad-network-list">
                        ${this.getAdNetworkItem('monetag', 'Monetag', currentUser.ads_monetag, cooldownRemaining)}
                        ${this.getAdNetworkItem('adexium', 'Adexium', currentUser.ads_adexium, cooldownRemaining)}
                        ${this.getAdNetworkItem('adsgram', 'Adsgram', currentUser.ads_adsgram, cooldownRemaining)}
                    </div>
                </div>
                
                <!-- Leaderboard Preview -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏆 Top Earners</h3>
                        <button class="btn btn-secondary" onclick="navigateTo('leaderboard')" 
                            style="padding: 6px 12px; font-size: 14px; width: auto; margin: 0;">
                            View All
                        </button>
                    </div>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 15px;">
                        Weekly pool: ${PLATFORM_SETTINGS.leaderboardPool} TON
                    </p>
                    <div id="leaderboard-preview">Loading...</div>
                </div>
            </div>
        `;
    },
    
    getTierDisplay: function() {
        const adsWatched = currentUser.ads_watched;
        
        if (adsWatched < PLATFORM_SETTINGS.tier1.limit) {
            const remaining = PLATFORM_SETTINGS.tier1.limit - adsWatched;
            return `
                <div class="tier-card" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px; border-radius: 8px;">
                    <strong>Tier 1 - Bronze</strong><br>
                    <small>Watch ${remaining} more ads to unlock Tier 2 and get ${formatTON(PLATFORM_SETTINGS.tier1.bonus)} TON bonus!</small>
                </div>
            `;
        } else if (adsWatched < PLATFORM_SETTINGS.tier2.limit) {
            const remaining = PLATFORM_SETTINGS.tier2.limit - adsWatched;
            return `
                <div class="tier-card" style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 15px; border-radius: 8px;">
                    <strong>Tier 2 - Silver</strong><br>
                    <small>Watch ${remaining} more ads to unlock Tier 3 and get ${formatTON(PLATFORM_SETTINGS.tier2.bonus)} TON bonus!</small>
                </div>
            `;
        } else {
            return `
                <div class="tier-card" style="background: linear-gradient(135deg, #ffd700, #ffed4e); color: #333; padding: 15px; border-radius: 8px;">
                    <strong>Tier 3 - Gold 🏆</strong><br>
                    <small>Maximum tier! You're earning the highest rewards per ad.</small>
                </div>
            `;
        }
    },
    
    getAdNetworkItem: function(network, name, watched, cooldown) {
        const reward = getAdReward(currentUser.ads_watched);
        const disabled = cooldown > 0 || currentUser.daily_ad_count >= PLATFORM_SETTINGS.dailyAdLimit;
        
        return `
            <div class="ad-network-item">
                <div class="ad-network-info">
                    <div class="ad-network-name">${name}</div>
                    <div class="ad-network-reward">+${formatTON(reward)} TON per ad</div>
                    <div class="ad-network-progress">Watched today: ${watched}</div>
                </div>
                <button class="ad-watch-btn" 
                    onclick="AdWatchManager.watchAd('${network}')"
                    ${disabled ? 'disabled' : ''}>
                    Watch
                </button>
            </div>
        `;
    },
    
    // Tasks Page
    tasks: function() {
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">✅ Available Tasks</h3>
                    </div>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 15px;">
                        Complete tasks to earn extra TON rewards
                    </p>
                    <div id="tasks-list">
                        <div style="text-align: center; padding: 40px 20px;">
                            <div class="spinner" style="margin: 0 auto 15px; width: 40px; height: 40px;"></div>
                            <p style="color: var(--text-secondary);">Loading tasks...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Create Paid Task -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💼 Create Your Own Task</h3>
                    </div>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 15px;">
                        Promote your channel, website, or project!<br>
                        <strong>Price:</strong> 1 TON = 250 clicks
                    </p>
                    <button class="btn btn-primary" onclick="showCreateTaskModal()">
                        Create Task
                    </button>
                </div>
            </div>
        `;
    },
    
    // Wallet Page
    wallet: function() {
        return `
            <div class="fade-in">
                <!-- Balance Overview -->
                <div class="balance-card card">
                    <div class="balance-title">Available Balance</div>
                    <div class="balance-main">${formatTON(currentUser.balance)}</div>
                    <div class="balance-subtitle">TON</div>
                </div>
                
                <!-- Actions -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">💰 Actions</h3>
                    </div>
                    
                    <button class="btn btn-primary" onclick="showWithdrawModal()">
                        Withdraw TON
                    </button>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px; text-align: center;">
                        Minimum: ${PLATFORM_SETTINGS.minWithdrawal} TON | Fee: ${PLATFORM_SETTINGS.withdrawalFee * 100}%
                    </p>
                </div>
                
                <!-- Wallet Info -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📋 Wallet Info</h3>
                    </div>
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label">TON Address</span>
                            <span class="info-value">${currentUser.wallet_address || 'Not set'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Total Earned</span>
                            <span class="info-value">${formatTON(currentUser.total_earned)} TON</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Today's Earnings</span>
                            <span class="info-value">${formatTON(currentUser.today_earnings)} TON</span>
                        </div>
                    </div>
                    
                    ${!currentUser.wallet_address ? `
                        <button class="btn btn-secondary" onclick="updateWalletAddress()">
                            Set Wallet Address
                        </button>
                    ` : ''}
                </div>
                
                <!-- Transaction History -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📜 Recent Transactions</h3>
                    </div>
                    <div id="transactions-list">
                        <div style="text-align: center; padding: 20px;">
                            <div class="spinner" style="margin: 0 auto 15px; width: 30px; height: 30px;"></div>
                            <p style="color: var(--text-secondary); font-size: 14px;">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Profile Page
    profile: function() {
        const referralLink = generateReferralLink(currentUser.telegram_id);
        
        return `
            <div class="fade-in">
                <!-- Profile Info -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">👤 Profile</h3>
                    </div>
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label">Name</span>
                            <span class="info-value">${currentUser.first_name} ${currentUser.last_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Username</span>
                            <span class="info-value">@${currentUser.username || 'N/A'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Telegram ID</span>
                            <span class="info-value">${currentUser.telegram_id}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Member Since</span>
                            <span class="info-value">${formatDate(currentUser.created_at)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Status</span>
                            <span class="info-value">
                                <span class="badge badge-success">${currentUser.status}</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Referral Card -->
                <div class="referral-card">
                    <h3 style="margin-bottom: 10px;">🤝 Invite Friends</h3>
                    <p style="font-size: 14px; margin-bottom: 15px; opacity: 0.9;">
                        Earn ${PLATFORM_SETTINGS.referralCommission * 100}% commission + 
                        ${formatTON(PLATFORM_SETTINGS.referralBonus)} TON bonus per referral
                    </p>
                    
                    <div class="referral-link">${referralLink}</div>
                    
                    <button class="copy-link-btn" onclick="copyToClipboard('${referralLink}')">
                        📋 Copy Referral Link
                    </button>
                    
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Total Referrals:</span>
                            <strong>${formatNumber(currentUser.referral_count)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Referral Earnings:</span>
                            <strong>${formatTON(currentUser.referral_earnings)} TON</strong>
                        </div>
                    </div>
                </div>
                
                <!-- Statistics -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📊 Statistics</h3>
                    </div>
                    <div class="profile-info">
                        <div class="info-row">
                            <span class="info-label">Total Earned</span>
                            <span class="info-value">${formatTON(currentUser.total_earned)} TON</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Current Balance</span>
                            <span class="info-value">${formatTON(currentUser.balance)} TON</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ads Watched</span>
                            <span class="info-value">${formatNumber(currentUser.ads_watched)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Tasks Completed</span>
                            <span class="info-value">${formatNumber(currentUser.tasks_completed)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Monetag Ads</span>
                            <span class="info-value">${formatNumber(currentUser.ads_monetag)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Adexium Ads</span>
                            <span class="info-value">${formatNumber(currentUser.ads_adexium)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Adsgram Ads</span>
                            <span class="info-value">${formatNumber(currentUser.ads_adsgram)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Leaderboard Page
    leaderboard: function() {
        return `
            <div class="fade-in">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🏆 Top 100 Earners</h3>
                    </div>
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 15px;">
                        Weekly pool: <strong>${PLATFORM_SETTINGS.leaderboardPool} TON</strong><br>
                        Top 10: ${PLATFORM_SETTINGS.leaderboardTop10} TON | Next 90: ${PLATFORM_SETTINGS.leaderboardNext90} TON
                    </p>
                    <div id="leaderboard-list">
                        <div style="text-align: center; padding: 40px 20px;">
                            <div class="spinner" style="margin: 0 auto 15px; width: 40px; height: 40px;"></div>
                            <p style="color: var(--text-secondary);">Loading leaderboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
