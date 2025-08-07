import { useLocation } from "wouter";
import { Home, Search, Grid3x3, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { 
      path: "/", 
      icon: Home, 
      label: "Início", 
      testId: "nav-home"
    },
    { 
      path: "/search", 
      icon: Search, 
      label: "Buscar", 
      testId: "nav-search"
    },
    { 
      path: "/categories", 
      icon: Grid3x3, 
      label: "Categorias", 
      testId: "nav-categories"
    },
    { 
      path: "/profile", 
      icon: User, 
      label: "Perfil", 
      testId: "nav-profile"
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 h-auto p-2 ${
                isActive 
                  ? "text-golden" 
                  : "text-gray-400 hover:text-golden"
              }`}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
