"use client";

import React, { useState } from 'react';
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
import { UserPlus, Check, Users, Phone, Calendar, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReassignmentModalProps {
  job: Job | null;
  workers: UserProfile[];
  onClose: () => void;
  onAssign: (jobId: string, workerId: string) => void;
}

export function ReassignmentModal({ job, workers, onClose, onAssign }: ReassignmentModalProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const handleAssign = () => {
    if (job && selectedWorkerId) {
      onAssign(job.id, selectedWorkerId);
      onClose();
      setSelectedWorkerId(null);
    }
  };

  const availableWorkers = workers.filter(w => w.id !== job?.assignedWorkerId);

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass border-white/10 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-white">
              <UserPlus className="w-6 h-6 text-primary" />
              Assign Worker
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Select a worker for <span className="text-foreground font-medium text-white">{job?.customerName}</span> in <span className="text-foreground font-medium text-white">{job?.location}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="w-4 h-4" />
              Available Workers ({availableWorkers.length})
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {availableWorkers.length > 0 ? (
                availableWorkers.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkerId(w.id)}
                    className={cn(
                      "flex flex-col p-4 rounded-xl border text-sm transition-all group relative",
                      selectedWorkerId === w.id 
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(235,118,25,0.1)]" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="flex flex-col items-start">
                        <span className={cn(
                          "text-lg font-bold transition-colors",
                          selectedWorkerId === w.id ? "text-primary" : "text-white group-hover:text-primary"
                        )}>
                          {w.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                           <Mail className="w-3 h-3" />
                           {w.email}
                        </div>
                      </div>
                      {selectedWorkerId === w.id && <Check className="w-5 h-5 text-primary animate-in zoom-in" />}
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
                ))
              ) : (
                <div className="py-10 text-center glass-card rounded-xl border-dashed">
                  <p className="text-sm text-muted-foreground">No other workers registered yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white/5 border-t border-white/5 flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-white">Cancel</Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedWorkerId}
            className="flex-1 orange-gradient"
          >
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
