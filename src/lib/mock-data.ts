import { UserProfile, Job } from './types';

export const MOCK_WORKERS: UserProfile[] = [];

export const MOCK_MANAGER: UserProfile = {
  id: 'm1',
  name: 'Boss Coconut',
  email: 'boss@cocofy.com',
  role: 'manager',
  skills: [],
  availability: 'Available'
};

export const INITIAL_JOBS: Job[] = [];
