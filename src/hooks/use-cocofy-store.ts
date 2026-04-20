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
        message = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.";
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
        description: `Welcome to the team, ${userData.name}!`,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      let message = "An error occurred during sign up.";
      
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Try logging in instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "The password is too weak. Please use at least 6 characters.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many requests. Please try again in a few minutes.";
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
        description: "You have been successfully signed out.",
      });
    });
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
    toast({
      title: "Job Created",
      description: `Job for ${jobData.customerName} has been added.`,
    });
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { status });
    toast({
      title: "Status Updated",
      description: `Job status changed to ${status}.`,
    });
  };

  const reassignWorker = (jobId: string, workerId: string) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, 'jobs', jobId), { 
      assignedWorkerId: workerId, 
      status: 'pending' 
    });
    const worker = workers.find(w => w.id === workerId);
    toast({
      title: "Worker Assigned",
      description: worker ? `${worker.name} has been assigned to the job.` : "Worker assigned successfully.",
    });
  };

  const deleteJob = (jobId: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, 'jobs', jobId));
    toast({
      title: "Job Cancelled",
      description: "The job has been removed from the schedule.",
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
