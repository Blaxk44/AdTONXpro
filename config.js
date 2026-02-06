// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCToNn1VqYZrZjjbbBA2KW126ZBso-0D80",
    authDomain: "adtonx-bot.firebaseapp.com",
    databaseURL: "https://adtonx-bot-default-rtdb.firebaseio.com",
    projectId: "adtonx-bot",
    storageBucket: "adtonx-bot.firebasestorage.app",
    messagingSenderId: "290170776005",
    appId: "1:290170776005:web:82f88036aa42d080e2c3ac",
    measurementId: "G-6S0F9NY64F"
};

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU";
const BOT_USERNAME = "AdTONX_Bot";

// Ad Network Configuration
const AD_NETWORKS = {
    MONETAG: {
        unitId: "10551237",
        enabled: true
    },
    ADEXIUM: {
        widgetId: "593e85f5-6028-4ee2-bf80-f7729b16a482",
        enabled: true
    },
    ADSGRAM: {
        blockId: "int-22171",
        cpmUrl: "https://otieu.com/4/10551270",
        enabled: true
    }
};

// Platform Settings (Default values, will be overridden by Firestore)
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
