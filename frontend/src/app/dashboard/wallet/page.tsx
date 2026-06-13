'use client';
import { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Building, CreditCard, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  bank_account: BankAccount;
}

const NIGERIAN_BANKS = [
  'Access Bank', 'First Bank', 'GTBank', 'Zenith Bank', 'UBA',
  'Sterling Bank', 'Fidelity Bank', 'Union Bank', 'Polaris Bank',
  'Wema Bank', 'FCMB', 'Stanbic IBTC', 'Opay', 'Kuda Bank',
  'Palmpay', 'Moniepoint', 'VFD Microfinance Bank',
];

export default function WalletPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '', account_name: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/users/wallet'),
      api.get('/users/bank-accounts'),
      api.get('/users/withdrawals'),
    ]).then(([walletRes, bankRes, withdrawRes]) => {
      setTransactions(walletRes.data.data || []);
      setBankAccounts(bankRes.data.data || []);
      setWithdrawals(withdrawRes.data.data || []);
    }).catch(() => toast.error('Failed to load wallet data'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddBank = async () => {
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_name) {
      toast.error('All bank fields are required'); return;
    }
    if (bankForm.account_number.length < 10) {
      toast.error('Enter a valid 10-digit account number'); return;
    }
    setSaving(true);
    try {
      const res = await api.post('/users/bank-accounts', bankForm);
      setBankAccounts(prev => [...prev, res.data.data]);
      setShowBankForm(false);
      setBankForm({ bank_name: '', account_number: '', account_name: '' });
      toast.success('Bank account added!');
    } catch { toast.error('Failed to add bank account'); }
    finally { setSaving(false); }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 10000) { toast.error('Minimum withdrawal is ₦10,000'); return; }
    if (amount > 300000) { toast.error('Maximum withdrawal is ₦300,000'); return; }
    if (amount > (user?.balance || 0)) { toast.error('Insufficient balance'); return; }
    if (!selectedBank) { toast.error('Select a bank account'); return; }
    setSaving(true);
    try {
      const res = await api.post('/users/withdrawal-request', {
        amount, bank_account_id: selectedBank,
      });
      setWithdrawals(prev => [res.data.data, ...prev]);
      setShowWithdrawForm(false);
      setWithdrawAmount('');
      toast.success('Withdrawal request submitted! Processing within 24-48 hours.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed';
      toast.error(msg);
    }
    finally { setSaving(false); }
  };

  const inputCls = 'input-field';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-7 h-7 text-primary-600" /> My Wallet
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track earnings, manage bank accounts, and request withdrawals</p>
      </div>

      {/* Balance card */}
      <div className="hero-gradient rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <p className="text-blue-200 text-sm mb-1">Available Balance</p>
        <p className="font-display text-5xl font-extrabold mb-4">{formatCurrency(user?.balance || 0)}</p>
        <div className="flex gap-3">
          <button onClick={() => setShowWithdrawForm(true)}
            disabled={(user?.balance || 0) < 10000}
            className="bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
          {(user?.balance || 0) < 10000 && (
            <p className="text-blue-200 text-xs self-center">
              Need ₦{(10000 - (user?.balance || 0)).toLocaleString()} more to withdraw
            </p>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-emerald-600 font-display text-xl font-bold">
            {formatCurrency(transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total Earned</p>
        </div>
        <div className="card text-center">
          <p className="text-red-500 font-display text-xl font-bold">
            {formatCurrency(transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total Withdrawn</p>
        </div>
        <div className="card text-center">
          <p className="text-amber-500 font-display text-xl font-bold">
            {withdrawals.filter(w => w.status === 'pending').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Pending Requests</p>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-primary-600" /> Bank Accounts
          </h2>
          <button onClick={() => setShowBankForm(!showBankForm)}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold">
            <Plus className="w-4 h-4" /> Add Bank
          </button>
        </div>

        {showBankForm && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4 space-y-3">
            <div>
              <label className="label">Bank Name</label>
              <select value={bankForm.bank_name} onChange={e => setBankForm({ ...bankForm, bank_name: e.target.value })} className={inputCls}>
                <option value="">Select bank...</option>
                {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Account Number</label>
              <input value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })}
                className={inputCls} placeholder="10-digit account number" maxLength={10} />
            </div>
            <div>
              <label className="label">Account Name</label>
              <input value={bankForm.account_name} onChange={e => setBankForm({ ...bankForm, account_name: e.target.value })}
                className={inputCls} placeholder="As on bank records" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowBankForm(false)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleAddBank} disabled={saving} className="flex-1 btn-primary py-2 text-sm">
                {saving ? 'Saving...' : 'Save Account'}
              </button>
            </div>
          </div>
        )}

        {bankAccounts.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No bank account added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bankAccounts.map(account => (
              <div key={account.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{account.bank_name}</p>
                  <p className="text-xs text-slate-500">{account.account_number} · {account.account_name}</p>
                </div>
                {account.is_default && <span className="badge badge-success">Default</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Request Form */}
      {showWithdrawForm && (
        <div className="card border-2 border-primary-200 dark:border-primary-800">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Request Withdrawal</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Amount (₦)</label>
              <input value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                type="number" min="10000" max="300000" className={inputCls}
                placeholder="Min ₦10,000 — Max ₦300,000" />
              <p className="text-xs text-slate-400 mt-1">Available: {formatCurrency(user?.balance || 0)}</p>
            </div>
            <div>
              <label className="label">Select Bank Account</label>
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-amber-600">Please add a bank account first</p>
              ) : (
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className={inputCls}>
                  <option value="">Select account...</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bank_name} — {b.account_number}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
              <p className="text-amber-700 dark:text-amber-400 text-xs">⏰ Withdrawals are processed within 24-48 hours after approval by admin.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWithdrawForm(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm">Cancel</button>
              <button onClick={handleWithdraw} disabled={saving || bankAccounts.length === 0} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Withdrawal History</h2>
          <div className="space-y-3">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  w.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  w.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                )}>
                  {w.status === 'paid' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                   w.status === 'rejected' ? <ArrowDownLeft className="w-5 h-5 text-red-500" /> :
                   <Clock className="w-5 h-5 text-amber-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{formatCurrency(w.amount)}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(w.created_at)}</p>
                </div>
                <span className={cn('badge',
                  w.status === 'paid' ? 'badge-success' :
                  w.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                )}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Transaction History</h2>
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  tx.type === 'credit' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                )}>
                  {tx.type === 'credit'
                    ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{tx.description}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(tx.created_at)}</p>
                </div>
                <span className={cn('font-bold text-sm', tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500')}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
