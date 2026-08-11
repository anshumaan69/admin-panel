'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Smartphone, 
  Key, 
  User, 
  Mail, 
  Tag, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { sendPatientOtpApi, verifyPatientOtpApi, registerPatientApi } from '../../lib/api';

function RegistrationForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regToken, setRegToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Send OTP handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sendPatientOtpApi(mobileNumber);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.error?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyPatientOtpApi(mobileNumber, otp);
      if (res.success) {
        if (res.data.isRegistered) {
          setError('This mobile number is already registered! You can log in using your customer app.');
          setStep(1);
        } else {
          setRegToken(res.data.registrationToken);
          setStep(3);
        }
      } else {
        setError(res.error?.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  // Register Customer handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await registerPatientApi(regToken, fullName, email, referralCode);
      if (res.success) {
        setSuccessMsg(`Welcome to Digontom, ${fullName}! Your referral discount is applied.`);
        setStep(4);
      } else {
        setError(res.error?.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error registering account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-white/15 shadow-2xl space-y-6 relative">
      {/* Glow Effects */}
      <div className="absolute -top-10 -left-10 w-40 h-40 gradient-glow-indigo rounded-full pointer-events-none opacity-40"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-glow-teal rounded-full pointer-events-none opacity-40"></div>

      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-lg">
          <Activity className="h-6 w-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Patient Registration</h2>
        <p className="text-xs text-slate-400">
          Sign up for Digontom diagnostic packages with referral benefits.
        </p>
      </div>

      {referralCode && step < 4 && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center justify-center gap-1.5 font-medium animate-pulse">
          <ShieldCheck className="h-4 w-4" />
          <span>Referral Code applied: <strong>{referralCode}</strong></span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono text-white bg-slate-900/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !mobileNumber}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Sending OTP...' : 'Verify Mobile via OTP'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono tracking-widest text-white text-center font-bold bg-slate-900/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-teal-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{loading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-slate-900/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-slate-900/40"
              />
            </div>
          </div>

          {referralCode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Referral Code (Applied)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={referralCode}
                  disabled
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm text-emerald-300 font-semibold font-mono bg-emerald-500/5 border-emerald-500/20 select-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !fullName}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="space-y-6 text-center animate-fade-in py-4">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Registration Complete!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {successMsg}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300 leading-relaxed max-w-xs mx-auto">
            You can now open the Digontom patient mobile application or website to book your blood test packages.
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientRegistrationPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Glowing Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 gradient-glow-indigo rounded-full pointer-events-none opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 gradient-glow-teal rounded-full pointer-events-none opacity-60"></div>

      {/* Header */}
      <header className="p-6 border-b border-white/10 flex items-center justify-between glass-panel z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-teal-500 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="h-5 w-5 text-teal-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">DIGONTOM</h1>
            <p className="text-xs text-slate-400">Blood Test Referral Program</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
          Referral Discount Applied
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-8">
        <Suspense fallback={
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-white/15 shadow-2xl flex flex-col items-center justify-center space-y-4 text-slate-300">
            <Activity className="h-8 w-8 text-indigo-400 animate-spin" />
            <span className="text-xs font-mono">Loading Referral Form...</span>
          </div>
        }>
          <RegistrationForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-white/5 z-10">
        © 2026 Digontom Diagnostic Services. All rights reserved.
      </footer>
    </div>
  );
}
