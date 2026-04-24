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
import { PaymentModal } from '@/components/dashboard/payment-modal';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { WorkerSalaryModal } from '@/components/dashboard/worker-salary-modal';
import { FinancialAnalytics } from '@/components/dashboard/financial-analytics';
import { PricingPresetsView } from '@/components/dashboard/pricing-presets-view';
import { CalendarView } from '@/components/dashboard/calendar-view';
import { DueAmountView } from '@/components/dashboard/due-amount-view';
import { PaymentHistoryView } from '@/components/dashboard/payment-history-view';
import { WorkerSalaryView } from '@/components/dashboard/worker-salary-view';
import { JobHistoryView } from '@/components/dashboard/job-history-view';
import { WorkerSalaryDashboard } from '@/components/dashboard/worker-salary-dashboard';
import { Job, Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/layout/theme-toggle';
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
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [paymentSettlingJob, setPaymentSettlingJob] = useState<Job | null>(null);
  const [payingWorkerData, setPayingWorkerData] = useState<{ jobId: string, workerId: string, workerName: string, amount: number } | null>(null);
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
        <div className="flex flex-col items-center gap-4 text-foreground">
           <Loader2 className="w-10 h-10 text-primary animate-spin" />
           <p className="text-muted-foreground animate-pulse font-headline font-bold uppercase tracking-widest text-xs text-foreground">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (!store.currentUser || store.isAuthenticating) {
    const availableRoles = [
      { id: 'worker', label: 'Worker', icon: Briefcase },
      { id: 'delivery_boy', label: 'Delivery', icon: Truck },
      { id: 'manager', label: 'Manager', icon: Users },
      { id: 'finance_manager', label: 'Finance', icon: IndianRupee },
    ];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
        
        <div className="absolute top-6 right-6 z-20">
          <div className="glass p-1 rounded-2xl shadow-xl">
             <ThemeToggle />
          </div>
        </div>

        <div className="w-full max-w-[540px] relative z-10 animate-fade-in">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-2xl orange-gradient flex items-center justify-center text-primary-foreground mb-4 shadow-2xl transition-transform duration-500 hover:rotate-12">
              <Sprout className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-foreground">Cocofy</h1>
            <p className="text-muted-foreground text-lg">Smart harvest & logistics</p>
          </div>

          <div className="glass p-8 rounded-3xl space-y-6 shadow-2xl border-black/5 dark:border-white/5">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-headline font-semibold text-foreground">
                {authMode === 'login' ? 'Welcome Back' : 'Join the Network'}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10">
                {availableRoles.map((roleOption) => (
                  <button 
                    key={roleOption.id}
                    disabled={store.isAuthenticating}
                    onClick={() => setAuthData({ ...authData, role: roleOption.id as Role })}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all active:scale-95 disabled:opacity-50",
                      authData.role === roleOption.id ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <roleOption.icon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold uppercase">{roleOption.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {authMode === 'signup' && (
                  <Input placeholder="Full Name" value={authData.name} onChange={e => setAuthData({ ...authData, name: e.target.value })} className="bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground" disabled={store.isAuthenticating} />
                )}
                <Input type="email" placeholder="Email Address" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} className="bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground" disabled={store.isAuthenticating} />
                {authMode === 'signup' && (
                  <Input type="tel" placeholder="Phone Number" value={authData.phone} onChange={e => setAuthData({ ...authData, phone: e.target.value })} className="bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground" disabled={store.isAuthenticating} />
                )}
                <Input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} className="bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-foreground" disabled={store.isAuthenticating} />
                {authMode === 'signup' && (authData.role === 'manager' || authData.role === 'finance_manager') && (
                  <Input type="password" placeholder="Security Key" value={authData.secretKey} onChange={e => setAuthData({ ...authData, secretKey: e.target.value })} className="bg-primary/5 border-primary/20 text-foreground" disabled={store.isAuthenticating} />
                )}
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  disabled={store.isAuthenticating}
                  onClick={() => authMode === 'login' ? store.login(authData.role, authData.email, authData.password) : store.signup(authData)} 
                  className="w-full orange-gradient font-bold h-12 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg text-primary-foreground"
                >
                  {store.isAuthenticating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                <Button variant="ghost" disabled={store.isAuthenticating} onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 font-bold">
                  {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isManager = store.currentUser.role === 'manager';
  const isFinance = store.currentUser.role === 'finance_manager';
  const isWorker = store.currentUser.role === 'worker';
  const isDelivery = store.currentUser.role === 'delivery_boy';

  const matchesSearch = (j: Job) => 
    j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.location.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredJobs = store.jobs.filter(j => matchesSearch(j));
  
  const dashboardJobs = isManager 
    ? filteredJobs.filter(j => !j.archived)
    : isFinance 
      ? filteredJobs.filter(j => j.status === 'completed' && !j.settledAt)
      : filteredJobs.filter(j => 
          !j.archived && 
          (isDelivery 
            ? j.deliveryBoyId === store.currentUser?.id 
            : j.assignedWorkerIds?.includes(store.currentUser?.id || ''))
        );

  const renderCurrentView = () => {
    if (activeView === 'staff' && isManager) {
      return (
        <div className="space-y-12 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-foreground">Harvesting Workers</h3>
            </div>
            <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-xl transition-all duration-500 hover:shadow-2xl">
               <Table>
                  <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
                    <TableRow className="border-black/5 dark:border-white/5">
                      <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Full Name</TableHead>
                      <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Contact</TableHead>
                      <TableHead className="text-right text-foreground font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {store.workers.map((staff) => (
                      <TableRow key={staff.id} className="border-black/5 dark:border-white/5 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <TableCell className="font-semibold text-foreground">{staff.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{staff.email}<br/>{staff.phone}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10 transition-transform active:scale-90"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass border-black/10 dark:border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Delete Staff Profile?</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">This will permanently remove {staff.name}.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => store.deleteStaff(staff.id)} className="bg-destructive text-white hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
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

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-foreground">Delivery Personnel</h3>
            </div>
            <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-xl transition-all duration-500 hover:shadow-2xl">
               <Table>
                  <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
                    <TableRow className="border-black/5 dark:border-white/5">
                      <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Full Name</TableHead>
                      <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Contact</TableHead>
                      <TableHead className="text-right text-foreground font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {store.deliveryBoys.map((staff) => (
                      <TableRow key={staff.id} className="border-black/5 dark:border-white/5 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                        <TableCell className="font-semibold text-foreground">{staff.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{staff.email}<br/>{staff.phone}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10 transition-transform active:scale-90"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass border-black/10 dark:border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Delete Delivery Profile?</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">This will permanently remove {staff.name}.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => store.deleteStaff(staff.id)} className="bg-destructive text-white hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
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
        </div>
      );
    }

    if (activeView === 'leaderboard') {
      return (
        <Leaderboard workers={store.workers} currentUserId={store.currentUser?.id} role={store.currentUser.role} onReset={store.resetRankings} onUpdateStats={store.updateWorkerStats} />
      );
    }

    if (activeView === 'analytics' && isFinance) {
      return <FinancialAnalytics jobs={store.jobs} presets={store.presets} activePreset={store.activePreset} workers={store.workers} />;
    }

    if (activeView === 'presets' && isManager) {
      return <PricingPresetsView presets={store.presets} onAdd={store.addPreset} onDelete={store.deletePreset} />;
    }

    if (activeView === 'calendar') {
      return <CalendarView jobs={store.jobs} workers={store.workers} onJobClick={(job) => {
        setActiveView('dashboard');
        setSearchQuery(job.customerName);
      }} />;
    }

    if (activeView === 'due_amount' && isFinance) {
      return <DueAmountView jobs={store.jobs} presets={store.presets} activePreset={store.activePreset} onSettle={setPaymentSettlingJob} />;
    }

    if (activeView === 'worker_salary' && isFinance) {
      return <WorkerSalaryView jobs={store.jobs} workers={store.workers} presets={store.presets} onPay={setPayingWorkerData} />;
    }

    if (activeView === 'payment_history' && (isFinance || isManager)) {
      return <PaymentHistoryView jobs={store.jobs} presets={store.presets} activePreset={store.activePreset} onDelete={store.deleteJob} />;
    }

    if (activeView === 'history' && isManager) {
      return <JobHistoryView jobs={store.jobs} presets={store.presets} workers={store.workers} deliveryBoys={store.deliveryBoys} />;
    }

    if (activeView === 'salary' && isWorker) {
      return <WorkerSalaryDashboard worker={store.currentUser} jobs={store.jobs} presets={store.presets} />;
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-headline font-bold text-foreground">
            {isFinance ? 'Accounts In-Tray' : 'Job Requests'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="relative group hidden sm:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Search customer/location..." 
                 className="pl-10 w-64 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50 text-foreground h-10 transition-all focus:ring-2 focus:ring-primary/20"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
             </div>
            {isManager && (
              <Button onClick={() => setShowCreateModal(true)} className="orange-gradient h-11 px-6 font-bold gap-2 shadow-lg shadow-primary/20 text-primary-foreground transition-all hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4" />New Job
              </Button>
            )}
          </div>
        </div>

        {dashboardJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                role={store.currentUser!.role} 
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
                onSettlePayment={setPaymentSettlingJob}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl opacity-40 animate-pulse">
            <Briefcase className="w-12 h-12 mb-4 text-foreground" />
            <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">No active operational jobs</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout user={store.currentUser} onLogout={store.logout} activeView={activeView} onNavigate={setActiveView}>
      <div className="animate-fade-in">
        {renderCurrentView()}
      </div>

      <CreateJobModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onAdd={store.addJob} presets={store.presets} />
      <ReassignmentModal job={reassigningJob} workers={store.workers} onClose={() => setReassigningJob(null)} onAssign={store.reassignWorker} />
      <AssignDeliveryModal job={assigningDeliveryJob} deliveryBoys={store.deliveryBoys} onClose={() => setAssigningDeliveryJob(null)} onAssign={store.assignDeliveryBoy} />
      <SetTimeModal job={setTimeJob} presets={store.presets} onClose={() => setSetTimeJob(null)} onConfirm={store.setHarvestTime} />
      <WorkerCompletionModal job={workerCompleteJob} onClose={() => setWorkerCompleteJob(null)} onSubmit={store.submitHarvestReport} />
      <PaymentModal job={paymentSettlingJob} preset={store.presets.find(p => p.id === paymentSettlingJob?.presetId)} onClose={() => setPaymentSettlingJob(null)} onConfirm={store.updatePaymentStatus} />
      <WorkerSalaryModal jobId={payingWorkerData?.jobId || null} workerId={payingWorkerData?.workerId || null} workerName={payingWorkerData?.workerName || ''} amount={payingWorkerData?.amount || 0} onClose={() => setPayingWorkerData(null)} onConfirm={store.payWorkerSalary} />
    </DashboardLayout>
  );
}
