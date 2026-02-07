# AdTONX - Complete Deployment Guide

## 🎯 Project Overview

AdTONX is a complete Telegram Mini App that allows users to earn TON cryptocurrency by:
- Watching ads from 3 networks (Monetag, Adexium, Adsgram)
- Completing tasks
- Referring friends
- Withdrawing earnings to TON wallets

## 📁 Project Structure

```
adtonx-complete/
├── frontend/               # Telegram Mini App
│   ├── index.html         # Main HTML file
│   ├── styles.css         # All styles
│   ├── config.js          # Configuration
│   ├── firebase-init.js   # Firebase initialization
│   ├── utils.js           # Utility functions
│   ├── ad-networks.js     # Ad network integrations
│   ├── pages.js           # Page content
│   └── app.js             # Main application logic
│
├── bot/                   # Telegram Bot Backend
│   ├── index.js           # Bot main file
│   └── package.json       # Dependencies
│
├── admin/                 # Admin Panel
│   ├── index.html         # Admin UI
│   ├── admin-styles.css   # Admin styles
│   ├── admin-config.js    # Admin configuration
│   ├── admin-utils.js     # Admin utilities
│   ├── admin-pages.js     # Admin pages
│   └── admin.js           # Admin logic
│
└── firestore.rules        # Firebase Security Rules
```

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

Already done! Project ID: `adtonx-bot`

### Step 2: Enable Services

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `adtonx-bot`
3. Enable the following services:
   - **Authentication** → Anonymous sign-in
   - **Firestore Database** → Create database in production mode
   - **Hosting** (optional, for hosting frontend)

### Step 3: Deploy Security Rules

1. Go to Firestore Database → Rules
2. Copy content from `firestore.rules`
3. Paste and Publish

### Step 4: Initialize Collections

Run these commands in Firestore console to create initial documents:

**Collection: `settings` → Document ID: `platform_config`**
```json
{
  "withdrawalFee": 0.20,
  "minWithdrawal": 2,
  "minDeposit": 10,
  "dailyAdLimit": 3000,
  "adCooldown": 10,
  "tier1": {
    "limit": 400,
    "reward": 0.005,
    "bonus": 0.05
  },
  "tier2": {
    "limit": 1000,
    "reward": 0.007,
    "bonus": 0.08
  },
  "tier3": {
    "reward": 0.008
  },
  "cpmTarget": 10000,
  "cpmRewardPerClick": 0.0028,
  "cpmCompletionBonus": 0.25,
  "referralCommission": 0.10,
  "referralBonus": 0.005,
  "taskPricePerClick": 0.004,
  "leaderboardPool": 5,
  "leaderboardTop10": 2,
  "leaderboardNext90": 3,
  "updated_at": "2024-02-05T00:00:00Z"
}
```

**Collection: `admins` → Document ID: `trillionaire`**
```json
{
  "admin_id": "trillionaire",
  "username": "TRILLIONAIRE",
  "password": "Asdfghjkl@123",
  "isAdmin": true,
  "created_at": "2024-02-05T00:00:00Z",
  "last_login": "2024-02-05T00:00:00Z"
}
```

**Collection: `tasks` → Add sample tasks (optional)**
```json
{
  "task_id": "task_001",
  "creator_id": "admin",
  "title": "Join AdTONX Channel",
  "description": "Join our official Telegram channel",
  "type": "official",
  "link": "https://t.me/adtonx_official",
  "reward": 0.1,
  "clicks_required": 1,
  "clicks_done": 0,
  "status": "active",
  "created_at": "2024-02-05T00:00:00Z",
  "expires_at": null
}
```

## 🤖 Telegram Bot Setup

### Step 1: Install Dependencies

```bash
cd bot
npm install
```

### Step 2: Get Firebase Admin SDK Key

1. Go to Firebase Console → Project Settings
2. Service Accounts → Generate new private key
3. Save as `firebase-admin-key.json` in the `bot/` folder

### Step 3: Update WEBAPP_URL

Edit `bot/index.js` and replace:
```javascript
const WEBAPP_URL = 'https://yourdomain.com';
```

With your actual domain after deploying the frontend.

### Step 4: Deploy Bot

**Option A: Local/VPS**
```bash
cd bot
npm start
```

**Option B: Heroku**
```bash
heroku create adtonx-bot
git add .
git commit -m "Deploy bot"
git push heroku main
```

**Option C: Railway**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select bot folder
4. Add environment variables if needed
5. Deploy

**Option D: Render**
1. Go to render.com
2. New Web Service
3. Connect repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy

### Step 5: Set Webhook (Optional for production)

If deploying to a server with HTTPS, set webhook:
```bash
curl https://api.telegram.org/bot8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU/setWebhook?url=https://your-server.com/webhook
```

## 🌐 Frontend Deployment

### Option A: GitHub Pages

1. Create a new repository on GitHub
2. Upload all files from `frontend/` folder
3. Go to Settings → Pages
4. Select branch and folder
5. Save and get the URL

### Option B: Netlify

1. Go to netlify.com
2. New site from Git or drag & drop
3. Upload `frontend/` folder
4. Deploy
5. Get the URL

### Option C: Vercel

1. Go to vercel.com
2. Import project
3. Upload `frontend/` folder
4. Deploy
5. Get the URL

### Option D: Firebase Hosting

```bash
cd frontend
firebase init hosting
# Select adtonx-bot project
# Set public directory to current folder
# Configure as single-page app: Yes
firebase deploy --only hosting
```

## 🔗 Link Telegram Bot to Mini App

