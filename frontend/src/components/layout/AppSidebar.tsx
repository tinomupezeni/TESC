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
  LogOut, // Import LogOut icon
  User, // Import User icon for the profile footer
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
import { useAuth } from "@/contexts/AuthContext"; // 🚨 Import useAuth
import { tesc_logo } from "./logo";

// --- 1. Navigation Item Definitions ---
// Define all possible links and their required departments for access control
const mainNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, access: [] },
  {
    title: "Institutions",
    url: "/institutions",
    icon: Building,
    access: [
      "Registration of Schools/Institutions",
      "Executive Administration",
    ],
  },
  {
    title: "Student Records",
    url: "/students",
    icon: GraduationCap,
    access: [
      "Admissions",
      "Human Resources (Lecturers)",
      "Executive Administration",
    ],
  },
  {
    title: "Statistics",
    url: "/statistics",
    icon: BarChart3,
    access: ["Monitoring and Evaluation", "Accounts and Admin"],
  },
];

const dataCategories = [
  {
    title: "Facilities & Capacity",
    url: "/facilities",
    icon: School,
    access: ["Sporting Facilities", "Accounts and Admin"],
  },
  {
    title: "Innovation",
    url: "/innovation",
    icon: Lightbulb,
    access: ["Innovation and Industrialisation"],
  },
  {
    title: "Industrialisation",
    url: "/industrialisation",
    icon: Factory,
    access: ["Innovation and Industrialisation"],
  },
  {
    title: "Incubation Hubs",
    url: "/hubs",
    icon: Building2,
    access: ["Innovation and Industrialisation"],
  },
  {
    title: "Startups",
    url: "/startups",
    icon: Rocket,
    access: ["Innovation and Industrialisation"],
  },
  {
    title: "Regional Analysis",
    url: "/regional",
    icon: MapPin,
    access: [
      "Registration of Schools/Institutions",
      "Executive Administration",
    ],
  },
];

const admissionsCategory = [
  {
    title: "Admissions Dashboard",
    url: "/admissions",
    icon: GraduationCap,
    access: ["Admissions", "Executive Administration"],
  },
  {
    title: "Dropout Analysis",
    url: "/admissions/dropouts",
    icon: UserX,
    access: ["Admissions", "Monitoring and Evaluation"],
  },
  {
    title: "Special Enrollments",
    url: "/admissions/special",
    icon: User,
    access: ["Admissions"],
  },
  {
    title: "Payments & Fees",
    url: "/admissions/fees",
    icon: Wallet,
    access: ["Admissions", "Accounts and Admin"],
  },
];

const systemItems = [
  { title: "Reports", url: "/reports", icon: FileText, access: ["All"] },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    access: ["Superuser", "Executive Administration", "IT"],
  },
  { title: "Help", url: "/help", icon: HelpCircle, access: ["All"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth(); // 🚨 Get user and logout function
  const location = useLocation();

  console.log(user);

  const isCollapsed = state === "collapsed";
  const userDepartmentName = user?.department?.name || "";
  const userRoleName = user?.role?.name || "";
  const userLevel = user?.level;

  // Helper to determine active link styling
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-black font-medium" : "hover:bg-muted";

  /**
   * Filters navigation items based on the user's role and department.
   */
  const filterLinks = (items: typeof mainNavigation) => {
    // Superusers (Level 1) or specific high-level roles get full access
    if (userLevel === "1" || userRoleName === "Superuser") {
      return items;
    }

    return items.filter((item) => {
      const allowed = item.access;

      if (allowed.includes("All")) {
        return true;
      }

      // Check if the user's department or role is in the allowed list
      return (
        allowed.includes(userDepartmentName) || allowed.includes(userRoleName)
      );
    });
  };

  // Apply the filter to each navigation group
  const filteredMainNavigation = filterLinks(mainNavigation);
  const filteredDataCategories = filterLinks(dataCategories);
  const filteredSystemItems = filterLinks(systemItems);
  const filteredAdmissionsCategory = filterLinks(admissionsCategory);

  console.log(user);

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Logo and Title */}
        <div className="p-4 border-b">
          {!isCollapsed ? (
            <div className="flex items-center">
              <img src={tesc_logo} className="w-16 mr-4" alt="TESC Logo" />
              <div>
                <h1 className="text-lg font-bold text-primary">TESC SRS</h1>
                <p className="text-xs text-muted-foreground">
                  Student Records & Statistics
                </p>
              </div>
            </div>
          ) : (
            <div className="text-primary font-bold text-xl text-center">T</div>
          )}
        </div>

        {/* Main Navigation (Conditional Rendering) */}
        {filteredMainNavigation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMainNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Data Categories (Conditional Rendering) */}
        {filteredDataCategories.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Data Categories</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredDataCategories.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredAdmissionsCategory.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Analysis</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdmissionsCategory.map(
                  (item) =>
                    // Note: We skip the 'Log out' item here and handle it in the footer
                    item.title !== "Log out" && (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {/* System (Conditional Rendering) */}
        {filteredSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystemItems.map(
                  (item) =>
                    // Note: We skip the 'Log out' item here and handle it in the footer
                    item.title !== "Log out" && (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* 🚨 User Details and Logout Footer */}
      {user && !isCollapsed && (
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold truncate">
              {user.first_name} {user.last_name}
            </span>
          </div>
          <div className="text-xs font-bold text-muted-foreground mb-3 leading-tight">
            {user.department?.name}
          </div>
          <Button onClick={logout} className="w-full" variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      )}
      {/* 🚨 Collapsed view logout button */}
      {user && isCollapsed && (
        <div className="p-2 border-t bg-muted/20">
          <Button
            onClick={logout}
            size="icon"
            className="w-full"
            variant="destructive"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Sidebar>
  );
}
