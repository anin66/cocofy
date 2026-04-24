"use client";

import React, { useState } from 'react';
import { PricingPreset } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Settings2, Plus, Trash2, IndianRupee, TreePalm, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface PricingPresetsViewProps {
  presets: PricingPreset[];
  onAdd: (preset: any) => void;
  onDelete: (id: string) => void;
}

export function PricingPresetsView({ presets, onAdd, onDelete }: PricingPresetsViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    totalPricePerTree: '',
    workerPayPerTree: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      totalPricePerTree: parseFloat(formData.totalPricePerTree),
      workerPayPerTree: parseFloat(formData.workerPayPerTree)
    });
    setIsAddModalOpen(false);
    setFormData({ name: '', totalPricePerTree: '', workerPayPerTree: '' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-headline font-bold text-foreground">Pricing Presets</h3>
            <p className="text-xs text-muted-foreground">Manage service rates and worker compensation</p>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="orange-gradient h-10 px-6 font-bold gap-2 shadow-lg shadow-primary/20 text-white">
          <Plus className="w-4 h-4" /> New Preset
        </Button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5">
        <Table>
          <TableHeader className="bg-black/[0.02] dark:bg-white/[0.02]">
            <TableRow className="border-black/5 dark:border-white/5">
              <TableHead className="text-foreground">Preset Name</TableHead>
              <TableHead className="text-right text-foreground">Total Rate / Tree</TableHead>
              <TableHead className="text-right text-foreground">Worker Pay / Tree</TableHead>
              <TableHead className="text-right text-foreground">Net Margin</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presets.map((preset) => (
              <TableRow key={preset.id} className="border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <TableCell className="font-semibold text-foreground">{preset.name}</TableCell>
                <TableCell className="text-right text-primary font-bold">₹{preset.totalPricePerTree.toLocaleString()}</TableCell>
                <TableCell className="text-right text-green-600 dark:text-green-400 font-bold">₹{preset.workerPayPerTree.toLocaleString()}</TableCell>
                <TableCell className="text-right text-blue-600 dark:text-blue-400 font-mono">
                  ₹{(preset.totalPricePerTree - preset.workerPayPerTree).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-accent hover:bg-accent/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass border-black/10 dark:border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Delete Preset?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This will remove "{preset.name}". Active jobs using this preset will not be affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground hover:bg-black/10 dark:hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(preset.id)} className="bg-destructive text-destructive-foreground">Delete Permanently</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {presets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                  No pricing presets configured. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[400px] glass border-black/10 dark:border-white/10 p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-headline flex items-center gap-2 text-foreground">
                  <Settings2 className="w-5 h-5 text-primary" />
                  Add New Pricing Preset
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Define a new pricing structure for harvesting jobs.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Preset Name</Label>
                  <Input 
                    id="name"
                    placeholder="e.g. Standard Rate, Premium Zone"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground focus:border-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total" className="text-foreground flex items-center gap-2">
                      <IndianRupee className="w-3.5 h-3.5 text-primary" />
                      Rate / Tree
                    </Label>
                    <Input 
                      id="total"
                      type="number"
                      placeholder="0"
                      value={formData.totalPricePerTree}
                      onChange={e => setFormData({ ...formData, totalPricePerTree: e.target.value })}
                      required
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="worker" className="text-foreground flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      Worker Pay
                    </Label>
                    <Input 
                      id="worker"
                      type="number"
                      placeholder="0"
                      value={formData.workerPayPerTree}
                      onChange={e => setFormData({ ...formData, workerPayPerTree: e.target.value })}
                      required
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10">
              <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-foreground hover:bg-black/10 dark:hover:bg-white/10">Cancel</Button>
              <Button type="submit" className="orange-gradient px-8 h-11 font-bold shadow-lg shadow-primary/20 text-white">Create Preset</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}