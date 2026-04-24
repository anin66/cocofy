"use client";

import React, { useMemo, useState } from 'react';
import { Job, PricingPreset, UserProfile } from '@/lib/types';
import { 
  Coins, 
  Search, 
  IndianRupee, 
  ArrowUpRight,
  ShieldCheck,
  History,
  Eye,
  CreditCard,
  Wallet as WalletIcon,
  Calendar,
  MapPin,
  User as UserIcon,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReceiptDownloadButton } from './receipt-download-button';

interface WorkerSalaryViewProps {
  jobs: Job[];
  workers: UserProfile[];
  presets: PricingPreset[];
  onPay: (data: { jobId: string, workerId: string, workerName: string, amount: number }) => void;
}

export function WorkerSalaryView({ jobs, workers, presets, onPay }: WorkerSalaryViewProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const pendingPayroll = useMemo(() => {
    const list: any[] = [];
    
    // FINANCE RULE: Only include jobs that are officially CONFIRMED DONE (completed status)
    jobs.filter(j => j.status === 'completed').forEach(job => {
      if (!job.workerHarvestReports) return;
      
      const preset = presets.find(p => p.id === job.presetId);
      if (!preset) return;

      Object.entries(job.workerHarvestReports).forEach(([workerId, report]) => {
        const worker = workers.find(w => w.id === workerId);
        if (!worker) return;

        const paymentInfo = job.workerPaymentStatuses?.[workerId];
        const isPaid = paymentInfo?.status === 'fully_paid';
        
        if (!isPaid) {
          list.push({
            jobId: job.id,
            workerId: worker.id,
            workerName: worker.name,
            customerName: job.customerName,
            trees: report.trees,
            amount: report.trees * preset.workerPayPerTree,
            date: job.scheduledDate,
            location: job.location
          });
        }
      });
    });

    return list
      .filter(p => p.workerName.toLowerCase().includes(search.toLowerCase()) || p.customerName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [jobs, workers, presets, search]);

  const disbursementHistory = useMemo(() => {
    const list: any[] = [];
    
    jobs.filter(j => j.status === 'completed' || j.archived).forEach(job => {
      if (!job.workerPaymentStatuses) return;
      
      const preset = presets.find(p => p.id === job.presetId);
      if (!preset) return;

      Object.entries(job.workerPaymentStatuses).forEach(([workerId, payment]) => {
        if (payment.status === 'fully_paid') {
          const worker = workers.find(w => w.id === workerId);
          const report = job.workerHarvestReports?.[workerId];
          
          list.push({
            jobId: job.id,
            workerId: workerId,
            workerName: worker?.name || `Worker ${workerId.slice(0,3)}`,
            customerName: job.customerName,
            amount: report ? report.trees * preset.workerPayPerTree : 0,
            trees: report?.trees || 0,
            date: payment.paidAt || job.scheduledDate,
            method: payment.method,
            proof: payment.proof,
            location: job.location,
            rawJob: job,
            rawPreset: preset
          });
        }
      });
    });

    return list
      .filter(p => p.workerName.toLowerCase().includes(search.toLowerCase()) || p.customerName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [jobs, workers, presets, search]);

  const totalPayable = pendingPayroll.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <Coins className="w-8 h-8 text-primary" />
            Worker Payroll
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Settle labor costs for finalized harvest operations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md flex items-center gap-4 min-w-[240px] transition-all hover:bg-black/[0.07] dark:hover:bg-white/[0.07]">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">Total Payable Salary</p>
              <p className="text-2xl font-headline font-bold text-foreground">₹{totalPayable.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search worker or site..." 
              className="pl-10 w-64 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground h-12 transition-all focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/10 dark:border-white/10 w-fit">
          <TabsTrigger value="pending" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            Pending Payroll ({pendingPayroll.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            Disbursement History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="animate-fade-in m-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingPayroll.map((item) => (
              <Card key={`${item.jobId}-${item.workerId}`} className="glass-card border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                          {item.workerName[0]}
                       </div>
                       <div className="flex flex-col">
                          <h3 className="text-lg font-headline font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{item.workerName}</h3>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Labor Disbursement</span>
                       </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Due Amount</p>
                      <p className="text-xl font-headline font-bold text-primary">₹{item.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-2 transition-colors group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.05]">
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Customer Site</span>
                        <span className="text-foreground font-medium">{item.customerName}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Harvest Volume</span>
                        <span className="text-primary font-bold">{item.trees} Trees</span>
                     </div>
                     <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completed On</span>
                        <span className="text-foreground">{new Date(item.date).toLocaleDateString()}</span>
                     </div>
                  </div>

                  <Button 
                    onClick={() => onPay(item)} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-xs font-bold gap-2 mt-2 active:scale-95 transition-all shadow-lg shadow-blue-500/10"
                  >
                    Pay Salary <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {pendingPayroll.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl animate-pulse">
                <ShieldCheck className="w-16 h-16 mb-4 text-foreground" />
                <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">All pending salaries from completed jobs settled</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in m-0 outline-none">
          <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-xl">
            <Table>
              <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
                <TableRow className="border-black/5 dark:border-white/5 hover:bg-transparent">
                  <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Worker / Date</TableHead>
                  <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Customer Site</TableHead>
                  <TableHead className="text-right text-foreground font-bold uppercase text-[10px] tracking-widest">Amount Disbursed</TableHead>
                  <TableHead className="text-center text-foreground font-bold uppercase text-[10px] tracking-widest">Evidence</TableHead>
                  <TableHead className="text-right text-foreground font-bold uppercase text-[10px] tracking-widest">Method & Voucher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disbursementHistory.map((item, idx) => (
                  <TableRow key={`${item.jobId}-${item.workerId}-${idx}`} className="border-black/5 dark:border-white/5 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {item.workerName[0]}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm leading-tight">{item.workerName}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                               <Calendar className="w-2.5 h-2.5" />
                               Paid {new Date(item.date).toLocaleDateString()}
                            </span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-xs font-semibold text-foreground">{item.customerName}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                             <MapPin className="w-2.5 h-2.5" /> {item.location}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <span className="text-base font-headline font-bold text-primary">₹{item.amount.toLocaleString()}</span>
                       <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{item.trees} Trees</div>
                    </TableCell>
                    <TableCell className="text-center">
                       {item.method === 'gpay' && item.proof ? (
                         <Dialog>
                           <DialogTrigger asChild>
                             <Button variant="ghost" size="sm" className="h-7 text-[9px] uppercase font-bold gap-1.5 hover:bg-primary/10 text-primary px-3 rounded-lg">
                               <Eye className="w-3 h-3" /> View Proof
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="glass border-black/10 dark:border-white/10 sm:max-w-md">
                             <DialogHeader>
                               <DialogTitle className="text-foreground flex items-center gap-2">
                                 <CreditCard className="w-5 h-5 text-primary" />
                                 Payment Proof: {item.workerName}
                               </DialogTitle>
                             </DialogHeader>
                             <div className="mt-4 bg-black/5 dark:bg-white/5 rounded-2xl p-2 border border-black/10 dark:border-white/10">
                                <div className="aspect-[9/16] relative rounded-xl overflow-hidden shadow-2xl">
                                   <img src={item.proof} className="w-full h-full object-contain bg-black/40" alt="Salary Proof" />
                                </div>
                             </div>
                             <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                                <div>
                                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Amount Settled</p>
                                   <p className="text-xl font-headline font-bold text-primary">₹{item.amount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Job Reference</p>
                                   <p className="text-xs font-mono text-foreground font-bold">#{item.jobId.slice(0,8).toUpperCase()}</p>
                                </div>
                             </div>
                           </DialogContent>
                         </Dialog>
                       ) : item.method === 'cash' ? (
                         <Badge variant="outline" className="h-5 text-[8px] bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20 font-black uppercase tracking-widest px-2">
                            Cash Confirmed
                         </Badge>
                       ) : (
                         <span className="text-[9px] text-muted-foreground italic uppercase">No Digital Proof</span>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-2">
                          <ReceiptDownloadButton 
                            job={item.rawJob} 
                            preset={item.rawPreset} 
                            workerId={item.workerId} 
                            workerName={item.workerName} 
                          />
                          <Badge variant="outline" className={cn(
                            "h-6 px-2.5 text-[9px] font-bold uppercase tracking-widest gap-1.5",
                            item.method === 'gpay' ? "bg-blue-500/5 text-blue-500 border-blue-500/20" : "bg-green-500/5 text-green-600 border-green-500/20"
                          )}>
                             {item.method === 'gpay' ? <CreditCard className="w-3 h-3" /> : <WalletIcon className="w-3 h-3" />}
                             {item.method}
                          </Badge>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
                {disbursementHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                         <FileText className="w-12 h-12 text-foreground" />
                         <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">No disbursement history found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
