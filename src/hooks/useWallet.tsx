import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { airwallexAPI, Wallet, WalletBalance, Transaction, Transfer } from '../api/airwallex';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WalletContextType {
  // Wallet State
  wallet: Wallet | null;
  balances: WalletBalance[];
  transactions: Transaction[];
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;

  // Wallet Actions
  initializeWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  sendMoney: (recipientId: string, amount: number, currency: string, reference: string) => Promise<Transfer>;
  addFunds: (amount: number, currency: string, paymentMethod: 'card' | 'bank', token: string) => Promise<any>;
  withdrawFunds: (amount: number, currency: string, beneficiaryId: string, reference: string) => Promise<Transfer>;

  // Helper Methods
  getBalanceForCurrency: (currency: string) => WalletBalance | null;
  getTotalBalanceUSD: () => number;
  getRecentTransactions: (limit?: number) => Transaction[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if wallet exists in AsyncStorage
      const storedWalletId = await AsyncStorage.getItem('wallet_id');

      let currentWallet: Wallet;

      if (storedWalletId) {
        // Get existing wallet
        currentWallet = await airwallexAPI.getWallet(storedWalletId);
      } else {
        // Create new wallet
        currentWallet = await airwallexAPI.createWallet('USD');
        await AsyncStorage.setItem('wallet_id', currentWallet.id);
      }

      setWallet(currentWallet);

      // Load initial data
      await Promise.all([
        refreshBalances(),
        refreshTransactions(),
      ]);

    } catch (err) {
      console.log('Airwallex API not available, using mock data...');

      // Use mock data when API is not available
      const mockWallet: Wallet = {
        id: 'mock_wallet_123',
        balances: [
          {
            currency: 'USD',
            available_amount: 247.50,
            pending_amount: 0,
            reserved_amount: 0,
            total_amount: 247.50,
          }
        ],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockTransactions: Transaction[] = [
        {
          id: 'mock_tx_1',
          type: 'transfer_in',
          amount: 25.00,
          currency: 'USD',
          description: 'Welcome bonus',
          status: 'completed',
          timestamp: new Date().toISOString(),
          balance_after: 247.50,
          counterparty: {
            name: 'Roblox Wallet',
            type: 'wallet',
          },
        },
        {
          id: 'mock_tx_2',
          type: 'transfer_out',
          amount: 15.99,
          currency: 'USD',
          description: 'Robux purchase',
          status: 'completed',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          balance_after: 222.50,
          counterparty: {
            name: 'Roblox Store',
            type: 'wallet',
          },
        },
        {
          id: 'mock_tx_3',
          type: 'transfer_in',
          amount: 50.00,
          currency: 'USD',
          description: 'Wallet top-up',
          status: 'completed',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          balance_after: 238.49,
          counterparty: {
            name: 'Chase Bank',
            type: 'bank',
          },
        },
      ];

      setWallet(mockWallet);
      setBalances(mockWallet.balances);
      setTransactions(mockTransactions);

      // Store mock data locally
      await AsyncStorage.setItem('wallet_id', mockWallet.id);
      await AsyncStorage.setItem('mock_mode', 'true');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!wallet) return;

    try {
      // Check if we're in mock mode
      const mockMode = await AsyncStorage.getItem('mock_mode');
      if (mockMode === 'true') {
        // Return current mock balances
        return;
      }

      const walletBalances = await airwallexAPI.getWalletBalances(wallet.id);
      setBalances(walletBalances);
    } catch (err) {
      console.log('Using mock balances...');
      // Keep existing mock balances on error
    }
  };

  const refreshTransactions = async () => {
    if (!wallet) return;

    try {
      // Check if we're in mock mode
      const mockMode = await AsyncStorage.getItem('mock_mode');
      if (mockMode === 'true') {
        // Return current mock transactions
        return;
      }

      const [transactionData, transferData] = await Promise.all([
        airwallexAPI.getTransactions(wallet.id, 50),
        airwallexAPI.getTransfers(50),
      ]);

      setTransactions(transactionData);
      setTransfers(transferData);
    } catch (err) {
      console.log('Using mock transactions...');
      // Keep existing mock transactions on error
    }
  };

  const sendMoney = async (
    recipientId: string,
    amount: number,
    currency: string,
    reference: string
  ): Promise<Transfer> => {
    if (!wallet) throw new Error('Wallet not initialized');

    setIsLoading(true);
    try {
      const transfer = await airwallexAPI.walletToWalletTransfer({
        recipient_wallet_id: recipientId,
        amount,
        currency,
        reference,
        description: `Transfer to ${recipientId}`,
      });

      // Refresh data after successful transfer
      await Promise.all([refreshBalances(), refreshTransactions()]);

      return transfer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send money';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addFunds = async (
    amount: number,
    currency: string,
    paymentMethod: 'card' | 'bank',
    token: string
  ): Promise<any> => {
    if (!wallet) throw new Error('Wallet not initialized');

    setIsLoading(true);
    try {
      let result;

      if (paymentMethod === 'card') {
        result = await airwallexAPI.addFundsFromCard(wallet.id, amount, currency, token);
      } else {
        result = await airwallexAPI.addFundsFromBank(wallet.id, amount, currency, token);
      }

      // Refresh balances after successful funding
      await refreshBalances();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add funds';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async (
    amount: number,
    currency: string,
    beneficiaryId: string,
    reference: string
  ): Promise<Transfer> => {
    if (!wallet) throw new Error('Wallet not initialized');

    setIsLoading(true);
    try {
      const transfer = await airwallexAPI.withdrawToBank(
        wallet.id,
        amount,
        currency,
        beneficiaryId,
        reference
      );

      // Refresh data after successful withdrawal
      await Promise.all([refreshBalances(), refreshTransactions()]);

      return transfer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw funds';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getBalanceForCurrency = (currency: string): WalletBalance | null => {
    return balances.find(balance => balance.currency === currency) || null;
  };

  const getTotalBalanceUSD = (): number => {
    const usdBalance = getBalanceForCurrency('USD');
    return usdBalance?.available_amount || 0;
  };

  const getRecentTransactions = (limit: number = 10): Transaction[] => {
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  // Initialize wallet on mount
  useEffect(() => {
    initializeWallet();
  }, []);

  const value: WalletContextType = {
    // State
    wallet,
    balances,
    transactions,
    transfers,
    isLoading,
    error,

    // Actions
    initializeWallet,
    refreshBalances,
    refreshTransactions,
    sendMoney,
    addFunds,
    withdrawFunds,

    // Helpers
    getBalanceForCurrency,
    getTotalBalanceUSD,
    getRecentTransactions,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default useWallet;