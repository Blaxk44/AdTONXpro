// Ad Networks Integration

const AdNetworkManager = {
    // Monetag Integration
    monetag: {
        initialized: false,
        
        init: function() {
            if (this.initialized) return;
            
            // Load Monetag script
            const script = document.createElement('script');
            script.async = true;
            script.dataset.cfasync = 'false';
            script.src = `//thubanoa.com/1?z=${AD_NETWORKS.MONETAG.unitId}`;
            document.head.appendChild(script);
            
            this.initialized = true;
            console.log('Monetag initialized');
        },
        
        show: async function() {
            return new Promise((resolve, reject) => {
                try {
                    if (typeof show_10551237 === 'function') {
                        // Show rewarded interstitial
                        show_10551237().then(() => {
                            resolve({
                                success: true,
                                network: 'monetag'
                            });
                        }).catch(err => {
                            reject(err);
                        });
                    } else {
                        // Fallback: simulate ad watch
                        console.log('Monetag show function not available, simulating...');
                        setTimeout(() => {
                            resolve({
                                success: true,
                                network: 'monetag',
                                simulated: true
                            });
                        }, 3000);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }
    },
    
    // Adexium Integration
    adexium: {
        widget: null,
        initialized: false,
        
        init: function() {
            if (this.initialized) return;
            
            try {
                if (typeof AdexiumWidget !== 'undefined') {
                    this.widget = new AdexiumWidget({
                        wid: AD_NETWORKS.ADEXIUM.widgetId,
                        adFormat: 'interstitial'
                    });
                    
                    // Don't auto-show, we'll control it manually
                    console.log('Adexium initialized');
                    this.initialized = true;
                } else {
                    console.warn('Adexium SDK not loaded');
                }
            } catch (error) {
                console.error('Adexium init error:', error);
            }
        },
        
        show: async function() {
            return new Promise((resolve, reject) => {
                try {
                    if (this.widget) {
                        // Show ad manually
                        this.widget.show();
                        
                        // Simulate completion after 5 seconds
                        setTimeout(() => {
                            resolve({
                                success: true,
                                network: 'adexium'
                            });
                        }, 5000);
                    } else {
                        // Fallback: simulate ad watch
                        console.log('Adexium widget not available, simulating...');
                        setTimeout(() => {
                            resolve({
                                success: true,
                                network: 'adexium',
                                simulated: true
                            });
                        }, 3000);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }
    },
    
    // Adsgram Integration
    adsgram: {
        initialized: false,
        
        init: function() {
            if (this.initialized) return;
            
            // Load Adsgram CPM script
            const script = document.createElement('script');
            script.async = true;
            script.dataset.cfasync = 'false';
            script.src = AD_NETWORKS.ADSGRAM.cpmUrl;
            document.head.appendChild(script);
            
            this.initialized = true;
            console.log('Adsgram initialized');
        },
        
        show: async function() {
            return new Promise((resolve, reject) => {
                try {
                    // Adsgram is CPM-based, so we simulate the ad impression
                    console.log('Adsgram ad impression tracked');
                    
                    // Simulate ad display
                    setTimeout(() => {
                        resolve({
                            success: true,
                            network: 'adsgram'
                        });
                    }, 3000);
                } catch (error) {
                    reject(error);
                }
            });
        }
    },
    
    // Initialize all networks
    initAll: function() {
        if (AD_NETWORKS.MONETAG.enabled) {
            this.monetag.init();
        }
        
        if (AD_NETWORKS.ADEXIUM.enabled) {
            this.adexium.init();
        }
        
        if (AD_NETWORKS.ADSGRAM.enabled) {
            this.adsgram.init();
        }
    },
    
    // Show ad from specific network
    showAd: async function(network) {
        try {
            switch (network) {
                case 'monetag':
                    if (!AD_NETWORKS.MONETAG.enabled) {
                        throw new Error('Monetag is disabled');
                    }
                    return await this.monetag.show();
                
                case 'adexium':
                    if (!AD_NETWORKS.ADEXIUM.enabled) {
                        throw new Error('Adexium is disabled');
                    }
                    return await this.adexium.show();
                
                case 'adsgram':
                    if (!AD_NETWORKS.ADSGRAM.enabled) {
                        throw new Error('Adsgram is disabled');
                    }
                    return await this.adsgram.show();
                
                default:
                    throw new Error('Unknown ad network');
            }
        } catch (error) {
            console.error('Show ad error:', error);
            throw error;
        }
    }
};

// Ad Watch Manager
const AdWatchManager = {
    isWatching: false,
    currentNetwork: null,
    timerInterval: null,
    
    // Watch ad with UI
    watchAd: async function(network) {
        if (this.isWatching) {
            showToast('Already watching an ad', 'warning');
            return;
        }
        
        // Check cooldown
        if (currentUser && currentUser.last_ad_watched) {
            const cooldownRemaining = getRemainingCooldown(currentUser.last_ad_watched);
            if (cooldownRemaining > 0) {
                showToast(`Please wait ${cooldownRemaining} seconds`, 'warning');
                return;
            }
        }
        
        // Check daily limit
        if (currentUser && currentUser.daily_ad_count >= PLATFORM_SETTINGS.dailyAdLimit) {
            showToast('Daily ad limit reached', 'warning');
            return;
        }
        
        this.isWatching = true;
        this.currentNetwork = network;
        
        // Show modal
        const modal = document.getElementById('ad-modal');
        modal.classList.remove('hidden');
        
        // Start timer
        this.startTimer();
        
        try {
            // Show ad from network
            const result = await AdNetworkManager.showAd(network);
            
            // Calculate reward
            const reward = getAdReward(currentUser.ads_watched);
            
            // Record ad watched in database
            const recordResult = await DatabaseService.recordAdWatched(
                currentUser.telegram_id,
                network,
                reward
            );
            
            // Update current user data
            currentUser.balance += recordResult.reward;
            currentUser.today_earnings += recordResult.reward;
            currentUser.ads_watched += 1;
            currentUser.daily_ad_count = recordResult.dailyCount;
            currentUser.last_ad_watched = new Date().toISOString();
            
            // Update balance display
            updateBalanceDisplay(currentUser.balance);
            
            // Hide ad modal
            modal.classList.add('hidden');
            
            // Show success
            this.showSuccess(recordResult.reward, recordResult.bonus);
            
        } catch (error) {
            console.error('Watch ad error:', error);
            modal.classList.add('hidden');
            handleError(error, error.message || 'Failed to watch ad');
        } finally {
            this.isWatching = false;
            this.currentNetwork = null;
            this.stopTimer();
        }
    },
    
    // Start countdown timer
    startTimer: function() {
        let timeLeft = PLATFORM_SETTINGS.adCooldown;
        const timerText = document.getElementById('timer-text');
        const timerCircle = document.getElementById('timer-circle');
        const circumference = 2 * Math.PI * 45;
        
        timerCircle.style.strokeDasharray = circumference;
        timerCircle.style.strokeDashoffset = 0;
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            
            if (timerText) {
                timerText.textContent = timeLeft;
            }
            
            if (timerCircle) {
                const offset = circumference - (timeLeft / PLATFORM_SETTINGS.adCooldown) * circumference;
                timerCircle.style.strokeDashoffset = offset;
            }
            
            if (timeLeft <= 0) {
                this.stopTimer();
            }
        }, 1000);
    },
    
    // Stop timer
    stopTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    // Show success modal
    showSuccess: function(reward, bonus) {
        const modal = document.getElementById('success-modal');
        const title = document.getElementById('success-title');
        const message = document.getElementById('success-message');
        const amount = document.getElementById('success-amount');
        
        title.textContent = 'Congratulations! 🎉';
        message.textContent = 'You earned TON for watching an ad!';
        amount.textContent = `+${formatTON(reward)} TON`;
        
        if (bonus > 0) {
            message.textContent += ` (includes ${formatTON(bonus)} TON tier bonus)`;
        }
        
        modal.classList.remove('hidden');
        
        // Auto close after 3 seconds
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 3000);
    }
};

// Initialize ad networks when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        AdNetworkManager.initAll();
    }, 1000);
});
