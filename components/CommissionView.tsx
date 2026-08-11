'use client';

import React, { useState, useEffect } from 'react';
import { CommissionItem, Doctor } from '../types/admin';
import {
  DollarSign,
  Search,
  Filter,
  Calendar,
  Download,
  CheckCircle2,
  TrendingUp,
  User,
  Percent,
} from 'lucide-react';
import { getCommissionReportApi } from '../lib/api';

interface CommissionViewProps {
  doctors: Doctor[];
}

export const CommissionView: React.FC<CommissionViewProps> = ({ doctors }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reports, setReports] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getCommissionReportApi({
        doctorId: selectedDoctorId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedDoctorId, startDate, endDate]);

  const totalCommissionAmount = reports.reduce((acc, curr) => acc + curr.commissionAmount, 0);
  const bookingCommissionTotal = reports
    .filter(r => r.commissionType === 'booking')
    .reduce((acc, curr) => acc + curr.commissionAmount, 0);
  const referralCommissionTotal = reports
    .filter(r => r.commissionType === 'referral')
    .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  const handleExportCSV = () => {
    const headers = 'ID,Doctor,Order ID,Order Total,Type,Commission %,Earnings (INR),Date\n';
    const rows = reports
      .map(
        r =>
          `"${r.id}","${r.doctorName}","${r.orderId}",${r.orderTotal},"${r.commissionType}",${r.commissionPercentage},${r.commissionAmount},"${r.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <DollarSign className="h-4.5 w-4.5 text-zinc-400" /> Doctor Commission & Payout Reports
          </h2>
          <p className="text-xs text-zinc-550 mt-1">
            Track test booking and patient referral earnings owed to registered doctors.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium text-xs shadow-sm transition"
        >
          <Download className="h-3.5 w-3.5 text-zinc-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800/80 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-400">Doctor:</span>
          <select
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-400">Date:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 px-2.5 py-1 text-xs rounded-lg font-mono text-zinc-205 focus:outline-none focus:border-zinc-700"
          />
          <span className="text-zinc-650 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 px-2.5 py-1 text-xs rounded-lg font-mono text-zinc-205 focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Stats Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Total Owed Commission</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              ₹{totalCommissionAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-zinc-550 mt-1">Sum of booking & referral payouts</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Direct Booking Earnings</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-zinc-300">
              ₹{bookingCommissionTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-zinc-550 mt-1">From doctor-created blood test orders</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Referral Code Earnings</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-zinc-300">
              ₹{referralCommissionTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-zinc-550 mt-1">From customer promo code usage</p>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-450 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Doctor Name</th>
                <th className="px-6 py-4">Order Reference</th>
                <th className="px-6 py-4">Order Value</th>
                <th className="px-6 py-4">Commission Type & Rate</th>
                <th className="px-6 py-4">Calculated Earnings</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Loading commission report data...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No commission payouts found for the selected filter parameters.
                  </td>
                </tr>
              ) : (
                reports.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-950/40 transition">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white block">{item.doctorName}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-zinc-400">#{item.orderId.slice(0, 8)}</span>
                    </td>

                    <td className="px-6 py-4 font-mono text-zinc-400">
                      ₹{item.orderTotal}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          item.commissionType === 'booking'
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-850'
                        }`}
                      >
                        {item.commissionType.toUpperCase()} ({item.commissionPercentage}%)
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-zinc-200 text-xs">
                      ₹{item.commissionAmount.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-right text-[11px] text-zinc-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
