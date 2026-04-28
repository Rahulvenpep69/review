"use client";

import { 
  Building2, 
  MapPin, 
  Plus, 
  Settings2, 
  ChevronRight, 
  Globe, 
  Camera,
  Search,
  MoreVertical,
  Star,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const brands: any[] = [];

export default function BrandsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-outfit text-white">Brand Management</h1>
          <p className="text-muted-foreground">Monitor and manage reputation across your entire portfolio.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add New Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl group hover:border-primary/50 transition-all">
          <Building2 className="w-5 h-5 text-primary mb-3" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-wider">Total Brands</p>
          <h3 className="text-3xl font-bold text-white">{brands.length}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl group hover:border-blue-500/50 transition-all">
          <MapPin className="w-5 h-5 text-blue-500 mb-3" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-wider">Total Locations</p>
          <h3 className="text-3xl font-bold text-white">0</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl group hover:border-amber-500/50 transition-all">
          <Star className="w-5 h-5 text-amber-500 mb-3" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 tracking-wider">Avg Portfolio Rating</p>
          <h3 className="text-3xl font-bold text-white">0.0 <span className="text-sm text-muted-foreground font-normal">/ 5.0</span></h3>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-6 border-b border-border bg-accent/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by brand name or industry..."
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-bold hover:bg-accent transition-colors flex items-center justify-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Filter by Industry
            </button>
            <button className="flex-1 md:flex-none px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-bold hover:bg-accent transition-colors">
              Sort by Sentiment
            </button>
          </div>
        </div>

        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12">
          <div className="w-20 h-20 rounded-3xl bg-accent/50 flex items-center justify-center mb-6 border border-border">
            <Building2 className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">No Brands Registered</h4>
          <p className="text-muted-foreground max-w-sm mb-8">
            You haven't added any brands to your portfolio yet. Connect your first brand to start monitoring reputation.
          </p>
          <button className="bg-primary/10 text-primary hover:bg-primary/20 px-8 py-3 rounded-xl text-sm font-bold border border-primary/20 transition-all">
            Get Started: Add a Brand
          </button>
        </div>
      </div>
    </div>
  );
}
