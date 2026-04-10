
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  video_storage_path?: string;
  duration?: string;
  isFree?: boolean;
}

export interface Course {
  id:string;
  title: string;
  description: string;
  price: number;
  discounted_price?: number; 
  image: string;
  features: string[];
  lessons: number;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzato';
  videoUrl?: string; 
  lessons_content?: Lesson[]; 
  status?: 'active' | 'full' | 'coming_soon'; 
  is_hidden?: boolean; // NUOVO: Se true, il corso non appare nel catalogo pubblico
  resource_file_url?: string; // NUOVO: URL del file allegato
  resource_file_name?: string; // NUOVO: Nome del file allegato
  rating?: number; // NUOVO: Valutazione in stelle (es. 4.5)
  show_discount_badge?: boolean; // NUOVO: Se mostrare la percentuale di sconto
  upsell_course_id?: string; // NUOVO: ID del corso da upsellare
  show_features?: boolean; // NUOVO: Se mostrare la sezione "Cosa Imparerai"
  additional_benefits?: string[]; // NUOVO: Punti "Cosa avrai in più"
  program_title?: string; // NUOVO: Titolo personalizzato per la sezione lezioni
  has_waiting_list?: boolean; // NUOVO: Se abilitare la lista d'attesa quando il corso è pieno
  show_price_on_home?: boolean; // NUOVO: Se mostrare il prezzo nella home page
  show_if_full_on_home?: boolean; // NUOVO: Se mostrare il corso nella home page quando è pieno
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  purchased_courses: string[]; 
}

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

// Interfaccia per la pagina di Pre-Lancio
export interface PreLaunchConfig {
  headline_solid: string;
  headline_gradient: string;
  subheadline: string;
  description: string;
  offer_badge: string;
  offer_title: string;
  offer_text: string;
  cta_text: string;
  success_title: string;
  success_text: string;
  title_color: string;
  gradient_start: string;
  gradient_end: string;
  button_color: string;
  // Testi
  admin_login_badge_text: string;
  spots_remaining_text: string;
  spots_soldout_text: string;
  spots_taken_text: string;
  soldout_cta_text: string;
  available_cta_text: string;
  form_disclaimer_text: string;
  showcase_section: {
    is_visible: boolean;
    title: string;
    subtitle: string;
    items: ShowcaseItem[];
  };
  admin_login_text: string;
  form_name_placeholder: string;
  form_email_placeholder: string;
  submitting_button_text: string;
  success_priority_title: string;
  success_priority_subtitle: string;
  success_standard_title: string;
  success_standard_subtitle: string;
  // Colori
  bg_color_main: string;
  text_color_body: string;
  accent_color: string;
  error_color: string;
  success_color: string;
  container_bg_color: string;
  container_border_color: string;
  input_bg_color: string;
  pixels?: {
    meta_pixel_id?: string;
    add_to_cart_pixel_id?: string;
    purchase_pixel_id?: string;
    view_content_pixel_id?: string;
    pdf_thank_you_pixel_id?: string;
    purchase_new_user_pixel_id?: string;
    purchase_returning_user_pixel_id?: string;
    general_thank_you_pixel_id?: string;
  };
}

// NUOVA: Interfaccia per la pagina Guida PDF
export interface ShowcaseItem {
  title: string;
  url: string;
  image_url: string;
}

export interface StatItem {
    value: string;
    label: string;
    description: string;
}

export interface StatsSection {
    is_visible: boolean;
    title: string;
    subtitle: string;
    stats: StatItem[];
}

