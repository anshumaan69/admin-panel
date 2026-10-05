'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Server, Search, Bell, Settings, LogOut, Key } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, getAuthToken, setAuthToken } from '../lib/api';

interface HeaderProps {
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, isLoggedIn }) => {
  const [apiUrl, setUrl] = useState<string>('http://nlxi448mx3uwcr4oj3yjhjod.187.127.157.13.sslip.io/api/v1');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);

  useEffect(() => {
    const currentBase = getApiBaseUrl();
    setUrl(currentBase);
    // Test backend connectivity
    const rootUrl = currentBase.replace(/\/api\/v1\/?$/, '');
    fetch(`${rootUrl}/health`)
      .then(res => setIsLiveApi(res.ok))
      .catch(() => setIsLiveApi(false));
  }, []);

  const handleSaveUrl = () => {
    setApiBaseUrl(apiUrl);
    setShowConfigModal(false);
    window.location.reload();
  };

  const handleLogout = () => {
    setAuthToken('');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Brand & API Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Activity className="h-4 w-4 text-zinc-350" />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white tracking-wider flex items-center gap-1.5 uppercase">
              DIGONTOM <span className="text-[9px] tracking-normal normal-case px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40 font-normal">Console</span>
            </h1>
            <p className="text-[10px] text-zinc-500">Diagnostic Operations Control</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-zinc-800">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-2 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/80 text-xs transition"
          >
            <Server className={`h-3 w-3 ${isLiveApi ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="text-zinc-400 font-mono text-[10px] truncate max-w-[150px]">{apiUrl}</span>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${isLiveApi ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-550" />
          <input
            type="text"
            placeholder="Search console..."
            className="pl-8 pr-3 py-1 text-xs rounded-lg bg-zinc-950 border border-zinc-850 w-56 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-650 focus:ring-0 transition"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-zinc-100 rounded-full"></span>
        </button>

        {/* Admin User Badge */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-3 pl-3 border-l border-zinc-800">
            <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] font-medium text-zinc-300">System Admin</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-450 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition"
          >
            <Key className="h-3 w-3 text-zinc-950" />
            <span>Admin Login</span>
          </button>
        )}
      </div>

      {/* Backend URL Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-zinc-400" /> API Connection Endpoint
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Configure the base URL of your backend server API endpoint.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Backend API Base URL</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 transition"
                  placeholder="http://nlxi448mx3uwcr4oj3yjhjod.187.127.157.13.sslip.io/api/v1"
                />
              </div>
              <div className="flex items-center justify-between text-xs bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                <span className="text-zinc-500">Live Status:</span>
                <span className={`font-semibold flex items-center gap-1.5 ${isLiveApi ? 'text-emerald-500' : 'text-amber-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isLiveApi ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {isLiveApi ? 'Connected to Backend' : 'Backend Offline (Using Mock Fallback)'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-450 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUrl}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition shadow-sm"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
