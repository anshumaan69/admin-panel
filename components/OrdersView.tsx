'use client';

import React, { useState } from 'react';
import { Order, BloodCollector, OrderStatus } from '../types/admin';
import {
  ShoppingCart,
  Search,
  Filter,
  Syringe,
  FileCheck,
  ExternalLink,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';
import { assignCollectorToOrderApi, uploadOrderReportApi } from '../lib/api';

interface OrdersViewProps {
  orders: Order[];
  collectors: BloodCollector[];
  onRefresh: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, collectors, onRefresh }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [reportModalOrder, setReportModalOrder] = useState<Order | null>(null);
  const [reportUrlInput, setReportUrlInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAssignCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalOrder || !selectedCollectorId) return;

    setLoading(true);
    try {
      await assignCollectorToOrderApi(assignModalOrder.id, selectedCollectorId);
      showToast(`Collector assigned successfully to Order #${assignModalOrder.id.slice(0, 8)}`);
      setAssignModalOrder(null);
      setSelectedCollectorId('');
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalOrder || !reportUrlInput) return;

    setLoading(true);
    try {
      await uploadOrderReportApi(reportModalOrder.id, reportUrlInput);
      showToast(`Diagnostic Report uploaded for Order #${reportModalOrder.id.slice(0, 8)}`);
      setReportModalOrder(null);
      setReportUrlInput('');
      onRefresh();
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerMobile.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-450 border border-amber-500/20 text-[10px] font-semibold">Placed</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-450 border border-blue-500/20 text-[10px] font-semibold">Confirmed</span>;
      case 'collector_assigned':
        return <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 text-[10px] font-semibold">Collector Assigned</span>;
      case 'sample_collected':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-450 border border-purple-500/20 text-[10px] font-semibold">Sample Collected</span>;
      case 'processing_in_lab':
        return <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-450 border border-cyan-500/20 text-[10px] font-semibold">In Lab</span>;
      case 'report_ready':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[10px] font-semibold inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Report Ready</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-855 text-[10px] font-semibold">{status}</span>;
    }
  };

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
            <ShoppingCart className="h-4.5 w-4.5 text-zinc-400" /> Blood Test Orders & Dispatch
          </h2>
          <p className="text-xs text-zinc-550 mt-1">
            Assign phlebotomists for sample pickup and upload completed diagnostic reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-550" />
            <input
              type="text"
              placeholder="Search by ID, name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-850 w-52 text-zinc-200 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-850 px-3 py-1.5 text-xs rounded-lg text-zinc-250 focus:outline-none focus:border-zinc-700"
          >
            <option value="all">All Order Statuses</option>
            <option value="placed">Placed (Pending Collector)</option>
            <option value="collector_assigned">Collector Assigned</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="processing_in_lab">Processing in Lab</option>
            <option value="report_ready">Report Ready</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-450 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Test Packages</th>
                <th className="px-6 py-4">Amount & Payment</th>
                <th className="px-6 py-4">Status & Phlebotomist</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No orders matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-950/40 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white block text-xs">#{order.id.slice(0, 8)}</span>
                      <span className="text-[11px] text-zinc-550 flex items-center gap-1 mt-0.5 font-mono">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {order.patientName ? (
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
                            <User className="h-3.5 w-3.5 text-indigo-400" /> {order.patientName}
                            {order.patientRelationship && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                                {order.patientRelationship}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                            {order.patientAge ? `${order.patientAge} yrs` : ''} {order.patientGender ? `• ${order.patientGender}` : ''}
                            {order.patientPhone ? ` • ${order.patientPhone}` : ''}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1 border-t border-zinc-800/60 pt-0.5">
                            Booked by: <span className="text-zinc-400">{order.customerName}</span> ({order.customerMobile})
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-zinc-400" /> {order.customerName}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="h-3 w-3 text-zinc-600" /> {order.customerMobile}
                          </div>
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-500 truncate max-w-[200px] mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-zinc-600 shrink-0" /> {order.deliveryAddress}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.testPackages.map((t, idx) => (
                          <span key={idx} className="block font-medium text-zinc-300">
                            • {t.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-200 text-xs block">₹{order.totalAmount}</span>
                      <span className="text-[10px] uppercase font-semibold text-zinc-555 font-mono block">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                      {order.requiresHardCopy && (
                        <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                          + Hard Copy ({order.hardCopyCharge ? `₹${order.hardCopyCharge}` : 'Requested'})
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 space-y-1.5">
                      <div>{getStatusBadge(order.status)}</div>
                      {order.collectorName && (
                        <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 font-mono">
                          <Syringe className="h-3 w-3 text-zinc-500" /> {order.collectorName}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setAssignModalOrder(order);
                          setSelectedCollectorId(order.collectorId || '');
                        }}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition"
                      >
                        Assign Collector
                      </button>

                      {order.reportUrl ? (
                        <a
                          href={order.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-805 text-xs font-medium transition"
                        >
                          <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                          <span>View Report</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => {
                            setReportModalOrder(order);
                            setReportUrlInput(order.reportUrl || '');
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition"
                        >
                          Upload Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Assign Phlebotomist Collector */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Syringe className="h-4.5 w-4.5 text-zinc-450" /> Assign Phlebotomist Collector
              </h3>
              <button onClick={() => setAssignModalOrder(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-450 mb-4 font-mono">
              Order ID: <span className="font-semibold text-white">#{assignModalOrder.id.slice(0, 8)}</span> • Customer: {assignModalOrder.customerName}
            </p>

            <form onSubmit={handleAssignCollector} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-2">Select Blood Collector</label>
                <select
                  value={selectedCollectorId}
                  onChange={e => setSelectedCollectorId(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                >
                  <option value="">-- Choose Collector --</option>
                  {collectors.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.serviceArea})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setAssignModalOrder(null)}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedCollectorId}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Diagnostic PDF Report URL */}
      {reportModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-md w-full border border-zinc-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Upload className="h-4.5 w-4.5 text-zinc-450" /> Upload Diagnostic Report PDF
              </h3>
              <button onClick={() => setReportModalOrder(null)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-455 mb-4 font-mono">
              Order ID: <span className="font-semibold text-white">#{reportModalOrder.id.slice(0, 8)}</span> • Customer: {reportModalOrder.customerName}
            </p>

            <form onSubmit={handleUploadReport} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Diagnostic PDF Report URL</label>
                <input
                  type="url"
                  value={reportUrlInput}
                  onChange={e => setReportUrlInput(e.target.value)}
                  placeholder="https://storage.digontom.com/reports/report_1029.pdf"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setReportModalOrder(null)}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reportUrlInput}
                  className="px-3.5 py-1.5 text-xs rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Publish Diagnostic Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
