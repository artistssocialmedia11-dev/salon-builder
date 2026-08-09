export interface SalonService {
  id: string;
  name: string;
  price: string;
  desc: string;
  duration?: string;
  img?: string;
  category?: string;
  hidden?: boolean;
  onlineBooking?: boolean;
  isFeatured?: boolean;
  showPrice?: boolean;
  status?: 'available' | 'unavailable' | 'hidden';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  img?: string;
  experience?: string;
  rating?: number;
  instagram?: string;
  portfolioUrl?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  text: string;
  avatarUrl?: string;
  rating?: number;
  date?: string;
}

export interface HomepageSection {
  id: string;
  label: string;
  enabled: boolean;
}

export interface BusinessHourDay {
  day: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface HolidayClosure {
  id: string;
  name: string;
  date: string;
}

export interface WebsiteConfig {
  shopName: string;
  subdomain: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily: "sans" | "serif" | "mono";
  headingFont?: string;
  bodyFont?: string;
  buttonStyle?: "sharp" | "rounded" | "pill";
  layoutStyle?: "luxury" | "modern" | "compact" | "showcase";
  cardStyle?: "flat" | "elevated" | "glass" | "luxury";
  headerLayout?: "center" | "left" | "split";
  menuStyle?: "standard" | "floating" | "sticky";
  footerBgColor?: string;
  footerTextColor?: string;
  footerStyle?: "simple" | "modern" | "luxury";
  animations?: {
    hover: boolean;
    scroll: boolean;
    fade: boolean;
    glow: boolean;
  };
  themeMode?: "dark" | "light" | "auto";
  showServicePrices?: boolean;
  showServiceImages?: boolean;
  showServiceDuration?: boolean;
  showStaffPhotos?: boolean;
  showStaffExperience?: boolean;
  showStaffRatings?: boolean;
  galleryLayout?: "grid" | "masonry";
  galleryImagesPerRow?: 2 | 3 | 4;
  showReviewStars?: boolean;
  showReviewCustomerNames?: boolean;
  showReviewDate?: boolean;
  showContactAddress?: boolean;
  showContactPhone?: boolean;
  showContactWhatsApp?: boolean;
  showContactMaps?: boolean;
  showAnnouncementBar?: boolean;
  announcementText?: string;
  announcementRedirectUrl?: string;
  logo: string;
  banner: string;
  phone: string;
  whatsapp: string;
  address: string;
  landmark?: string;
  googleMapUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  pinterestUrl?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  heroHeadline?: string;
  heroSubHeadline?: string;
  heroCtaText?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  sections: HomepageSection[];
  services: SalonService[];
  team: TeamMember[];
  testimonials: Testimonial[];
  gallery: string[];
  galleryMetadata?: Record<string, { alt?: string; caption?: string }>;
  galleryNarrative?: string;
  businessHours?: BusinessHourDay[];
  holidayClosures?: HolidayClosure[];
  bookingConfig?: BookingSlotConfig;
  appointments?: SimulatedAppointment[];
}

export interface BookingSlotConfig {
  interval: number; // e.g. 15, 30, 45, 60
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  enabledDays: string[]; // ["Monday", "Tuesday", etc]
  blockedSlots?: Record<string, string[]>; // "YYYY-MM-DD" -> ["09:00", "09:30"]
  minimumNoticeHours?: number; // e.g. 0, 1, 2, 4, 12, 24
}

export interface SimulatedAppointment {
  id: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string; // YYYY-MM-DD
  time: string; // "09:00"
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  createdAt: string;
}

