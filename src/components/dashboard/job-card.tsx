"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  TreePalm,
  Phone,
  FileText,
  Users,
  Truck,
  User,
  Timer,
  Archive,
  ClipboardCheck,
  Trash2,
  UserPlus,
  Navigation,
  Play,
  Dot,
  Check,
  ExternalLink
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

interface JobCardProps {
  job: Job;
  role: Role;
  currentUserId?: string;
  assignedWorkers?: UserProfile[];
  deliveryBoy?: UserProfile;
  onStatusUpdate?: (id: string, status: JobStatus) => void;
  onReassign?: (job: Job) => void;
  onAssignDelivery?: (job: Job) => void;
  onSetTime?: (job: Job) => void;
  onDelete?: (id: string) => void;
  onWorkerComplete?: (job: Job) => void;
  onArchive?: (id: string) => void;
}

const statusConfig = {
  unconfirmed: { label: 'Unconfirmed', icon: FileText, color: 'bg-muted text-muted-foreground border-muted-foreground/20' },
  pending: { label: 'Awaiting Response', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-accent/10 text-accent border-accent/20' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  delivery_assigned: { label: 'Delivery Boy Assigned', icon: Truck, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  delivery_pickup_started: { label: 'Pickup Started', icon: Navigation, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  delivery_destination_reached: { label: 'At Destination', icon: MapPin, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  harvest_started: { label: 'Harvesting', icon: Play, color: 'bg-primary/20 text-primary border-primary/30' },
  completed: { label: 'Completed', icon: TreePalm, color: 'bg-primary/10 text-primary border-primary/20' },
};

export function JobCard({ 
  job, 
  role, 
  currentUserId, 
  assignedWorkers = [], 
  deliveryBoy, 
  onStatusUpdate, 
  onReassign, 
  onAssignDelivery, 
  onSetTime, 
  onDelete,
  onWorkerComplete,
  onArchive
}: JobCardProps) {
  const [optimisticStatus, setOptimisticStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (job.status === optimisticStatus || (role === 'worker' && currentUserId && job.workerStatuses?.[currentUserId] === optimisticStatus)) {
      setOptimisticStatus(null);
    }
  }, [job.status, job.workerStatuses, optimisticStatus, role, currentUserId]);

  const acceptedWorkers = assignedWorkers.filter(w => job.workerStatuses?.[w.id] === 'accepted');
  const rejectingWorkers = assignedWorkers.filter(w => job.workerStatuses?.[w.id] === 'rejected');
  
  const totalAssignedCount = job.assignedWorkerIds?.length || 0;
  const isTeamComplete = totalAssignedCount > 0 && acceptedWorkers.length >= totalAssignedCount;
  
  let effectiveStatus = job.status;
  if (job.status === 'pending' && isTeamComplete) {
    effectiveStatus = 'confirmed';
  }
  
  const individualStatus = role === 'worker' && currentUserId 
    ? (optimisticStatus || job.workerStatuses?.[currentUserId] || 'pending') 
    : (optimisticStatus || effectiveStatus);

  const status = statusConfig[individualStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  const handleAction = (newStatus: JobStatus) => {
    setOptimisticStatus(newStatus);
    onStatusUpdate?.(job.id, newStatus);
  };

  const isWorker = role === 'worker';
  const isAdmin = role === 'manager' || role === 'finance_manager';
  const isDelivery = role === 'delivery_boy';
  
  const canSeeContact = isAdmin || isDelivery;
  const canSeeLocation = isAdmin || isDelivery;
  
  const logisticsConfirmed = job.deliveryConfirmedByBoy;

  return (
    <Card className={cn(
      "glass-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in flex flex-col min-h-[160px]",
      job.archived && "opacity-50 grayscale"
    )}>
      <CardHeader className="p-3 pb-1 space-y-1">
        <div className="flex justify-between items-start w-full">
           <Badge className={cn("px-2 py-0.5 border text-[10px] font-bold flex gap-1.5 items-center max-w-fit truncate", status.color)} variant="outline">
              <StatusIcon className="w-3 h-3 shrink-0" />
              <span className="truncate uppercase tracking-widest">{status.label}</span>
           </Badge>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <UIButton variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </UIButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/10">
                {role === 'manager' && (
                  <>
                    {!job.archived && job.status === 'completed' && (
                      <DropdownMenuItem className="text-sm text-primary" onClick={() => onArchive?.(job.id)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-sm text-accent" onClick={() => onDelete?.(job.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <h2 className="text-2xl font-headline font-bold text-white leading-tight truncate">{job.customerName}</h2>
      </CardHeader>
      
      <CardContent className="p-4 pt-1 space-y-3 flex-1">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {canSeeContact && (
            <div className="flex items-center gap-2 text-white/90">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="text-base font-medium truncate">{job.customerPhone}</span>
            </div>
          )}
          {canSeeLocation && (
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-base truncate">{job.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/90">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="text-base">{new Date(job.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <TreePalm className="w-4 h-4 text-primary shrink-0" />
            <span className="text-base">Trees: <span className="font-bold text-primary">{job.treeCount}</span></span>
          </div>
          {job.harvestTime && (
            <div className="flex items-center gap-2 text-white/90">
              <Timer className="w-4 h-4 text-primary shrink-0" />
              <span className="text-base">Time: <span className="text-primary font-bold">{job.harvestTime}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-white/90">
             <Users className="w-4 h-4 text-primary shrink-0" />
             <span className="text-base">Team: <span className={cn(isTeamComplete ? "text-green-400 font-bold" : "text-yellow-400 font-bold")}>{acceptedWorkers.length}/{totalAssignedCount || job.requiredWorkersCount}</span></span>
          </div>
        </div>

        {totalAssignedCount > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ASSIGNED WORKERS</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {assignedWorkers.map(worker => {
                const wStatus = job.workerStatuses?.[worker.id] || 'pending';
                return (
                  <div key={worker.id} className="flex items-center gap-1">
                    <span className="text-xs text-white/80">{worker.name}</span>
                    <Badge variant="outline" className={cn(
                      "h-4 px-1 text-[9px] uppercase font-bold border-none bg-transparent flex items-center p-0",
                      wStatus === 'accepted' ? "text-green-400" : 
                      wStatus === 'rejected' ? "text-accent" : 
                      "text-yellow-500"
                    )}>
                      <Dot className={cn("w-4 h-4", wStatus === 'accepted' ? "text-green-400" : wStatus === 'rejected' ? "text-accent" : "text-yellow-500")} />
                      {wStatus}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isAdmin && job.workerHarvestReports && Object.keys(job.workerHarvestReports).length > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-2">
             <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Harvest Performance</p>
             <div className="grid grid-cols-2 gap-3">
                {assignedWorkers.map(worker => {
                  const report = job.workerHarvestReports?.[worker.id];
                  if (!report) return null;
                  return (
                    <div key={worker.id} className="flex flex-col p-2 rounded-xl bg-white/5 border border-white/5">
                       <span className="text-[10px] text-muted-foreground truncate">{worker.name}</span>
                       <div className="flex items-center gap-1.5">
                         <span className="text-sm font-bold text-white">{report.trees} Trees</span>
                         <Check className="w-4 h-4 text-green-500" />
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {isWorker && logisticsConfirmed && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Delivery Boy</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-white text-sm">{deliveryBoy?.name || 'Assigned'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500" />
                <span className="text-white text-sm font-bold">{job.deliveryTime}</span>
              </div>
            </div>
          </div>
        )}

        {(isAdmin || isDelivery) && job.deliveryBoyId && (
           <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Delivery Boy Info</p>
                {job.deliveryConfirmedByBoy ? (
                  <Badge variant="outline" className="h-4 text-[9px] px-1.5 bg-green-500/10 text-green-500 border-green-500/20">Confirmed</Badge>
                ) : (
                  <Badge variant="outline" className="h-4 text-[9px] px-1.5 bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">Awaiting Confirmation</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className="text-white text-sm truncate">{deliveryBoy?.name || 'Waiting...'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span className="text-white text-sm font-bold text-orange-400">{job.deliveryTime}</span>
                 </div>
                 {job.gpsUrl && (
                    <div className="flex items-center gap-2">
                       <Navigation className="w-4 h-4 text-primary shrink-0" />
                       <a 
                         href={job.gpsUrl} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
                       >
                         Open Map <ExternalLink className="w-3 h-3" />
                       </a>
                    </div>
                 )}
              </div>
           </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-3">
        {role === 'manager' && job.status === 'unconfirmed' && (
          <UIButton className="w-full orange-gradient h-12 text-base font-bold" onClick={() => handleAction('pending')}>Confirm Order</UIButton>
        )}

        {role === 'manager' && job.status === 'pending' && !job.harvestTime && (
          <UIButton className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-base" onClick={() => onSetTime?.(job)}>Set Harvest Time</UIButton>
        )}

        {role === 'manager' && job.status === 'pending' && job.harvestTime && (
          !totalAssignedCount ? (
            <UIButton className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2 h-12 text-base" onClick={() => onReassign?.(job)}>
              <UserPlus className="w-5 h-5" /> Assign Team
            </UIButton>
          ) : rejectingWorkers.length > 0 ? (
            <UIButton className="w-full bg-accent hover:bg-accent/90 text-white font-bold gap-2 h-12 text-base" onClick={() => onReassign?.(job)}>
              <UserPlus className="w-5 h-5" /> Manage Replacement
            </UIButton>
          ) : !isTeamComplete ? (
            <div className="w-full py-3 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" /> Awaiting responses...
            </div>
          ) : null
        )}

        {role === 'manager' && effectiveStatus === 'confirmed' && !job.archived && (
           <UIButton className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 h-12 text-base" onClick={() => onAssignDelivery?.(job)}>
            <Truck className="w-5 h-5" /> Assign Delivery Boy
           </UIButton>
        )}

        {role === 'manager' && job.status === 'completed' && !job.archived && (
           <UIButton className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold gap-2 h-12 text-base border border-white/10" onClick={() => onArchive?.(job.id)}>
            <Archive className="w-5 h-5" /> Archive to History
           </UIButton>
        )}

        {role === 'delivery_boy' && individualStatus === 'delivery_assigned' && !job.deliveryConfirmedByBoy && (
           <UIButton className="w-full orange-gradient h-12 text-base font-bold" onClick={() => handleAction('delivery_assigned')}>Accept Task</UIButton>
        )}

        {role === 'delivery_boy' && job.deliveryConfirmedByBoy && job.status === 'delivery_assigned' && (
           <UIButton className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 h-12 text-base" onClick={() => handleAction('delivery_pickup_started')}>
            <Navigation className="w-5 h-5" /> Pickup Started
           </UIButton>
        )}

        {role === 'delivery_boy' && job.status === 'delivery_pickup_started' && (
           <UIButton className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2 h-12 text-base" onClick={() => handleAction('delivery_destination_reached')}>
            <MapPin className="w-5 h-5" /> Arrived at Site
           </UIButton>
        )}

        {role === 'worker' && job.status === 'delivery_destination_reached' && job.workerStatuses?.[currentUserId || ''] === 'accepted' && (
           <UIButton className="w-full orange-gradient gap-2 h-12 text-base font-bold" onClick={() => handleAction('harvest_started')}>
            <Play className="w-5 h-5" /> Start Harvest
           </UIButton>
        )}

        {role === 'worker' && job.status === 'harvest_started' && !job.workerHarvestReports?.[currentUserId || ''] && (
           <UIButton className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2 h-12 text-base" onClick={() => onWorkerComplete?.(job)}>
            <ClipboardCheck className="w-5 h-5" /> Complete Job
           </UIButton>
        )}

        {role === 'worker' && individualStatus === 'pending' && (
          <div className="flex w-full gap-3">
            <UIButton className="flex-1 orange-gradient h-12 text-base font-bold" onClick={() => handleAction('accepted')}>Accept</UIButton>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <UIButton variant="outline" className="flex-1 border-accent/20 text-accent hover:bg-accent/10 h-12 text-base font-bold">Reject</UIButton>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Rejecting a job will affect your rankings and upcoming works.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction('rejected')} className="bg-destructive text-destructive-foreground">Yes, Reject</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}