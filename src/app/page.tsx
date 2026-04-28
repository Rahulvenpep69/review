"use client";

import { useEffect, useState } from "react";
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import axios from "axios";

function KPICard({ title, value, change, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
      <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12", color)} />
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-xl bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors")}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}%
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    sentimentScore: 0,
    pendingReplies: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/interactions?tenantId=tenant_1");
      const interactions = res.data.data;
      setData(interactions);

      // Simple Stat Calculation
      const total = interactions.length;
      const avg = interactions.reduce((acc: any, curr: any) => acc + (curr.content.rating || 5), 0) / (total || 1);
      const sentiment = interactions.reduce((acc: any, curr: any) => acc + curr.aiMetadata.sentimentScore, 0) / (total || 1);
      const pending = interactions.filter((i: any) => i.workflow.approvalStatus === "pending").length;

      setStats({
        totalReviews: total,
        avgRating: Number(avg.toFixed(1)),
        sentimentScore: Math.round(sentiment),
        pendingReplies: pending
      });
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const platformData = [
    { name: "Google", value: data.filter(i => i.platform === "google").length, color: "oklch(0.6 0.2 260)" },
    { name: "Facebook", value: data.filter(i => i.platform === "facebook").length, color: "oklch(0.5 0.2 200)" },
    { name: "Instagram", value: data.filter(i => i.platform === "instagram").length, color: "oklch(0.7 0.2 320)" },
    { name: "TikTok", value: data.filter(i => i.platform === "tiktok").length, color: "oklch(0.5 0.2 20)" },
  ].filter(p => p.value > 0);

  const chartData = data.length > 0 ? [
    { name: "Current", sentiment: stats.sentimentScore },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-outfit">Executive Insights</h1>
          <p className="text-muted-foreground">Welcome back, Admin. Here's your brand's reputation at a glance.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-secondary/80 transition-colors">
            Export Report
          </button>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity premium-gradient shadow-lg shadow-primary/20"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            {loading ? "Syncing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Reviews" 
          value={stats.totalReviews} 
          change="0" 
          trend="up" 
          icon={MessageSquare} 
          color="bg-blue-500"
        />
        <KPICard 
          title="Avg Rating" 
          value={stats.avgRating} 
          change="0" 
          trend="up" 
          icon={Star} 
          color="bg-yellow-500"
        />
        <KPICard 
          title="Sentiment Score" 
          value={`${stats.sentimentScore}%`} 
          change="0" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-emerald-500"
        />
        <KPICard 
          title="Pending Replies" 
          value={stats.pendingReplies} 
          change="0" 
          trend="down" 
          icon={AlertCircle} 
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold font-outfit">Sentiment Trend</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" /> Sentiment %
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full relative">
            {isMounted && (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.6 0.2 260)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.6 0.2 260)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke="oklch(0.6 0.2 260)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSentiment)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold font-outfit mb-8">Platform Distribution</h3>
          <div className="h-[300px] w-full relative">
            {isMounted && platformData.length > 0 ? (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <PieChart>
                  <Pie
                    data={platformData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
            ) : isMounted ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data available
              </div>
            ) : null}
          </div>
          <div className="space-y-3 mt-4">
            {platformData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.value} interactions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
