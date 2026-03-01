import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, UserPlus, ShieldCheck, ArrowRight, CheckCircle2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ADMIN_SECRET = "STELLANTIS@25";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "", password: "", fullName: "",
    role: "worker" as "admin" | "worker", secretKey: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.role === "admin" && signupData.secretKey !== ADMIN_SECRET) {
      toast.error("Invalid secret key.");
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: { full_name: signupData.fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setIsLoading(false);
      toast.error(error.message);
      return;
    }
    if (data.user) {
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id, role: signupData.role,
      });
      if (roleError) console.error("Failed to assign role:", roleError);
    }
    setIsLoading(false);
    toast.success("Account created successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex flex-col items-center justify-between p-6">
      <div /> {/* Spacer */}

      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Brand Identity */}
        <div className="text-center space-y-4">
          <div className="relative inline-block group">
            <div className="absolute -inset-6 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
            <img 
              src="/stellantis-logo.svg" 
              alt="Stellantis" 
              className="h-28 w-auto mx-auto relative drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" 
            />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-gradient leading-tight">
              STELAT Access Center
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
               <div className="h-[1px] w-8 bg-border" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Secure Identity Gateway</p>
               <div className="h-[1px] w-8 bg-border" />
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <Card className="glass-morphism border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full min-h-[460px]">
              <TabsList className="w-full h-14 bg-white/5 p-1 rounded-none border-b border-white/5">
                <TabsTrigger 
                  value="login" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-primary font-black text-xs uppercase tracking-widest gap-2"
                >
                  <Lock className="w-3.5 h-3.5" /> Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-white/10 data-[state=active]:text-primary font-black text-xs uppercase tracking-widest gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="login" className="mt-0 space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Email</Label>
                        <Input 
                          type="email" 
                          placeholder="j.doe@company.com" 
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} 
                          required 
                          className="premium-input h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20" 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">password</Label>
                          <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Reset</Button>
                        </div>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} 
                          required 
                          className="premium-input h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20" 
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                      {isLoading ? "Validating..." : "Authorize Access"} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0 space-y-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Full Name</Label>
                        <Input 
                          placeholder="John Doe" 
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} 
                          required 
                          className="premium-input h-11 bg-white/5 border-white/10 rounded-2xl" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Role</Label>
                        <Select value={signupData.role} onValueChange={(v) => setSignupData({ ...signupData, role: v as "admin" | "worker" })}>
                          <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-morphism rounded-2xl border-white/10">
                            <SelectItem value="worker" className="text-xs font-bold uppercase tracking-widest">Worker</SelectItem>
                            <SelectItem value="admin" className="text-xs font-bold uppercase tracking-widest">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Email Address</Label>
                      <Input 
                        type="email" 
                        placeholder="email@company.com" 
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} 
                        required 
                        className="premium-input h-11 bg-white/5 border-white/10 rounded-2xl" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">password</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} 
                        required 
                        className="premium-input h-11 bg-white/5 border-white/10 rounded-2xl" 
                      />
                    </div>

                    {signupData.role === "admin" && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ml-1 text-primary">
                          <ShieldCheck className="w-3 h-3" /> Admin Auth Key
                        </Label>
                        <Input 
                          type="password" 
                          placeholder="REQUIRED FOR ADMIN" 
                          value={signupData.secretKey}
                          onChange={(e) => setSignupData({ ...signupData, secretKey: e.target.value })} 
                          required 
                          className="premium-input h-11 border-primary/30 bg-primary/5 rounded-2xl placeholder:text-primary/20" 
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full h-13 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black text-xs uppercase tracking-widest transition-all" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Generate Security ID"}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 gap-4 px-4">
          <div className="flex flex-col items-center gap-2 p-3 rounded-3xl bg-white/[0.03] border border-white/[0.05]">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Cloud Secured</p>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-3xl bg-white/[0.03] border border-white/[0.05]">
            <Globe className="w-4 h-4 text-primary" />
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Global Access</p>
          </div>
        </div>
      </div>

      {/* Corporate Footer */}
      <footer className="w-full max-w-sm text-center py-6 border-t border-border/20">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link to="/terms" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors">
            Terms of Use
          </Link>
          <div className="h-1 w-1 rounded-full bg-border" />
          <Link to="/copyright" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors">
            Copyright Notice
          </Link>
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">
          POWERED BY DAVNS INDUSTRIES
        </p>
      </footer>
    </div>
  );
}
