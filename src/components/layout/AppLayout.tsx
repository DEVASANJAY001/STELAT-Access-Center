import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileHeader />
      <div className="watermark-top-right">
        TA20024-DEVASANJAY / TA43792-NEMALESH
      </div>
      <main className="md:ml-56 p-3 md:p-5 lg:p-6 mt-12 md:mt-0 pb-20 md:pb-6 max-w-7xl">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
