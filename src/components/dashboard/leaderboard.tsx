"use client";

import React, { useState } from 'react';
import { UserProfile, Role } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trophy, Medal, Star, RotateCcw, Edit2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderboardProps {
  workers: UserProfile[];
  currentUserId?: string;
  role?: Role;
  onReset?: () => void;
  onUpdateStats?: (id: string, stats: Partial<UserProfile>) => void;
}

export function Leaderboard({ workers, currentUserId, role, onReset, onUpdateStats }: LeaderboardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string>("");
  const [editStats, setEditStats] = useState({
    points: 0,
    acceptedJobs: 0,
    rejectedJobs: 0
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-slate-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-700" />;
      default: return <span className="text-muted-foreground font-bold w-5 text-center">{index + 1}</span>;
    }
  };

  const handleEditClick = () => {
    if (workers.length > 0) {
      const firstWorker = workers[0];
      setEditingWorkerId(firstWorker.id);
      setEditStats({
        points: firstWorker.points || 0,
        acceptedJobs: firstWorker.acceptedJobs || 0,
        rejectedJobs: firstWorker.rejectedJobs || 0
      });
      setIsEditModalOpen(true);
    }
  };

  const handleWorkerSelect = (id: string) => {
    const worker = workers.find(w => w.id === id);
    if (worker) {
      setEditingWorkerId(id);
      setEditStats({
        points: worker.points || 0,
        acceptedJobs: worker.acceptedJobs || 0,
        rejectedJobs: worker.rejectedJobs || 0
      });
    }
  };

  const handleSaveStats = () => {
    if (editingWorkerId && onUpdateStats) {
      onUpdateStats(editingWorkerId, editStats);
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5">
      <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-headline font-bold text-foreground">Workers Leaderboard</h3>
        </div>
        
        {role === 'manager' && (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Ranking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-black/10 dark:border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Reset All Rankings?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will set all workers' points, accepted, and rejected jobs to 0. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-foreground">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset} className="orange-gradient text-white">Reset All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button size="sm" className="orange-gradient text-xs text-white shadow-lg" onClick={handleEditClick}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Ranking
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/[0.01] dark:bg-white/[0.01]">
            <TableRow className="border-black/5 dark:border-white/5 hover:bg-transparent">
              <TableHead className="w-16 text-center text-muted-foreground">Rank</TableHead>
              <TableHead className="text-muted-foreground">Worker</TableHead>
              <TableHead className="text-right text-muted-foreground">Points</TableHead>
              <TableHead className="text-right hidden sm:table-cell text-green-600">Accepted</TableHead>
              <TableHead className="text-right hidden sm:table-cell text-accent">Rejected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker, index) => {
              const isMe = worker.id === currentUserId;
              return (
                <TableRow 
                  key={worker.id} 
                  className={cn(
                    "border-black/5 dark:border-white/5 transition-colors group",
                    isMe ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  )}
                >
                  <TableCell className="text-center py-4">
                    <div className="flex justify-center">
                      {getRankIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        isMe ? "bg-primary text-white" : "bg-black/5 dark:bg-white/10 text-muted-foreground"
                      )}>
                        {worker.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-semibold transition-colors",
                          isMe ? "text-primary" : "text-foreground group-hover:text-primary"
                        )}>
                          {worker.name} {isMe && "(You)"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          {worker.availability}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg text-foreground">
                    {worker.points || 0}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                    {worker.acceptedJobs || 0}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                    {worker.rejectedJobs || 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[400px] glass border-black/10 dark:border-white/10 p-0 overflow-hidden">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline flex items-center gap-2 text-foreground">
                <Edit2 className="w-5 h-5 text-primary" />
                Edit Worker Ranking
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Manually adjust a worker's statistics. Use with care.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Select Worker</Label>
                <Select value={editingWorkerId} onValueChange={handleWorkerSelect}>
                  <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground">
                    <SelectValue placeholder="Choose a worker" />
                  </SelectTrigger>
                  <SelectContent className="glass border-black/10 dark:border-white/10">
                    {workers.map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="points" className="text-foreground">Total Points</Label>
                  <Input 
                    id="points"
                    type="number"
                    value={editStats.points}
                    onChange={e => setEditStats({ ...editStats, points: parseInt(e.target.value) || 0 })}
                    className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accepted" className="text-foreground">Accepted</Label>
                    <Input 
                      id="accepted"
                      type="number"
                      value={editStats.acceptedJobs}
                      onChange={e => setEditStats({ ...editStats, acceptedJobs: parseInt(e.target.value) || 0 })}
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rejected" className="text-foreground">Rejected</Label>
                    <Input 
                      id="rejected"
                      type="number"
                      value={editStats.rejectedJobs}
                      onChange={e => setEditStats({ ...editStats, rejectedJobs: parseInt(e.target.value) || 0 })}
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStats} className="orange-gradient gap-2 text-white shadow-lg">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}