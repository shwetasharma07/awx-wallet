// Digital Wallet App with Airwallex Integration
class DigitalWalletApp {
    constructor() {
        this.currentUser = null;
        this.currentBalance = 0;
        this.transactions = [];
        this.isLoading = false;

        this.initializeApp();
    }

    async initializeApp() {
        // Check for existing user session
        const savedUser = localStorage.getItem('wallet_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            await this.loadWalletData();
            this.showWalletScreen();
        } else {
            this.showSignInScreen();
        }
    }

    async loadWalletData() {
        try {
            const balance = await window.airwallexAPI.getWalletBalance();
            this.currentBalance = balance.available_amount;
            this.transactions = await window.airwallexAPI.getTransactions();
            this.updateBalanceDisplay();
            this.updateTransactionsList();
        } catch (error) {
            console.error('Error loading wallet data:', error);
        }
    }

    showSignInScreen() {
        document.getElementById('signInScreen').classList.remove('hidden');
        document.getElementById('walletScreen').classList.add('hidden');
        document.getElementById('actionModal').classList.add('hidden');
    }

    showWalletScreen() {
        document.getElementById('signInScreen').classList.add('hidden');
        document.getElementById('walletScreen').classList.remove('hidden');
        document.getElementById('actionModal').classList.add('hidden');
    }

    showActionModal(type) {
        const modal = document.getElementById('actionModal');
        const title = document.getElementById('modalTitle');
        const content = document.getElementById('modalContent');

        title.textContent = this.getModalTitle(type);
        content.innerHTML = this.getModalContent(type);
        modal.classList.remove('hidden');
    }

    hideActionModal() {
        document.getElementById('actionModal').classList.add('hidden');
    }

    getModalTitle(type) {
        const titles = {
            earnings: '💵 Push Earnings',
            send: '📤 Send Money',
            request: '📥 Request Money',
            add: '💳 Add Money',
            cashout: '💰 Cash Out'
        };
        return titles[type] || 'Wallet Action';
    }

