
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
  createdAt?: string;
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

export interface HarvestReport {
  trees: number;
  notes?: string;
  timestamp: string;
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
  workerStatuses: Record<string, JobStatus>; // Track status per worker ID
  status: JobStatus; // Overall job status
  createdAt: string;
  notes?: string;
  // Delivery fields
  deliveryBoyId?: string;
  deliveryTime?: string; // AM/PM format
  gpsUrl?: string;
  deliveryConfirmedByBoy?: boolean;
  // Completion Workflow
  deliveryCheckRequested?: boolean;
  deliveryDone?: boolean;
  harvestCheckRequested?: boolean;
  harvestDone?: boolean;
  workerHarvestReports?: Record<string, HarvestReport>;
  archived?: boolean;
}

export interface WorkerSuggestion {
  workerId: string;
  name: string;
  reason: string;
}
