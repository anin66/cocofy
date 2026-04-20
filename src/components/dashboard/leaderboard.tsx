"use client";

import React from 'react';
import { UserProfile } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trophy, Medal, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface LeaderboardProps {
  workers: UserProfile[];
  currentUserId?: string;
}

export function Leaderboard({ workers, currentUserId }: LeaderboardProps) {
  // Workers are expected to be pre-sorted by points in the store
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-muted-foreground font-bold w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-headline font-bold text-white">Top Workers</h3>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          Global Rankings
        </Badge>
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
            {workers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No workers found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
