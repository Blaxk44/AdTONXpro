// Main Admin Application

let currentAdminPage = 'dashboard';

// Initialize Admin Panel
async function initAdmin() {
    // Show login screen
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    
    // Setup login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Initialize Firebase Auth
    await initAdminAuth();
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        // Verify credentials
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Check admin in database
            const adminDoc = await db.collection('admins').doc('trillionaire').get();
            
            if (adminDoc.exists) {
                currentAdmin = adminDoc.data();
                
                // Update last login
                await db.collection('admins').doc('trillionaire').update({
                    last_login: new Date().toISOString()
                });
                
                // Hide login, show dashboard
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('admin-dashboard').classList.remove('hidden');
                
                // Setup admin dashboard
                setupAdminDashboard();
                
                // Load dashboard
                navigateToAdminPage('dashboard');
                
                showToast('Login successful!', 'success');
            } else {
                throw new Error('Admin account not found');
            }
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
        errorDiv.classList.remove('hidden');
    }
}

// Setup Admin Dashboard
function setupAdminDashboard() {
    // Setup navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToAdminPage(page);
        });
    });
}

// Navigate to admin page
async function navigateToAdminPage(page) {
    currentAdminPage = page;
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'users': 'Users Management',
        'ads': 'Ads Management',
        'tasks': 'Tasks Management',
        'withdrawals': 'Withdrawals',
        'transactions': 'Transactions',
        'settings': 'Platform Settings'
    };
    
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    
    // Load page content
    const contentArea = document.getElementById('content-area');
    
    if (AdminPages[page]) {
        contentArea.innerHTML = await AdminPages[page]();
        loadAdminPageData(page);
    }
}

