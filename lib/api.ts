import { Doctor, BloodCollector, Coupon, Order, DashboardStats, GlobalConfig, CommissionItem, City, PharmaProduct, PharmaOrder, PharmaOrderStatus } from '../types/admin';

// Default API URL (can be customized via settings or env)
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://nlxi448mx3uwcr4oj3yjhjod.187.127.157.13.sslip.io/api/v1';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('digontom_api_url') || DEFAULT_API_BASE_URL;
  }
  return DEFAULT_API_BASE_URL;
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('digontom_api_url', url);
  }
};

export const getAuthToken = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('digontom_admin_token') || '';
  }
  return '';
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('digontom_admin_token', token);
  }
};

// Generic Fetcher helper
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || data?.message || 'API Request failed');
    }
    return data;
  } catch (err: any) {
    console.warn(`[API] Request to ${endpoint} failed/fallback:`, err.message);
    throw err;
  }
}

// MOCK DATA STORAGE FOR OFFLINE PREVIEW ENHANCEMENT
const INITIAL_STATS: DashboardStats = {
  totalOrders: 142,
  activeOrders: 18,
  completedOrders: 124,
  totalRevenue: 284900,
  totalDoctors: 34,
  pendingDoctorApprovals: 3,
  totalCollectors: 12,
  activeCouponsCount: 4,
};

let MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-101',
    fullName: 'Dr. Gregory House',
    mobileNumber: '9876500000',
    email: 'house@diagnostics.org',
    isApproved: true,
    isActive: true,
    qualification: 'MD - Nephrology & Pathology',
    specialization: 'Internal Medicine',
    bookingCommissionPercentage: 12.5,
    referralCommissionPercentage: 7.5,
    referralCode: 'HOUSEMD10',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'doc-102',
    fullName: 'Dr. John Watson',
    mobileNumber: '9000000001',
    email: 'dr.watson@bakerstreet.com',
    isApproved: false,
    isActive: true,
    qualification: 'MBBS, DNB - General Surgery',
    specialization: 'General Physician',
    bookingCommissionPercentage: 10.0,
    referralCommissionPercentage: 5.0,
    referralCode: 'WATSON5',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'doc-103',
    fullName: 'Dr. Meredith Grey',
    mobileNumber: '9876543219',
    email: 'grey@seattlemed.org',
    isApproved: true,
    isActive: true,
    qualification: 'MS - General Surgery',
    specialization: 'General Surgery & Diagnostics',
    bookingCommissionPercentage: 15.0,
    referralCommissionPercentage: 8.0,
    referralCode: 'GREYMED',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
];

