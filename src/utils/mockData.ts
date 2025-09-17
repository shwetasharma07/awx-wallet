// Mock data for development and testing
import { Transaction, WalletBalance } from '../api/airwallex';

export const mockWalletBalances: WalletBalance[] = [
  {
    currency: 'USD',
    available_amount: 247.50,
    pending_amount: 0,
    reserved_amount: 0,
    total_amount: 247.50,
  },
  {
    currency: 'EUR',
    available_amount: 125.30,
    pending_amount: 0,
    reserved_amount: 0,
    total_amount: 125.30,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
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
    id: '2',
    type: 'transfer_out',
    amount: 15.99,
    currency: 'USD',
    description: 'Robux purchase',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    balance_after: 222.50,
    counterparty: {
      name: 'Roblox Store',
      type: 'wallet',
    },
  },
  {
    id: '3',
    type: 'transfer_in',
    amount: 50.00,
    currency: 'USD',
    description: 'Wallet top-up',
    status: 'completed',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    balance_after: 238.49,
    counterparty: {
      name: 'Chase Bank',
      type: 'bank',
    },
  },
  {
    id: '4',
    type: 'transfer_out',
    amount: 22.50,
    currency: 'USD',
    description: 'Sent to friend',
    status: 'completed',
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    balance_after: 188.49,
    counterparty: {
      name: 'Alex Smith',
      type: 'wallet',
    },
  },
  {
    id: '5',
    type: 'payment',
    amount: 9.99,
    currency: 'USD',
    description: 'Game Pass - Adopt Me!',
    status: 'completed',
    timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    balance_after: 210.99,
    counterparty: {
      name: 'Adopt Me!',
      type: 'wallet',
    },
  },
];

export const mockRobloxGames = [
  {
    id: 'adopt-me',
    name: 'Adopt Me!',
    icon: '🏠',
    players: '2.1M',
    description: 'The #1 pet game on Roblox',
  },
  {
    id: 'blox-fruits',
    name: 'Blox Fruits',
    icon: '🍎',
    players: '1.8M',
    description: 'Adventure and fighting game',
  },
  {
    id: 'pet-simulator',
    name: 'Pet Simulator X',
    icon: '🐕',
    players: '1.5M',
    description: 'Collect and trade pets',
  },
  {
    id: 'mm2',
    name: 'Murder Mystery 2',
    icon: '🔪',
    players: '800K',
    description: 'Mystery and strategy game',
  },
];

export const mockRobuxPurchaseHistory = [
  {
    id: 'robux-1',
    robux: 400,
    price: 4.99,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    game: 'Adopt Me!',
  },
  {
    id: 'robux-2',
    robux: 800,
    price: 9.99,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    game: 'Blox Fruits',
  },
  {
    id: 'robux-3',
    robux: 1700,
    price: 19.99,
    timestamp: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    game: 'General',
  },
];

export const mockSpendingInsights = {
  thisWeek: {
    moneyIn: 127.50,
    moneyOut: 89.25,
    netChange: 38.25,
  },
  thisMonth: {
    moneyIn: 456.75,
    moneyOut: 234.50,
    netChange: 222.25,
  },
  categories: [
    {
      name: 'Gaming',
      amount: 45.99,
      percentage: 52,
      color: '#00A2FF',
    },
    {
      name: 'Transfers',
      amount: 22.50,
      percentage: 25,
      color: '#4CAF50',
    },
    {
      name: 'Other',
      amount: 20.76,
      percentage: 23,
      color: '#FF9500',
    },
  ],
};