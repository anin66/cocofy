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
import { UserPlus, Check, Users } from 'lucide-react';
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
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Assign Worker
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Select a worker for <span className="text-foreground font-medium">{job?.customerName}</span> in <span className="text-foreground font-medium">{job?.location}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="w-4 h-4" />
              Available Workers ({availableWorkers.length})
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {availableWorkers.length > 0 ? (
                availableWorkers.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkerId(w.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border text-sm transition-all group",
                      selectedWorkerId === w.id 
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(235,118,25,0.1)]" 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className={cn(
                        "font-semibold transition-colors",
                        selectedWorkerId === w.id ? "text-primary" : "text-foreground group-hover:text-primary"
                      )}>
                        {w.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{w.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10">
                        {w.availability}
                      </Badge>
                      {selectedWorkerId === w.id && <Check className="w-4 h-4 text-primary animate-in zoom-in" />}
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
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
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
