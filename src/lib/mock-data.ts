import { UserProfile, Job } from './types';

export const MOCK_WORKERS: UserProfile[] = [];

export const MOCK_MANAGER: UserProfile = {
  id: 'm1',
  name: 'Guest Manager',
  email: 'manager@cocofy.com',
  role: 'manager',
  skills: [],
  availability: 'Available'
};

export const INITIAL_JOBS: Job[] = [];
