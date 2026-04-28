"use client";

import { 
  ShieldAlert, 
  AlertTriangle, 
  Gavel, 
  Zap, 
  ExternalLink, 
  Clock, 
  UserPlus,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const alerts: any[] = [];

export default function AlertsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-rose-500 p-1 rounded-md">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Security & Crisis Center</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-outfit">Crisis Command</h1>
          <p className="text-muted-foreground">Immediate action required for high-risk reputation threats.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-card border border-border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent transition-colors">
            Alert Settings
          </button>
          <button className="bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/20">
            Escalate All Active
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alerts.length > 0 ? alerts.map((alert) => (
          <div key={alert.id} className="bg-card border border-border rounded-3xl overflow-hidden group hover:border-rose-500/30 transition-all">
            {/* ... alert content ... */}
          </div>
        )) : (
          <div className="bg-card border border-border rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-outfit">All Clear</h3>
              <p className="text-muted-foreground">No high-risk alerts or crisis situations detected across your platforms.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
