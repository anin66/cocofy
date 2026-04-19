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
  User,
  TreePalm
} from 'lucide-react';
import { Job, JobStatus, Role } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  workerName?: string;
  onStatusUpdate?: (id: string, status: JobStatus) => void;
  onReassign?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-accent/10 text-accent border-accent/20' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  completed: { label: 'Completed', icon: TreePalm, color: 'bg-primary/10 text-primary border-primary/20' },
};

export function JobCard({ job, role, workerName, onStatusUpdate, onReassign, onDelete }: JobCardProps) {
  const status = statusConfig[job.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card className="glass-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:translate-y-[-2px]">
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge className={cn("px-2.5 py-0.5 border font-medium flex gap-1.5 items-center", status.color)} variant="outline">
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-white/10">
              <DropdownMenuItem className="text-sm">View Details</DropdownMenuItem>
              {role === 'manager' && (
                <>
                  <DropdownMenuItem className="text-sm" onClick={() => onReassign?.(job.id)}>
                    {job.assignedWorkerId ? "Reassign Worker" : "Assign Worker"}
                  </DropdownMenuItem>
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
            <MapPin className="w-4 h-4 text-primary" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{new Date(job.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <TreePalm className="w-4 h-4 text-primary" />
            <span>Trees to harvest: <span className="text-foreground font-medium">{job.treeCount}</span></span>
          </div>
          {workerName && (
             <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
             <User className="w-4 h-4 text-primary" />
             <span>Assigned to: <span className="text-foreground font-medium">{workerName}</span></span>
           </div>
          )}
        </div>

        {job.status === 'rejected' && role === 'manager' && (
          <div className="flex items-center gap-2 text-xs font-medium text-accent p-2 bg-accent/10 rounded-md border border-accent/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Worker rejected this assignment. Needs reassignment.
          </div>
        )}

        {role === 'manager' && !job.assignedWorkerId && job.status === 'pending' && (
          <div className="flex items-center gap-2 text-xs font-medium text-yellow-500 p-2 bg-yellow-500/10 rounded-md border border-yellow-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            No worker assigned yet.
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 gap-3">
        {role === 'worker' && job.status === 'pending' && (
          <>
            <Button 
              className="flex-1 orange-gradient hover:opacity-90"
              onClick={() => onStatusUpdate?.(job.id, 'accepted')}
            >
              Accept
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-accent/20 text-accent hover:bg-accent/10 hover:text-accent"
              onClick={() => onStatusUpdate?.(job.id, 'rejected')}
            >
              Reject
            </Button>
          </>
        )}

        {role === 'manager' && job.status === 'accepted' && (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onStatusUpdate?.(job.id, 'confirmed')}
          >
            Confirm Ready
          </Button>
        )}

        {role === 'manager' && (job.status === 'rejected' || (!job.assignedWorkerId && job.status === 'pending')) && (
          <Button 
            className="w-full orange-gradient"
            onClick={() => onReassign?.(job.id)}
          >
            {job.assignedWorkerId ? "Find Alternative Worker" : "Assign Worker"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
