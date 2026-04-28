"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend,
  Cell
} from "recharts";
import { 
  Download, 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  FileText,
  PieChart as PieIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const complaintData: any[] = [];
const trendData: any[] = [];

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-outfit">Strategic Intelligence</h1>
          <p className="text-muted-foreground">Deep dive into your customer experience and brand health.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-semibold cursor-pointer hover:bg-accent transition-colors">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Last 30 Days</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-outfit">Multi-Platform Rating Trend</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Google</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                  <span className="text-xs text-muted-foreground">Instagram</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs text-muted-foreground">Facebook</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full relative">
              {isMounted && (
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 5]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      />
                      <Line type="monotone" dataKey="google" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="instagram" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="facebook" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8">
            <h3 className="text-xl font-bold font-outfit mb-8">Top Recurring Issues</h3>
            <div className="h-[300px] w-full relative">
              {isMounted && (
                <div className="absolute inset-0">
                  <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart data={complaintData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "oklch(0.9 0.01 260)", fontSize: 13, fontWeight: "bold" }}
                        width={120}
                      />
                      <Tooltip 
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ backgroundColor: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {complaintData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText className="w-16 h-16" />
            </div>
            <h4 className="text-sm font-bold uppercase text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> AI Executive Summary
            </h4>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground italic">
              <p>
                "No trends detected yet. Connect your accounts and start syncing data to generate AI insights."
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Sentiment Breakdown</h4>
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground text-center py-8">Awaiting sync data...</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h4 className="text-sm font-bold uppercase text-muted-foreground mb-4">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-accent/20 rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Response Speed</p>
                <p className="text-lg font-bold">2.4 hrs</p>
              </div>
              <div className="p-4 bg-accent/20 rounded-2xl border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Approval Rate</p>
                <p className="text-lg font-bold">94%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
