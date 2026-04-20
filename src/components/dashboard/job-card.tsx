"use client";

import React from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  MoreVertical,
  TreePalm,
  Phone,
  FileText,
  Users
} from 'lucide-react';
import { Job, JobStatus, Role, UserProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button as UIButton } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface JobCardProps {
  job: Job;
  role: Role;
  currentUserId?: string;
  assignedWorkers?: UserProfile[];
  onStatusUpdate?: (id: string, status: JobStatus) => void;
  onReassign?: (job: Job) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  unconfirmed: { label: 'Unconfirmed', icon: FileText, color: 'bg-muted text-muted-foreground border-muted-foreground/20' },
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-accent/10 text-accent border-accent/20' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  completed: { label: 'Completed', icon: TreePalm, color: 'bg-primary/10 text-primary border-primary/20' },
};

export function JobCard({ job, role, currentUserId, assignedWorkers = [], onStatusUpdate, onReassign, onDelete }: JobCardProps) {
  // Determine display status based on role
  const individualStatus = role === 'worker' && currentUserId ? (job.workerStatuses?.[currentUserId] || 'pending') : job.status;
  const status = statusConfig[individualStatus] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  const acceptedWorkers = assignedWorkers.filter(w => job.workerStatuses?.[w.id] === 'accepted');
  const rejectingWorkers = assignedWorkers.filter(w => job.workerStatuses?.[w.id] === 'rejected');
  const pendingWorkers = assignedWorkers.filter(w => !job.workerStatuses?.[w.id] || job.workerStatuses?.[w.id] === 'pending');
  
  const isTeamComplete = acceptedWorkers.length >= job.requiredWorkersCount;

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:translate-y-[-2px]">
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge className={cn("px-2.5 py-0.5 border font-medium flex gap-1.5 items-center", status.color)} variant="outline">
            <StatusIcon className="w-3.5 h-3.5" />
            {role === 'worker' ? status.label : statusConfig[job.status].label}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UIButton variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </UIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-white/10">
              {role === 'manager' && (
                <>
                  {job.status !== 'unconfirmed' && (
                    <DropdownMenuItem className="text-sm text-white" onClick={() => onReassign?.(job)}>
                      Manage Replacements
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-sm text-accent" onClick={() => onDelete?.(job.id)}>
                    Cancel Job
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="text-xl font-headline font-semibold mt-3 text-white">{job.customerName}</h3>
      </CardHeader>
      
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-white">{job.customerPhone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-white">{job.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-white">{new Date(job.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <TreePalm className="w-4 h-4 text-primary" />
            <span className="text-white">Trees: <span className="font-medium text-white">{job.treeCount}</span></span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-white">Team: <span className={cn("font-medium", isTeamComplete ? "text-green-400" : "text-yellow-400")}>{acceptedWorkers.length} / {job.requiredWorkersCount}</span></span>
          </div>
          
          {assignedWorkers.length > 0 && (
             <div className="pt-2 space-y-2 border-t border-white/5">
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Team Breakdown</p>
               
               {acceptedWorkers.length > 0 && (
                 <div className="space-y-1">
                   <p className="text-[10px] text-green-400 font-medium">Accepted:</p>
                   <div className="flex flex-wrap gap-1.5">
                    {acceptedWorkers.map(w => (
                      <Badge key={w.id} variant="secondary" className="bg-green-500/10 border-green-500/20 text-white flex gap-1.5 items-center py-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        {w.name}
                      </Badge>
                    ))}
                   </div>
                 </div>
               )}

               {rejectingWorkers.length > 0 && (
                 <div className="space-y-1">
                   <p className="text-[10px] text-accent font-medium">Rejected:</p>
                   <div className="flex flex-wrap gap-1.5">
                    {rejectingWorkers.map(w => (
                      <Badge key={w.id} variant="secondary" className="bg-accent/10 border-accent/20 text-white flex gap-1.5 items-center py-1">
                        <XCircle className="w-3 h-3 text-accent" />
                        {w.name}
                      </Badge>
                    ))}
                   </div>
                 </div>
               )}

               {pendingWorkers.length > 0 && (
                 <div className="space-y-1">
                   <p className="text-[10px] text-yellow-400 font-medium">Pending:</p>
                   <div className="flex flex-wrap gap-1.5">
                    {pendingWorkers.map(w => (
                      <Badge key={w.id} variant="secondary" className="bg-yellow-500/10 border-yellow-500/20 text-white flex gap-1.5 items-center py-1">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        {w.name}
                      </Badge>
                    ))}
                   </div>
                 </div>
               )}
             </div>
          )}
        </div>

        {role === 'manager' && rejectingWorkers.length > 0 && (
          <div className="flex items-start gap-2 text-xs font-medium text-accent p-2 bg-accent/10 rounded-md border border-accent/20">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <div>
              Rejection: {rejectingWorkers.map(w => w.name).join(', ')}
              <p className="text-[10px] opacity-70 mt-0.5">Replacement needed for incomplete team.</p>
            </div>
          </div>
        )}

        {role === 'manager' && job.status === 'pending' && !isTeamComplete && (
          <UIButton 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            onClick={() => onReassign?.(job)}
          >
            Assign Workers
          </UIButton>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 gap-3">
        {role === 'manager' && job.status === 'unconfirmed' && (
          <UIButton 
            className="w-full orange-gradient"
            onClick={() => onStatusUpdate?.(job.id, 'pending')}
          >
            Confirm Order
          </UIButton>
        )}

        {role === 'worker' && individualStatus === 'pending' && (
          <>
            <UIButton 
              className="flex-1 orange-gradient hover:opacity-90"
              onClick={() => onStatusUpdate?.(job.id, 'accepted')}
            >
              Accept
            </UIButton>
            <UIButton 
              variant="outline" 
              className="flex-1 border-accent/20 text-accent hover:bg-accent/10 hover:text-accent"
              onClick={() => onStatusUpdate?.(job.id, 'rejected')}
            >
              Reject
            </UIButton>
          </>
        )}

        {role === 'manager' && job.status === 'accepted' && isTeamComplete && (
          <UIButton 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onStatusUpdate?.(job.id, 'confirmed')}
          >
            Confirm Ready
          </UIButton>
        )}

        {role === 'manager' && job.status === 'rejected' && (
          <UIButton 
            className="w-full orange-gradient"
            onClick={() => onReassign?.(job)}
          >
            Manage Replacements
          </UIButton>
        )}
      </CardFooter>
    </Card>
  );
}
