
'use client';

import { useState } from 'react';
import { Job, UserProfile, JobStatus, Role } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  runTransaction 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

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
  
  // Sort workers by points locally for the leaderboard
  const workers = allUsers
    .filter(u => u.role === 'worker')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const login = async (targetRole: Role, email?: string, password?: string) => {
    if (!email || !password || isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Fetch the profile from Firestore to check the role immediately
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (!userSnap.exists()) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "User profile not found in database.",
        });
        return;
      }

      const profile = userSnap.data() as UserProfile;

      // 3. Verify the role matches the portal the user is trying to use
      if (profile.role !== targetRole) {
        // Log out immediately to prevent unauthorized dashboard access
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `This account is registered as a ${profile.role}. Please log in through the ${profile.role} portal.`,
        });
        return;
      }

      toast({
        title: "Signed In",
        description: `Welcome back, ${profile.name}!`,
      });
    } catch (error: any) {
      let message = "An error occurred during sign in.";
      
      // Handle specific Firebase Auth error codes for cleaner UI feedback
      if (error.code === 'auth/user-not-found') {
        message = "Email is not registered.";
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Email or password incorrect.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Invalid email format.";
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
    } finally {
      setIsAuthenticating(false);
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
        email: userData.email,
        role: userData.role || 'worker',
        phone: userData.phone || '',
        dob: userData.dob || '',
        skills: [],
        availability: 'Available',
        points: 0,
        acceptedJobs: 0,
        rejectedJobs: 0
      };
      
      await setDoc(doc(db, 'users', newUser.id), newUser);
      toast({
        title: "Account Created",
        description: `Welcome to Cocofy, ${userData.name}!`,
      });
    } catch (error: any) {
      let message = "An error occurred during sign up.";
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered.";
      }
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: message,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    signOut(auth).then(() => {
      toast({
        title: "Signed Out",
        description: "Your session has ended securely.",
      });
    });
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
    toast({
      title: "Job Created",
      description: `Job for ${jobData.customerName} saved as unconfirmed.`,
    });
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    if (!db || !currentUser) return;

    if (currentUser.role === 'worker') {
      try {
        await runTransaction(db, async (transaction) => {
          const jobRef = doc(db, 'jobs', jobId);
          const userRef = doc(db, 'users', currentUser.id);
          
          const jobDoc = await transaction.get(jobRef);
          const userDoc = await transaction.get(userRef);
          
          if (!jobDoc.exists() || !userDoc.exists()) {
            throw new Error("Document does not exist!");
          }

          const jobData = jobDoc.data() as Job;
          const userData = userDoc.data() as UserProfile;

          // Check if worker already has a final status for this job to prevent duplicate points
          const prevStatus = jobData.workerStatuses?.[currentUser.id];
          if (prevStatus && prevStatus !== 'pending') {
            const newWorkerStatuses = { ...jobData.workerStatuses, [currentUser.id]: status };
            transaction.update(jobRef, { workerStatuses: newWorkerStatuses });
            return;
          }

          let pointsChange = 0;
          let acceptedChange = 0;
          let rejectedChange = 0;

          if (status === 'accepted') {
            pointsChange = 10;
            acceptedChange = 1;
          } else if (status === 'rejected') {
            pointsChange = -5;
            rejectedChange = 1;
          }

          const newPoints = Math.max(0, (userData.points || 0) + pointsChange);
          const newAccepted = (userData.acceptedJobs || 0) + acceptedChange;
          const newRejected = (userData.rejectedJobs || 0) + rejectedChange;

          const newWorkerStatuses = { ...jobData.workerStatuses, [currentUser.id]: status };
          
          transaction.update(jobRef, { workerStatuses: newWorkerStatuses });
          transaction.update(userRef, {
            points: newPoints,
            acceptedJobs: newAccepted,
            rejectedJobs: newRejected
          });
        });

        toast({
          title: "Status Updated",
          description: `Status updated to ${status}. Points updated.`,
        });
      } catch (e) {
        // Fail silently or show generic toast - handled centrally by FirebaseErrorListener if permission denied
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update status or points.",
        });
      }
    } else {
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { status });
      toast({
        title: "Status Updated",
        description: `Status updated to ${status}.`,
      });
    }
  };

  const resetRankings = () => {
    if (!db || !currentUser || currentUser.role !== 'manager') return;
    
    workers.forEach(worker => {
      updateDocumentNonBlocking(doc(db, 'users', worker.id), {
        points: 0,
        acceptedJobs: 0,
        rejectedJobs: 0
      });
    });

    toast({
      title: "Rankings Reset",
      description: "All worker statistics have been reset to zero.",
    });
  };

  const updateWorkerStats = (workerId: string, stats: Partial<UserProfile>) => {
    if (!db || !currentUser || currentUser.role !== 'manager') return;
    
    updateDocumentNonBlocking(doc(db, 'users', workerId), stats);
    toast({
      title: "Worker Updated",
      description: "Statistics updated successfully.",
    });
  };

  const reassignWorker = (jobId: string, workerIds: string[]) => {
    if (!db) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newWorkerStatuses: Record<string, JobStatus> = {};
    workerIds.forEach(id => {
      newWorkerStatuses[id] = job.workerStatuses?.[id] || 'pending';
    });

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      assignedWorkerIds: workerIds, 
      workerStatuses: newWorkerStatuses,
      status: 'pending' 
    });

    toast({
      title: "Workers Assigned",
      description: `${workerIds.length} worker(s) assigned.`,
    });
  };

  const deleteJob = (jobId: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'jobs', jobId));
    toast({
      title: "Job Removed",
      description: "Job has been deleted.",
    });
  };

  return {
    jobs,
    currentUser,
    workers,
    isAuthenticating,
    isUserLoading: isAuthLoading || isProfileLoading || isUsersLoading || isJobsLoading,
    login,
    logout,
    addJob,
    updateJobStatus,
    reassignWorker,
    signup,
    deleteJob,
    resetRankings,
    updateWorkerStats
  };
}
