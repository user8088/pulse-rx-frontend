'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, ExternalLink, Trash2 } from 'lucide-react';
import type { Prescription } from '@/types/prescription';

interface Props {
  orderId: number;
  /** Only show prescriptions for items whose IDs are in this set */
  rxItemIds: number[];
  /** Map of order_item_id → product name for display */
  itemNames: Record<number, string>;
}

const STATUS_BADGE: Record<Prescription['status'], { cls: string; label: string }> = {
  pending: { cls: 'bg-amber-100 text-amber-800', label: 'Pending' },
  approved: { cls: 'bg-green-100 text-green-800', label: 'Approved' },
  rejected: { cls: 'bg-red-100 text-red-800', label: 'Rejected' },
};

export default function PrescriptionReview({ orderId, rxItemIds, itemNames }: Props) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/prescriptions?order_id=${orderId}`);
      if (!res.ok) { setPrescriptions([]); return; }
      const json = await res.json();
      setPrescriptions(json.data ?? json ?? []);
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  const handleReview = async (id: number, status: 'approved' | 'rejected', notes?: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/dashboard/prescriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notes || undefined }),
      });
      await fetchPrescriptions();
    } finally {
      setActionLoading(null);
      setRejectId(null);
      setRejectNotes('');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this prescription?')) return;
    setActionLoading(id);
    try {
      await fetch(`/api/dashboard/prescriptions/${id}`, { method: 'DELETE' });
      await fetchPrescriptions();
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewFile = async (id: number) => {
    try {
      const res = await fetch(`/api/dashboard/prescriptions/${id}/file`);
      if (!res.ok) { alert('Could not retrieve file URL.'); return; }
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch {
      alert('Could not retrieve file URL.');
    }
  };

  const filtered = prescriptions.filter(p => rxItemIds.includes(p.order_item_id));

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#01AC28] rounded-full animate-spin mx-auto mb-2" />
        Loading prescriptions...
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="py-4 text-sm text-gray-500">No prescriptions have been uploaded for this order yet.</p>
    );
  }

  const grouped = new Map<number, Prescription[]>();
  for (const rx of filtered) {
    const list = grouped.get(rx.order_item_id) ?? [];
    list.push(rx);
    grouped.set(rx.order_item_id, list);
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([itemId, rxList]) => (
        <div key={itemId}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            {itemNames[itemId] || `Item #${itemId}`}
          </p>
          <div className="space-y-3">
            {rxList.map(rx => {
              const badge = STATUS_BADGE[rx.status];
              const busy = actionLoading === rx.id;
              return (
                <div key={rx.id} className="flex items-start gap-4 border border-gray-100 rounded-xl p-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {rx.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {rx.status === 'pending' && <Clock className="w-5 h-5 text-amber-500" />}
                    {rx.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        Uploaded {new Date(rx.created_at).toLocaleString()}
                      </span>
                      {rx.reviewed_at && (
                        <span className="text-xs text-gray-400">
                          · Reviewed {new Date(rx.reviewed_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {rx.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{rx.notes}</p>
                    )}

                    {/* Reject form */}
                    {rejectId === rx.id && (
                      <div className="space-y-2">
                        <textarea
                          value={rejectNotes}
                          onChange={e => setRejectNotes(e.target.value)}
                          placeholder="Reason for rejection (optional)..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(rx.id, 'rejected', rejectNotes)}
                            disabled={busy}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => { setRejectId(null); setRejectNotes(''); }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleViewFile(rx.id)}
                      title="View file"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#01AC28] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {rx.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReview(rx.id, 'approved')}
                          disabled={busy}
                          title="Approve"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRejectId(rx.id)}
                          disabled={busy}
                          title="Reject"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(rx.id)}
                      disabled={busy}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
