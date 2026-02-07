// Main Application with Advanced Loading System

let currentUser = null;
let currentPage = 'home';
let platformSettings = null;

// Loading System
const LoadingManager = {
    steps: [
        { name: 'init', label: 'Initializing...', progress: 0 },
        { name: 'telegram', label: 'Connecting to Telegram...', progress: 20 },
        { name: 'database', label: 'Loading database...', progress: 40 },
        { name: 'user', label: 'Getting user data...', progress: 60 },
        { name: 'settings', label: 'Loading settings...', progress: 80 },
        { name: 'complete', label: 'Ready!', progress: 100 }
    ],
    
    currentStep: 0,
    
    updateProgress(stepName, status = '') {
        const step = this.steps.find(s => s.name === stepName);
        if (!step) return;
        
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        const loadingStatus = document.getElementById('loading-status');
        
        if (progressBar) {
            progressBar.style.width = step.progress + '%';
        }
        
        if (loadingText) {
            loadingText.textContent = step.label;
        }
        
        if (loadingStatus && status) {
            loadingStatus.textContent = status;
        }
        
        this.currentStep = this.steps.indexOf(step);
    },
    
    setConnected() {
        const statusDot = document.getElementById('status-dot');
        const connectionStatus = document.getElementById('connection-status');
        
        if (statusDot) {
            statusDot.classList.add('connected');
        }
        
        if (connectionStatus) {
            connectionStatus.textContent = 'Connected to TON Network';
        }
    },
    
    async hide() {
        return new Promise((resolve) => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    resolve();
                }, 500);
            } else {
                resolve();
            }
        });
    }
};

// Initialize Application
async function initApp() {
    try {
        // Step 1: Initialize
        LoadingManager.updateProgress('init', 'Starting AdTONX...');
        await sleep(500);
        
        // Step 2: Get Telegram user data
        LoadingManager.updateProgress('telegram', 'Authenticating with Telegram...');
        const telegramUser = getTelegramUser();
        console.log('Telegram user:', telegramUser);
        await sleep(500);
        
        // Step 3: Connect to database
        LoadingManager.updateProgress('database', 'Establishing secure connection...');
        LoadingManager.setConnected();
        await sleep(500);
        
        // Step 4: Get or create user
        LoadingManager.updateProgress('user', 'Retrieving your account...');
        currentUser = await DatabaseService.getOrCreateUser(telegramUser);
        console.log('Current user:', currentUser);
        await sleep(500);
        
        // Step 5: Load platform settings
        LoadingManager.updateProgress('settings', 'Syncing latest settings...');
        platformSettings = await DatabaseService.getPlatformSettings();
        console.log('Platform settings loaded');
        await sleep(500);
        
        // Step 6: Complete
        LoadingManager.updateProgress('complete', 'Launching application...');
        await sleep(300);
        
        // Hide loading screen
        await LoadingManager.hide();
        
        // Show main app
        document.getElementById('app').classList.remove('hidden');
        
        // Update balance display
        updateBalanceDisplay(currentUser.balance);
        
        // Load home page
        navigateTo('home');
        
        // Setup navigation
        setupNavigation();
        
        // Setup modals
        setupModals();
        
        // Setup Telegram WebApp
        setupTelegramWebApp();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ App initialization error:', error);
        handleInitError(error);
    }
}

// Handle initialization errors
function handleInitError(error) {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    
    // Show error in loading screen
    loadingScreen.innerHTML = `
        <div class="blockchain-container">
            <div class="error-icon" style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
            <h2 style="color: #ff4444; margin-bottom: 10px;">Connection Error</h2>
            <p style="color: var(--text-secondary); margin-bottom: 30px;">
                ${error.message || ERROR_MESSAGES.UNKNOWN_ERROR}
            </p>
            <button class="btn btn-primary" onclick="location.reload()">
                Retry
            </button>
            <p style="color: var(--text-muted); font-size: 12px; margin-top: 20px;">
                If the problem persists, contact support
            </p>
        </div>
    `;
}

