
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
import { Label } from '@/components/ui/label';
import { 
  IndianRupee, 
  Camera,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  CreditCard,
  Wallet
} from 'lucide-react';
import { PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WorkerSalaryModalProps {
  jobId: string | null;
  workerId: string | null;
  workerName: string;
  amount: number;
  onClose: () => void;
  onConfirm: (jobId: string, workerId: string, method: PaymentMethod, proofUrl: string) => void;
}

export function WorkerSalaryModal({ jobId, workerId, workerName, amount, onClose, onConfirm }: WorkerSalaryModalProps) {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('gpay');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setScreenshot(dataUrl);
          setIsCompressing(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobId && workerId) {
      if (method === 'gpay' && !screenshot) return;
      onConfirm(jobId, workerId, method, screenshot || '');
      onClose();
      setScreenshot(null);
      setMethod('gpay');
    }
  };

  return (
    <Dialog open={!!jobId && !!workerId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass border-white/10 p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline flex items-center gap-2 text-white">
                <IndianRupee className="w-5 h-5 text-primary" />
                Pay Worker Salary
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Settling salary for <strong>{workerName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1">
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Salary Due</span>
               <span className="text-3xl font-headline font-bold text-white flex items-center gap-1">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  {amount.toLocaleString()}
               </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white text-xs font-bold uppercase tracking-widest">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('gpay')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold uppercase transition-all",
                      method === 'gpay' 
                        ? "bg-primary/20 border-primary text-primary" 
                        : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                    )}
                  >
                    <CreditCard className="w-4 h-4" />
                    GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('cash')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold uppercase transition-all",
                      method === 'cash' 
                        ? "bg-primary/20 border-primary text-primary" 
                        : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                    )}
                  >
                    <Wallet className="w-4 h-4" />
                    Cash
                  </button>
                </div>
              </div>

              {method === 'gpay' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                    GPay Screenshot
                  </Label>
                  
                  <div className="relative aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-all overflow-hidden">
                     {screenshot ? (
                       <div className="relative w-full h-full group">
                         <img src={screenshot} className="w-full h-full object-cover" />
                         <button 
                           type="button"
                           onClick={() => setScreenshot(null)}
                           className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                         >
                           <Trash2 className="w-6 h-6 text-accent" />
                         </button>
                       </div>
                     ) : (
                       <>
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={handleFileChange}
                           disabled={isCompressing}
                           required={method === 'gpay'}
                           className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                         />
                         {isCompressing ? (
                           <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 text-primary animate-spin" />
                              <span className="text-[10px] font-bold text-primary uppercase">Compressing...</span>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-2">
                             <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Plus className="w-5 h-5" />
                             </div>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Proof</span>
                           </div>
                         )}
                       </>
                     )}
                  </div>
                </div>
              )}

              {method === 'cash' && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                   <p className="text-xs text-muted-foreground text-center">
                     Please ensure the worker has received the cash amount. No screenshot is required for cash payments.
                   </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isCompressing || (method === 'gpay' && !screenshot)} 
              className="orange-gradient px-8 h-11 font-bold gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Paid
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
