
import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { LandingPageConfig } from '../types';

interface FooterProps {
  config: LandingPageConfig['footer'];
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  if (!config.is_visible) return null;

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 text-sm font-sans text-slate-400 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                
                {/* Brand */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                            <img 
                            src="https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png" 
                            alt="MWA Logo" 
                            style={{ 
                                height: `${config.logo_height || 40}px`,
                                marginTop: `${config.logo_margin_top || 0}px`,
                                marginBottom: `${config.logo_margin_bottom || 0}px`,
                                marginLeft: `${config.logo_margin_left || 0}px`,
                                marginRight: `${config.logo_margin_right || 0}px`,
                            }}
                            className="w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-white text-base">Piattaforma sviluppata da</p>
                        <p className="text-brand-400 font-bold text-lg">Moise Web Srl</p>
                    </div>
                    <p className="text-xs text-slate-500 font-mono bg-white/5 inline-block px-2 py-1 rounded">P.IVA: RO50469659</p>
                    
                    <div className="flex gap-4 mt-4">
                        {config.social_links?.facebook && (
                            <a href={config.social_links.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-brand-600 hover:text-white transition-all"><Facebook className="h-4 w-4" /></a>
                        )}
                        {config.social_links?.instagram && (
                            <a href={config.social_links.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-brand-600 hover:text-white transition-all"><Instagram className="h-4 w-4" /></a>
                        )}
                        {config.social_links?.linkedin && (
                            <a href={config.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-brand-600 hover:text-white transition-all"><Linkedin className="h-4 w-4" /></a>
                        )}
                        {config.social_links?.youtube && (
                            <a href={config.social_links.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-brand-600 hover:text-white transition-all"><Youtube className="h-4 w-4" /></a>
                        )}
                    </div>
                </div>

                {/* Sedi Operative */}
                <div>
                    <h3 className="font-bold text-white text-lg mb-6">Sedi Operative</h3>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-3 group">
                            <div className="bg-white/5 p-2 rounded-lg text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <MapPin className="w-5 h-5 shrink-0" />
                            </div>
                            <div>
                                <span className="block font-bold text-slate-200 mb-1">1. Sede Legale</span>
                                <span className="text-slate-500">București (RO)</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 group">
                            <div className="bg-white/5 p-2 rounded-lg text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <MapPin className="w-5 h-5 shrink-0" />
                            </div>
                            <div>
                                <span className="block font-bold text-slate-200 mb-1">2. Sede Secondaria</span>
                                <span className="text-slate-500">Bergamo (BG)</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Contatti */}
                <div>
                    <h3 className="font-bold text-white text-lg mb-6">Contatti</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                            <a href="tel:+393473127082" className="hover:text-brand-400 transition-colors font-medium">+39 347 312 7082</a>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                            <a href="tel:+393772334192" className="hover:text-brand-400 transition-colors font-medium">+39 377 233 4192</a>
                        </li>
                        <li className="flex items-center gap-3 pt-2">
                            <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                            <a href="mailto:info@mwacademy.eu" className="hover:text-brand-400 transition-colors break-all">info.moisewebaccademy@gmail.com</a>
                        </li>
                    </ul>
                </div>

                {/* Supporto */}
                <div>
                    <h3 className="font-bold text-white text-lg mb-6">Link Utili</h3>
                    <ul className="space-y-3">
                        <li><a href="#" className="hover:text-brand-400 transition-colors">Tutti i Corsi</a></li>
                        <li><a href="#" className="hover:text-brand-400 transition-colors">Chi Siamo</a></li>
                        <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-brand-400 transition-colors">Termini & Condizioni</a></li>
                        <li><a href="#" className="hover:text-brand-400 transition-colors">Cookie Policy</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-600 text-xs">
                    &copy; {new Date().getFullYear()} Moise Web Academy. Tutti i diritti riservati.
                </p>
                <div className="flex gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                    <svg className="h-8" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35 0H3C1.3 0 0 1.3 0 3V21C0 22.7 1.3 24 3 24H35C36.7 24 38 22.7 38 21V3C38 1.3 36.7 0 35 0Z" fill="#2563EB"/><path d="M12.5 10.5H16.5" stroke="white" strokeWidth="2"/><path d="M21.5 10.5H25.5" stroke="white" strokeWidth="2"/><circle cx="8" cy="12" r="3" fill="white" opacity="0.5"/><text x="14" y="16" fill="white" fontSize="8" fontWeight="bold">VISA</text></svg>
                    <svg className="h-8" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35 0H3C1.3 0 0 1.3 0 3V21C0 22.7 1.3 24 3 24H35C36.7 24 38 22.7 38 21V3C38 1.3 36.7 0 35 0Z" fill="#111"/><circle cx="13" cy="12" r="6" fill="#EB001B"/><circle cx="25" cy="12" r="6" fill="#F79E1B" fillOpacity="0.8"/></svg>
                    <svg className="h-8" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M35 0H3C1.3 0 0 1.3 0 3V21C0 22.7 1.3 24 3 24H35C36.7 24 38 22.7 38 21V3C38 1.3 36.7 0 35 0Z" fill="white" stroke="#E5E7EB"/><path d="M10 7.5L14 7.5L12 17.5" fill="#253B80"/><path d="M22 7.5H18L16 17.5H19L22 7.5Z" fill="#179BD7"/><text x="24" y="16" fill="#253B80" fontSize="8" fontWeight="bold">PayPal</text></svg>
                </div>
            </div>
        </div>
    </footer>
  );
};