// Load page-specific data
async function loadAdminPageData(page) {
    switch (page) {
        case 'dashboard':
            await loadRecentActivity();
            break;
        case 'users':
            await loadUsersTable();
            setupUserSearch();
            break;
        case 'tasks':
            await loadTasksTable();
            break;
        case 'withdrawals':
            await loadWithdrawalsTable();
            break;
        case 'transactions':
            await loadTransactionsTable();
            setupTransactionFilter();
            break;
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const txSnapshot = await db.collection('transactions')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        
        txSnapshot.forEach(doc => {
            const tx = doc.data();
            html += `
                <div style="padding: 12px; background: var(--light); border-radius: 8px; display: flex; justify-content: space-between;">
                    <div>
                        <strong>${tx.description}</strong><br>
                        <small>User: ${tx.user_id} | ${formatDate(tx.timestamp)}</small>
                    </div>
                    <div style="font-weight: bold; color: ${tx.amount > 0 ? 'var(--success)' : 'var(--danger)'};">
                        ${tx.amount > 0 ? '+' : ''}${formatTON(tx.amount)} TON
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        document.getElementById('recent-activity').innerHTML = html;
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

// Load users table
async function loadUsersTable() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('created_at', 'desc')
            .limit(100)
            .get();
        
        let html = '<table class="data-table"><thead><tr>' +
            '<th>User ID</th><th>Username</th><th>Balance</th><th>Total Earned</th>' +
            '<th>Ads Watched</th><th>Status</th><th>Actions</th>' +
            '</tr></thead><tbody>';
        
        snapshot.forEach(doc => {
            const user = doc.data();
            html += `
                <tr>
                    <td>${user.telegram_id}</td>
                    <td>@${user.username || 'N/A'}</td>
                    <td>${formatTON(user.balance)} TON</td>
                    <td>${formatTON(user.total_earned)} TON</td>
                    <td>${formatNumber(user.ads_watched)}</td>
                    <td><span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">${user.status}</span></td>
                    <td>
                        <button class="btn btn-small btn-primary" onclick="viewUserDetail('${user.telegram_id}')">View</button>
                        <button class="btn btn-small btn-danger" onclick="banUser('${user.telegram_id}')">Ban</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        document.getElementById('users-table').innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load tasks table
async function loadTasksTable() {
    try {
        const snapshot = await db.collection('tasks').get();
        
        let html = '<table class="data-table"><thead><tr>' +
            '<th>Title</th><th>Type</th><th>Reward</th><th>Clicks</th><th>Status</th><th>Actions</th>' +
            '</tr></thead><tbody>';
        
        snapshot.forEach(doc => {
            const task = doc.data();
            html += `
                <tr>
                    <td>${task.title}</td>
                    <td><span class="badge badge-info">${task.type}</span></td>
                    <td>${formatTON(task.reward)} TON</td>
                    <td>${task.clicks_done}/${task.clicks_required}</td>
                    <td><span class="badge badge-${task.status === 'active' ? 'success' : 'warning'}">${task.status}</span></td>
                    <td>
                        <button class="btn btn-small btn-danger" onclick="deleteTask('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        document.getElementById('tasks-table').innerHTML = html;
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Load withdrawals table
async function loadWithdrawalsTable() {
    try {
        const snapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .orderBy('requested_at', 'desc')
            .get();
        
        let html = '<table class="data-table"><thead><tr>' +
            '<th>User ID</th><th>Amount</th><th>Fee</th><th>Net Amount</th>' +
            '<th>Wallet</th><th>Requested</th><th>Actions</th>' +
            '</tr></thead><tbody>';
        
        snapshot.forEach(doc => {
            const wd = doc.data();
            html += `
                <tr>
                    <td>${wd.user_id}</td>
                    <td>${formatTON(wd.amount)} TON</td>
                    <td>${formatTON(wd.fee)} TON</td>
                    <td>${formatTON(wd.net_amount)} TON</td>
                    <td style="font-size: 11px;">${wd.wallet_address}</td>
                    <td>${formatDate(wd.requested_at)}</td>
                    <td>
                        <button class="btn btn-small btn-success" onclick="approveWithdrawal('${doc.id}')">Approve</button>
                        <button class="btn btn-small btn-danger" onclick="rejectWithdrawal('${doc.id}')">Reject</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        document.getElementById('withdrawals-table').innerHTML = html;
    } catch (error) {
        console.error('Error loading withdrawals:', error);
    }
}

// Load transactions table
async function loadTransactionsTable(filterType = 'all') {
    try {
        let query = db.collection('transactions').orderBy('timestamp', 'desc').limit(100);
        
        if (filterType !== 'all') {
            query = query.where('type', '==', filterType);
        }
        
        const snapshot = await query.get();
        
        let html = '<table class="data-table"><thead><tr>' +
            '<th>TX ID</th><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Description</th>' +
            '</tr></thead><tbody>';
        
        snapshot.forEach(doc => {
            const tx = doc.data();
            html += `
                <tr>
                    <td style="font-size: 11px;">${tx.tx_id}</td>
                    <td>${tx.user_id}</td>
                    <td><span class="badge badge-info">${tx.type}</span></td>
                    <td style="color: ${tx.amount > 0 ? 'var(--success)' : 'var(--danger)'};">
                        ${tx.amount > 0 ? '+' : ''}${formatTON(tx.amount)} TON
                    </td>
                    <td>${formatDate(tx.timestamp)}</td>
                    <td>${tx.description}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        document.getElementById('transactions-table').innerHTML = html;
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// User search
function setupUserSearch() {
    const searchInput = document.getElementById('user-search');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#users-table tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// Transaction filter
function setupTransactionFilter() {
    const filter = document.getElementById('tx-filter');
    filter.addEventListener('change', (e) => {
        loadTransactionsTable(e.target.value);
    });
}

// Open task modal
function openTaskModal() {
    document.getElementById('task-modal').classList.remove('hidden');
    document.getElementById('task-form').addEventListener('submit', handleCreateTask);
}

// Handle create task
async function handleCreateTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const type = document.getElementById('task-type').value;
    const link = document.getElementById('task-link').value;
    const reward = parseFloat(document.getElementById('task-reward').value);
    const clicks = parseInt(document.getElementById('task-clicks').value);
    
    try {
        showLoading(true);
        
        const taskRef = db.collection('tasks').doc();
        await taskRef.set({
            task_id: taskRef.id,
            creator_id: 'admin',
            title: title,
            description: description,
            type: type,
            link: link,
            reward: reward,
            clicks_required: clicks,
            clicks_done: 0,
            status: 'active',
            created_at: new Date().toISOString(),
            expires_at: null
        });
        
        showLoading(false);
        closeTaskModal();
        showToast('Task created successfully!', 'success');
        await loadTasksTable();
        
    } catch (error) {
        showLoading(false);
        console.error('Create task error:', error);
        showToast('Failed to create task', 'error');
    }
}

// Approve withdrawal
async function approveWithdrawal(withdrawalId) {
    if (!await confirmAction('Approve this withdrawal?')) return;
    
    try {
        showLoading(true);
        
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'completed',
            processed_at: new Date().toISOString()
        });
        
        showLoading(false);
        showToast('Withdrawal approved!', 'success');
        await loadWithdrawalsTable();
        
    } catch (error) {
        showLoading(false);
        console.error('Approve withdrawal error:', error);
        showToast('Failed to approve withdrawal', 'error');
    }
}

// Reject withdrawal
async function rejectWithdrawal(withdrawalId) {
    if (!await confirmAction('Reject this withdrawal? Amount will be refunded.')) return;
    
    try {
        showLoading(true);
        
        const wdDoc = await db.collection('withdrawals').doc(withdrawalId).get();
        const wd = wdDoc.data();
        
        // Refund user
        await db.collection('users').doc(wd.user_id).update({
            balance: firebase.firestore.FieldValue.increment(wd.amount)
        });
        
        // Update withdrawal status
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'rejected',
            processed_at: new Date().toISOString()
        });
        
        showLoading(false);
        showToast('Withdrawal rejected and refunded!', 'success');
        await loadWithdrawalsTable();
        
    } catch (error) {
        showLoading(false);
        console.error('Reject withdrawal error:', error);
        showToast('Failed to reject withdrawal', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!await confirmAction('Delete this task?')) return;
    
    try {
        showLoading(true);
        await db.collection('tasks').doc(taskId).delete();
        showLoading(false);
        showToast('Task deleted!', 'success');
        await loadTasksTable();
    } catch (error) {
        showLoading(false);
        console.error('Delete task error:', error);
        showToast('Failed to delete task', 'error');
    }
}

// Ban user
async function banUser(userId) {
    if (!await confirmAction('Ban this user?')) return;
    
    try {
        showLoading(true);
        await db.collection('users').doc(userId).update({ status: 'banned' });
        showLoading(false);
        showToast('User banned!', 'success');
        await loadUsersTable();
    } catch (error) {
        showLoading(false);
        console.error('Ban user error:', error);
        showToast('Failed to ban user', 'error');
    }
}

// View user detail
async function viewUserDetail(userId) {
    try {
        showLoading(true);
        const userDoc = await db.collection('users').doc(userId).get();
        const user = userDoc.data();
        
        const content = `
            <h4>User Information</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0;">
                <div><strong>Telegram ID:</strong> ${user.telegram_id}</div>
                <div><strong>Username:</strong> @${user.username || 'N/A'}</div>
                <div><strong>Name:</strong> ${user.first_name} ${user.last_name}</div>
                <div><strong>Balance:</strong> ${formatTON(user.balance)} TON</div>
                <div><strong>Total Earned:</strong> ${formatTON(user.total_earned)} TON</div>
                <div><strong>Ads Watched:</strong> ${formatNumber(user.ads_watched)}</div>
                <div><strong>Tasks Completed:</strong> ${user.tasks_completed}</div>
                <div><strong>Referrals:</strong> ${user.referral_count}</div>
                <div><strong>Status:</strong> <span class="badge badge-${user.status === 'active' ? 'success' : 'danger'}">${user.status}</span></div>
                <div><strong>Joined:</strong> ${formatDate(user.created_at)}</div>
            </div>
        `;
        
        document.getElementById('user-detail-content').innerHTML = content;
        document.getElementById('user-modal').classList.remove('hidden');
        showLoading(false);
        
    } catch (error) {
        showLoading(false);
        console.error('View user error:', error);
        showToast('Failed to load user details', 'error');
    }
}

// Logout
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        currentAdmin = null;
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('login-form').reset();
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}
