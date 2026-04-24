"use client";

import React, { useMemo } from 'react';
import { Job, PricingPreset } from '@/lib/types';
import { 
  Wallet, 
  Search, 
  IndianRupee, 
  AlertCircle, 
  Clock, 
  User, 
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DueAmountViewProps {
  jobs: Job[];
  presets: PricingPreset[];
  activePreset: PricingPreset;
  onSettle: (job: Job) => void;
}

export function DueAmountView({ jobs, presets, activePreset, onSettle }: DueAmountViewProps) {
  const [search, setSearch] = React.useState('');

  const dueJobs = useMemo(() => {
    return jobs
      .filter(j => 
        j.status === 'completed' && 
        j.paymentStatus !== 'fully_paid' && 
        j.settledAt // Rule: Only move here after first interaction in Accounts Overview
      )
      .map(job => {
        const preset = presets.find(p => p.id === job.presetId) || activePreset;
        const actualTrees = job.workerHarvestReports 
          ? Object.values(job.workerHarvestReports).reduce((sum, r) => sum + r.trees, 0)
          : job.treeCount;
        const totalAmount = actualTrees * (preset?.totalPricePerTree || 0);
        const remaining = totalAmount - (job.amountPaid || 0);
        
        const scheduledDate = startOfDay(new Date(job.scheduledDate));
        const today = startOfDay(new Date());
        const daysPending = Math.max(0, differenceInDays(today, scheduledDate));

        return { ...job, remaining, daysPending, totalAmount };
      })
      .filter(j => j.customerName.toLowerCase().includes(search.toLowerCase()) || j.location.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.daysPending - a.daysPending);
  }, [jobs, presets, activePreset, search]);

  const totalOutstanding = dueJobs.reduce((sum, j) => sum + j.remaining, 0);

  const getAgingColor = (days: number) => {
    if (days >= 7) return "text-destructive bg-destructive/10 border-destructive/20";
    if (days >= 3) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    return "text-green-600 dark:text-green-500 bg-green-500/10 border-green-500/20";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Pending Receivables
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Manage outstanding payments for jobs already moved from Accounts Overview.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md flex items-center gap-4 min-w-[240px] transition-all hover:bg-black/[0.07] dark:hover:bg-white/[0.07]">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">Total Outstanding</p>
              <p className="text-2xl font-headline font-bold text-foreground">₹{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter by customer..." 
              className="pl-10 w-64 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground h-12 transition-all focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dueJobs.map((job) => (
          <Card key={job.id} className="glass-card border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 flex flex-col group">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-headline font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{job.customerName}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Harvested {new Date(job.scheduledDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn("px-2 py-1 border text-[10px] font-bold uppercase tracking-widest transition-transform duration-300 group-hover:scale-110", getAgingColor(job.daysPending))}>
                  {job.daysPending === 0 ? "Due Today" : `${job.daysPending} Days Due`}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-black/5 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Bill</p>
                  <p className="text-sm font-bold text-foreground">₹{job.totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Remaining</p>
                  <p className="text-lg font-headline font-bold text-primary">₹{job.remaining.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-primary transition-transform duration-300 group-hover:rotate-12">
                     <User className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-foreground">{job.customerPhone}</span>
                     <span className="text-[10px] text-muted-foreground">{job.location}</span>
                   </div>
                </div>
              </div>

              <Button 
                onClick={() => onSettle(job)} 
                className="w-full orange-gradient h-11 text-xs font-bold gap-2 mt-2 shadow-lg shadow-primary/20 active:scale-95 transition-all text-primary-foreground"
              >
                Receive Payment <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {dueJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-30 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl animate-pulse">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">No pending receivables from touched jobs</p>
        </div>
      )}
    </div>
  );
}
