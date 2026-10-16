import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Map, BookOpen, MessageCircle, Mic, Code2, FolderKanban, Library, BarChart3, Settings, Bot } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

import { useAuth } from "@/lib/auth";

export const NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Learning Roadmap", url: "/roadmap", icon: Map },
  { title: "Courses & Lessons", url: "/courses", icon: BookOpen },
  { title: "AI Tutor", url: "/tutor", icon: MessageCircle },
  { title: "Mock Interviews", url: "/interviews", icon: Mic },
  { title: "Coding Practice", url: "/coding", icon: Code2 },
  { title: "Projects Lab", url: "/projects", icon: FolderKanban },
  { title: "Question Bank", url: "/questions", icon: Library },
  { title: "Progress & Analytics", url: "/progress", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AI";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          {!collapsed && <span className="truncate font-bold">AI Agents Academy</span>}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {NAV.map((n) => {
            const active = n.url === "/" ? path === "/" : path.startsWith(n.url);
            return (
              <SidebarMenuItem key={n.url}>
                <SidebarMenuButton asChild isActive={active} tooltip={n.title}>
                  <Link to={n.url}>
                    <n.icon className="h-4 w-4" />
                    <span>{n.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <Link
            to="/login"
            className="flex items-center gap-2 px-1 py-2 rounded-lg hover:bg-accent/60 transition-colors w-full text-left"
            title="Manage Profile / Sign In"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                  <span className="rounded bg-primary/20 text-primary px-1 py-0.2 text-[9px] font-bold">
                    {user.plan}
                  </span>
                </div>
                <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
              </div>
            )}
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
          >
            <Bot className="h-3.5 w-3.5" />
            {!collapsed && <span>Sign In / Join</span>}
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
