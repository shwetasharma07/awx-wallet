import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AirwallexConfig {
  apiKey: string;
  clientId: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface Wallet {
  id: string;
  balances: WalletBalance[];
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

interface WalletBalance {
  currency: string;
  available_amount: number;
  pending_amount: number;
  reserved_amount: number;
  total_amount: number;
}

interface Transfer {
  id: string;
  source_currency: string;
  target_currency: string;
  source_amount: number;
  target_amount: number;
  exchange_rate?: number;
  purpose_code: string;
  reference: string;
  status: 'created' | 'processing' | 'completed' | 'failed' | 'cancelled';
  beneficiary: Beneficiary;
  created_at: string;
  updated_at: string;
}

interface Beneficiary {
  id?: string;
  type: 'individual' | 'business';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone_number?: string;
  address: {
    country_code: string;
    state?: string;
    city?: string;
    street_address?: string;
    postal_code?: string;
  };
  bank_details: {
    account_number: string;
    routing_number?: string;
    account_name: string;
    bank_name: string;
    swift_code?: string;
  };
}

interface Transaction {
  id: string;
  type: 'transfer_in' | 'transfer_out' | 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  balance_after: number;
  reference?: string;
  counterparty?: {
    name: string;
    type: 'wallet' | 'bank' | 'card';
  };
}

interface CreateTransferRequest {
  source_currency: string;
  target_currency: string;
  source_amount: number;
  purpose_code: string;
  reference: string;
  beneficiary_id?: string;
  beneficiary?: Beneficiary;
}

interface WalletToWalletTransfer {
  recipient_wallet_id: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
}

class AirwallexAPI {
  private api: AxiosInstance;
  private config: AirwallexConfig;
  private accessToken: string | null = null;

  constructor(config: AirwallexConfig) {
    this.config = config;

    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': config.clientId,
      },
    });

    this.api.interceptors.request.use(async (request) => {
      if (!this.accessToken) {
        await this.authenticate();
      }

      if (this.accessToken) {
        request.headers.Authorization = `Bearer ${this.accessToken}`;
      }

      return request;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.authenticate();
          return this.api.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post(`${this.config.baseUrl}/api/v1/authentication/login`, {
        x_client_id: this.config.clientId,
        x_api_key: this.config.apiKey,
      });

      this.accessToken = response.data.token;
      await AsyncStorage.setItem('airwallex_token', this.accessToken);
    } catch (error) {
      console.error('Airwallex authentication failed:', error);
      throw new Error('Failed to authenticate with Airwallex');
    }
  }

  // Wallet Management
  async createWallet(currency: string = 'USD'): Promise<Wallet> {
    try {
      const response = await this.api.post('/api/v1/wallets', {
        currency,
        type: 'multi_currency',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  async getWallet(walletId: string): Promise<Wallet> {
    try {
      const response = await this.api.get(`/api/v1/wallets/${walletId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get wallet:', error);
      throw error;
    }
  }

  async getWalletBalances(walletId: string): Promise<WalletBalance[]> {
    try {
      const response = await this.api.get(`/api/v1/wallets/${walletId}/balances`);
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get wallet balances:', error);
      throw error;
    }
  }

  // Transfers
  async createTransfer(transferData: CreateTransferRequest): Promise<Transfer> {
    try {
      const response = await this.api.post('/api/v1/transfers', transferData);
      return response.data;
    } catch (error) {
      console.error('Failed to create transfer:', error);
      throw error;
    }
  }

  async getTransfer(transferId: string): Promise<Transfer> {
    try {
      const response = await this.api.get(`/api/v1/transfers/${transferId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get transfer:', error);
      throw error;
    }
  }

  async getTransfers(limit: number = 20, offset: number = 0): Promise<Transfer[]> {
    try {
      const response = await this.api.get('/api/v1/transfers', {
        params: { limit, offset }
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get transfers:', error);
      throw error;
    }
  }

  // Wallet-to-Wallet Transfers
  async walletToWalletTransfer(transferData: WalletToWalletTransfer): Promise<Transfer> {
    try {
      const response = await this.api.post('/api/v1/wallet-transfers', transferData);
      return response.data;
    } catch (error) {
      console.error('Failed to create wallet-to-wallet transfer:', error);
      throw error;
    }
  }

  // Transaction History
  async getTransactions(
    walletId: string,
    limit: number = 50,
    offset: number = 0,
    currency?: string
  ): Promise<Transaction[]> {
    try {
      const params: any = { limit, offset };
      if (currency) params.currency = currency;

      const response = await this.api.get(`/api/v1/wallets/${walletId}/transactions`, {
        params
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }

  // Beneficiary Management
  async createBeneficiary(beneficiaryData: Beneficiary): Promise<Beneficiary> {
    try {
      const response = await this.api.post('/api/v1/beneficiaries', beneficiaryData);
      return response.data;
    } catch (error) {
      console.error('Failed to create beneficiary:', error);
      throw error;
    }
  }

  async getBeneficiaries(): Promise<Beneficiary[]> {
    try {
      const response = await this.api.get('/api/v1/beneficiaries');
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get beneficiaries:', error);
      throw error;
    }
  }

  // Exchange Rates
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await this.api.get('/api/v1/rates', {
        params: {
          source_currency: fromCurrency,
          target_currency: toCurrency
        }
      });
      return response.data.rate;
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      throw error;
    }
  }

  // Wallet Funding (Add Money)
  async addFundsFromCard(
    walletId: string,
    amount: number,
    currency: string,
    cardToken: string
  ): Promise<any> {
    try {
      const response = await this.api.post(`/api/v1/wallets/${walletId}/top-up`, {
        amount,
        currency,
        payment_method: {
          type: 'card',
          card_token: cardToken
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add funds from card:', error);
      throw error;
    }
  }

  async addFundsFromBank(
    walletId: string,
    amount: number,
    currency: string,
    bankAccountId: string
  ): Promise<any> {
    try {
      const response = await this.api.post(`/api/v1/wallets/${walletId}/top-up`, {
        amount,
        currency,
        payment_method: {
          type: 'bank_transfer',
          bank_account_id: bankAccountId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add funds from bank:', error);
      throw error;
    }
  }

  // Withdraw Funds (Cash Out)
  async withdrawToBank(
    walletId: string,
    amount: number,
    currency: string,
    beneficiaryId: string,
    reference: string
  ): Promise<Transfer> {
    try {
      const transferData: CreateTransferRequest = {
        source_currency: currency,
        target_currency: currency,
        source_amount: amount,
        purpose_code: 'personal_transfer',
        reference,
        beneficiary_id: beneficiaryId
      };

      return await this.createTransfer(transferData);
    } catch (error) {
      console.error('Failed to withdraw to bank:', error);
      throw error;
    }
  }
}

// Configuration for different environments
const getAirwallexConfig = (environment: 'sandbox' | 'production' = 'sandbox'): AirwallexConfig => {
  const configs = {
    sandbox: {
      apiKey: process.env.AIRWALLEX_SANDBOX_API_KEY || 'sk_hk_test_example',
      clientId: process.env.AIRWALLEX_SANDBOX_CLIENT_ID || 'your_sandbox_client_id',
      baseUrl: 'https://api-demo.airwallex.com',
      environment: 'sandbox' as const,
    },
    production: {
      apiKey: process.env.AIRWALLEX_PRODUCTION_API_KEY || '',
      clientId: process.env.AIRWALLEX_PRODUCTION_CLIENT_ID || '',
      baseUrl: 'https://api.airwallex.com',
      environment: 'production' as const,
    },
  };

  return configs[environment];
};

// Export singleton instance
export const airwallexAPI = new AirwallexAPI(getAirwallexConfig('sandbox'));

export type {
  Wallet,
  WalletBalance,
  Transfer,
  Transaction,
  Beneficiary,
  CreateTransferRequest,
  WalletToWalletTransfer,
};

export default AirwallexAPI;