// Web-compatible Airwallex API wrapper
class AirwallexWebAPI {
    constructor() {
        this.baseUrl = 'https://api-demo.airwallex.com';
        this.clientId = 'your_sandbox_client_id';
        this.apiKey = 'sk_hk_test_example';
        this.accessToken = null;
        this.currentWallet = null;

        // Use localStorage instead of AsyncStorage
        this.storage = {
            setItem: (key, value) => localStorage.setItem(key, value),
            getItem: (key) => localStorage.getItem(key),
            removeItem: (key) => localStorage.removeItem(key)
        };

        this.initializeMockData();
    }

    // Initialize with mock data for demo purposes
    initializeMockData() {
        const mockWallet = {
            id: 'wallet_demo_123',
            balances: [{
                currency: 'USD',
                available_amount: 0.00,
                pending_amount: 0,
                reserved_amount: 0,
                total_amount: 0.00
            }],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const mockTransactions = [];

        this.storage.setItem('mock_wallet', JSON.stringify(mockWallet));
        this.storage.setItem('mock_transactions', JSON.stringify(mockTransactions));
        this.currentWallet = mockWallet;
    }

    // Simulate API delay
    async delay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Mock authentication
    async authenticate() {
        await this.delay(500);
        this.accessToken = 'mock_token_' + Date.now();
        this.storage.setItem('airwallex_token', this.accessToken);
        return this.accessToken;
    }

    // Get wallet balance
    async getWalletBalance() {
        await this.delay(300);
        const wallet = JSON.parse(this.storage.getItem('mock_wallet'));
        return wallet.balances[0];
    }

    // Get transactions
    async getTransactions() {
        await this.delay(500);
        return JSON.parse(this.storage.getItem('mock_transactions')) || [];
    }

    // Send money to another wallet
    async sendMoney(recipientEmail, amount, description = '') {
        await this.delay(1000);

        const wallet = JSON.parse(this.storage.getItem('mock_wallet'));
        const transactions = JSON.parse(this.storage.getItem('mock_transactions')) || [];

        if (wallet.balances[0].available_amount < amount) {
            throw new Error('Insufficient funds');
        }

        // Update balance
        wallet.balances[0].available_amount -= amount;
        wallet.balances[0].total_amount -= amount;

        // Add new transaction
        const newTransaction = {
            id: 'txn_' + Date.now(),
            type: 'transfer_out',
            amount: amount,
            currency: 'USD',
            description: description || `Sent to ${recipientEmail}`,
            status: 'completed',
            timestamp: new Date().toISOString(),
            balance_after: wallet.balances[0].available_amount,
            counterparty: { name: recipientEmail, type: 'wallet' }
        };

        transactions.unshift(newTransaction);

        // Save updates
        this.storage.setItem('mock_wallet', JSON.stringify(wallet));
        this.storage.setItem('mock_transactions', JSON.stringify(transactions));
        this.currentWallet = wallet;

        return {
            id: newTransaction.id,
            status: 'completed',
            amount: amount,
            recipient: recipientEmail,
            timestamp: newTransaction.timestamp
        };
    }

    // Request money from another user
    async requestMoney(fromEmail, amount, description = '') {
        await this.delay(800);

        const transactions = JSON.parse(this.storage.getItem('mock_transactions')) || [];

        // Add pending request transaction
        const requestTransaction = {
            id: 'req_' + Date.now(),
            type: 'request_pending',
            amount: amount,
            currency: 'USD',
            description: description || `Request from ${fromEmail}`,
            status: 'pending',
            timestamp: new Date().toISOString(),
            balance_after: this.currentWallet.balances[0].available_amount,
            counterparty: { name: fromEmail, type: 'wallet' }
        };

        transactions.unshift(requestTransaction);
        this.storage.setItem('mock_transactions', JSON.stringify(transactions));

        return {
            id: requestTransaction.id,
            status: 'pending',
            amount: amount,
            from: fromEmail,
            timestamp: requestTransaction.timestamp
        };
    }

    // Add money from card or bank
    async addMoney(amount, source = 'card', sourceDetails = {}) {
        await this.delay(1200);

        const wallet = JSON.parse(this.storage.getItem('mock_wallet'));
        const transactions = JSON.parse(this.storage.getItem('mock_transactions')) || [];

        // Update balance
        wallet.balances[0].available_amount += amount;
        wallet.balances[0].total_amount += amount;

        // Add new transaction
        const newTransaction = {
            id: 'add_' + Date.now(),
            type: 'transfer_in',
            amount: amount,
            currency: 'USD',
            description: `Added from ${source}`,
            status: 'completed',
            timestamp: new Date().toISOString(),
            balance_after: wallet.balances[0].available_amount,
            counterparty: {
                name: source === 'card' ? `Card ***${sourceDetails.lastFour || '1234'}` : 'Bank Account',
                type: source
            }
        };

        transactions.unshift(newTransaction);

        // Save updates
        this.storage.setItem('mock_wallet', JSON.stringify(wallet));
        this.storage.setItem('mock_transactions', JSON.stringify(transactions));
        this.currentWallet = wallet;

        return {
            id: newTransaction.id,
            status: 'completed',
            amount: amount,
            source: source,
            timestamp: newTransaction.timestamp
        };
    }

    // Cash out to bank account
    async cashOut(amount, bankDetails = {}) {
        await this.delay(1500);

        const wallet = JSON.parse(this.storage.getItem('mock_wallet'));
        const transactions = JSON.parse(this.storage.getItem('mock_transactions')) || [];

        if (wallet.balances[0].available_amount < amount) {
            throw new Error('Insufficient funds');
        }

        // Update balance
        wallet.balances[0].available_amount -= amount;
        wallet.balances[0].total_amount -= amount;

        // Add new transaction
        const newTransaction = {
            id: 'out_' + Date.now(),
            type: 'transfer_out',
            amount: amount,
            currency: 'USD',
            description: `Cash out to bank`,
            status: 'processing',
            timestamp: new Date().toISOString(),
            balance_after: wallet.balances[0].available_amount,
            counterparty: {
                name: `Bank ***${bankDetails.lastFour || '5678'}`,
                type: 'bank'
            }
        };

        transactions.unshift(newTransaction);

        // Save updates
        this.storage.setItem('mock_wallet', JSON.stringify(wallet));
        this.storage.setItem('mock_transactions', JSON.stringify(transactions));
        this.currentWallet = wallet;

        // Simulate processing time - update to completed after delay
        setTimeout(() => {
            const updatedTransactions = JSON.parse(this.storage.getItem('mock_transactions'));
            const txnIndex = updatedTransactions.findIndex(t => t.id === newTransaction.id);
            if (txnIndex !== -1) {
                updatedTransactions[txnIndex].status = 'completed';
                this.storage.setItem('mock_transactions', JSON.stringify(updatedTransactions));
            }
        }, 3000);

        return {
            id: newTransaction.id,
            status: 'processing',
            amount: amount,
            bankAccount: bankDetails,
            timestamp: newTransaction.timestamp,
            estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
    }

    // Push earnings into wallet
    async pushEarnings(amount, source = 'platform', description = '') {
        await this.delay(800);

        const wallet = JSON.parse(this.storage.getItem('mock_wallet'));
        const transactions = JSON.parse(this.storage.getItem('mock_transactions')) || [];

        // Update balance
        wallet.balances[0].available_amount += amount;
        wallet.balances[0].total_amount += amount;

        // Add new earnings transaction
        const earningsTransaction = {
            id: 'earn_' + Date.now(),
            type: 'earnings_in',
            amount: amount,
            currency: 'USD',
            description: description || `Earnings from ${source}`,
            status: 'completed',
            timestamp: new Date().toISOString(),
            balance_after: wallet.balances[0].available_amount,
            counterparty: {
                name: source === 'platform' ? 'Platform Earnings' : source,
                type: 'earnings'
            }
        };

        transactions.unshift(earningsTransaction);

        // Save updates
        this.storage.setItem('mock_wallet', JSON.stringify(wallet));
        this.storage.setItem('mock_transactions', JSON.stringify(transactions));
        this.currentWallet = wallet;

        return {
            id: earningsTransaction.id,
            status: 'completed',
            amount: amount,
            source: source,
            timestamp: earningsTransaction.timestamp,
            newBalance: wallet.balances[0].available_amount
        };
    }

    // Get exchange rate (mock)
    async getExchangeRate(fromCurrency, toCurrency) {
        await this.delay(200);
        // Mock exchange rates
        const rates = {
            'USD-EUR': 0.85,
            'USD-GBP': 0.73,
            'USD-JPY': 110.0,
            'EUR-USD': 1.18,
            'GBP-USD': 1.37
        };

        const key = `${fromCurrency}-${toCurrency}`;
        return rates[key] || 1.0;
    }
}

// Global instance
window.airwallexAPI = new AirwallexWebAPI();