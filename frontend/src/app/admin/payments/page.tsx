'use client';
import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { Payment } from '@/types';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getPayments()
      .then(res => setPayments(res.data.data))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id: string) => {
    setVerifying(id);
    try {
      const res = await adminApi.verifyPayment(id);
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'success' } : p));
      toast.success('Payment verified');
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(null);
    }
  };

  const filtered = payments.filter(p =>
    p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    p.payment_reference?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Payment Management</h1>
        <p className="text-slate-400 text-sm mt-1">Track and verify all transactions</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-emerald-400 font-display text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="text-slate-500 text-xs mt-1">Total Revenue</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-white font-display text-2xl font-bold">{payments.length}</p>
          <p className="text-slate-500 text-xs mt-1">Total Transactions</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-amber-400 font-display text-2xl font-bold">{pendingCount}</p>
          <p className="text-slate-500 text-xs mt-1">Pending</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500"
          placeholder="Search by name, email, or reference..." />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-800 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['User', 'Amount', 'Type', 'Reference', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{payment.user?.fullname}</p>
                      <p className="text-slate-500 text-xs">{payment.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', payment.type === 'membership' ? 'badge-info' : 'badge-warning')}>
                        {payment.type || 'membership'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[140px] truncate">{payment.payment_reference}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge',
                        payment.status === 'success' ? 'badge-success' :
                        payment.status === 'failed' ? 'badge-danger' : 'badge-warning'
                      )}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateTime(payment.created_at)}</td>
                    <td className="px-4 py-3">
                      {payment.status === 'pending' && (
                        <button onClick={() => handleVerify(payment.id)} disabled={verifying === payment.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg text-xs font-medium transition-all">
                          {verifying === payment.id
                            ? <RefreshCw className="w-3 h-3 animate-spin" />
                            : <CheckCircle className="w-3 h-3" />}
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