    getModalContent(type) {
        switch (type) {
            case 'earnings':
                return `
                    <div class="form">
                        <select id="earningsSource" class="form-select">
                            <option value="platform">Platform Earnings</option>
                            <option value="freelance">Freelance Work</option>
                            <option value="gig">Gig Economy</option>
                            <option value="investment">Investment Returns</option>
                            <option value="bonus">Performance Bonus</option>
                        </select>
                        <input type="number" id="earningsAmount" placeholder="Amount ($)" step="0.01" min="0.01" required>
                        <textarea id="earningsDescription" placeholder="Description (optional)" rows="2"></textarea>
                        <div class="button-group">
                            <button onclick="app.processPushEarnings()" class="action-btn primary">Push Earnings</button>
                            <button onclick="app.hideActionModal()" class="action-btn secondary">Cancel</button>
                        </div>
                    </div>
                `;
            case 'send':
                return `
                    <div class="form">
                        <input type="email" id="sendEmail" placeholder="Recipient email" required>
                        <input type="number" id="sendAmount" placeholder="Amount ($)" step="0.01" min="0.01" required>
                        <textarea id="sendDescription" placeholder="Description (optional)" rows="2"></textarea>
                        <div class="button-group">
                            <button onclick="app.processSendMoney()" class="action-btn primary">Send Money</button>
                            <button onclick="app.hideActionModal()" class="action-btn secondary">Cancel</button>
                        </div>
                    </div>
                `;
            case 'request':
                return `
                    <div class="form">
                        <input type="email" id="requestEmail" placeholder="Request from email" required>
                        <input type="number" id="requestAmount" placeholder="Amount ($)" step="0.01" min="0.01" required>
                        <textarea id="requestDescription" placeholder="Description (optional)" rows="2"></textarea>
                        <div class="button-group">
                            <button onclick="app.processRequestMoney()" class="action-btn primary">Send Request</button>
                            <button onclick="app.hideActionModal()" class="action-btn secondary">Cancel</button>
                        </div>
                    </div>
                `;
            case 'add':
                return `
                    <div class="form">
                        <select id="addSource" class="form-select">
                            <option value="card">Credit/Debit Card</option>
                            <option value="bank">Bank Account</option>
                        </select>
                        <input type="number" id="addAmount" placeholder="Amount ($)" step="0.01" min="1.00" required>
                        <div id="cardDetails" class="payment-details">
                            <input type="text" id="cardNumber" placeholder="Card Number" maxlength="19">
                            <div class="card-row">
                                <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5">
                                <input type="text" id="cardCvv" placeholder="CVV" maxlength="4">
                            </div>
                        </div>
                        <div id="bankDetails" class="payment-details hidden">
                            <input type="text" id="routingNumber" placeholder="Routing Number">
                            <input type="text" id="accountNumber" placeholder="Account Number">
                        </div>
                        <div class="button-group">
                            <button onclick="app.processAddMoney()" class="action-btn primary">Add Money</button>
                            <button onclick="app.hideActionModal()" class="action-btn secondary">Cancel</button>
                        </div>
                    </div>
                `;
            case 'cashout':
                return `
                    <div class="form">
                        <input type="number" id="cashoutAmount" placeholder="Amount ($)" step="0.01" min="1.00" required>
                        <p class="available-balance">Available: $${this.currentBalance.toFixed(2)}</p>
                        <input type="text" id="bankName" placeholder="Bank Name" required>
                        <input type="text" id="accountName" placeholder="Account Holder Name" required>
                        <input type="text" id="cashoutRouting" placeholder="Routing Number" required>
                        <input type="text" id="cashoutAccount" placeholder="Account Number" required>
                        <div class="button-group">
                            <button onclick="app.processCashOut()" class="action-btn primary">Cash Out</button>
                            <button onclick="app.hideActionModal()" class="action-btn secondary">Cancel</button>
                        </div>
                    </div>
                `;
            default:
                return '<p>Action not available</p>';
        }
    }

