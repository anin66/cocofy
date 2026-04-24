"use client";

import React, { useMemo } from 'react';
import { Job, PricingPreset } from '@/lib/types';
import { 
  History, 
  Search, 
  IndianRupee, 
  CheckCircle2, 
  Calendar, 
  Eye, 
  CreditCard,
  Wallet,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReceiptDownloadButton } from './receipt-download-button';
import { Badge } from '@/components/ui/badge';

interface PaymentHistoryViewProps {
  jobs: Job[];
  presets: PricingPreset[];
  activePreset: PricingPreset;
  onDelete?: (id: string) => void;
}

export function PaymentHistoryView({ jobs, presets, activePreset, onDelete }: PaymentHistoryViewProps) {
  const [search, setSearch] = React.useState('');

  const settledJobs = useMemo(() => {
    return jobs
      .filter(j => j.paymentStatus === 'fully_paid') // Strict Rule: Only fully settled jobs in Ledger
      .filter(j => j.customerName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const dateA = a.settledAt ? new Date(a.settledAt).getTime() : 0;
        const dateB = b.settledAt ? new Date(b.settledAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [jobs, search]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Payment Ledger
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Audit log of all fully settled transactions and payment proofs.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search finalized transactions..." 
            className="pl-10 w-72 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground h-12"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5">
        <Table>
          <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
            <TableRow className="border-black/5 dark:border-white/5 hover:bg-transparent">
              <TableHead className="text-foreground">Customer / Date</TableHead>
              <TableHead className="text-foreground">Payment Method</TableHead>
              <TableHead className="text-right text-foreground">Amount Collected</TableHead>
              <TableHead className="text-center text-foreground">Evidence</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settledJobs.map((job) => {
              const preset = presets.find(p => p.id === job.presetId) || activePreset;
              const hasScreenshots = (job.paymentScreenshots?.length || 0) > 0 || !!job.paymentScreenshot;
              
              return (
                <TableRow key={job.id} className="border-black/5 dark:border-white/5 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{job.customerName}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        Settled {job.settledAt ? new Date(job.settledAt).toLocaleDateString() : 'Date Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {job.paymentMethod === 'gpay' ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1.5 h-6">
                          <CreditCard className="w-3 h-3" /> GPay
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 gap-1.5 h-6">
                          <Wallet className="w-3 h-3" /> Cash
                        </Badge>
                      )}
                      {job.cashReceivedBy && (
                        <span className="text-[10px] text-muted-foreground">by {job.cashReceivedBy}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-headline font-bold text-primary">₹{job.amountPaid?.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {hasScreenshots ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold gap-1.5 hover:bg-primary/10 text-primary">
                            <Eye className="w-3.5 h-3.5" /> View Proof
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-black/10 dark:border-white/10 sm:max-w-xl">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Payment Evidence - {job.customerName}</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                             {job.paymentScreenshot && (
                               <div className="relative aspect-[9/16] rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                                  <img src={job.paymentScreenshot} className="w-full h-full object-contain" alt="Payment Proof" />
                               </div>
                             )}
                             {job.paymentScreenshots?.map((src, i) => (
                               <div key={i} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                                  <img src={src} className="w-full h-full object-contain" alt={`Payment Proof ${i + 1}`} />
                               </div>
                             ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic uppercase">No Digital Proof</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ReceiptDownloadButton job={job} preset={preset} />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-accent hover:bg-accent/10 transition-transform active:scale-90"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-black/10 dark:border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Delete Finalized Record?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              This action will permanently remove this settled record from the database. This should only be done for data correction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete?.(job.id)} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {settledJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic opacity-40">
                   No fully settled transactions in the audit log
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
