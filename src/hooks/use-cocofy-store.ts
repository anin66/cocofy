import { useState } from 'react';
import { Job, UserProfile, JobStatus, Role } from '@/lib/types';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  orderBy 
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
    if (!email || !password || isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed In",
        description: `Welcome back to Cocofy!`,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      let message = "An error occurred during sign in.";
      
      if (error.code === 'auth/invalid-credential') {
        message = "No account found with these credentials. Please check your email and password.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Try again later.";
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
        availability: 'Available'
      };
      
      await setDoc(doc(db, 'users', newUser.id), newUser);
      toast({
        title: "Account Created",
        description: `Welcome to Cocofy, ${userData.name}! Your data is now securely stored in the cloud.`,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
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

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!db) return;

    // If a worker is calling this, update their specific status key
    if (currentUser?.role === 'worker') {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const newWorkerStatuses = { 
        ...(job.workerStatuses || {}), 
        [currentUser.id]: status 
      };

      // Calculate global status: if anyone rejected, the job needs attention ('rejected')
      // Otherwise, the overall status follows the confirm/complete flow
      let globalStatus = job.status;
      if (status === 'rejected') {
        globalStatus = 'rejected';
      }

      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
        workerStatuses: newWorkerStatuses,
        status: globalStatus
      });
    } else {
      // Manager manual status update
      updateDocumentNonBlocking(doc(db, 'jobs', jobId), { status });
    }

    toast({
      title: "Status Updated",
      description: `Status updated to ${status}.`,
    });
  };

  const reassignWorker = (jobId: string, workerIds: string[]) => {
    if (!db) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    // Build new worker statuses, keeping existing ones if worker is still assigned
    const newWorkerStatuses: Record<string, JobStatus> = {};
    workerIds.forEach(id => {
      newWorkerStatuses[id] = job.workerStatuses?.[id] || 'pending';
    });

    // Check if any *current* assigned worker has rejected
    const anyRejected = Object.values(newWorkerStatuses).some(s => s === 'rejected');

    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      assignedWorkerIds: workerIds, 
      workerStatuses: newWorkerStatuses,
      status: anyRejected ? 'rejected' : 'pending'
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
    deleteJob
  };
}
