import { getToken } from '../utils/storage';

const BASE_URL = 'https://task-api.cashmine.io/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  getBalances: () => request<BalancesResponse>('/balances'),
  getActivity: (cursor?: string) => request<ActivityResponse>(`/activity${cursor ? `?cursor=${cursor}` : ''}`),
  getClaimOptions: (asset: string) => request<ClaimOptions>(`/claim-options?asset=${asset}`),
  createClaim: (data: { asset: string; amount: string; destinationId: string }, idempotencyKey: string) => 
    request<ClaimResponse>('/claims', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(data),
    }),
  getClaimStatus: (id: string) => request<ClaimResponse>(`/claims/${id}`),
};

export interface Balance {
  asset: string;
  decimals: number;
  available: string;
  pending: string;
  claiming: string;
  usdPrice: string;
}

export interface BalancesResponse {
  asOf: string;
  items: Balance[];
}

export interface ActivityItem {
  id: string;
  type: 'accrual' | 'reversal' | 'claim';
  asset: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  exchange: string | null;
  createdAt: string;
  relatedId: string | null;
}

export interface ActivityResponse {
  items: ActivityItem[];
  nextCursor: string | null;
}

export interface ClaimDestination {
  id: string;
  label: string;
}

export interface ClaimOptions {
  asset: string;
  minAmount: string;
  fee: string;
  destinations: ClaimDestination[];
}

export interface ClaimResponse {
  id: string;
  asset: string;
  amount: string;
  fee: string;
  receiveAmount: string;
  destinationId: string;
  status: 'pending' | 'completed' | 'failed';
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}
