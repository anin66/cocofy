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
import { ReceiptDownloadButton } from '@/components/dashboard/receipt-download-button';
import { Leaderboard } from '@/components/dashboard/leaderboard';
import { WorkerSalaryModal } from '@/components/dashboard/worker-salary-modal';
import { FinancialAnalytics } from '@/components/dashboard/financial-analytics';
import { Job, Role, PaymentMethod } from '@/lib/types';
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
  History,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  Settings2,
  Coins,
  ArrowUpRight,
  Landmark,
  Phone,
  MapPin,
  Calendar,
  TreePalm,
  ImageDown
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Home() {
  const store = useCocofyStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reassigningJob, setReassigningJob] = useState<Job | null>(null);
  const [assigningDeliveryJob, setAssigningDeliveryJob] = useState<Job | null>(null);
  const [setTimeJob, setSetTimeJob] = useState<Job | null>(null);
  const [workerCompleteJob, setWorkerCompleteJob] = useState<Job | null>(null);
  const [paymentSettlingJob, setPaymentSettlingJob] = useState<Job | null>(null);
  const [payingWorkerData, setPayingWorkerData] = useState<{ jobId: string, workerId: string, workerName: string, amount: number, date: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeView, setActiveView] = useState('dashboard');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  
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

  const matchesSearch = (j: Job) => 
    j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.location.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredJobs = store.jobs.filter(j => !j.archived && matchesSearch(j));
  const historyJobs = store.jobs.filter(j => j.archived && matchesSearch(j));
  
  const userJobs = store.currentUser.role === 'delivery_boy' 
    ? filteredJobs.filter(j => j.deliveryBoyId === store.currentUser?.id) 
    : filteredJobs.filter(j => j.assignedWorkerIds?.includes(store.currentUser?.id || ''));

  const financePendingJobs = store.jobs.filter(j => j.status === 'completed' && !j.settledAt && matchesSearch(j));

  const currentOperationalJobs = store.currentUser.role === 'manager' 
    ? filteredJobs 
    : (store.currentUser.role === 'finance_manager' ? financePendingJobs : userJobs);

  const settledJobsList = store.jobs.filter(j => j.paymentStatus === 'fully_paid' || (j.paymentStatus === 'partially_paid' && j.settledAt));
  const pendingPaymentsList = store.jobs.filter(j => j.settledAt && j.paymentStatus !== 'fully_paid' && matchesSearch(j));

  const getActualHarvestedTrees = (job: Job) => {
    if (!job.workerHarvestReports) return job.treeCount;
    return Object.values(job.workerHarvestReports).reduce((sum, report) => sum + report.trees, 0);
  };

  const totalRevenue = settledJobsList.reduce((acc, job) => {
    const jobPreset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
    const actualTrees = getActualHarvestedTrees(job);
    return acc + (actualTrees * jobPreset.totalPricePerTree);
  }, 0);

  const totalExpense = settledJobsList.reduce((acc, job) => {
    const jobPreset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
    const actualTrees = getActualHarvestedTrees(job);
    const workerPay = actualTrees * jobPreset.workerPayPerTree;
    const additional = job.additionalExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    return acc + workerPay + additional;
  }, 0);

  const totalProfit = totalRevenue - totalExpense;

  const dueAmountValue = pendingPaymentsList.reduce((acc, job) => {
    const jobPreset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
    const actualTrees = getActualHarvestedTrees(job);
    const totalJobPrice = actualTrees * jobPreset.totalPricePerTree;
    const balance = totalJobPrice - (job.amountPaid || 0);
    return acc + balance;
  }, 0);

  const pendingWorkerSalaries: any[] = [];
  store.jobs.filter(j => j.status === 'completed' && j.workerPaymentStatuses).forEach(job => {
    const preset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
    Object.entries(job.workerPaymentStatuses!).forEach(([workerId, payInfo]) => {
      if (payInfo.status === 'unpaid') {
        const worker = store.workers.find(w => w.id === workerId);
        const report = job.workerHarvestReports?.[workerId];
        if (worker && report) {
          pendingWorkerSalaries.push({
            jobId: job.id,
            workerId: workerId,
            workerName: worker.name,
            customerName: job.customerName,
            trees: report.trees,
            amount: report.trees * preset.workerPayPerTree,
            date: job.scheduledDate
          });
        }
      }
    });
  });

  const workerPaidJobs = store.jobs.filter(j => 
    store.currentUser?.id && 
    j.assignedWorkerIds?.includes(store.currentUser.id) && 
    j.workerPaymentStatuses?.[store.currentUser.id]?.status === 'fully_paid'
  );

  const workerTotalEarnings = workerPaidJobs.reduce((acc, job) => {
    const preset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
    const trees = job.workerHarvestReports?.[store.currentUser!.id]?.trees || 0;
    return acc + (trees * preset.workerPayPerTree);
  }, 0);

  const isManager = store.currentUser.role === 'manager';
  const isFinance = store.currentUser.role === 'finance_manager';
  const isWorker = store.currentUser.role === 'worker';

  return (
    <DashboardLayout user={store.currentUser} onLogout={store.logout} activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'staff' && isManager ? (
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
                              <AlertDialogDescription className="text-muted-foreground">This will permanently remove {staff.name}.</AlertDialogDescription>
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
                <div className="flex items-center gap-2 text-primary">
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
                              <AlertDialogTitle className="text-white">Delete Staff Profile?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">This will permanently remove {staff.name}.</AlertDialogDescription>
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
      ) : activeView === 'managers' && isManager ? (
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
             <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-xl font-headline font-bold text-white">Registered Managers</h3>
                </div>
             </div>
             <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Role</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.managers.map((manager) => (
                    <TableRow key={manager.id} className="border-white/5">
                      <TableCell className="font-semibold text-white">{manager.name}</TableCell>
                      <TableCell className="text-muted-foreground uppercase text-[10px] font-bold">{manager.role}</TableCell>
                      <TableCell className="text-right">
                        {manager.id !== store.currentUser?.id && (
                          <Button variant="ghost" size="icon" onClick={() => store.deleteStaff(manager.id)} className="text-accent"><Trash2 className="w-4 h-4" /></Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </div>
        </div>
      ) : activeView === 'presets' && isManager ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-headline font-bold text-white">Pricing Presets</h2>
            <Button onClick={() => setIsPresetModalOpen(true)} className="orange-gradient"><Plus className="w-4 h-4 mr-2" />New Preset</Button>
          </div>
          <div className="grid gap-4">
            {store.presets.map((preset) => (
              <div key={preset.id} className="glass-card p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground">Total: ₹{preset.totalPricePerTree} | Worker: ₹{preset.workerPayPerTree}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => store.deletePreset(preset.id)} className="text-accent"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      ) : activeView === 'history' && isManager ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6"><History className="w-6 h-6 text-primary" /><h2 className="text-2xl font-headline font-bold text-white">Job History</h2></div>
          {historyJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyJobs.map(job => (
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
            <div className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl border-dashed border-2 border-white/10">
               <History className="w-12 h-12 text-muted-foreground/20 mb-3" />
               <p className="text-muted-foreground text-center">No archived jobs found.</p>
            </div>
          )}
        </div>
      ) : activeView === 'salary' && isWorker ? (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
              <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Earning</h4>
              <p className="text-2xl font-headline font-bold text-white flex items-center gap-1">₹{workerTotalEarnings.toLocaleString()}</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
              <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Jobs Done</h4>
              <p className="text-2xl font-headline font-bold text-white">{workerPaidJobs.length}</p>
            </div>
          </div>
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
             <div className="p-6 border-b border-white/5 bg-white/5"><h3 className="text-xl font-headline font-bold text-white">Earning Records</h3></div>
             <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="text-white">Customer</TableHead>
                    <TableHead className="text-center text-white">Trees</TableHead>
                    <TableHead className="text-right text-white">Earnings</TableHead>
                    <TableHead className="text-right text-white">Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workerPaidJobs.map(job => {
                    const preset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
                    const trees = job.workerHarvestReports?.[store.currentUser!.id]?.trees || 0;
                    const payInfo = job.workerPaymentStatuses?.[store.currentUser!.id];
                    return (
                      <TableRow key={job.id} className="border-white/5">
                        <TableCell className="text-white font-medium">{job.customerName}</TableCell>
                        <TableCell className="text-center text-primary font-bold">{trees} Trees</TableCell>
                        <TableCell className="text-right text-white font-mono font-bold">₹{(trees * preset.workerPayPerTree).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {payInfo?.proof ? (
                            <a 
                              href={payInfo.proof} 
                              download={`Payment-${job.customerName}.jpg`}
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-bold transition-colors"
                            >
                              <ImageDown className="w-4 h-4" />
                              Save Proof
                            </a>
                          ) : (
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                              {payInfo?.method === 'cash' ? 'Cash' : 'N/A'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
             </Table>
          </div>
        </div>
      ) : activeView === 'worker_salary' && isFinance ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6"><Coins className="w-6 h-6 text-primary" /><h2 className="text-2xl font-headline font-bold text-white">Worker Payroll</h2></div>
          {pendingWorkerSalaries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pendingWorkerSalaries.map((salary, idx) => (
                <Card key={idx} className="glass-card border border-white/5 overflow-hidden flex flex-col animate-fade-in">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 uppercase text-[9px] font-bold">Unpaid</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(salary.date).toLocaleDateString()}</span>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4 flex-1">
                    <h3 className="text-xl font-headline font-bold text-white truncate">{salary.workerName}</h3>
                    <p className="text-xs text-muted-foreground">{salary.customerName}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">Harvested</p>
                        <p className="text-lg font-bold text-primary">{salary.trees} Trees</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">Net Pay</p>
                        <p className="text-lg font-mono text-white">₹{salary.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button onClick={() => setPayingWorkerData(salary)} className="w-full orange-gradient font-bold h-10 gap-2"><IndianRupee className="w-4 h-4" />Pay Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl border-dashed border-2 border-white/10">
               <Coins className="w-12 h-12 text-muted-foreground/20 mb-3" />
               <p className="text-muted-foreground text-center">No pending worker salaries to settle.</p>
            </div>
          )}
        </div>
      ) : activeView === 'due_amount' && isFinance ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline font-bold text-white">Pending Receivables</h2>
          {pendingPaymentsList.length > 0 ? (
            <div className="grid gap-4">
              {pendingPaymentsList.map(job => (
                <div key={job.id} className="glass-card p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-white font-bold">{job.customerName}</span>
                    <span className="text-xs text-muted-foreground">{job.location}</span>
                  </div>
                  <Button onClick={() => setPaymentSettlingJob(job)} className="orange-gradient">Collect Payment</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl border-dashed border-2 border-white/10">
               <Wallet className="w-12 h-12 text-muted-foreground/20 mb-3" />
               <p className="text-muted-foreground text-center">Nothing due.</p>
            </div>
          )}
        </div>
      ) : activeView === 'payment_history' && isFinance ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline font-bold text-white">Financial History</h2>
          {settledJobsList.length > 0 ? (
            <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
               <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="text-white">Customer Details</TableHead>
                      <TableHead className="text-white">Location</TableHead>
                      <TableHead className="text-white">Harvest Date</TableHead>
                      <TableHead className="text-right text-white">Trees</TableHead>
                      <TableHead className="text-right text-white">Amount Paid</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settledJobsList.map(job => {
                      const actualTrees = getActualHarvestedTrees(job);
                      return (
                        <TableRow key={job.id} className="border-white/5">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{job.customerName}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {job.customerPhone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-white/80 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-white/80 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(job.scheduledDate).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                             <span className="text-sm font-bold text-primary flex items-center justify-end gap-1">
                               <TreePalm className="w-3.5 h-3.5" /> {actualTrees}
                             </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-base font-bold text-green-400">₹{(job.amountPaid || 0).toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <ReceiptDownloadButton job={job} preset={store.presets.find(p => p.id === job.presetId)} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass border-white/10">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Financial Record?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      This will permanently delete the payment history for {job.customerName} and update the revenue, profit, and expenses.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => store.deleteJob(job.id)} className="bg-destructive text-destructive-foreground">Delete Record</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
               </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 glass-card rounded-3xl border-dashed border-2 border-white/10">
               <History className="w-12 h-12 text-muted-foreground/20 mb-3" />
               <p className="text-muted-foreground text-center">No payment history found.</p>
            </div>
          )}
        </div>
      ) : activeView === 'analytics' && isFinance ? (
        <FinancialAnalytics 
          jobs={store.jobs} 
          presets={store.presets} 
          activePreset={store.activePreset} 
        />
      ) : activeView === 'leaderboard' ? (
        <Leaderboard workers={store.workers} currentUserId={store.currentUser?.id} role={store.currentUser.role} onReset={store.resetRankings} onUpdateStats={store.updateWorkerStats} />
      ) : (
        <div className="space-y-8">
          {isFinance && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Revenue</h4>
                <p className="text-2xl font-headline font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
                <TrendingDown className="w-5 h-5 text-accent" />
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Expense</h4>
                <p className="text-2xl font-headline font-bold text-white">₹{totalExpense.toLocaleString()}</p>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
                <ArrowUpRight className="w-5 h-5 text-blue-400" />
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Net Profit</h4>
                <p className={cn("text-2xl font-headline font-bold", totalProfit >= 0 ? "text-green-400" : "text-accent")}>
                  ₹{totalProfit.toLocaleString()}
                </p>
              </div>
              <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
                <Landmark className="w-5 h-5 text-yellow-500" />
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Due Amount</h4>
                <p className="text-2xl font-headline font-bold text-white">₹{dueAmountValue.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-headline font-bold text-white">
              {isFinance ? 'Pending Settlements' : 'Job Requests'}
            </h2>
            {isManager && <Button onClick={() => setShowCreateModal(true)} className="orange-gradient"><Plus className="w-4 h-4 mr-2" />New Job</Button>}
          </div>

          {currentOperationalJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentOperationalJobs.map(job => (
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
            <p className="text-muted-foreground py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">No jobs to display currently.</p>
          )}

          {isWorker && (
            <div className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3"><Wallet className="w-6 h-6 text-primary" /><h2 className="text-2xl font-headline font-bold text-white">Pending Payments</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.jobs.filter(j => j.status === 'completed' && j.workerPaymentStatuses?.[store.currentUser!.id]?.status === 'unpaid').map(job => {
                   const preset = store.presets.find(p => p.id === job.presetId) || store.activePreset;
                   const trees = job.workerHarvestReports?.[store.currentUser!.id]?.trees || 0;
                   return (
                     <Card key={job.id} className="glass-card border border-white/5">
                       <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between"><Badge variant="outline" className="text-accent uppercase text-[9px] font-bold">Unpaid</Badge></CardHeader>
                       <CardContent className="p-4 pt-0">
                         <h3 className="text-lg font-bold text-white truncate">{job.customerName}</h3>
                         <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">Amount:</span><span className="text-primary font-bold">₹{(trees * preset.workerPayPerTree).toLocaleString()}</span></div>
                       </CardContent>
                     </Card>
                   );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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
