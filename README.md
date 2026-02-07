# 💎 AdTONX - Complete TON Earning Platform

A fully functional Telegram Mini App that allows users to earn TON cryptocurrency through ads, tasks, and referrals.

## 🌟 Features

### For Users:
- ✅ **Watch Ads** - Earn TON from 3 integrated ad networks (Monetag, Adexium, Adsgram)
- ✅ **Tiered Rewards** - Higher earnings as you watch more ads
- ✅ **Complete Tasks** - Extra rewards for simple social media tasks
- ✅ **Referral System** - 10% commission + bonuses
- ✅ **Secure Withdrawals** - Direct to TON wallets
- ✅ **Leaderboard** - Weekly competitions with TON prizes
- ✅ **Real-time Balance** - Live updates via Firebase

### For Admins:
- ✅ **Complete Dashboard** - Monitor all platform metrics
- ✅ **User Management** - View, ban, adjust balances
- ✅ **Task Creation** - Create official and partner tasks
- ✅ **Withdrawal Approval** - Manual/auto processing
- ✅ **Settings Control** - Adjust fees, limits, rewards
- ✅ **Transaction Logs** - Full audit trail
- ✅ **Ad Network Toggle** - Enable/disable networks

## 📦 What's Included

This is a **COMPLETE, WORKING** system with:

1. **Telegram Mini App** (HTML/CSS/JavaScript)
   - Fully responsive UI
   - Real Firebase integration
   - 3 ad networks integrated
   - Complete reward system
   - Withdrawal functionality

2. **Telegram Bot** (Node.js)
   - User registration
   - Referral tracking
   - Balance notifications
   - Statistics commands
   - WebApp integration

3. **Admin Panel** (Web Application)
   - Professional dashboard
   - User management
   - Withdrawal processing
   - Task management
   - Platform settings

4. **Firebase Backend**
   - Firestore database
   - Security rules
   - Real-time updates
   - Transaction logging

## 🚀 Quick Start

### Prerequisites
- Firebase account
- Telegram Bot Token (provided: @AdTONX_Bot)
- Node.js installed (for bot)
- Web hosting (Netlify, Vercel, or GitHub Pages)

### 1. Firebase Setup (5 minutes)

```bash
# Go to Firebase Console
# Project already created: adtonx-bot

# Enable:
1. Authentication → Anonymous
2. Firestore Database → Production mode
3. Deploy security rules from firestore.rules
4. Create initial collections (see DEPLOYMENT.md)
```

### 2. Deploy Frontend (2 minutes)

**Option A: Netlify (Recommended)**
```bash
cd frontend
# Drag & drop to netlify.com
# Or use CLI:
netlify deploy --prod
```

**Option B: Vercel**
```bash
cd frontend
vercel --prod
```

**Option C: GitHub Pages**
```bash
# Push to GitHub
# Enable Pages in repo settings
```

### 3. Setup Telegram Bot (3 minutes)

```bash
cd bot
npm install

# Get Firebase Admin SDK key from console
# Save as firebase-admin-key.json

# Update WEBAPP_URL in index.js with your deployed URL

# Start bot
npm start
```

### 4. Link Bot to Mini App

```bash
# Option 1: Using BotFather
@BotFather → /setmenubutton → Select bot → Enter URL

# Option 2: Using API
curl -X POST "https://api.telegram.org/bot8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU/setChatMenuButton" \
-H "Content-Type: application/json" \
-d '{"menu_button": {"type": "web_app", "text": "🚀 Open AdTONX", "web_app": {"url": "YOUR_URL"}}}'
```

### 5. Deploy Admin Panel (2 minutes)

```bash
cd admin
# Deploy same way as frontend
# Access at your-admin-url.com
# Login: TRILLIONAIRE / Asdfghjkl@123
```

## 📱 Usage

### For End Users:

1. Open Telegram
2. Find @AdTONX_Bot
3. Send `/start`
4. Click "🚀 Open AdTONX"
5. Watch ads and earn TON!

### For Admins:

1. Go to admin panel URL
2. Login with credentials
3. Monitor platform
4. Approve withdrawals
5. Create tasks
6. Adjust settings

## 🔧 Configuration

### Platform Settings

Edit in Firestore or Admin Panel:

```javascript
{
  withdrawalFee: 0.20,        // 20% fee
  minWithdrawal: 2,           // Minimum 2 TON
  dailyAdLimit: 3000,         // Max ads per day
  adCooldown: 10,             // Seconds between ads
  
  // Reward tiers
  tier1: { limit: 400, reward: 0.005, bonus: 0.05 },
  tier2: { limit: 1000, reward: 0.007, bonus: 0.08 },
  tier3: { reward: 0.008 },
  
  // Referral settings
  referralCommission: 0.10,    // 10% commission
  referralBonus: 0.005,        // Bonus per referral
}
```

### Ad Networks

Already configured in `config.js`:

- **Monetag**: Unit ID 10551237
- **Adexium**: Widget ID 593e85f5-6028-4ee2-bf80-f7729b16a482
- **Adsgram**: Block ID int-22171

