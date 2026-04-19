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
import { Job, UserProfile, WorkerSuggestion } from '@/lib/types';
import { managerJobReassignmentSuggestion } from '@/ai/flows/manager-job-reassignment-suggestion';
import { Loader2, Sparkles, UserPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReassignmentModalProps {
  job: Job | null;
  workers: UserProfile[];
  onClose: () => void;
  onAssign: (jobId: string, workerId: string) => void;
}

export function ReassignmentModal({ job, workers, onClose, onAssign }: ReassignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<WorkerSuggestion[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const handleGetAISuggestions = async () => {
    if (!job) return;
    setLoading(true);
    try {
      const result = await managerJobReassignmentSuggestion({
        jobDetails: {
          jobId: job.id,
          customerName: job.customerName,
          location: job.location,
          scheduledDate: job.scheduledDate,
          requirements: job.requirements,
          initialWorkerId: job.assignedWorkerId || '',
        },
        availableWorkers: workers.map(w => ({
          workerId: w.id,
          name: w.name,
          skills: w.skills,
          availability: w.availability
        }))
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (job && selectedWorkerId) {
      onAssign(job.id, selectedWorkerId);
      onClose();
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass border-white/10 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Reassign Job
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Find the best available worker for <span className="text-foreground font-medium">{job?.customerName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 bg-white/5 rounded-xl border border-dashed border-white/10">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-foreground">Need help finding a worker?</p>
                <p className="text-sm text-muted-foreground">Our AI assistant can analyze skills and availability.</p>
              </div>
              <Button 
                onClick={handleGetAISuggestions} 
                disabled={loading}
                className="orange-gradient"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Get Smart Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recommended Workers</h4>
                <Button variant="ghost" size="sm" onClick={() => setSuggestions([])} className="text-xs h-7">Clear AI Results</Button>
              </div>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s.workerId}
                    onClick={() => setSelectedWorkerId(s.workerId)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200 group relative",
                      selectedWorkerId === s.workerId
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(235,118,25,0.15)]"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                      {selectedWorkerId === s.workerId && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.reason}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && suggestions.length === 0 && (
             <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Available Workers</h4>
                <div className="grid grid-cols-1 gap-2">
                  {workers
                    .filter(w => w.id !== job?.assignedWorkerId)
                    .map(w => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWorkerId(w.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border text-sm transition-all",
                          selectedWorkerId === w.id ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        <span>{w.name}</span>
                        <Badge variant="outline" className="text-[10px]">{w.availability}</Badge>
                      </button>
                    ))
                  }
                </div>
             </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-white/5 border-t border-white/5 flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedWorkerId}
            className="flex-1 orange-gradient"
          >
            Assign Selected Worker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}