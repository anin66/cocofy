import { useState, useEffect } from 'react';
import { Job, UserProfile, JobStatus, Role } from '@/lib/types';
import { INITIAL_JOBS, MOCK_WORKERS, MOCK_MANAGER } from '@/lib/mock-data';

export function useCocofyStore() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [workers, setWorkers] = useState<UserProfile[]>(MOCK_WORKERS);

  // Persistence simulation
  useEffect(() => {
    const savedJobs = localStorage.getItem('cocofy_jobs');
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    
    const savedUser = localStorage.getItem('cocofy_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedWorkers = localStorage.getItem('cocofy_workers');
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
  }, []);

  useEffect(() => {
    localStorage.setItem('cocofy_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('cocofy_workers', JSON.stringify(workers));
  }, [workers]);

  const login = (role: 'manager' | 'worker') => {
    const user = role === 'manager' ? MOCK_MANAGER : workers[0];
    setCurrentUser(user);
    localStorage.setItem('cocofy_user', JSON.stringify(user));
  };

  const signup = (name: string, email: string, role: Role) => {
    const newUser: UserProfile = {
      id: `u${Date.now()}`,
      name,
      email,
      role,
      skills: role === 'worker' ? ['New Harvest Member'] : [],
      availability: 'Available'
    };
    
    if (role === 'worker') {
      setWorkers(prev => [...prev, newUser]);
    }
    
    setCurrentUser(newUser);
    localStorage.setItem('cocofy_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cocofy_user');
  };

  const addJob = (job: Omit<Job, 'id' | 'status' | 'createdAt'>) => {
    const newJob: Job = {
      ...job,
      id: `j${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const reassignWorker = (jobId: string, workerId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, assignedWorkerId: workerId, status: 'pending' } : j));
  };

  return {
    jobs,
    currentUser,
    workers,
    login,
    logout,
    addJob,
    updateJobStatus,
    reassignWorker,
    signup
  };
}
