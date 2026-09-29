import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Building2, ShieldCheck, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroLogin from "@/assets/hero-login.jpg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login(email, password);
      const isAgentLogin = res?.role === "agent";
      toast({
        title: isAgentLogin ? "Agent Portal Login" : "Admin CRM Login",
        description: isAgentLogin
          ? `Welcome back, ${res.name}! Logged in with Agent scoped access.`
          : `Welcome back, ${res.name || "Administrator"}! Full CRM control enabled.`,
      });
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-12 w-12 text-accent" />
            <h1 className="text-4xl font-bold">Omsritara Developers</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Manage Your Properties with Excellence
          </h2>
          <p className="text-xl text-gray-200 leading-relaxed">
            Streamline your property management workflow with our comprehensive
            dashboard. Track properties, manage enquiries, and grow your business efficiently.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <div className="w-full max-w-md">
          <Card className="shadow-card border-0">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-card-header">
                Welcome Back
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Enter your credentials to access your dashboard
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. admin@omsritara.com or agent@omsritara.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-fast shadow-primary font-bold text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Quick Fill Credentials for Testing */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Demo Credentials
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Click to populate</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@omsritara.com");
                      setPassword("admin123");
                    }}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[11px] font-black text-emerald-800">Admin</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600">Full CRM</span>
                    </div>
                    <p className="text-[10px] text-emerald-700/80 truncate mt-1">admin@omsritara.com</p>
                    <p className="text-[9px] text-emerald-600/70 font-mono mt-0.5">pass: admin123</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail("ramesh.agent@omsritara.com");
                      setPassword("agent123");
                    }}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-[11px] font-black text-amber-800">Agent</span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-600">Scoped</span>
                    </div>
                    <p className="text-[10px] text-amber-700/80 truncate mt-1">ramesh.agent@omsritara.com</p>
                    <p className="text-[9px] text-amber-600/70 font-mono mt-0.5">pass: agent123</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;

