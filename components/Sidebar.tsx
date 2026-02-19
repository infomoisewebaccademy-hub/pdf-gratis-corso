
import React from 'react';
import { BookOpen, User, Settings, GraduationCap, MessageSquare, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, unreadCount = 0 }) => {
  const menuItems = [
    { id: 'my-courses', label: 'I miei corsi', icon: BookOpen, path: '/dashboard' },
    { id: 'community', label: 'Chat Community', icon: MessageSquare, path: '/community' },
    { id: 'profile', label: 'Profilo', icon: User, path: '/profile' },
    { id: 'certificates', label: 'Certificati', icon: GraduationCap, path: '/certificates' },
    { id: 'settings', label: 'Impostazioni', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const hasNotification = item.id === 'community' && unreadCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600 shadow-sm ring-1 ring-brand-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                  {item.label}
                </div>
                
                {hasNotification && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <button 
          onClick={() => onNavigate('/support')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <HelpCircle className="h-5 w-5" />
          Supporto
        </button>
      </div>
    </aside>
  );
};
