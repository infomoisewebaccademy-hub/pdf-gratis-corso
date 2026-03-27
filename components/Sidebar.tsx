
import React from 'react';
import { BookOpen, User, Settings, MessageSquare, HelpCircle } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
}

interface SidebarProps {
  activeItem: string;
  onNavigate?: (path: string) => void;
  unreadCount?: number;
  items?: SidebarItem[];
  onItemClick?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, unreadCount = 0, items, onItemClick }) => {
  const defaultMenuItems: SidebarItem[] = [
    { id: 'dashboard', label: 'I miei corsi', icon: BookOpen, path: '/dashboard' },
    { id: 'community', label: 'Chat Community', icon: MessageSquare, path: '/community' },
    { id: 'profile', label: 'Profilo', icon: User, path: '/profile' },
    { id: 'settings', label: 'Impostazioni', icon: Settings, path: '/settings' },
  ];

  const menuItems = items || defaultMenuItems;

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path && onNavigate) {
      onNavigate(item.path);
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  return (
    <aside className="flex lg:flex-col w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 border-gray-100 lg:h-[calc(100vh-80px)] lg:sticky lg:top-20 overflow-x-auto lg:overflow-y-auto z-10 scrollbar-hide">
      <div className="p-4 lg:p-6 flex lg:flex-col gap-2 lg:space-y-2 min-w-max lg:min-w-0">
        <nav className="flex lg:flex-col gap-2 lg:space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const hasNotification = item.id === 'community' && unreadCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
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
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:block mt-auto p-6 border-t border-gray-50">
        <button 
          onClick={() => onNavigate && onNavigate('/support')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <HelpCircle className="h-5 w-5" />
          Supporto
        </button>
      </div>
    </aside>
  );
};