export interface PdfGuideConfig extends PreLaunchConfig {
  guide_pdf_url?: string; 
  form_image_height?: number; // NUOVO: Altezza immagine nel box iscrizione
  showcase_items?: ShowcaseItem[];
  stats_section?: StatsSection;
  testimonials_section?: {
    title: string;
    subtitle: string;
    is_visible: boolean;
    reviews: Array<{
      name: string;
      role: string;
      text: string;
      avatar?: string;
      verified?: boolean;
    }>;
  };
  footer?: {
    text: string;
    copyright: string;
    is_visible: boolean;
    social_links?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
}

// Added LandingPageConfig interface to fix import errors in Home.tsx, AdminDashboard.tsx, Login.tsx, and Footer.tsx
export interface LandingPageConfig {
  announcement_bar: {
    text: string;
    is_visible: boolean;
    is_sticky: boolean;
    type: 'static' | 'marquee';
    bg_color: string;
    text_color: string;
  };
  brand_color?: string;
  bg_color?: string;
  hero: {
    title: string;
    subtitle: string;
    text?: string;
    benefits: string[];
    cta_primary: string;
    cta_secondary: string;
    image_url: string;
    show_badges: boolean;
  };
  ai_era_section?: {
    title: string;
    subtitle: string;
    text: string;
    is_visible: boolean;
  };
  about_section: {
    title: string;
    subtitle: string;
    text: string;
    mission_points: string[];
    image_url: string;
    quote: string;
    quote_author: string;
    quote_author_image?: string;
    quote_author_image_size?: number;
    quote_author_image_offset_x?: number;
    quote_author_image_offset_y?: number;
    quote_author_image_alignment?: string;
    quote_author_image_scale?: number;
    is_visible: boolean;
  };
  features_section: {
    title: string;
    subtitle: string;
    is_visible: boolean;
    cards: Array<{
      icon: string;
      title: string;
      desc: string;
    }>;
  };
  how_it_works_section?: {
    title: string;
    subtitle: string;
    is_visible: boolean;
    steps: Array<{
      title: string;
      desc: string;
      icon: string;
    }>;
  };
  ai_showcase_section?: {
    title: string;
    subtitle: string;
    text: string;
    is_visible: boolean;
    urls: string[];
  };
  comparison_section?: {
    title: string;
    subtitle: string;
    is_visible: boolean;
    before_title: string;
    after_title: string;
    before_items: string[];
    after_items: string[];
  };
  testimonials_section: {
    title: string;
    subtitle: string;
    is_visible: boolean;
    reviews: Array<{
      name: string;
      role: string;
      text: string;
      avatar?: string;
      attachmentUrl?: string;
      verified?: boolean;
    }>;
  };
  usp_section: {
    title: string;
    is_visible: boolean;
    items: Array<{
      title: string;
      desc: string;
    }>;
  };
  cta_section: {
    title: string;
    subtitle: string;
    button_text: string;
    is_visible: boolean;
  };
  footer: {
    text: string;
    copyright: string;
    is_visible: boolean;
    logo_height: number;
    logo_margin_top?: number;
    logo_margin_bottom?: number;
    logo_margin_left?: number;
    logo_margin_right?: number;
    social_links?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  videos?: {
    hero_video_id?: string;
    ai_era_video_id?: string;
    how_it_works_video_id?: string;
    target_section_video_id?: string;
    about_video_url?: string;
  };
}

export interface PlatformSettings {
  id: number;
  logo_url?: string;
  favicon_url?: string;
  logo_height: number;
  logo_offset_x?: number;
  logo_offset_y?: number;
  
  // Pixel Settings
  meta_pixel_id?: string;
  add_to_cart_pixel_id?: string;
  purchase_pixel_id?: string;
  view_content_pixel_id?: string;
  pdf_thank_you_pixel_id?: string;
  purchase_new_user_pixel_id?: string;
  purchase_returning_user_pixel_id?: string;
  general_thank_you_pixel_id?: string;

  pdf_guide_form_image?: string;
  font_family?: string;
  
  active_mode?: 'public' | 'pre_launch' | 'pdf_guide';
  
  pre_launch_date?: string;
  pre_launch_config?: PreLaunchConfig;
  landing_page_config?: LandingPageConfig;
  pdf_guide_config?: PdfGuideConfig;
}

export enum AuthState {
  LOADING,
  AUTHENTICATED,
  UNAUTHENTICATED
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}