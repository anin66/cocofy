export type Role = 'manager' | 'worker';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: string[];
  availability: 'Available' | 'Unavailable' | 'Busy';
  phone?: string;
  dob?: string;
}

export type JobStatus = 'unconfirmed' | 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed';

export interface Job {
  id: string;
  managerId: string;
  customerName: string;
  customerPhone: string;
  location: string;
  scheduledDate: string;
  treeCount: number;
  requiredWorkersCount: number;
  assignedWorkerIds: string[];
  workerStatuses: Record<string, JobStatus>; // Track status per worker ID
  status: JobStatus; // Overall job status
  createdAt: string;
  notes?: string;
}

export interface WorkerSuggestion {
  workerId: string;
  name: string;
  reason: string;
}
