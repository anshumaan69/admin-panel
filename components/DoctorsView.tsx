'use client';

import React, { useState } from 'react';
import { Doctor } from '../types/admin';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Percent,
  Phone,
  Mail,
  Award,
  AlertCircle,
  X,
  FileText,
  Share2,
} from 'lucide-react';
import { approveDoctorApi, updateDoctorCommissionApi } from '../lib/api';

interface DoctorsViewProps {
  doctors: Doctor[];
  onRefresh: () => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({ doctors, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Approval Modal State
  const [approveModalDoc, setApproveModalDoc] = useState<Doctor | null>(null);
  const [isApprovedInput, setIsApprovedInput] = useState<boolean>(true);
  const [notesInput, setNotesInput] = useState<string>('');

  // Commission Modal State
  const [commissionModalDoc, setCommissionModalDoc] = useState<Doctor | null>(null);
  const [bookingCommInput, setBookingCommInput] = useState<number>(10);
  const [referralCommInput, setReferralCommInput] = useState<number>(5);

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveModalDoc) return;

    setLoading(true);
    try {
      await approveDoctorApi(approveModalDoc.id, isApprovedInput, notesInput);
      showToast(
        `Doctor ${approveModalDoc.fullName} ${isApprovedInput ? 'Approved' : 'Rejected'} successfully!`
      );
      setApproveModalDoc(null);
      setNotesInput('');
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionModalDoc) return;

    setLoading(true);
    try {
      await updateDoctorCommissionApi(commissionModalDoc.id, bookingCommInput, referralCommInput);
      showToast(`Commission updated for Dr. ${commissionModalDoc.fullName}`);
      setCommissionModalDoc(null);
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.mobileNumber.includes(searchTerm) ||
      (doc.email && doc.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && doc.isApproved) ||
      (statusFilter === 'pending' && !doc.isApproved);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-xs shadow-xl border border-zinc-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <UserCheck className="h-4.5 w-4.5 text-zinc-400" /> Doctors Directory & Verification
          </h2>
          <p className="text-xs text-zinc-550 mt-1">
            Review registered doctors, verify credentials, and manage test booking & referral commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-550" />
            <input
              type="text"
              placeholder="Search doctor by name, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 w-52 text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs rounded-lg text-zinc-250 focus:outline-none focus:border-zinc-700"
          >
            <option value="all">All Doctor Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Verified / Approved</option>
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-450 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Doctor Info</th>
                <th className="px-6 py-4">Qualifications</th>
                <th className="px-6 py-4">Status & Code</th>
                <th className="px-6 py-4">Commissions (Booking / Referral)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No doctors found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map(doc => (
                  <tr key={doc.id} className="hover:bg-zinc-950/40 transition">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white block text-xs">{doc.fullName}</span>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-zinc-600" /> {doc.mobileNumber}
                        </span>
                        {doc.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-zinc-600" /> {doc.email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-zinc-400" /> {doc.qualification || 'MBBS'}
                      </div>
                      <div className="text-[10px] text-zinc-500">{doc.specialization || 'General Practice'}</div>
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      {doc.isApproved ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[10px] font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-450 border border-amber-500/20 text-[10px] font-medium inline-flex items-center gap-1 animate-pulse">
                          <AlertCircle className="h-3 w-3" /> Pending Approval
                        </span>
                      )}
                      {doc.referralCode && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">
                            Code: {doc.referralCode}
                          </span>
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/register?ref=${doc.referralCode}`;
                              navigator.clipboard.writeText(shareUrl);
                              showToast(`Referral link copied!`);
                            }}
                            title="Copy Referral Link"
                            className="p-1 rounded bg-zinc-950 hover:bg-zinc-850 text-zinc-500 hover:text-white border border-zinc-850 transition"
                          >
                            <Share2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 text-xs font-mono">
                          Booking: {doc.bookingCommissionPercentage}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 text-xs font-mono">
                          Referral: {doc.referralCommissionPercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setApproveModalDoc(doc);
                          setIsApprovedInput(doc.isApproved);
                          setNotesInput(doc.notes || '');
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition"
                      >
                        Verification
                      </button>

                      <button
                        onClick={() => {
                          setCommissionModalDoc(doc);
                          setBookingCommInput(doc.bookingCommissionPercentage || 10);
                          setReferralCommInput(doc.referralCommissionPercentage || 5);
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition inline-flex items-center gap-1"
                      >
                        <Percent className="h-3 w-3" /> Commission
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Doctor Verification / Approval */}
      {approveModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-zinc-450" /> Doctor Verification & Approval
              </h3>
              <button onClick={() => setApproveModalDoc(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 font-mono">
              Doctor: <span className="font-semibold text-white">{approveModalDoc.fullName}</span> ({approveModalDoc.mobileNumber})
            </p>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2">Account Status</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="approvalStatus"
                      checked={isApprovedInput}
                      onChange={() => setIsApprovedInput(true)}
                      className="text-zinc-200 focus:ring-zinc-500 accent-zinc-500"
                    />
                    <span className="text-xs font-semibold text-emerald-450">Approved & Verified</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="approvalStatus"
                      checked={!isApprovedInput}
                      onChange={() => setIsApprovedInput(false)}
                      className="text-zinc-200 focus:ring-zinc-500 accent-zinc-500"
                    />
                    <span className="text-xs font-semibold text-rose-450">Unapproved / Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Approval Notes / Reason</label>
                <textarea
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="e.g. Medical license verified by senior admin..."
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs h-24 text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setApproveModalDoc(null)}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Doctor Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Doctor Commission Configuration */}
      {commissionModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Percent className="h-4.5 w-4.5 text-zinc-400" /> Configure Doctor Commissions
              </h3>
              <button onClick={() => setCommissionModalDoc(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-455 mb-4 font-mono">
              Doctor: <span className="font-semibold text-white">{commissionModalDoc.fullName}</span>
            </p>

            <form onSubmit={handleCommissionSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Direct Test Booking Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={bookingCommInput}
                  onChange={e => setBookingCommInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Commission earned when doctor directly books a test for patient.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Referral Code Commission (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={referralCommInput}
                  onChange={e => setReferralCommInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Commission earned when customer uses doctor's referral code.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setCommissionModalDoc(null)}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Commission Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
