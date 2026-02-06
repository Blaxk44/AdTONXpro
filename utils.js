// Utility Functions

// Format TON amount
function formatTON(amount) {
    return parseFloat(amount).toFixed(4);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .toast-success {
            background: #4caf50;
        }
        
        .toast-error {
            background: #f44336;
        }
        
        .toast-warning {
            background: #ff9800;
        }
        
        .toast-info {
            background: #0088cc;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
    `;
    
    if (!document.querySelector('#toast-styles')) {
        style.id = 'toast-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Failed to copy', 'error');
        return false;
    }
}

// Calculate withdrawal fee
function calculateWithdrawalFee(amount) {
    const fee = amount * PLATFORM_SETTINGS.withdrawalFee;
    const net = amount - fee;
    
    return {
        gross: amount,
        fee: fee,
        net: net
    };
}

// Get ad reward based on tier
function getAdReward(adsWatched) {
    if (adsWatched < PLATFORM_SETTINGS.tier1.limit) {
        return PLATFORM_SETTINGS.tier1.reward;
    } else if (adsWatched < PLATFORM_SETTINGS.tier2.limit) {
        return PLATFORM_SETTINGS.tier2.reward;
    } else {
        return PLATFORM_SETTINGS.tier3.reward;
    }
}

// Check if cooldown is active
function checkAdCooldown(lastAdTime) {
    if (!lastAdTime) return false;
    
    const now = new Date();
    const lastAd = new Date(lastAdTime);
    const diff = (now - lastAd) / 1000;
    
    return diff < PLATFORM_SETTINGS.adCooldown;
}

// Get remaining cooldown time
function getRemainingCooldown(lastAdTime) {
    if (!lastAdTime) return 0;
    
    const now = new Date();
    const lastAd = new Date(lastAdTime);
    const diff = (now - lastAd) / 1000;
    const remaining = PLATFORM_SETTINGS.adCooldown - diff;
    
    return Math.max(0, Math.ceil(remaining));
}

// Validate TON wallet address
function isValidTONAddress(address) {
    // Basic validation for TON address
    if (!address || typeof address !== 'string') return false;
    
    // TON addresses typically start with UQ, EQ, or kQ and are 48 characters long
    const tonRegex = /^[UEk]Q[A-Za-z0-9_-]{46}$/;
    return tonRegex.test(address);
}

// Update balance display
function updateBalanceDisplay(balance) {
    const balanceElements = document.querySelectorAll('#header-balance, .balance-main');
    balanceElements.forEach(el => {
        if (el) {
            el.textContent = formatTON(balance);
        }
    });
}

// Generate referral link
function generateReferralLink(userId) {
    return `https://t.me/${BOT_USERNAME}?start=ref_${userId}`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if user is in Telegram
function isTelegramWebApp() {
    return window.Telegram && window.Telegram.WebApp;
}

// Get Telegram user data
function getTelegramUser() {
    if (!isTelegramWebApp()) {
        // For testing outside Telegram
        return {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            start_param: null
        };
    }
    
    const webApp = window.Telegram.WebApp;
    webApp.expand();
    
    const initData = webApp.initDataUnsafe;
    if (!initData || !initData.user) {
        throw new Error('Unable to get Telegram user data');
    }
    
    return {
        id: initData.user.id,
        first_name: initData.user.first_name,
        last_name: initData.user.last_name || '',
        username: initData.user.username || '',
        start_param: initData.start_param || null
    };
}

// Show loading
function showLoading(show = true) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.toggle('hidden', !show);
    }
}

// Animate number counting
function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = formatTON(current);
    }, 16);
}

// Local storage helpers
const LocalStorage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage set error:', error);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('LocalStorage get error:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('LocalStorage remove error:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('LocalStorage clear error:', error);
            return false;
        }
    }
};

// Error handler
function handleError(error, userMessage = 'An error occurred') {
    console.error('Error:', error);
    showToast(userMessage, 'error');
}

// Confirm dialog
function confirmDialog(message) {
    return new Promise((resolve) => {
        if (isTelegramWebApp()) {
            window.Telegram.WebApp.showConfirm(message, (confirmed) => {
                resolve(confirmed);
            });
        } else {
            resolve(confirm(message));
        }
    });
}

// Alert dialog
function alertDialog(message) {
    if (isTelegramWebApp()) {
        window.Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}