// Setup Telegram WebApp
function setupTelegramWebApp() {
    if (!isTelegramWebApp()) return;
    
    const webApp = window.Telegram.WebApp;
    
    // Expand to fullscreen
    webApp.expand();
    
    // Set header color
    webApp.setHeaderColor('#0a0e27');
    
    // Set background color
    webApp.setBackgroundColor('#0a0e27');
    
    // Enable closing confirmation
    webApp.enableClosingConfirmation();
    
    // Setup back button
    webApp.BackButton.onClick(() => {
        if (currentPage !== 'home') {
            navigateTo('home');
        }
    });
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
async function navigateTo(page) {
    try {
        // Update current page
        currentPage = page;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Show/hide Telegram back button
        if (isTelegramWebApp()) {
            const webApp = window.Telegram.WebApp;
            if (page === 'home') {
                webApp.BackButton.hide();
            } else {
                webApp.BackButton.show();
            }
        }
        
        // Load page content
        const contentArea = document.getElementById('content-area');
        
        if (Pages[page]) {
            // Show loading state
            contentArea.innerHTML = '<div class="loading-state" style="text-align: center; padding: 60px 20px;"><div class="spinner" style="margin: 0 auto 20px;"></div><p>Loading...</p></div>';
            
            // Load page content
            const content = await Pages[page]();
            contentArea.innerHTML = content;
            
            // Load page-specific data
            await loadPageData(page);
        } else {
            contentArea.innerHTML = '<div class="card"><p>Page not found</p></div>';
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Navigation error:', error);
        showToast('Failed to load page', 'error');
    }
}

// Load page-specific data
async function loadPageData(page) {
    try {
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
    } catch (error) {
        console.error('Error loading page data:', error);
    }
}

// Setup modals
function setupModals() {
    // Withdrawal amount change handler
    const withdrawAmount = document.getElementById('withdraw-amount');
    if (withdrawAmount) {
        withdrawAmount.addEventListener('input', updateWithdrawSummary);
    }
    
    // Confirm withdrawal button
    const confirmWithdrawBtn = document.getElementById('confirm-withdraw-btn');
    if (confirmWithdrawBtn) {
        confirmWithdrawBtn.addEventListener('click', handleWithdrawal);
    }
}

// Modal close functions
function closeAdModal() {
    document.getElementById('ad-modal').classList.add('hidden');
}

function closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.add('hidden');
}

function closeWithdrawModal() {
    document.getElementById('withdraw-modal').classList.add('hidden');
}

// Update balance display
function updateBalanceDisplay(balance) {
    const balanceElements = document.querySelectorAll('#header-balance, .balance-main');
    balanceElements.forEach(el => {
        if (el) {
            animateNumber(el, parseFloat(el.textContent) || 0, balance);
        }
    });
}

// Sleep helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Withdrawal handling
async function handleWithdrawal() {
    try {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const wallet = document.getElementById('withdraw-wallet').value;
        
        if (!isValidTONAddress(wallet)) {
            showToast(ERROR_MESSAGES.INVALID_WALLET, 'error');
            return;
        }
        
        if (amount < platformSettings.minWithdrawal) {
            showToast(ERROR_MESSAGES.WITHDRAWAL_MIN, 'error');
            return;
        }
        
        if (amount > currentUser.balance) {
            showToast(ERROR_MESSAGES.INSUFFICIENT_BALANCE, 'error');
            return;
        }
        
        const confirmed = await confirmAction(`Withdraw ${formatTON(amount)} TON? You'll receive ${formatTON(amount * (1 - platformSettings.withdrawalFee))} TON after ${platformSettings.withdrawalFee * 100}% fee.`);
        
        if (!confirmed) return;
        
        showLoading(true);
        
        const result = await DatabaseService.createWithdrawalRequest(
            currentUser.telegram_id,
            amount,
            wallet
        );
        
        // Update local balance
        currentUser.balance -= amount;
        updateBalanceDisplay(currentUser.balance);
        
        showLoading(false);
        closeWithdrawModal();
        
        showSuccessMessage(
            'Withdrawal Requested!',
            `Your withdrawal is being processed. You'll receive ${formatTON(result.net_amount)} TON.`
        );
        
    } catch (error) {
        showLoading(false);
        console.error('Withdrawal error:', error);
        showToast(error.message || ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
    }
}

// Update withdrawal summary
function updateWithdrawSummary() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value) || 0;
    const calculation = calculateWithdrawalFee(amount);
    
    document.getElementById('withdraw-gross').textContent = formatTON(calculation.gross) + ' TON';
    document.getElementById('withdraw-fee').textContent = formatTON(calculation.fee) + ' TON';
    document.getElementById('withdraw-net').textContent = formatTON(calculation.net) + ' TON';
    
    const btn = document.getElementById('confirm-withdraw-btn');
    btn.disabled = amount < platformSettings.minWithdrawal || amount > currentUser.balance;
}

// Show success message
function showSuccessMessage(title, message, amount = null) {
    const modal = document.getElementById('success-modal');
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    
    const amountEl = document.getElementById('success-amount');
    if (amount) {
        amountEl.textContent = amount;
        amountEl.style.display = 'block';
    } else {
        amountEl.style.display = 'none';
    }
    
    modal.classList.remove('hidden');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', (e) => {
    if (isTelegramWebApp()) {
        e.preventDefault();
    }
});
