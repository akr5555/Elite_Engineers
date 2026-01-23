import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Settings, 
  LogOut, 
  Code2,
  User,
  Briefcase,
  BarChart3,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "ENGINEER" | "RECRUITER";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const engineerNav = [
    { path: "/engineer-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/engineer-dashboard/profile", label: "My Profile", icon: User },
    { path: "/engineer-dashboard/insights", label: "Insights", icon: BarChart3 },
    { path: "/engineer-dashboard/projects", label: "Projects", icon: FileText },
  ];

  const recruiterNav = [
    { path: "/recruiter-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/recruiter-dashboard/search", label: "Find Engineers", icon: Search },
    { path: "/recruiter-dashboard/pipeline", label: "Pipeline", icon: Briefcase },
    { path: "/recruiter-dashboard/saved", label: "Saved", icon: Users },
  ];

  const navLinks = role === "ENGINEER" ? engineerNav : recruiterNav;
  const isActive = (path: string) => location.pathname === path;

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 size={18} />
            </div>
            <span className="font-bold text-lg">Elite Engineers</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{userEmail}</p>
                <p className="text-xs text-muted-foreground">
                  {(role === "ENGINEER" || role === "engineer") ? "Engineer" : "Recruiter"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {role === "ENGINEER" ? "Engineer Dashboard" : "Recruiter Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium">
              <User size={16} />
              {role === "ENGINEER" ? "Engineer Mode" : "Recruiter Mode"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
