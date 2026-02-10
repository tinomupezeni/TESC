import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Moon, Sun, RotateCw } from "lucide-react"; 
import { useTheme } from "next-themes"; 
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <SidebarProvider>
      {/* Custom Style for the jumping animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tiny-jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-tiny-jump:hover {
          animation: tiny-jump 0.4s ease-in-out;
        }
      `}} />

      <div className="min-h-screen flex w-screen bg-background text-foreground transition-colors duration-300">
        <AppSidebar className="border-r border-border" />

        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header spacing reduced via pr-4 and gap-3 */}
          <header className="h-16 flex items-center justify-end pr-4 border-b bg-background/95 backdrop-blur shadow-sm gap-3">
            
            {/* --- REFRESH BUTTON --- */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="
                flex items-center gap-2 font-bold transition-all shadow-md px-5 py-2
                border-blue-500/50 shadow-blue-500/10 
                hover:border-blue-400 hover:shadow-blue-400/30 
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                animate-tiny-jump
              "
            >
              <RotateCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline text-blue-700 dark:text-blue-300">Refresh Data</span>
            </Button>

            {/* --- THEME SLIDER GROUP --- */}
            <div className="
              flex items-center gap-4 bg-muted/50 px-5 py-2 rounded-full 
              border border-blue-500/50 shadow-md shadow-blue-500/10
              hover:shadow-blue-400/30 transition-all animate-tiny-jump
            ">
              <div className="flex items-center gap-3">
                <Sun className={`h-5 w-5 transition-all ${theme === 'light' ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'text-muted-foreground'}`} />
                <Switch 
                  id="theme-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Moon className={`h-5 w-5 transition-all ${theme === 'dark' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 p-6 md:p-8 bg-muted/20 dark:bg-[#09090b] transition-colors duration-300 w-full">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}