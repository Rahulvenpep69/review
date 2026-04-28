"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Send, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  Camera,
  Globe,
  Star,
  Sparkles,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export default function InboxPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/interactions?tenantId=tenant_1");
      const data = res.data.data;
      setReviews(data);
      if (data.length > 0 && !selectedReview) {
        setSelectedReview(data[0]);
        setReplyText(data[0].replies?.aiSuggested || "");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.replies?.aiSuggested || "");
  };

  const regenerateReply = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 animate-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar - Review List */}
      <div className="w-[400px] flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <div className="p-4 border-b border-border bg-accent/20">
          <div className="relative group mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search inbox..."
              className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-primary/10 text-primary text-xs font-bold py-1.5 rounded-lg border border-primary/20">
              Unread ({reviews.length})
            </button>
            <button className="flex-1 bg-background text-muted-foreground text-xs font-bold py-1.5 rounded-lg border border-border hover:bg-accent transition-colors">
              Urgent
            </button>
            <button className="px-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No interactions found.</div>
          ) : (
            reviews.map((review) => (
              <div 
                key={review._id}
                onClick={() => handleSelect(review)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer transition-all hover:bg-accent/30",
                  selectedReview?._id === review._id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs uppercase">
                      {review.customer.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold truncate w-32">{review.customer.name}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt))} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {review.platform === "google" && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                    {review.platform === "instagram" && <Camera className="w-3.5 h-3.5 text-pink-500" />}
                    {review.platform === "facebook" && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                    {review.platform === "tiktok" && <MessageSquare className="w-3.5 h-3.5 text-rose-500" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{review.content.text}</p>
                <div className="flex gap-2">
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border",
                    review.aiMetadata.sentimentLabel === "negative" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                    review.aiMetadata.sentimentLabel === "positive" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}>
                    {review.aiMetadata.sentimentLabel}
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground border border-border">
                    {review.aiMetadata.issueCategory}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Review Detail */}
      <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/20">
        {!selectedReview ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select an interaction to view details
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-xl font-bold uppercase">
                  {selectedReview.customer.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-outfit">{selectedReview.customer.name}</h2>
                  <p className="text-sm text-muted-foreground">User ID: @{selectedReview.customer.username || selectedReview.customer.name.toLowerCase().replace(" ", "_")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-accent rounded-xl transition-colors border border-border">
                  <Trash2 className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-accent rounded-xl transition-colors border border-border">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-4 h-4", 
                        i < (selectedReview.content.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-muted border-muted"
                      )} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(selectedReview.createdAt))} ago
                  </span>
                </div>
                <p className="text-lg leading-relaxed">{selectedReview.content.text}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-accent/20 rounded-2xl p-4 border border-border">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Sentiment</p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      selectedReview.aiMetadata.sentimentLabel === "negative" ? "bg-rose-500" : "bg-emerald-500"
                    )} />
                    <span className="font-bold text-sm capitalize">{selectedReview.aiMetadata.sentimentLabel}</span>
                  </div>
                </div>
                <div className="bg-accent/20 rounded-2xl p-4 border border-border">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Urgency</p>
                  <div className={cn(
                    "flex items-center gap-2",
                    selectedReview.aiMetadata.urgencyScore > 7 ? "text-rose-500" : "text-emerald-500"
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold text-sm capitalize">{selectedReview.aiMetadata.urgencyScore}/10</span>
                  </div>
                </div>
                <div className="bg-accent/20 rounded-2xl p-4 border border-border">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Category</p>
                  <span className="font-bold text-sm capitalize">{selectedReview.aiMetadata.issueCategory}</span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-primary">AI Suggested Response</h3>
                  </div>
                  <button 
                    onClick={regenerateReply}
                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                    Regenerate
                  </button>
                </div>
                
                <div className="relative">
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full bg-background/50 border border-border rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="bg-background/80 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-muted-foreground border border-border">
                      Professional Tone
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent-foreground/10 rounded-xl text-xs font-bold transition-all">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent-foreground/10 rounded-xl text-xs font-bold transition-all">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
                    <Send className="w-4 h-4" /> Send Reply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
