import React, { useEffect, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Star,
  User,
  FolderGit2,
  Check,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PropertyFormData } from "../types";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";

interface TabOwnershipStatusProps {
  formData: PropertyFormData;
  handleInputChange: (field: keyof PropertyFormData, value: any) => void;
}

export const TabOwnershipStatus: React.FC<TabOwnershipStatusProps> = ({
  formData,
  handleInputChange,
}) => {
  const { isAgent, currentAgent, userData } = useAuth();
  const isCurrentUserAgent =
    isAgent ||
    window.location.pathname.startsWith("/agent") ||
    String(userData?.roleType || "").toUpperCase() === "AGENT" ||
    String((userData?.role as any)?.name || "").toUpperCase() === "AGENT" ||
    String(userData?.role || "").toUpperCase() === "AGENT" ||
    Boolean(localStorage.getItem("ost_agent_id"));

  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Fetch real registered agents from backend for Admin selector ONLY
  useEffect(() => {
    // Agents NEVER need to call /user
    if (isCurrentUserAgent) {
      return;
    }

    let isMounted = true;
    const fetchLiveAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const res = await axiosInstance.get("/user?role=agent", {
          skipAuthRedirect: true,
        } as any);
        const list =
          res.data?.result ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);

        let mapped: any[] = [];
        if (Array.isArray(list) && list.length > 0) {
          mapped = list.map((u: any) => ({
            _id: u._id,
            name: u.name || "Agent",
            email: u.email || "",
            mobile: u.mobile || "",
            city: u.city || "Tamil Nadu",
          }));
        } else {
          const allRes = await axiosInstance.get("/user", {
            skipAuthRedirect: true,
          } as any);
          const allList =
            allRes.data?.result ||
            allRes.data?.data ||
            (Array.isArray(allRes.data) ? allRes.data : []);
          const filtered = allList.filter((u: any) => {
            const roleStr = String(
              u.roleType ||
              (typeof u.role === "object" ? u.role?.name : u.role) ||
              ""
            ).toUpperCase();
            return roleStr.includes("AGENT");
          });
          mapped = filtered.map((u: any) => ({
            _id: u._id,
            name: u.name || "Agent",
            email: u.email || "",
            mobile: u.mobile || "",
            city: u.city || "Tamil Nadu",
          }));
        }

        if (isMounted) {
          setAgentsList(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch live agents:", err);
        if (isMounted) {
          setAgentsList([]);
        }
      } finally {
        if (isMounted) setIsLoadingAgents(false);
      }
    };

    fetchLiveAgents();
    return () => {
      isMounted = false;
    };
  }, [isCurrentUserAgent]);

  // If logged in as an Agent, ensure developer_name and agent_id reflect the agent
  useEffect(() => {
    if (isCurrentUserAgent) {
      const myName = currentAgent?.name || userData?.name;
      const myId = currentAgent?._id || userData?._id || localStorage.getItem("ost_agent_id");
      if (myName && !formData.developer_name?.startsWith("Agent: ")) {
        handleInputChange("developer_name", `Agent: ${myName}`);
      }
      if (myId && !formData.agent_id) {
        handleInputChange("agent_id", myId);
      }
    }
  }, [isCurrentUserAgent, currentAgent, userData]);

  return (
    <div className="space-y-6">
      {/* Agent Attribution Card */}
      <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 p-5 md:p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 shadow-xs">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Real Estate Agent</h3>
              <p className="text-xs text-slate-500">
                {isCurrentUserAgent
                  ? "Property will be verified and listed under your official agent portfolio"
                  : "Link this property to a registered Agent or publish as Company Direct"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 border border-amber-200">
            Agent Attribution
          </span>
        </div>

        {isCurrentUserAgent ? (
          /* Agent Self-Attribution Card (Locked to logged-in Agent) */
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                {(currentAgent?.name || userData?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {currentAgent?.name || userData?.name || "Agent Listing"}
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0 h-4">
                    ✓ Verified Agent
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentAgent?.email || userData?.email || "Partner Agent"} • {currentAgent?.mobile || userData?.mobile || "Tamil Nadu"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                Auto-Attributed to Your Portfolio
              </span>
            </div>
          </div>
        ) : (
          /* Admin View: Dynamic Select with Live Database Agents */
          <div className="space-y-2">
            <div className="relative">
              <select
                value={
                  formData.agent_id ||
                  (formData.developer_name?.startsWith("Agent: ")
                    ? (() => {
                        const name = formData.developer_name.replace("Agent: ", "").trim();
                        const match = agentsList.find((a) => a.name === name);
                        return match?._id || "";
                      })()
                    : "")
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const match = agentsList.find((a) => a._id === val || a.name === val);
                    const agentName = match?.name || val;
                    const agentId = match?._id || val;
                    handleInputChange("developer_name", `Agent: ${agentName}`);
                    handleInputChange("agent_id", agentId);
                  } else {
                    handleInputChange("developer_name", "Omsritara Developers");
                    handleInputChange("agent_id", "");
                  }
                }}
                disabled={isLoadingAgents}
                className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none shadow-xs disabled:opacity-70"
              >
                <option value="">🏢 Company Direct / Admin Listing</option>
                {agentsList.map((ag) => (
                  <option key={ag._id} value={ag._id}>
                    👤 Agent: {ag.name} ({ag.mobile ? `${ag.mobile} • ` : ""}{ag.city || "Tamil Nadu"})
                  </option>
                ))}
              </select>
              {isLoadingAgents && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                {isLoadingAgents
                  ? "Loading registered agents from database..."
                  : `${agentsList.length} registered agent(s) available`}
              </span>
              <span className="font-semibold text-amber-700">
                Live Backend Sync
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Ownership & Builder Information Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ownership & Builder Attribution</h3>
            <p className="text-xs text-slate-500">
              Developer details, project title, and owner contact assignment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Owner Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-400" /> Owner / Seller Name
            </label>
            <Input
              value={formData.owner_name}
              onChange={(e) => handleInputChange("owner_name", e.target.value)}
              placeholder="e.g. R. Sundaram"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Developer Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-slate-400" /> Developer / Builder
            </label>
            <Input
              value={formData.developer_name}
              onChange={(e) => handleInputChange("developer_name", e.target.value)}
              placeholder="e.g. Omsritara Developers"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <FolderGit2 className="h-3.5 w-3.5 text-slate-400" /> Project / Community Name
            </label>
            <Input
              value={formData.project_name}
              onChange={(e) => handleInputChange("project_name", e.target.value)}
              placeholder="e.g. Phase 2 Grandeur"
              className="h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-900 shadow-xs focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Property Availability Status Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Publishing Availability & Badges</h3>
            <p className="text-xs text-slate-500">
              Listing availability status, homepage spotlight, and legal verification
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* 3 Interactive Status Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Current Property Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  value: "available",
                  title: "Available",
                  badge: "Open for Booking",
                  desc: "Visible to public buyers; accepting visit requests and calls.",
                  activeClasses:
                    "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs",
                  badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300/60",
                },
                {
                  value: "under_construction",
                  title: "Under Construction",
                  badge: "In Progress",
                  desc: "Ongoing civil work; booking for early bird possession.",
                  activeClasses:
                    "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs",
                  badgeClass: "bg-amber-100 text-amber-800 border border-amber-300/60",
                },
                {
                  value: "sold",
                  title: "Sold Out",
                  badge: "Deal Closed",
                  desc: "Purchased or leased; preserved in portfolio showcase.",
                  activeClasses:
                    "border-slate-500 bg-slate-100 ring-2 ring-slate-400/20 shadow-xs",
                  badgeClass: "bg-slate-200 text-slate-800 border border-slate-300/60",
                },
              ].map((item) => {
                const isSelected = formData.status === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleInputChange("status", item.value)}
                    className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:scale-[1.01] ${
                      isSelected
                        ? item.activeClasses
                        : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                    {isSelected && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                        <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured & Verified Sleek Switch Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
            {/* Featured Showcase Card */}
            <div
              onClick={() => handleInputChange("isFeatured", !formData.isFeatured)}
              className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 select-none ${
                formData.isFeatured
                  ? "border-amber-400 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white shadow-xs ring-1 ring-amber-400/30"
                  : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    formData.isFeatured
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                  }`}
                >
                  <Star className={`h-5 w-5 ${formData.isFeatured ? "fill-white" : ""}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Featured Showcase</span>
                    {formData.isFeatured && (
                      <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-300/60 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                    Highlight in home carousel & top search results
                  </p>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(val) => handleInputChange("isFeatured", val)}
                  className="data-[state=checked]:bg-amber-500 shrink-0 ml-3"
                />
              </div>
            </div>

            {/* Verified Listing Card */}
            <div
              onClick={() => handleInputChange("isVerified", !formData.isVerified)}
              className={`group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 select-none ${
                formData.isVerified
                  ? "border-emerald-400 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white shadow-xs ring-1 ring-emerald-400/30"
                  : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    formData.isVerified
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Verified Listing</span>
                    {formData.isVerified && (
                      <span className="inline-flex items-center rounded-md bg-emerald-100 border border-emerald-300/60 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                    Display official green verified trust badge to buyers
                  </p>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={formData.isVerified}
                  onCheckedChange={(val) => handleInputChange("isVerified", val)}
                  className="data-[state=checked]:bg-emerald-600 shrink-0 ml-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
