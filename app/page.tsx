'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar, NavTab } from '../components/Sidebar';
import { DashboardView } from '../components/DashboardView';
import { OrdersView } from '../components/OrdersView';
import { DoctorsView } from '../components/DoctorsView';
import { CollectorsView } from '../components/CollectorsView';
import { CouponsView } from '../components/CouponsView';
import { CommissionView } from '../components/CommissionView';
import { ConfigView } from '../components/ConfigView';
import { LoginModal } from '../components/LoginModal';
import { CitiesView } from '../components/CitiesView';
import { PharmaView } from '../components/PharmaView';

import {
  Activity,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Key,
  Lock,
  Smartphone,
} from 'lucide-react';

import {
  DashboardStats,
  Order,
  Doctor,
  BloodCollector,
  Coupon,
  City,
} from '../types/admin';


import {
  getDashboardStatsApi,
  getDoctorsApi,
  getBloodCollectorsApi,
  getCouponsApi,
  getOrdersApi,
  getAuthToken,
  sendOtpApi,
  verifyOtpApi,
  getCitiesApi,
} from '../lib/api';


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Full-screen Login Form state
  const [loginStep, setLoginStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState<string>('9999999999');
  const [otp, setOtp] = useState<string>('123456');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Direct modal trigger helpers
  const [openCollectorModalDirect, setOpenCollectorModalDirect] = useState<boolean>(false);
  const [openCouponModalDirect, setOpenCouponModalDirect] = useState<boolean>(false);

  // Application Data State
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 142,
    activeOrders: 18,
    completedOrders: 124,
    totalRevenue: 284900,
    totalDoctors: 34,
    pendingDoctorApprovals: 3,
    totalCollectors: 12,
    activeCouponsCount: 4,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [collectors, setCollectors] = useState<BloodCollector[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cities, setCities] = useState<City[]>([]);


  const refreshAllData = async () => {
    try {
      const [statsRes, doctorsRes, collectorsRes, couponsRes, ordersRes, citiesRes] = await Promise.all([
        getDashboardStatsApi(),
        getDoctorsApi(),
        getBloodCollectorsApi(),
        getCouponsApi(),
        getOrdersApi(),
        getCitiesApi(),
      ]);

      setStats(statsRes);
      setDoctors(doctorsRes);
      setCollectors(collectorsRes);
      setCoupons(couponsRes);
      setOrders(ordersRes);
      setCities(citiesRes);
    } catch (e) {
      console.warn('Using preview data fallback', e);
    }
  };


  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
      refreshAllData();
    }
    setIsCheckingAuth(false);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      await sendOtpApi(mobileNumber);
      setLoginStep('otp');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await verifyOtpApi(mobileNumber, otp);
      if (res.success) {
        setIsLoggedIn(true);
        refreshAllData();
      } else {
        setAuthError('Invalid OTP code');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setAuthLoading(true);
    try {
      await verifyOtpApi('9999999999', '123456');
      setIsLoggedIn(true);
      refreshAllData();
    } catch (e) {
      setIsLoggedIn(true);
      refreshAllData();
    } finally {
      setAuthLoading(false);
    }
  };

  const pendingApprovalsCount = doctors.filter(d => !d.isApproved).length;
  const activeOrdersCount = orders.filter(
    o => o.status !== 'report_ready' && o.status !== 'cancelled'
  ).length;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="flex items-center space-x-3">
          <Activity className="h-5 w-5 text-zinc-400 animate-spin" />
          <span className="text-xs font-medium text-zinc-400">Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: Render Full Screen Admin Authentication Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-zinc-800 selection:text-white relative overflow-hidden">
        {/* Minimal Header */}
        <header className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/20 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide uppercase">DIGONTOM</h1>
              <p className="text-[10px] text-zinc-500">Diagnostic Operations Control</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 font-medium">
            Authorization Required
          </span>
        </header>

        {/* Auth Form Center Container */}
        <main className="flex-1 flex items-center justify-center p-4 z-10 my-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-sm w-full shadow-xl space-y-6 animate-fade-in relative">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Admin Authentication</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Enter your admin mobile number to receive a secure OTP verification code.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
                {authError}
              </div>
            )}

            {loginStep === 'mobile' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9999999999"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-4 py-2 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-0 transition"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Demo Administrator Mobile: <span className="font-mono text-zinc-300 font-bold">9999999999</span>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{authLoading ? 'Requesting OTP...' : 'Send OTP Code'}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-950" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-lg text-center text-base font-mono font-bold tracking-widest text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1.5 block text-center">
                    OTP sent to {mobileNumber}. Test code: <span className="font-mono text-zinc-300 font-bold">123456</span>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-950" />
                  <span>{authLoading ? 'Verifying...' : 'Verify OTP & Enter'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginStep('mobile')}
                  className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-300 transition text-center"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-5 text-center text-[10px] text-zinc-600 border-t border-zinc-900">
          © 2026 Digontom Diagnostic Services. Authorized Admin Access Only.
        </footer>
      </div>
    );
  }

  // IF LOGGED IN: Render Full Admin Dashboard
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Top Header */}
      <Header
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => {}}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingApprovalsCount={pendingApprovalsCount}
          activeOrdersCount={activeOrdersCount}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentOrders={orders}
              doctors={doctors}
              collectors={collectors}
              coupons={coupons}
              setActiveTab={setActiveTab}
              onOpenAddCollector={() => {
                setActiveTab('collectors');
                setOpenCollectorModalDirect(true);
              }}
              onOpenCreateCoupon={() => {
                setActiveTab('coupons');
                setOpenCouponModalDirect(true);
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              collectors={collectors}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorsView
              doctors={doctors}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'collectors' && (
            <CollectorsView
              collectors={collectors}
              onRefresh={refreshAllData}
              showAddModalDirectly={openCollectorModalDirect}
              onCloseAddModalDirectly={() => setOpenCollectorModalDirect(false)}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsView
              coupons={coupons}
              onRefresh={refreshAllData}
              showCreateModalDirectly={openCouponModalDirect}
              onCloseCreateModalDirectly={() => setOpenCouponModalDirect(false)}
            />
          )}

          {activeTab === 'commission' && (
            <CommissionView doctors={doctors} />
          )}

          {activeTab === 'config' && <ConfigView />}

          {activeTab === 'cities' && (
            <CitiesView
              cities={cities}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'pharma' && (
            <PharmaView />
          )}
        </main>

      </div>
    </div>
  );
}
