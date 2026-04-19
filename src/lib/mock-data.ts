import { UserProfile, Job } from './types';

export const MOCK_WORKERS: UserProfile[] = [
  {
    id: 'w1',
    name: 'Somchai Climber',
    email: 'somchai@cocofy.com',
    role: 'worker',
    skills: ['Climbing', 'Sorting', 'Quality Control'],
    availability: 'Available'
  },
  {
    id: 'w2',
    name: 'Ananda Harvest',
    email: 'ananda@cocofy.com',
    role: 'worker',
    skills: ['Climbing', 'Safety Expert'],
    availability: 'Available'
  },
  {
    id: 'w3',
    name: 'Kanya Tree',
    email: 'kanya@cocofy.com',
    role: 'worker',
    skills: ['Trimming', 'Logistics'],
    availability: 'Busy'
  },
  {
    id: 'w4',
    name: 'Pravat Green',
    email: 'pravat@cocofy.com',
    role: 'worker',
    skills: ['Climbing', 'De-husking'],
    availability: 'Available'
  }
];

export const MOCK_MANAGER: UserProfile = {
  id: 'm1',
  name: 'Boss Coconut',
  email: 'boss@cocofy.com',
  role: 'manager',
  skills: [],
  availability: 'Available'
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    customerName: 'Riverside Resort',
    location: 'Zone A - Plot 4',
    scheduledDate: '2024-06-15',
    requirements: 'Need safe climber for tall palms',
    assignedWorkerId: 'w1',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'j2',
    customerName: 'Grand Villa',
    location: 'Zone B - Entryway',
    scheduledDate: '2024-06-16',
    requirements: 'Aesthetic trimming and harvesting',
    assignedWorkerId: 'w2',
    status: 'accepted',
    createdAt: new Date().toISOString()
  }
];