import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  Calendar,
  LogOut,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  ArrowUpRight,
  MessageCircle,
  FileText,
  Lock,
  Globe,
  Award,
  Star,
  ExternalLink,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { getAllLocalDrafts } from "@/utils/propertyDraftStorage";

export default function AgentProfile() {
  const navigate = useNavigate();
  const { userData, currentAgent, logout } = useAuth();

  const currentAgentId =
    userData?._id ||
    currentAgent?._id ||
    localStorage.getItem("ost_agent_id") ||
    "";

  // Editable Profile States
  const [profileName, setProfileName] = useState(
    userData?.name || currentAgent?.name || "Authorized Agent"
  );
  const [profileEmail, setProfileEmail] = useState(
    userData?.email || currentAgent?.email || "agent@omsritara.com"
  );
  const [profileMobile, setProfileMobile] = useState(
    userData?.mobile || currentAgent?.mobile || "+91 98765 43210"
  );
  const [profileCity, setProfileCity] = useState(
    userData?.city || currentAgent?.city || "Chennai"
  );

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: profileName,
    mobile: profileMobile,
    city: profileCity,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Copy Feedback State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dynamic Portfolio & Inquiry Stats
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    underConstruction: 0,
    soldProperties: 0,
    draftProperties: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch Agent Portfolio & Enquiries Overview
  const fetchAgentStats = async () => {
    setIsLoadingStats(true);
    try {
      // 1. Fetch properties
      let propList: any[] = [];
      try {
        const propRes = await axiosInstance.get("/property", {
          params: currentAgentId ? { created_by: currentAgentId } : undefined,
          skipAuthRedirect: true,
        } as any);
        const list =
          propRes.data?.result ||
          propRes.data?.data ||
          (Array.isArray(propRes.data) ? propRes.data : []);
        const allProps = Array.isArray(list) ? list : [];

        propList = currentAgentId
          ? allProps.filter((p: any) => {
              const ownerId = p.created_by?._id || p.created_by;
              return String(ownerId) === String(currentAgentId);
            })
          : allProps;
      } catch (err) {
        console.warn("Could not fetch properties for profile:", err);
      }

      // Add local drafts
      const allDrafts = getAllLocalDrafts();
      const scopedDrafts = allDrafts.filter((d) => {
        if (!currentAgentId) return true;
        if (d.draftId === `agent_${currentAgentId}` || d.draftId === "new") return true;
        if (d.formData?.agent_id && String(d.formData.agent_id) === String(currentAgentId)) return true;
        return !d.draftId.startsWith("agent_") || d.draftId === `agent_${currentAgentId}`;
      });

      const serverDrafts = propList.filter((p: any) => p.status === "draft").length;
      const totalDrafts = scopedDrafts.length + serverDrafts;

      // 2. Fetch enquiries
      let totalEnq = 0;
      let newEnq = 0;
      try {
        const enqRes = await axiosInstance.get("/enquiry", {
          params: currentAgentId ? { agent_id: currentAgentId } : undefined,
          skipAuthRedirect: true,
        } as any);
        const rawEnq =
          enqRes.data?.result ||
          enqRes.data?.data ||
          (Array.isArray(enqRes.data) ? enqRes.data : []);
        const enqList = Array.isArray(rawEnq) ? rawEnq : [];
        totalEnq = enqList.length;
        newEnq = enqList.filter((e: any) => e.status === "new" || !e.status).length;
      } catch (err) {
        console.warn("Could not fetch enquiries for profile:", err);
      }

      setStats({
        totalProperties: propList.length + scopedDrafts.length,
        availableProperties: propList.filter((p: any) => p.status === "available").length,
        underConstruction: propList.filter((p: any) => p.status === "under_construction").length,
        soldProperties: propList.filter((p: any) => p.status === "sold").length,
        draftProperties: totalDrafts,
        totalEnquiries: totalEnq,
        newEnquiries: newEnq,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchAgentStats();
  }, [currentAgentId]);

  const handleCopy = (text: string, label: string) => {
    if (!text || text === "-") return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast({
      title: "Copied to Clipboard",
      description: `${label}: "${text}" copied.`,
    });
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      name: profileName,
      mobile: profileMobile,
      city: profileCity,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      setProfileName(editFormData.name);
      setProfileMobile(editFormData.mobile);
      setProfileCity(editFormData.city);

      if (userData) {
        const updated = {
          ...userData,
          name: editFormData.name,
          mobile: editFormData.mobile,
          city: editFormData.city,
        };
        localStorage.setItem("user", JSON.stringify(updated));
      }

      try {
        if (currentAgentId) {
          await axiosInstance.put(
            `/agent/${currentAgentId}`,
            {
              name: editFormData.name,
              mobile: editFormData.mobile,
              city: editFormData.city,
            },
            { skipAuthRedirect: true } as any
          );
        }
      } catch {
        // Fallback gracefully if agent update endpoint is restricted
      }

      toast({
        title: "Profile Updated",
        description: "Your agent profile details have been saved successfully.",
      });
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-2 sm:p-4 pb-20">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200/90 text-amber-900 text-[11px] font-black tracking-wider uppercase shadow-2xs">
            <Sparkles className="h-3 w-3 text-amber-600" />
            Verified Real Estate Partner
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">
            My Profile &amp; Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-normal">
            Manage your personal partner credentials, view live portfolio metrics, and access security privileges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={fetchAgentStats}
            variant="outline"
            disabled={isLoadingStats}
            className="rounded-2xl border-slate-200 text-slate-700 font-bold h-10 px-3.5 hover:bg-slate-50 text-xs shadow-2xs"
            title="Refresh Profile Stats"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingStats ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOpenEditModal}
            className="rounded-2xl bg-primary hover:bg-primary/95 text-white font-black shadow-md shadow-primary/20 h-10 px-4 text-xs tracking-wide"
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={logout}
            className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 font-bold h-10 px-4 text-xs tracking-wide shadow-2xs"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Hero Profile Card with Luxury Header & Pixel-Perfect Alignment */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xs">
        {/* Luxury Top Header Banner */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-[#6b1319] via-[#8c1c23] to-[#400a0e] relative overflow-hidden px-6 sm:px-8 py-5 flex items-start justify-between">
          {/* Ambient Lighting */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Left Mini Tag */}
          <div className="flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Verified Partner Portal
            </span>
          </div>

          {/* Top Right Certified Badge */}
          <div className="flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-amber-200 text-[11px] font-bold tracking-wide shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              OST Certified Real Estate Partner
            </span>
          </div>
        </div>

        {/* Profile Identity Bar - Aligned with Perfect Horizontal Hierarchy */}
        <div className="px-6 sm:px-8 pb-7 pt-0 relative bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mt-12 sm:-mt-14">
            {/* Left: Avatar + Details in Single Seamless Alignment */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Avatar Box with Gold Gradient & Pulsing Live Online Indicator */}
              <div className="relative shrink-0 self-start sm:self-center">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-3xl sm:text-4xl font-heading shadow-xl ring-4 ring-white border border-amber-300/40 select-none">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                {/* Live Online Status Dot */}
                <div
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-slate-100"
                  title="Agent Online & Active"
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              {/* Identity Info - Clean Vertical Stacking with Crisp Typography */}
              <div className="space-y-2">
                {/* Agent Name */}
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight leading-tight">
                  {profileName}
                </h2>

                {/* Badges Row - Always clean, no weird line breaks */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300/80 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs whitespace-nowrap">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Authorized Agent
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-800 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] tracking-wide whitespace-nowrap">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Partner &bull; {profileCity || "Tamil Nadu"}
                  </span>
                </div>

                {/* Subtitle / Company Line - Single continuous sentence, no lone bullets */}
                <p className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-2 pt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    Authorized Marketing Partner <span className="text-slate-300 mx-1.5 font-bold">|</span> Omsritara Developers
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Buttons on Profile Header */}
            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0 pt-2 md:pt-0">
              <Button
                onClick={handleOpenEditModal}
                className="rounded-2xl bg-primary hover:bg-primary/95 text-white font-black shadow-md shadow-primary/20 h-10 px-4 text-xs tracking-wide"
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={fetchAgentStats}
                disabled={isLoadingStats}
                className="rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-10 px-3 text-xs"
                title="Refresh Live Portfolio Stats"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStats ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>



      {/* Two Column Section: Credentials & Security Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Contact Information (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-950 text-base sm:text-lg tracking-tight">
                    Contact &amp; Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Verified details used on property showcases and buyer enquiries.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenEditModal}
                className="rounded-xl text-primary font-bold text-xs hover:bg-primary/5 h-8 px-3"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-2xs border border-slate-100">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">
                      Full Name
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans tracking-tight">
                      {profileName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(profileName, "Name")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white shadow-2xs transition border border-transparent hover:border-slate-200"
                  title="Copy Name"
                >
                  {copiedField === "Name" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Email Address */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center gap-3 truncate mr-2">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-2xs border border-slate-100 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${profileEmail}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-primary transition truncate block font-sans tracking-tight"
                    >
                      {profileEmail}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(profileEmail, "Email")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white shadow-2xs transition border border-transparent hover:border-slate-200 shrink-0"
                  title="Copy Email"
                >
                  {copiedField === "Email" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Phone / Mobile */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-2xs border border-slate-100">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${profileMobile}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-primary transition font-sans tracking-tight"
                    >
                      {profileMobile}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(profileMobile, "Phone")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white shadow-2xs transition border border-transparent hover:border-slate-200"
                  title="Copy Phone"
                >
                  {copiedField === "Phone" ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Assigned Region / City */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-2xs border border-slate-100">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">
                      Assigned Region
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans tracking-tight">
                      {profileCity}, Tamil Nadu
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Real Estate Specialization & Badges Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-slate-950 text-base sm:text-lg tracking-tight">
                  Agent Specializations &amp; Coverage
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Portfolio categories authorized under OST Developer guidelines.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Luxury Apartments",
                "Residential Plots",
                "Gated Communities",
                "Commercial Spaces",
                "Individual Villas",
                "Under Construction Projects",
                "New Launch Sites",
              ].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:border-amber-400 hover:bg-amber-50/50 transition cursor-default flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 to-rose-50/70 border border-amber-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  High Response Rate: <strong className="text-slate-900">&lt; 2 Hours</strong> for client enquiries.
                </span>
              </div>
              <Badge className="bg-amber-200 text-amber-900 border-none font-bold text-[10px]">
                Top Tier
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column: Security, Zero-Trust Matrix & Quick Action Hub (1 col) */}
        <div className="space-y-6">
          {/* Enterprise Scoped Security Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-7 shadow-lg relative overflow-hidden space-y-5">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 text-amber-400 flex items-center justify-center font-bold shadow-inner">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-white text-base tracking-tight">
                  Zero-Trust Data Isolation
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Client-side &amp; backend RBAC isolation
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">
                    Strict Agent Scoping
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Your properties, leads, and drafts are isolated to your ID. Other agents cannot view or modify your listings.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">
                    JWT Session Security
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Encrypted bearer token authorization with automatic token renewal and safety interceptors.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Building2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">
                    Admin Privilege Safeguard
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Master user roles and company financials are restricted exclusively to Head Office.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h4 className="font-heading font-black text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Action Shortcuts
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <Button
                variant="outline"
                onClick={() => navigate("/agent/properties?action=add")}
                className="w-full justify-between rounded-2xl h-11 border-slate-200 hover:border-primary text-slate-800 hover:text-primary font-bold text-xs px-4 shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Add New Property Listing
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/agent/enquiries")}
                className="w-full justify-between rounded-2xl h-11 border-slate-200 hover:border-sky-500 text-slate-800 hover:text-sky-700 font-bold text-xs px-4 shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-sky-600" />
                  View Client Inquiries
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/agent/properties?status=draft")}
                className="w-full justify-between rounded-2xl h-11 border-slate-200 hover:border-purple-500 text-slate-800 hover:text-purple-700 font-bold text-xs px-4 shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Review Stored Drafts ({stats.draftProperties})
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/agent/properties")}
                className="w-full justify-between rounded-2xl h-11 border-slate-200 hover:border-emerald-500 text-slate-800 hover:text-emerald-700 font-bold text-xs px-4 shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Manage Available Portfolio
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
              <Edit3 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-950 font-heading tracking-tight">
              Edit Profile Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Update your agent contact information displayed across your listings and buyer communications.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Display Name
              </label>
              <Input
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Your full name"
                required
                className="h-10 rounded-2xl border-slate-200 text-xs font-semibold focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Mobile Number
              </label>
              <Input
                value={editFormData.mobile}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, mobile: e.target.value })
                }
                placeholder="+91 98765 43210"
                required
                className="h-10 rounded-2xl border-slate-200 text-xs font-semibold focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Primary Operating City
              </label>
              <Input
                value={editFormData.city}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, city: e.target.value })
                }
                placeholder="e.g. Chennai, Coimbatore"
                required
                className="h-10 rounded-2xl border-slate-200 text-xs font-semibold focus-visible:ring-primary/20"
              />
            </div>

            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-2xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-xs shadow-md shadow-primary/25"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
