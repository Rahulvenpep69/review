import { Layers } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${className}`}>
      <div className="bg-primary p-1.5 rounded-lg">
        <Layers className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-gradient">MEDIA360</span>
    </div>
  );
}
