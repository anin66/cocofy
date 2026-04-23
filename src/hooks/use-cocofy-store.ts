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
  arrayUnion,
  query,
  where,
  getDocs
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
  const managers = allUsers.filter(u => u.role === 'manager' || u.role === 'finance_manager').sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const presets = (presetsData || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activePreset = presets[0] || { id: 'default', totalPricePerTree: 50, workerPayPerTree: 20 };

  // Helper to send notifications
  const sendNotification = (userId: string, title: string, message: string, type: Notification['type'] = 'info') => {
    if (!db) return;
    const nRef = doc(collection(db, 'notifications'));
    const n: Notification = {
      id: nRef.id,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setDoc(nRef, n);
    
    // Toast if the recipient is the current user
    if (authUser?.uid === userId) {
      toast({
        title,
        description: message,
        variant: type === 'warning' ? 'destructive' : 'default'
      });
    }
  };

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

    // Workflow Logic & Push Notifications
    if (currentUser.role === 'worker' && (status === 'accepted' || status === 'rejected')) {
      const newWorkerStatuses = { ...job.workerStatuses, [currentUser.id]: status };
      updates.workerStatuses = newWorkerStatuses;
      
      // Calculate overall job status based on team responses
      const totalRequired = job.assignedWorkerIds?.length || 1;
      const acceptedCount = Object.values(newWorkerStatuses).filter(s => s === 'accepted').length;
      
      // If all workers have accepted, move the job status to confirmed to trigger logistics
      if (acceptedCount >= totalRequired) {
        updates.status = 'confirmed';
      } else {
        // Otherwise keep it pending so manager can see awaiting responses or manage replacements
        updates.status = 'pending';
      }

      // Notify Manager
      sendNotification(
        job.managerId, 
        `Worker ${status.charAt(0).toUpperCase() + status.slice(1)}`, 
        `${currentUser.name} has ${status} the job for ${job.customerName}.`,
        status === 'rejected' ? 'warning' : 'success'
      );

      if (status === 'accepted') {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { points: increment(10), acceptedJobs: increment(1) });
      } else {
        updateDocumentNonBlocking(doc(db, 'users', currentUser.id), { points: increment(-5), rejectedJobs: increment(1) });
      }
    }

    if (currentUser.role === 'delivery_boy') {
      if (status === 'delivery_assigned' && !job.deliveryConfirmedByBoy) {
        updates.deliveryConfirmedByBoy = true;
        sendNotification(job.managerId, "Task Confirmed", `${currentUser.name} has confirmed the delivery task for ${job.customerName}.`, "success");
      } else if (status === 'delivery_pickup_started') {
        sendNotification(job.managerId, "Pickup Started", `Delivery boy ${currentUser.name} has started the pickup.`, "info");
      } else if (status === 'delivery_destination_reached') {
        updates.deliveryDone = true;
        sendNotification(job.managerId, "Arrival Notice", `Delivery boy ${currentUser.name} has reached the destination for ${job.customerName}.`, "success");
      }
    }

    if (status === 'harvest_started') {
      sendNotification(job.managerId, "Harvest Started", `The team has started harvesting at ${job.customerName}.`, "info");
    }

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), updates);
  };

  const reassignWorker = (jobId: string, workerIds: string[]) => {
    if (!db) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    workerIds.forEach(id => {
      if (!job.assignedWorkerIds?.includes(id)) {
        sendNotification(id, "New Job Request", `You have been assigned to harvest for ${job.customerName}. Check the details!`, "info");
      }
    });

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      assignedWorkerIds: workerIds,
      status: 'pending' 
    });
  };

  const assignDeliveryBoy = (jobId: string, data: { deliveryBoyId: string, deliveryTime: string, gpsUrl: string }) => {
    if (!db) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    sendNotification(data.deliveryBoyId, "New Delivery Task", `Pick up harvest from ${job.customerName} at ${data.deliveryTime}.`, "info");

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
      
      // Notify Manager
      sendNotification(job.managerId, "Job Completed", `Harvesting for ${job.customerName} is finished. Total trees: ${trees}.`, "success");
      
      // Notify Finance Managers for settlement
      allUsers.filter(u => u.role === 'finance_manager').forEach(f => {
        sendNotification(f.id, "New Settlement Pending", `Payment settlement required for ${job.customerName}. Harvest completed.`, "warning");
      });
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
    
    // Notify Worker
    sendNotification(workerId, "Salary Settled", `Your payment for ${job.customerName} has been processed via ${method.toUpperCase()}.`, "success");
  };

  return {
    jobs,
    currentUser,
    notifications,
    workers,
    deliveryBoys,
    managers,
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
        status: 'unconfirmed', 
        assignedWorkerIds: [], 
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
