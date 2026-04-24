
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Job, PricingPreset, UserProfile } from '@/lib/types';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowUpRight,
  Target,
  Trophy,
  History,
  TreePalm,
  BarChart3,
  Loader2,
  ChevronRight,
  Star,
  Eye,
  CreditCard
} from 'lucide-react';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell,
  Pie,
  PieChart
} from 'recharts';
import { 
  format, 
  startOfMonth, 
  startOfDay, 
  isSameDay, 
  isSameMonth, 
  subDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ReceiptDownloadButton } from './receipt-download-button';

interface WorkerSalaryDashboardProps {
  worker: UserProfile;
  jobs: Job[];
  presets: PricingPreset[];
}

export function WorkerSalaryDashboard({ worker, jobs, presets }: WorkerSalaryDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    if (!mounted) return null;

    const workerJobs = jobs.filter(j => 
      j.assignedWorkerIds?.includes(worker.id) && 
      j.status === 'completed' &&
      j.workerHarvestReports?.[worker.id]
    );

    const now = new Date();
    const today = startOfDay(now);
    const monthStart = startOfMonth(now);

    let totalLifetime = 0;
    let earnedThisMonth = 0;
    let earnedToday = 0;
    let pendingEarnings = 0;

    const trendMap = new Map<string, number>();
    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    last7Days.forEach(day => trendMap.set(format(day, 'yyyy-MM-dd'), 0));

    const siteEarningsMap = new Map<string, number>();

    const detailedHistory = workerJobs.map(job => {
      const preset = presets.find(p => p.id === job.presetId);
      const report = job.workerHarvestReports![worker.id];
      const earnings = report.trees * (preset?.workerPayPerTree || 0);
      const paymentInfo = job.workerPaymentStatuses?.[worker.id];
      const isPaid = paymentInfo?.status === 'fully_paid';

      totalLifetime += earnings;
      if (isSameMonth(new Date(job.scheduledDate), monthStart)) earnedThisMonth += earnings;
      if (isSameDay(new Date(job.scheduledDate), today)) earnedToday += earnings;
      if (!isPaid) pendingEarnings += earnings;

      const dateKey = job.scheduledDate;
      if (trendMap.has(dateKey)) {
        trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + earnings);
      }

      const site = job.location || 'Unknown Site';
      siteEarningsMap.set(site, (siteEarningsMap.get(site) || 0) + earnings);

      return {
        id: job.id,
        customer: job.customerName,
        location: job.location,
        date: job.scheduledDate,
        trees: report.trees,
        earnings,
        status: isPaid ? 'paid' : 'pending',
        paidAt: paymentInfo?.paidAt,
        method: paymentInfo?.method,
        proof: paymentInfo?.proof,
        rawJob: job,
        rawPreset: preset
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const trendData = Array.from(trendMap.entries()).map(([date, amount]) => ({
      date: format(parseISO(date), 'MMM dd'),
      amount
    }));

    const siteData = Array.from(siteEarningsMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalLifetime,
      earnedThisMonth,
      earnedToday,
      pendingEarnings,
      trendData,
      siteData,
      detailedHistory,
      avgPerJob: workerJobs.length > 0 ? totalLifetime / workerJobs.length : 0,
      totalJobs: workerJobs.length
    };
  }, [jobs, presets, worker.id, mounted]);

  if (!mounted || !stats) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-headline font-bold uppercase tracking-widest text-xs">Synchronizing Ledger...</p>
      </div>
    );
  }

  const COLORS = ['#EB7619', '#F77A7A', '#F97316', '#FB923C', '#FDBA74'];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 🔹 HEADER: Welcome & Motivation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Trophy className="w-4 h-4" /> Performance Status: Active
          </div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Earnings Dashboard</h2>
          <p className="text-muted-foreground text-sm">Real-time overview of your labor valuation and disbursements.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="glass p-1.5 rounded-2xl flex items-center gap-3 pr-6 border border-black/5 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white shadow-lg">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Ranking Points</p>
                <p className="text-xl font-headline font-bold text-foreground leading-none">{worker.points || 0}</p>
              </div>
           </div>
        </div>
      </div>

      {/* 🔹 KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Earned', value: stats.totalLifetime, sub: 'Lifetime Income', icon: Wallet, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'This Month', value: stats.earnedThisMonth, sub: `${stats.totalJobs} Jobs Done`, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Pending Payout', value: stats.pendingEarnings, sub: 'Awaiting Settlement', icon: Clock, color: 'text-accent', bg: 'bg-accent/5' },
          { label: 'Today', value: stats.earnedToday, sub: 'Daily Harvest', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/5' },
        ].map((kpi, i) => (
          <Card key={i} className={cn("glass-card border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5", kpi.bg)}>
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                <div className={cn("p-2 rounded-lg bg-black/5 dark:bg-white/10", kpi.color)}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold text-foreground">₹{kpi.value.toLocaleString()}</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-wide mt-1">{kpi.sub}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* 🔹 ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card border-black/5 dark:border-white/5 p-6 lg:col-span-2 flex flex-col hover:shadow-lg transition-all duration-500">
          <CardHeader className="px-0 pt-0">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                   <CardTitle className="text-lg font-headline font-bold text-foreground">Earnings Trend</CardTitle>
                   <CardDescription>Daily income fluctuation over last 7 days</CardDescription>
                </div>
             </div>
          </CardHeader>
          <div className="flex-1 min-h-[300px] mt-8">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.trendData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="glass-card border-black/5 dark:border-white/5 p-6 flex flex-col hover:shadow-lg transition-all duration-500">
             <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-3">
                   <Target className="w-5 h-5 text-blue-500" />
                   <CardTitle className="text-lg font-headline font-bold text-foreground">Monthly Goal</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="px-0 pt-4 space-y-4">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-bold">Progress to ₹20,000 Target</span>
                      <span className="text-primary font-bold">{Math.min(100, (stats.earnedThisMonth / 20000) * 100).toFixed(0)}%</span>
                   </div>
                   <Progress value={(stats.earnedThisMonth / 20000) * 100} className="h-2 bg-black/5 dark:bg-white/5" />
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Star className="w-4 h-4" />
                   </div>
                   <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase leading-tight tracking-widest">
                      {stats.avgPerJob > 500 ? "High Efficiency! You earn more than ₹500/job on average." : "Keep harvesting! Increase tree counts to boost job averages."}
                   </p>
                </div>
             </CardContent>
           </Card>

           <Card className="glass-card border-black/5 dark:border-white/5 p-6 flex flex-col hover:shadow-lg transition-all duration-500">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-3">
                   <MapPin className="w-5 h-5 text-accent" />
                   <CardTitle className="text-lg font-headline font-bold text-foreground">Site Breakdown</CardTitle>
                </div>
              </CardHeader>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[180px]">
                 <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                       <Pie
                          data={stats.siteData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {stats.siteData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="w-full space-y-2 mt-4">
                    {stats.siteData.map((site, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                             <span className="text-muted-foreground truncate max-w-[120px]">{site.name}</span>
                          </div>
                          <span className="text-foreground">₹{site.value}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* 🔹 HISTORY LEDGER */}
      <div className="space-y-4">
         <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
               <History className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-headline font-bold text-foreground tracking-tight">Earnings History</h3>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stats.detailedHistory.map((item) => (
               <Card key={item.id} className="glass-card border-black/5 dark:border-white/5 overflow-hidden group transition-all duration-300 hover:border-primary/20">
                  <div className="p-5 space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <h4 className="text-lg font-headline font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{item.customer}</h4>
                           <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{item.location}</span>
                           </div>
                        </div>
                        <Badge className={cn(
                           "px-2 py-0.5 text-[8px] uppercase font-black tracking-widest rounded-lg border",
                           item.status === 'paid' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse"
                        )}>
                           {item.status}
                        </Badge>
                     </div>

                     <div className="grid grid-cols-2 gap-4 py-3 border-y border-black/5 dark:border-white/5">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Harvested</span>
                           <span className="text-sm font-bold text-foreground flex items-center gap-1">
                              <TreePalm className="w-3.5 h-3.5 text-primary" />
                              {item.trees} Trees
                           </span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">Your Earn</span>
                           <span className="text-xl font-headline font-bold text-primary">₹{item.earnings.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-transform group-hover:rotate-12">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-foreground uppercase">{format(new Date(item.date), 'MMM dd, yyyy')}</span>
                              <span className="text-[8px] text-muted-foreground font-bold tracking-widest">Job ID: #{item.id.slice(0, 5).toUpperCase()}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.status === 'paid' && (
                             <div className="flex flex-col items-end mr-1">
                                {item.method === 'gpay' && item.proof ? (
                                  <Dialog>
                                     <DialogTrigger asChild>
                                        <button className="text-[8px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1 group/btn">
                                           <Eye className="w-2.5 h-2.5 transition-transform group-hover/btn:scale-110" /> View Proof
                                        </button>
                                     </DialogTrigger>
                                     <DialogContent className="glass border-black/10 dark:border-white/10 sm:max-w-md">
                                        <DialogHeader>
                                           <DialogTitle className="text-foreground flex items-center gap-2">
                                              <CreditCard className="w-5 h-5 text-primary" />
                                              Payment Evidence
                                           </DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 bg-black/5 dark:bg-white/5 rounded-2xl p-2 border border-black/10 dark:border-white/10">
                                           <div className="aspect-[9/16] relative rounded-xl overflow-hidden shadow-2xl">
                                              <img src={item.proof} className="w-full h-full object-contain bg-black/40" alt="Salary Proof" />
                                           </div>
                                        </div>
                                        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                                           <div>
                                              <p className="text-[10px] font-bold uppercase text-muted-foreground">Amount Earned</p>
                                              <p className="text-xl font-headline font-bold text-primary">₹{item.earnings.toLocaleString()}</p>
                                           </div>
                                           <div className="text-right">
                                              <p className="text-[10px] font-bold uppercase text-muted-foreground">Disbursed Via</p>
                                              <p className="text-xs font-bold text-foreground uppercase">{item.method}</p>
                                           </div>
                                        </div>
                                     </DialogContent>
                                  </Dialog>
                                ) : (
                                  <span className="text-[8px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">Settled via {item.method}</span>
                                )}
                                <span className="text-[7px] text-muted-foreground font-mono">{format(new Date(item.paidAt!), 'HH:mm')}</span>
                             </div>
                          )}
                          {item.status === 'paid' && (
                             <ReceiptDownloadButton 
                               job={item.rawJob} 
                               preset={item.rawPreset} 
                               workerId={worker.id} 
                               workerName={worker.name} 
                             />
                          )}
                        </div>
                     </div>
                  </div>
               </Card>
            ))}

            {stats.detailedHistory.length === 0 && (
               <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
                  <TreePalm className="w-12 h-12 mb-4" />
                  <p className="font-headline font-bold uppercase tracking-widest text-xs">No completed earnings records yet</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
