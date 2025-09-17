export interface User {
  id: string;
  username: string;
  robloxId?: string;
  email?: string;
  avatar?: string;
}

export interface WalletBalance {
  robux: number;
  usd: number;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'purchase' | 'sale';
  amount: number;
  currency: 'ROBUX' | 'USD';
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  description: string;
  fromUser?: string;
  toUser?: string;
  gameId?: string;
  gameName?: string;
}

export interface GameItem {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  gameId: string;
  gameName: string;
}