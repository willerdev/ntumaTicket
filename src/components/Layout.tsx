import { Outlet, NavLink } from "react-router-dom";
import { Home, ScanLine, Ticket, User, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Layout = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container max-w-lg mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary">
            Ntuma<span className="text-foreground">Ticket</span>
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-lg mx-auto p-4 pb-20">
        <Outlet />
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="container max-w-lg mx-auto">
          <div className="flex justify-around py-3">
            <NavItem to="/home" icon={<Home size={24} />} label="Home" />
            <NavItem to="/scan" icon={<ScanLine size={24} />} label="Scan" />
            <NavItem to="/my-tickets" icon={<Ticket size={24} />} label="Tickets" />
            <NavItem to="/account" icon={<User size={24} />} label="Account" />
          </div>
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center space-y-1 text-sm ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();
    
    // Subscribe to notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'notifications' 
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={() => navigate('/notifications')}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default Layout;