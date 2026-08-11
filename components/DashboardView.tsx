'use client';

import React from 'react';
import {
  DashboardStats,
  Order,
  Doctor,
  BloodCollector,
  Coupon,
} from '../types/admin';
import {
  ShoppingCart,
  DollarSign,
  UserCheck,
  Syringe,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Plus,
  FileText,
  UserPlus,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  stats: DashboardStats;
  recentOrders: Order[];
  doctors: Doctor[];
  collectors: BloodCollector[];
  coupons: Coupon[];
  setActiveTab: (tab: NavTab) => void;
  onOpenAddCollector: () => void;
  onOpenCreateCoupon: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentOrders,
  doctors,
  collectors,
  coupons,
  setActiveTab,
  onOpenAddCollector,
  onOpenCreateCoupon,
}) => {
  const pendingDoctors = doctors.filter(d => !d.isApproved);
  const activeOrders = recentOrders.filter(o => o.status !== 'report_ready' && o.status !== 'cancelled');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800/80 rounded-xl p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-zinc-400 mb-1 text-[10px] font-semibold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Live Console Active
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Diagnostic & Phlebotomy Management
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring for blood sample collection, lab report uploads, doctor commission management, and promo offers.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenAddCollector}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium transition"
            >
              <UserPlus className="h-3.5 w-3.5 text-zinc-400" />
              <span>Add Collector</span>
            </button>
            <button
              onClick={onOpenCreateCoupon}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-950" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Blood Orders</span>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-450">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{stats?.totalOrders ?? 0}</span>
            <span className="text-[10px] text-zinc-400 font-medium flex items-center bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +14.2%
            </span>
          </div>
          <div className="mt-4 text-[10px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Active: {stats?.activeOrders ?? 0}</span>
            <span>{stats?.completedOrders ?? 0} Completed</span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Diagnostic Revenue</span>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-450">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</span>
            <span className="text-[10px] text-zinc-400 font-medium flex items-center bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +18.5%
            </span>
          </div>
          <div className="mt-4 text-[10px] text-zinc-500 font-mono">
            <span>Calculated from active blood checkups</span>
          </div>
        </div>

        {/* Doctors Card */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Registered Doctors</span>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-450">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{doctors.length}</span>
            {pendingDoctors.length > 0 && (
              <span className="text-[10px] text-amber-500 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {pendingDoctors.length} Pending
              </span>
            )}
          </div>
          <div className="mt-4 text-[10px] text-zinc-550 flex items-center justify-between">
            <span className="font-mono">Verified: {doctors.filter(d => d.isApproved).length}</span>
            <button
              onClick={() => setActiveTab('doctors')}
              className="text-zinc-400 hover:text-white transition text-[10px] font-medium"
            >
              Review Doctors →
            </button>
          </div>
        </div>

        {/* Blood Collectors & Coupons Card */}
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Phlebotomists & Coupons</span>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-450">
              <Syringe className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-4">
            <div>
              <span className="text-xl font-bold text-white">{collectors.length}</span>
              <span className="text-[10px] text-zinc-550 block font-mono">Collectors</span>
            </div>
            <div className="h-8 w-px bg-zinc-850"></div>
            <div>
              <span className="text-xl font-bold text-white">{coupons.filter(c => c.isActive).length}</span>
              <span className="text-[10px] text-zinc-550 block font-mono">Coupons</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-zinc-500 font-mono">
            <span>Service Areas: Kolkata Central & North</span>
          </div>
        </div>
      </div>

      {/* Main Section Grid: Active Dispatches & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders Stream (2 cols) */}
        <div className="lg:col-span-2 bg-zinc-900 p-5 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" /> Recent Lab Test Orders
              </h3>
              <p className="text-[11px] text-zinc-500">Latest orders placed by customers & doctors</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-[11px] text-zinc-400 hover:text-white transition font-medium flex items-center gap-1"
            >
              View All Orders ({recentOrders.length}) <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentOrders.slice(0, 4).map(order => (
              <div
                key={order.id}
                className="p-3 rounded-lg bg-zinc-950/40 hover:bg-zinc-950 border border-zinc-850/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-zinc-400">#{order.id.slice(0, 8)}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-medium border ${
                        order.status === 'placed'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : order.status === 'collector_assigned'
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : order.status === 'report_ready'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-850'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">
                    {order.customerName} • <span className="text-zinc-500 font-mono">{order.customerMobile}</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate max-w-md">
                    {order.testPackages.map(t => t.name).join(', ')}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-zinc-850 pt-2 sm:pt-0">
                  <span className="text-xs font-semibold text-white font-mono">₹{order.totalAmount}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Approvals & Quick Status (1 col) */}
        <div className="space-y-6">
          {/* Pending Doctor Approvals */}
          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-zinc-400" /> Doctor Verifications
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 text-zinc-450 border border-zinc-800 font-mono font-bold">
                {pendingDoctors.length}
              </span>
            </div>

            {pendingDoctors.length === 0 ? (
              <div className="p-4 rounded-lg bg-zinc-950/40 text-center text-xs text-zinc-500 border border-zinc-850/50">
                <CheckCircle2 className="h-4 w-4 text-zinc-500 mx-auto mb-1.5" />
                All doctor profiles are approved.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingDoctors.map(doc => (
                  <div key={doc.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-850/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{doc.fullName}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">{doc.mobileNumber}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">{doc.qualification || 'Qualification Pending'}</p>
                    <button
                      onClick={() => setActiveTab('doctors')}
                      className="w-full py-1 text-xs font-medium rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 transition"
                    >
                      Review & Approve Doctor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80 space-y-3">
            <h3 className="text-[10px] font-semibold text-zinc-550 uppercase tracking-wider">
              Quick Admin Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('orders')}
                className="p-3 rounded-lg bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-850 text-left text-xs font-medium text-zinc-350 transition space-y-1"
              >
                <FileText className="h-3.5 w-3.5 text-zinc-450" />
                <span className="block font-medium text-zinc-200">Dispatch</span>
                <span className="text-[9px] text-zinc-550 block font-normal">Assign collectors</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className="p-3 rounded-lg bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-850 text-left text-xs font-medium text-zinc-350 transition space-y-1"
              >
                <Ticket className="h-3.5 w-3.5 text-zinc-450" />
                <span className="block font-medium text-zinc-200">Coupons</span>
                <span className="text-[9px] text-zinc-550 block font-normal">Manage offers</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
