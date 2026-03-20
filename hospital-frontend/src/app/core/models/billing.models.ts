export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  INSURANCE = 'INSURANCE',
  ONLINE = 'ONLINE'
}

export interface BillingItem {
  id?: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalValue?: number;
}

export interface Billing {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  billingDate: string;
  dueDate?: string;
  notes?: string;
  insuranceProvider?: string;
  insuranceClaimNumber?: string;
  insuranceAmount?: number;
  insuranceStatus?: string;
  items: BillingItem[];
  createdAt: string;
}

export interface BillingRequest {
  patientId: string;
  appointmentId?: string;
  items: BillingItemRequest[];
  totalAmount: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  billingDate: string;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: PaymentMethod;
  dueDate?: string;
  notes?: string;
  insuranceProvider?: string;
  insuranceClaimNumber?: string;
  insuranceAmount?: number;
  insuranceStatus?: string;
}

export interface BillingItemRequest {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}
