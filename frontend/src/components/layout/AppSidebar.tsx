import { useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  BarChart3,
  Lightbulb,
  Factory,
  FileText,
  Settings,
  HelpCircle,
  School,
  MapPin,
  LogOut,
  User,
  Building2,
  Rocket,
  GraduationCap,
  Wallet,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { tesc_logo } from "./logo";

const mainNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Institutions", url: "/institutions", icon: Building },
  { title: "Student Records", url: "/students", icon: GraduationCap },
  { title: "Staff Records", url: "/staff", icon: User },
  { title: "Statistics", url: "/statistics", icon: BarChart3 },
  { title: "Graduation Records", url: "/graduates", icon: GraduationCap },
];

const dataCategories = [
  { title: "Facilities & Capacity", url: "/facilities", icon: School },
  { title: "Innovation", url: "/innovation", icon: Lightbulb },
  { title: "Commercialisation", url: "/industrialisation", icon: Factory },
  { title: "Incubation Hubs", url: "/hubs", icon: Building2 },
  { title: "Startups", url: "/startups", icon: Rocket },
  { title: "Regional Analysis", url: "/regional", icon: MapPin },
];

const admissionsCategory = [
  { title: "Admissions Dashboard", url: "/admissions", icon: GraduationCap },
  { title: "Dropout Analysis", url: "/admissions/dropouts", icon: UserX },
  { title: "Special Enrollments", url: "/admissions/special", icon: User },
 
];

const systemItems = [
  
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const userPermissions = user?.department?.permissions || [];
  const userLevel = user?.level;

  const filterLinks = (items: any[]) => {
    if (userLevel === "1") return items;
    return items.filter((item) => {
      if (["/dashboard", "/help", "/settings"].includes(item.url)) return true;
      return userPermissions.includes(item.url);
    });
  };

  return (
    <Sidebar className={`border-r border-slate-200 dark:border-slate-800 ${isCollapsed ? "w-14" : "w-64"}`}>
      <SidebarContent className="bg-white dark:bg-[#0c0c0e]">
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-muted/20">
          {!isCollapsed ? (
            <div className="flex items-center">
              <img src={tesc_logo} className="w-10 mr-3" alt="TESC Logo" />
              <div>
                <h1 className="text-sm font-black text-blue-700 dark:text-blue-400 leading-none">TESC SRS</h1>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase mt-1">Data Systems</p>
              </div>
            </div>
          ) : (
            <div className="text-blue-700 dark:text-blue-400 font-black text-xl text-center">T</div>
          )}
        </div>

        {[
          { label: "Main", items: filterLinks(mainNavigation) },
          { label: "Data Categories", items: filterLinks(dataCategories) },
          { label: "Analysis", items: filterLinks(admissionsCategory) },
          { label: "System", items: filterLinks(systemItems) },
        ].map(
          (group) =>
            group.items.length > 0 && (
              <SidebarGroup key={group.label} className="py-2">
                <SidebarGroupLabel className="text-blue-800 dark:text-blue-400 font-black text-[11px] px-4 mb-2 uppercase tracking-widest !opacity-100">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-2 gap-1">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            className={`
                              w-full font-bold transition-all duration-200
                              ${isActive 
                                ? "!bg-primary !text-white" 
                                : "!text-slate-900 dark:!text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10"
                              }
                            `}
                          >
                            <NavLink to={item.url} end={item.url === "/dashboard"}>
                              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "!text-white" : "text-blue-700 dark:text-blue-400"}`} />
                              {!isCollapsed && <span className="text-[13px]">{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
        )}
      </SidebarContent>

      {user && (
        <div className={`p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 ${isCollapsed ? "flex justify-center" : ""}`}>
          {!isCollapsed ? (
            <>
              <div className="mb-3">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                  Level {user.level} Access
                </p>
              </div>
              <Button onClick={logout} className="w-full h-10 font-black shadow-lg uppercase tracking-wider" variant="destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </>
          ) : (
            <Button onClick={logout} size="icon" variant="destructive" className="h-10 w-10 shadow-xl rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </Sidebar>
  );
}