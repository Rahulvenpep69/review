"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Camera, 
  MessageSquare, 
  Link as LinkIcon, 
  ShieldCheck, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState([
    { 
      id: "google",
      name: "Google Business Profile", 
      icon: Globe, 
      color: "text-blue-500", 
      status: "disconnected",
      desc: "Sync reviews and ratings from all your locations."
    },
    { 
      id: "facebook",
      name: "Facebook Pages", 
      icon: Globe, 
      color: "text-blue-600", 
      status: "disconnected",
      desc: "Monitor comments and reviews on your FB posts."
    },
    { 
      id: "instagram",
      name: "Instagram Business", 
      icon: Camera, 
      color: "text-pink-500", 
      status: "connected",
      desc: "Engage with Reel and Post comments automatically."
    },
    { 
      id: "tiktok",
      name: "TikTok Business", 
      icon: MessageSquare, 
      color: "text-rose-500", 
      status: "disconnected",
      desc: "Track mentions and comments on your TikTok videos."
    },
  ]);

  const [googleLocations, setGoogleLocations] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState("");
  const [isLoadingLocs, setIsLoadingLocs] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [metaPages, setMetaPages] = useState<any[]>([]);
  const [selectedMetaPage, setSelectedMetaPage] = useState("");
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  const fetchLocations = async () => {
    setIsLoadingLocs(true);
    setIsRateLimited(false);
    try {
      const res = await axios.get("/api/integrations/google/locations?tenantId=tenant_1");
      const locs = res.data.locations || [];
      setGoogleLocations(locs);
      setSelectedLoc(res.data.selectedLocationId || "");
      
      const isConnected = locs.length > 0 || res.data.isCached;
      setIntegrations(prev => prev.map(item => 
        item.id === "google" ? { ...item, status: isConnected ? "connected" : "disconnected" } : item
      ));
    } catch (e: any) {
      if (e.response?.status === 429) {
        setIsRateLimited(true);
      }
      const errMsg = e.response?.data?.error || e.message;
      console.error("Failed to fetch locations:", errMsg);
      setIntegrations(prev => prev.map(item => 
        item.id === "google" ? { ...item, status: "disconnected" } : item
      ));
    } finally {
      setIsLoadingLocs(false);
    }
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value;
    const selected = googleLocations.find(l => l.locationId === locId);
    if (!selected) return;

    try {
      await axios.post("/api/integrations/google/locations", {
        tenantId: "tenant_1",
        locationId: locId,
        accountId: selected.accountId
      });
      setSelectedLoc(locId);
      alert("Business location updated!");
    } catch (e) {
      alert("Failed to update location");
    }
  };

  const fetchMetaPages = async () => {
    setIsLoadingMeta(true);
    try {
      const res = await axios.get("/api/integrations/facebook/pages?tenantId=tenant_1");
      setMetaPages(res.data.pages || []);
      setSelectedMetaPage(res.data.selectedPageId || "");
      
      const isConnected = res.data.connected;
      setIntegrations(prev => prev.map(item => 
        (item.id === "facebook" || item.id === "instagram") 
          ? { ...item, status: isConnected ? "connected" : "disconnected" } 
          : item
      ));
    } catch (e) { console.error(e); } finally { setIsLoadingMeta(false); }
  };

  const handleMetaPageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pageId = e.target.value;
    const selected = metaPages.find(p => p.id === pageId);
    if (!selected) return;
    try {
      await axios.post("/api/integrations/facebook/pages", {
        tenantId: "tenant_1",
        pageId: pageId,
        instagramId: selected.instagramId
      });
      setSelectedMetaPage(pageId);
      alert("Social accounts linked!");
    } catch (e) { alert("Failed to link"); }
  };

  const [showMetaModal, setShowMetaModal] = useState(false);
  const [metaConfig, setMetaConfig] = useState({ appId: "", appSecret: "" });

  const fetchConfig = async () => {
    try {
      const res = await axios.get("/api/config?tenantId=tenant_1");
      setMetaConfig({ 
        appId: res.data.metaAppId || "", 
        appSecret: res.data.metaAppSecret || "" 
      });
    } catch (e) { console.error(e); }
  };

  const handleSaveConfig = async () => {
    try {
      await axios.post("/api/config", {
        tenantId: "tenant_1",
        metaAppId: metaConfig.appId,
        metaAppSecret: metaConfig.appSecret
      });
      alert("Platform credentials saved!");
      setShowMetaModal(false);
    } catch (e) { alert("Failed to save credentials"); }
  };

  useEffect(() => {
    fetchLocations();
    fetchMetaPages();
    fetchConfig();
  }, []);

  const toggleStatus = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === "connected" ? "disconnected" : "connected" };
      }
      return item;
    }));
  };

  const handleConnect = async (id: string) => {
    const item = integrations.find(i => i.id === id);
    const isConnected = item?.status === "connected";

    if (isConnected) {
      if (!confirm(`Are you sure you want to disconnect ${item?.name}?`)) return;
      try {
        const route = id === "google" ? "/api/integrations/google/auth" : "/api/integrations/facebook/auth";
        await axios.delete(route, { data: { tenantId: "tenant_1" } });
        alert(`${item?.name} disconnected.`);
        window.location.reload();
      } catch (e) {
        alert("Failed to disconnect.");
      }
      return;
    }

    // Connect Logic
    if (id === "google") {
      try {
        const res = await axios.get("/api/integrations/google/auth");
        if (res.data.url) window.location.href = res.data.url;
      } catch (error) {
        alert("Check Google Auth settings");
      }
    } else if (id === "facebook" || id === "instagram") {
      // Check if config exists first
      if (!metaConfig.appId || !metaConfig.appSecret) {
        setShowMetaModal(true);
        return;
      }

      try {
        const res = await axios.get("/api/integrations/facebook/auth?tenantId=tenant_1");
        if (res.data.url) window.location.href = res.data.url;
      } catch (error: any) {
        alert(error.response?.data?.error || "Check Meta Auth settings");
        setShowMetaModal(true);
      }
    } else {
      toggleStatus(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 font-outfit">Platform Settings</h1>
        <p className="text-muted-foreground">Manage your brand integrations and connection status.</p>
      </div>

      {showMetaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold font-outfit mb-2">Meta Developer Setup</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter your Meta App credentials to enable Facebook/Instagram login.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-primary mb-1.5 block">Meta App ID</label>
                <input 
                  type="text" 
                  value={metaConfig.appId}
                  onChange={(e) => setMetaConfig({...metaConfig, appId: e.target.value})}
                  className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Paste App ID here..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-primary mb-1.5 block">Meta App Secret</label>
                <input 
                  type="password" 
                  value={metaConfig.appSecret}
                  onChange={(e) => setMetaConfig({...metaConfig, appSecret: e.target.value})}
                  className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Paste App Secret here..."
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowMetaModal(false)}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-accent hover:bg-accent/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveConfig}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground premium-gradient hover:opacity-90 transition-all"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-8 border-b border-border bg-accent/10">
          <h3 className="text-xl font-bold font-outfit mb-2">Social Integrations</h3>
          <p className="text-sm text-muted-foreground">Connect your brand's social presence to start aggregating feedback.</p>
        </div>
        <div className="divide-y divide-border">
          {integrations.map((item) => (
            <div key={item.id} className="p-8 flex items-center justify-between group hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                  <item.icon className={cn("w-7 h-7", item.color)} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  
                  {item.id === "google" && item.status === "connected" && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                      {isRateLimited && (
                        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-500 text-xs font-bold">
                          <AlertCircle className="w-4 h-4" />
                          Google Quota Exceeded. Retrying in 60s...
                        </div>
                      )}
                      <p className="text-[10px] font-black uppercase text-primary mb-1.5 tracking-wider">Select Active Business</p>
                      <select 
                        value={selectedLoc}
                        onChange={handleLocationChange}
                        disabled={isLoadingLocs}
                        className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none w-full min-w-[240px] appearance-none cursor-pointer"
                      >
                        {isLoadingLocs ? (
                          <option>Loading locations...</option>
                        ) : googleLocations.length > 0 ? (
                          <>
                            <option value="">-- Choose a location --</option>
                            {googleLocations.map((loc: any) => (
                              <option key={loc.locationId} value={loc.locationId}>
                                {loc.locationName}
                              </option>
                            ))}
                          </>
                        ) : (
                          <option>No locations found</option>
                        )}
                      </select>
                    </div>
                  )}

                  {(item.id === "facebook" || item.id === "instagram") && item.status === "connected" && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black uppercase text-primary mb-1.5 tracking-wider">Select Connected Page</p>
                      <select 
                        value={selectedMetaPage}
                        onChange={handleMetaPageChange}
                        disabled={isLoadingMeta}
                        className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none w-full min-w-[240px] appearance-none cursor-pointer"
                      >
                        {isLoadingMeta ? (
                          <option>Loading pages...</option>
                        ) : metaPages.length > 0 ? (
                          <>
                            <option value="">-- Choose a Facebook Page --</option>
                            {metaPages.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.instagramId ? "(with Instagram)" : ""}
                              </option>
                            ))}
                          </>
                        ) : (
                          <option>No pages found</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {item.status === "connected" && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={async () => {
                        const btn = document.activeElement as HTMLButtonElement;
                        const originalText = btn.innerText;
                        btn.innerText = "Syncing...";
                        btn.disabled = true;
                        try {
                          const route = item.id === "google" ? "/api/integrations/google/sync" : "/api/integrations/facebook/sync";
                          await axios.post(route, { tenantId: "tenant_1" });
                          alert("Sync Complete!");
                          window.location.reload();
                        } catch (e: any) {
                          const msg = e.response?.data?.error || e.message;
                          alert(`Sync Failed: ${msg}`);
                        } finally {
                          btn.innerText = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20"
                    >
                      Sync Real Data
                    </button>
                    {(item.id === "facebook" || item.id === "instagram") && (
                      <button 
                        onClick={() => setShowMetaModal(true)}
                        className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:underline"
                      >
                        Edit API Keys
                      </button>
                    )}
                  </div>
                )}
                {item.status === "connected" ? (
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm bg-accent px-3 py-1.5 rounded-full border border-border">
                    <AlertCircle className="w-4 h-4" /> Disconnected
                  </div>
                )}
                <button 
                  onClick={() => handleConnect(item.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all min-w-[140px]",
                    item.status === "connected" 
                      ? "bg-secondary text-secondary-foreground hover:bg-rose-500 hover:text-white" 
                      : "bg-primary text-primary-foreground premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95"
                  )}
                >
                  {item.status === "connected" ? "Disconnect" : "Connect Account"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
