
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { LogOut, LayoutDashboard, User, Settings, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  logoUrl?: string;
  logoSize: number;
  logoOffsetX?: number;
  logoOffsetY?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, logoUrl, logoSize, logoOffsetX = 0, logoOffsetY = 0 }) => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    onNavigate(path);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    onLogout();
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const finalLogoUrl = logoUrl || "https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png";

  return (
    <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* --- LEFT SECTION --- */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <div 
                className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
                style={{ transform: `translateX(${logoOffsetX}px) translateY(${logoOffsetY}px)` }}
                onClick={() => handleNavigate('/')}
            >
                <img 
                src={finalLogoUrl} 
                alt="MWA Logo" 
                style={{ height: `${logoSize}px` }} 
                className="w-auto object-contain brightness-0 invert"
                />
            </div>
            {/* Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
                <button 
                  onClick={() => handleNavigate('/')} 
                  className="text-slate-300 hover:text-brand-400 font-medium transition-colors text-sm uppercase tracking-wide"
                >
                  Home
                </button>
                <button 
                    onClick={() => handleNavigate('/courses')} 
                    className="text-slate-300 hover:text-brand-400 font-medium transition-colors text-sm uppercase tracking-wide"
                  >
                    Percorsi
                </button>
            </div>
          </div>

          {/* --- RIGHT SECTION (Actions) --- */}
          <div className="flex items-center">
             {/* Desktop Actions */}
             <div className="hidden lg:flex items-center gap-6">
                <button 
                    onClick={() => handleNavigate('/cart')}
                    className="relative p-2 text-slate-300 hover:text-brand-400 transition-colors group"
                    title="Carrello"
                >
                    <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white bg-brand-600 rounded-full border-2 border-slate-900">
                        {totalItems}
                        </span>
                    )}
                </button>

                {/* User Menu (Desktop) */}
                <div className="relative" ref={userMenuRef}>
                    {user ? (
                        <div>
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 focus:outline-none group"
                            >
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{user.full_name || 'Studente'}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-400 border border-slate-700 shadow-sm group-hover:ring-2 group-hover:ring-brand-500/50 transition-all">
                                    <User className="h-5 w-5" />
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-slate-900 rounded-xl shadow-2xl border border-white/10 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Account</p>
                                        <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                    </div>

                                    {user.is_admin && (
                                        <>
                                            <button onClick={() => handleNavigate('/admin')} className="w-full text-left px-4 py-2.5 text-sm text-brand-400 hover:bg-white/5 flex items-center font-semibold transition-colors">
                                                <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
                                            </button>
                                            <div className="h-px bg-white/5 my-1 mx-2"></div>
                                        </>
                                    )}
                                    <button onClick={() => handleNavigate('/dashboard')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-brand-400 flex items-center transition-colors">
                                        <LayoutDashboard className="h-4 w-4 mr-2" /> I Miei Percorsi
                                    </button>
                                    <button onClick={() => handleNavigate('/cart')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-brand-400 flex items-center transition-colors">
                                        <ShoppingCart className="h-4 w-4 mr-2" /> Carrello ({totalItems})
                                    </button>
                                    <div className="h-px bg-white/5 my-1 mx-2"></div>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors">
                                        <LogOut className="h-4 w-4 mr-2" /> Esci
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleNavigate('/login')}
                                className="text-slate-300 hover:text-brand-400 font-medium text-sm transition-colors"
                            >
                                Accedi
                            </button>
                            <button 
                                onClick={() => handleNavigate('/register')}
                                className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all shadow-lg shadow-white/10 transform hover:-translate-y-0.5"
                            >
                                Inizia Ora
                            </button>
                        </div>
                    )}
                </div>
             </div>

            {/* Mobile Toggle */}
            <div className="flex lg:hidden items-center gap-4">
                <button 
                  onClick={() => handleNavigate('/cart')}
                  className="relative p-2 text-slate-300"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold leading-none text-white bg-brand-600 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-slate-300 p-2 rounded-md hover:bg-white/5 focus:outline-none"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-white/5 absolute w-full left-0 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto z-40 animate-in slide-in-from-top-2">
            <div className="px-4 py-6 space-y-4">
                <button onClick={() => handleNavigate('/')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 font-medium border border-transparent hover:border-white/10 transition-all">Home</button>
                <button onClick={() => handleNavigate('/courses')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 font-medium border border-transparent hover:border-white/10 transition-all">Percorsi</button>
                
                <div className="border-t border-white/5 my-2"></div>
                
                {user ? (
                    <>
                        <div className="px-4 py-2 bg-white/5 rounded-lg mx-2 mb-2">
                            <p className="text-sm font-bold text-white">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                         {user.is_admin && (
                            <button onClick={() => handleNavigate('/admin')} className="w-full text-left px-4 py-3 rounded-lg bg-brand-900/20 text-brand-400 font-medium flex items-center">
                                <Settings className="h-4 w-4 mr-2" /> Pannello Admin
                            </button>
                        )}
                        <button onClick={() => handleNavigate('/dashboard')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 font-medium flex items-center">
                            <LayoutDashboard className="h-4 w-4 mr-2" /> I Miei Percorsi
                        </button>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 font-medium flex items-center">
                            <LogOut className="h-4 w-4 mr-2" /> Esci
                        </button>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-4 px-4 pt-2">
                        <button onClick={() => handleNavigate('/login')} className="w-full py-3 rounded-lg font-bold text-slate-300 border border-white/10 hover:bg-white/5">Accedi</button>
                        <button onClick={() => handleNavigate('/register')} className="w-full py-3 rounded-lg font-bold text-slate-900 bg-white shadow-lg">Registrati</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};