import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Building,
  Users,
  BarChart3,
  Lightbulb,
  Factory,
  FileText,
  Settings,
  HelpCircle,
  School,
  MapPin,
} from "lucide-react";

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
import { coat_of_arms } from "./logo";

const mainNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Institutions", url: "/institutions", icon: Building },
  { title: "Student Records", url: "/students", icon: GraduationCap },
  { title: "Statistics", url: "/statistics", icon: BarChart3 },
];

const dataCategories = [
  { title: "Facilities & Capacity", url: "/facilities", icon: School },
  { title: "Innovation Department", url: "/innovation", icon: Lightbulb },
  { title: "Industrialisation", url: "/industrialisation", icon: Factory },
  { title: "Regional Analysis", url: "/regional", icon: MapPin },
];

const systemItems = [
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-black font-medium" : "hover:bg-muted";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Logo and Title */}
        <div className="p-4 border-b">
          {!isCollapsed ? (
            <div className="flex">
              <img src={coat_of_arms} className="w-16"/>
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

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
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

        {/* Data Categories */}
        <SidebarGroup>
          <SidebarGroupLabel>Data Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataCategories.map((item) => (
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

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
