// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Current user data
let currentUser = null;
let userSettings = null;

// Initialize Firebase Auth
async function initFirebaseAuth() {
    try {
        // Sign in anonymously
        const userCredential = await auth.signInAnonymously();
        console.log('Firebase authenticated:', userCredential.user.uid);
        return true;
    } catch (error) {
        console.error('Firebase auth error:', error);
        return false;
    }
}

// Database Service
const DatabaseService = {
    // Get or create user
    async getOrCreateUser(telegramUser) {
        try {
            const userRef = db.collection('users').doc(telegramUser.id.toString());
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                // Create new user
                const newUser = {
                    telegram_id: telegramUser.id.toString(),
                    username: telegramUser.username || '',
                    first_name: telegramUser.first_name || '',
                    last_name: telegramUser.last_name || '',
                    balance: 0,
                    total_earned: 0,
                    today_earnings: 0,
                    ads_watched: 0,
                    ads_monetag: 0,
                    ads_adexium: 0,
                    ads_adsgram: 0,
                    cpm_clicks: 0,
                    tasks_completed: 0,
                    referral_count: 0,
                    referral_earnings: 0,
                    wallet_address: '',
                    referred_by: telegramUser.start_param || null,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    last_active: new Date().toISOString(),
                    last_ad_watched: null,
                    daily_ad_count: 0,
                    last_reset_date: new Date().toISOString().split('T')[0]
                };
                
                await userRef.set(newUser);
                
                // Process referral if exists
                if (newUser.referred_by) {
                    await this.processReferral(newUser.referred_by, telegramUser.id.toString());
                }
                
                return newUser;
            } else {
                // Update last active
                const userData = userDoc.data();
                
                // Reset daily counter if new day
                const today = new Date().toISOString().split('T')[0];
                if (userData.last_reset_date !== today) {
                    await userRef.update({
                        daily_ad_count: 0,
                        today_earnings: 0,
                        last_reset_date: today,
                        last_active: new Date().toISOString()
                    });
                    userData.daily_ad_count = 0;
                    userData.today_earnings = 0;
                } else {
                    await userRef.update({
                        last_active: new Date().toISOString()
                    });
                }
                
                return userData;
            }
        } catch (error) {
            console.error('Error getting/creating user:', error);
            throw error;
        }
    },
    
    // Process referral
    async processReferral(referrerId, newUserId) {
        try {
            if (referrerId.startsWith('ref_')) {
                referrerId = referrerId.substring(4);
            }
            
            const referrerRef = db.collection('users').doc(referrerId);
            const referrerDoc = await referrerRef.get();
            
            if (referrerDoc.exists) {
                const referrerData = referrerDoc.data();
                const bonus = PLATFORM_SETTINGS.referralBonus;
                
                await referrerRef.update({
                    referral_count: firebase.firestore.FieldValue.increment(1),
                    balance: firebase.firestore.FieldValue.increment(bonus),
                    total_earned: firebase.firestore.FieldValue.increment(bonus)
                });
                
                // Create transaction
                await this.createTransaction({
                    user_id: referrerId,
                    type: 'referral',
                    amount: bonus,
                    description: `Referral bonus for user ${newUserId}`,
                    status: 'completed'
                });
            }
        } catch (error) {
            console.error('Error processing referral:', error);
        }
    },
    
    // Update user balance
    async updateBalance(userId, amount, type, description) {
        try {
            const userRef = db.collection('users').doc(userId);
            
            await userRef.update({
                balance: firebase.firestore.FieldValue.increment(amount),
                total_earned: firebase.firestore.FieldValue.increment(amount),
                today_earnings: firebase.firestore.FieldValue.increment(amount)
            });
            
            // Create transaction
            await this.createTransaction({
                user_id: userId,
                type: type,
                amount: amount,
                description: description,
                status: 'completed'
            });
            
            return true;
        } catch (error) {
            console.error('Error updating balance:', error);
            return false;
        }
    },
    
    // Record ad watched
    async recordAdWatched(userId, network, reward) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            // Check daily limit
            if (userData.daily_ad_count >= PLATFORM_SETTINGS.dailyAdLimit) {
                throw new Error('Daily ad limit reached');
            }
            
            // Calculate tier bonus
            let bonus = 0;
            const totalAds = userData.ads_watched + 1;
            
            if (totalAds === PLATFORM_SETTINGS.tier1.limit) {
                bonus = PLATFORM_SETTINGS.tier1.bonus;
            } else if (totalAds === PLATFORM_SETTINGS.tier2.limit) {
                bonus = PLATFORM_SETTINGS.tier2.bonus;
            }
            
            const totalReward = reward + bonus;
            
            // Update user stats
            const updateData = {
                ads_watched: firebase.firestore.FieldValue.increment(1),
                daily_ad_count: firebase.firestore.FieldValue.increment(1),
                balance: firebase.firestore.FieldValue.increment(totalReward),
                total_earned: firebase.firestore.FieldValue.increment(totalReward),
                today_earnings: firebase.firestore.FieldValue.increment(totalReward),
                last_ad_watched: new Date().toISOString()
            };
            
            // Increment network-specific counter
            if (network === 'monetag') {
                updateData.ads_monetag = firebase.firestore.FieldValue.increment(1);
            } else if (network === 'adexium') {
                updateData.ads_adexium = firebase.firestore.FieldValue.increment(1);
            } else if (network === 'adsgram') {
                updateData.ads_adsgram = firebase.firestore.FieldValue.increment(1);
            }
            
            await userRef.update(updateData);
            
            // Create transaction
            await this.createTransaction({
                user_id: userId,
                type: 'ad_watched',
                amount: totalReward,
                network: network,
                description: `Watched ${network} ad${bonus > 0 ? ' + tier bonus' : ''}`,
                status: 'completed'
            });
            
            // Process referral commission
            if (userData.referred_by) {
                const commission = totalReward * PLATFORM_SETTINGS.referralCommission;
                await this.updateBalance(
                    userData.referred_by.replace('ref_', ''),
                    commission,
                    'referral_commission',
                    `Commission from referral ${userId}`
                );
            }
            
            return {
                success: true,
                reward: totalReward,
                bonus: bonus,
                dailyCount: userData.daily_ad_count + 1
            };
        } catch (error) {
            console.error('Error recording ad:', error);
            throw error;
        }
    },
    
    // Create transaction
    async createTransaction(data) {
        try {
            const txRef = db.collection('transactions').doc();
            const transaction = {
                tx_id: txRef.id,
                user_id: data.user_id,
                type: data.type,
                amount: data.amount,
                fee: data.fee || 0,
                network: data.network || null,
                task_id: data.task_id || null,
                status: data.status || 'completed',
                timestamp: new Date().toISOString(),
                description: data.description || ''
            };
            
            await txRef.set(transaction);
            return transaction;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    },
    
    // Get tasks
    async getTasks(type = 'all') {
        try {
            let query = db.collection('tasks').where('status', '==', 'active');
            
            if (type !== 'all') {
                query = query.where('type', '==', type);
            }
            
            const snapshot = await query.get();
            const tasks = [];
            
            snapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            
            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    },
    
    // Complete task
    async completeTask(userId, taskId) {
        try {
            const taskRef = db.collection('tasks').doc(taskId);
            const taskDoc = await taskRef.get();
            
            if (!taskDoc.exists) {
                throw new Error('Task not found');
            }
            
            const taskData = taskDoc.data();
            
            // Check if user already completed this task
            const completionRef = db.collection('task_completions')
                .where('user_id', '==', userId)
                .where('task_id', '==', taskId);
            const completionSnapshot = await completionRef.get();
            
            if (!completionSnapshot.empty) {
                throw new Error('Task already completed');
            }
            
            // Update user balance
            await this.updateBalance(
                userId,
                taskData.reward,
                'task',
                `Completed task: ${taskData.title}`
            );
            
            // Increment task clicks
            await taskRef.update({
                clicks_done: firebase.firestore.FieldValue.increment(1)
            });
            
            // Mark completion
            await db.collection('task_completions').add({
                user_id: userId,
                task_id: taskId,
                completed_at: new Date().toISOString()
            });
            
            // Update user stats
            await db.collection('users').doc(userId).update({
                tasks_completed: firebase.firestore.FieldValue.increment(1)
            });
            
            return {
                success: true,
                reward: taskData.reward
            };
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    },
    
    // Create withdrawal request
    async createWithdrawalRequest(userId, amount, walletAddress) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            const userData = userDoc.data();
            
            if (amount < PLATFORM_SETTINGS.minWithdrawal) {
                throw new Error(`Minimum withdrawal is ${PLATFORM_SETTINGS.minWithdrawal} TON`);
            }
            
            if (userData.balance < amount) {
                throw new Error('Insufficient balance');
            }
            
            const fee = amount * PLATFORM_SETTINGS.withdrawalFee;
            const netAmount = amount - fee;
            
            // Deduct balance
            await userRef.update({
                balance: firebase.firestore.FieldValue.increment(-amount)
            });
            
            // Create withdrawal record
            const withdrawalRef = db.collection('withdrawals').doc();
            const withdrawal = {
                withdrawal_id: withdrawalRef.id,
                user_id: userId,
                amount: amount,
                fee: fee,
                net_amount: netAmount,
                wallet_address: walletAddress,
                status: 'pending',
                requested_at: new Date().toISOString(),
                processed_at: null,
                transaction_hash: null
            };
            
            await withdrawalRef.set(withdrawal);
            
            // Create transaction
            await this.createTransaction({
                user_id: userId,
                type: 'withdraw',
                amount: -amount,
                fee: fee,
                description: `Withdrawal to ${walletAddress}`,
                status: 'pending'
            });
            
            return withdrawal;
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            throw error;
        }
    },
    
    // Get user transactions
    async getUserTransactions(userId, limit = 50) {
        try {
            const snapshot = await db.collection('transactions')
                .where('user_id', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const transactions = [];
            snapshot.forEach(doc => {
                transactions.push({ id: doc.id, ...doc.data() });
            });
            
            return transactions;
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },
    
    // Get leaderboard
    async getLeaderboard(limit = 100) {
        try {
            const snapshot = await db.collection('users')
                .where('status', '==', 'active')
                .orderBy('ads_watched', 'desc')
                .limit(limit)
                .get();
            
            const leaderboard = [];
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                leaderboard.push({
                    rank: index + 1,
                    telegram_id: data.telegram_id,
                    username: data.username || 'Anonymous',
                    first_name: data.first_name,
                    ads_watched: data.ads_watched,
                    total_earned: data.total_earned
                });
            });
            
            return leaderboard;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    },
    
    // Get platform settings
    async getPlatformSettings() {
        try {
            const settingsDoc = await db.collection('settings').doc('platform_config').get();
            
            if (settingsDoc.exists) {
                return settingsDoc.data();
            }
            
            // Create default settings if not exist
            await db.collection('settings').doc('platform_config').set({
                ...PLATFORM_SETTINGS,
                updated_at: new Date().toISOString()
            });
            
            return PLATFORM_SETTINGS;
        } catch (error) {
            console.error('Error getting settings:', error);
            return PLATFORM_SETTINGS;
        }
    }
};
