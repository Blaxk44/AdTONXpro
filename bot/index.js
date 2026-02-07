const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://adtonx-bot-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Initialize bot
const BOT_TOKEN = '8356591705:AAGUlcADugoR3u77EiAY67C8XSyZGU89PcU';
const WEBAPP_URL = 'https://yourdomain.com'; // Replace with your actual domain

const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.start(async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const username = ctx.from.username || '';
        const firstName = ctx.from.first_name || '';
        const lastName = ctx.from.last_name || '';
        
        // Get referral parameter
        const startParam = ctx.startPayload;
        let referrerId = null;
        
        if (startParam && startParam.startsWith('ref_')) {
            referrerId = startParam;
        }
        
        // Check if user exists
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Create new user
            const newUser = {
                telegram_id: userId,
                username: username,
                first_name: firstName,
                last_name: lastName,
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
                referred_by: referrerId,
                status: 'active',
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
                last_ad_watched: null,
                daily_ad_count: 0,
                last_reset_date: new Date().toISOString().split('T')[0]
            };
            
            await userRef.set(newUser);
            
            // Process referral bonus
            if (referrerId) {
                const actualReferrerId = referrerId.replace('ref_', '');
                const referrerRef = db.collection('users').doc(actualReferrerId);
                const referrerDoc = await referrerRef.get();
                
                if (referrerDoc.exists) {
                    const bonus = 0.005; // Referral bonus
                    
                    await referrerRef.update({
                        referral_count: admin.firestore.FieldValue.increment(1),
                        balance: admin.firestore.FieldValue.increment(bonus),
                        total_earned: admin.firestore.FieldValue.increment(bonus)
                    });
                    
                    // Send notification to referrer
                    try {
                        await ctx.telegram.sendMessage(
                            actualReferrerId,
                            `🎉 New referral! ${firstName} joined using your link. You earned ${bonus} TON bonus!`
                        );
                    } catch (e) {
                        console.log('Could not notify referrer:', e.message);
                    }
                }
            }
            
            // Welcome message for new users
            await ctx.reply(
                `🎉 Welcome to AdTONX, ${firstName}!\n\n` +
                `💎 Start earning TON cryptocurrency by:\n` +
                `• Watching ads (up to 3000/day)\n` +
                `• Completing simple tasks\n` +
                `• Referring friends (10% commission)\n\n` +
                `🚀 Click the button below to start earning!`,
                Markup.keyboard([
                    [Markup.button.webApp('🚀 Open AdTONX', WEBAPP_URL)]
                ]).resize()
            );
        } else {
            // Existing user
            await userRef.update({
                last_active: new Date().toISOString()
            });
            
            const userData = userDoc.data();
            
            await ctx.reply(
                `👋 Welcome back, ${firstName}!\n\n` +
                `💰 Your balance: ${userData.balance.toFixed(4)} TON\n` +
                `📺 Ads watched: ${userData.ads_watched}\n` +
                `✅ Tasks completed: ${userData.tasks_completed}\n\n` +
                `🚀 Continue earning by opening the app!`,
                Markup.keyboard([
                    [Markup.button.webApp('🚀 Open AdTONX', WEBAPP_URL)]
                ]).resize()
            );
        }
        
    } catch (error) {
        console.error('Start command error:', error);
        await ctx.reply('❌ An error occurred. Please try again later.');
    }
});

// Help command
bot.help((ctx) => {
    ctx.reply(
        `ℹ️ *AdTONX Help*\n\n` +
        `*How to Earn:*\n` +
        `1️⃣ Watch ads from 3 networks\n` +
        `2️⃣ Complete simple tasks\n` +
        `3️⃣ Refer friends for commission\n\n` +
        `*Rewards:*\n` +
        `• Tier 1 (0-400 ads): 0.005 TON/ad\n` +
        `• Tier 2 (401-1000 ads): 0.007 TON/ad\n` +
        `• Tier 3 (1000+ ads): 0.008 TON/ad\n\n` +
        `*Withdrawal:*\n` +
        `• Minimum: 2 TON\n` +
        `• Fee: 20%\n\n` +
        `*Support:* Contact @AdTONX_Support`,
        { parse_mode: 'Markdown' }
    );
});

// Stats command
bot.command('stats', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return ctx.reply('❌ User not found. Use /start to register.');
        }
        
        const user = userDoc.data();
        
        await ctx.reply(
            `📊 *Your Statistics*\n\n` +
            `💰 Balance: ${user.balance.toFixed(4)} TON\n` +
            `💎 Total Earned: ${user.total_earned.toFixed(4)} TON\n` +
            `📅 Today's Earnings: ${user.today_earnings.toFixed(4)} TON\n\n` +
            `📺 Ads Watched: ${user.ads_watched}\n` +
            `├─ Monetag: ${user.ads_monetag}\n` +
            `├─ Adexium: ${user.ads_adexium}\n` +
            `└─ Adsgram: ${user.ads_adsgram}\n\n` +
            `✅ Tasks Completed: ${user.tasks_completed}\n` +
            `🤝 Referrals: ${user.referral_count}\n` +
            `💰 Referral Earnings: ${user.referral_earnings.toFixed(4)} TON`,
            { parse_mode: 'Markdown' }
        );
        
    } catch (error) {
        console.error('Stats command error:', error);
        await ctx.reply('❌ Failed to fetch statistics.');
    }
});

// Referral command
bot.command('referral', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return ctx.reply('❌ User not found. Use /start to register.');
        }
        
        const user = userDoc.data();
        const referralLink = `https://t.me/AdTONX_Bot?start=ref_${userId}`;
        
        await ctx.reply(
            `🤝 *Your Referral Program*\n\n` +
            `Earn 10% commission from all your referrals' earnings!\n` +
            `Plus: 0.005 TON bonus for each active referral\n\n` +
            `👥 Total Referrals: ${user.referral_count}\n` +
            `💰 Referral Earnings: ${user.referral_earnings.toFixed(4)} TON\n\n` +
            `🔗 *Your Referral Link:*\n` +
            `\`${referralLink}\`\n\n` +
            `Share this link with friends to start earning!`,
            { parse_mode: 'Markdown' }
        );
        
    } catch (error) {
        console.error('Referral command error:', error);
        await ctx.reply('❌ Failed to fetch referral info.');
    }
});

// Balance command
bot.command('balance', async (ctx) => {
    try {
        const userId = ctx.from.id.toString();
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return ctx.reply('❌ User not found. Use /start to register.');
        }
        
        const user = userDoc.data();
        
        await ctx.reply(
            `💰 *Your Balance*\n\n` +
            `Current Balance: ${user.balance.toFixed(4)} TON\n` +
            `Total Earned: ${user.total_earned.toFixed(4)} TON\n` +
            `Today's Earnings: ${user.today_earnings.toFixed(4)} TON\n\n` +
            `${user.balance >= 2 ? '✅ You can withdraw!' : '❌ Minimum 2 TON required to withdraw'}`,
            { parse_mode: 'Markdown' }
        );
        
    } catch (error) {
        console.error('Balance command error:', error);
        await ctx.reply('❌ Failed to fetch balance.');
    }
});

// Error handler
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An unexpected error occurred. Please try again.');
});

// Launch bot
bot.launch().then(() => {
    console.log('✅ AdTONX Bot is running!');
}).catch((error) => {
    console.error('Failed to start bot:', error);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
