'use client';

import React, { useState, useEffect } from 'react';
import { GlobalConfig } from '../types/admin';
import {
  Sliders,
  CheckCircle2,
  Server,
  Key,
  CreditCard,
  Percent,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { getGlobalConfigApi, updateGlobalConfigApi, getApiBaseUrl } from '../lib/api';

export const ConfigView: React.FC = () => {
  const [config, setConfig] = useState<GlobalConfig>({
    defaultBookingCommission: 12.0,
    defaultReferralCommission: 6.0,
    smsGatewayApiKey: 'SG_PROD_API_KEY_9928310',
    paymentGatewayConfig: { provider: 'Razorpay', liveMode: true },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionResult, setConnectionResult] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadConfig = async () => {
    try {
      const data = await getGlobalConfigApi();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGlobalConfigApi(config);
      showToast('Global platform settings updated successfully!');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl.replace('/api/v1', '')}/health`);
      if (res.ok) {
        setConnectionResult('SUCCESS: Backend Node.js engine active on port 3000!');
      } else {
        setConnectionResult(`WARNING: HTTP ${res.status} returned from server.`);
      }
    } catch (err: any) {
      setConnectionResult(`FAILED: Could not connect to ${baseUrl}. (${err.message})`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-xs shadow-xl border border-zinc-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Sliders className="h-4.5 w-4.5 text-zinc-450" /> Global Platform Configuration
        </h2>
        <p className="text-xs text-zinc-555 mt-1">
          Configure default doctor commissions, SMS notification gateway keys, and test backend API connectivity.
        </p>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* Default Doctor Commission Rates */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 space-y-4">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Percent className="h-4 w-4 text-zinc-400" /> Default Doctor Commission Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Default Direct Booking Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={config.defaultBookingCommission}
                onChange={e =>
                  setConfig({ ...config, defaultBookingCommission: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Applied to newly registered doctors by default.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Default Patient Referral Code Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={config.defaultReferralCommission}
                onChange={e =>
                  setConfig({ ...config, defaultReferralCommission: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Applied when patients use doctor's referral promo code.
              </span>
            </div>
          </div>
        </div>

        {/* Integration API Keys */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 space-y-4">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Key className="h-4 w-4 text-zinc-400" /> External Gateway Keys
          </h3>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">SMS Gateway API Key</label>
            <input
              type="text"
              value={config.smsGatewayApiKey}
              onChange={e => setConfig({ ...config, smsGatewayApiKey: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-850 text-xs">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-zinc-450" />
              <span className="text-zinc-400 font-medium">Payment Gateway Integration:</span>
              <span className="text-zinc-250 font-semibold">Razorpay (Live Mode)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[10px] font-semibold">
              Active
            </span>
          </div>
        </div>

        {/* Diagnostic Tool */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 space-y-3">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <Server className="h-4 w-4 text-zinc-400" /> Backend Engine Diagnostic
          </h3>
          <p className="text-xs text-zinc-500">
            Check HTTP health and REST endpoint readiness for Digontom Blood-Test backend on port 3000.
          </p>

          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={testBackendConnection}
              disabled={testingConnection}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing...' : 'Run Connection Test'}</span>
            </button>
          </div>

          {connectionResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono mt-2 border ${
                connectionResult.startsWith('SUCCESS')
                  ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-450 border-amber-500/20'
              }`}
            >
              {connectionResult}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition disabled:opacity-50"
          >
            <Zap className="h-4 w-4 text-zinc-950" />
            <span>{loading ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
