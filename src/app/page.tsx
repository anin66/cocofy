"use client";

import React, { useState } from 'react';
import { useCocofyStore } from '@/hooks/use-cocofy-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { JobCard } from '@/components/dashboard/job-card';
import { CreateJobModal } from '@/components/dashboard/create-job-modal';
import { ReassignmentModal } from '@/components/dashboard/reassignment-modal';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { Job, Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sprout, 
  Briefcase, 
  Plus, 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Trophy, 
  Star 
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function Home() {
  const store = useCocofyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reassigningJob, setReassigningJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [authData, setAuthData] = useState({ 
    name: '', 
    email: '', 
    role: 'worker' as Role,
    phone: '',
    dob: '',
    password: ''
  });

  if (store.isUserLoading && !store.isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!store.currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
        <div className="w-full max-w-[480px] relative z-10 animate-fade-in">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center text-white mb-4 shadow-2xl shadow-primary/20">
              <Sprout className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 text-white">Cocofy</h1>
            <p className="text-muted-foreground">The future of coconut harvest management</p>
          </div>

          <div className="glass border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-semibold text-white text-center">
                {authMode === 'login' ? 'Welcome Back' : 'Join the Team'}
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                {authMode === 'login' 
                  ? `Sign in to the ${authData.role} portal` 
                  : 'Create your account to get started'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-4">
                <button 
                  onClick={() => setAuthData({ ...authData, role: 'worker' })}
                  disabled={store.isAuthenticating}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    authData.role === 'worker' ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  Worker
                </button>
                <button 
                  onClick={() => setAuthData({ ...authData, role: 'manager' })}
                  disabled={store.isAuthenticating}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    authData.role === 'manager' ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                  )}
                >
                  Manager
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="e.g. John Doe" 
                        value={authData.name}
                        disabled={store.isAuthenticating}
                        onChange={e => setAuthData({ ...authData, name: e.target.value })}
                        className="bg-white/5 border-white/10 pl-10 text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={authData.email}
                      disabled={store.isAuthenticating}
                      onChange={e => setAuthData({ ...authData, email: e.target.value })}
                      className="bg-white/5 border-white/10 pl-10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={authData.password}
                      disabled={store.isAuthenticating}
                      onChange={e => setAuthData({ ...authData, password: e.target.value })}
                      className="bg-white/5 border-white/10 pl-10 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                {authMode === 'login' ? (
                  <>
                    <Button 
                      onClick={() => store.login(authData.role, authData.email, authData.password)} 
                      disabled={store.isAuthenticating}
                      className="w-full orange-gradient font-semibold h-12"
                    >
                      {store.isAuthenticating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        `Sign In as ${authData.role === 'manager' ? 'Manager' : 'Worker'}`
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      disabled={store.isAuthenticating}
                      onClick={() => setAuthMode('signup')}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Don't have an account? Sign Up
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => store.signup(authData)} 
                      disabled={store.isAuthenticating}
                      className="w-full orange-gradient font-semibold h-12"
                    >
                      {store.isAuthenticating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      disabled={store.isAuthenticating}
                      onClick={() => setAuthMode('login')}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                    >
                      Already have an account? Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = store.jobs.filter(j => 
    j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeJobs = filteredJobs.filter(j => j.status !== 'completed' && j.status !== 'rejected');
  const workerJobs = store.jobs.filter(j => j.assignedWorkerIds?.includes(store.currentUser?.id || ''));

  return (
    <DashboardLayout user={store.currentUser} onLogout={store.logout}>
      {store.currentUser.role === 'manager' ? (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Jobs', value: store.jobs.length, icon: Briefcase, color: 'text-primary' },
              { label: 'Active Tasks', value: activeJobs.length, icon: Sprout, color: 'text-green-500' },
              { label: 'Unassigned', value: store.jobs.filter(j => (j.assignedWorkerIds?.length || 0) === 0).length, icon: Users, color: 'text-yellow-500' },
              { label: 'Total Workers', value: store.workers.length, icon: Users, color: 'text-blue-500' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-headline font-bold mt-1 text-white">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-headline font-bold text-white">Manage Jobs</h2>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search jobs..." 
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="orange-gradient"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Job
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                  <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary">All Jobs</TabsTrigger>
                  <TabsTrigger value="unassigned" className="rounded-lg data-[state=active]:bg-primary">Unassigned</TabsTrigger>
                  <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-accent">Action Required</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        role="manager" 
                        currentUserId={store.currentUser?.id}
                        assignedWorkers={store.workers.filter(w => job.assignedWorkerIds?.includes(w.id))}
                        onStatusUpdate={store.updateJobStatus}
                        onReassign={() => setReassigningJob(job)}
                        onDelete={store.deleteJob}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unassigned">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.filter(j => (j.assignedWorkerIds?.length || 0) === 0).map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        role="manager" 
                        currentUserId={store.currentUser?.id}
                        assignedWorkers={store.workers.filter(w => job.assignedWorkerIds?.includes(w.id))}
                        onStatusUpdate={store.updateJobStatus}
                        onReassign={() => setReassigningJob(job)}
                        onDelete={store.deleteJob}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="rejected">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.filter(j => j.status === 'rejected').map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        role="manager" 
                        currentUserId={store.currentUser?.id}
                        assignedWorkers={store.workers.filter(w => job.assignedWorkerIds?.includes(w.id))}
                        onStatusUpdate={store.updateJobStatus}
                        onReassign={() => setReassigningJob(job)}
                        onDelete={store.deleteJob}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
               <Leaderboard 
                 workers={store.workers} 
                 currentUserId={store.currentUser?.id} 
                 role="manager"
                 onReset={store.resetRankings}
                 onUpdateStats={store.updateWorkerStats}
               />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="glass-card p-8 rounded-3xl orange-gradient text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="relative z-10">
               <h2 className="text-3xl font-headline font-bold mb-2 text-white">Hello, {store.currentUser.name}</h2>
               <div className="flex items-center gap-4">
                 <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                   <Star className="w-3.5 h-3.5 fill-white" />
                   {store.currentUser.points || 0} Points
                 </div>
                 <p className="text-white/80">Manage your assigned harvesting tasks here.</p>
               </div>
             </div>
             <div className="flex gap-4 relative z-10">
               <div className="bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl text-center">
                 <p className="text-xs text-white/60 uppercase tracking-widest font-bold">New</p>
                 <p className="text-2xl font-headline font-bold">{workerJobs.filter(j => (j.workerStatuses?.[store.currentUser?.id || ''] || 'pending') === 'pending').length}</p>
               </div>
               <div className="bg-black/20 backdrop-blur-md px-6 py-4 rounded-2xl text-center">
                 <p className="text-xs text-white/60 uppercase tracking-widest font-bold">Total</p>
                 <p className="text-2xl font-headline font-bold">{workerJobs.length}</p>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-headline font-bold text-white">My Assignments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workerJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    role="worker" 
                    currentUserId={store.currentUser?.id}
                    assignedWorkers={store.workers.filter(w => job.assignedWorkerIds?.includes(w.id))}
                    onStatusUpdate={store.updateJobStatus}
                  />
                ))}
                {workerJobs.length === 0 && (
                  <div className="col-span-full py-20 text-center glass-card rounded-3xl">
                     <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                     <p className="text-muted-foreground">No jobs assigned to you at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
               <Leaderboard 
                 workers={store.workers} 
                 currentUserId={store.currentUser?.id} 
                 role="worker"
               />
            </div>
          </div>
        </div>
      )}

      <CreateJobModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onAdd={store.addJob}
      />

      <ReassignmentModal 
        job={reassigningJob}
        workers={store.workers}
        onClose={() => setReassigningJob(null)}
        onAssign={store.reassignWorker}
      />
    </DashboardLayout>
  );
}
