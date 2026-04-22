
'use client';

import { useState } from 'react';
import { Job, UserProfile, JobStatus, Role, HarvestReport, PricingPreset, PaymentStatus, PaymentMethod, WorkerPaymentInfo } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

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

  // Presets Query
  const presetsCollection = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'presets');
  }, [db, authUser]);
  const { data: presetsData, isLoading: isPresetsLoading } = useCollection<PricingPreset>(presetsCollection);
  
  // Local sorting for jobs
  const jobs = (jobsData || []).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const allUsers = usersData || [];
  
  const workers = allUsers
    .filter(u => u.role === 'worker')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const deliveryBoys = allUsers
    .filter(u => u.role === 'delivery_boy')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const managers = allUsers
    .filter(u => u.role === 'manager' || u.role === 'finance_manager')
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const presets = (presetsData || []).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const activePreset = presets[0] || { id: 'default', totalPricePerTree: 50, workerPayPerTree: 20 };

  const login = async (targetRole: Role, email?: string, password?: string) => {
    if (!email || !password || isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      const normalizedEmail = email.toLowerCase();

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
      createdAt: new Date().toISOString(),
      presetId: jobData.presetId || activePreset.id,
      paymentStatus: 'unpaid'
    };
    addDocumentNonBlocking(collection(db, 'jobs'), newJobData);
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!db || !currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updates: any = { status };

    // Worker acceptance/rejection
    if (currentUser.role === 'worker' && (status === 'accepted' || status === 'rejected')) {
      const newWorkerStatuses = { ...job.workerStatuses, [currentUser.id]: status };
      updates.workerStatuses = newWorkerStatuses;
      
      if (['pending', 'confirmed', 'unconfirmed'].includes(job.status)) {
        updates.status = 'pending';
        const acceptedCount = Object.values(newWorkerStatuses).filter(s => s === 'accepted').length;
        const totalAssigned = job.assignedWorkerIds?.length || 0;
        
        if (totalAssigned > 0 && acceptedCount === totalAssigned) {
          updates.status = 'confirmed';
        }
      } else {
        delete updates.status;
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
        updates.deliveryDone = true;
      } else if (status === 'delivery_assigned' && !job.deliveryConfirmedByBoy) {
        updates.deliveryConfirmedByBoy = true;
      }
    }

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
    managers,
    presets,
    activePreset,
    isAuthenticating,
    isUserLoading: isAuthLoading || isProfileLoading || isUsersLoading || isJobsLoading || isPresetsLoading,
    login,
    logout,
    addJob,
    updateJobStatus,
    setHarvestTime: (jobId: string, time: string, presetId: string) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
        harvestTime: time,
        presetId: presetId
      });
    },
    assignDeliveryBoy: (jobId: string, data: { deliveryBoyId: string, deliveryTime: string, gpsUrl: string }) => {
      if (!db) return;
      const updates = { 
        ...data,
        status: 'delivery_assigned' as JobStatus,
        deliveryConfirmedByBoy: false,
        deliveryDone: false
      };
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
    },
    reassignWorker: (jobId: string, workerIds: string[]) => {
      if (!db) return;
      const updates = { 
        assignedWorkerIds: workerIds,
        status: 'pending' as JobStatus
      };
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
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

      const newPaymentStatuses = {
        ...(job.workerPaymentStatuses || {}),
        [currentUser.id]: { status: 'unpaid' as PaymentStatus }
      };

      const updates: any = { 
        workerHarvestReports: newReports,
        workerPaymentStatuses: newPaymentStatuses
      };
      
      const reportsCount = Object.keys(newReports).length;
      const totalRequired = job.assignedWorkerIds?.length || 1;

      if (reportsCount >= totalRequired) {
        updates.harvestDone = true;
        updates.status = 'completed';
        
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
    updatePaymentStatus: (jobId: string, paymentData: Partial<Job>) => {
      if (!db) return;
      
      const { paymentScreenshots, ...rest } = paymentData;
      const updates: any = {
        ...rest,
        settledAt: new Date().toISOString()
      };

      if (paymentScreenshots && paymentScreenshots.length > 0) {
        updates.paymentScreenshots = arrayUnion(...paymentScreenshots);
      }

      updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
      toast({ title: "Payment Recorded", description: "The accounts have been updated." });
    },
    payWorkerSalary: (jobId: string, workerId: string, method: PaymentMethod, proofUrl: string) => {
      if (!db) return;
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const newPaymentStatuses = {
        ...(job.workerPaymentStatuses || {}),
        [workerId]: {
          status: 'fully_paid' as PaymentStatus,
          method: method,
          proof: proofUrl,
          paidAt: new Date().toISOString()
        }
      };

      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { workerPaymentStatuses: newPaymentStatuses });
      toast({ title: "Salary Settled", description: "The worker's salary has been marked as paid." });
    },
    archiveJob: (jobId: string) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { archived: true });
    },
    signup,
    deleteJob: (jobId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'jobs', jobId));
    },
    deleteStaff: (userId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'users', userId));
    },
    resetRankings: () => {
      allUsers.forEach(w => updateDocumentNonBlocking(doc(db, 'users', w.id), { points: 0, acceptedJobs: 0, rejectedJobs: 0 }));
    },
    updateWorkerStats: (id: string, stats: Partial<UserProfile>) => {
      if (!db) return;
      updateDocumentNonBlocking(doc(db, 'users', id), stats);
    },
    addPreset: (data: any) => {
      if (!db) return;
      addDocumentNonBlocking(collection(db, 'presets'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Preset Added", description: "Pricing configuration saved." });
    },
    deletePreset: (id: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'presets', id));
      toast({ title: "Preset Removed" });
    },
    authUser
  };
}
