"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Job, UserProfile, JobStatus } from '@/lib/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  TreePalm, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  Loader2,
  AlertTriangle,
  Filter,
  Users,
  LayoutGrid,
  ListTodo,
  CalendarDays,
  Search,
  CheckCircle2,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  addDays,
  subDays,
  startOfDay,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';

interface CalendarViewProps {
  jobs: Job[];
  workers: UserProfile[];
  onJobClick?: (job: Job) => void;
}

type ViewType = 'month' | 'week' | 'day';

// Helper to convert time strings (e.g., "6:00 AM", "17:30") to minutes from midnight
const parseTimeToMinutes = (timeStr: string | undefined): number | null => {
  if (!timeStr || timeStr.trim() === '') return null;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export function CalendarView({ jobs, workers, onJobClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- LOGIC: Conflict Detection (Time-Based) ---
  const conflicts = useMemo(() => {
    const conflictList: Record<string, string[]> = {}; // jobId -> [messages]
    const workerDateMap: Record<string, Job[]> = {}; // "workerId-date" -> [Jobs]

    // Step 1: Group non-completed/archived jobs by worker and date
    jobs.forEach(job => {
      if (job.status === 'completed' || job.status === 'rejected' || job.archived) return;
      
      job.assignedWorkerIds?.forEach(wId => {
        const key = `${wId}-${job.scheduledDate}`;
        if (!workerDateMap[key]) workerDateMap[key] = [];
        workerDateMap[key].push(job);
      });
    });

    // Step 2: Analyze each worker's daily schedule for 2-hour overlaps
    Object.entries(workerDateMap).forEach(([key, dailyJobs]) => {
      if (dailyJobs.length < 2) return;

      const [workerId] = key.split('-');
      const worker = workers.find(w => w.id === workerId);

      for (let i = 0; i < dailyJobs.length; i++) {
        for (let j = i + 1; j < dailyJobs.length; j++) {
          const jobA = dailyJobs[i];
          const jobB = dailyJobs[j];
          
          const timeA = parseTimeToMinutes(jobA.harvestTime);
          const timeB = parseTimeToMinutes(jobB.harvestTime);

          // Only detect conflict if both jobs have specific times set
          if (timeA !== null && timeB !== null) {
            const diff = Math.abs(timeA - timeB);
            if (diff < 120) { // Threshold: 120 minutes (2 hours)
              const msg = `Time Conflict: ${worker?.name || 'Worker'} is scheduled for ${jobA.customerName} and ${jobB.customerName} within a 2-hour window.`;
              
              if (!conflictList[jobA.id]) conflictList[jobA.id] = [];
              if (!conflictList[jobA.id].includes(msg)) conflictList[jobA.id].push(msg);
              
              if (!conflictList[jobB.id]) conflictList[jobB.id] = [];
              if (!conflictList[jobB.id].includes(msg)) conflictList[jobB.id].push(msg);
            }
          }
        }
      }
    });
    
    return conflictList;
  }, [jobs, workers]);

  // --- LOGIC: Filtering ---
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesWorker = workerFilter === 'all' || job.assignedWorkerIds?.includes(workerFilter);
      return matchesStatus && matchesWorker;
    });
  }, [jobs, statusFilter, workerFilter]);

  if (!mounted) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">Loading Operations...</p>
      </div>
    );
  }

  // --- CALENDAR GRID LOGIC ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = viewType === 'month' ? startOfWeek(monthStart) : startOfWeek(currentDate);
  const calendarEnd = viewType === 'month' ? endOfWeek(monthEnd) : endOfWeek(currentDate);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const next = () => setCurrentDate(viewType === 'month' ? addMonths(currentDate, 1) : addDays(currentDate, viewType === 'week' ? 7 : 1));
  const prev = () => setCurrentDate(viewType === 'month' ? subMonths(currentDate, 1) : subDays(currentDate, viewType === 'week' ? 7 : 1));

  const getJobsForDay = (day: Date) => {
    return filteredJobs.filter(job => isSameDay(new Date(job.scheduledDate), day));
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-600 border-green-500/20',
    harvest_started: 'bg-primary/20 text-primary border-primary/20',
    pending: 'bg-blue-500/20 text-blue-600 border-blue-500/20',
    unconfirmed: 'bg-black/5 dark:bg-white/5 text-muted-foreground border-black/10 dark:border-white/10',
    delivery_assigned: 'bg-orange-500/20 text-orange-600 border-orange-500/20',
  };

  const todayJobs = getJobsForDay(new Date());

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 🔹 HEADER: Intelligence & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl orange-gradient text-white shadow-lg shadow-primary/20">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Operations Engine</h2>
              <p className="text-muted-foreground text-sm">Real-time scheduling and conflict management center.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/10 dark:border-white/10 w-fit">
            {(['month', 'week', 'day'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewType(v)}
                className={cn(
                  "h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  viewType === v ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 dark:bg-black/5 p-2 rounded-2xl border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2 px-3 border-r border-black/10 dark:border-white/10">
               <Filter className="w-3.5 h-3.5 text-primary" />
               <span className="text-[10px] font-bold uppercase text-muted-foreground">Filters</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-transparent border-none text-foreground focus:ring-0 font-bold h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="glass border-black/10 dark:border-white/10">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Awaiting Resp.</SelectItem>
                <SelectItem value="harvest_started">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={workerFilter} onValueChange={setWorkerFilter}>
              <SelectTrigger className="w-[140px] bg-transparent border-none text-foreground focus:ring-0 font-bold h-8 text-xs">
                <SelectValue placeholder="Worker" />
              </SelectTrigger>
              <SelectContent className="glass border-black/10 dark:border-white/10">
                <SelectItem value="all">All Workers</SelectItem>
                {workers.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/10 dark:border-white/10">
            <Button variant="ghost" size="icon" onClick={prev} className="h-9 w-9 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold uppercase tracking-widest text-foreground min-w-[140px] text-center">
              {format(currentDate, viewType === 'month' ? 'MMMM yyyy' : 'MMM dd, yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={next} className="h-9 w-9 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 🔹 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-lg">
           <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's Agenda</p>
                <p className="text-xl font-headline font-bold text-foreground">{todayJobs.length} Operations Scheduled</p>
              </div>
           </CardContent>
        </Card>

        <Card className="glass-card border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-lg">
           <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Filtered</p>
                <p className="text-xl font-headline font-bold text-foreground">{filteredJobs.length} Jobs in View</p>
              </div>
           </CardContent>
        </Card>

        <Card className={cn(
          "glass-card border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:shadow-lg border-l-4",
          Object.keys(conflicts).length > 0 ? "border-l-accent animate-pulse" : "border-l-primary"
        )}>
           <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", Object.keys(conflicts).length > 0 ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary")}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scheduling Alerts</p>
                <p className="text-xl font-headline font-bold text-foreground">
                  {Object.keys(conflicts).length > 0 ? `${Object.keys(conflicts).length} Time Conflicts` : 'Schedule Healthy'}
                </p>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* 🔹 MAIN GRID */}
      <div className="glass-card rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl">
        <div className="grid grid-cols-7 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className={cn(
          "grid grid-cols-7",
          viewType === 'day' ? "grid-cols-1" : ""
        )}>
          {days.map((day, idx) => {
            const dayJobs = getJobsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            
            return (
              <div 
                key={idx} 
                className={cn(
                  "min-h-[160px] p-3 border-r border-b border-black/5 dark:border-white/5 transition-all relative group",
                  !isCurrentMonth && viewType === 'month' ? "bg-black/5 opacity-30" : "hover:bg-primary/[0.01] dark:hover:bg-primary/[0.01]",
                  isToday(day) && "bg-primary/[0.04]",
                  viewType === 'day' && !isSameDay(day, currentDate) ? "hidden" : ""
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={cn(
                    "text-sm font-bold transition-transform duration-300 group-hover:scale-110",
                    isToday(day) ? "text-primary flex flex-col items-center" : "text-muted-foreground",
                    isCurrentMonth ? "" : "text-muted-foreground/30"
                  )}>
                    {format(day, 'd')}
                    {isToday(day) && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(235,118,25,0.6)]" />}
                  </span>
                  {dayJobs.length > 0 && isCurrentMonth && (
                    <Badge variant="outline" className="h-5 px-2 text-[10px] bg-primary/10 text-primary border-primary/20 font-bold rounded-lg shadow-sm">
                      {dayJobs.length} OPS
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {dayJobs.map((job) => {
                    const jobConflicts = conflicts[job.id];
                    return (
                      <TooltipProvider key={job.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => onJobClick?.(job)}
                              className={cn(
                                "p-2 rounded-xl text-[10px] font-bold truncate border flex flex-col gap-1 cursor-pointer transition-all duration-300 hover:translate-x-1 hover:shadow-md",
                                statusColors[job.status] || statusColors.unconfirmed,
                                jobConflicts ? "border-accent animate-pulse" : ""
                              )}
                            >
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                {jobConflicts ? <AlertTriangle className="w-3 h-3 text-accent shrink-0" /> : <TreePalm className="w-3 h-3 shrink-0" />}
                                <span className="truncate uppercase tracking-tight">{job.customerName}</span>
                              </div>
                              <div className="flex items-center justify-between opacity-70">
                                 <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {job.harvestTime || 'TBA'}</span>
                                 {jobConflicts && <Badge variant="outline" className="h-3 p-0 px-1 text-[7px] bg-accent/20 text-accent border-none font-black">Time Issue</Badge>}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="glass border-black/10 dark:border-white/10 p-4 w-64 space-y-3 shadow-2xl">
                            <div className="flex justify-between items-start border-b border-black/5 dark:border-white/10 pb-2">
                               <p className="text-sm font-bold text-foreground">{job.customerName}</p>
                               <Badge className={cn("text-[8px] h-4", statusColors[job.status])}>{job.status}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5 text-primary" /> {job.harvestTime || 'Time TBA'}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="w-3.5 h-3.5 text-primary" /> {job.assignedWorkerIds?.length || 0}/{job.requiredWorkersCount} Assigned
                              </div>
                            </div>
                            {jobConflicts && (
                              <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 flex gap-2">
                                <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
                                <div className="space-y-1">
                                  {jobConflicts.map((c, i) => (
                                    <p key={i} className="text-[9px] font-bold text-accent uppercase leading-tight">{c}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-[10px] text-primary font-bold flex items-center gap-1 pt-1">
                               Click to manage job <ArrowRight className="w-3 h-3" />
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
