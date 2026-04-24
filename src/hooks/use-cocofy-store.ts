
'use client';

import { useState } from 'react';
import { 
  Job, 
  UserProfile, 
  JobStatus, 
  Role, 
  HarvestReport, 
  PricingPreset, 
  PaymentStatus, 
  PaymentMethod, 
  Notification 
} from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  increment,
  query,
  where,
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAIL = 'shaheenmkd2025@gmail.com';

export function useCocofyStore() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  const db = useFirestore();
  const auth = getAuth();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Profile
  const currentUserRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);
  const { data: currentUser, isLoading: isProfileLoading } = useDoc<UserProfile>(currentUserRef);

  // Notifications
  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return query(collection(db, 'notifications'), where('userId', '==', authUser.uid));
  }, [db, authUser]);
  const { data: notificationsData } = useCollection<Notification>(notificationsQuery);

  const notifications = (notificationsData || []).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Data Collections
  const jobsCollection = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'jobs');
  }, [db, authUser]);
  const { data: jobsData, isLoading: isJobsLoading } = useCollection<Job>(jobsCollection);

  const usersCollection = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'users');
  }, [db, authUser]);
  const { data: usersData, isLoading: isUsersLoading } = useCollection<UserProfile>(usersCollection);

  const presetsCollection = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return collection(db, 'presets');
  }, [db, authUser]);
  const { data: presetsData, isLoading: isPresetsLoading } = useCollection<PricingPreset>(presetsCollection);
  
  const jobs = (jobsData || []).sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const allUsers = usersData || [];
  const workers = allUsers.filter(u => u.role === 'worker').sort((a, b) => (b.points || 0) - (a.points || 0));
  const deliveryBoys = allUsers.filter(u => u.role === 'delivery_boy').sort((a, b) => (b.points || 0) - (a.points || 0));
  const presets = (presetsData || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activePreset = presets[0] || { id: 'default', totalPricePerTree: 50, workerPayPerTree: 20 };

  const login = async (targetRole: Role, email?: string, password?: string) => {
    if (!email || !password || isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        toast({ variant: "destructive", title: "Access Revoked" });
        await signOut(auth);
      } else {
        const profile = userSnap.data() as UserProfile;
        if (profile.role !== targetRole && email.toLowerCase() !== ADMIN_EMAIL) {
          toast({ variant: "destructive", title: "Access Denied" });
          await signOut(auth);
        } else {
          toast({ title: `Welcome, ${profile.name}!` });
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Error", description: error.message });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout Error", description: error.message });
    }
  };

  const signup = async (userData: any) => {
    if (!userData.email || !userData.password || isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const newUser: UserProfile = {
        id: userCredential.user.uid,
        name: userData.name || 'New User',
        email: userData.email.toLowerCase(),
        role: userData.role || 'worker',
        phone: userData.phone || '',
        dob: userData.dob || '',
        skills: [],
        availability: 'Available',
        points: 0,
        acceptedJobs: 0,
        rejectedJobs: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      toast({ title: "Account Created" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Signup Error", description: error.message });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!db || !currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    let updates: any = { status };

    // Workflow Logic
    if (currentUser.role === 'worker' && (status === 'accepted' || status === 'rejected')) {
      const newWorkerStatuses = { ...job.workerStatuses, [currentUser.id]: status };
      updates.workerStatuses = newWorkerStatuses;
      
      const totalRequired = job.assignedWorkerIds?.length || 1;
      const acceptedCount = Object.values(newWorkerStatuses).filter(s => s === 'accepted').length;
      
      if (acceptedCount >= totalRequired) {
        updates.status = 'confirmed';
      } else {
        updates.status = 'pending';
      }

      if (status === 'accepted') {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { points: increment(10), acceptedJobs: increment(1) });
      } else {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { points: increment(-5), rejectedJobs: increment(1) });
      }
    }

    if (currentUser.role === 'delivery_boy') {
      if (status === 'delivery_assigned' && !job.deliveryConfirmedByBoy) {
        updates.deliveryConfirmedByBoy = true;
      } else if (status === 'delivery_destination_reached') {
        updates.deliveryDone = true;
      }
    }

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
  };

  const reassignWorker = (jobId: string, workerIds: string[]) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      assignedWorkerIds: workerIds,
      status: 'pending' 
    });
  };

  const assignDeliveryBoy = (jobId: string, data: { deliveryBoyId: string, deliveryTime: string, gpsUrl: string }) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      ...data,
      status: 'delivery_assigned',
      deliveryConfirmedByBoy: false
    });
  };

  const submitHarvestReport = (jobId: string, trees: number, notes?: string) => {
    if (!db || !currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newReports = { ...(job.workerHarvestReports || {}), [currentUser.id]: { trees, notes, timestamp: new Date().toISOString() } };
    const updates: any = { 
      workerHarvestReports: newReports,
      workerPaymentStatuses: { ...(job.workerPaymentStatuses || {}), [currentUser.id]: { status: 'unpaid' } }
    };
    
    const reportsCount = Object.keys(newReports).length;
    const totalRequired = job.assignedWorkerIds?.length || 1;

    if (reportsCount >= totalRequired) {
      updates.status = 'completed';
      updates.harvestDone = true;
    }

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
  };

  const payWorkerSalary = (jobId: string, workerId: string, method: PaymentMethod, proofUrl: string) => {
    if (!db) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newPaymentStatuses = {
      ...(job.workerPaymentStatuses || {}),
      [workerId]: {
        status: 'fully_paid',
        method,
        proof: proofUrl,
        paidAt: new Date().toISOString()
      }
    };

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { workerPaymentStatuses: newPaymentStatuses });
  };

  return {
    jobs,
    currentUser,
    notifications,
    workers,
    deliveryBoys,
    presets,
    activePreset,
    isAuthenticating,
    isUserLoading: isAuthLoading || isProfileLoading || isUsersLoading || isJobsLoading || isPresetsLoading,
    login,
    logout,
    signup,
    addJob: (data: any) => {
      if (!db || !currentUser) return;
      addDocumentNonBlocking(collection(db, 'jobs'), { 
        ...data, 
        managerId: currentUser.id, 
        status: data.assignedWorkerIds?.length > 0 ? 'pending' : 'unconfirmed', 
        assignedWorkerIds: data.assignedWorkerIds || [], 
        workerStatuses: {}, 
        createdAt: new Date().toISOString(), 
        paymentStatus: 'unpaid' 
      });
    },
    updateJobStatus,
    reassignWorker,
    assignDeliveryBoy,
    submitHarvestReport,
    payWorkerSalary,
    markAsRead: () => {
      notifications.filter(n => !n.read).forEach(n => updateDocumentNonBlocking(doc(db, 'notifications', n.id), { read: true }));
    },
    deleteNotification: (id: string) => deleteDocumentNonBlocking(doc(db, 'notifications', id)),
    clearAllNotifications: () => notifications.forEach(n => deleteDocumentNonBlocking(doc(db, 'notifications', n.id))),
    setHarvestTime: (jobId: string, time: string, presetId: string) => updateDocumentNonBlocking(doc(db, 'jobs', jobId), { harvestTime: time, presetId }),
    archiveJob: (jobId: string) => updateDocumentNonBlocking(doc(db, 'jobs', jobId), { archived: true }),
    deleteJob: (jobId: string) => deleteDocumentNonBlocking(doc(db, 'jobs', jobId)),
    deleteStaff: (userId: string) => deleteDocumentNonBlocking(doc(db, 'users', userId)),
    updatePaymentStatus: (jobId: string, data: any) => updateDocumentNonBlocking(doc(db, 'jobs', jobId), { ...data, settledAt: new Date().toISOString() }),
    resetRankings: () => allUsers.forEach(w => updateDocumentNonBlocking(doc(db, 'users', w.id), { points: 0, acceptedJobs: 0, rejectedJobs: 0 })),
    updateWorkerStats: (id: string, stats: any) => updateDocumentNonBlocking(doc(db, 'users', id), stats),
    addPreset: (data: { name: string, totalPricePerTree: number, workerPayPerTree: number }) => {
      if (!db) return;
      addDocumentNonBlocking(collection(db, 'presets'), {
        ...data,
        createdAt: new Date().toISOString()
      });
    },
    deletePreset: (id: string) => deleteDocumentNonBlocking(doc(db, 'presets', id))
  };
}
