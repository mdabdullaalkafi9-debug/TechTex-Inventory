export enum FabricCategory {
  WOVEN = 'Woven',
  NON_WOVEN = 'Non-woven',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
}

export enum UsageStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  REJECTED = 'Rejected',
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  PENDING_APPROVAL = 'pending_approval',
  SHIPMENT_REMINDER = 'shipment_reminder',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedFabricId: string;
  relatedTransactionId?: string;
}

export interface PurchaseTransaction {
  id: string;
  type: TransactionType.PURCHASE;
  date: string;
  quantity: number; // m²
  invoiceNumber?: string;
}

export interface BagEntry {
    size: string;
    quantity: number;
}

export interface UsageTransaction {
  id:string;
  type: TransactionType.USAGE;
  date: string;
  submittedBy: 'User' | 'Admin';
  clientName: string;
  poNumber: string; // Now mandatory
  machineNameAndCapacity: string;
  drawingNumber: string;
  orderNumber: string;
  shipmentDate: string;
  orderReceivedDate: string;
  bags: BagEntry[];
  fabricConsumptionPerPiece: number; // m²
  totalFabricUsed: number; // m² (calculated)
  status: UsageStatus;
  actionBy?: string; // Admin who approved or rejected
  actionDate?: string; // Timestamp of action
  
  // New fields for soft delete and audit trail
  isDeleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  originalStatusBeforeDelete?: UsageStatus;
  deletionReason?: string;
}

export type Transaction = PurchaseTransaction | UsageTransaction;

export interface Fabric {
  id: string;
  code: string;
  name: string;
  category: FabricCategory;
  initialStock: number; // m²
  transactions: Transaction[];
  isDeleted?: boolean;
}