"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  MoreVertical, 
  Mail, 
  Activity,
  CheckCircle2,
  Clock,
  X,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Agent" });
  const [submitting, setSubmitting] = useState(false);

  const permissions = [
    { role: "Super Admin", access: "Full System Access", capabilities: ["Manage Billing", "Delete Members", "API Settings", "Reply to Reviews", "Approve AI Replies"] },
    { role: "Moderator", access: "Operational Access", capabilities: ["Edit AI Replies", "Approve AI Replies", "View Analytics", "Reply to Reviews"] },
    { role: "Agent", access: "Limited Access", capabilities: ["View Reviews", "Draft Replies", "Submit for Approval"] },
  ];

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/team?tenantId=tenant_1");
      setMembers(res.data.data);
    } catch (error) {
      console.error("Fetch Team Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/api/team", newMember);
      setIsModalOpen(false);
      setNewMember({ name: "", email: "", role: "Agent" });
      fetchTeam();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to invite member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(`/api/team?id=${id}`);
      fetchTeam();
    } catch (error) {
      alert("Failed to delete member");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-outfit">Team Governance</h1>
          <p className="text-muted-foreground">Manage user roles, permissions, and performance benchmarks.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-2xl text-center">
          <Users className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Members</p>
          <h3 className="text-2xl font-bold">{members.length}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl text-center">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Admins</p>
          <h3 className="text-2xl font-bold">{members.filter(m => m.role.includes("Admin")).length}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl text-center">
          <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Avg Resp Time</p>
          <h3 className="text-2xl font-bold">0.8 hrs</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl text-center">
          <CheckCircle2 className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Approval Rate</p>
          <h3 className="text-2xl font-bold">100%</h3>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-border bg-accent/10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-outfit">Active Members</h3>
            <button 
              onClick={() => setIsPermissionsOpen(true)}
              className="px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold hover:bg-accent transition-colors"
            >
              Role Permissions
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-accent/5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Member</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-center">Replies</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member._id} className="group hover:bg-accent/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-premium-gradient flex items-center justify-center text-white font-bold text-xs uppercase">
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{member.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {member.role === "Super Admin" ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : <ShieldCheck className="w-4 h-4 text-primary" />}
                      <span className="text-sm font-medium">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-semibold">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-bold">{member.repliesCount || 0}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {member.email !== "admin@media360.ai" && (
                      <button 
                        onClick={() => handleDelete(member._id)}
                        className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-accent/10">
              <h3 className="text-xl font-bold font-outfit">Invite New Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                <input 
                  required
                  type="email"
                  placeholder="e.g. john@company.ai"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Role</label>
                <select 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                >
                  <option value="Agent">Agent (Can only reply)</option>
                  <option value="Moderator">Moderator (Can approve/edit)</option>
                  <option value="Super Admin">Admin (Full Access)</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold premium-gradient shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4"
              >
                {submitting ? "Sending Invite..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Modal */}
      {isPermissionsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center bg-accent/10">
              <h3 className="text-xl font-bold font-outfit">Role Permissions Matrix</h3>
              <button onClick={() => setIsPermissionsOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {permissions.map((p) => (
                <div key={p.role} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      {p.role === "Super Admin" ? <ShieldAlert className="w-5 h-5 text-rose-500" /> : <ShieldCheck className="w-5 h-5 text-primary" />}
                      {p.role}
                    </h4>
                    <span className="text-xs font-bold px-2 py-1 bg-accent rounded-lg text-muted-foreground">{p.access}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.capabilities.map((cap) => (
                      <span key={cap} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10">
                        • {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-accent/5 border-t border-border flex justify-end">
              <button 
                onClick={() => setIsPermissionsOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm premium-gradient"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
