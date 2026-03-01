import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Shield } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 lg:p-24 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="gap-2 -ml-4 hover:bg-primary/10 rounded-full transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient">Terms & Conditions</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            LAST UPDATED: MARCH 2026 · STELLANTIS ATTENDANCE SYSTEM
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">1. Acceptance of Terms</h2>
            <p className="text-sm">
              By accessing and using the Stellantis Attendance Tracker, you agree to be bound by these terms. This system is designed for official internal use only.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">2. User Conduct</h2>
            <p className="text-sm">
              Authorized users must provide accurate attendance data. Any attempt to manipulate records through unauthorized access or API spoofing is strictly prohibited and may result in disciplinary action.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">3. Data Privacy</h2>
            <p className="text-sm">
              Stellantis values your privacy. Attendance data is collected solely for payroll, scheduling, and operational efficiency. Data is stored securely in accordance with corporate data protection policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">4. Limitation of Liability</h2>
            <p className="text-sm">
              While we strive for 100% uptime, Stellantis is not liable for system outages. Manual attendance logs should be maintained as a fallback during maintenance windows.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-border/40">
           <p className="text-[10px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
             © 2026 STELLANTIS · ALL RIGHTS RESERVED
           </p>
        </div>
      </div>
    </div>
  );
}
