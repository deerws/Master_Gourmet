import BottomNavigation from "./bottom-navigation";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden shadow-2xl">
      {/* Status Bar */}
      <div className="bg-gradient-to-r from-golden to-dark-red h-6 flex items-center justify-between px-4 text-white text-xs font-medium">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <i className="fas fa-signal text-xs"></i>
          <i className="fas fa-wifi text-xs"></i>
          <i className="fas fa-battery-three-quarters text-xs"></i>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
