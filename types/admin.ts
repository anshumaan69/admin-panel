export type UserType = 'customer' | 'doctor' | 'collector' | 'admin';

export interface Doctor {
  id: string;
  mobileNumber: string;
  email?: string;
  fullName: string;
  isApproved: boolean;
  isActive: boolean;
  qualification?: string;
  specialization?: string;
  bookingCommissionPercentage: number;
  referralCommissionPercentage: number;
  referralCode?: string;
  notes?: string;
  createdAt: string;
}

export interface BloodCollector {
  id: string;
  name: string;
  mobileNumber: string;
  serviceArea: string;
  photoIdUrl: string;
  email?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  isApproved?: boolean;
  assignedOrdersCount?: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minimumOrderValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number | null;
  usedCount?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'collector_assigned'
  | 'sample_collected'
  | 'processing_in_lab'
  | 'report_ready'
  | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerMobile: string;
  deliveryAddress: string;
  totalAmount: number | string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  status: OrderStatus;
  prescriptionUrl?: string;
  reportUrl?: string;
  collectorId?: string;
  collectorName?: string;
  collectorMobile?: string;
  testPackages: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalDoctors: number;
  pendingDoctorApprovals: number;
  totalCollectors: number;
  activeCouponsCount: number;
}

export interface GlobalConfig {
  defaultBookingCommission: number;
  defaultReferralCommission: number;
  smsGatewayApiKey: string;
  paymentGatewayConfig?: Record<string, any>;
}

export interface CommissionItem {
  id: string;
  doctorId: string;
  doctorName: string;
  orderId: string;
  orderTotal: number;
  commissionType: 'booking' | 'referral';
  commissionPercentage: number;
  commissionAmount: number;
  createdAt: string;
}

export interface City {
  id: string;
  name: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  searchLocation?: string;
  pinCodes: string[];
  createdAt?: string;
}

export interface PharmaProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isPrescriptionRequired: boolean;
  isActive: boolean;
  composition?: string;
  uses?: string[];
  manufacturer?: string;
  packSize?: string;
  storage?: string;
  sideEffects?: string[];
  overview?: string;
  createdAt?: string;
}

export interface PharmaOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type PharmaOrderStatus = 'placed' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface PharmaOrder {
  id: string;
  customerId: string;
  customerName?: string;
  customerMobile?: string;
  items: PharmaOrderItem[];
  totalAmount: number | string;
  deliveryAddress: string;
  paymentMethod: 'upi' | 'cod';
  paymentStatus: 'pending' | 'paid';
  prescriptionUrl?: string;
  status: PharmaOrderStatus;
  createdAt: string;
  updatedAt?: string;
}


