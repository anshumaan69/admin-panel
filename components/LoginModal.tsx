'use client';

import React, { useState } from 'react';
import { Key, Smartphone, ShieldCheck, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sendOtpApi, verifyOtpApi } from '../lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState<string>('9999999999');
  const [otp, setOtp] = useState<string>('123456');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendOtpApi(mobileNumber);
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyOtpApi(mobileNumber, otp);
      if (res.success) {
        onLoginSuccess();
        onClose();
      } else {
        setErrorMsg('Invalid OTP code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminBypass = async () => {
    setLoading(true);
    try {
      await verifyOtpApi('9999999999', '123456');
      onLoginSuccess();
      onClose();
    } catch (e) {
      onLoginSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-zinc-900 p-6 sm:p-8 rounded-xl max-w-sm w-full border border-zinc-800 shadow-xl relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Admin Authentication</h3>
              <p className="text-[10px] text-zinc-500">Diagnostic Operations Control</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs font-medium text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-450 mb-1">
                Admin Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="e.g. 9999999999"
                required
                className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded-lg text-xs font-mono text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-600 transition"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Standard Admin Mobile: <span className="font-mono text-zinc-350 font-semibold">9999999999</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending OTP...' : 'Send OTP Code'}</span>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-950" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-450 mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-lg text-center text-base font-mono font-bold tracking-widest text-white placeholder-zinc-750 focus:outline-none focus:border-zinc-600 transition"
              />
              <span className="text-[10px] text-zinc-500 mt-1.5 block text-center">
                OTP sent to {mobileNumber}. Demo code: <span className="font-mono text-zinc-350 font-bold">123456</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-950" />
              <span>{loading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('mobile')}
              className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-350 transition text-center"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
