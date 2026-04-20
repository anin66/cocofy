import { useState, useEffect } from 'react';
import { Job, UserProfile, JobStatus, Role } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useCocofyStore() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  const auth = getAuth();

  // Fetch the specific profile for the current logged in user
  const currentUserRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<UserProfile>(currentUserRef);

  // Jobs Query - only run if authenticated
  const jobsQuery = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
  }, [db, authUser]);
  const { data: jobsData, isLoading: isJobsLoading } = useCollection<Job>(jobsQuery);

  // Users Query (to find workers) - only run if authenticated
  const usersQuery = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'users');
  }, [db, authUser]);
  const { data: usersData, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);
  
  const jobs = jobsData || [];
  const allUsers = usersData || [];
  const workers = allUsers.filter(u => u.role === 'worker');

  const login = async (role: Role, email?: string, password?: string) => {
    if (!email || !password) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const signup = async (userData: any) => {
    if (!userData.email || !userData.password) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const newUser: UserProfile = {
        id: userCredential.user.uid,
        name: userData.name || 'New User',
        email: userData.email,
        role: userData.role || 'worker',
        phone: userData.phone || '',
        dob: userData.dob || '',
        skills: [],
        availability: 'Available'
      };
      
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const addJob = (jobData: any) => {
    if (!db || !currentUser) return;
    
    const newJobData = {
      ...jobData,
      managerId: currentUser.id,
      status: 'unconfirmed',
      createdAt: new Date().toISOString()
    };
    
    addDocumentNonBlocking(collection(db, 'jobs'), newJobData);
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { status });
  };

  const reassignWorker = (jobId: string, workerId: string) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      assignedWorkerId: workerId, 
      status: 'pending' 
    });
  };

  const deleteJob = (jobId: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'jobs', jobId));
  };

  return {
    jobs,
    currentUser,
    workers,
    isUserLoading: isAuthLoading || isProfileLoading || isUsersLoading || isJobsLoading,
    login,
    logout,
    addJob,
    updateJobStatus,
    reassignWorker,
    signup,
    deleteJob
  };
}