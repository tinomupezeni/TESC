import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Moon, Sun, RotateCw, Search, Bell, User, LogOut, Settings } from "lucide-react"; 
import { useTheme } from "next-themes"; 
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <SidebarProvider>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tiny-jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-tiny-jump:hover {
          animation: tiny-jump 0.4s ease-in-out;
        }
      `}} />

      <div className="min-h-screen flex w-full bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
        <AppSidebar className="border-r border-border" />

        <div className="flex-1 flex flex-col min-w-0 w-full">
          <header className="h-16 flex items-center justify-between px-4 border-b bg-background/95 backdrop-blur shadow-sm sticky top-0 z-10 gap-2 md:gap-4">
            
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="h-9 w-9" />
              <div className="hidden lg:flex items-center gap-2 relative group">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search records..."
                  className="w-48 xl:w-80 pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Refresh Button - Hidden on mobile text */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-9 px-2 md:px-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2"
              >
                <RotateCw className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Refresh</span>
              </Button>

              {/* Theme Switcher - Compact on mobile */}
              <div className="flex items-center gap-2 bg-muted/50 px-2 md:px-3 py-1 rounded-full border border-border/50">
                <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <Switch 
                  size="sm"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'}`} />
              </div>

              {/* Notifications - Hidden on small mobile */}
              <Button variant="ghost" size="icon" className="h-9 w-9 relative hidden xs:flex">
                <Bell className="h-4 w-4" />
                <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center bg-blue-600 text-[10px]">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border/50 overflow-hidden">
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-bold">{user?.first_name} {user?.last_name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user?.role?.name || "Officer"}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20 dark:bg-[#09090b] transition-colors duration-300 w-full overflow-x-hidden">
            <div className="mx-auto max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}