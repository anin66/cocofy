"use client";

import React, { useState, useMemo } from 'react';
import { Job, PricingPreset } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  PieChart as PieChartIcon,
  Calendar,
  Filter
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  isAfter, 
  subDays 
} from 'date-fns';

interface FinancialAnalyticsProps {
  jobs: Job[];
  presets: PricingPreset[];
  activePreset: PricingPreset;
}

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

export function FinancialAnalytics({ jobs, presets, activePreset }: FinancialAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredData = useMemo(() => {
    const settledJobs = jobs.filter(j => j.settledAt || (j.status === 'completed' && j.amountPaid! > 0));
    
    let now = new Date();
    let filterDate: Date | null = null;

    if (timeFilter === 'day') filterDate = startOfDay(now);
    else if (timeFilter === 'week') filterDate = startOfWeek(now);
    else if (timeFilter === 'month') filterDate = startOfMonth(now);
    else if (timeFilter === 'year') filterDate = startOfYear(now);

    const filtered = filterDate 
      ? settledJobs.filter(j => isAfter(new Date(j.scheduledDate), filterDate!))
      : settledJobs;

    let revenue = 0;
    let expense = 0;

    filtered.forEach(job => {
      const jobPreset = presets.find(p => p.id === job.presetId) || activePreset;
      const actualTrees = job.workerHarvestReports 
        ? Object.values(job.workerHarvestReports).reduce((sum, r) => sum + r.trees, 0)
        : job.treeCount;
      
      const jobRevenue = actualTrees * jobPreset.totalPricePerTree;
      const workerPay = actualTrees * jobPreset.workerPayPerTree;
      const additional = job.additionalExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      
      revenue += jobRevenue;
      expense += (workerPay + additional);
    });

    const profit = revenue - expense;

    return {
      revenue,
      expense,
      profit,
      count: filtered.length
    };
  }, [jobs, presets, activePreset, timeFilter]);

  const chartData = [
    { name: "Expenses", value: filteredData.expense, fill: "hsl(var(--accent))" },
    { name: "Net Profit", value: Math.max(0, filteredData.profit), fill: "hsl(var(--primary))" },
  ];

  const chartConfig = {
    expense: {
      label: "Expenses",
      color: "hsl(var(--accent))",
    },
    profit: {
      label: "Net Profit",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-white">Financial Insights</h2>
          <p className="text-muted-foreground">Comprehensive performance analysis</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <Filter className="w-4 h-4 text-primary ml-2" />
          <Select value={timeFilter} onValueChange={(val: TimeFilter) => setTimeFilter(val)}>
            <SelectTrigger className="w-[180px] bg-transparent border-none text-white focus:ring-0">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10">
              <SelectItem value="day" className="text-white">Today</SelectItem>
              <SelectItem value="week" className="text-white">This Week</SelectItem>
              <SelectItem value="month" className="text-white">This Month</SelectItem>
              <SelectItem value="year" className="text-white">This Year</SelectItem>
              <SelectItem value="all" className="text-white">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Total Revenue</CardDescription>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-white">₹{filteredData.revenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <div className="h-1 w-full bg-green-500/20 mt-4">
            <div className="h-full bg-green-500 w-full animate-in slide-in-from-left duration-1000" />
          </div>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Total Expenses</CardDescription>
              <TrendingDown className="w-4 h-4 text-accent" />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-white">₹{filteredData.expense.toLocaleString()}</CardTitle>
          </CardHeader>
          <div className="h-1 w-full bg-accent/20 mt-4">
            <div className="h-full bg-accent w-full animate-in slide-in-from-left duration-1000" />
          </div>
        </Card>

        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Net Profit</CardDescription>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className={cn(
              "text-3xl font-headline font-bold",
              filteredData.profit >= 0 ? "text-primary" : "text-accent"
            )}>
              ₹{filteredData.profit.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <div className="h-1 w-full bg-primary/20 mt-4">
            <div className="h-full bg-primary w-full animate-in slide-in-from-left duration-1000" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-white/5 p-8 flex flex-col">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold text-white">Profit Distribution</CardTitle>
                <CardDescription>Ratio of earnings vs operational costs</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            {filteredData.revenue > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full max-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={120}
                      strokeWidth={5}
                      stroke="rgba(0,0,0,0.1)"
                      paddingAngle={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-10 opacity-50">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/10 mb-4 animate-spin-slow" />
                <p className="text-muted-foreground italic">No financial data for this period</p>
              </div>
            )}
            
            {filteredData.revenue > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-headline font-bold text-white">
                  {((filteredData.profit / filteredData.revenue) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="glass-card border-white/5 p-8">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-headline font-bold text-white">Period Summary</CardTitle>
                <CardDescription>Statistics for {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] font-bold uppercase text-muted-foreground">Jobs Completed</p>
                 <p className="text-2xl font-headline font-bold text-white">{filteredData.count}</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg. Profit/Job</p>
                 <p className="text-2xl font-headline font-bold text-white">
                   ₹{filteredData.count > 0 ? Math.round(filteredData.profit / filteredData.count).toLocaleString() : 0}
                 </p>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Financial Breakdown</h4>
               <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-sm text-muted-foreground">Total Inflow</span>
                    <span className="text-sm font-bold text-green-400">₹{filteredData.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-sm text-muted-foreground">Total Outflow</span>
                    <span className="text-sm font-bold text-accent">₹{filteredData.expense.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl orange-gradient text-white shadow-xl shadow-primary/20">
                    <span className="text-base font-bold">Net Balance</span>
                    <span className="text-xl font-headline font-bold">₹{filteredData.profit.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
