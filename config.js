// Configuration for AdTONX with Neon Database

// Backend API Configuration (Netlify Functions)
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8888/.netlify/functions'
    : '/.netlify/functions';

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU";
const BOT_USERNAME = "AdTONX_Bot";

// Ad Network Configuration
const AD_NETWORKS = {
    MONETAG: {
        unitId: "10551237",
        enabled: true,
        name: "Monetag"
    },
    ADEXIUM: {
        widgetId: "593e85f5-6028-4ee2-bf80-f7729b16a482",
        enabled: true,
        name: "Adexium"
    },
    ADSGRAM: {
        blockId: "int-22171",
        cpmUrl: "https://otieu.com/4/10551270",
        enabled: true,
        name: "Adsgram"
    }
};

// Platform Settings (Default values, will be fetched from database)
const PLATFORM_SETTINGS = {
    // Withdrawal Settings
    withdrawalFee: 0.20, // 20%
    minWithdrawal: 2, // TON
    minDeposit: 10, // TON
    
    // Ad Settings
    dailyAdLimit: 3000,
    adCooldown: 10, // seconds
    
    // Tier Rewards
    tier1: {
        limit: 400,
        reward: 0.005,
        bonus: 0.05
    },
    tier2: {
        limit: 1000, // 400 + 600
        reward: 0.007,
        bonus: 0.08
    },
    tier3: {
        reward: 0.008
    },
    
    // CPM Settings
    cpmTarget: 10000,
    cpmRewardPerClick: 0.0028,
    cpmCompletionBonus: 0.25,
    
    // Referral Settings
    referralCommission: 0.10, // 10%
    referralBonus: 0.005,
    
    // Task Settings
    taskPricePerClick: 0.004, // 1 TON = 250 clicks
    
    // Leaderboard Settings
    leaderboardPool: 5, // TON
    leaderboardTop10: 2, // TON
    leaderboardNext90: 3 // TON
};

// Admin Credentials
const ADMIN_USERNAME = "TRILLIONAIRE";
const ADMIN_PASSWORD = "Asdfghjkl@123";

// Error Messages
const ERROR_MESSAGES = {
    NETWORK_ERROR: "Network connection error. Please check your internet.",
    DATABASE_ERROR: "Database error. Please try again later.",
    AUTH_ERROR: "Authentication failed. Please try again.",
    INSUFFICIENT_BALANCE: "Insufficient balance.",
    DAILY_LIMIT_REACHED: "Daily ad limit reached. Come back tomorrow!",
    COOLDOWN_ACTIVE: "Please wait before watching another ad.",
    INVALID_WALLET: "Invalid TON wallet address.",
    WITHDRAWAL_MIN: "Minimum withdrawal amount is 2 TON.",
    TASK_COMPLETED: "You have already completed this task.",
    UNKNOWN_ERROR: "An unexpected error occurred."
};

// Success Messages
const SUCCESS_MESSAGES = {
    AD_WATCHED: "Successfully earned TON!",
    TASK_COMPLETED: "Task completed successfully!",
    WITHDRAWAL_REQUESTED: "Withdrawal request submitted!",
    SETTINGS_SAVED: "Settings saved successfully!",
    PROFILE_UPDATED: "Profile updated successfully!"
};
