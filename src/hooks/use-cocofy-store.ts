
'use client';

import { useState } from 'react';
import { Job, UserProfile, JobStatus, Role, HarvestReport } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  increment
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Administrative security keys
const ADMIN_SECURITY_KEYS = {
  manager: 'COCO-ADMIN-2024',
  finance_manager: 'COCO-FINANCE-2024'
};

const ADMIN_EMAIL = 'shaheenmkd2025@gmail.com';

export function useCocofyStore() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  const db = useFirestore();
  const auth = getAuth();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fetch the specific profile for the current logged in user
  const currentUserRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<UserProfile>(currentUserRef);

  // Jobs Query
  const jobsCollection = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'jobs');
  }, [db, authUser]);
  const { data: jobsData, isLoading: isJobsLoading } = useCollection<Job>(jobsCollection);

  // Users Query
  const usersCollection = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'users');
  }, [db, authUser]);
  const { data: usersData, isLoading: isUsersLoading } = useCollection<UserProfile>(usersCollection);
  
  // Local sorting for jobs
  const jobs = (jobsData || []).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const allUsers = usersData || [];
  
  // Explicitly separate workers and delivery boys
  const workers = allUsers
    .filter(u => u.role === 'worker')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const deliveryBoys = allUsers
    .filter(u => u.role === 'delivery_boy')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const login = async (targetRole: Role, email?: string, password?: string) => {
    if (!email || !password || isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      const normalizedEmail = email.toLowerCase();

      // IF THE PROFILE IS MISSING, ACCESS IS DENIED
      if (!userSnap.exists()) {
        toast({
          variant: "destructive",
          title: "Access Revoked",
          description: "Your staff profile has been removed by a manager.",
        });
        await signOut(auth);
        return;
      } else {
        const profile = userSnap.data() as UserProfile;
        
        // Admin Force-Correct Role
        if (normalizedEmail === ADMIN_EMAIL && profile.role !== 'manager') {
          await setDoc(userDocRef, { ...profile, role: 'manager' }, { merge: true });
          profile.role = 'manager';
        }

        if (normalizedEmail === ADMIN_EMAIL && targetRole !== 'manager') {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Administrative accounts must use the Manager portal.",
          });
          await signOut(auth);
          return;
        }

        if (normalizedEmail !== ADMIN_EMAIL && profile.role !== targetRole) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: `This account is registered as a ${profile.role.replace('_', ' ')}.`,
          });
          await signOut(auth);
          return;
        }
        
        toast({
          title: "Logged In",
          description: `Welcome back, ${profile.name}!`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "Failed to sign in.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signup = async (userData: any) => {
    if (!userData.email || !userData.password || isAuthenticating) return;
    
    const normalizedEmail = userData.email.toLowerCase();
    const isSpecialAdmin = normalizedEmail === ADMIN_EMAIL;

    if (!isSpecialAdmin && (userData.role === 'manager' || userData.role === 'finance_manager')) {
      const expectedKey = ADMIN_SECURITY_KEYS[userData.role as keyof typeof ADMIN_SECURITY_KEYS];
      if (userData.secretKey !== expectedKey) {
        toast({
          variant: "destructive",
          title: "Authorization Failed",
          description: "Incorrect security key.",
        });
        return;
      }
    }

    setIsAuthenticating(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      const newUser: UserProfile = {
        id: userCredential.user.uid,
        name: userData.name || 'New User',
        email: normalizedEmail,
        role: isSpecialAdmin ? 'manager' : (userData.role || 'worker'),
        phone: userData.phone || '',
        dob: userData.dob || '',
        skills: [],
        availability: 'Available',
        currentStatus: 'Free for Work',
        points: 0,
        acceptedJobs: 0,
        rejectedJobs: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      toast({
        title: "Account Created",
        description: `Welcome, ${userData.name}!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: error.message || "Could not create account.",
      });
    } finally {
      setIsAuthenticating(false);
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
      assignedWorkerIds: [],
      workerStatuses: {},
      createdAt: new Date().toISOString()
    };
    addDocumentNonBlocking(collection(db, 'jobs'), newJobData);
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!db || !currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // Default updates to the new status
    const updates: any = { status };

    // If a worker is accepting/rejecting, do NOT overwrite the global status unless it's a team transition
    if (currentUser.role === 'worker' && (status === 'accepted' || status === 'rejected')) {
      const newWorkerStatuses = { ...job.workerStatuses, [currentUser.id]: status };
      updates.workerStatuses = newWorkerStatuses;
      
      // Keep global status as 'pending' unless confirmed
      updates.status = 'pending';

      const acceptedCount = Object.values(newWorkerStatuses).filter(s => s === 'accepted').length;
      const totalAssigned = job.assignedWorkerIds?.length || 0;
      
      // ONLY flip to confirmed when ALL assigned workers have accepted
      if (totalAssigned > 0 && acceptedCount === totalAssigned) {
        updates.status = 'confirmed';
      }

      if (status === 'accepted') {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { points: increment(10), acceptedJobs: increment(1) });
      } else {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { points: increment(-5), rejectedJobs: increment(1) });
      }
    }

    if (currentUser.role === 'delivery_boy') {
      if (status === 'delivery_pickup_started') {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { currentStatus: 'Currently Working' });
      } else if (status === 'delivery_destination_reached') {
        // We no longer mark the delivery boy as free here if the team is still working.
        // He will be marked free when the entire job completes in submitHarvestReport.
        updates.deliveryDone = true;
      } else if (status === 'delivery_assigned' && !job.deliveryConfirmedByBoy) {
        updates.deliveryConfirmedByBoy = true;
      }
    }

    // SYNC TEAM STATUS: When harvest starts, everyone on the team is marked as "Working"
    if (status === 'harvest_started') {
      const teamIds = new Set([
        ...(job.assignedWorkerIds || []),
        ...Object.keys(job.workerStatuses || {}),
        job.deliveryBoyId
      ].filter(Boolean));
      
      teamIds.forEach(workerId => {
        updateDocumentNonBlocking(doc(db, 'users', workerId as string), { currentStatus: 'Currently Working' });
      });
    }

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
  };

  return {
    jobs,
    currentUser,
    workers,
    deliveryBoys,
    isAuthenticating,
    isUserLoading: isAuthLoading || isProfileLoading || isUsersLoading || isJobsLoading,
    login,
    logout,
    addJob,
    updateJobStatus,
    setHarvestTime: (jobId: string, time: string) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { harvestTime: time });
    },
    assignDeliveryBoy: (jobId: string, data: { deliveryBoyId: string, deliveryTime: string, gpsUrl: string }) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
        ...data,
        status: 'delivery_assigned',
        deliveryConfirmedByBoy: false,
        deliveryDone: false
      });
    },
    reassignWorker: (jobId: string, workerIds: string[]) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
        assignedWorkerIds: workerIds,
        status: 'pending' 
      });
    },
    requestDeliveryCheck: (jobId: string) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { deliveryCheckRequested: true });
    },
    requestHarvestCheck: (jobId: string) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { harvestCheckRequested: true });
    },
    submitHarvestReport: (jobId: string, trees: number, notes?: string) => {
      if (!db || !currentUser) return;
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const report: HarvestReport = {
        trees,
        notes,
        timestamp: new Date().toISOString()
      };

      const newReports = {
        ...(job.workerHarvestReports || {}),
        [currentUser.id]: report
      };

      const updates: any = { workerHarvestReports: newReports };
      
      const reportsCount = Object.keys(newReports).length;
      const totalRequired = job.assignedWorkerIds?.length || 1;

      // ONLY mark free when the whole job is completed
      if (reportsCount >= totalRequired) {
        updates.harvestDone = true;
        updates.status = 'completed';
        
        // Reset all team members to free for work when the whole job is done
        const teamIds = new Set([
          ...(job.assignedWorkerIds || []),
          ...Object.keys(job.workerStatuses || {}),
          job.deliveryBoyId
        ].filter(Boolean));

        teamIds.forEach(workerId => {
          updateDocumentNonBlocking(doc(db, 'users', workerId as string), { currentStatus: 'Free for Work' });
        });
      }

      updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
      toast({ title: "Report Submitted", description: "Harvest data recorded." });
    },
    archiveJob: (jobId: string) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { archived: true });
    },
    signup,
    deleteJob: (jobId: string) => {
      if (!db) return;
      deleteDoc(doc(db, 'jobs', jobId));
    },
    deleteStaff: (userId: string) => {
      if (!db) return;
      deleteDoc(doc(db, 'users', userId));
    },
    resetRankings: () => {
      allUsers.forEach(w => updateDocumentNonBlocking(doc(db, 'users', w.id), { points: 0, acceptedJobs: 0, rejectedJobs: 0 }));
    },
    updateWorkerStats: (id: string, stats: Partial<UserProfile>) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'users', id), stats);
    },
    authUser
  };
}
