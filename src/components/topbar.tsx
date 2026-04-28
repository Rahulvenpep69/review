import { Bell, Search, Globe, ChevronDown } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search reviews, brands, or insights..."
            className="w-full bg-background/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer text-sm font-medium">
          <Globe className="w-4 h-4 text-primary" />
          <span>All Brands</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>

        <div className="relative cursor-pointer hover:bg-accent p-2 rounded-full transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </div>
      </div>
    </header>
  );
}
