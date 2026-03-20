export enum MedicineCategory {
  ANALGESICS = 'ANALGESICS',
  ANTIBIOTICS = 'ANTIBIOTICS',
  ANTISEPTICS = 'ANTISEPTICS',
  VITAMINS = 'VITAMINS',
  CARDIAC = 'CARDIAC',
  DIABETIC = 'DIABETIC',
  OTHER = 'OTHER'
}

export interface Medicine {
  id: string;
  name: string;
  medicineCode: string;
  category: MedicineCategory | string;
  manufacturer: string;
  description?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface MedicineRequest {
  name: string;
  medicineCode: string;
  category: MedicineCategory | string;
  manufacturer: string;
  description?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate?: string;
}

export interface DispenseMedicineRequest {
  prescriptionId: string;
  items: DispenseItem[];
}

export interface DispenseItem {
  medicineId: string;
  quantity: number;
}

export interface InventoryTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineCode: string;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}
