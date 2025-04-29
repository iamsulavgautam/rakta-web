
import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  DropletIcon, 
  HomeIcon, 
  LogOut, 
  Menu, 
  MessageCircle, 
  Users, 
  X 
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', icon: <HomeIcon className="h-5 w-5" />, path: '/' },
    { name: 'Donors', icon: <Users className="h-5 w-5" />, path: '/donors' },
    { name: 'Blood Groups', icon: <DropletIcon className="h-5 w-5" />, path: '/blood-groups' },
    { name: 'Campaigns', icon: <Calendar className="h-5 w-5" />, path: '/campaigns' },
    { name: 'Messages', icon: <MessageCircle className="h-5 w-5" />, path: '/messages' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center">
            <DropletIcon className="h-8 w-8 text-rakta-600" />
            <span className="ml-2 text-xl font-semibold">
              <span className="text-rakta-600">Rakta</span> Admin
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md text-sm ${
                isActive(item.path) 
                  ? "bg-rakta-50 text-rakta-600 font-medium" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-4 bg-white">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="lg:hidden flex-1 flex justify-center">
            <h1 className="text-lg font-semibold text-gray-900">
              <span className="text-rakta-600">Rakta</span> Admin
            </h1>
          </div>
          <div className="hidden lg:block">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
