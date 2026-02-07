// Admin Panel Configuration

// Firebase Configuration (same as main app)
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Admin Credentials
const ADMIN_CREDENTIALS = {
    username: 'TRILLIONAIRE',
    password: 'Asdfghjkl@123'
};

// Current admin session
let currentAdmin = null;
let platformStats = null;

// Initialize Admin Auth
async function initAdminAuth() {
    try {
        await auth.signInAnonymously();
        return true;
    } catch (error) {
        console.error('Firebase auth error:', error);
        return false;
    }
}
