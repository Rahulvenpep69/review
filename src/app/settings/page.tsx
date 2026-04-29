"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Settings2, 
  Globe, 
  Camera, 
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState([
    {
      id: "facebook",
      name: "Facebook Pages",
      description: "Monitor comments and reviews on your FB posts.",
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      status: "disconnected",
    },
    {
      id: "instagram",
      name: "Instagram Business",
      description: "Engage with Reel and Post comments automatically.",
      icon: <Camera className="w-6 h-6 text-pink-500" />,
      status: "disconnected",
    },
    {
      id: "tiktok",
      name: "TikTok Business",
      description: "Track mentions and comments on your TikTok videos.",
      icon: <MessageCircle className="w-6 h-6 text-rose-500" />,
      status: "disconnected",
    },
  ]);

  const [isLoadingLocs, setIsLoadingLocs] = useState(false);
  const [googleLocations, setGoogleLocations] = useState<any[]>([]);
  const [selectedLoc, setSelectedLoc] = useState("");

  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [metaPages, setMetaPages] = useState<any[]>([]);
  const [selectedMetaPage, setSelectedMetaPage] = useState("");
  const [selectedInstagram, setSelectedInstagram] = useState("");

  const fetchLocations = async () => {
    setIsLoadingLocs(true);
    try {
      const res = await axios.get("/api/integrations/google/locations?tenantId=tenant_1");
      const locs = res.data.locations || [];
      setGoogleLocations(locs);
      setSelectedLoc(res.data.selectedLocationId || "");
      
      const isConnected = locs.length > 0 || res.data.isCached;
      setIntegrations(prev => prev.map(item => 
        item.id === "google" ? { ...item, status: isConnected ? "connected" : "disconnected" } : item
      ));
    } catch (e) {
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
      setSelectedInstagram(res.data.selectedInstagramId || "");
      
      const isConnected = res.data.connected;
      setIntegrations(prev => prev.map(item => 
        (item.id === "facebook" || item.id === "instagram") 
          ? { ...item, status: isConnected ? "connected" : "disconnected" } 
          : item
      ));
    } catch (e) { console.error(e); } finally { setIsLoadingMeta(false); }
  };

  const handleMetaSelect = async (type: "facebook" | "instagram", value: string) => {
    try {
      const payload: any = { tenantId: "tenant_1" };
      if (type === "facebook") {
        payload.pageId = value;
        payload.instagramId = selectedInstagram;
      } else {
        payload.pageId = selectedMetaPage;
        payload.instagramId = value;
      }

      await axios.post("/api/integrations/facebook/pages", payload);
      if (type === "facebook") setSelectedMetaPage(value);
      else setSelectedInstagram(value);
      
      alert(`${type === "facebook" ? "Facebook Page" : "Instagram Account"} updated!`);
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

    if (id === "facebook" || id === "instagram") {
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

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowMetaModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-border hover:bg-accent transition-all font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveConfig}
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground premium-gradient font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">
        <div className="divide-y divide-border">
          {integrations.map((item) => (
            <div key={item.id} className="p-8 flex items-center justify-between hover:bg-accent/10 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-outfit mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  
                  {item.id === "facebook" && item.status === "connected" && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black uppercase text-primary mb-1.5 tracking-wider">Select Facebook Page</p>
                      <select 
                        value={selectedMetaPage}
                        onChange={(e) => handleMetaSelect("facebook", e.target.value)}
                        className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none w-full min-w-[240px]"
                      >
                        <option value="">-- Choose Page --</option>
                        {metaPages.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {item.id === "instagram" && item.status === "connected" && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black uppercase text-primary mb-1.5 tracking-wider">Select Instagram Account</p>
                      <select 
                        value={selectedInstagram}
                        onChange={(e) => handleMetaSelect("instagram", e.target.value)}
                        className="bg-accent/50 border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none w-full min-w-[240px]"
                      >
                        <option value="">-- Choose Account --</option>
                        {metaPages.filter(p => p.instagramId).map(p => (
                          <option key={p.instagramId} value={p.instagramId}>{p.name} (Instagram)</option>
                        ))}
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
                        try {
                          const route = "/api/integrations/facebook/sync";
                          const res = await axios.post(route, { tenantId: "tenant_1", platform: item.id });
                          const debugInfo = res.data.debug ? JSON.stringify(res.data.debug) : "";
                          alert(`Sync Complete! Found ${res.data.count} items.\nStatus: FB(${res.data.fbStatus}) IG(${res.data.igStatus})\nDebug: ${debugInfo}`);
                          window.location.reload();
                        } catch (e: any) {
                          alert(`Sync Failed: ${e.response?.data?.error || e.message}`);
                        }
                      }}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20"
                    >
                      Sync Real Data
                    </button>
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
