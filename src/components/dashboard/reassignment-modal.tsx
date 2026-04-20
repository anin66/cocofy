"use client";

import React, { useState, useEffect } from 'react';
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
import { UserPlus, Check, Users, Phone, Calendar, Mail, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReassignmentModalProps {
  job: Job | null;
  workers: UserProfile[];
  onClose: () => void;
  onAssign: (jobId: string, workerIds: string[]) => void;
}

export function ReassignmentModal({ job, workers, onClose, onAssign }: ReassignmentModalProps) {
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  useEffect(() => {
    if (job) {
      setSelectedWorkerIds(job.assignedWorkerIds || []);
    } else {
      setSelectedWorkerIds([]);
    }
  }, [job]);

  const handleAssign = () => {
    if (job) {
      onAssign(job.id, selectedWorkerIds);
      onClose();
    }
  };

  const toggleWorker = (workerId: string) => {
    setSelectedWorkerIds(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      }
      if (prev.length >= (job?.requiredWorkersCount || 1)) {
        return prev;
      }
      return [...prev, workerId];
    });
  };

  const requiredCount = job?.requiredWorkersCount || 1;
  const isFull = selectedWorkerIds.length >= requiredCount;

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass border-white/10 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-white">
              <UserPlus className="w-6 h-6 text-primary" />
              Assign Team
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Select <span className="text-white font-bold">{requiredCount}</span> worker(s) for <span className="text-foreground font-medium text-white">{job?.customerName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="w-4 h-4" />
              Available Workers
            </div>
            <Badge variant="outline" className={cn(
              "h-6",
              isFull ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
            )}>
              {selectedWorkerIds.length} / {requiredCount} Selected
            </Badge>
          </div>

          {isFull && (
            <Alert className="bg-primary/5 border-primary/20 py-2">
              <Info className="w-4 h-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                You have selected the maximum number of workers required for this job.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {workers.length > 0 ? (
              workers.map(w => {
                const isSelected = selectedWorkerIds.includes(w.id);
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

                    <div className="mt-3 pt-3 border-t border-white/5 w-full flex justify-between items-center">
                       <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 h-5">
                          {w.availability}
                       </Badge>
                       <span className="text-[10px] text-muted-foreground italic">Ready to harvest</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-10 text-center glass-card rounded-xl border-dashed">
                <p className="text-sm text-muted-foreground">No workers registered yet.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-white/5 border-t border-white/5 flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-white">Cancel</Button>
          <Button 
            onClick={handleAssign} 
            disabled={selectedWorkerIds.length === 0}
            className="flex-1 orange-gradient"
          >
            Confirm Team ({selectedWorkerIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
