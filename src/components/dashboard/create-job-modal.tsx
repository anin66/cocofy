"use client";

import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UserProfile } from '@/lib/types';
import { Briefcase } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: UserProfile[];
  onAdd: (job: any) => void;
}

export function CreateJobModal({ isOpen, onClose, workers, onAdd }: CreateJobModalProps) {
  const [formData, setFormData] = React.useState({
    customerName: '',
    location: '',
    scheduledDate: '',
    requirements: '',
    assignedWorkerId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    setFormData({ customerName: '', location: '', scheduledDate: '', requirements: '', assignedWorkerId: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-white/10 p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Create New Job
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Assign a new coconut harvesting task to a team member.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input 
                  id="customerName" 
                  placeholder="e.g. Riverside Resort" 
                  required 
                  className="bg-white/5 border-white/10 focus:border-primary/50"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Zone A" 
                    required 
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    required 
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                    value={formData.scheduledDate}
                    onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="worker">Initial Assignment</Label>
                <Select 
                  onValueChange={val => setFormData({ ...formData, assignedWorkerId: val })}
                  value={formData.assignedWorkerId}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    {workers.map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.availability})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reqs">Special Requirements</Label>
                <Textarea 
                  id="reqs" 
                  placeholder="Tools needed, height of trees, etc." 
                  className="bg-white/5 border-white/10 focus:border-primary/50 min-h-[100px]"
                  value={formData.requirements}
                  onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="orange-gradient px-8">Create Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}