
"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TreePalm, ClipboardList, Send } from 'lucide-react';
import { Job } from '@/lib/types';

interface WorkerCompletionModalProps {
  job: Job | null;
  onClose: () => void;
  onSubmit: (jobId: string, trees: number, notes: string) => void;
}

export function WorkerCompletionModal({ job, onClose, onSubmit }: WorkerCompletionModalProps) {
  const [trees, setTrees] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (job && trees) {
      onSubmit(job.id, parseInt(trees), notes);
      onClose();
      setTrees('');
      setNotes('');
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass border-white/10 p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-white">
                <ClipboardList className="w-6 h-6 text-primary" />
                Submit Harvest Report
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Please enter the final harvest details for {job?.customerName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trees" className="text-white flex items-center gap-2">
                  <TreePalm className="w-4 h-4 text-primary" />
                  Actual Trees Harvested
                </Label>
                <Input 
                  id="trees"
                  type="number"
                  placeholder="e.g. 50" 
                  value={trees}
                  onChange={(e) => setTrees(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white h-12 text-lg focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Additional Notes (Optional)</Label>
                <Input 
                  id="notes"
                  placeholder="e.g. Broken tree, pests found..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white">Cancel</Button>
            <Button type="submit" disabled={!trees} className="orange-gradient px-8 h-11 font-bold gap-2">
              <Send className="w-4 h-4" />
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
