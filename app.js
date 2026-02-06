// Main Application

// Current page
let currentPage = 'home';

// Initialize Application
async function initApp() {
    try {
        showLoading(true);
        
        // Initialize Firebase Auth
        await initFirebaseAuth();
        
        // Get Telegram user data
        const telegramUser = getTelegramUser();
        console.log('Telegram user:', telegramUser);
        
        // Get or create user in database
        currentUser = await DatabaseService.getOrCreateUser(telegramUser);
        console.log('Current user:', currentUser);
        
        // Load platform settings
        userSettings = await DatabaseService.getPlatformSettings();
        console.log('Platform settings loaded');
        
        // Update balance display
        updateBalanceDisplay(currentUser.balance);
        
        // Hide loading and show app
        showLoading(false);
        document.getElementById('main-app').classList.remove('hidden');
        
        // Load home page
        navigateTo('home');
        
        // Set up navigation
        setupNavigation();
        
        // Set up modal handlers
        setupModals();
        
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('App initialization error:', error);
        showLoading(false);
        alertDialog('Failed to initialize app. Please refresh and try again.');
    }
}

// Setup Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

// Navigate to page
function navigateTo(page) {
    // Update current page
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Load page content
    const contentArea = document.getElementById('content-area');
    
    if (Pages[page]) {
        contentArea.innerHTML = Pages[page]();
        
        // Load dynamic content
        loadPageData(page);
    } else {
        contentArea.innerHTML = '<div class="card"><p>Page not found</p></div>';
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Load page-specific data
async function loadPageData(page) {
    switch (page) {
        case 'ads':
            await loadLeaderboardPreview();
            break;
        
        case 'tasks':
            await loadTasks();
            break;
        
        case 'wallet':
            await loadTransactions();
            break;
        
        case 'leaderboard':
            await loadFullLeaderboard();
            break;
    }
}

// Load leaderboard preview (top 5)
async function loadLeaderboardPreview() {
    try {
        const leaderboard = await DatabaseService.getLeaderboard(5);
        const container = document.getElementById('leaderboard-preview');
        
        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No data yet</p>';
            return;
        }
        
        let html = '<div class="leaderboard-list">';
        
        leaderboard.forEach(user => {
            html += `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${getRankClass(user.rank)}">${user.rank}</div>
                    <div class="leaderboard-user">
                        <div class="leaderboard-name">${user.first_name || user.username}</div>
                        <div class="leaderboard-ads">${formatNumber(user.ads_watched)} ads</div>
                    </div>
                    <div class="leaderboard-reward">${formatTON(user.total_earned)} TON</div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading leaderboard preview:', error);
    }
}

// Load full leaderboard
async function loadFullLeaderboard() {
    try {
        const leaderboard = await DatabaseService.getLeaderboard(100);
        const container = document.getElementById('leaderboard-list');
        
        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No data yet</p>';
            return;
        }
        
        let html = '<div class="leaderboard-list">';
        
        leaderboard.forEach(user => {
            html += `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${getRankClass(user.rank)}">${user.rank}</div>
                    <div class="leaderboard-user">
                        <div class="leaderboard-name">${user.first_name || user.username}</div>
                        <div class="leaderboard-ads">${formatNumber(user.ads_watched)} ads watched</div>
                    </div>
                    <div class="leaderboard-reward">${formatTON(user.total_earned)} TON</div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading full leaderboard:', error);
        handleError(error, 'Failed to load leaderboard');
    }
}

// Get rank class for styling
function getRankClass(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
}

// Load tasks
async function loadTasks() {
    try {
        const tasks = await DatabaseService.getTasks();
        const container = document.getElementById('tasks-list');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">No tasks available right now</p>
                    <p style="font-size: 14px; color: var(--text-secondary);">Check back later for new tasks!</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="task-list">';
        
        for (const task of tasks) {
            // Check if user completed this task
            const isCompleted = await isTaskCompleted(task.id);
            
            html += `
                <div class="task-item">
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-reward">+${formatTON(task.reward)} TON</div>
                        ${task.type === 'paid' ? `
                            <div class="task-status">
                                <span class="badge badge-info">User Task</span>
                                ${task.clicks_done}/${task.clicks_required} clicks
                            </div>
                        ` : ''}
                        ${isCompleted ? `
                            <div class="task-status">
                                <span class="badge badge-success">Completed</span>
                            </div>
                        ` : ''}
                    </div>
                    <button class="task-complete-btn ${isCompleted ? 'completed' : ''}" 
                        onclick="openTask('${task.id}')"
                        ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? '✓' : 'Start'}
                    </button>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        handleError(error, 'Failed to load tasks');
    }
}

// Check if task is completed
async function isTaskCompleted(taskId) {
    try {
        const snapshot = await db.collection('task_completions')
            .where('user_id', '==', currentUser.telegram_id)
            .where('task_id', '==', taskId)
            .get();
        
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking task completion:', error);
        return false;
    }
}

// Open task
async function openTask(taskId) {
    try {
        const taskDoc = await db.collection('tasks').doc(taskId).get();
        
        if (!taskDoc.exists) {
            showToast('Task not found', 'error');
            return;
        }
        
        const task = taskDoc.data();
        
        // Show task modal
        const modal = document.getElementById('task-modal');
        document.getElementById('task-modal-title').textContent = task.title;
        document.getElementById('task-modal-description').textContent = task.description || 'Complete this task to earn rewards';
        
        const link = document.getElementById('task-modal-link');
        link.href = task.link;
        link.textContent = 'Open ' + (task.type === 'official' ? 'Channel' : 'Link');
        
        const verifyBtn = document.getElementById('task-verify-btn');
        verifyBtn.onclick = async () => {
            await completeTask(taskId);
        };
        
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error opening task:', error);
        handleError(error, 'Failed to open task');
    }
}

// Complete task
async function completeTask(taskId) {
    try {
        const confirmed = await confirmDialog('Have you completed this task?');
        if (!confirmed) return;
        
        const result = await DatabaseService.completeTask(currentUser.telegram_id, taskId);
        
        if (result.success) {
            // Update user data
            currentUser.balance += result.reward;
            currentUser.tasks_completed += 1;
            updateBalanceDisplay(currentUser.balance);
            
            // Close task modal
            document.getElementById('task-modal').classList.add('hidden');
            
            // Show success
            showSuccessMessage('Task Completed!', `You earned ${formatTON(result.reward)} TON`);
            
            // Reload tasks
            await loadTasks();
        }
        
    } catch (error) {
        console.error('Error completing task:', error);
        handleError(error, error.message || 'Failed to complete task');
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const transactions = await DatabaseService.getUserTransactions(currentUser.telegram_id, 20);
        const container = document.getElementById('transactions-list');
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary); padding: 30px;">
                    No transactions yet
                </p>
            `;
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        
        transactions.forEach(tx => {
            const isPositive = tx.amount > 0;
            const icon = getTransactionIcon(tx.type);
            
            html += `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--bg-color);
                    border-radius: 8px;
                ">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">
                            ${icon} ${tx.description}
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            ${formatDate(tx.timestamp)}
                        </div>
                    </div>
                    <div style="
                        font-weight: bold;
                        color: ${isPositive ? 'var(--success-color)' : 'var(--danger-color)'};
                    ">
                        ${isPositive ? '+' : ''}${formatTON(tx.amount)} TON
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        handleError(error, 'Failed to load transactions');
    }
}

// Get transaction icon
function getTransactionIcon(type) {
    const icons = {
        'ad_watched': '📺',
        'task': '✅',
        'referral': '🤝',
        'referral_commission': '💰',
        'withdraw': '📤',
        'deposit': '📥'
    };
    
    return icons[type] || '💎';
}

// Setup modals
function setupModals() {
    // Close ad modal
    document.getElementById('close-ad-modal').addEventListener('click', () => {
        document.getElementById('ad-modal').classList.add('hidden');
    });
    
    // Close success modal
    document.getElementById('close-success-modal').addEventListener('click', () => {
        document.getElementById('success-modal').classList.add('hidden');
    });
    
    // Close task modal
    document.getElementById('close-task-modal').addEventListener('click', () => {
        document.getElementById('task-modal').classList.add('hidden');
    });
    
    // Close withdraw modal
    document.getElementById('close-withdraw-modal').addEventListener('click', () => {
        document.getElementById('withdraw-modal').classList.add('hidden');
    });
    
    // Withdraw amount input handler
    document.getElementById('withdraw-amount').addEventListener('input', updateWithdrawSummary);
}

// Show withdraw modal
function showWithdrawModal() {
    if (!currentUser.wallet_address) {
        alertDialog('Please set your TON wallet address first in the Profile section');
        return;
    }
    
    if (currentUser.balance < PLATFORM_SETTINGS.minWithdrawal) {
        alertDialog(`Minimum withdrawal is ${PLATFORM_SETTINGS.minWithdrawal} TON. Your balance: ${formatTON(currentUser.balance)} TON`);
        return;
    }
    
    document.getElementById('withdraw-wallet').value = currentUser.wallet_address;
    document.getElementById('withdraw-amount').value = '';
    updateWithdrawSummary();
    
    document.getElementById('withdraw-modal').classList.remove('hidden');
}

// Update withdrawal summary
function updateWithdrawSummary() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value) || 0;
    const calculation = calculateWithdrawalFee(amount);
    
    document.getElementById('withdraw-gross').textContent = formatTON(calculation.gross) + ' TON';
    document.getElementById('withdraw-fee').textContent = formatTON(calculation.fee) + ' TON';
    document.getElementById('withdraw-net').textContent = formatTON(calculation.net) + ' TON';
    
    // Enable/disable confirm button
    const btn = document.getElementById('confirm-withdraw-btn');
    btn.disabled = amount < PLATFORM_SETTINGS.minWithdrawal || amount > currentUser.balance;
}

// Confirm withdrawal
document.getElementById('confirm-withdraw-btn').addEventListener('click', async () => {
    try {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const wallet = document.getElementById('withdraw-wallet').value;
        
        if (!isValidTONAddress(wallet)) {
            showToast('Invalid TON wallet address', 'error');
            return;
        }
        
        if (amount < PLATFORM_SETTINGS.minWithdrawal) {
            showToast(`Minimum withdrawal is ${PLATFORM_SETTINGS.minWithdrawal} TON`, 'error');
            return;
        }
        
        if (amount > currentUser.balance) {
            showToast('Insufficient balance', 'error');
            return;
        }
        
        const confirmed = await confirmDialog(`Withdraw ${formatTON(amount)} TON? You'll receive ${formatTON(amount * (1 - PLATFORM_SETTINGS.withdrawalFee))} TON after ${PLATFORM_SETTINGS.withdrawalFee * 100}% fee.`);
        
        if (!confirmed) return;
        
        showLoading(true);
        
        const withdrawal = await DatabaseService.createWithdrawalRequest(
            currentUser.telegram_id,
            amount,
            wallet
        );
        
        // Update local balance
        currentUser.balance -= amount;
        updateBalanceDisplay(currentUser.balance);
        
        showLoading(false);
        document.getElementById('withdraw-modal').classList.add('hidden');
        
        showSuccessMessage(
            'Withdrawal Requested!',
            `Your withdrawal of ${formatTON(amount)} TON is being processed. You'll receive ${formatTON(withdrawal.net_amount)} TON after fees.`
        );
        
    } catch (error) {
        showLoading(false);
        console.error('Withdrawal error:', error);
        handleError(error, error.message || 'Failed to process withdrawal');
    }
});

// Update wallet address
async function updateWalletAddress() {
    const address = prompt('Enter your TON wallet address:');
    
    if (!address) return;
    
    if (!isValidTONAddress(address)) {
        showToast('Invalid TON wallet address', 'error');
        return;
    }
    
    try {
        await db.collection('users').doc(currentUser.telegram_id).update({
            wallet_address: address
        });
        
        currentUser.wallet_address = address;
        showToast('Wallet address updated!', 'success');
        
        // Reload page
        navigateTo('wallet');
        
    } catch (error) {
        console.error('Update wallet error:', error);
        handleError(error, 'Failed to update wallet address');
    }
}

// Show success message
function showSuccessMessage(title, message) {
    const modal = document.getElementById('success-modal');
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-amount').textContent = '';
    
    modal.classList.remove('hidden');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 3000);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
