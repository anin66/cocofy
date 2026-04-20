"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job, UserProfile } from '@/lib/types';
import { UserPlus, Check, Users, Phone, Calendar, Mail, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReassignmentModalProps {
  job: Job | null;
  workers: UserProfile[];
  onClose: () => void;
  onAssign: (jobId: string, workerIds: string[]) => void;
}

export function ReassignmentModal({ job, workers, onClose, onAssign }: ReassignmentModalProps) {
  const [selectedNewWorkerIds, setSelectedNewWorkerIds] = useState<string[]>([]);

  // Identify workers who already accepted
  const alreadyAcceptedIds = useMemo(() => {
    if (!job) return [];
    return Object.entries(job.workerStatuses || {})
      .filter(([_, status]) => status === 'accepted')
      .map(([id]) => id);
  }, [job]);

  // Total workers required minus those who already accepted
  const slotsRemaining = (job?.requiredWorkersCount || 0) - alreadyAcceptedIds.length;

  // Filter workers: hide those who already accepted or rejected this specific job
  const availableWorkers = useMemo(() => {
    if (!job) return [];
    return workers.filter(w => {
      const status = job.workerStatuses?.[w.id];
      // Hide if accepted or rejected
      return status !== 'accepted' && status !== 'rejected';
    });
  }, [job, workers]);

  useEffect(() => {
    setSelectedNewWorkerIds([]);
  }, [job]);

  const handleAssign = () => {
    if (job) {
      // Combine those who already accepted with the new selections
      onAssign(job.id, [...alreadyAcceptedIds, ...selectedNewWorkerIds]);
      onClose();
    }
  };

  const toggleWorker = (workerId: string) => {
    setSelectedNewWorkerIds(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      }
      if (prev.length >= slotsRemaining) {
        return prev;
      }
      return [...prev, workerId];
    });
  };

  const isFull = selectedNewWorkerIds.length >= slotsRemaining;

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass border-white/10 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-white">
              <UserPlus className="w-6 h-6 text-primary" />
              Manage Replacements
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Select <span className="text-white font-bold">{slotsRemaining}</span> new worker(s) for <span className="text-foreground font-medium text-white">{job?.customerName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {alreadyAcceptedIds.length > 0 && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Confirmed Team Members
              </div>
              <div className="flex flex-wrap gap-1.5">
                {alreadyAcceptedIds.map(id => {
                  const worker = workers.find(w => w.id === id);
                  return (
                    <Badge key={id} variant="outline" className="bg-white/5 border-white/10 text-white h-6">
                      {worker?.name || id}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="w-4 h-4" />
              Available to Replace
            </div>
            <Badge variant="outline" className={cn(
              "h-6",
              isFull ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
            )}>
              {selectedNewWorkerIds.length} / {slotsRemaining} Selected
            </Badge>
          </div>

          {isFull && slotsRemaining > 0 && (
            <Alert className="bg-primary/5 border-primary/20 py-2">
              <Info className="w-4 h-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                You have filled all remaining slots for this job.
              </AlertDescription>
            </Alert>
          )}

          {slotsRemaining <= 0 && (
            <Alert className="bg-green-500/10 border-green-500/20 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-xs text-muted-foreground">
                The team is already full with confirmed workers.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {availableWorkers.length > 0 ? (
              availableWorkers.map(w => {
                const isSelected = selectedNewWorkerIds.includes(w.id);
                const disabled = !isSelected && isFull;

                return (
                  <button
                    key={w.id}
                    disabled={disabled}
                    onClick={() => toggleWorker(w.id)}
                    className={cn(
                      "flex flex-col p-4 rounded-xl border text-sm transition-all group relative text-left",
                      isSelected 
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(235,118,25,0.1)]" 
                        : disabled 
                          ? "opacity-40 grayscale cursor-not-allowed bg-white/5 border-white/10"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="flex flex-col items-start">
                        <span className={cn(
                          "text-lg font-bold transition-colors",
                          isSelected ? "text-primary" : "text-white group-hover:text-primary"
                        )}>
                          {w.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                           <Mail className="w-3 h-3" />
                           {w.email}
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                        isSelected ? "bg-primary border-primary" : "border-white/20"
                      )}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 text-primary" />
                          <span className="text-foreground">{w.phone || 'No phone'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span>DOB: <span className="text-foreground">{w.dob || 'N/A'}</span></span>
                       </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-10 text-center glass-card rounded-xl border-dashed">
                <p className="text-sm text-muted-foreground">No additional available workers found.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-white/5 border-t border-white/5 flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-white">Cancel</Button>
          <Button 
            onClick={handleAssign} 
            disabled={selectedNewWorkerIds.length === 0 && slotsRemaining > 0}
            className="flex-1 orange-gradient"
          >
            Update Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
