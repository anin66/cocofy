export type Role = 'manager' | 'worker';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: string[];
  availability: 'Available' | 'Unavailable' | 'Busy';
}

export type JobStatus = 'unconfirmed' | 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'completed';

export interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  location: string;
  scheduledDate: string;
  treeCount: number;
  assignedWorkerId: string | null;
  status: JobStatus;
  createdAt: string;
  notes?: string;
}

export interface WorkerSuggestion {
  workerId: string;
  name: string;
  reason: string;
}