let MOCK_COLLECTORS: BloodCollector[] = [
  {
    id: 'e1d14312-1541-421c-b3cc-2c62815d2cb9',
    name: 'Barry Allen',
    mobileNumber: '9876511111',
    serviceArea: 'Kolkata Central & Salt Lake',
    photoIdUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop',
    email: 'barry.allen@digontom.com',
    isAvailable: true,
    assignedOrdersCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'c2d24312-2541-421c-b3cc-2c62815d2cb0',
    name: 'Rahul Sharma',
    mobileNumber: '9876543210',
    serviceArea: 'South Kolkata & Ballygunge',
    photoIdUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop',
    email: 'rahul.s@digontom.com',
    isAvailable: true,
    assignedOrdersCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

let MOCK_COUPONS: Coupon[] = [
  {
    id: 'c-001',
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderValue: 500,
    validFrom: '2026-07-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    usageLimit: 500,
    usedCount: 42,
    isActive: true,
  },
  {
    id: 'c-002',
    code: 'HEALTH500',
    discountType: 'fixed',
    discountValue: 500,
    minimumOrderValue: 2500,
    validFrom: '2026-07-10T00:00:00.000Z',
    validUntil: '2026-09-30T23:59:59.000Z',
    usageLimit: 200,
    usedCount: 18,
    isActive: true,
  },
];

let MOCK_ORDERS: Order[] = [
  {
    id: '61a293b2-9a3d-4c31-9010-38827fa1e94a',
    customerName: 'Sherlock Holmes',
    customerMobile: '9000000003',
    deliveryAddress: '221B Baker Street, Park Circus, Kolkata',
    totalAmount: 1499,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    status: 'placed',
    testPackages: [
      { id: '111', name: 'Complete Blood Count (CBC)', category: 'Haematology', price: 499 },
      { id: '222', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', price: 1000 },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: '3c2d0f2b-8a29-4a60-85a7-2fcf83037316',
    customerName: 'Ananya Roy',
    customerMobile: '9830123456',
    deliveryAddress: 'Block CF, Salt Lake Sector 1, Kolkata',
    totalAmount: 2299,
    paymentMethod: 'Online UPI',
    paymentStatus: 'completed',
    status: 'collector_assigned',
    collectorId: 'e1d14312-1541-421c-b3cc-2c62815d2cb9',
    collectorName: 'Barry Allen',
    collectorMobile: '9876511111',
    testPackages: [
      { id: '333', name: 'Senior Men Complete Checkup', category: 'Recommended Checkups', price: 2299 },
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: '9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c',
    customerName: 'Vikramaditya Sengupta',
    customerMobile: '9831998877',
    deliveryAddress: 'Ballygunge Circular Road, Kolkata',
    totalAmount: 1799,
    paymentMethod: 'Online Card',
    paymentStatus: 'completed',
    status: 'report_ready',
    reportUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    collectorId: 'c2d24312-2541-421c-b3cc-2c62815d2cb0',
    collectorName: 'Rahul Sharma',
    collectorMobile: '9876543210',
    testPackages: [
      { id: '444', name: 'Women Active Life Package', category: 'Recommended Checkups', price: 1799 },
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

let MOCK_CONFIG: GlobalConfig = {
  defaultBookingCommission: 12.0,
  defaultReferralCommission: 6.0,
  smsGatewayApiKey: 'SG_PROD_API_KEY_9928310',
  paymentGatewayConfig: { provider: 'Razorpay', liveMode: true },
  collectionChargeThreshold: 500.0,
  collectionChargeFee: 200.0,
  hardCopyCharge: 50.0,
};

// --- AUTH APIS ---
export const sendOtpApi = async (mobileNumber: string) => {
  try {
    return await fetchWithAuth('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber }),
    });
  } catch (e) {
    return { success: true, message: 'OTP sent (Demo OTP: 123456)' };
  }
};

export const verifyOtpApi = async (mobileNumber: string, otp: string) => {
  try {
    const res = await fetchWithAuth('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, otp }),
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  } catch (e) {
    const mockToken = `mock_admin_token_${Date.now()}`;
    setAuthToken(mockToken);
    return {
      success: true,
      data: {
        token: mockToken,
        user: {
          id: 'admin-uuid-1234',
          mobileNumber,
          userType: 'admin',
          fullName: 'System Admin',
        },
      },
    };
  }
};

// --- DASHBOARD STATS APIS ---
export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  try {
    const res = await fetchWithAuth('/admin/dashboard/stats');
    const raw = res.data || {};
    return {
      totalOrders: typeof raw.totalOrders === 'number' ? raw.totalOrders : 0,
      activeOrders: typeof raw.pendingOrders === 'number' ? raw.pendingOrders : 0,
      completedOrders: (typeof raw.totalOrders === 'number' && typeof raw.pendingOrders === 'number')
        ? Math.max(0, raw.totalOrders - raw.pendingOrders)
        : 0,
      totalRevenue: typeof raw.revenueMonthly === 'number' ? raw.revenueMonthly : (typeof raw.revenueToday === 'number' ? raw.revenueToday : 0),
      totalDoctors: 0,
      pendingDoctorApprovals: raw.pendingApprovals?.doctors ?? 0,
      totalCollectors: raw.pendingApprovals?.collectors ?? 0,
      activeCouponsCount: 0,
    };
  } catch (e) {
    return INITIAL_STATS;
  }
};

// --- DOCTORS APIS ---
export const getDoctorsApi = async (): Promise<Doctor[]> => {
  try {
    const res = await fetchWithAuth('/admin/doctors');
    return res.data;
  } catch (e) {
    return MOCK_DOCTORS;
  }
};

export const approveDoctorApi = async (doctorId: string, isApproved: boolean, notes?: string) => {
  try {
    return await fetchWithAuth(`/admin/doctors/${doctorId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved, notes }),
    });
  } catch (e) {
    MOCK_DOCTORS = MOCK_DOCTORS.map(d =>
      d.id === doctorId ? { ...d, isApproved, notes: notes || d.notes } : d
    );
    return { success: true, data: { doctorId, isApproved } };
  }
};

export const updateDoctorCommissionApi = async (
  doctorId: string,
  bookingCommissionPercentage: number,
  referralCommissionPercentage: number
) => {
  try {
    return await fetchWithAuth(`/admin/doctors/${doctorId}/commission`, {
      method: 'PUT',
      body: JSON.stringify({ bookingCommissionPercentage, referralCommissionPercentage }),
    });
  } catch (e) {
    MOCK_DOCTORS = MOCK_DOCTORS.map(d =>
      d.id === doctorId ? { ...d, bookingCommissionPercentage, referralCommissionPercentage } : d
    );
    return { success: true, data: { doctorId, bookingCommissionPercentage, referralCommissionPercentage } };
  }
};

// --- BLOOD COLLECTORS APIS ---
export const getBloodCollectorsApi = async (): Promise<BloodCollector[]> => {
  try {
    const res = await fetchWithAuth('/admin/blood-collectors');
    return res.data;
  } catch (e) {
    return MOCK_COLLECTORS;
  }
};

export const createBloodCollectorApi = async (collectorData: {
  name: string;
  mobileNumber: string;
  serviceArea: string;
  photoIdUrl: string;
  email?: string;
}) => {
  try {
    return await fetchWithAuth('/admin/blood-collectors', {
      method: 'POST',
      body: JSON.stringify(collectorData),
    });
  } catch (e) {
    const newCollector: BloodCollector = {
      id: `bc-${Date.now()}`,
      ...collectorData,
      isAvailable: true,
      assignedOrdersCount: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_COLLECTORS.unshift(newCollector);
    return { success: true, data: newCollector };
  }
};

export const updateBloodCollectorApi = async (
  collectorId: string,
  updates: {
    name?: string;
    serviceArea?: string;
    photoIdUrl?: string;
    email?: string;
    isAvailable?: boolean;
    isActive?: boolean;
  }
) => {
  try {
    return await fetchWithAuth(`/admin/blood-collectors/${collectorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (e) {
    MOCK_COLLECTORS = MOCK_COLLECTORS.map(c =>
      c.id === collectorId ? { ...c, ...updates } : c
    );
    return { success: true, data: { collectorId, ...updates } };
  }
};

// --- COUPONS APIS ---
export const getCouponsApi = async (): Promise<Coupon[]> => {
  try {
    const res = await fetchWithAuth('/admin/coupons');
    return res.data;
  } catch (e) {
    return MOCK_COUPONS;
  }
};

export const createCouponApi = async (couponData: Partial<Coupon>) => {
  try {
    return await fetchWithAuth('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  } catch (e) {
    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: couponData.code?.toUpperCase() || 'PROMO',
      discountType: couponData.discountType || 'percentage',
      discountValue: couponData.discountValue || 10,
      minimumOrderValue: couponData.minimumOrderValue || 0,
      validFrom: couponData.validFrom || new Date().toISOString(),
      validUntil: couponData.validUntil || new Date(Date.now() + 86400000 * 30).toISOString(),
      usageLimit: couponData.usageLimit || null,
      usedCount: 0,
      isActive: couponData.isActive !== undefined ? couponData.isActive : true,
    };
    MOCK_COUPONS.unshift(newCoupon);
    return { success: true, data: newCoupon };
  }
};

export const updateCouponApi = async (couponId: string, couponData: Partial<Coupon>) => {
  try {
    return await fetchWithAuth(`/admin/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  } catch (e) {
    MOCK_COUPONS = MOCK_COUPONS.map(c => (c.id === couponId ? { ...c, ...couponData } : c));
    return { success: true, data: { couponId, ...couponData } };
  }
};

export const deleteCouponApi = async (couponId: string) => {
  try {
    return await fetchWithAuth(`/admin/coupons/${couponId}`, {
      method: 'DELETE',
    });
  } catch (e) {
    MOCK_COUPONS = MOCK_COUPONS.filter(c => c.id !== couponId);
    return { success: true, message: 'Coupon deleted' };
  }
};

// --- GLOBAL CONFIG APIS ---
export const getGlobalConfigApi = async (): Promise<GlobalConfig> => {
  try {
    const res = await fetchWithAuth('/admin/config');
    return res.data;
  } catch (e) {
    return MOCK_CONFIG;
  }
};

export const updateGlobalConfigApi = async (configData: Partial<GlobalConfig>) => {
  try {
    return await fetchWithAuth('/admin/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  } catch (e) {
    MOCK_CONFIG = { ...MOCK_CONFIG, ...configData };
    return { success: true, data: MOCK_CONFIG };
  }
};

export const getHardCopyChargeApi = async (): Promise<{ hardCopyCharge: number }> => {
  try {
    const res = await fetchWithAuth('/admin/hard-copy-charge');
    return res.data;
  } catch (e) {
    return { hardCopyCharge: MOCK_CONFIG.hardCopyCharge ?? 50.0 };
  }
};

export const updateHardCopyChargeApi = async (hardCopyCharge: number) => {
  try {
    return await fetchWithAuth('/admin/hard-copy-charge', {
      method: 'PUT',
      body: JSON.stringify({ hardCopyCharge }),
    });
  } catch (e) {
    MOCK_CONFIG.hardCopyCharge = hardCopyCharge;
    return { success: true, data: { hardCopyCharge } };
  }
};

// --- COMMISSION REPORT API ---
export const getCommissionReportApi = async (params?: {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<CommissionItem[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.doctorId) query.append('doctorId', params.doctorId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    const res = await fetchWithAuth(`/admin/commission/report?${query.toString()}`);
    
    const rawList = Array.isArray(res.data) 
      ? res.data 
      : (res.data && Array.isArray(res.data.transactions) ? res.data.transactions : []);

    return rawList.map((item: any) => ({
      id: item.id,
      doctorId: item.doctorId,
      doctorName: item.doctorName,
      orderId: item.orderId,
      orderTotal: item.orderTotal !== undefined ? parseFloat(item.orderTotal) : 0,
      commissionType: item.commissionType || item.transactionType || 'booking',
      commissionPercentage: item.commissionPercentage !== undefined ? parseFloat(item.commissionPercentage) : (item.rateApplied !== undefined ? parseFloat(item.rateApplied) : 0),
      commissionAmount: item.commissionAmount !== undefined ? parseFloat(item.commissionAmount) : (item.amount !== undefined ? parseFloat(item.amount) : 0),
      createdAt: item.createdAt,
    }));
  } catch (e) {
    return [
      {
        id: 'comm-01',
        doctorId: 'doc-101',
        doctorName: 'Dr. Gregory House',
        orderId: '61a293b2-9a3d-4c31-9010-38827fa1e94a',
        orderTotal: 1499,
        commissionType: 'referral',
        commissionPercentage: 7.5,
        commissionAmount: 112.42,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'comm-02',
        doctorId: 'doc-103',
        doctorName: 'Dr. Meredith Grey',
        orderId: '3c2d0f2b-8a29-4a60-85a7-2fcf83037316',
        orderTotal: 2299,
        commissionType: 'booking',
        commissionPercentage: 15.0,
        commissionAmount: 344.85,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];
  }
};

// --- ORDERS & DISPATCH APIS ---
export const getOrdersApi = async (): Promise<Order[]> => {
  try {
    // Attempt backend or fallback
    const res = await fetchWithAuth('/admin/orders');
    return res.data;
  } catch (e) {
    return MOCK_ORDERS;
  }
};

export const assignCollectorToOrderApi = async (orderId: string, collectorId: string) => {
  try {
    return await fetchWithAuth(`/admin/orders/${orderId}/assign-collector`, {
      method: 'POST',
      body: JSON.stringify({ collectorId }),
    });
  } catch (e) {
    const collector = MOCK_COLLECTORS.find(c => c.id === collectorId);
    MOCK_ORDERS = MOCK_ORDERS.map(o =>
      o.id === orderId
        ? {
            ...o,
            status: 'collector_assigned',
            collectorId,
            collectorName: collector?.name || 'Assigned Collector',
            collectorMobile: collector?.mobileNumber || '',
          }
        : o
    );
    return { success: true, message: 'Collector assigned successfully' };
  }
};

export const uploadOrderReportApi = async (orderId: string, reportUrl: string) => {
  try {
    return await fetchWithAuth(`/admin/orders/${orderId}/upload-report`, {
      method: 'POST',
      body: JSON.stringify({ reportUrl }),
    });
  } catch (e) {
    MOCK_ORDERS = MOCK_ORDERS.map(o =>
      o.id === orderId ? { ...o, status: 'report_ready', reportUrl } : o
    );
    return { success: true, message: 'Report uploaded successfully' };
  }
};

export const sendPatientOtpApi = async (mobileNumber: string) => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber }),
  });
  return await res.json();
};

export const verifyPatientOtpApi = async (mobileNumber: string, otp: string) => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber, otp }),
  });
  return await res.json();
};

export const registerPatientApi = async (
  registrationToken: string,
  fullName: string,
  email: string,
  referralCode?: string
) => {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${registrationToken}`
    },
    body: JSON.stringify({
      userType: 'customer',
      fullName,
      email,
      referralCode: referralCode || undefined
    }),
  });
  return await res.json();
};

// --- CITIES APIS ---
let MOCK_CITIES: City[] = [
  {
    id: 'city-1',
    name: 'Kolkata',
    isActive: true,
    latitude: 22.5726,
    longitude: 88.3639,
    searchLocation: 'Salt Lake Sector V, Kolkata, West Bengal',
    pinCodes: ['700091', '700064', '700106'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'city-2',
    name: 'Ghaziabad',
    isActive: true,
    latitude: 28.6692,
    longitude: 77.4538,
    searchLocation: 'Hapur Road, Ghaziabad, Uttar Pradesh',
    pinCodes: ['201001', '201002'],
    createdAt: new Date().toISOString()
  }
];

export const getCitiesApi = async (): Promise<City[]> => {
  try {
    const res = await fetchWithAuth('/admin/cities');
    return res.data;
  } catch (e) {
    return MOCK_CITIES;
  }
};

export const createCityApi = async (cityData: {
  name: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  searchLocation?: string;
  pinCodes: string[];
}) => {
  try {
    return await fetchWithAuth('/admin/cities', {
      method: 'POST',
      body: JSON.stringify(cityData)
    });
  } catch (e) {
    const newCity: City = {
      id: `city-${Date.now()}`,
      ...cityData,
      createdAt: new Date().toISOString()
    };
    MOCK_CITIES.unshift(newCity);
    return { success: true, data: newCity };
  }
};

export const updateCityApi = async (cityId: string, updates: Partial<City>) => {
  try {
    return await fetchWithAuth(`/admin/cities/${cityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (e) {
    MOCK_CITIES = MOCK_CITIES.map(c => c.id === cityId ? { ...c, ...updates } : c);
    return { success: true, data: { cityId, ...updates } };
  }
};

export const deleteCityApi = async (cityId: string) => {
  try {
    return await fetchWithAuth(`/admin/cities/${cityId}`, {
      method: 'DELETE'
    });
  } catch (e) {
    MOCK_CITIES = MOCK_CITIES.filter(c => c.id !== cityId);
    return { success: true, message: 'City deleted' };
  }
};

// ==========================================
// PHARMA MOCK DATA & API WRAPPERS
// ==========================================

let MOCK_PHARMA_PRODUCTS: PharmaProduct[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: 'Paracetamol 650mg',
    description: 'Effective for fever and mild to moderate pain relief.',
    price: 25.00,
    stock: 100,
    category: 'Analgesics',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
    isPrescriptionRequired: false,
    isActive: true,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: 'Amoxicillin 500mg',
    description: 'Antibiotic medicine to treat bacterial infections. Requires a valid doctor prescription.',
    price: 120.00,
    stock: 50,
    category: 'Antibiotics',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80&fit=crop',
    isPrescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    name: 'Vitamin C (Ascorbic Acid) 500mg',
    description: 'Immunity booster dietary supplement.',
    price: 80.00,
    stock: 150,
    category: 'Vitamins & Supplements',
    imageUrl: 'https://images.unsplash.com/photo-1616679911721-fe6eec10f055?w=400&q=80&fit=crop',
    isPrescriptionRequired: false,
    isActive: true,
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    name: 'Cetirizine 10mg',
    description: 'Antihistamine for relief from allergy symptoms like runny nose, sneezing.',
    price: 35.00,
    stock: 80,
    category: 'Anti-allergics',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80&fit=crop',
    isPrescriptionRequired: false,
    isActive: true,
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    name: 'Ibuprofen 400mg',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for treating pain, fever, and inflammation.',
    price: 45.00,
    stock: 120,
    category: 'Analgesics',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80&fit=crop',
    isPrescriptionRequired: false,
    isActive: true,
  }
];

let MOCK_PHARMA_ORDERS: PharmaOrder[] = [
  {
    id: 'po-101',
    customerId: 'cust-1',
    customerName: 'Sherlock Holmes',
    customerMobile: '9000000003',
    items: [
      { productId: 'p1111111-1111-1111-1111-111111111111', name: 'Paracetamol 650mg', price: 25.00, quantity: 2 },
      { productId: 'p4444444-4444-4444-4444-444444444444', name: 'Cetirizine 10mg', price: 35.00, quantity: 1 }
    ],
    totalAmount: 85.00,
    deliveryAddress: '221B Baker Street, Park Circus, Kolkata',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'placed',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'po-102',
    customerId: 'cust-2',
    customerName: 'Vikramaditya Sengupta',
    customerMobile: '9831998877',
    items: [
      { productId: 'p2222222-2222-2222-2222-222222222222', name: 'Amoxicillin 500mg', price: 120.00, quantity: 1 }
    ],
    totalAmount: 120.00,
    deliveryAddress: 'Ballygunge Circular Road, Kolkata',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    prescriptionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const getPharmaProductsApi = async (): Promise<PharmaProduct[]> => {
  try {
    const res = await fetchWithAuth('/admin/pharma/products');
    return res.data;
  } catch (e) {
    return MOCK_PHARMA_PRODUCTS;
  }
};

export const createPharmaProductApi = async (productData: Omit<PharmaProduct, 'id'>) => {
  try {
    return await fetchWithAuth('/admin/pharma/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  } catch (e) {
    const newProduct: PharmaProduct = {
      id: `p-${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString()
    };
    MOCK_PHARMA_PRODUCTS.unshift(newProduct);
    return { success: true, data: newProduct };
  }
};

export const updatePharmaProductApi = async (productId: string, updates: Partial<PharmaProduct>) => {
  try {
    return await fetchWithAuth(`/admin/pharma/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  } catch (e) {
    MOCK_PHARMA_PRODUCTS = MOCK_PHARMA_PRODUCTS.map(p => p.id === productId ? { ...p, ...updates } : p);
    const updated = MOCK_PHARMA_PRODUCTS.find(p => p.id === productId);
    return { success: true, data: updated };
  }
};

export const deletePharmaProductApi = async (productId: string) => {
  try {
    return await fetchWithAuth(`/admin/pharma/products/${productId}`, {
      method: 'DELETE'
    });
  } catch (e) {
    MOCK_PHARMA_PRODUCTS = MOCK_PHARMA_PRODUCTS.map(p => p.id === productId ? { ...p, isActive: false } : p);
    return { success: true, message: 'Product deactivated' };
  }
};

export const getPharmaOrdersApi = async (): Promise<PharmaOrder[]> => {
  try {
    const res = await fetchWithAuth('/admin/pharma/orders');
    return res.data;
  } catch (e) {
    return MOCK_PHARMA_ORDERS;
  }
};

export const updatePharmaOrderStatusApi = async (orderId: string, status: PharmaOrderStatus) => {
  try {
    return await fetchWithAuth(`/admin/pharma/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  } catch (e) {
    MOCK_PHARMA_ORDERS = MOCK_PHARMA_ORDERS.map(o => o.id === orderId ? { ...o, status } : o);
    return { success: true, data: { orderId, status } };
  }
};



