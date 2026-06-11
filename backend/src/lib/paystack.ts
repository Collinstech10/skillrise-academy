import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
});

export async function verifyPaystackTransaction(reference: string) {
  try {
    const { data } = await paystackApi.get(`/transaction/verify/${reference}`);
    return data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown } };
    throw new Error(`Paystack verification failed: ${JSON.stringify(err.response?.data)}`);
  }
}

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in kobo
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}) {
  const { data } = await paystackApi.post('/transaction/initialize', params);
  return data;
}

export async function listTransactions(params?: {
  perPage?: number; page?: number; status?: string;
}) {
  const { data } = await paystackApi.get('/transaction', { params });
  return data;
}
