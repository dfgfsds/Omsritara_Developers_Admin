import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export default function AgentProfile() {
  const { userData, currentAgent, logout } = useAuth();

  const name = userData?.name || currentAgent?.name || "Agent";
  const email = userData?.email || currentAgent?.email || "-";
  const mobile = userData?.mobile || currentAgent?.mobile || "-";
  const city = userData?.city || currentAgent?.city || "-";

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-1 sm:p-2 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-1.5">
          <Sparkles className="h-3 w-3 text-amber-600" />
          Partner Details
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading tracking-tight">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          View your agent credentials and account security privileges.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        {/* Banner with gradient */}
        <div className="h-32 bg-gradient-to-r from-[#8a1c1c] via-[#6e131b] to-[#40090e] p-6 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="h-20 w-20 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl ring-4 ring-white shadow-lg">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-14 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-950 font-heading">
                  {name}
                </h2>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-black text-[10px] uppercase">
                  Agent Role
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Authorized Marketing Agent • OST Developers
              </p>
            </div>

            <Button
              variant="outline"
              onClick={logout}
              className="rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 font-bold self-start sm:self-auto text-xs"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Email Address
                </span>
                <p className="text-xs font-black text-slate-800">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Phone Number
                </span>
                <p className="text-xs font-black text-slate-800">{mobile}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Assigned Region
                </span>
                <p className="text-xs font-black text-slate-800">{city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Security Status
                </span>
                <p className="text-xs font-black text-emerald-700">
                  Active & Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Privileges Card */}
      <div className="rounded-3xl bg-amber-50/50 border border-amber-200/80 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-700" />
          <h3 className="font-heading font-black text-slate-900 text-sm">
            Data Isolation & Scoped Security
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Your account is configured with Role-Based Access Control (RBAC). All property listings you create and incoming buyer enquiries are automatically scoped to your agent ID. Confidential administrative tools (such as master user roles and site-wide logs) are securely restricted to the Head Office Administration team.
        </p>
      </div>
    </div>
  );
}
