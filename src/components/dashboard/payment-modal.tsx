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
import { 
  IndianRupee, 
  CreditCard, 
  User, 
  Calculator,
  Camera,
  Trash2,
  Plus,
  Utensils,
  UserCheck,
  Tag
} from 'lucide-react';
import { Job, PaymentStatus, PaymentMethod, PricingPreset, AdditionalExpense } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  job: Job | null;
  preset: PricingPreset | undefined;
  onClose: () => void;
  onConfirm: (jobId: string, paymentData: Partial<Job>) => void;
}

export function PaymentModal({ job, preset, onClose, onConfirm }: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('fully_paid');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gpay');
  const [newScreenshots, setNewScreenshots] = useState<string[]>([]);
  const [receivedBy, setReceivedBy] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [additionalExpenses, setAdditionalExpenses] = useState<AdditionalExpense[]>([]);

  const alreadyPaid = Number(job?.amountPaid || 0);
  
  const totalHarvestedTrees = job?.workerHarvestReports 
    ? Object.values(job.workerHarvestReports).reduce((acc, r) => acc + r.trees, 0)
    : (job?.treeCount || 0);

  const totalExpectedAmount = totalHarvestedTrees * (preset?.totalPricePerTree || 0);
  const remainingBeforeThisPayment = totalExpectedAmount - alreadyPaid;
  const currentInputAmount = parseFloat(amountPaid) || 0;
  const remainingAfterThisPayment = remainingBeforeThisPayment - currentInputAmount;

  useEffect(() => {
    if (job) {
      if (paymentStatus === 'fully_paid') {
        setAmountPaid(remainingBeforeThisPayment.toString());
      } else if (paymentStatus === 'unpaid') {
        setAmountPaid('0');
      } else {
        setAmountPaid('');
      }
      setAdditionalExpenses(job.additionalExpenses || []);
      setReceivedBy(job.cashReceivedBy || '');
    }
  }, [paymentStatus, job, remainingBeforeThisPayment]);

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
          setNewScreenshots(prev => [...prev, dataUrl]);
          setIsCompressing(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = (index: number) => {
    setNewScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const addExpenseField = () => {
    setAdditionalExpenses([...additionalExpenses, { description: '', amount: 0 }]);
  };

  const updateExpense = (index: number, field: keyof AdditionalExpense, value: string) => {
    const newExpenses = [...additionalExpenses];
    if (field === 'amount') {
      newExpenses[index] = { ...newExpenses[index], [field]: parseFloat(value) || 0 };
    } else {
      newExpenses[index] = { ...newExpenses[index], [field]: value };
    }
    setAdditionalExpenses(newExpenses);
  };

  const removeExpense = (index: number) => {
    setAdditionalExpenses(additionalExpenses.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (job) {
      const data: any = {
        paymentStatus,
        amountPaid: alreadyPaid + currentInputAmount,
        paymentMethod,
        settledAt: new Date().toISOString(),
        additionalExpenses: additionalExpenses.filter(e => e.description.trim() !== '')
      };

      const existingScreenshots = job.paymentScreenshots || [];
      if (newScreenshots.length > 0) {
        data.paymentScreenshots = [...existingScreenshots, ...newScreenshots];
      }
      
      if (paymentMethod === 'cash') {
        data.cashReceivedBy = receivedBy;
      }

      onConfirm(job.id, data);
      onClose();
      reset();
    }
  };

  const reset = () => {
    setPaymentStatus('fully_paid');
    setAmountPaid('');
    setPaymentMethod('gpay');
    setNewScreenshots([]);
    setReceivedBy('');
    setAdditionalExpenses([]);
    setIsCompressing(false);
  };

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass border-black/10 dark:border-white/10 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline flex items-center gap-2 text-foreground">
                <CreditCard className="w-6 h-6 text-primary" />
                Settle Job Payment
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Recording payment and expenses for {job?.customerName}.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6 custom-scrollbar">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Bill</span>
                  <span className="text-xl font-headline font-bold text-foreground flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-primary" />
                    {totalExpectedAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-primary/80 font-bold flex items-center gap-1 mt-1">
                    <Tag className="w-2.5 h-2.5" />
                    Rate: ₹{preset?.totalPricePerTree || 0}/tree
                  </span>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 h-6">
                  {totalHarvestedTrees} Trees
                </Badge>
              </div>
              
              <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">Previously Paid</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-500">₹{alreadyPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pending Balance</span>
                  <span className="text-sm font-bold text-primary">₹{remainingBeforeThisPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5 text-primary" />
                  Additional Expenses
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={addExpenseField} className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10">
                  <Plus className="w-3 h-3 mr-1" /> Add Expense
                </Button>
              </div>
              
              <div className="space-y-2">
                {additionalExpenses.map((expense, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-200">
                    <Input 
                      placeholder="e.g. Food / Transport"
                      value={expense.description}
                      onChange={e => updateExpense(idx, 'description', e.target.value)}
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground text-xs h-9 flex-1"
                    />
                    <div className="relative w-24">
                      <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input 
                        type="number"
                        placeholder="0"
                        value={expense.amount || ''}
                        onChange={e => updateExpense(idx, 'amount', e.target.value)}
                        className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground text-xs h-9 pl-6"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExpense(idx)} className="h-9 w-9 text-accent hover:bg-accent/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {additionalExpenses.length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic text-center py-2">No additional expenses added yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
              <div className="space-y-2">
                <Label className="text-foreground text-xs font-bold uppercase tracking-widest">Select Payment Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['unpaid', 'partially_paid', 'fully_paid'] as PaymentStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={cn(
                        "py-2 px-1 rounded-lg border text-[10px] font-bold uppercase tracking-tighter transition-all",
                        paymentStatus === status 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {paymentStatus !== 'unpaid' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground text-xs font-bold uppercase tracking-widest">Amount Received (₹)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="number"
                          placeholder="0.00"
                          value={amountPaid}
                          onChange={e => setAmountPaid(e.target.value)}
                          required
                          disabled={paymentStatus === 'fully_paid'}
                          className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 pl-9 text-foreground focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground text-xs font-bold uppercase tracking-widest">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(val: PaymentMethod) => setPaymentMethod(val)}>
                        <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground">
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent className="glass border-black/10 dark:border-white/10">
                          <SelectItem value="gpay" className="text-foreground">GPay / Digital</SelectItem>
                          <SelectItem value="cash" className="text-foreground">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Label className="text-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                        Cash Receiver's Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="e.g. John Doe (Staff)"
                          value={receivedBy}
                          onChange={e => setReceivedBy(e.target.value)}
                          required={paymentMethod === 'cash'}
                          className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 pl-9 text-foreground focus:border-primary/50"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                    <Calculator className="w-4 h-4 text-primary" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Remaining after this:</span>
                      <span className={cn(
                        "text-sm font-bold",
                        remainingAfterThisPayment <= 0 ? "text-green-600 dark:text-green-500" : "text-primary"
                      )}>
                        ₹{Math.max(0, remainingAfterThisPayment).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5 text-primary" />
                        Proof (Screenshots / Receipts)
                      </Label>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                         {newScreenshots.map((src, idx) => (
                           <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-black/10 dark:border-white/10 group">
                             <img src={src} className="w-full h-full object-cover" alt={`Proof ${idx + 1}`} />
                             <button 
                               type="button"
                               onClick={() => removeScreenshot(idx)}
                               className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                               <Trash2 className="w-4 h-4 text-accent" />
                             </button>
                           </div>
                         ))}
                         <div className="relative aspect-video border-2 border-dashed border-black/10 dark:border-white/10 rounded-lg flex flex-col items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all overflow-hidden">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleFileChange}
                              disabled={isCompressing}
                              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                            />
                            {isCompressing ? (
                              <div className="flex flex-col items-center gap-1">
                                 <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                 <span className="text-[8px] font-bold text-primary uppercase">Wait...</span>
                              </div>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 text-primary mb-1" />
                                <span className="text-[8px] font-bold text-muted-foreground uppercase">Add Photo</span>
                              </>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
            <Button type="button" variant="ghost" onClick={onClose} className="text-foreground">Cancel</Button>
            <Button type="submit" disabled={!amountPaid || isCompressing || (paymentMethod === 'cash' && !receivedBy)} className="orange-gradient px-8 h-11 font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {paymentStatus === 'unpaid' ? 'Mark as Unpaid' : 'Confirm Settlement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
