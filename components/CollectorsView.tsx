'use client';

import React, { useState } from 'react';
import { BloodCollector } from '../types/admin';
import {
  Syringe,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  User,
  Shield,
} from 'lucide-react';
import { createBloodCollectorApi, updateBloodCollectorApi } from '../lib/api';

interface CollectorsViewProps {
  collectors: BloodCollector[];
  onRefresh: () => void;
  showAddModalDirectly?: boolean;
  onCloseAddModalDirectly?: () => void;
}

export const CollectorsView: React.FC<CollectorsViewProps> = ({
  collectors,
  onRefresh,
  showAddModalDirectly = false,
  onCloseAddModalDirectly,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(showAddModalDirectly);

  // Form input state
  const [name, setName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [serviceArea, setServiceArea] = useState<string>('');
  const [photoIdUrl, setPhotoIdUrl] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    if (onCloseAddModalDirectly) onCloseAddModalDirectly();
  };

  const handleCreateCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobileNumber || !serviceArea) return;

    setLoading(true);
    try {
      await createBloodCollectorApi({
        name,
        mobileNumber,
        serviceArea,
        photoIdUrl: photoIdUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop',
        email: email || undefined,
      });

      showToast(`Blood Collector ${name} added successfully!`);
      setName('');
      setMobileNumber('');
      setServiceArea('');
      setPhotoIdUrl('');
      setEmail('');
      handleCloseModal();
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailable = async (collectorId: string, currentAvailable: boolean) => {
    try {
      await updateBloodCollectorApi(collectorId, { isAvailable: !currentAvailable });
      showToast(`Collector availability updated successfully!`);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleToggleActive = async (collectorId: string, currentActive: boolean) => {
    try {
      await updateBloodCollectorApi(collectorId, { isActive: !currentActive });
      showToast(`Collector account status updated successfully!`);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const filteredCollectors = (collectors || []).filter(
    c =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobileNumber || '').includes(searchTerm) ||
      (c.serviceArea || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            <Syringe className="h-4.5 w-4.5 text-zinc-400" /> Blood Collectors & Phlebotomists
          </h2>
          <p className="text-xs text-zinc-550 mt-1">
            Manage phlebotomy staff, service territory assignments, and contact details.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-550" />
            <input
              type="text"
              placeholder="Search by name, area..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 w-52 text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-950" />
            <span>Add Collector</span>
          </button>
        </div>
      </div>

      {/* Collectors Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCollectors.length === 0 ? (
          <div className="col-span-full bg-zinc-900 p-8 text-center text-zinc-500 rounded-xl border border-zinc-800/80">
            No blood collectors found. Click "Add Collector" to register a new phlebotomist.
          </div>
        ) : (
          filteredCollectors.map(collector => (
            <div
              key={collector.id}
              className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
                    <img
                      src={collector.photoIdUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop'}
                      alt={collector.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {collector.name}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-zinc-500" /> {collector.serviceArea}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-850 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                      <Phone className="h-3 w-3 text-zinc-600" /> Mobile:
                    </span>
                    <span className="font-mono text-zinc-400 font-semibold text-[11px]">{collector.mobileNumber}</span>
                  </div>

                  {collector.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
                        <Mail className="h-3 w-3 text-zinc-600" /> Email:
                      </span>
                      <span className="text-zinc-400 truncate max-w-[150px] text-[11px]">{collector.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-850 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-550 font-medium">Daily Work Status:</span>
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                    collector.isAvailable 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                  }`}>
                    {collector.isAvailable ? 'Working Today' : 'Off Duty'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-550 font-medium">Account Access:</span>
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                    collector.isActive 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {collector.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-850/50">
                  <span className="text-zinc-555 text-[10px] font-mono">
                    {collector.assignedOrdersCount || 0} Pickups
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAvailable(collector.id, !!collector.isAvailable)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                        collector.isAvailable
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-350'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {collector.isAvailable ? 'Set Off Duty' : 'Set Available'}
                    </button>
                    <button
                      onClick={() => handleToggleActive(collector.id, !!collector.isActive)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                        collector.isActive
                          ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-350 border border-rose-900/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-350'
                      }`}
                    >
                      {collector.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE BLOOD COLLECTOR MODAL */}
      {(isAddModalOpen || showAddModalDirectly) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Syringe className="h-4.5 w-4.5 text-zinc-450" /> Register Phlebotomist Collector
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCollector} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Barry Allen"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876511111"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Service Territory / Area *</label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={e => setServiceArea(e.target.value)}
                  placeholder="e.g. Kolkata Central & Salt Lake"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Photo / ID Image URL</label>
                <input
                  type="url"
                  value={photoIdUrl}
                  onChange={e => setPhotoIdUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. barry@digontom.com"
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                />
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
                  {loading ? 'Creating...' : 'Register Collector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
