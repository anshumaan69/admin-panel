'use client';

import React, { useState, useEffect } from 'react';
import {
  Pill,
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Package,
  Activity,
  User,
  MapPin,
  CreditCard,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import {
  PharmaProduct,
  PharmaOrder,
  PharmaOrderStatus
} from '../types/admin';
import {
  getPharmaProductsApi,
  createPharmaProductApi,
  updatePharmaProductApi,
  deletePharmaProductApi,
  getPharmaOrdersApi,
  updatePharmaOrderStatusApi
} from '../lib/api';

export const PharmaView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<PharmaProduct[]>([]);
  const [orders, setOrders] = useState<PharmaOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Search & Filter state
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Expanded Order details ID list
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<PharmaProduct | null>(null);
  
  // Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: '',
    isPrescriptionRequired: false,
    isActive: true,
    composition: '',
    uses: '',
    manufacturer: '',
    packSize: '',
    storage: '',
    sideEffects: '',
    overview: ''
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        getPharmaProductsApi(),
        getPharmaOrdersApi()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (e) {
      showToast('Error loading pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'Analgesics',
      imageUrl: '',
      isPrescriptionRequired: false,
      isActive: true,
      composition: '',
      uses: '',
      manufacturer: '',
      packSize: '',
      storage: '',
      sideEffects: '',
      overview: ''
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: PharmaProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || '',
      isPrescriptionRequired: product.isPrescriptionRequired,
      isActive: product.isActive,
      composition: product.composition || '',
      uses: product.uses ? product.uses.join(', ') : '',
      manufacturer: product.manufacturer || '',
      packSize: product.packSize || '',
      storage: product.storage || '',
      sideEffects: product.sideEffects ? product.sideEffects.join(', ') : '',
      overview: product.overview || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.price <= 0 || productForm.stock < 0 || !productForm.category) {
      showToast('Please fill out all required fields correctly.');
      return;
    }

    const payload = {
      ...productForm,
      uses: productForm.uses ? productForm.uses.split(',').map(s => s.trim()).filter(Boolean) : [],
      sideEffects: productForm.sideEffects ? productForm.sideEffects.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {
      if (editingProduct) {
        // Edit existing
        const res = await updatePharmaProductApi(editingProduct.id, payload);
        if (res.success) {
          showToast(`Product "${productForm.name}" updated successfully.`);
          setIsProductModalOpen(false);
          loadData();
        }
      } else {
        // Create new
        const res = await createPharmaProductApi(payload);
        if (res.success) {
          showToast(`Product "${productForm.name}" created successfully.`);
          setIsProductModalOpen(false);
          loadData();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save product.');
    }
  };

  const handleToggleProductStatus = async (product: PharmaProduct) => {
    try {
      const res = await updatePharmaProductApi(product.id, { isActive: !product.isActive });
      if (res.success) {
        showToast(`Product status toggled successfully.`);
        loadData();
      }
    } catch (err: any) {
      showToast('Failed to toggle product status');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: PharmaOrderStatus) => {
    try {
      const res = await updatePharmaOrderStatusApi(orderId, status);
      if (res.success) {
        showToast(`Order status updated to "${status}".`);
        loadData();
      }
    } catch (err: any) {
      showToast('Failed to update order status.');
    }
  };

  // Categories list derived from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase())) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategory === 'all' || p.category === productCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const customerNameStr = o.customerName || '';
    const customerMobileStr = o.customerMobile || '';
    const matchesSearch = o.id.includes(orderSearch) || 
                          customerNameStr.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          customerMobileStr.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderStatusColor = (status: PharmaOrderStatus) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'confirmed':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'out_for_delivery':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
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

      {/* View Header */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Pill className="h-4.5 w-4.5 text-zinc-300" /> Pharmacy Store Operations
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage pharmaceutical inventory catalog, configure prescription requirements, and coordinate order deliveries.
          </p>
        </div>

        {/* Sub-tabs selection */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeSubTab === 'products'
                ? 'bg-zinc-800 text-white border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Package className="h-3.5 w-3.5" /> Inventory Catalog
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeSubTab === 'orders'
                ? 'bg-zinc-800 text-white border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Orders & Delivery
          </button>
        </div>
      </div>

      {/* PRODUCTS CATALOG SECTION */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-4 py-2 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-750 transition"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <select
                  value={productCategory}
                  onChange={e => setProductCategory(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 pl-9 pr-8 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-750 transition appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition"
            >
              <Plus className="h-4 w-4 text-zinc-950" />
              <span>Add Pharma Product</span>
            </button>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-500 text-xs gap-2">
              <Activity className="h-4 w-4 animate-spin" /> Fetching pharmacy catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-zinc-900/10 border border-dashed border-zinc-800/80 rounded-xl p-12 text-center">
              <Pill className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-400">No Pharma Products Found</h3>
              <p className="text-xs text-zinc-500 mt-1">Try refining your search terms or add a new medicine.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`bg-zinc-900 border rounded-xl overflow-hidden shadow-md flex flex-col justify-between transition ${
                    product.isActive ? 'border-zinc-800' : 'border-zinc-900/60 opacity-60'
                  }`}
                >
                  <div className="p-5 space-y-4">
                    {/* Image & Title */}
                    <div className="flex gap-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                          <Pill className="h-6 w-6" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                          {product.category}
                        </span>
                        <h3 className="text-xs font-bold text-white leading-tight">{product.name}</h3>
                        <div className="flex gap-1.5 mt-1">
                          {product.isPrescriptionRequired && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                              Prescription Required
                            </span>
                          )}
                          {!product.isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
                      {product.description || 'No description provided.'}
                    </p>

                    {/* Stock & Price */}
                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/60 pt-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Unit Price</span>
                        <span className="text-xs font-bold text-white font-mono">₹{product.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Available Stock</span>
                        <span className={`text-xs font-semibold ${product.stock <= 10 ? 'text-amber-400' : 'text-zinc-300'}`}>
                          {product.stock} units
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="bg-zinc-950 p-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleProductStatus(product)}
                      className={`text-[10px] font-semibold transition px-2.5 py-1.5 rounded-md border ${
                        product.isActive
                          ? 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border-zinc-800 hover:border-rose-500/20'
                          : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border-zinc-850 hover:border-emerald-500/20'
                      }`}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="text-[10px] font-semibold text-zinc-200 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-md transition flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ORDERS & DISPATCH SECTION */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by customer mobile, name, or order ID..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-4 py-2 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-750 transition"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 pl-9 pr-8 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-750 transition appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-500 text-xs gap-2">
              <Activity className="h-4 w-4 animate-spin" /> Fetching pharmacy orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-zinc-900/10 border border-dashed border-zinc-800/80 rounded-xl p-12 text-center">
              <ShoppingBag className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-400">No Pharmacy Orders</h3>
              <p className="text-xs text-zinc-500 mt-1">No transactions fit the current filter settings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrderId === order.id;
                const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-zinc-800/85 rounded-xl overflow-hidden transition duration-200"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-850/30 transition select-none"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-450 shrink-0">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white">#{order.id.slice(0, 8)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getOrderStatusColor(order.status)}`}>
                              {order.status.toUpperCase().replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">{dateStr}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto text-left md:text-right shrink-0">
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Customer</span>
                          <span className="text-xs font-medium text-zinc-200 block truncate max-w-[120px]">{order.customerName || 'Customer'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Payment Method</span>
                          <span className="text-xs font-mono uppercase text-zinc-300 block">{order.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Total Amount</span>
                          <span className="text-xs font-bold text-white font-mono block">₹{Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-end">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-zinc-800/60 bg-zinc-950/20 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-down">
                        {/* Column 1: Items & Delivery Address */}
                        <div className="space-y-4 lg:col-span-2">
                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5" /> Order Items ({order.items.length})
                            </h4>
                            <div className="bg-zinc-950/40 rounded-lg border border-zinc-850 p-3 space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-zinc-900/50 last:border-0 last:pb-0">
                                  <div>
                                    <span className="font-semibold text-zinc-200">{item.name}</span>
                                    <span className="text-[10px] text-zinc-500 block">₹{item.price.toFixed(2)} each</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-zinc-400">Qty {item.quantity}</span>
                                    <span className="font-bold text-white font-mono block">₹{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" /> Delivery Address
                            </h4>
                            <p className="text-xs text-zinc-300 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                              {order.deliveryAddress}
                            </p>
                          </div>
                        </div>

                        {/* Column 2: Status updates, prescription, metadata */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" /> Customer Details
                            </h4>
                            <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850 text-xs space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Name:</span>
                                <span className="text-zinc-200 font-semibold">{order.customerName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Mobile:</span>
                                <span className="text-zinc-200 font-mono">{order.customerMobile || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Payment Status:</span>
                                <span className={`font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-450' : 'text-amber-450'}`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Prescription Attachment */}
                          {order.prescriptionUrl && (
                            <div className="space-y-2">
                              <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" /> Prescription Attachment
                              </h4>
                              <a
                                href={order.prescriptionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium transition cursor-pointer group"
                              >
                                <span className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 shrink-0" /> Open Uploaded Prescription
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition" />
                              </a>
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                              Update Fulfillment Status
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {order.status === 'placed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                  className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700/60 transition flex items-center justify-center gap-1"
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-450" /> Confirm Order
                                </button>
                              )}
                              {order.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                                  className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700/60 transition flex items-center justify-center gap-1"
                                >
                                  <Package className="h-3.5 w-3.5 text-amber-450" /> Out for Delivery
                                </button>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  className="py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700/60 transition flex items-center justify-center gap-1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Mark Delivered
                                </button>
                              )}
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition flex items-center justify-center gap-1"
                                >
                                  <X className="h-3.5 w-3.5" /> Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Pill className="h-4.5 w-4.5 text-zinc-400" />
                {editingProduct ? 'Edit Pharmacy Product' : 'Add New Pharmacy Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-350 transition p-1 hover:bg-zinc-900 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Product Name <span className="text-rose-455 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Category <span className="text-rose-455 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="e.g. Analgesics"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Unit Price (₹) <span className="text-rose-455 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={productForm.price || ''}
                    onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Initial Stock Level <span className="text-rose-455 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock || 0}
                    onChange={e => setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) || 0 })}
                    placeholder="0"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Product Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe therapeutic use, package size, warnings..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Overview
                  </label>
                  <textarea
                    value={productForm.overview}
                    onChange={e => setProductForm({ ...productForm, overview: e.target.value })}
                    placeholder="Enter overview of the medicine..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Composition
                  </label>
                  <input
                    type="text"
                    value={productForm.composition}
                    onChange={e => setProductForm({ ...productForm, composition: e.target.value })}
                    placeholder="e.g. Paracetamol IP 500 mg"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={productForm.manufacturer}
                    onChange={e => setProductForm({ ...productForm, manufacturer: e.target.value })}
                    placeholder="e.g. GlaxoSmithKline"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    value={productForm.packSize}
                    onChange={e => setProductForm({ ...productForm, packSize: e.target.value })}
                    placeholder="e.g. 15 Tablets"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Storage Instructions
                  </label>
                  <input
                    type="text"
                    value={productForm.storage}
                    onChange={e => setProductForm({ ...productForm, storage: e.target.value })}
                    placeholder="e.g. Store below 25°C"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Uses (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.uses}
                    onChange={e => setProductForm({ ...productForm, uses: e.target.value })}
                    placeholder="e.g. Headache, Fever, Toothache"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Side Effects (comma separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.sideEffects}
                    onChange={e => setProductForm({ ...productForm, sideEffects: e.target.value })}
                    placeholder="e.g. Nausea, Skin rash"
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-650 transition"
                  />
                </div>

                {/* Checkboxes */}
                <div className="sm:col-span-2 space-y-2 pt-2 border-t border-zinc-850">
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={productForm.isPrescriptionRequired}
                      onChange={e => setProductForm({ ...productForm, isPrescriptionRequired: e.target.checked })}
                      className="rounded bg-zinc-950 border-zinc-800 text-zinc-950 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer h-4 w-4"
                    />
                    <span className="text-xs text-zinc-300">Requires Valid Doctor Prescription to order</span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={e => setProductForm({ ...productForm, isActive: e.target.checked })}
                      className="rounded bg-zinc-950 border-zinc-800 text-zinc-950 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer h-4 w-4"
                    />
                    <span className="text-xs text-zinc-350">Make product immediately active in catalog</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition"
                >
                  {editingProduct ? 'Save Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
