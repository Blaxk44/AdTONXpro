import express from "express";
import TelegramBot from "node-telegram-bot-api";

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on("message", msg => {
  bot.sendMessage(msg.chat.id, "AdTONX Bot is live 🚀");
});

app.get("/", (_, res) => res.send("Backend OK"));

app.listen(3000, () => console.log("Server running"));            await userRef.update({
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
