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
import { Truck, MapPin, Clock, User } from 'lucide-react';
import { Job, UserProfile } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface AssignDeliveryModalProps {
  job: Job | null;
  deliveryBoys: UserProfile[];
  onClose: () => void;
  onAssign: (jobId: string, data: { deliveryBoyId: string, deliveryTime: string, gpsUrl: string }) => void;
}

export function AssignDeliveryModal({ job, deliveryBoys, onClose, onAssign }: AssignDeliveryModalProps) {
  const [formData, setFormData] = useState({
    deliveryBoyId: '',
    deliveryTime: '',
    gpsUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (job && formData.deliveryBoyId) {
      // Logic to check if input is coordinates and prefix it with google maps URL
      let finalUrl = formData.gpsUrl.trim();
      const coordRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
      if (coordRegex.test(finalUrl)) {
        finalUrl = `https://www.google.com/maps/search/?api=1&query=${finalUrl.replace(/\s/g, '')}`;
      }

      onAssign(job.id, { ...formData, gpsUrl: finalUrl });
      onClose();
      setFormData({ deliveryBoyId: '', deliveryTime: '', gpsUrl: '' });
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] glass border-black/10 dark:border-white/10 p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-foreground">
                <Truck className="w-6 h-6 text-primary" />
                Assign Delivery Boy
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Assign a delivery person for {job?.customerName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4 text-primary" />
                  Select Personnel
                </Label>
                <Select 
                  value={formData.deliveryBoyId} 
                  onValueChange={val => setFormData({ ...formData, deliveryBoyId: val })}
                >
                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground">
                    <SelectValue placeholder="Choose a delivery boy" />
                  </SelectTrigger>
                  <SelectContent className="glass border-black/10 dark:border-white/10">
                    {deliveryBoys.map(boy => (
                      <SelectItem key={boy.id} value={boy.id} className="text-foreground">
                        {boy.name}
                      </SelectItem>
                    ))}
                    {deliveryBoys.length === 0 && (
                      <div className="p-4 text-xs text-center text-muted-foreground">
                        No delivery personnel registered.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-primary" />
                  GPS Coordinates or Link
                </Label>
                <Input 
                  placeholder="Paste link or coords (e.g. 12.34, 77.56)" 
                  required 
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground"
                  value={formData.gpsUrl}
                  onChange={e => setFormData({ ...formData, gpsUrl: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground px-1">
                  Supports Google Maps links or direct "Latitude, Longitude"
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-primary" />
                  Expected Pick Up Time
                </Label>
                <Input 
                  placeholder="e.g. 10:30 AM" 
                  required 
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground"
                  value={formData.deliveryTime}
                  onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="text-foreground">Cancel</Button>
            <Button type="submit" disabled={!formData.deliveryBoyId || !formData.gpsUrl} className="orange-gradient px-8 text-white">Confirm Assignment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}