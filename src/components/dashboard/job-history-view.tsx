"use client";

import React, { useMemo, useState } from 'react';
import { Job, PricingPreset, UserProfile } from '@/lib/types';
import { 
  History, 
  Search, 
  Calendar, 
  TreePalm, 
  Users, 
  MapPin, 
  FileText,
  Truck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface JobHistoryViewProps {
  jobs: Job[];
  presets: PricingPreset[];
  workers: UserProfile[];
  deliveryBoys: UserProfile[];
}

export function JobHistoryView({ jobs, presets, workers, deliveryBoys }: JobHistoryViewProps) {
  const [search, setSearch] = useState('');

  const historyJobs = useMemo(() => {
    return jobs
      .filter(j => j.archived)
      .filter(j => 
        j.customerName.toLowerCase().includes(search.toLowerCase()) || 
        j.location.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [jobs, search]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Archive & History
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Reviewing completed harvest logs and archived team records.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Filter archive..." 
            className="pl-10 w-72 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground h-12"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-xl">
        <Table>
          <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
            <TableRow className="border-black/5 dark:border-white/5 hover:bg-transparent">
              <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Job Details</TableHead>
              <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Operational Stats</TableHead>
              <TableHead className="text-foreground font-bold uppercase text-[10px] tracking-widest">Team & Logistics</TableHead>
              <TableHead className="text-right text-foreground font-bold uppercase text-[10px] tracking-widest">Date Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyJobs.map((job) => {
              const totalTrees = job.workerHarvestReports 
                ? Object.values(job.workerHarvestReports).reduce((sum, r) => sum + r.trees, 0)
                : job.treeCount;

              return (
                <TableRow key={job.id} className="border-black/5 dark:border-white/5 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <TableCell className="py-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-foreground text-base leading-none">{job.customerName}</span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        {job.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <TreePalm className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-bold text-foreground">{totalTrees} Trees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary/50" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{Object.keys(job.workerHarvestReports || {}).length} Workers Logged</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2.5 py-1">
                       <div className="flex flex-wrap gap-1.5">
                          {job.assignedWorkerIds?.map(workerId => {
                            const worker = workers.find(w => w.id === workerId);
                            return (
                              <Badge key={workerId} variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase bg-primary/5 text-primary border-primary/20">
                                {worker?.name || 'Worker'}
                              </Badge>
                            );
                          })}
                       </div>
                       {job.deliveryBoyId && (
                         <div className="flex items-center gap-1.5 text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                           <Truck className="w-3.5 h-3.5" />
                           {deliveryBoys.find(b => b.id === job.deliveryBoyId)?.name || 'Personnel'}
                         </div>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-sm font-bold text-foreground">{new Date(job.scheduledDate).toLocaleDateString()}</span>
                       <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 font-bold">
                         <Calendar className="w-3 h-3" /> Archived Record
                       </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {historyJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center opacity-30 gap-4">
                     <FileText className="w-12 h-12 text-foreground" />
                     <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">No archived history found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}