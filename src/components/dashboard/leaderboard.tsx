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
import { Trophy, Medal, Star, User, RotateCcw, Edit2, Save } from 'lucide-react';
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
      case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
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
    <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-headline font-bold text-white">Top Workers</h3>
        </div>
        
        {role === 'manager' ? (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Ranking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Reset All Rankings?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will set all workers' points, accepted, and rejected jobs to 0. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset} className="orange-gradient">Reset All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button size="sm" className="orange-gradient text-xs" onClick={handleEditClick}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Ranking
            </Button>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
            Global Rankings
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-16 text-center">Rank</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right hidden sm:table-cell text-green-400">Accepted</TableHead>
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
                    "border-white/5 transition-colors group",
                    isMe ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-white/5"
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
                        isMe ? "bg-primary text-white" : "bg-white/10 text-muted-foreground"
                      )}>
                        {worker.name[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-semibold transition-colors",
                          isMe ? "text-primary" : "text-white group-hover:text-primary"
                        )}>
                          {worker.name} {isMe && "(You)"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {worker.availability}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg text-white">
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
        <DialogContent className="sm:max-w-[400px] glass border-white/10 p-0 overflow-hidden">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline flex items-center gap-2 text-white">
                <Edit2 className="w-5 h-5 text-primary" />
                Edit Worker Ranking
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Manually adjust a worker's statistics. Use with care.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Select Worker</Label>
                <Select value={editingWorkerId} onValueChange={handleWorkerSelect}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a worker" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    {workers.map(w => (
                      <SelectItem key={w.id} value={w.id} className="text-white">
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="points" className="text-white">Total Points</Label>
                  <Input 
                    id="points"
                    type="number"
                    value={editStats.points}
                    onChange={e => setEditStats({ ...editStats, points: parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accepted" className="text-white">Accepted</Label>
                    <Input 
                      id="accepted"
                      type="number"
                      value={editStats.acceptedJobs}
                      onChange={e => setEditStats({ ...editStats, acceptedJobs: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rejected" className="text-white">Rejected</Label>
                    <Input 
                      id="rejected"
                      type="number"
                      value={editStats.rejectedJobs}
                      onChange={e => setEditStats({ ...editStats, rejectedJobs: parseInt(e.target.value) || 0 })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-white">Cancel</Button>
            <Button onClick={handleSaveStats} className="orange-gradient gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}