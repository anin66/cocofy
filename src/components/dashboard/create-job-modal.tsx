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
import { Briefcase, TreePalm, Phone, Users, Settings2 } from 'lucide-react';
import { PricingPreset } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: any) => void;
  presets: PricingPreset[];
}

export function CreateJobModal({ isOpen, onClose, onAdd, presets }: CreateJobModalProps) {
  const [formData, setFormData] = React.useState({
    customerName: '',
    customerPhone: '',
    location: '',
    scheduledDate: '',
    treeCount: '1',
    requiredWorkersCount: '1',
    requirements: '',
    presetId: '',
    assignedWorkerId: null
  });

  React.useEffect(() => {
    if (isOpen && presets.length > 0) {
      const presetExists = presets.some(p => p.id === formData.presetId);
      if (!formData.presetId || !presetExists) {
        const randomIndex = Math.floor(Math.random() * presets.length);
        setFormData(prev => ({ ...prev, presetId: presets[randomIndex].id }));
      }
    }
  }, [isOpen, presets, formData.presetId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      treeCount: parseInt(formData.treeCount) || 1,
      requiredWorkersCount: parseInt(formData.requiredWorkersCount) || 1
    });
    onClose();
    setFormData({ 
      customerName: '', 
      customerPhone: '',
      location: '', 
      scheduledDate: '', 
      treeCount: '1', 
      requiredWorkersCount: '1',
      requirements: '', 
      presetId: '',
      assignedWorkerId: null 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-white/10 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-white">
                <Briefcase className="w-6 h-6 text-primary" />
                Create New Job
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Set up a new coconut harvesting task. Specify the trees and team size needed.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-white">Customer Name</Label>
                <Input 
                  id="customerName" 
                  placeholder="e.g. Riverside Resort" 
                  required 
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white"
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-white">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="customerPhone" 
                    type="tel"
                    placeholder="Customer Phone" 
                    required 
                    className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 text-white"
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. Zone A" 
                  required 
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Scheduled Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  required 
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white"
                  value={formData.scheduledDate}
                  onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treeCount" className="flex items-center gap-2 text-white">
                  <TreePalm className="w-4 h-4 text-primary" />
                  Number of Trees
                </Label>
                <Input 
                  id="treeCount" 
                  type="number" 
                  min="1"
                  required 
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white"
                  value={formData.treeCount}
                  onChange={e => setFormData({ ...formData, treeCount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredWorkersCount" className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4 text-primary" />
                  Workers Required
                </Label>
                <Input 
                  id="requiredWorkersCount" 
                  type="number" 
                  min="1"
                  required 
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white"
                  value={formData.requiredWorkersCount}
                  onChange={e => setFormData({ ...formData, requiredWorkersCount: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presetId" className="flex items-center gap-2 text-white">
                <Settings2 className="w-4 h-4 text-primary" />
                Pricing Preset
              </Label>
              <Select 
                value={formData.presetId} 
                onValueChange={val => setFormData({ ...formData, presetId: val })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select a pricing structure" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10">
                  {presets.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-white">
                      {p.name} (₹{p.totalPricePerTree}/tree)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white">Cancel</Button>
            <Button type="submit" className="orange-gradient px-8">Create Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
