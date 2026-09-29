import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MessageCircle,
  TrendingUp,
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Phone,
  Mail,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axiosInstance";
import { useAuth } from "@/context/AuthContext";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { userData, currentAgent } = useAuth();

  const currentAgentId =
    userData?._id ||
    currentAgent?._id ||
    localStorage.getItem("ost_agent_id");

  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    totalEnquiries: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch scoped properties
      try {
        const propRes = await axiosInstance.get("/property", {
          params: currentAgentId ? { created_by: currentAgentId } : undefined,
        });
        const rawProps =
          propRes.data?.result ||
          propRes.data?.data ||
          (Array.isArray(propRes.data) ? propRes.data : []);
        const allProps = Array.isArray(rawProps) ? rawProps : [];

        // Zero-Trust Agent Scoping:
        const propList = currentAgentId
          ? allProps.filter((p: any) => {
              const ownerId = p.created_by?._id || p.created_by;
              return String(ownerId) === String(currentAgentId);
            })
          : allProps;

        setRecentProperties(propList.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalProperties: propList.length,
          availableProperties: propList.filter(
            (p: any) => p.status === "available"
          ).length,
          soldProperties: propList.filter((p: any) => p.status === "sold").length,
        }));
      } catch (err) {
        console.warn("Could not fetch properties:", err);
      }

      // 2. Fetch scoped enquiries
      try {
        const enqRes = await axiosInstance.get("/enquiry");
        const rawEnqs =
          enqRes.data?.result ||
          enqRes.data?.data ||
          (Array.isArray(enqRes.data) ? enqRes.data : []);
        const allEnqs = Array.isArray(rawEnqs) ? rawEnqs : [];

        // Zero-Trust Enquiry Scoping:
        const enqList = currentAgentId
          ? allEnqs.filter((e: any) => {
              const propObj = Array.isArray(e.property)
                ? e.property[0]
                : e.property;
              const ownerId =
                propObj?.created_by?._id ||
                propObj?.created_by ||
                e.created_by?._id ||
                e.created_by;
              return String(ownerId) === String(currentAgentId);
            })
          : allEnqs;

        setRecentEnquiries(enqList.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalEnquiries: enqList.length,
        }));
      } catch (err) {
        console.warn("Could not fetch enquiries:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentAgentId]);

  const agentName = userData?.name || currentAgent?.name || "Agent";

  return (
    <div className="space-y-8 p-1 sm:p-2 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8a1c1c] via-[#6e131b] to-[#40090e] p-6 sm:p-8 text-white shadow-xl shadow-rose-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Agent Partner Portal
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight">
              Welcome back, {agentName}!
            </h1>
            <p className="text-sm text-white/80 font-medium max-w-xl">
              Track your property listings, manage buyer enquiries, and close deals faster with your dedicated agent workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate("/agent/properties?action=add")}
              className="rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/25 px-5 h-11"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Property
            </Button>
            <Button
              variant="outline"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-md h-11"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Ambient Decorative glow */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Properties */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-200/60">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Portfolio
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">
              {stats.totalProperties}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Total Properties Listed
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/agent/properties"
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              Manage Listings <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Available Properties */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Ready
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">
              {stats.availableProperties}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Active Available Units
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/agent/properties"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              View Active <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Sold Properties */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/60">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Closed
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">
              {stats.soldProperties}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Properties Sold
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Successful Transactions
            </span>
          </div>
        </div>

        {/* Total Enquiries */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/60">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
              Leads
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-heading">
              {stats.totalEnquiries}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Client Enquiries
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/agent/enquiries"
              className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              View Recent Leads <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Properties & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties Preview */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-950 font-heading">
                My Recent Listings
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Latest properties uploaded to your account
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/agent/properties")}
              className="rounded-xl text-xs font-bold"
            >
              View All
            </Button>
          </div>

          {recentProperties.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">
                No properties listed yet
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/agent/properties?action=add")}
                className="mt-3 rounded-xl bg-primary font-bold text-white text-xs"
              >
                + Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((prop) => (
                <div
                  key={prop._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                      {prop.image_url?.[0] ? (
                        <img
                          src={prop.image_url[0]}
                          alt={prop.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-full w-full p-2.5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {prop.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {prop.location?.city || "Chennai"} • ₹
                        {prop.price ? Number(prop.price).toLocaleString("en-IN") : "N/A"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      prop.status === "available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : prop.status === "sold"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {prop.status?.replace(/_/g, " ") || "Available"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enquiries Preview */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-950 font-heading">
                Recent Client Leads
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Latest enquiries for your properties
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/agent/enquiries")}
              className="rounded-xl text-xs font-bold"
            >
              View All
            </Button>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">
                No enquiries received yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                When buyers inquire about your listings, they will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((enq) => (
                <div
                  key={enq._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-black text-xs">
                      {enq.name ? enq.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {enq.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">
                        {enq.mobile || enq.phone || "No phone"} • {enq.property?.name || enq.property_id?.name || enq.propertyName || "General Property"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      enq.status === "contacted"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : enq.status === "closed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}
                  >
                    {enq.status || "New"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
