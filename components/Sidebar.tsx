'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  UserCheck,
  Syringe,
  Ticket,
  DollarSign,
  Sliders,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  MapPin,
  Pill,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'orders' | 'doctors' | 'collectors' | 'coupons' | 'commission' | 'config' | 'cities' | 'pharma';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingApprovalsCount?: number;
  activeOrdersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount = 0,
  activeOrdersCount = 0,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders' as NavTab,
      label: 'Orders & Dispatch',
      icon: ShoppingCart,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'doctors' as NavTab,
      label: 'Doctors Management',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
    },
    {
      id: 'collectors' as NavTab,
      label: 'Blood Collectors',
      icon: Syringe,
      badge: null,
    },
    {
      id: 'coupons' as NavTab,
      label: 'Coupons & Offers',
      icon: Ticket,
      badge: null,
    },
    {
      id: 'commission' as NavTab,
      label: 'Commission Reports',
      icon: DollarSign,
      badge: null,
    },
    {
      id: 'config' as NavTab,
      label: 'Global Settings',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'cities' as NavTab,
      label: 'Serviceable Cities',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'pharma' as NavTab,
      label: 'Pharmacy Store',
      icon: Pill,
      badge: null,
    },
  ];


  return (
    <aside className="w-64 bg-zinc-900/30 border-r border-zinc-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                    isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700/60'
                      : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {!item.badge && isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
        <div className="flex items-center space-x-2 text-zinc-400">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium text-white">System Status</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Diagnostic API engine active. Backend port 3000 connected.
        </p>
        <div className="pt-0.5 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
          <span>v1.2.0</span>
          <span className="text-emerald-500">HTTP 200</span>
        </div>
      </div>
    </aside>
  );
};
