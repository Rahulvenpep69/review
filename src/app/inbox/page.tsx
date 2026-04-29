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
  MoreVertical,
  ChevronDown,
  ChevronRight,
  CornerDownRight
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
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/interactions?tenantId=tenant_1");
      const data = res.data.data;
      setReviews(data);
      if (data.length > 0 && !selectedReview) {
        // Find first item (comment or post)
        setSelectedReview(data[0]);
        setReplyText(data[0].replies?.aiSuggested || "");
      }
      
      // Auto-expand all posts that have comments
      const postsWithComments = data
        .filter((r: any) => r.isPost || !r.parentId)
        .map((p: any) => p.externalId)
        .filter((id: string) => data.some((c: any) => c.parentId === id));
        
      setExpandedPosts(postsWithComments);
      
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

  const handleSendReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    
    setLoading(true);
    try {
      await axios.post("/api/interactions/reply", {
        tenantId: "tenant_1",
        interactionId: selectedReview._id,
        text: replyText
      });
      alert("Reply sent successfully!");
      setReplyText("");
      fetchData(); // Refresh to show the new reply
    } catch (error: any) {
      alert("Failed to send reply: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const topLevelItems = reviews.filter(r => r.isPost || !r.parentId);

  const getCommentsForPost = (postId: string) => {
    return reviews.filter(r => r.parentId === postId);
  };

  const togglePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

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
            topLevelItems.map((post) => {
              const postComments = getCommentsForPost(post.externalId);
              const isExpanded = expandedPosts.includes(post.externalId);
              const isSelected = selectedReview?._id === post._id;

              return (
                <div key={post._id} className="border-b border-border">
                  {/* Parent Post */}
                  <div 
                    onClick={() => handleSelect(post)}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:bg-accent/30",
                      isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {postComments.length > 0 && (
                          <button onClick={(e) => togglePost(post.externalId, e)} className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-xs uppercase">
                          {post.customer.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold truncate w-32 flex items-center gap-2">
                            {post.customer.name}
                            {postComments.length > 0 && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                {postComments.length}
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {post.platform === "google" && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                        {post.platform === "instagram" && <Camera className="w-3.5 h-3.5 text-pink-500" />}
                        {post.platform === "facebook" && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                        {post.platform === "tiktok" && <MessageSquare className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.content.text}</p>
                    <div className="flex gap-2">
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border",
                        post.aiMetadata.sentimentLabel === "negative" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                        post.aiMetadata.sentimentLabel === "positive" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {post.aiMetadata.sentimentLabel}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground border border-border">
                        {post.aiMetadata.issueCategory || "Post"}
                      </span>
                    </div>
                  </div>

                  {/* Nested Comments */}
                  {isExpanded && postComments.length > 0 && (
                    <div className="bg-accent/5">
                      {postComments.map((comment) => {
                        const isCommentSelected = selectedReview?._id === comment._id;
                        return (
                          <div 
                            key={comment._id}
                            onClick={() => handleSelect(comment)}
                            className={cn(
                              "pl-12 pr-4 py-3 border-t border-border/50 cursor-pointer transition-all hover:bg-accent/20 flex gap-3",
                              isCommentSelected ? "bg-primary/5" : ""
                            )}
                          >
                            <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                                    {comment.customer.name[0]}
                                  </div>
                                  <h4 className="text-xs font-bold truncate">{comment.customer.name}</h4>
                                </div>
                                <span className="text-[9px] text-muted-foreground shrink-0 whitespace-nowrap ml-2">
                                  {formatDistanceToNow(new Date(comment.createdAt))}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1.5">{comment.content.text}</p>
                              <div className="flex gap-1.5">
                                <span className={cn(
                                  "text-[8px] font-bold uppercase px-1 py-0.5 rounded-full",
                                  comment.aiMetadata.sentimentLabel === "negative" ? "bg-rose-500/10 text-rose-500" : 
                                  comment.aiMetadata.sentimentLabel === "positive" ? "bg-emerald-500/10 text-emerald-500" : 
                                  "bg-amber-500/10 text-amber-500"
                                )}>
                                  {comment.aiMetadata.sentimentLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
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
                  <button 
                    onClick={handleSendReply}
                    disabled={loading || !replyText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Reply
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
