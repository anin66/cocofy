"use client";

import React, { useState, useEffect } from 'react';
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
import { Clock, Calendar, Zap } from 'lucide-react';
import { Job, PricingPreset } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SetTimeModalProps {
  job: Job | null;
  presets: PricingPreset[];
  onClose: () => void;
  onConfirm: (jobId: string, time: string, presetId: string) => void;
}

export function SetTimeModal({ job, presets, onClose, onConfirm }: SetTimeModalProps) {
  const [customTime, setCustomTime] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  useEffect(() => {
    if (job) {
      setCustomTime(job.harvestTime || '');
      const presetExists = presets.some(p => p.id === job.presetId);
      const fallbackPresetId = presets.length > 0 ? presets[0].id : '';
      setSelectedPresetId(presetExists ? job.presetId! : fallbackPresetId);
    } else {
      setCustomTime('');
      setSelectedPresetId('');
    }
  }, [job, presets]);

  const quickPresets = ['6:00 AM', '7:00 AM', '8:00 AM', '4:30 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (job && customTime && selectedPresetId) {
      onConfirm(job.id, customTime, selectedPresetId);
      onClose();
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass border-white/10 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-white">
                <Clock className="w-6 h-6 text-primary" />
                Confirm Job Details
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Finalize the start time and pricing structure for {job?.customerName}.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6 custom-scrollbar">
            <div className="space-y-2">
              <Label htmlFor="custom-time" className="text-white text-xs font-bold uppercase tracking-widest opacity-70">
                Exact Start Time
              </Label>
              <div className="relative">
                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                 <Input 
                  id="custom-time"
                  placeholder="e.g. 6:15 AM or 17:30" 
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 pl-10 text-white h-12 text-lg focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Quick Presets
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomTime(preset)}
                    className={cn(
                      "py-1.5 px-3 rounded-md text-xs font-semibold border transition-all",
                      customTime === preset
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="preset-select" className="text-white text-xs font-bold uppercase tracking-widest opacity-70">
                Confirm Pricing Preset
              </Label>
              <Select 
                value={selectedPresetId} 
                onValueChange={setSelectedPresetId}
              >
                <SelectTrigger id="preset-select" className="bg-white/5 border-white/10 text-white h-11">
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

            {job && (
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs text-white">Scheduled for: {new Date(job.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white">Cancel</Button>
            <Button type="submit" disabled={!customTime || !selectedPresetId} className="orange-gradient px-8 h-11 font-bold">Confirm Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