    async signIn() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            this.showError('Please enter email and password');
            return;
        }

        this.setLoading(true);

        try {
            // Simulate authentication
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = {
                id: 'user_' + Date.now(),
                email: email,
                name: email.split('@')[0],
                createdAt: new Date().toISOString()
            };

            this.currentUser = user;
            localStorage.setItem('wallet_user', JSON.stringify(user));

            await this.loadWalletData();
            this.showWalletScreen();
        } catch (error) {
            this.showError('Sign in failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async signOut() {
        localStorage.removeItem('wallet_user');
        this.currentUser = null;
        this.currentBalance = 0;
        this.transactions = [];
        this.showSignInScreen();
    }

    async processSendMoney() {
        const email = document.getElementById('sendEmail').value;
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const description = document.getElementById('sendDescription').value;

        if (!email || !amount || amount <= 0) {
            this.showError('Please enter valid recipient email and amount');
            return;
        }

        if (amount > this.currentBalance) {
            this.showError('Insufficient funds');
            return;
        }

        this.setLoading(true);

        try {
            const result = await window.airwallexAPI.sendMoney(email, amount, description);
            await this.loadWalletData();
            this.hideActionModal();
            this.showSuccess(`Successfully sent $${amount.toFixed(2)} to ${email}`);
        } catch (error) {
            this.showError('Send failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async processRequestMoney() {
        const email = document.getElementById('requestEmail').value;
        const amount = parseFloat(document.getElementById('requestAmount').value);
        const description = document.getElementById('requestDescription').value;

        if (!email || !amount || amount <= 0) {
            this.showError('Please enter valid email and amount');
            return;
        }

        this.setLoading(true);

        try {
            const result = await window.airwallexAPI.requestMoney(email, amount, description);
            await this.loadWalletData();
            this.hideActionModal();
            this.showSuccess(`Money request sent to ${email} for $${amount.toFixed(2)}`);
        } catch (error) {
            this.showError('Request failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async processAddMoney() {
        const source = document.getElementById('addSource').value;
        const amount = parseFloat(document.getElementById('addAmount').value);

        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        let sourceDetails = {};
        if (source === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            if (!cardNumber) {
                this.showError('Please enter card details');
                return;
            }
            sourceDetails.lastFour = cardNumber.slice(-4);
        }

        this.setLoading(true);

        try {
            const result = await window.airwallexAPI.addMoney(amount, source, sourceDetails);
            await this.loadWalletData();
            this.hideActionModal();
            this.showSuccess(`Successfully added $${amount.toFixed(2)} to your wallet`);
        } catch (error) {
            this.showError('Add money failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async processCashOut() {
        const amount = parseFloat(document.getElementById('cashoutAmount').value);
        const bankName = document.getElementById('bankName').value;
        const accountName = document.getElementById('accountName').value;

        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        if (amount > this.currentBalance) {
            this.showError('Insufficient funds');
            return;
        }

        if (!bankName || !accountName) {
            this.showError('Please enter bank details');
            return;
        }

        this.setLoading(true);

        try {
            const result = await window.airwallexAPI.cashOut(amount, { bankName, accountName });
            await this.loadWalletData();
            this.hideActionModal();
            this.showSuccess(`Cash out initiated for $${amount.toFixed(2)}. Expected completion in 1-2 business days.`);
        } catch (error) {
            this.showError('Cash out failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async processPushEarnings() {
        const source = document.getElementById('earningsSource').value;
        const amount = parseFloat(document.getElementById('earningsAmount').value);
        const description = document.getElementById('earningsDescription').value;

        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        this.setLoading(true);

        try {
            const result = await window.airwallexAPI.pushEarnings(amount, source, description);
            await this.loadWalletData();
            this.hideActionModal();
            this.showSuccess(`🎉 Earnings of $${amount.toFixed(2)} pushed to your wallet from ${source}!`);
        } catch (error) {
            this.showError('Push earnings failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    updateBalanceDisplay() {
        const balanceElement = document.getElementById('currentBalance');
        if (balanceElement) {
            balanceElement.textContent = `$${this.currentBalance.toFixed(2)}`;
        }
    }

    updateTransactionsList() {
        const container = document.getElementById('transactionsList');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No transactions yet</p>
                    <p class="subtext">Start by adding money to your wallet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transactions.slice(0, 10).map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type">
                        ${this.getTransactionIcon(transaction.type)}
                        ${transaction.description}
                    </div>
                    <div class="transaction-details">
                        ${transaction.counterparty?.name || 'Unknown'} • ${this.formatDate(transaction.timestamp)}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type.includes('out') ? 'negative' : 'positive'}">
                    ${transaction.type.includes('out') ? '-' : '+'}$${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-status status-${transaction.status}">
                    ${transaction.status}
                </div>
            </div>
        `).join('');
    }

    getTransactionIcon(type) {
        const icons = {
            'earnings_in': '💵',
            'transfer_in': '📥',
            'transfer_out': '📤',
            'request_pending': '⏳',
            'payment': '💳',
            'refund': '↩️'
        };
        return icons[type] || '💰';
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingElements = document.querySelectorAll('.loading-overlay');
        loadingElements.forEach(el => {
            if (loading) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Event handlers for form changes
    handleSourceChange() {
        const source = document.getElementById('addSource').value;
        const cardDetails = document.getElementById('cardDetails');
        const bankDetails = document.getElementById('bankDetails');

        if (source === 'card') {
            cardDetails.classList.remove('hidden');
            bankDetails.classList.add('hidden');
        } else {
            cardDetails.classList.add('hidden');
            bankDetails.classList.remove('hidden');
        }
    }

    // Auto-format card number
    formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        input.value = formattedValue;
    }

    // Auto-format expiry date
    formatExpiry(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        input.value = value;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DigitalWalletApp();
});