import { getToken } from '../utils/storage';

const BASE_URL = 'https://task-api.cashmine.io';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('X-API-TOKEN', token);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  getBalances: () => request<Balance[]>('/balances'),
  getActivity: () => request<ActivityItem[]>('/activity'),
  getClaimOptions: () => request<ClaimOptions>('/claim-options'),
  createClaim: (data: { asset: string; amount: number }) => 
    request<ClaimResponse>('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getClaimStatus: (id: string) => request<ClaimResponse>(`/claims/${id}`),
};

export interface Balance {
  asset: string;
  available: number;
  pending: number;
  total: number;
  price_usd: number;
}

export interface ActivityItem {
  id: string;
  asset: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface ClaimOptions {
  fee_pct: number;
  min_claim_usd: number;
}

export interface ClaimResponse {
  id: string;
  asset: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  fee?: number;
  received_amount?: number;
  error?: string;
  created_at: string;
  updated_at: string;
}
