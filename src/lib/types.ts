export type Role = 'manager' | 'worker' | 'delivery_boy' | 'finance_manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: string[];
  availability: 'Available' | 'Unavailable' | 'Busy';
  currentStatus?: 'Free for Work' | 'Currently Working';
  phone?: string;
  dob?: string;
  // Ranking Stats
  points: number;
  acceptedJobs: number;
  rejectedJobs: number;
  fcmTokens?: string[];
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export type JobStatus = 
  | 'unconfirmed' 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'confirmed' 
  | 'delivery_assigned' 
  | 'delivery_pickup_started' 
  | 'delivery_destination_reached' 
  | 'harvest_started' 
  | 'completed';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'fully_paid';
export type PaymentMethod = 'gpay' | 'cash';

export interface HarvestReport {
  trees: number;
  notes?: string;
  timestamp: string;
}

export interface PricingPreset {
  id: string;
  name: string;
  totalPricePerTree: number;
  workerPayPerTree: number;
  createdAt: string;
}

export interface AdditionalExpense {
  description: string;
  amount: number;
  category?: 'transport' | 'food' | 'maintenance' | 'other';
}

export interface WorkerPaymentInfo {
  status: PaymentStatus;
  method?: PaymentMethod;
  proof?: string;
  paidAt?: string;
}

export interface Job {
  id: string;
  managerId: string;
  customerName: string;
  customerPhone: string;
  location: string;
  scheduledDate: string; // "2024-04-21"
  harvestTime?: string; // e.g. "6:00 AM"
  treeCount: number;
  requiredWorkersCount: number;
  assignedWorkerIds: string[];
  workerStatuses: Record<string, JobStatus>; 
  status: JobStatus; 
  createdAt: string;
  notes?: string;
  presetId?: string; 
  // Delivery fields
  deliveryBoyId?: string;
  deliveryTime?: string; 
  gpsUrl?: string;
  deliveryConfirmedByBoy?: boolean;
  // Completion Workflow
  deliveryDone?: boolean;
  harvestDone?: boolean;
  workerHarvestReports?: Record<string, HarvestReport>;
  workerPaymentStatuses?: Record<string, WorkerPaymentInfo>;
  archived?: boolean;
  // Payment Workflow
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paymentScreenshots?: string[]; 
  cashReceivedBy?: string;
  settledAt?: string;
  additionalExpenses?: AdditionalExpense[];
}

export interface WorkerSuggestion {
  workerId: string;
  name: string;
  reason: string;
}