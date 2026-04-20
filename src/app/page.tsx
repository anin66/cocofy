"use client";

import React, { useState } from 'react';
import { useCocofyStore } from '@/hooks/use-cocofy-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { JobCard } from '@/components/dashboard/job-card';
import { CreateJobModal } from '@/components/dashboard/create-job-modal';
import { ReassignmentModal } from '@/components/dashboard/reassignment-modal';
import { AssignDeliveryModal } from '@/components/dashboard/assign-delivery-modal';
import { SetTimeModal } from '@/components/dashboard/set-time-modal';
import { WorkerCompletionModal } from '@/components/dashboard/worker-completion-modal';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { Job, Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sprout, 
  Briefcase, 
  Plus, 
  Users, 
  Loader2, 
  Truck,
  IndianRupee,
  Activity,
  Trash2,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const store = useCocofyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reassigningJob, setReassigningJob] = useState<Job | null>(null);
  const [assigningDeliveryJob, setAssigningDeliveryJob] = useState<Job | null>(null);
  const [setTimeJob, setSetTimeJob] = useState<Job | null>(null);
  const [workerCompleteJob, setWorkerCompleteJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeView, setActiveView] = useState('dashboard');
  
  const [authData, setAuthData] = useState({ 
    name: '', 
    email: '', 
    role: 'worker' as Role,
    phone: '',
    dob: '',
    password: '',
    secretKey: ''
  });

  if (store.isUserLoading && !store.isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-primary animate-spin" />
           <p className="text-muted-foreground animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  const availableRoles = [
    { id: 'worker', label: 'Worker', icon: Briefcase },
    { id: 'delivery_boy', label: 'Delivery', icon: Truck },
    { id: 'manager', label: 'Manager', icon: Users },
    { id: 'finance_manager', label: 'Finance', icon: IndianRupee },
  ];

  if (!store.currentUser || store.isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
        <div className="w-full max-w-[540px] relative z-10 animate-fade-in">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center text-white mb-4 shadow-2xl">
              <Sprout className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-white">Cocofy</h1>
            <p className="text-muted-foreground text-lg">Smart harvest & logistics</p>
          </div>

          <div className="glass border border-white/10 p-8 rounded-3xl space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-headline font-semibold text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Join the Network'}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                {availableRoles.map((roleOption) => (
                  <button 
                    key={roleOption.id}
                    disabled={store.isAuthenticating}
                    onClick={() => setAuthData({ ...authData, role: roleOption.id as Role })}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all active:scale-95 disabled:opacity-50",
                      authData.role === roleOption.id ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <roleOption.icon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold uppercase">{roleOption.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {authMode === 'signup' && (
                  <Input placeholder="Full Name" value={authData.name} onChange={e => setAuthData({ ...authData, name: e.target.value })} className="bg-white/5 border-white/10 text-white" disabled={store.isAuthenticating} />
                )}
                <Input type="email" placeholder="Email Address" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} className="bg-white/5 border-white/10 text-white" disabled={store.isAuthenticating} />
                {authMode === 'signup' && (
                  <Input type="tel" placeholder="Phone Number" value={authData.phone} onChange={e => setAuthData({ ...authData, phone: e.target.value })} className="bg-white/5 border-white/10 text-white" disabled={store.isAuthenticating} />
                )}
                <Input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} className="bg-white/5 border-white/10 text-white" disabled={store.isAuthenticating} />
                {authMode === 'signup' && (authData.role === 'manager' || authData.role === 'finance_manager') && (
                  <Input type="password" placeholder="Security Key" value={authData.secretKey} onChange={e => setAuthData({ ...authData, secretKey: e.target.value })} className="bg-primary/5 border-primary/20 text-white" disabled={store.isAuthenticating} />
                )}
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  disabled={store.isAuthenticating}
                  onClick={() => authMode === 'login' ? store.login(authData.role, authData.email, authData.password) : store.signup(authData)} 
                  className="w-full orange-gradient font-semibold h-12 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {store.isAuthenticating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                <Button variant="ghost" disabled={store.isAuthenticating} onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-primary hover:bg-white/5 transition-all active:scale-95">
                  {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = store.jobs.filter(j => !j.archived && (j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || j.location.toLowerCase().includes(searchQuery.toLowerCase())));
  const historyJobs = store.jobs.filter(j => j.archived && (j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || j.location.toLowerCase().includes(searchQuery.toLowerCase())));
  const userJobs = store.currentUser.role === 'delivery_boy' ? filteredJobs.filter(j => j.deliveryBoyId === store.currentUser?.id) : filteredJobs.filter(j => j.assignedWorkerIds?.includes(store.currentUser?.id || ''));

  const currentOperationalJobs = store.currentUser.role === 'manager' || store.currentUser.role === 'finance_manager' ? filteredJobs : userJobs;

  return (
    <DashboardLayout user={store.currentUser} onLogout={store.logout} activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'staff' ? (
        <div className="space-y-10 max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
             <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2 text-primary">
                  <Activity className="w-5 h-5" />
                  <h3 className="text-xl font-headline font-bold text-white">Harvesting Workers</h3>
                </div>
             </div>
             <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="text-white">Full Name</TableHead>
                    <TableHead className="text-white">Contact</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.workers.map((staff) => (
                    <TableRow key={staff.id} className="border-white/5">
                      <TableCell className="font-semibold text-white">{staff.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{staff.email}<br/>{staff.phone}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass border-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Staff Profile?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently remove {staff.name} and revoke their access to the Cocofy portal. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => store.deleteStaff(staff.id)} className="bg-destructive text-destructive-foreground">Delete Permanently</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
             <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2 text-orange-500">
                  <Truck className="w-5 h-5" />
                  <h3 className="text-xl font-headline font-bold text-white">Delivery Boys</h3>
                </div>
             </div>
             <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="text-white">Full Name</TableHead>
                    <TableHead className="text-white">Contact</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.deliveryBoys.map((staff) => (
                    <TableRow key={staff.id} className="border-white/5">
                      <TableCell className="font-semibold text-white">{staff.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{staff.email}<br/>{staff.phone}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass border-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Delivery Partner?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently remove {staff.name} and revoke their access to the Cocofy portal. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => store.deleteStaff(staff.id)} className="bg-destructive text-destructive-foreground">Delete Permanently</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </div>
        </div>
      ) : activeView === 'leaderboard' ? (
        <Leaderboard workers={store.workers} currentUserId={store.currentUser?.id} role={store.currentUser.role} onReset={store.resetRankings} onUpdateStats={store.updateWorkerStats} />
      ) : activeView === 'history' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6"><History className="w-6 h-6 text-primary" /><h2 className="text-2xl font-headline font-bold text-white">Job Records History</h2></div>
          {historyJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyJobs.map(job => (
                <JobCard key={job.id} job={job} role={store.currentUser.role} currentUserId={store.currentUser?.id} assignedWorkers={store.workers.filter(w => job.assignedWorkerIds?.includes(w.id))} deliveryBoy={store.deliveryBoys.find(b => b.id === job.deliveryBoyId)} onDelete={store.deleteJob} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border-dashed border-2">
              <History className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-lg">No historical records found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-headline font-bold text-white">Job Requests</h2>
            <div className="flex items-center gap-2">
              {store.currentUser.role === 'manager' && <Button onClick={() => setShowCreateModal(true)} className="orange-gradient transition-all active:scale-95"><Plus className="w-4 h-4 mr-2" />New Job</Button>}
            </div>
          </div>

          {currentOperationalJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentOperationalJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  role={store.currentUser.role} 
                  currentUserId={store.currentUser?.id}
                  assignedWorkers={store.workers.filter(w => job.assignedWorkerIds?.includes(w.id))}
                  deliveryBoy={store.deliveryBoys.find(b => b.id === job.deliveryBoyId)}
                  onStatusUpdate={store.updateJobStatus}
                  onReassign={setReassigningJob}
                  onAssignDelivery={setAssigningDeliveryJob}
                  onSetTime={setSetTimeJob}
                  onWorkerComplete={setWorkerCompleteJob}
                  onArchive={store.archiveJob}
                  onDelete={store.deleteJob}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border-dashed border-2 border-white/10">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-headline font-semibold text-white mb-2">Currently no job requests</h3>
              <p className="text-muted-foreground text-center max-w-xs">
                {store.currentUser.role === 'manager' 
                  ? "Get started by creating a new harvesting task for your team." 
                  : "All caught up! Check back later for new assignments."}
              </p>
            </div>
          )}
        </div>
      )}

      <CreateJobModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onAdd={store.addJob} />
      <ReassignmentModal job={reassigningJob} workers={store.workers} onClose={() => setReassigningJob(null)} onAssign={store.reassignWorker} />
      <AssignDeliveryModal job={assigningDeliveryJob} deliveryBoys={store.deliveryBoys} onClose={() => setAssigningDeliveryJob(null)} onAssign={store.assignDeliveryBoy} />
      <SetTimeModal job={setTimeJob} onClose={() => setSetTimeJob(null)} onConfirm={store.setHarvestTime} />
      <WorkerCompletionModal job={workerCompleteJob} onClose={() => setWorkerCompleteJob(null)} onSubmit={store.submitHarvestReport} />
    </DashboardLayout>
  );
}