## 📊 Revenue Model

### Income Sources:
1. **Ad Networks** - CPM/CPC earnings from Monetag, Adexium, Adsgram
2. **Withdrawal Fees** - 20% fee on all withdrawals
3. **User-Paid Tasks** - Platform margin on sponsored tasks

### Cost Structure:
1. **User Rewards** - 80% of ad revenue distributed
2. **Referral Commissions** - 10% of referral earnings
3. **Leaderboard Prizes** - 5 TON weekly pool
4. **Infrastructure** - Firebase, hosting, bot server

## 🔐 Security Features

- ✅ Firebase security rules implemented
- ✅ Telegram WebApp data validation
- ✅ Anti-fraud measures (cooldowns, limits)
- ✅ Admin authentication
- ✅ Withdrawal approval system
- ✅ Transaction logging
- ✅ IP/device fingerprinting ready

## 📈 Monitoring & Analytics

### Key Metrics (Available in Admin Dashboard):
- Total Users / Active Users
- Total Ads Watched
- Platform Revenue
- User Rewards Paid
- Withdrawal Statistics
- Network Performance
- Referral Conversion Rates

## 🛠️ Tech Stack

### Frontend:
- Pure HTML/CSS/JavaScript (no frameworks)
- Firebase Web SDK
- Telegram WebApp SDK
- Responsive design

### Backend:
- Node.js + Telegraf
- Firebase Admin SDK
- Firestore Database

### Admin:
- Vanilla JavaScript
- Firebase Integration
- Real-time updates

## 📝 API Endpoints (Bot Commands)

- `/start` - Register and launch app
- `/help` - Show help information
- `/stats` - View user statistics
- `/balance` - Check current balance
- `/referral` - Get referral link

## 🎯 Roadmap

### Phase 1 (Current):
- [x] Core earning features
- [x] 3 ad networks integrated
- [x] Referral system
- [x] Basic admin panel
- [x] Withdrawal system

### Phase 2 (Next):
- [ ] TON Connect integration
- [ ] Automatic withdrawal processing
- [ ] Advanced fraud detection
- [ ] Push notifications
- [ ] Multi-language support

### Phase 3 (Future):
- [ ] Mobile native app
- [ ] Additional ad networks
- [ ] API for third-parties
- [ ] Advanced analytics
- [ ] Gamification features

## 📞 Support & Contact

- **Telegram Bot**: @AdTONX_Bot
- **Support Channel**: @AdTONX_Support (create this)
- **Developer**: TRILLIONAIRE

## 📄 License

Copyright © 2024 AdTONX. All rights reserved.

This is a complete, production-ready system. All code is original and functional.

## 🎉 Credits

- **Ad Networks**: Monetag, Adexium, Adsgram
- **Blockchain**: TON (The Open Network)
- **Database**: Google Firebase
- **Bot Framework**: Telegraf

## ⚠️ Important Notes

1. **Test thoroughly** before launching to real users
2. **Monitor daily** for fraud and issues
3. **Keep credentials secure** - never commit to GitHub
4. **Backup database** regularly
5. **Update ad network settings** based on actual earnings
6. **Comply with** Telegram and TON policies
7. **Have reserve TON** for withdrawals

## 🚀 Launch Checklist

- [ ] Firebase project configured
- [ ] Security rules deployed
- [ ] Initial data seeded
- [ ] Frontend deployed
- [ ] Bot running 24/7
- [ ] Admin panel accessible
- [ ] Test user flow completed
- [ ] Ad networks approved site
- [ ] Reserve TON wallet funded
- [ ] Support channel created
- [ ] Marketing materials ready

## 💡 Pro Tips

1. **Start with lower rewards** and increase based on revenue
2. **Monitor ad network earnings** vs user payouts closely
3. **Build reserves** before enabling auto-withdrawals
4. **Create engaging tasks** to retain users
5. **Run referral campaigns** for growth
6. **Analyze user patterns** weekly
7. **Keep withdrawal fees** at 20-30% for sustainability

---

## 📦 File Structure

```
adtonx-complete/
├── frontend/               # User-facing Mini App
│   ├── index.html
│   ├── styles.css
│   ├── config.js
│   ├── firebase-init.js
│   ├── utils.js
│   ├── ad-networks.js
│   ├── pages.js
│   └── app.js
│
├── bot/                   # Telegram Bot
│   ├── index.js
│   ├── package.json
│   └── firebase-admin-key.json (you create this)
│
├── admin/                 # Admin Panel
│   ├── index.html
│   ├── admin-styles.css
│   ├── admin-config.js
│   ├── admin-utils.js
│   ├── admin-pages.js
│   └── admin.js
│
├── firestore.rules        # Security Rules
├── DEPLOYMENT.md          # Detailed deployment guide
└── README.md             # This file
```

---

**🎊 Congratulations! You now have a complete, working TON earning platform!**

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Ready to earn TON? Let's go! 💎🚀**
