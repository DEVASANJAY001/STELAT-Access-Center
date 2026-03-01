import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copyright as CopyrightIcon } from "lucide-react";

export default function Copyright() {
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
              <CopyrightIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient">Copyright Info</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            INTELLECTUAL PROPERTY NOTICE · 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Ownership</h2>
            <p className="text-sm">
              All content, including source code, design elements, graphics, and system architecture of the Stellantis Attendance Tracker, are the exclusive property of Stellantis and its development partners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Trademarks</h2>
            <p className="text-sm">
              The Stellantis name, logo, and branding are registered trademarks. Unauthorized use is a violation of intellectual property laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest">Development Credits</h2>
            <p className="text-sm">
              This application was expertly developed by <strong>DAVNS INDUSTRIES</strong>. All rights relating to the implementation logic and proprietary UI components are reserved.
            </p>
          </section>
        </div>

        <div className="pt-12 border-t border-border/40">
           <p className="text-xs text-center font-black tracking-tighter text-muted-foreground/40">
             V2.4.0 · STELAT-CORP-SYS
           </p>
        </div>
      </div>
    </div>
  );
}
