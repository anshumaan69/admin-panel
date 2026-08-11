'use client';

import React, { useState } from 'react';
import { Coupon } from '../types/admin';
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  Calendar,
  X,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { createCouponApi, updateCouponApi, deleteCouponApi } from '../lib/api';

interface CouponsViewProps {
  coupons: Coupon[];
  onRefresh: () => void;
  showCreateModalDirectly?: boolean;
  onCloseCreateModalDirectly?: () => void;
}

export const CouponsView: React.FC<CouponsViewProps> = ({
  coupons,
  onRefresh,
  showCreateModalDirectly = false,
  onCloseCreateModalDirectly,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(showCreateModalDirectly);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minimumOrderValue, setMinimumOrderValue] = useState<number>(500);
  const [validFrom, setValidFrom] = useState<string>('2026-07-01T00:00:00.000Z');
  const [validUntil, setValidUntil] = useState<string>('2026-12-31T23:59:59.000Z');
  const [usageLimit, setUsageLimit] = useState<number | null>(100);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    if (onCloseCreateModalDirectly) onCloseCreateModalDirectly();
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(20);
    setMinimumOrderValue(500);
    setValidFrom(new Date().toISOString());
    setValidUntil(new Date(Date.now() + 86400000 * 90).toISOString());
    setUsageLimit(100);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinimumOrderValue(coupon.minimumOrderValue);
    setValidFrom(coupon.validFrom);
    setValidUntil(coupon.validUntil);
    setUsageLimit(coupon.usageLimit !== undefined ? coupon.usageLimit : null);
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || discountValue <= 0) return;

    setLoading(true);
    try {
      const payload = {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minimumOrderValue,
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        usageLimit,
        isActive,
      };

      if (editingCoupon) {
        await updateCouponApi(editingCoupon.id, payload);
        showToast(`Coupon ${code.toUpperCase()} updated!`);
      } else {
        await createCouponApi(payload);
        showToast(`Coupon ${code.toUpperCase()} created successfully!`);
      }

      handleCloseModal();
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) return;
    setLoading(true);
    try {
      await deleteCouponApi(couponId);
      showToast(`Coupon ${couponCode} deleted.`);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await updateCouponApi(coupon.id, { isActive: !coupon.isActive });
      showToast(`Coupon ${coupon.code} is now ${!coupon.isActive ? 'Active' : 'Inactive'}`);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-xs shadow-xl border border-zinc-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Ticket className="h-4.5 w-4.5 text-zinc-400" /> Promo Coupons & Discount Offers
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Create promotional coupon codes for blood test checkout discounts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-550" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 w-52 text-zinc-200 uppercase font-mono focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-950" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-450 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Discount Value</th>
                <th className="px-6 py-4">Min. Order Value</th>
                <th className="px-6 py-4">Validity Period</th>
                <th className="px-6 py-4">Status & Usage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No promo coupons found. Click "Create Coupon" to add one!
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-zinc-950/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-mono font-bold text-white text-xs bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {coupon.code}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-200">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-zinc-400">
                        ₹{coupon.minimumOrderValue}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-[11px] text-zinc-450 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-zinc-650" />
                        <span>{new Date(coupon.validFrom).toLocaleDateString()}</span>
                        <span className="text-zinc-600">to</span>
                        <span>{new Date(coupon.validUntil).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className="flex items-center self-start"
                        >
                          {coupon.isActive ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 font-medium flex items-center gap-1 text-[10px]">
                              <ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-500 border border-zinc-850 font-medium flex items-center gap-1 text-[10px]">
                              <ToggleLeft className="h-3.5 w-3.5 text-zinc-600" /> Inactive
                            </span>
                          )}
                        </button>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Usages: {coupon.usedCount ?? 0} / {coupon.usageLimit ?? '∞'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-450 hover:text-zinc-200 border border-zinc-800 transition"
                        title="Edit Coupon"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-450 hover:text-rose-500 border border-zinc-800 transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      {(isModalOpen || showCreateModalDirectly) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Ticket className="h-4.5 w-4.5 text-zinc-400" />
                {editingCoupon ? 'Edit Promo Coupon' : 'Create Promo Coupon'}
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HEALTH20"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono uppercase font-bold text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Discount Value ({discountType === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={discountValue}
                    onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={minimumOrderValue}
                  onChange={e => setMinimumOrderValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Usage Limit (Max Total Usages)</label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit !== null ? usageLimit : ''}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setUsageLimit(isNaN(val) ? null : val);
                  }}
                  placeholder="e.g. 100 (Leave empty for unlimited)"
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={validFrom.slice(0, 16)}
                    onChange={e => setValidFrom(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={validUntil.slice(0, 16)}
                    onChange={e => setValidUntil(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
