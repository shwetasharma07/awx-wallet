// Core Airwallex error structure
export interface AwxError {
  code: string;
  httpStatus: number;
  message: string;
  details?: Record<string, any>;
}

// KYC start response structure
export interface AwxKycStartRes {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  verification_url?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

// Payout response structure
export interface AwxPayoutRes {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  beneficiary_id: string;
  payment_method: string;
  reference?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  fees?: {
    amount: number;
    currency: string;
  }[];
  metadata?: Record<string, any>;
}

// Wallet structure
export interface AwxWallet {
  id: string;
  currency: string;
  balance: {
    available: number;
    pending: number;
    reserved: number;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// Generic API response wrapper
export interface AwxApiResponse<T = any> {
  data?: T;
  error?: AwxError;
  pagination?: {
    total: number;
    page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Common request types
export interface CreatePayoutRequest {
  amount: number;
  currency: string;
  beneficiary_id: string;
  payment_method: string;
  reference?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface KycStartRequest {
  type: 'INDIVIDUAL' | 'BUSINESS';
  country: string;
  redirect_url?: string;
  webhook_url?: string;
  metadata?: Record<string, any>;
}