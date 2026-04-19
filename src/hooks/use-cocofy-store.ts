import { useState, useEffect } from 'react';
import { Job, UserProfile, JobStatus, Role } from '@/lib/types';
import { MOCK_MANAGER } from '@/lib/mock-data';

export function useCocofyStore() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [workers, setWorkers] = useState<UserProfile[]>([]);
  const [managers, setManagers] = useState<UserProfile[]>([MOCK_MANAGER]);

  const STORAGE_VERSION = 'cocofy_v11_stable_persistence';

  useEffect(() => {
    const savedJobs = localStorage.getItem(`${STORAGE_VERSION}_jobs`);
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    
    const savedUser = localStorage.getItem(`${STORAGE_VERSION}_user`);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedWorkers = localStorage.getItem(`${STORAGE_VERSION}_workers`);
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));

    const savedManagers = localStorage.getItem(`${STORAGE_VERSION}_managers`);
    if (savedManagers) setManagers(JSON.parse(savedManagers));
  }, []);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_VERSION}_jobs`, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_VERSION}_workers`, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_VERSION}_managers`, JSON.stringify(managers));
  }, [managers]);

  const login = (role: 'manager' | 'worker') => {
    // If we have a specifically logged in user in storage, use them
    const savedUser = localStorage.getItem(`${STORAGE_VERSION}_user`);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role === role) {
        setCurrentUser(parsed);
        return;
      }
    }

    // Otherwise, try to find the last signed up user of that role or use mock
    let user: UserProfile | null = null;
    if (role === 'manager') {
      user = managers[managers.length - 1] || MOCK_MANAGER;
    } else {
      user = workers[workers.length - 1] || null;
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem(`${STORAGE_VERSION}_user`, JSON.stringify(user));
    }
  };

  const signup = (userData: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: `u${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || 'worker',
      phone: userData.phone,
      dob: userData.dob,
      skills: [],
      availability: 'Available'
    };
    
    if (newUser.role === 'worker') {
      setWorkers(prev => [...prev, newUser]);
    } else {
      setManagers(prev => [...prev, newUser]);
    }
    
    setCurrentUser(newUser);
    localStorage.setItem(`${STORAGE_VERSION}_user`, JSON.stringify(newUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_VERSION}_user`);
  };

  const addJob = (job: Omit<Job, 'id' | 'status' | 'createdAt'>) => {
    const newJob: Job = {
      ...job,
      id: `j${Date.now()}`,
      status: 'unconfirmed',
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

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
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
    signup,
    deleteJob
  };
}