1. Open @BotFather on Telegram
2. Send `/setmenubutton`
3. Select your bot: @AdTONX_Bot
4. Send your deployed URL
5. Send button text: "🚀 Open AdTONX"

Alternatively:
```bash
curl -X POST "https://api.telegram.org/bot8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU/setChatMenuButton" \
-H "Content-Type: application/json" \
-d '{"menu_button": {"type": "web_app", "text": "🚀 Open AdTONX", "web_app": {"url": "https://your-deployed-url.com"}}}'
```

## 👨‍💼 Admin Panel Deployment

Deploy the `admin/` folder separately (same methods as frontend):

### Recommended: Deploy to separate subdomain
- Frontend: `app.adtonx.com`
- Admin: `admin.adtonx.com`

### Update admin-config.js

Make sure Firebase config matches the main project.

### Access Admin Panel

1. Go to your deployed admin URL
2. Login with:
   - Username: `TRILLIONAIRE`
   - Password: `Asdfghjkl@123`

## 🎨 Ad Network Integration

### Monetag Setup

Already configured! If you need to change:
1. Go to monetag.com
2. Get your site ID
3. Update `AD_NETWORKS.MONETAG.unitId` in `config.js`

### Adexium Setup

Already configured! If you need to change:
1. Contact Adexium support
2. Get your widget ID
3. Update `AD_NETWORKS.ADEXIUM.widgetId` in `config.js`

### Adsgram Setup

Already configured! If you need to change:
1. Contact Adsgram support
2. Get your block ID and CPM URL
3. Update `AD_NETWORKS.ADSGRAM` in `config.js`

## ✅ Testing Checklist

### Before Launch:

- [ ] Firebase project created and configured
- [ ] Firestore security rules deployed
- [ ] Initial collections and documents created
- [ ] Frontend deployed and accessible
- [ ] Telegram bot running
- [ ] Bot connected to Mini App
- [ ] Admin panel deployed and accessible
- [ ] Test user registration
- [ ] Test ad watching
- [ ] Test task completion
- [ ] Test referral system
- [ ] Test withdrawal request
- [ ] Test admin login
- [ ] Test admin functions

### Test Flow:

1. **New User Registration**
   - Open bot: `/start`
   - Click "Open AdTONX"
   - Verify user created in Firestore

2. **Watch Ad**
   - Go to Ads page
   - Click "Watch" on any network
   - Wait for timer
   - Verify balance updated

3. **Complete Task**
   - Go to Tasks page
   - Click "Start" on a task
   - Open link
   - Click "Verify Completion"
   - Verify reward received

4. **Referral**
   - Copy referral link from Profile
   - Share with another user
   - Verify referral bonus received

5. **Withdrawal**
   - Set wallet address in Profile
   - Go to Wallet
   - Request withdrawal (min 2 TON)
   - Check admin panel for pending withdrawal

6. **Admin Panel**
   - Login to admin panel
   - View dashboard statistics
   - Create a new task
   - Approve a withdrawal
   - Update platform settings

## 🔧 Troubleshooting

### "Firebase not defined" error
- Make sure Firebase CDN scripts are loaded before your scripts
- Check browser console for loading errors

### "Telegram WebApp not available"
- This is normal when testing outside Telegram
- The app will use mock data for testing
- Real functionality works only inside Telegram

### Ads not showing
- Ad networks may take time to approve your site
- Check ad network dashboards for status
- Verify script URLs are correct

### Bot not responding
- Check if bot is running
- Verify bot token is correct
- Check server logs for errors

### Withdrawal not working
- Verify wallet address format
- Check minimum balance (2 TON)
- Verify Firebase security rules allow writes

## 📊 Monitoring

### Daily Tasks:
1. Check pending withdrawals in admin panel
2. Review new user registrations
3. Monitor ad network earnings
4. Check for fraud/suspicious activity

### Weekly Tasks:
1. Calculate and distribute leaderboard rewards
2. Review platform metrics
3. Update platform settings if needed
4. Create new partner tasks

### Monthly Tasks:
1. Analyze user retention
2. Review withdrawal patterns
3. Optimize ad tier rewards
4. Plan marketing campaigns

## 🔒 Security Notes

1. **Never expose Firebase Admin SDK key** - Keep it server-side only
2. **Use environment variables** for sensitive data
3. **Enable 2FA** for admin accounts (future feature)
4. **Monitor for fraud** - Check for unusual patterns
5. **Regular backups** - Export Firestore data regularly
6. **Update dependencies** - Keep packages up to date

## 💡 Future Enhancements

- [ ] TON Connect wallet integration
- [ ] Automatic withdrawal processing
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Fraud detection system
- [ ] API for third-party integrations
- [ ] Mobile app version

## 📞 Support

For issues or questions:
- Email: support@adtonx.com
- Telegram: @AdTONX_Support
- GitHub: Open an issue

## 📄 License

Copyright © 2024 AdTONX. All rights reserved.

---

## 🚀 Quick Start Commands

```bash
# Deploy Frontend (Netlify)
cd frontend
netlify deploy --prod

# Start Bot
cd bot
npm install
npm start

# Deploy Admin
cd admin
netlify deploy --prod

# Deploy Security Rules
firebase deploy --only firestore:rules
```

---

**Ready to launch! 🎉**

Remember to:
1. Update all URLs with your actual domains
2. Test thoroughly before going live
3. Monitor the platform regularly
4. Keep Firebase security rules updated
5. Back up your database regularly

Good luck with your AdTONX platform! 💎
