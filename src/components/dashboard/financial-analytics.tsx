"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Job, PricingPreset, UserProfile } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  Users,
  MapPin,
  Loader2,
  AlertTriangle,
  Target,
  IndianRupee,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Pie, 
  PieChart, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Bar,
  BarChart,
  Area,
  AreaChart,
  Legend
} from "recharts";
import { 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  isAfter, 
  format,
  parseISO
} from 'date-fns';

interface FinancialAnalyticsProps {
  jobs: Job[];
  presets: PricingPreset[];
  activePreset: PricingPreset;
  workers: UserProfile[];
}

type TimeFilter = 'week' | 'month' | 'year' | 'all';

export function FinancialAnalytics({ jobs, presets, activePreset, workers }: FinancialAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    if (!mounted) return null;

    // FINANCE RULE: Only include jobs that are officially CONFIRMED DONE (completed status)
    const processedJobs = jobs.filter(j => j.status === 'completed');
    
    let now = new Date();
    let filterDate: Date | null = null;

    if (timeFilter === 'week') filterDate = startOfWeek(now);
    else if (timeFilter === 'month') filterDate = startOfMonth(now);
    else if (timeFilter === 'year') filterDate = startOfYear(now);

    const filtered = filterDate 
      ? processedJobs.filter(j => isAfter(new Date(j.scheduledDate), filterDate!))
      : processedJobs;

    let totalRevenue = 0;
    let totalWorkerCost = 0;
    let totalAdditionalExp = 0;
    let totalTrees = 0;
    let pendingReceivables = 0;
    let lossCount = 0;

    const trendMap = new Map<string, { date: string, revenue: number, profit: number, expenses: number }>();
    const workerPerfMap = new Map<string, { name: string, trees: number, earnings: number }>();
    const locationMap = new Map<string, { revenue: number, count: number }>();
    const jobTypeMap = new Map<string, { name: string, revenue: number, profit: number }>();

    filtered.forEach(job => {
      const jobPreset = presets.find(p => p.id === job.presetId) || activePreset;
      const actualTrees = job.workerHarvestReports 
        ? Object.values(job.workerHarvestReports).reduce((sum, r) => sum + r.trees, 0)
        : job.treeCount;
      
      const revenue = actualTrees * jobPreset.totalPricePerTree;
      const workerPay = actualTrees * jobPreset.workerPayPerTree;
      const additional = job.additionalExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const totalJobExpense = workerPay + additional;
      const profit = revenue - totalJobExpense;

      if (profit < 0) lossCount++;

      totalRevenue += revenue;
      totalWorkerCost += workerPay;
      totalAdditionalExp += additional;
      totalTrees += actualTrees;

      if (job.paymentStatus !== 'fully_paid') {
        pendingReceivables += (revenue - (job.amountPaid || 0));
      }

      const dateKey = job.scheduledDate;
      const existingTrend = trendMap.get(dateKey) || { date: dateKey, revenue: 0, profit: 0, expenses: 0 };
      trendMap.set(dateKey, { 
        ...existingTrend, 
        revenue: existingTrend.revenue + revenue, 
        profit: existingTrend.profit + profit,
        expenses: existingTrend.expenses + totalJobExpense
      });

      const loc = job.location || 'Site Unknown';
      const locStats = locationMap.get(loc) || { revenue: 0, count: 0 };
      locationMap.set(loc, { revenue: locStats.revenue + revenue, count: locStats.count + 1 });

      if (job.workerHarvestReports) {
        Object.entries(job.workerHarvestReports).forEach(([workerId, report]) => {
          const workerInfo = workers.find(w => w.id === workerId);
          const existing = workerPerfMap.get(workerId) || { name: workerInfo?.name || `Worker ${workerId.slice(0, 3)}`, trees: 0, earnings: 0 };
          const earnings = report.trees * jobPreset.workerPayPerTree;
          workerPerfMap.set(workerId, { 
            ...existing, 
            trees: existing.trees + report.trees,
            earnings: existing.earnings + earnings
          });
        });
      }

      const typeKey = jobPreset.id;
      const typeStats = jobTypeMap.get(typeKey) || { name: jobPreset.name, revenue: 0, profit: 0 };
      jobTypeMap.set(typeKey, {
        ...typeStats,
        revenue: typeStats.revenue + revenue,
        profit: typeStats.profit + profit
      });
    });

    const totalExpenses = totalWorkerCost + totalAdditionalExp;
    const netProfit = totalRevenue - totalExpenses;

    const trendData = Array.from(trendMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, displayDate: format(parseISO(d.date), 'MMM dd') }));

    const workerData = Array.from(workerPerfMap.values())
      .sort((a, b) => b.trees - a.trees)
      .slice(0, 8);

    const locationData = Array.from(locationMap.entries())
      .map(([name, stats]) => ({ name, value: stats.revenue, count: stats.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const expenseDistribution = [
      { name: 'Worker Pay', value: totalWorkerCost, color: '#EB7619' },
      { name: 'Overhead/Ops', value: totalAdditionalExp, color: '#F77A7A' }
    ];

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalTrees,
      pendingReceivables,
      lossCount,
      trendData,
      workerData,
      locationData,
      expenseDistribution,
      filteredCount: filtered.length
    };
  }, [jobs, presets, activePreset, timeFilter, mounted, workers]);

  if (!mounted || !stats) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="font-headline font-bold uppercase tracking-widest text-xs text-foreground">Computing Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Financial Intelligence
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Strategic oversight for finalized harvest operations.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white/5 dark:bg-black/5 p-2 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-black/10 dark:border-white/10">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Period</span>
          </div>
          <Select value={timeFilter} onValueChange={(val: TimeFilter) => setTimeFilter(val)}>
            <SelectTrigger className="w-[150px] bg-transparent border-none text-foreground focus:ring-0 font-bold h-8 text-xs">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="glass border-black/10 dark:border-white/10">
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">Fiscal Year</SelectItem>
              <SelectItem value="all">All History</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Gross Revenue', 
            value: stats.totalRevenue, 
            icon: TrendingUp, 
            color: 'text-green-600 dark:text-green-500', 
            sub: `${stats.filteredCount} Completed`,
            bg: 'bg-green-500/5 border-green-500/10' 
          },
          { 
            label: 'Net Profit', 
            value: stats.netProfit, 
            icon: Target, 
            color: 'text-primary', 
            sub: `${stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}% Margin`,
            bg: 'bg-primary/5 border-primary/10' 
          },
          { 
            label: 'Total Expenses', 
            value: stats.totalExpenses, 
            icon: TrendingDown, 
            color: 'text-accent', 
            sub: `₹${(stats.totalExpenses / (stats.filteredCount || 1)).toFixed(0)} Avg / Job`,
            bg: 'bg-accent/5 border-accent/10' 
          },
          { 
            label: 'Receivables', 
            value: stats.pendingReceivables, 
            icon: Wallet, 
            color: 'text-blue-600 dark:text-blue-400', 
            sub: 'Awaiting Settlement',
            bg: 'bg-blue-400/5 border-blue-400/10' 
          },
        ].map((item, i) => (
          <Card key={i} className={cn("glass-card overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl border", item.bg)}>
            <CardHeader className="pb-2 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                <div className={cn("p-2 rounded-lg bg-black/5 dark:bg-white/5 transition-transform duration-300 group-hover:scale-110", item.color)}>
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-headline font-bold text-foreground">
                  ₹{item.value.toLocaleString()}
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-bold", item.color)}>{item.sub}</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card border-black/5 dark:border-white/5 p-6 lg:col-span-2 flex flex-col hover:shadow-lg transition-all duration-500">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <LineChartIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline font-bold text-foreground">Profitability Velocity</CardTitle>
                <CardDescription className="text-xs">Performance of finalized operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 min-h-[350px] mt-8">
            {stats.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Area type="monotone" name="Revenue" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" name="Profit" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40 italic space-y-2 text-foreground">
                <LineChartIcon className="w-12 h-12 text-muted-foreground/20" />
                <p>No historical data for this period</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="glass-card border-black/5 dark:border-white/5 p-6 flex flex-col hover:shadow-lg transition-all duration-500">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline font-bold text-foreground">Expense Profile</CardTitle>
                <CardDescription className="text-xs">Capital distribution for closed jobs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.expenseDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {stats.expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-headline font-bold text-foreground transition-transform duration-500">₹{(stats.totalExpenses / 1000).toFixed(1)}k</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total Ops Cost</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 mt-6">
              {stats.expenseDistribution.map((exp, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                    <span className="text-muted-foreground font-medium">{exp.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-foreground font-bold">₹{exp.value.toLocaleString()}</span>
                    <span className="text-[8px] text-muted-foreground font-bold">
                      {stats.totalExpenses > 0 ? ((exp.value / stats.totalExpenses) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-black/5 dark:border-white/5 p-6 flex flex-col hover:shadow-lg transition-all duration-500">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline font-bold text-foreground">Worker Benchmarking</CardTitle>
                <CardDescription className="text-xs">Efficiency based on tree volume vs. cost</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 min-h-[300px] mt-8">
            {stats.workerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.workerData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    width={100} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="trees" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20 opacity-30 italic text-foreground text-sm">No productivity metrics logged</div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card border-black/5 dark:border-white/5 p-6 bg-primary/5 hover:shadow-lg transition-all duration-500">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-headline font-bold text-foreground">Operational Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0 space-y-4 pt-4">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-4 transition-all duration-300 hover:translate-x-2">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-500 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Top Performing Site</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.locationData[0] ? `${stats.locationData[0].name} generated ₹${stats.locationData[0].value.toLocaleString()} revenue across ${stats.locationData[0].count} completed jobs.` : 'Insufficient data.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-4 transition-all duration-300 hover:translate-x-2">
                <div className={cn("p-3 rounded-xl shrink-0", stats.lossCount > 0 ? "bg-accent/10 text-accent" : "bg-blue-500/10 text-blue-500 dark:text-blue-400")}>
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Margin Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.lossCount > 0 
                      ? `${stats.lossCount} jobs identified with overhead exceeding revenue. Review pricing presets.`
                      : "All closed operations in this period maintained positive margins."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex gap-4 transition-all duration-300 hover:translate-x-2">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Receivable Risk</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{stats.pendingReceivables.toLocaleString()} in outstanding payments for completed jobs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-black/5 dark:border-white/5 p-6 hover:shadow-lg transition-all duration-500">
             <CardHeader className="px-0 pt-0">
               <div className="flex items-center gap-3">
                 <MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                 <CardTitle className="text-lg font-headline font-bold text-foreground">Geographical Revenue</CardTitle>
               </div>
             </CardHeader>
             <div className="space-y-4 pt-4">
                {stats.locationData.map((loc, i) => (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between text-[10px] transition-colors group-hover:text-primary font-bold uppercase tracking-widest">
                      <span className="text-foreground truncate max-w-[200px]">{loc.name}</span>
                      <span className="text-primary">₹{loc.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-primary transition-all duration-1000 ease-out" 
                         style={{ width: `${(loc.value / (stats.totalRevenue || 1)) * 100}%` }}
                       />
                    </div>
                  </div>
                ))}
                {stats.locationData.length === 0 && <p className="text-center py-10 text-muted-foreground italic text-xs">No completed location data</p>}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
