import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Check,
  Loader2,
  Share2,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Facebook,
  Instagram,
  Hand,
  Youtube,
  Twitter,
  Globe,
  Upload,
  Download,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Save,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkle,
  AlertTriangle,
  Info,
  Copy,
  Palette,
  X,
  Settings, Crop, Edit2,
  Scissors,
  Eye,
  EyeOff,
  Zap,
  Clock,
  LayoutGrid
} from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { ServicesManagementPanel } from "./components/ServicesManagementPanel";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { ImageCropperModal } from "./components/ImageCropperModal";
import { VoiceRecorder } from "./components/VoiceRecorder";
import { WebsiteConfig, SalonService, TeamMember, Testimonial, HomepageSection } from "./types";

/* ------------------------------------------------------------------ */
/*  CONTRAST RATIO & WCAG COLOR UTILITIES                             */
/* ------------------------------------------------------------------ */

function getRelativeLuminance(color: string): number {
  let hex = color.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  if (hex.length !== 6) {
    return 0;
  }
  
  const rVal = parseInt(hex.substring(0, 2), 16);
  const gVal = parseInt(hex.substring(2, 4), 16);
  const bVal = parseInt(hex.substring(4, 6), 16);

  if (isNaN(rVal) || isNaN(gVal) || isNaN(bVal)) {
    return 0;
  }

  const r = rVal / 255;
  const g = gVal / 255;
  const b = bVal / 255;

  const rLum = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLum = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLum = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
}

function getContrastRatio(colorA: string, colorB: string): number {
  const lumA = getRelativeLuminance(colorA);
  const lumB = getRelativeLuminance(colorB);

  const brightest = Math.max(lumA, lumB);
  const darkest = Math.min(lumA, lumB);

  return (brightest + 0.05) / (darkest + 0.05);
}

/* ------------------------------------------------------------------ */
/*  INDIAN MOBILE & SUBDOMAIN UTILITIES                               */
/* ------------------------------------------------------------------ */

function cleanAndFormatIndianNumber(val: string): string {
  // Strip non-digits
  const digits = val.replace(/\D/g, "");
  // Max 10 digits
  const max10 = digits.substring(0, 10);
  if (max10.length <= 5) {
    return max10;
  }
  return `${max10.slice(0, 5)} ${max10.slice(5)}`;
}

function validateSubdomain(sub: string) {
  if (!sub) return { state: "error", msg: "Subdomain cannot be empty." };
  if (/[A-Z]/.test(sub)) {
    return { state: "error", msg: "Capital letters are disallowed." };
  }
  if (/\s/.test(sub)) {
    return { state: "error", msg: "Spaces are disallowed." };
  }
  if (/[^a-z0-9-]/.test(sub)) {
    return { state: "error", msg: "Special characters are disallowed." };
  }
  if (sub.length < 3) {
    return { state: "warning", msg: "Subdomain is too short (min 3 characters)." };
  }
  // Simulated taken check for glamourcuts/taken/styles/royal/nexora/salon
  if (["taken", "glamourcuts", "royal", "styles", "nexora", "salon"].includes(sub.toLowerCase())) {
    return { state: "error", msg: `✗ subdomain "${sub}" already taken` };
  }
  return { state: "success", msg: `✓ ${sub}.nexorasalonos.com available` };
}

/* ------------------------------------------------------------------ */
/*  INITIAL PRESETS AND FALLBACKS                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_CONFIG: WebsiteConfig = {
  shopName: "Nexora Hair & Lounge",
  subdomain: "nexora-lounge",
  tagline: "High-Fashion Hair Styling & Botanical Luxury Scalp Rituals",
  primaryColor: "#D4AF37",
  secondaryColor: "#111111",
  buttonColor: "#D4AF37",
  accentColor: "#D4AF37",
  backgroundColor: "#111111",
  textColor: "#FFFFFF",
  fontFamily: "serif",
  headingFont: "Playfair Display",
  bodyFont: "Inter",
  buttonStyle: "rounded",
  layoutStyle: "luxury",
  cardStyle: "elevated",
  headerLayout: "left",
  menuStyle: "sticky",
  footerStyle: "modern",
  footerBgColor: "#0A0A0A",
  footerTextColor: "#FFFFFF",
  animations: {
    hover: true,
    scroll: true,
    fade: true,
    glow: true,
    smoothScroll: true
  },
  themeMode: "dark",
  showServicePrices: true,
  showServiceImages: true,
  showServiceDuration: true,
  showStaffPhotos: true,
  showStaffExperience: true,
  showStaffRatings: true,
  galleryLayout: "grid",
  galleryImagesPerRow: 3,
  showReviewStars: true,
  showReviewCustomerNames: true,
  showReviewDate: true,
  showContactAddress: true,
  showContactPhone: true,
  showContactWhatsApp: true,
  showContactMaps: true,
  showAnnouncementBar: false,
  announcementText: "Book Online & Skip Waiting — Luxury Styling Awaits",
  announcementRedirectUrl: "",
  logo: "",
  banner: "",
  phone: "98765 43210",
  whatsapp: "98765 43210",
  address: "102, Link Road, Bandra West, Mumbai, Maharashtra 400050",
  landmark: "Near Grand Mall",
  googleMapUrl: "https://maps.google.com",
  facebookUrl: "https://facebook.com/nexorasalon",
  instagramUrl: "https://instagram.com/nexorasalon",
  youtubeUrl: "https://youtube.com/nexorasalon",
  twitterUrl: "",
  tiktokUrl: "",
  pinterestUrl: "",
  metaTitle: "Nexora Hair & Lounge | West Hollywood Master Styling",
  metaDescription: "Experience bespoke color formulations, luxury balayage designs, and scalp detox treatments inside West Hollywood's premier botanical retreat.",
  keywords: "salon, hair stylist, balayage, botanical hair, west hollywood hair",
  heroHeadline: "The Art of Hair Architecture",
  heroSubHeadline: "Redefining contemporary luxury through bespoke botanical care and precision styling.",
  heroCtaText: "Book Appointment",
  aboutTitle: "Our Philosophical Narrative",
  aboutDescription: "We believe that hair is the purest form of wearable art. Our master artisans combine ancient botanical wisdom with modern chemical precision to ensure every strand thrives in both health and style.",
  sections: [
    { id: "hero", label: "Hero Banner", enabled: true },
    { id: "about", label: "About Narrative", enabled: true },
    { id: "services", label: "Our Services", enabled: true },
    { id: "team", label: "Meet the Team", enabled: true },
    { id: "testimonials", label: "What Clients Say", enabled: true },
    { id: "gallery", label: "Style Portfolio", enabled: true },
    { id: "contact", label: "Find & Connect", enabled: true }
  ],
  services: [
    {
      id: "s1",
      name: "Couture Balayage & Glaze",
      price: "$280+",
      desc: "Individually hand-painted dimensions custom-tailored to complement your natural features, sealed with a high-gloss botanical treatment.",
      duration: "180 min",
      img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&auto=format&fit=crop&q=80",
      category: "Hair",
      hidden: false,
      onlineBooking: true
    },
    {
      id: "s2",
      name: "Botanical Oil Scalp Ritual",
      price: "$145",
      desc: "An intensive amino-acid treatment coupled with a dynamic warm jade roller massage to stimulate follicular health and ultimate shine.",
      duration: "60 min",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80",
      category: "Spa",
      hidden: false,
      onlineBooking: true
    },
    {
      id: "s3",
      name: "Precision Silhouette Cut",
      price: "$120+",
      desc: "A signature dry cutting experience configured to enhance natural bounce, including a raw honey lather wash and smooth velvet blowout.",
      duration: "75 min",
      img: "https://images.unsplash.com/photo-1605497746444-17ddcc7e1276?w=400&auto=format&fit=crop&q=80",
      category: "Hair",
      hidden: false,
      onlineBooking: true
    }
  ],
  team: [
    {
      id: "t1",
      name: "Elena Rostova",
      role: "Founder & Creative Director",
      bio: "Over 14 years specializing in Parisian hand-painted highlights and high-contrast blonde architectural contouring.",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      experience: "14 Years",
      rating: 5,
      instagram: "@elena.rostova",
      portfolioUrl: "https://rostova-design.example.com"
    },
    {
      id: "t2",
      name: "Julian Sterling",
      role: "Elite Scalp Therapist",
      bio: "An advocate of organic microcrystalline therapies, championing natural follicle restoration and customized conditioning plans.",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      experience: "8 Years",
      rating: 4,
      instagram: "@julian.scalp",
      portfolioUrl: ""
    }
  ],
  testimonials: [
    {
      id: "tm1",
      author: "Catherine Chevalier",
      text: "Nexora is in a league of its own. My balayage feels so dimensional, soft, and alive. Elena takes her craft to an absolute art form!",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "tm2",
      author: "Dorian Vance",
      text: "The scalp massage is worth every single dollar. An absolute oasis of premium hospitality tucked directly in West Hollywood.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ],
  gallery: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1605497746444-17ddcc7e1276?w=500&auto=format&fit=crop&q=80"
  ],
  galleryNarrative: "A curation of our finest hair artistry, editorial color contours, and bespoke styles designed dynamically to celebrate your pure individuality.",
  galleryMetadata: {
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80": {
      alt: "Sophisticated golden blonde hair balayage",
      caption: "Rich, dimensional honey balayage paired with beachwave contouring"
    },
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=80": {
      alt: "Precision botanical hair cleansing wash",
      caption: "Intense botanical conditioning therapy coupled with microcrystalline head acupressure"
    },
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80": {
      alt: "Classic luxury salon styling chair space",
      caption: "Our private bespoke styling suite where Parisian hair dreams materialize"
    },
    "https://images.unsplash.com/photo-1605497746444-17ddcc7e1276?w=500&auto=format&fit=crop&q=80": {
      alt: "Textured rich caramel brunette locks",
      caption: "Warm copper brunette dimensional highlights for effortless elegant volume"
    }
  },
  businessHours: [
    { day: "Monday", openTime: "09:00", closeTime: "18:00", closed: false },
    { day: "Tuesday", openTime: "09:00", closeTime: "18:00", closed: false },
    { day: "Wednesday", openTime: "09:00", closeTime: "18:00", closed: false },
    { day: "Thursday", openTime: "09:00", closeTime: "20:00", closed: false },
    { day: "Friday", openTime: "09:00", closeTime: "20:00", closed: false },
    { day: "Saturday", openTime: "09:00", closeTime: "17:00", closed: false },
    { day: "Sunday", openTime: "10:00", closeTime: "16:00", closed: true }
  ],
  holidayClosures: [
    { id: "h1", name: "New Year's Day", date: "2026-01-01" },
    { id: "h2", name: "Independence Day", date: "2026-07-04" },
    { id: "h3", name: "Christmas Day", date: "2026-12-25" }
  ],
  bookingConfig: {
    interval: 30,
    startTime: "09:00",
    endTime: "18:00",
    enabledDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    blockedSlots: {},
    minimumNoticeHours: 2
  },
  appointments: [
    {
      id: "a1",
      serviceId: "s1",
      serviceName: "Couture Balayage & Glaze",
      staffId: "t1",
      staffName: "Elena Rostova",
      date: "2026-06-15",
      time: "10:30 AM",
      clientName: "Sofia Loren",
      clientPhone: "98765 11111",
      clientNotes: "Wants premium honey shade",
      createdAt: "2026-06-05T03:58:33Z"
    },
    {
      id: "a2",
      serviceId: "s2",
      serviceName: "Botanical Oil Scalp Ritual",
      staffId: "t2",
      staffName: "Julian Sterling",
      date: "2026-06-16",
      time: "02:00 PM",
      clientName: "Isabella Cruz",
      clientPhone: "98765 22222",
      clientNotes: "First-time visitor",
      createdAt: "2026-06-05T03:59:12Z"
    }
  ]
};

const HelpTooltip = ({ text }: { text: string }) => {
  return (
    <div className="group relative inline-flex items-center ml-1.5 align-middle">
      <div className="w-3.5 h-3.5 rounded-full bg-white/[0.1] text-gray-400 hover:text-white flex items-center justify-center text-[9px] font-bold cursor-help transition-colors border border-white/[0.05]">
        ?
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 border border-white/10 text-[10px] text-stone-300 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center leading-relaxed">
        {text}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stone-900" />
      </div>
    </div>
  );
};

// Utility to extract colors from an image using canvas
const extractColorsFromImage = (file: File): Promise<{ dominant: string, palette: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject("No canvas context");
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const colorCounts: { [key: string]: number } = {};
          let maxCount = 0;
          let dominantRGB = { r: 0, g: 0, b: 0 };
          
          const step = Math.max(4, Math.ceil(imageData.length / 4 / 2000) * 4); 
          
          for (let i = 0; i < imageData.length; i += step) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];
            
            if (a < 128) continue; 
            
            const qr = Math.floor(r / 16) * 16;
            const qg = Math.floor(g / 16) * 16;
            const qb = Math.floor(b / 16) * 16;
            
            const rgbString = `${qr},${qg},${qb}`;
            colorCounts[rgbString] = (colorCounts[rgbString] || 0) + 1;
            
            if (colorCounts[rgbString] > maxCount) {
              maxCount = colorCounts[rgbString];
              dominantRGB = { r, g, b }; 
            }
          }
          
          const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
          
          const dominantHex = rgbToHex(dominantRGB.r, dominantRGB.g, dominantRGB.b);
          
          const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
          const palette = sortedColors.slice(0, 5).map(c => {
            const [r, g, b] = c[0].split(',').map(Number);
            return rgbToHex(r, g, b);
          });
          
          resolve({ dominant: dominantHex, palette: palette });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function App() {
  // Config states
  const [siteConfig, setSiteConfig] = useState<WebsiteConfig>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let sharedStateStr = searchParams.get("shared") || searchParams.get("config");
      
      if (!sharedStateStr && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        sharedStateStr = hashParams.get("shared") || hashParams.get("config");
      }

      if (sharedStateStr) {
        const decoded = decodeURIComponent(escape(atob(sharedStateStr)));
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed === "object") {
          if (!parsed.accentColor) parsed.accentColor = parsed.primaryColor || DEFAULT_CONFIG.primaryColor;
          if (!parsed.backgroundColor) parsed.backgroundColor = parsed.secondaryColor || DEFAULT_CONFIG.secondaryColor;
          if (!parsed.textColor) parsed.textColor = "#FFFFFF";
          if (!parsed.headingFont) parsed.headingFont = "Playfair Display";
          if (!parsed.bodyFont) parsed.bodyFont = "Inter";
          if (!parsed.buttonStyle) parsed.buttonStyle = "rounded";
          if (!parsed.layoutStyle) parsed.layoutStyle = "luxury";
          if (!parsed.cardStyle) parsed.cardStyle = "elevated";
          if (!parsed.headerLayout) parsed.headerLayout = "left";
          if (!parsed.menuStyle) parsed.menuStyle = "sticky";
          if (!parsed.footerStyle) parsed.footerStyle = "modern";
          if (!parsed.themeMode) parsed.themeMode = "dark";
          if (!parsed.animations) parsed.animations = DEFAULT_CONFIG.animations;
          if (!parsed.showServicePrices) parsed.showServicePrices = true;
          if (!parsed.showServiceImages) parsed.showServiceImages = true;
          if (!parsed.showServiceDuration) parsed.showServiceDuration = true;
          if (!parsed.showStaffPhotos) parsed.showStaffPhotos = true;
          if (!parsed.showStaffExperience) parsed.showStaffExperience = true;
          if (!parsed.showStaffRatings) parsed.showStaffRatings = true;
          if (!parsed.galleryLayout) parsed.galleryLayout = "grid";
          if (!parsed.galleryImagesPerRow) parsed.galleryImagesPerRow = 3;
          if (!parsed.showReviewStars) parsed.showReviewStars = true;
          if (!parsed.showReviewCustomerNames) parsed.showReviewCustomerNames = true;
          if (!parsed.showReviewDate) parsed.showReviewDate = true;
          if (!parsed.showContactAddress) parsed.showContactAddress = true;
          if (!parsed.showContactPhone) parsed.showContactPhone = true;
          if (!parsed.showContactWhatsApp) parsed.showContactWhatsApp = true;
          if (!parsed.showContactMaps) parsed.showContactMaps = true;
          if (parsed.showAnnouncementBar === undefined) parsed.showAnnouncementBar = false;
          if (!parsed.announcementText) parsed.announcementText = DEFAULT_CONFIG.announcementText;
          if (parsed.announcementRedirectUrl === undefined) parsed.announcementRedirectUrl = "";
          if (!parsed.heroHeadline) parsed.heroHeadline = DEFAULT_CONFIG.heroHeadline;
          if (!parsed.heroSubHeadline) parsed.heroSubHeadline = DEFAULT_CONFIG.heroSubHeadline;
          if (!parsed.heroCtaText) parsed.heroCtaText = DEFAULT_CONFIG.heroCtaText;
          if (!parsed.aboutTitle) parsed.aboutTitle = DEFAULT_CONFIG.aboutTitle;
          if (!parsed.aboutDescription) parsed.aboutDescription = DEFAULT_CONFIG.aboutDescription;
          if (!parsed.businessHours) {
            parsed.businessHours = DEFAULT_CONFIG.businessHours;
          }
          if (!parsed.holidayClosures) {
            parsed.holidayClosures = DEFAULT_CONFIG.holidayClosures || [];
          }
          if (!parsed.bookingConfig) {
            parsed.bookingConfig = DEFAULT_CONFIG.bookingConfig;
          }
          if (!parsed.appointments) {
            parsed.appointments = DEFAULT_CONFIG.appointments || [];
          }
          localStorage.setItem("nexora_draft_site", JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse shared config from URL:", e);
    }

    const local = localStorage.getItem("nexora_draft_site");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (!parsed.accentColor) parsed.accentColor = parsed.primaryColor || DEFAULT_CONFIG.primaryColor;
        if (!parsed.backgroundColor) parsed.backgroundColor = parsed.secondaryColor || DEFAULT_CONFIG.secondaryColor;
        if (!parsed.textColor) parsed.textColor = "#FFFFFF";
        if (!parsed.headingFont) parsed.headingFont = "Playfair Display";
        if (!parsed.bodyFont) parsed.bodyFont = "Inter";
        if (!parsed.buttonStyle) parsed.buttonStyle = "rounded";
        if (!parsed.layoutStyle) parsed.layoutStyle = "luxury";
        if (!parsed.cardStyle) parsed.cardStyle = "elevated";
        if (!parsed.headerLayout) parsed.headerLayout = "left";
        if (!parsed.menuStyle) parsed.menuStyle = "sticky";
        if (!parsed.footerStyle) parsed.footerStyle = "modern";
        if (!parsed.themeMode) parsed.themeMode = "dark";
        if (!parsed.animations) parsed.animations = DEFAULT_CONFIG.animations;
        if (!parsed.showServicePrices) parsed.showServicePrices = true;
        if (!parsed.showServiceImages) parsed.showServiceImages = true;
        if (!parsed.showServiceDuration) parsed.showServiceDuration = true;
        if (!parsed.showStaffPhotos) parsed.showStaffPhotos = true;
        if (!parsed.showStaffExperience) parsed.showStaffExperience = true;
        if (!parsed.showStaffRatings) parsed.showStaffRatings = true;
        if (!parsed.galleryLayout) parsed.galleryLayout = "grid";
        if (!parsed.galleryImagesPerRow) parsed.galleryImagesPerRow = 3;
        if (!parsed.showReviewStars) parsed.showReviewStars = true;
        if (!parsed.showReviewCustomerNames) parsed.showReviewCustomerNames = true;
        if (!parsed.showReviewDate) parsed.showReviewDate = true;
        if (!parsed.showContactAddress) parsed.showContactAddress = true;
        if (!parsed.showContactPhone) parsed.showContactPhone = true;
        if (!parsed.showContactWhatsApp) parsed.showContactWhatsApp = true;
        if (!parsed.showContactMaps) parsed.showContactMaps = true;
        if (parsed.showAnnouncementBar === undefined) parsed.showAnnouncementBar = false;
        if (!parsed.announcementText) parsed.announcementText = DEFAULT_CONFIG.announcementText;
        if (parsed.announcementRedirectUrl === undefined) parsed.announcementRedirectUrl = "";
        if (!parsed.heroHeadline) parsed.heroHeadline = DEFAULT_CONFIG.heroHeadline;
        if (!parsed.heroSubHeadline) parsed.heroSubHeadline = DEFAULT_CONFIG.heroSubHeadline;
        if (!parsed.heroCtaText) parsed.heroCtaText = DEFAULT_CONFIG.heroCtaText;
        if (!parsed.aboutTitle) parsed.aboutTitle = DEFAULT_CONFIG.aboutTitle;
        if (!parsed.aboutDescription) parsed.aboutDescription = DEFAULT_CONFIG.aboutDescription;
        if (!parsed.businessHours) {
          parsed.businessHours = DEFAULT_CONFIG.businessHours;
        }
        if (!parsed.holidayClosures) {
          parsed.holidayClosures = DEFAULT_CONFIG.holidayClosures || [];
        }
        if (!parsed.bookingConfig) {
          parsed.bookingConfig = DEFAULT_CONFIG.bookingConfig;
        }
        if (!parsed.appointments) {
          parsed.appointments = DEFAULT_CONFIG.appointments || [];
        }
        return parsed;
      } catch (e) { }
    }
    return DEFAULT_CONFIG;
  });
  
  // Premium animation variants
  const isFadeEnabled = siteConfig?.animations?.fade !== false;
  const premiumContainerVariants = {
    hidden: isFadeEnabled ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const premiumItemVariants = {
    hidden: isFadeEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // DB Showcase lists
  const [publishedSites, setPublishedSites] = useState<any[]>([]);
  const [isSmartThemeSyncEnabled, setIsSmartThemeSyncEnabled] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isInteracted, setIsInteracted] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isCustomerOnlyMode, setIsCustomerOnlyMode] = useState<boolean>(false);
  const paletteImageRef = useRef<HTMLInputElement>(null);

  const [isExtractingColors, setIsExtractingColors] = useState<boolean>(false);
  const [extractedPalettePreview, setExtractedPalettePreview] = useState<{
    palette: string[];
    buttonIndex: number;
    backgroundIndex: number;
  } | null>(null);

  // Sync theme colors with extracted palette if enabled
  useEffect(() => {
    if (isSmartThemeSyncEnabled && extractedPalettePreview) {
      const palette = extractedPalettePreview.palette;
      const bg = palette[extractedPalettePreview.backgroundIndex];
      const btn = palette[extractedPalettePreview.buttonIndex];
      
      setSiteConfig(prev => ({
        ...prev,
        primaryColor: btn,
        secondaryColor: bg,
        buttonColor: btn,
        backgroundColor: bg,
        textColor: getContrastRatio('#ffffff', bg) > 4.5 ? '#ffffff' : '#000000',
      }));
    }
  }, [isSmartThemeSyncEnabled, extractedPalettePreview]);
  
  // Booking Simulator States
  const [settingsActiveDate, setSettingsActiveDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Copy Feedback state
  const [copiedServiceId, setCopiedServiceId] = useState<string | null>(null);

  // Image Cropper States
  const [cropperOpen, setCropperOpen] = useState<boolean>(false);
  const [cropperSrc, setCropperSrc] = useState<string>("");
  const [cropperType, setCropperType] = useState<"logo" | "banner" | "gallery" | "team" | "testimonial" | "gallery-edit">("logo");
  const [cropperTargetId, setCropperTargetId] = useState<string>("");
  const [bookingSelectedServiceId, setBookingSelectedServiceId] = useState<string>("");
  const [bookingSelectedStaffId, setBookingSelectedStaffId] = useState<string>("any");
  const [bookingSelectedDate, setBookingSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [bookingSelectedTime, setBookingSelectedTime] = useState<string>("");
  const [bookingClientName, setBookingClientName] = useState<string>("");
  const [bookingClientPhone, setBookingClientPhone] = useState<string>("");
  const [bookingClientNotes, setBookingClientNotes] = useState<string>("");
  const [bookingSuccessMode, setBookingSuccessMode] = useState<boolean>(false);
  const [useSameNumber, setUseSameNumber] = useState<boolean>(() => {
    return siteConfig.phone && siteConfig.phone === siteConfig.whatsapp;
  });
  
  // Save & publish progress indicators
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI Loading indicators
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  // Custom AI Query parameters for generation controls
  const [shopNameQuery, setShopNameQuery] = useState("");
  const [taglineQuery, setTaglineQuery] = useState("");
  const [taglineStyle, setTaglineStyle] = useState("luxurious & poetic");

  const [seoQuery, setSeoQuery] = useState("luxury local medical spa and balayage specialists");
  const [galleryNarrativeQuery, setGalleryNarrativeQuery] = useState("");
  const [galleryNarrativeStyle, setGalleryNarrativeStyle] = useState("sophisticated & artistic");
  const [isColorPaletteExpanded, setIsColorPaletteExpanded] = useState(false);

  // File Upload helper refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const teamImgInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const testimonialAvatarInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Sync draft edits to local storage for premium auto-save experience
  useEffect(() => {
    if (!isCustomerOnlyMode) {
      localStorage.setItem("nexora_draft_site", JSON.stringify(siteConfig));
    }
  }, [siteConfig, isCustomerOnlyMode]);

  // Sync mobile nav tabs with workspace panels
  useEffect(() => {
    if (!activeMobileTab || activeMobileTab === 'preview') {
      setSidebarOpen(false);
    } else if (activeMobileTab === 'content') {
      setActiveStep(1);
      setSidebarOpen(true);
    } else if (activeMobileTab === 'theme') {
      setActiveStep(2);
      setSidebarOpen(true);
    } else if (activeMobileTab === 'services') {
      setActiveStep(3);
      setSidebarOpen(true);
    } else if (activeMobileTab === 'publish') {
      setActiveStep(4);
      setSidebarOpen(true);
    }
  }, [activeMobileTab]);

  // Auto-scroll live preview to the active section being edited in the sidebar
  useEffect(() => {
    if (isCustomerOnlyMode || !sidebarOpen) return;

    const sectionMap: Record<string, string> = {
      "settings-subdomain": "sec-hero",
      "settings-hero": "sec-hero",
      "settings-about": "sec-about",
      "settings-services": "sec-services",
      "settings-staff": "sec-team",
      "settings-gallery": "sec-gallery",
      "settings-reviews": "sec-testimonials",
      "settings-contact": "sec-contact",
      "settings-announcement": "sec-hero",
    };

    const targets = Object.keys(sectionMap);
    let focusedId: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: Element | null = null;
        let bestRatio = 0;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            best = e.target;
          }
        }
        if (!best) return;
        const secId = sectionMap[(best as HTMLElement).id];
        if (!secId || secId === focusedId) return;
        focusedId = secId;
        const previewSection = previewContainerRef.current?.querySelector(`#${secId}`);
        previewSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      { threshold: [0, 0.1, 0.25, 0.5] }
    );

    targets.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isCustomerOnlyMode, sidebarOpen, activeStep, siteConfig.sections]);

  // Fetch published showcases on mount & check for URL shared state
  useEffect(() => {
    fetchPublishedSites();

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const subdomainParam = searchParams.get("subdomain") || searchParams.get("site");
      const host = window.location.hostname;
      let urlSubdomain = subdomainParam || "";
      if (!urlSubdomain && host.endsWith(".nexorasalonos.com")) {
        urlSubdomain = host.replace(".nexorasalonos.com", "");
      }

      if (urlSubdomain) {
        fetch(`/api/sites/${encodeURIComponent(urlSubdomain.toLowerCase())}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error("Site not found");
          })
          .then(data => {
            if (data.success && data.site) {
              setSiteConfig(data.site);
              setIsCustomerOnlyMode(true);
              notifyShort(`Live site "${data.site.shopName || urlSubdomain}" loaded successfully!`);
            }
          })
          .catch(err => {
            console.error("Subdomain loading failed:", err);
          });
      }

      const hasShared = searchParams.has("shared") || searchParams.has("config");
      let hasHashShared = false;
      
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        hasHashShared = hashParams.has("shared") || hashParams.has("config");
      }

      if (hasShared || hasHashShared) {
        notifyShort("Shared draft loaded successfully!");
        
        // Clean URL cleanly to avoid repeating notification upon page shifts or minor restarts
        const url = new URL(window.location.href);
        url.searchParams.delete("shared");
        url.searchParams.delete("config");
        url.hash = "";
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    } catch (e) {
      console.error("Error reading shared link on mount:", e);
    }
  }, []);

  const fetchPublishedSites = async () => {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPublishedSites(data.sites);
        }
      }
    } catch (err) {
      console.warn("Could not fetch published sites:", err);
    }
  };

  // Preset switch triggers
  const loadPreset = (site: any) => {
    if (confirm(`Do you want to discard your current editing draft and load "${site.shopName || site.subdomain}"?`)) {
      setSiteConfig({
        ...DEFAULT_CONFIG,
        ...site
      });
    }
  };

  // Restore factory defaults
  const handleRestoreDefaults = () => {
    if (confirm("Reset current draft to default high-fashion mock salon?")) {
      setSiteConfig(DEFAULT_CONFIG);
    }
  };

  // Download entire configuration backup
  const handleDownloadBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteConfig, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      const filename = `${siteConfig.subdomain || "nexora"}-backup.json`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notifyShort("Configuration backup downloaded successfully!");
    } catch (err) {
      console.error(err);
      notifyShort("Failed to download configuration backup.");
    }
  };

  // Import configuration backup from JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const parsed = JSON.parse(jsonStr);
        
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Invalid file format. Must be a valid JSON object.");
        }
        
        if (!parsed.shopName || !parsed.subdomain) {
          throw new Error("Invalid configuration structure: Missing critical property 'shopName' or 'subdomain'.");
        }

        // Apply fallbacks for properties added in recent iterations
        if (!parsed.businessHours) {
          parsed.businessHours = DEFAULT_CONFIG.businessHours;
        }
        if (!parsed.holidayClosures) {
          parsed.holidayClosures = DEFAULT_CONFIG.holidayClosures || [];
        }

        setSiteConfig(parsed);
        notifyShort("Configuration backup restored successfully!");
      } catch (err: any) {
        notifyShort(`Failed to restore backup: ${err?.message || "Invalid JSON format"}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear file selector to allow reimporting
  };

  const notifyShort = (msg: string) => {
    setPublishStatus(msg);
    setTimeout(() => {
      setPublishStatus(null);
    }, 4000);
  };

  /* ------------------------------------------------------------------ */
  /*  FILE UPLOADER HANDLERS WITH CROPPER INTERCEPT                     */
  /* ------------------------------------------------------------------ */
  const handleCropComplete = (croppedUrl: string) => {
    if (cropperType === "logo") {
      setSiteConfig(prev => ({ ...prev, logo: croppedUrl }));
      notifyShort("Logo cropped and updated successfully!");
    } else if (cropperType === "banner") {
      setSiteConfig(prev => ({ ...prev, banner: croppedUrl }));
      notifyShort("Brand banner cropped and updated successfully!");
    } else if (cropperType === "team") {
      setSiteConfig(prev => ({
        ...prev,
        team: prev.team.map(t => t.id === cropperTargetId ? { ...t, img: croppedUrl } : t)
      }));
      notifyShort("Team headshot cropped and updated!");
    } else if (cropperType === "testimonial") {
      setSiteConfig(prev => ({
        ...prev,
        testimonials: prev.testimonials.map(t => t.id === cropperTargetId ? { ...t, avatarUrl: croppedUrl } : t)
      }));
      notifyShort("Reviewer avatar cropped and updated!");
    } else if (cropperType === "gallery") {
      setSiteConfig(prev => ({
        ...prev,
        gallery: [...prev.gallery, croppedUrl]
      }));
      notifyShort("Added cropped photo to style portfolio!");
    } else if (cropperType === "gallery-edit") {
      setSiteConfig(prev => {
        const newGallery = [...prev.gallery];
        const targetIdx = parseInt(cropperTargetId);
        if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < newGallery.length) {
          newGallery[targetIdx] = croppedUrl;
        }
        return { ...prev, gallery: newGallery };
      });
      notifyShort("Updated portfolio photo!");
    }
    setCropperOpen(false);
    setCropperSrc("");
  };

  const handleExtractPaletteFromImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingColors(true);
    try {
      const { dominant, palette } = await extractColorsFromImage(file);
      
      const fullPalette = [dominant, ...palette.filter(c => c !== dominant)].slice(0, 5);
      
      setExtractedPalettePreview({
        palette: fullPalette,
        buttonIndex: 0,
        backgroundIndex: fullPalette.length > 1 ? 1 : 0
      });
      notifyShort("Palette extracted! Adjust the preview.");
    } catch (err) {
      console.error(err);
      notifyShort("Failed to extract colors. Ensure the image is valid.");
    } finally {
      setIsExtractingColors(false);
      e.target.value = "";
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
        setCropperType("logo");
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
        setCropperType("banner");
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamMemberUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
        setCropperType("team");
        setCropperTargetId(id);
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestimonialAvatarUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
        setCropperType("testimonial");
        setCropperTargetId(id);
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
        setCropperType("gallery");
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplaceGalleryImage = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string);
        setCropperType("gallery-edit");
        setCropperTargetId(index.toString());
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditGalleryImage = (imgUrl: string, index: number) => {
    setCropperSrc(imgUrl);
    setCropperType("gallery-edit");
    setCropperTargetId(index.toString());
    setCropperOpen(true);
  };

  const removeGalleryImage = (index: number) => {
    setSiteConfig(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index)
    }));
  };

  /* ------------------------------------------------------------------ */
  /*  AI GEMINI ENDPOINT SERVICE CONNECTORS                             */
  /* ------------------------------------------------------------------ */
  const generateAICopy = async (type: "tagline" | "about" | "services" | "seo" | "shopName") => {
    setAiError(null);
    setAiLoading(prev => ({ ...prev, [type]: true }));

    let queryParam = "";
    let styleParam = "";

    if (type === "tagline") {
      queryParam = taglineQuery || "premium botanical hair care and custom luxury manicures";
      styleParam = taglineStyle;
    } else if (type === "seo") {
      queryParam = seoQuery || siteConfig.tagline;
    } else if (type === "shopName") {
      queryParam = shopNameQuery || "Luxury skincare and hair styling";
      styleParam = "elegant and modern";
    }

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          query: queryParam,
          style: styleParam,
          salonName: siteConfig.shopName
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || `Server failed to generate your luxury copy.`);
      }

      const generated = resData.data;

      if (type === "tagline") {
        setSiteConfig(prev => ({ ...prev, tagline: generated.tagline }));
        notifyShort("AI wrote a luxurious tagline!");
      } else if (type === "shopName") {
        setSiteConfig(prev => ({ ...prev, shopName: generated.shopName }));
        notifyShort("AI generated a beautiful brand name!");
      } else if (type === "seo") {
        setSiteConfig(prev => ({
          ...prev,
          metaTitle: generated.metaTitle,
          metaDescription: generated.metaDescription,
          keywords: generated.keywords
        }));
        notifyShort("SEO optimization completed!");
      }

    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "Verify your GEMINI_API_KEY is configured in your platform secrets.");
    } finally {
      setAiLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const generateImageAltCaption = async (imgUrl: string) => {
    setAiError(null);
    setAiLoading(prev => ({ ...prev, [`alt_caption-${imgUrl}`]: true }));
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "alt_caption",
          imgUrl,
          salonName: siteConfig.shopName
        })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || `Failed to generate image descriptors.`);
      }
      const { altText, caption } = resData.data;
      setSiteConfig(prev => {
        const metadata = prev.galleryMetadata ? { ...prev.galleryMetadata } : {};
        metadata[imgUrl] = {
          alt: altText,
          caption: caption
        };
        return {
          ...prev,
          galleryMetadata: metadata
        };
      });
      notifyShort("Generated SEO Alt Text & Caption!");
    } catch (err: any) {
      console.error(err);
      notifyShort(err.message || "Failed to generate image descriptors.");
    } finally {
      setAiLoading(prev => ({ ...prev, [`alt_caption-${imgUrl}`]: false }));
    }
  };

  const generateAllImageAltCaptions = async () => {
    console.log("generateAllImageAltCaptions called");
    if (!siteConfig.gallery || siteConfig.gallery.length === 0) {
      notifyShort("No images to process.");
      return;
    }
    console.log("siteConfig.gallery length:", siteConfig.gallery.length);

    setAiLoading(prev => ({ ...prev, bulk_alt_caption: true }));
    try {
      // Process sequentially to avoid rate limits
      for (const imgUrl of siteConfig.gallery) {
        // Skip if already generated
        const metadata = siteConfig.galleryMetadata?.[imgUrl];
        if (metadata?.alt && metadata?.caption) {
          continue;
        }
        await generateImageAltCaption(imgUrl);
      }
      notifyShort("Bulk AI Generation completed!");
    } catch (err: any) {
      console.error("Bulk Generation Error:", err);
      notifyShort(err.message || "Failed to generate image descriptors.");
    } finally {
      setAiLoading(prev => ({ ...prev, bulk_alt_caption: false }));
    }
  };

  const generateGalleryNarrative = async () => {
    setAiError(null);
    setAiLoading(prev => ({ ...prev, galleryNarrative: true }));
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "galleryNarrative",
          query: galleryNarrativeQuery || "Modern haircuts, high-end balayage art, and organic treatments",
          style: galleryNarrativeStyle,
          salonName: siteConfig.shopName
        })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || `Failed to generate portfolio narrative.`);
      }
      const { narrative } = resData.data;
      setSiteConfig(prev => ({ ...prev, galleryNarrative: narrative }));
      notifyShort("Auto-generated premium portfolio narrative!");
    } catch (err: any) {
      console.error(err);
      notifyShort(err.message || "Failed to generate narrative.");
    } finally {
      setAiLoading(prev => ({ ...prev, galleryNarrative: false }));
    }
  };

  /* ------------------------------------------------------------------ */
  /*  CRUD EDITING ACTION HANDLERS                                      */
  /* ------------------------------------------------------------------ */

  // Team
  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | number) => {
    setSiteConfig(prev => ({
      ...prev,
      team: prev.team.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const addTeamMember = () => {
    const newT: TeamMember = {
      id: `t-${Date.now()}`,
      name: "Marcus Aurelius",
      role: "Therapeutic Stylist",
      bio: "Focusing on traditional high-fashion precision lines and calming herbal scalp aromatics.",
      experience: "5 Years",
      rating: 5,
      img: ""
    };
    setSiteConfig(prev => ({ ...prev, team: [...prev.team, newT] }));
  };

  const removeTeamMember = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      team: prev.team.filter(t => t.id !== id)
    }));
  };

  // Testimonials
  const updateTestimonial = (id: string, field: keyof Testimonial, value: string) => {
    setSiteConfig(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const addTestimonial = () => {
    const newTm: Testimonial = {
      id: `tm-${Date.now()}`,
      author: "Juliet B.",
      text: "Literally the absolute best salon in the region. The team was exceptionally welcoming, and my color has never looked more radiant."
    };
    setSiteConfig(prev => ({ ...prev, testimonials: [...prev.testimonials, newTm] }));
  };

  const removeTestimonial = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== id)
    }));
  };

  // Booking operations
  const cancelAppointment = (apptId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      appointments: (prev.appointments || []).filter(a => a.id !== apptId)
    }));
    notifyShort("Simulated appointment cancelled.");
  };

  const toggleBlockSlot = (dateStr: string, slotStr: string) => {
    setSiteConfig(prev => {
      const currentConfig = prev.bookingConfig || {
        interval: 30,
        startTime: "09:00",
        endTime: "18:00",
        enabledDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        blockedSlots: {}
      };
      const blocked = { ...currentConfig.blockedSlots };
      if (!blocked[dateStr]) {
        blocked[dateStr] = [];
      }
      if (blocked[dateStr].includes(slotStr)) {
        blocked[dateStr] = blocked[dateStr].filter(s => s !== slotStr);
      } else {
        blocked[dateStr] = [...blocked[dateStr], slotStr];
      }
      return {
        ...prev,
        bookingConfig: {
          ...currentConfig,
          blockedSlots: blocked
        }
      };
    });
  };

  const bookSimulatedAppointment = (appt: {
    serviceId: string;
    serviceName: string;
    staffId: string;
    staffName: string;
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
    clientNotes?: string;
  }) => {
    const newAppt = {
      ...appt,
      id: `appt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSiteConfig(prev => ({
      ...prev,
      appointments: [newAppt, ...(prev.appointments || [])]
    }));
  };

  const isSlotWithinNoticePeriod = (dateStr: string | null | undefined, slotStr: string | null | undefined, noticeHours: number | undefined): boolean => {
    if (!dateStr || !slotStr || !noticeHours || noticeHours <= 0) return false;
    if (typeof dateStr !== "string" || typeof slotStr !== "string") return false;
    try {
      const now = new Date();
      const match = slotStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!match) return false;
      
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      
      if (ampm === "PM" && hours < 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }
      
      const dateParts = dateStr.split("-").map(Number);
      if (dateParts.length !== 3 || dateParts.some(isNaN)) return false;
      
      const slotDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes, 0, 0);
      
      const diffMs = slotDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      return diffHours < noticeHours;
    } catch (e) {
      console.error("Error checking notice period:", e);
      return false;
    }
  };

  const generateSlotsForDay = (startTimeStr: string, endTimeStr: string, intervalMinutes: number): string[] => {
    const slots: string[] = [];
    try {
      const [startHour, startMin] = (startTimeStr || "09:00").split(":").map(Number);
      const [endHour, endMin] = (endTimeStr || "18:00").split(":").map(Number);
      
      let currentMin = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const interval = intervalMinutes || 30;
      
      while (currentMin + interval <= endMinutes) {
        const h = Math.floor(currentMin / 60);
        const m = currentMin % 60;
        const ampm = h >= 12 ? "PM" : "AM";
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        const displayMin = m < 10 ? `0${m}` : m;
        
        slots.push(`${displayHour}:${displayMin} ${ampm}`);
        currentMin += interval;
      }
    } catch (e) {
      console.error("Error generating slots:", e);
    }
    return slots;
  };

  // Holiday Closures
  const updateHolidayClosure = (id: string, field: "name" | "date", value: string) => {
    setSiteConfig(prev => ({
      ...prev,
      holidayClosures: (prev.holidayClosures || []).map(h => h.id === id ? { ...h, [field]: value } : h)
    }));
  };

  const addHolidayClosure = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const newHoliday = {
      id: `h-${Date.now()}`,
      name: "Thanksgiving Day",
      date: todayStr
    };
    setSiteConfig(prev => ({
      ...prev,
      holidayClosures: [...(prev.holidayClosures || []), newHoliday]
    }));
  };

  const removeHolidayClosure = (id: string) => {
    setSiteConfig(prev => ({
      ...prev,
      holidayClosures: (prev.holidayClosures || []).filter(h => h.id !== id)
    }));
  };

  // Sections drag reordering or up-down movement
  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...siteConfig.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    // Swap
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    setSiteConfig(prev => ({ ...prev, sections: newSections }));
  };

  const toggleSectionEnabled = (sectionId: string) => {
    setSiteConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  /* ------------------------------------------------------------------ */
  /*  SAVE & PUBLISH WITH EXPRESS DB                                    */
  /* ------------------------------------------------------------------ */
  const handlePublishConfig = async () => {
    if (!siteConfig.subdomain.trim()) {
      notifyShort("Please provide a valid alphanumeric subdomain prefix first.");
      return;
    }

    setIsPublishing(true);
    setPublishStatus("Registering DNS subdomain on Nexora Network...");

    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: siteConfig.subdomain.trim().toLowerCase().replace(/\s+/g, "-"),
          siteData: siteConfig
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Server could not commit site setup.");
      }

      await fetchPublishedSites();
      notifyShort(`Published successfully to ${siteConfig.subdomain}.nexorasalonos.com !`);
    } catch (err: any) {
      notifyShort(`Publishing failed: ${err.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShareDraft = () => {
    try {
      const jsonStr = JSON.stringify(siteConfig);
      const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodeURIComponent(base64Str)}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        notifyShort("Shareable draft link copied to clipboard!");
      }).catch(() => {
        try {
          const input = document.createElement("input");
          input.value = shareUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand("copy");
          document.body.removeChild(input);
          notifyShort("Shareable link copied!");
        } catch (err) {
          notifyShort("Copy failed. Please copy manually.");
        }
      });
    } catch (e) {
      console.error("Failed to generate share link:", e);
      notifyShort("Failed to generate share link.");
    }
  };

  const activeFontClass = () => {
    if (siteConfig.fontFamily === "serif") return "font-serif-custom";
    if (siteConfig.fontFamily === "mono") return "font-mono-custom";
    return "font-sans-custom";
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 flex flex-col font-sans-custom relative overflow-x-hidden w-full max-w-full">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[-300px] left-[-200px] w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-300px] right-[-200px] w-[600px] h-[600px] bg-[#D4AF37]/3 blur-[120px] rounded-full pointer-events-none" />

      {/* TOP NOTIFICATION CHIP BAR */}
      {publishStatus && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#1e1a0b] text-[#e5c158] border border-[#d4af37]/40 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce text-xs font-medium">
          <Sparkle className="w-4 h-4 text-[#d4af37] animate-spin" />
          <span>{publishStatus}</span>
        </div>
      )}

      {/* HEADER BAR */}
      {!isCustomerOnlyMode && (
        <header className="border-b border-white/[0.05] bg-[#0E0E0E]/90 backdrop-blur-md px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#9a7b1c] flex items-center justify-center text-[#111] font-bold text-xs tracking-wider shadow-lg shadow-[#d4af37]/20">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight uppercase">Nexora</span>
              </div>
              <p className="text-[9px] text-gray-500 hidden sm:block">SalonOS Studio</p>
            </div>
          </div>

          {/* SHOWCASE PICKER & QUICK DEFAULTS */}
          <div className="flex flex-wrap items-center gap-3">
            {publishedSites.length > 0 && (
              <div className="flex items-center gap-2 bg-[#121212] border border-white/[0.06] rounded-lg p-1">
                <span className="text-[10px] text-gray-500 uppercase font-mono px-2">Showcases:</span>
                {publishedSites.map(s => (
                  <button
                    key={s.subdomain}
                    onClick={() => loadPreset(s)}
                    className="px-2.5 py-1 text-xs text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#D4AF37]/50 rounded transition-all flex items-center gap-1.5"
                  >
                    <Globe className="w-3 h-3 text-[#D4AF37]" />
                    <span>{s.shopName || s.subdomain}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleRestoreDefaults}
              className="w-full flex-shrink-0 p-2 text-xs bg-transparent border border-white/[0.08] hover:bg-white/[0.04] hover:text-white rounded-lg transition-all flex items-center gap-1.5"
              title="Reset sandbox to beautiful default values"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Reset Draft</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="w-full flex-shrink-0 p-2 text-xs bg-transparent border border-white/[0.08] hover:bg-white/[0.04] hover:text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-gray-300"
              title="Download full configuration JSON file"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Download Backup</span>
            </button>

            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="w-full flex-shrink-0 p-2 text-xs bg-transparent border border-white/[0.08] hover:bg-white/[0.04] hover:text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-gray-300"
              title="Upload configuration JSON file"
            >
              <Upload className="w-3.5 h-3.5 text-amber-500/85" />
              <span className="hidden md:inline">Restore Backup</span>
            </button>
            <input
              type="file"
              ref={backupFileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={handlePublishConfig}
              disabled={isPublishing}
              className="w-full flex-shrink-0 px-4 py-2 text-xs bg-gradient-to-r from-[#D4AF37] to-[#bda03c] hover:opacity-90 active:scale-95 text-black font-semibold rounded-lg shadow-xl shadow-[#D4AF37]/15 hover:shadow-[#D4AF37]/30 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>Publish Website</span>
            </button>
          </div>
        </header>
      )}

      {/* ERRORS BANNER */}
      {!isCustomerOnlyMode && aiError && (
        <div className="bg-red-950/40 border-b border-red-900/50 text-red-300 px-6 py-3 text-xs flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase bg-red-900/60 text-red-100 px-2 py-0.5 rounded text-[10px]">AI Config Required</span>
            <span>{aiError}</span>
          </div>
          <button onClick={() => setAiError(null)} className="text-red-400 hover:text-red-200 font-bold px-2 pointer-events-auto">✕</button>
        </div>
      )}

      {/* MOBILE BUILDER TOGGLE */}
      {!isCustomerOnlyMode && (
        <div className="fixed bottom-6 right-6 z-[55] lg:hidden">
          <button
            onClick={() => {
              const newState = !sidebarOpen;
              setSidebarOpen(newState);
              if (!newState) setActiveMobileTab('preview');
              else if (activeMobileTab === 'preview') setActiveMobileTab('content');
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
              sidebarOpen ? 'bg-red-500 rotate-[135deg]' : 'bg-[#D4AF37] text-black shadow-[#D4AF37]/30'
            }`}
          >
            {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Settings className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* CORE WORKSPACE */}
      <main className="flex-1 flex flex-col lg:flex-row lg:min-h-screen lg:items-stretch relative z-10 overflow-x-hidden pb-20 lg:pb-0">
        
        {/* Mobile Drawer Backdrop */}
        {!isCustomerOnlyMode && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
              setActiveMobileTab(null);
            }}
          />
        )}

        {/* LEFT COLUMN: THE ATELIER CONTROL BOARD */}
        {!isCustomerOnlyMode && (
          <section className={`fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl lg:rounded-none lg:relative lg:top-0 lg:min-h-screen lg:h-auto lg:max-h-none lg:self-stretch lg:w-[480px] z-50 lg:z-auto border-t lg:border-t-0 lg:border-r border-white/[0.05] bg-slate-900 lg:bg-[#0A0A0A] text-white flex flex-col transition-transform duration-300 shadow-2xl pb-24 transform ${
            sidebarOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-0'
          }`}>
          
            {/* Quick Stats & Subdomain Info */}
            {activeMobileTab !== 'theme' && (
              <div className="p-4 border-b border-white/[0.05] bg-[#0E0E0E]/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-[#D4AF37] font-bold">
                    {activeMobileTab === 'theme' ? 'Choose Theme' : 'Live Workspace Status'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded-full font-semibold">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                      DRAFT AUTO-SAVED
                    </span>
                    <button 
                      onClick={() => {
                        setSidebarOpen(false);
                        setActiveMobileTab(null);
                      }}
                      className="lg:hidden p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-medium">Web Address:</span>
                    <span className="text-[10px] text-[#D4AF37] font-semibold">Web Address Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] bg-black px-2 py-1.5 rounded text-gray-300 border border-white/[0.08] truncate flex-1 select-all">
                      https://{siteConfig.subdomain || "your-subdomain"}.nexorasalonos.com
                    </span>
                    <button
                      onClick={() => {
                        const simUrl = `https://${siteConfig.subdomain || "nexora"}.nexorasalonos.com`;
                        navigator.clipboard.writeText(simUrl);
                        notifyShort("Simulated custom domain copied!");
                      }}
                      className="p-1.5 rounded bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
                      title="Copy simulated custom domain link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-white/[0.04] space-y-1.5">
                    <button
                      onClick={() => {
                        const liveUrl = `${window.location.origin}${window.location.pathname}?subdomain=${siteConfig.subdomain || "nexora-lounge"}`;
                        window.open(liveUrl, "_blank");
                        notifyShort("Launching live site over secure HTTPS...");
                      }}
                      className="w-full py-1.5 px-3 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] transition-all text-black font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-[#D4AF37]/10 cursor-pointer flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Launch Live Site (HTTPS)</span>
                    </button>
                    <p className="text-[10px] text-gray-500 leading-normal flex items-start gap-1">
                      <Info className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>
                        The <code className="text-gray-400">.nexorasalonos.com</code> domain is simulated for branding. Click <strong>Launch Live Site</strong> to view your salon live over actual working secure HTTPS!
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}


          {/* STEP-BY-STEP ONBOARDING WIZARD */}
          {activeMobileTab !== 'theme' && (
            <nav className="flex flex-col bg-[#0E0E0E]/95 border-b border-white/[0.04] p-3 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                {[
                  { id: 1, name: "Shop Details" },
                  { id: 2, name: "Design & Theme" },
                  { id: 3, name: "Services & Prices" },
                  { id: 4, name: "Publish" }
                ].map(step => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex flex-col items-center gap-1.5 flex-1 relative flex-shrink-0 ${
                      activeStep >= step.id ? "text-[#D4AF37]" : "text-gray-600"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${
                      activeStep === step.id ? "bg-[#D4AF37] text-black" :
                      activeStep > step.id ? "bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37]" :
                      "bg-white/[0.02] border border-white/[0.05] text-gray-500"
                    }`}>
                      {step.id}
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-semibold whitespace-nowrap hidden md:block ${
                      activeStep === step.id ? "text-white" : ""
                    }`}>
                      {step.name}
                    </span>
                    {/* Progress Line */}
                    {step.id < 4 && (
                      <div className="absolute top-3 left-[60%] w-full h-[1px] bg-white/[0.05] -z-0">
                        <div className="h-full bg-[#D4AF37] transition-all" style={{ width: activeStep > step.id ? "100%" : "0%" }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* ATELIER CONTROLLER SHEETS - SCROLLABLE PANEL */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6 pb-24">
            
            {activeMobileTab === 'theme' ? (
              <div className="space-y-6 animate-fadeIn pb-10">
                <div className="p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-xl space-y-1">
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">Theme Customizer</span>
                  <p className="text-xs text-gray-300">Quickly swap themes or fine-tune your colors below.</p>
                </div>
                
                {/* PRESETS BLOCK (Referenced by ID for direct scroll if needed) */}
                <div id="drawer-presets">
                  {/* Theme Presets content will be duplicated or moved here */}
                  {/* For simplicity and to avoid huge edits, I'll use a helper or just repeat the code if it's small enough */}
                  {/* Actually, I'll just show Step 2's theme parts if activeMobileTab is theme */}
                </div>
              </div>
            ) : null}

            {/* STEP 1: SHOP DETAILS */}
            {activeStep === 1 && activeMobileTab !== 'theme' && (
              <div className="space-y-6 animate-fadeIn pb-10">
                <div className="p-3 bg-[#e2cc83]/5 border border-[#e2cc83]/25 rounded-xl space-y-1">
                  <span className="text-[10px] text-[#e2cc83] uppercase tracking-wider font-bold">Step 1: Shop Details</span>
                  <p className="text-xs text-gray-300">Set up your brand name, address, and social links.</p>
                </div>

                <div className="space-y-4 bg-[#111] border border-white/[0.04] rounded-xl p-4">
                  <div>
                    <label className="flex items-center text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Salon / Shop Name
                      <HelpTooltip text="This is the main name displayed at the top of your website." />
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-black border border-white/[0.08] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs text-white"
                        value={siteConfig.shopName}
                        onChange={e => setSiteConfig(prev => ({ ...prev, shopName: e.target.value }))}
                        placeholder="e.g. Royal Glow Boutique"
                      />
                      <button
                        type="button"
                        onClick={() => generateAICopy("shopName")}
                        disabled={aiLoading["shopName"]}
                        className="w-full sm:w-auto px-3 py-2 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border border-white/[0.08] hover:border-[#D4AF37]/35 text-[9px] text-stone-400 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer select-none transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        {aiLoading["shopName"] ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        )}
                        <span className="font-mono font-bold uppercase hidden xl:inline">AI Name</span>
                      </button>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        className="w-full bg-black border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder:text-gray-600"
                        placeholder="Brief description for AI name generation (e.g., luxury organic hair salon)"
                        value={shopNameQuery}
                        onChange={e => setShopNameQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div id="settings-subdomain">
                    <label className="flex items-center text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Choose Your Free Website Name
                      <HelpTooltip text="This is the web address (URL) your clients will type to find you." />
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-white/[0.08] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/20 bg-black text-xs">
                      <input
                        type="text"
                        className="flex-1 bg-transparent px-3 py-2 text-white outline-none"
                        value={siteConfig.subdomain || ""}
                        onChange={e => setSiteConfig(prev => ({ ...prev, subdomain: e.target.value }))}
                        placeholder="luxury-retreat"
                      />
                      <span className="bg-[#121212] px-3 py-2 text-gray-500 font-mono text-[10px] flex items-center border-l border-white/[0.08]">
                        .nexorasalonos.com
                      </span>
                    </div>

                    {/* Live Availability Check UI */}
                    {(() => {
                      const check = validateSubdomain(siteConfig.subdomain || "");
                      const isSuccess = check.state === "success";
                      const isWarning = check.state === "warning";
                      const isError = check.state === "error";

                      return (
                        <div className={`mt-2 text-[10px] font-mono flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors ${
                          isSuccess
                            ? "bg-[#D4AF37]/5 border-[#D4AF37]/25 text-[#D4AF37]"
                            : isWarning
                            ? "bg-amber-950/20 border-amber-500/25 text-amber-400"
                            : "bg-red-950/20 border-red-500/25 text-red-400"
                        }`}>
                          {isSuccess && <Check className="w-3.5 h-3.5 shrink-0" />}
                          {isWarning && <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" />}
                          {isError && <span className="font-bold shrink-0">✗</span>}
                          <span className="leading-tight">{check.msg}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* BRAND ASSETS CARD: LOGO */}
                <div className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">Brand Logo (PNG/SVG)</span>
                    {siteConfig.logo && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig(prev => ({ ...prev, logo: "" }));
                          notifyShort("Removed brand logo.");
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  {/* Logo Preview & Selector */}
                  {siteConfig.logo ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black h-20 flex items-center justify-center p-3">
                      <img 
                        src={siteConfig.logo} 
                        alt="Brand Logo Preview" 
                        className="h-12 max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-all duration-300" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-2.5 py-1 bg-[#D4AF37] text-black text-[9px] font-bold rounded hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Replace Logo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full py-4 border border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-xl bg-black/40 hover:bg-black/60 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                      <div className="text-center">
                        <p className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Upload Brand Logo</p>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">Transparent background PNG or SVG recommended</p>
                      </div>
                    </button>
                  )}

                  {/* Hidden Logo Input */}
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Pre-designed vector monogram presets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[9px] font-mono text-gray-500 uppercase">Or select a boutique brand monogram:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          name: "Royal 'N'",
                          url: "https://api.dicebear.com/7.x/initials/svg?seed=N&backgroundColor=d4af37&textColor=111"
                        },
                        {
                          name: "Aura 'A'",
                          url: "https://api.dicebear.com/7.x/initials/svg?seed=A&backgroundColor=111111&textColor=d4af37"
                        },
                        {
                          name: "Bloom 'B'",
                          url: "https://api.dicebear.com/7.x/initials/svg?seed=B&backgroundColor=111111&textColor=d4af37"
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setSiteConfig(prev => ({ ...prev, logo: preset.url }));
                            notifyShort(`Selected "${preset.name}" brand monogram!`);
                          }}
                          className={`relative py-1.5 px-2.5 rounded-lg border flex items-center justify-center gap-1 bg-black/40 hover:bg-black/80 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            siteConfig.logo === preset.url ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded-full" />
                          <span className="text-[9px] font-mono font-medium truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BRAND ASSETS CARD: HERO BANNER */}
                <div className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">Hero Background Image</span>
                    {siteConfig.banner && (
                      <button
                        type="button"
                        onClick={() => {
                          setSiteConfig(prev => ({ ...prev, banner: "" }));
                          notifyShort("Removed custom background image.");
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  {/* Current Image Preview or Upload Dropzone */}
                  {siteConfig.banner ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 h-32 flex items-center justify-center">
                      <img 
                        src={siteConfig.banner} 
                        alt="Current Banner" 
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-all duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="px-3 py-1.5 bg-[#D4AF37] text-black text-[10px] font-bold rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Replace Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full h-32 border border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-xl bg-black/40 hover:bg-black/60 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                      <div className="text-center">
                        <p className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">Upload Custom Image</p>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">High-res PNG, JPG or WEBP (16:9 recommended)</p>
                      </div>
                    </button>
                  )}

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Premium Unsplash Presets */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-[10px] font-mono text-gray-500 uppercase">Or select a premium salon preset:</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        {
                          name: "Minimalist",
                          url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
                        },
                        {
                          name: "Luxury Gold",
                          url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80"
                        },
                        {
                          name: "Serene Spa",
                          url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80"
                        },
                        {
                          name: "Elegant Studio",
                          url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                        }
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setSiteConfig(prev => ({ ...prev, banner: preset.url }));
                            notifyShort(`Selected "${preset.name}" preset background!`);
                          }}
                          className={`relative aspect-video rounded-lg overflow-hidden border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            siteConfig.banner === preset.url ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/50" : "border-white/5 hover:border-white/20"
                          }`}
                          title={`Set "${preset.name}" background`}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-[8px] text-center text-gray-300 font-mono">
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TAGLINE & AI */}
                <div className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-[11px] font-mono uppercase text-gray-400">
                      Signature Tagline
                      <HelpTooltip text="A short, memorable phrase describing your salon's vibe. Shown in the top header." />
                    </label>
                    <span className="text-[10px] text-gray-500 italic">Visible in Header</span>
                  </div>
                  <textarea
                    rows={2}
                    className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 rounded-lg p-3 text-xs text-white"
                    value={siteConfig.tagline}
                    onChange={e => setSiteConfig(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Enter bespoke brand slogan"
                  />

                  {/* AI TOOL PANEL */}
                  <div className="border border-dashed border-[#D4AF37]/35 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-4 space-y-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Gemini Luxury Copy Assist</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Provide style cues below to let the AI draft a bespoke slogan.</p>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs text-white"
                        placeholder="e.g. botanical steam, Balayage masters, private lounge"
                        value={taglineQuery}
                        onChange={e => setTaglineQuery(e.target.value)}
                      />
                      <select
                        className="w-full bg-black border border-white/[0.08] text-xs text-gray-300 rounded-lg p-1.5"
                        value={taglineStyle}
                        onChange={e => setTaglineStyle(e.target.value)}
                      >
                        <option value="poetic luxury">Poetic Luxury (Warm & Classy)</option>
                        <option value="avant-garde parisian">Avant-Garde Parisian (Highly chic)</option>
                        <option value="organic & minimal">Organic & Minimalist (Eco-lounge)</option>
                        <option value="modern minimalist">Ultra Clean (Modern & Fast)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => generateAICopy("tagline")}
                      disabled={aiLoading["tagline"]}
                      className="w-full py-2 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] disabled:opacity-50 text-black font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {aiLoading["tagline"] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Draft Brand Tagline</span>
                    </button>
                  </div>
                </div>

                {/* LOGO & HERO BANNER FILE HANDLING - DISABLED PER SPEC */}


              </div>
            )}

            {/* STEP 2: DESIGN & THEME */}
            {(activeStep === 2 || activeMobileTab === 'theme') && (
              <div className="space-y-5 animate-fadeIn pb-10">
                {activeMobileTab !== 'theme' && (
                  <div className="p-3 bg-[#e2cc83]/5 border border-[#e2cc83]/25 rounded-xl space-y-1">
                    <span className="text-[10px] text-[#e2cc83] uppercase tracking-wider font-bold">Step 2: Design & Theme</span>
                    <p className="text-xs text-gray-300">Choose your website layout, colors, and fonts.</p>
                  </div>
                )}

                {/* Theme Presets */}
                <div id="settings-presets" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11px] font-mono uppercase text-[#D4AF37] font-semibold">Theme Presets</span>
                    <span className="text-[9px] bg-white/[0.05] text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">1-Click Setup</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "luxury-black-gold",
                        name: "Luxury Black & Gold",
                        primary: "#0F172A",
                        secondary: "#0F172A",
                        button: "#EAB308",
                        accent: "#EAB308",
                        background: "#020617",
                        text: "#F8FAFC",
                        themeMode: "dark" as const,
                        desc: "Prestige slate and gold."
                      },
                      {
                        id: "clean-rose-white",
                        name: "Clean Rose & White",
                        primary: "#FFF1F2",
                        secondary: "#FFF1F2",
                        button: "#F43F5E",
                        accent: "#F43F5E",
                        background: "#FFFFFF",
                        text: "#0F172A",
                        themeMode: "light" as const,
                        desc: "Modern minimalist rose."
                      },
                      {
                        id: "royal-emerald-slate",
                        name: "Royal Emerald & Slate",
                        primary: "#064E3B",
                        secondary: "#064E3B",
                        button: "#10B981",
                        accent: "#10B981",
                        background: "#022C22",
                        text: "#FFFFFF",
                        themeMode: "dark" as const,
                        desc: "Deep emerald elegance."
                      }
                    ].map((preset) => {
                      const isSelected = siteConfig.primaryColor === preset.primary && siteConfig.accentColor === preset.accent && siteConfig.backgroundColor === preset.background;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSiteConfig(prev => ({
                              ...prev,
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                              buttonColor: preset.button,
                              accentColor: preset.accent,
                              backgroundColor: preset.background,
                              textColor: preset.text,
                              themeMode: preset.themeMode
                            }));
                          }}
                          className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left group ${
                            isSelected ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-black/40 border-white/5 hover:border-[#D4AF37]/30'
                          }`}
                        >
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: preset.primary }} />
                            <div className="w-8 h-8 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: preset.accent }} />
                            <div className="w-8 h-8 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: preset.background }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">{preset.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{preset.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-400 group-hover:bg-[#D4AF37]/20 group-hover:text-[#D4AF37]'
                          }`}>
                            <Palette className="w-3 h-3" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Smart Theme Sync Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSmartThemeSyncEnabled ? 'bg-[#D4AF37]/20' : 'bg-white/5'}`}>
                        <Palette className={`w-4 h-4 ${isSmartThemeSyncEnabled ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white">Smart Theme Sync</p>
                        <p className="text-[9px] text-gray-500">Auto-harmonize UI to image palette</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSmartThemeSyncEnabled(!isSmartThemeSyncEnabled)}
                      className={`w-10 h-5 rounded-full p-1 transition-colors ${isSmartThemeSyncEnabled ? 'bg-[#D4AF37]' : 'bg-gray-700'}`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isSmartThemeSyncEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* SECTION 2: Visibility Controls */}
                {activeMobileTab !== 'theme' && (
                  <div id="settings-visibility" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 2: Visibility Controls</span>
                    <button
                      onClick={() => setSiteConfig(prev => ({ ...prev, sections: DEFAULT_CONFIG.sections }))}
                      className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded font-mono hover:bg-[#D4AF37]/20 transition-all cursor-pointer flex-shrink-0"
                    >
                      Reset Layout
                    </button>
                  </div>

                  <div className="space-y-3">
                    {siteConfig.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${section.enabled ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                          <div>
                            <p className="text-[11px] font-bold text-white">{section.label}</p>
                            <p className="text-[9px] text-gray-500 font-mono uppercase">{section.enabled ? "Visible" : "Hidden"}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 bg-black rounded-lg p-1 border border-white/10">
                          <button
                            onClick={() => {
                              const newSections = siteConfig.sections.map(s => 
                                s.id === section.id ? { ...s, enabled: true } : s
                              );
                              setSiteConfig(prev => ({ ...prev, sections: newSections }));
                            }}
                            className={`px-3 py-1 text-[9px] font-bold uppercase rounded flex-shrink-0 ${section.enabled ? "bg-green-500 text-black" : "text-gray-500 hover:text-white"}`}
                          >
                            Enable
                          </button>
                          <button
                            onClick={() => {
                              const newSections = siteConfig.sections.map(s => 
                                s.id === section.id ? { ...s, enabled: false } : s
                              );
                              setSiteConfig(prev => ({ ...prev, sections: newSections }));
                            }}
                            className={`px-3 py-1 text-[9px] font-bold uppercase rounded flex-shrink-0 ${!section.enabled ? "bg-red-500 text-white" : "text-gray-500 hover:text-white"}`}
                          >
                            Disable
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {/* SECTION 3: Hero Section Settings */}
                {activeMobileTab !== 'theme' && (
                  <div id="settings-hero" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 3: Hero Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Hero Content</span>
                  </div>


                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center text-[10px] font-mono text-gray-500 uppercase mb-2">
                        Main Headline
                        <HelpTooltip text="The very first big text clients see when they land on your site." />
                      </label>
                      <input
                        type="text"
                        value={siteConfig.heroHeadline || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, heroHeadline: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                        placeholder="Master the Art of Hair"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-[10px] font-mono text-gray-500 uppercase mb-2">
                        Sub Headline
                        <HelpTooltip text="A brief sentence below the main headline that explains what makes you special." />
                      </label>
                      <textarea
                        value={siteConfig.heroSubHeadline || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, heroSubHeadline: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] outline-none h-20 resize-none"
                        placeholder="Redefining luxury beauty..."
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-[10px] font-mono text-gray-500 uppercase mb-2">
                        Call To Action Button Text
                        <HelpTooltip text="What the main booking button should say, e.g. 'Book Now' or 'See Prices'." />
                      </label>
                      <input
                        type="text"
                        value={siteConfig.heroCtaText || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, heroCtaText: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                        placeholder="Book Appointment"
                      />
                    </div>



                  </div>
                </div>
              )}

                {/* SECTION 4: About Section Settings */}
                {activeMobileTab !== 'theme' && (
                  <>
                    <div id="settings-about" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 4: About Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Narrative</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Section Title</label>
                      <input
                        type="text"
                        value={siteConfig.aboutTitle || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, aboutTitle: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] outline-none"
                        placeholder="Our Story"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="block text-[10px] font-mono text-gray-500 uppercase">Short Description</label>
                        <span className="text-[10px] font-mono text-gray-600">{(siteConfig.aboutDescription || "").length}/300</span>
                      </div>
                      <textarea
                        maxLength={300}
                        value={siteConfig.aboutDescription || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, aboutDescription: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] outline-none h-24 resize-none"
                        placeholder="We believe that..."
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 5: Services Section Settings */}
                <div id="settings-services" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 5: Services Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Service Display</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Show Service Prices</span>
                        <span className="text-[9px] text-gray-500 font-mono">Toggle currency and rate visibility</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showServicePrices: !prev.showServicePrices }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showServicePrices ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showServicePrices ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Show Service Images</span>
                        <span className="text-[9px] text-gray-500 font-mono">Toggle thumbnail visuals</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showServiceImages: !prev.showServiceImages }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showServiceImages ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showServiceImages ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Show Service Duration</span>
                        <span className="text-[9px] text-gray-500 font-mono">Toggle treatment time labels</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showServiceDuration: !prev.showServiceDuration }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showServiceDuration ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showServiceDuration ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: Staff Section Settings */}
                <div id="settings-staff" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 6: Staff Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Team Display</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Show Staff Photos</span>
                        <span className="text-[9px] text-gray-500 font-mono">Toggle headshot visibility</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showStaffPhotos: !prev.showStaffPhotos }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showStaffPhotos ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showStaffPhotos ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Show Experience</span>
                        <span className="text-[9px] text-gray-500 font-mono">Toggle tenure labels</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showStaffExperience: !prev.showStaffExperience }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showStaffExperience ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showStaffExperience ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Show Ratings</span>
                        <span className="text-[9px] text-gray-500 font-mono">Toggle star ratings</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showStaffRatings: !prev.showStaffRatings }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showStaffRatings ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showStaffRatings ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 7: Gallery Section Settings */}
                <div id="settings-gallery" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 7: Gallery Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Portfolio</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono text-gray-500 uppercase">Gallery Layout</label>
                      <div className="flex gap-1 bg-black rounded-lg p-1 border border-white/10">
                        {["grid", "masonry"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setSiteConfig(prev => ({ ...prev, galleryLayout: type as any }))}
                            className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded transition-all ${
                              siteConfig.galleryLayout === type ? "bg-[#D4AF37] text-black" : "text-gray-500 hover:text-white"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono text-gray-500 uppercase">Images Per Row (Desktop)</label>
                      <div className="flex gap-1 bg-black rounded-lg p-1 border border-white/10">
                        {[2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() => setSiteConfig(prev => ({ ...prev, galleryImagesPerRow: num as any }))}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                              siteConfig.galleryImagesPerRow === num ? "bg-[#D4AF37] text-black" : "text-gray-500 hover:text-white"
                            }`}
                          >
                            {num} Items
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 8: Reviews Section Settings */}
                <div id="settings-reviews" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 8: Reviews Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Social Proof</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show Rating Stars</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showReviewStars: !prev.showReviewStars }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showReviewStars ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showReviewStars ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show Customer Names</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showReviewCustomerNames: !prev.showReviewCustomerNames }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showReviewCustomerNames ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showReviewCustomerNames ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show Review Date</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showReviewDate: !prev.showReviewDate }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showReviewDate ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showReviewDate ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 9: Contact Section Settings */}
                <div id="settings-contact" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 9: Contact Section Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Engagement</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show Address</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showContactAddress: !prev.showContactAddress }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showContactAddress ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showContactAddress ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show Phone Number</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showContactPhone: !prev.showContactPhone }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showContactPhone ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showContactPhone ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show WhatsApp Button</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showContactWhatsApp: !prev.showContactWhatsApp }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showContactWhatsApp ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showContactWhatsApp ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[11px] font-bold text-white">Show Google Maps</span>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showContactMaps: !prev.showContactMaps }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showContactMaps ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showContactMaps ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 10: Homepage Announcement Bar */}
                <div id="settings-announcement" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 10: Homepage Announcement Bar</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Conversion</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Enable Top Bar</span>
                        <span className="text-[9px] text-gray-500 font-mono">Optional promotion header</span>
                      </div>
                      <button 
                        onClick={() => setSiteConfig(prev => ({ ...prev, showAnnouncementBar: !prev.showAnnouncementBar }))}
                        className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${siteConfig.showAnnouncementBar ? "bg-green-500" : "bg-gray-700"}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${siteConfig.showAnnouncementBar ? "left-6" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase">Announcement Text</label>
                      <input
                        type="text"
                        className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37] outline-none"
                        value={siteConfig.announcementText || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, announcementText: e.target.value }))}
                        placeholder="e.g. 20% Off This Week"
                      />
                      <div className="flex flex-wrap gap-2 pt-1">
                        {["20% Off This Week", "Book Online & Skip Waiting"].map((hint) => (
                          <button
                            key={hint}
                            onClick={() => setSiteConfig(prev => ({ ...prev, announcementText: hint }))}
                            className="text-[9px] font-mono text-gray-600 hover:text-[#D4AF37] transition-colors"
                          >
                            "{hint}"
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase">Redirect URL</label>
                      <input
                        type="text"
                        className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37] outline-none"
                        value={siteConfig.announcementRedirectUrl || ""}
                        onChange={(e) => setSiteConfig(prev => ({ ...prev, announcementRedirectUrl: e.target.value }))}
                        placeholder="e.g. https://booking.com/my-salon"
                      />
                      <p className="text-[9px] text-gray-500 font-mono">Optional: Users click the bar to visit this link</p>
                    </div>
                  </div>
                </div>
                </>
              )}

                {/* Custom Color Palette (SECTION 2 - EXPANDABLE) */}
                <div id="settings-palette" className="bg-[#111] border border-white/[0.04] rounded-xl overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setIsColorPaletteExpanded(!isColorPaletteExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors border-b border-white/[0.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-[#D4AF37]" />
                      <div className="text-left flex items-center">
                        <div>
                          <span className="text-[11px] font-mono uppercase text-[#D4AF37] font-semibold block">Custom Color Palette</span>
                          <span className="text-[9px] text-gray-400 font-light">Fine-tune individual theme channels or input precision hex codes</span>
                        </div>
                        <div className="ml-2">
                          <HelpTooltip text="Advanced: Manually pick colors instead of using a pre-made theme." />
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${(isColorPaletteExpanded || activeMobileTab === 'theme') ? "rotate-180" : ""}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${(isColorPaletteExpanded || activeMobileTab === 'theme') ? "max-h-[1200px] p-4 opacity-100 space-y-4" : "max-h-0 opacity-0"}`}>
                    
                    {/* Extract from Image */}
                    <div className="bg-black/30 border border-dashed border-white/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <span className="text-xs font-semibold text-white block mb-1">Magic Extraction</span>
                        <span className="text-[10px] text-gray-400">Upload any image to instantly generate a matching color palette.</span>
                      </div>
                      <div className="shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={paletteImageRef}
                          onChange={handleExtractPaletteFromImage}
                        />
                        <button
                          type="button"
                          onClick={() => paletteImageRef.current?.click()}
                          disabled={isExtractingColors}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-[#D4AF37] flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isExtractingColors ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {isExtractingColors ? "Extracting..." : "Upload Image"}
                        </button>
                      </div>
                    </div>

                    {extractedPalettePreview && (
                      <div className="bg-black/40 border border-[#D4AF37]/20 rounded-xl p-4 space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">Live Palette Preview</span>
                          <button onClick={() => setExtractedPalettePreview(null)} className="text-gray-500 hover:text-white p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {/* Interactive Preview Container */}
                        <div 
                          className="rounded-lg p-5 flex flex-col items-center justify-center text-center transition-colors duration-300 relative overflow-hidden shadow-inner border border-white/5"
                          style={{ backgroundColor: extractedPalettePreview.palette[extractedPalettePreview.backgroundIndex] }}
                        >
                          <h4 
                            className="text-lg font-bold mb-1.5 transition-colors duration-300"
                            style={{ color: getContrastRatio(extractedPalettePreview.palette[extractedPalettePreview.buttonIndex], extractedPalettePreview.palette[extractedPalettePreview.backgroundIndex]) > 4.5 ? extractedPalettePreview.palette[extractedPalettePreview.buttonIndex] : '#ffffff' }}
                          >
                            Hero Headline
                          </h4>
                          <p 
                            className="text-[10px] mb-4 opacity-80 transition-colors duration-300 max-w-[80%]"
                            style={{ color: getContrastRatio('#ffffff', extractedPalettePreview.palette[extractedPalettePreview.backgroundIndex]) > 4.5 ? '#ffffff' : '#000000' }}
                          >
                            This is how your theme will look. Use the sliders below to test combinations.
                          </p>
                          <button 
                            className="px-5 py-2 rounded-full text-xs font-bold transition-colors duration-300 shadow-md"
                            style={{ 
                              backgroundColor: extractedPalettePreview.palette[extractedPalettePreview.buttonIndex],
                              color: getContrastRatio('#ffffff', extractedPalettePreview.palette[extractedPalettePreview.buttonIndex]) > 4.5 ? '#ffffff' : '#000000'
                            }}
                          >
                            Sample Button
                          </button>
                        </div>

                        {/* Sliders for picking colors */}
                        <div className="space-y-4 pt-2">
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <label className="text-[9px] font-mono text-gray-400 uppercase">Background Color</label>
                              <div className="w-4 h-4 rounded shadow-sm border border-white/10" style={{ backgroundColor: extractedPalettePreview.palette[extractedPalettePreview.backgroundIndex] }} />
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={extractedPalettePreview.palette.length - 1} 
                              step="1"
                              value={extractedPalettePreview.backgroundIndex}
                              onChange={(e) => setExtractedPalettePreview(prev => prev ? {...prev, backgroundIndex: parseInt(e.target.value)} : null)}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                            />
                            <div className="flex justify-between mt-1 px-1">
                              {extractedPalettePreview.palette.map((c, i) => (
                                <div key={`bg-${i}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c, opacity: extractedPalettePreview.backgroundIndex === i ? 1 : 0.3 }} />
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <label className="text-[9px] font-mono text-gray-400 uppercase">Button & Accent</label>
                              <div className="w-4 h-4 rounded shadow-sm border border-white/10" style={{ backgroundColor: extractedPalettePreview.palette[extractedPalettePreview.buttonIndex] }} />
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={extractedPalettePreview.palette.length - 1} 
                              step="1"
                              value={extractedPalettePreview.buttonIndex}
                              onChange={(e) => setExtractedPalettePreview(prev => prev ? {...prev, buttonIndex: parseInt(e.target.value)} : null)}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                            />
                            <div className="flex justify-between mt-1 px-1">
                              {extractedPalettePreview.palette.map((c, i) => (
                                <div key={`btn-${i}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c, opacity: extractedPalettePreview.buttonIndex === i ? 1 : 0.3 }} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const btnColor = extractedPalettePreview.palette[extractedPalettePreview.buttonIndex];
                            const bgColor = extractedPalettePreview.palette[extractedPalettePreview.backgroundIndex];
                            // Try to pick a sensible secondary color
                            const remaining = extractedPalettePreview.palette.filter(c => c !== btnColor && c !== bgColor);
                            const secondaryColor = remaining.length > 0 ? remaining[0] : bgColor;
                            
                            setSiteConfig(prev => ({
                              ...prev,
                              primaryColor: btnColor,
                              accentColor: btnColor,
                              buttonColor: btnColor,
                              secondaryColor: secondaryColor,
                              backgroundColor: bgColor,
                              textColor: getContrastRatio('#ffffff', bgColor) > 4.5 ? '#ffffff' : '#000000',
                            }));
                            setExtractedPalettePreview(null);
                            notifyShort("Theme applied successfully!");
                          }}
                          className="w-full py-2.5 mt-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                        >
                          Apply to Theme
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* 1. Primary Color */}
                      <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg space-y-1.5 shadow-sm">
                        <label className="block text-[8.5px] font-mono text-gray-400 uppercase font-semibold">Primary Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="w-7 h-7 rounded border border-white/10 cursor-pointer shrink-0 p-0"
                            value={siteConfig.primaryColor}
                            onChange={e => setSiteConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            maxLength={7}
                            className="w-full bg-stone-900 border border-white/[0.08] focus:border-[#D4AF37] text-[10px] text-white font-mono rounded px-1.5 py-1 outline-none text-center"
                            value={siteConfig.primaryColor}
                            onChange={e => {
                              const v = e.target.value;
                              if (v.startsWith("#") && v.length <= 7) {
                                setSiteConfig(prev => ({ ...prev, primaryColor: v }));
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 2. Secondary Color */}
                      <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg space-y-1.5 shadow-sm">
                        <label className="block text-[8.5px] font-mono text-gray-400 uppercase font-semibold">Secondary Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="w-7 h-7 rounded border border-white/10 cursor-pointer shrink-0 p-0"
                            value={siteConfig.secondaryColor}
                            onChange={e => setSiteConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            maxLength={7}
                            className="w-full bg-stone-900 border border-white/[0.08] focus:border-[#D4AF37] text-[10px] text-white font-mono rounded px-1.5 py-1 outline-none text-center"
                            value={siteConfig.secondaryColor}
                            onChange={e => {
                              const v = e.target.value;
                              if (v.startsWith("#") && v.length <= 7) {
                                setSiteConfig(prev => ({ ...prev, secondaryColor: v }));
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 3. Accent Color */}
                      <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg space-y-1.5 shadow-sm">
                        <label className="block text-[8.5px] font-mono text-gray-400 uppercase font-semibold">Accent Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="w-7 h-7 rounded border border-white/10 cursor-pointer shrink-0 p-0"
                            value={siteConfig.accentColor || siteConfig.primaryColor}
                            onChange={e => setSiteConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            maxLength={7}
                            className="w-full bg-stone-900 border border-white/[0.08] focus:border-[#D4AF37] text-[10px] text-white font-mono rounded px-1.5 py-1 outline-none text-center"
                            value={siteConfig.accentColor || siteConfig.primaryColor}
                            onChange={e => {
                              const v = e.target.value;
                              if (v.startsWith("#") && v.length <= 7) {
                                setSiteConfig(prev => ({ ...prev, accentColor: v }));
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 4. Background Color */}
                      <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg space-y-1.5 shadow-sm">
                        <label className="block text-[8.5px] font-mono text-gray-400 uppercase font-semibold">Background Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="w-7 h-7 rounded border border-white/10 cursor-pointer shrink-0 p-0"
                            value={siteConfig.backgroundColor || siteConfig.secondaryColor}
                            onChange={e => setSiteConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            maxLength={7}
                            className="w-full bg-stone-900 border border-white/[0.08] focus:border-[#D4AF37] text-[10px] text-white font-mono rounded px-1.5 py-1 outline-none text-center"
                            value={siteConfig.backgroundColor || siteConfig.secondaryColor}
                            onChange={e => {
                              const v = e.target.value;
                              if (v.startsWith("#") && v.length <= 7) {
                                setSiteConfig(prev => ({ ...prev, backgroundColor: v }));
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 5. Text Color */}
                      <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg space-y-1.5 shadow-sm">
                        <label className="block text-[8.5px] font-mono text-gray-400 uppercase font-semibold">Text Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="w-7 h-7 rounded border border-white/10 cursor-pointer shrink-0 p-0"
                            value={siteConfig.textColor || "#FFFFFF"}
                            onChange={e => setSiteConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            maxLength={7}
                            className="w-full bg-stone-900 border border-white/[0.08] focus:border-[#D4AF37] text-[10px] text-white font-mono rounded px-1.5 py-1 outline-none text-center"
                            value={siteConfig.textColor || "#FFFFFF"}
                            onChange={e => {
                              const v = e.target.value;
                              if (v.startsWith("#") && v.length <= 7) {
                                setSiteConfig(prev => ({ ...prev, textColor: v }));
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 6. Button Color */}
                      <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-lg space-y-1.5 shadow-sm">
                        <label className="block text-[8.5px] font-mono text-gray-400 uppercase font-semibold">Button Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            className="w-7 h-7 rounded border border-white/10 cursor-pointer shrink-0 p-0"
                            value={siteConfig.buttonColor}
                            onChange={e => setSiteConfig(prev => ({ ...prev, buttonColor: e.target.value }))}
                          />
                          <input
                            type="text"
                            maxLength={7}
                            className="w-full bg-stone-900 border border-white/[0.08] focus:border-[#D4AF37] text-[10px] text-white font-mono rounded px-1.5 py-1 outline-none text-center"
                            value={siteConfig.buttonColor}
                            onChange={e => {
                              const v = e.target.value;
                              if (v.startsWith("#") && v.length <= 7) {
                                setSiteConfig(prev => ({ ...prev, buttonColor: v }));
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CONTRAST CALCULATION PREVIEW */}
                    {(() => {
                      const ratio = getContrastRatio(siteConfig.primaryColor, siteConfig.secondaryColor);
                      const formattedRatio = ratio.toFixed(2);
                      
                      let statusLabel = "";
                      let adviceText = "";
                      let indicatorColor = "";
                      
                      if (ratio >= 7.0) {
                        statusLabel = "WCAG AAA Pass";
                        adviceText = "Optimal contrast! Perfect legibility for all body text, buttons, and display headings.";
                        indicatorColor = "border-emerald-500/25 bg-emerald-950/20 text-emerald-400";
                      } else if (ratio >= 4.5) {
                        statusLabel = "WCAG AA Pass";
                        adviceText = "Highly legible. Fully meets core standard accessibility for text overlay graphics.";
                        indicatorColor = "border-[#D4AF37]/25 bg-[#D4AF37]/5 text-[#D4AF37]";
                      } else if (ratio >= 3.0) {
                        statusLabel = "AA Large Only";
                        adviceText = "Marginal readability. Suitable for thick headers or large elements, but strainful for small descriptions.";
                        indicatorColor = "border-amber-500/25 bg-amber-950/20 text-amber-400";
                      } else {
                        statusLabel = "Contrast Deficit";
                        adviceText = "Critical warning: Contrast is extremely poor. Users will struggle to read text in this combination.";
                        indicatorColor = "border-red-500/25 bg-red-950/20 text-red-400";
                      }

                      return (
                        <div className="bg-black/40 border border-white/[0.04] p-3 rounded-xl space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono uppercase text-gray-505">Primary to Background Contrast Checker</span>
                            <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${indicatorColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center p-3 opacity-90 rounded-lg bg-black border border-white/[0.03] space-y-0.5 min-w-[80px] text-center">
                              <span className="text-xl font-mono font-bold text-white tracking-tighter">{formattedRatio}:1</span>
                              <span className="text-[8px] font-mono uppercase text-gray-500">Ratio</span>
                            </div>
                            <div className="text-[11px] leading-snug space-y-1">
                              <p className="text-gray-400 font-light text-[10.5px] leading-relaxed">{adviceText}</p>
                            </div>
                          </div>

                          {/* Interactive Live Swatch Bar */}
                          <div 
                            className="w-full h-8 rounded-lg flex items-center justify-center text-xs font-semibold relative overflow-hidden transition-all border border-white/[0.06]"
                            style={{ backgroundColor: siteConfig.backgroundColor || siteConfig.secondaryColor, color: siteConfig.primaryColor }}
                          >
                            <span className="relative z-10 tracking-widest uppercase">Live Swatch Text Preview</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* SECTION 11 - Typography Settings */}
                {activeMobileTab !== 'theme' && (
                  <div className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 11: Typography Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">White-Label fonts</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Heading Font Controls */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-semibold">Heading Font</label>
                      <select
                        className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37] outline-none cursor-pointer"
                        value={siteConfig.headingFont || "Playfair Display"}
                        onChange={e => setSiteConfig(prev => ({ ...prev, headingFont: e.target.value }))}
                      >
                        <option value="Playfair Display">Playfair Display (Serif)</option>
                        <option value="Poppins">Poppins (Geometric Sans)</option>
                        <option value="Montserrat">Montserrat (Classic Sans)</option>
                        <option value="Inter">Inter (Timeless Sans)</option>
                      </select>
                    </div>

                    {/* Body Font Controls */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-semibold">Body Font</label>
                      <select
                        className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37] outline-none cursor-pointer"
                        value={siteConfig.bodyFont || "Inter"}
                        onChange={e => setSiteConfig(prev => ({ ...prev, bodyFont: e.target.value }))}
                      >
                        <option value="Playfair Display">Playfair Display (Serif)</option>
                        <option value="Poppins">Poppins (Geometric Sans)</option>
                        <option value="Montserrat">Montserrat (Classic Sans)</option>
                        <option value="Inter">Inter (Timeless Sans)</option>
                      </select>
                    </div>
                  </div>

                  {/* LIVE SAMPLE PREVIEW */}
                  <div className="bg-black/40 border border-white/[0.03] p-3.5 rounded-xl space-y-2.5">
                    <span className="block text-[9px] font-mono uppercase text-gray-400">Live Typography Sample Preview</span>
                    <div className="p-4 rounded-lg bg-[#0e0e0e] border border-white/[0.04]">
                      <span 
                        className="text-[9px] tracking-wider uppercase font-mono block mb-1"
                        style={{ color: siteConfig.accentColor || siteConfig.primaryColor }}
                      >
                        Exclusive Hair & Scalp Rituals
                      </span>
                      <h3 
                        className="text-lg font-bold tracking-tight text-white mb-2 leading-tight"
                        style={{ fontFamily: `'${siteConfig.headingFont || "Playfair Display"}', serif` }}
                      >
                        Where Parisian Artistry Meets Science
                      </h3>
                      <p 
                        className="text-xs text-stone-300 font-light leading-relaxed"
                        style={{ fontFamily: `'${siteConfig.bodyFont || "Inter"}', sans-serif` }}
                      >
                        Experience tailor-made botanical formulations designed specifically for your organic fiber health. Every consultation is customized.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-between items-center text-[9px] font-mono text-gray-500 uppercase px-1">
                      <span>Header: {siteConfig.headingFont || "Playfair Display"}</span>
                      <span>Body: {siteConfig.bodyFont || "Inter"}</span>
                    </div>
                  </div>

                  {/* Fallback Legacy Font Class control */}
                  <div className="pt-2.5 border-t border-white/[0.03] flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-[9px] font-mono uppercase text-[#D4AF37] mb-0.5">Underlying Preset Target</span>
                      <p className="text-[10px] text-gray-400 font-light leading-normal">Ensures browser safety overrides mapping styles correctly</p>
                    </div>
                    <select
                      className="bg-black/60 border border-white/[0.07] text-[10px] text-gray-300 rounded-md p-1.5 focus:border-[#D4AF37] outline-none cursor-pointer"
                      value={siteConfig.fontFamily}
                      onChange={e => setSiteConfig(prev => ({ ...prev, fontFamily: e.target.value as any }))}
                    >
                      <option value="serif">Serif (Playfair Accent)</option>
                      <option value="sans">Sans (Inter Accent)</option>
                      <option value="mono">Mono (Space Accent)</option>
                    </select>
                  </div>
                </div>
                )}

                {/* SECTION 12: Buttons & Shape Styling */}
                {activeMobileTab !== 'theme' && (
                  <>
                    <div className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 12: Buttons & Shape Styling</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">White-Label Shape</span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase font-semibold">Shape Profile (Rounding)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "sharp", label: "Sharp Style", desc: "Hard 0px borders" },
                        { id: "rounded", label: "Rounded curves", desc: "Bespoke 8px radius" },
                        { id: "pill", label: "Pilled edge", desc: "Max fluid radius" }
                      ].map(item => {
                        const isChosen = (siteConfig.buttonStyle || "rounded") === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSiteConfig(prev => ({ ...prev, buttonStyle: item.id as any }))}
                            className={`p-2.5 rounded-lg border text-left transition-all duration-300 bg-black/45 hover:bg-black/80 flex flex-col justify-between h-auto cursor-pointer ${
                              isChosen
                                ? "border-[#D4AF37] bg-[#D4AF37]/[0.02]"
                                : "border-white/[0.05] hover:border-white/12"
                            }`}
                          >
                            <span className="text-xs font-bold text-white block mb-0.5">{item.label}</span>
                            <span className="text-[8.5px] leading-tight text-gray-400 font-light block">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LIVE SAMPLE PREVIEW */}
                  <div className="bg-black/40 border border-white/[0.03] p-3 rounded-xl space-y-3">
                    <span className="block text-[9px] font-mono uppercase text-gray-400">Live Shape Button Preview</span>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-3.5 rounded-lg bg-[#0e0e0e] border border-white/[0.04]">
                      <button
                        type="button"
                        className="px-5 py-2.5 text-xs text-center font-bold tracking-wide transition-all text-black cursor-default select-none shadow hover:opacity-95"
                        style={{
                          backgroundColor: siteConfig.buttonColor || "#D4AF37",
                          color: (siteConfig.buttonColor || "#D4AF37").toLowerCase() === "#d4af37" ? "#111" : "#fff",
                          borderRadius:
                            siteConfig.buttonStyle === "sharp" ? "0px" :
                            siteConfig.buttonStyle === "pill" ? "9999px" :
                            "8px"
                        }}
                      >
                        Book Appointment
                      </button>

                      <button
                        type="button"
                        className="px-5 py-2.5 text-xs text-center font-bold tracking-wide transition-all bg-black/40 border text-stone-200 cursor-default select-none hover:bg-black/70"
                        style={{
                          borderColor: "rgba(255, 255, 255, 0.15)",
                          borderRadius:
                            siteConfig.buttonStyle === "sharp" ? "0px" :
                            siteConfig.buttonStyle === "pill" ? "9999px" :
                            "8px"
                        }}
                      >
                        View Menu
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase px-1">
                      <span>Interactive profile: {siteConfig.buttonStyle || "rounded"}</span>
                      <span>Render: {
                        siteConfig.buttonStyle === "sharp" ? "Square Corners (0px)" :
                        siteConfig.buttonStyle === "pill" ? "Capsule Pill (9999px)" :
                        "Standard Round (8px)"
                      }</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 13: Website Layout Style */}
                <div id="settings-layout" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 13: Website Layout Style</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Structural Engine</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "luxury",
                        name: "Luxury Hero Layout",
                        desc: "Massive cinematic banner with centered typography and immersive scroll effects.",
                        thumb: (color: string) => (
                          <div className="w-full h-16 bg-black relative overflow-hidden rounded border border-white/5">
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10">
                              <div className="w-10 h-1 rounded-full bg-white/20" />
                              <div className="w-14 h-2 rounded-sm" style={{ backgroundColor: color }} />
                              <div className="w-8 h-1 rounded-full bg-white/10" />
                              <div className="w-6 h-2 rounded-sm mt-1 bg-white/30" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/5 flex gap-1 px-1 items-center">
                              <div className="w-3 h-2 rounded bg-white/10" />
                              <div className="w-3 h-2 rounded bg-white/10" />
                            </div>
                          </div>
                        )
                      },
                      {
                        id: "modern",
                        name: "Modern Cards Layout",
                        desc: "Asymmetric grid-first approach optimized for service discovery and visual balance.",
                        thumb: (color: string) => (
                          <div className="w-full h-16 bg-black relative p-2 flex flex-col gap-1 rounded border border-white/5">
                            <div className="flex justify-between items-center mb-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                              <div className="w-8 h-1 rounded bg-white/20" />
                            </div>
                            <div className="grid grid-cols-3 gap-1 flex-1">
                              <div className="bg-white/10 rounded" />
                              <div className="bg-white/5 rounded" />
                              <div className="bg-white/10 rounded" />
                            </div>
                          </div>
                        )
                      },
                      {
                        id: "compact",
                        name: "Compact Business",
                        desc: "Information-dense layout prioritising bookings, hours, and navigation efficiency.",
                        thumb: (color: string) => (
                          <div className="w-full h-16 bg-black relative p-2 flex gap-2 rounded border border-white/5">
                            <div className="w-1/3 bg-white/10 rounded h-full" />
                            <div className="flex-1 flex flex-col gap-1 justify-center">
                              <div className="w-full h-1.5 rounded bg-white/20" />
                              <div className="w-3/4 h-1.5 rounded" style={{ backgroundColor: color }} />
                              <div className="flex gap-1">
                                <div className="w-4 h-3 rounded bg-white/5" />
                                <div className="w-4 h-3 rounded bg-white/5" />
                              </div>
                            </div>
                          </div>
                        )
                      },
                      {
                        id: "showcase",
                        name: "Premium Showcase",
                        desc: "Elegant editorial portfolio style highlighting artist quality through large visuals.",
                        thumb: (color: string) => (
                          <div className="w-full h-16 bg-black relative p-1 grid grid-cols-4 gap-0.5 rounded border border-white/5">
                            <div className="col-span-2 row-span-2 bg-white/10 rounded-sm" />
                            <div className="col-span-2 bg-white/5 rounded-sm" />
                            <div className="bg-white/20 rounded-sm" style={{ backgroundColor: color }} />
                            <div className="bg-white/5 rounded-sm" />
                          </div>
                        )
                      }
                    ].map(style => {
                      const isChosen = (siteConfig.layoutStyle || "luxury") === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSiteConfig(prev => ({ ...prev, layoutStyle: style.id as any }))}
                          className={`group relative text-left p-3 rounded-xl border transition-all duration-300 bg-black/45 hover:bg-black/80 flex flex-col gap-3 cursor-pointer ${
                            isChosen
                              ? "border-[#D4AF37] bg-[#D4AF37]/[0.02]"
                              : "border-white/[0.05] hover:border-white/15"
                          }`}
                        >
                          <div className="w-full">
                            {style.thumb(siteConfig.primaryColor)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-white tracking-tight">{style.name}</span>
                              {isChosen && <Check className="w-3 h-3 text-[#D4AF37]" />}
                            </div>
                            <p className="text-[9px] leading-relaxed text-gray-400 font-light line-clamp-2">
                              {style.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 14: Card & Container Styles */}
                <div id="settings-cards" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 14: Card & Container Styles</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Visual Depth</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "flat", label: "Flat Design", desc: "No shadows, clean borders" },
                      { id: "elevated", label: "Elevated Cards", desc: "Soft subtle depth" },
                      { id: "glass", label: "Glassmorphism", desc: "Frosted blur effects" },
                      { id: "luxury", label: "Luxury Shadow", desc: "Deep rich presence" }
                    ].map(style => {
                      const isChosen = (siteConfig.cardStyle || "elevated") === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSiteConfig(prev => ({ ...prev, cardStyle: style.id as any }))}
                          className={`p-3 rounded-xl border text-left transition-all duration-300 bg-black/45 hover:bg-black/60 flex flex-col justify-between h-auto cursor-pointer ${
                            isChosen
                              ? "border-[#D4AF37] bg-[#D4AF37]/[0.02]"
                              : "border-white/[0.05] hover:border-white/12"
                          }`}
                        >
                          <span className="text-xs font-bold text-white block mb-0.5">{style.label}</span>
                          <span className="text-[8.5px] leading-tight text-gray-400 font-light block line-clamp-1">{style.desc}</span>
                          
                          <div className="mt-3 relative h-10 w-full rounded-lg overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center">
                             <div className={`w-3/4 h-1/2 rounded ${
                               style.id === "flat" ? "bg-white/10 border border-white/10" :
                               style.id === "elevated" ? "bg-white/15 shadow-lg border border-white/5" :
                               style.id === "glass" ? "bg-white/5 backdrop-blur-sm border border-white/20" :
                               "bg-zinc-800 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] border border-white/5"
                             }`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 15: Header & Navigation Style */}
                <div id="settings-header" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 15: Header & Navigation Style</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Navigation</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Header Layout</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "left", label: "Left Logo" },
                          { id: "center", label: "Center Logo" },
                          { id: "split", label: "Split Nav" }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSiteConfig(prev => ({ ...prev, headerLayout: opt.id as any }))}
                            className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition-all ${
                              siteConfig.headerLayout === opt.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20 text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Menu Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "standard", label: "Standard" },
                          { id: "floating", label: "Floating" },
                          { id: "sticky", label: "Sticky" }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSiteConfig(prev => ({ ...prev, menuStyle: opt.id as any }))}
                            className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition-all ${
                              siteConfig.menuStyle === opt.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20 text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 16: Footer Appearance */}
                <div id="settings-footer" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 16: Footer Appearance</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">End Experience</span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1">Background</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={siteConfig.footerBgColor || "#0A0A0A"}
                            onChange={e => setSiteConfig(prev => ({ ...prev, footerBgColor: e.target.value }))}
                            className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={siteConfig.footerBgColor || "#0A0A0A"}
                            onChange={e => setSiteConfig(prev => ({ ...prev, footerBgColor: e.target.value }))}
                            className="flex-1 bg-black border border-white/10 text-[10px] text-white px-2 py-1 rounded"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-gray-500 uppercase mb-1">Text Color</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={siteConfig.footerTextColor || "#FFFFFF"}
                            onChange={e => setSiteConfig(prev => ({ ...prev, footerTextColor: e.target.value }))}
                            className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={siteConfig.footerTextColor || "#FFFFFF"}
                            onChange={e => setSiteConfig(prev => ({ ...prev, footerTextColor: e.target.value }))}
                            className="flex-1 bg-black border border-white/10 text-[10px] text-white px-2 py-1 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2">Footer Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "simple", label: "Simple" },
                          { id: "modern", label: "Modern" },
                          { id: "luxury", label: "Luxury" }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setSiteConfig(prev => ({ ...prev, footerStyle: opt.id as any }))}
                            className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition-all ${
                              siteConfig.footerStyle === opt.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20 text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 17: Animation Settings */}
                <div id="settings-animations" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 17: Animation Settings</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Dynamics</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "hover", label: "Hover Effects" },
                      { id: "scroll", label: "Scroll Animation" },
                      { id: "fade", label: "Fade Effects" },
                      { id: "glow", label: "Button Glow" },
                      { id: "smoothScroll", label: "Smooth Scroll" }
                    ].map(anim => (
                      <button
                        key={anim.id}
                        onClick={() => setSiteConfig(prev => ({
                          ...prev,
                          animations: {
                            ...(prev.animations || DEFAULT_CONFIG.animations!),
                            [anim.id]: !(prev.animations as any)?.[anim.id]
                          }
                        }))}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          (siteConfig.animations as any)?.[anim.id] ? "border-[#D4AF37]/40 bg-[#D4AF37]/5 text-white" : "border-white/5 bg-black/40 text-gray-500"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase">{anim.label}</span>
                        {(siteConfig.animations as any)?.[anim.id] && <Check className="w-3 h-3 text-[#D4AF37]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 18: Dark / Light Mode */}
                <div id="settings-mode" className="bg-[#111] border border-white/[0.04] rounded-xl p-4 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[11.5px] font-mono uppercase text-[#D4AF37] font-semibold tracking-wider">SECTION 18: Dark / Light Mode</span>
                    <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Foundation</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "dark", label: "Dark" },
                      { id: "light", label: "Light" },
                      { id: "auto", label: "Auto" }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSiteConfig(prev => ({ ...prev, themeMode: opt.id as any }))}
                        className={`py-2.5 text-[10px] font-bold rounded-lg border transition-all ${
                          siteConfig.themeMode === opt.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20 text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 19: Theme Actions */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => {
                      localStorage.setItem("nexora_draft_site", JSON.stringify(siteConfig));
                      notifyShort("Appearance settings saved locally!");
                    }}
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#bda03c] text-black font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Appearance Settings
                  </button>

                  <button
                    onClick={handleShareDraft}
                    className="w-full py-3.5 bg-white/5 border border-white/10 text-[#D4AF37] font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4 animate-pulse" />
                    Share Appearance Link
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => window.open(window.location.href, "_blank")}
                      className="py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview Website
                    </button>
                    <button
                      onClick={handleRestoreDefaults}
                      className="py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-red-400" />
                      Reset to Default
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          )}


            {/* TAB: SECTIONS LAYOUT ROWS */}
            {activeStep === 2 && activeMobileTab !== 'theme' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-[#e2cc83]/5 border border-[#e2cc83]/25 rounded-xl space-y-1">
                  <span className="text-[10px] text-[#e2cc83] uppercase tracking-wider font-bold">Homepage Section Architect</span>
                  <p className="text-xs text-gray-300">Easily reorder the sections on your website by moving them up or down, or turn them off completely.</p>
                </div>

                <div className="bg-[#111] border border-white/[0.04] p-3 rounded-xl space-y-2">
                  {siteConfig.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between bg-black px-3 py-2.5 rounded-lg border border-white/[0.05] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500 cursor-move hover:text-white transition-colors" title="Drag to reorder">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 border-l border-white/[0.1] pl-2">
                          <button
                            onClick={() => moveSection(idx, "up")}
                            disabled={idx === 0}
                            className="p-0.5 hover:text-[#D4AF37] disabled:opacity-30 cursor-pointer text-gray-400"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveSection(idx, "down")}
                            disabled={idx === siteConfig.sections.length - 1}
                            className="p-0.5 hover:text-[#D4AF37] disabled:opacity-30 cursor-pointer text-gray-400"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="ml-2">
                          <span className="text-xs font-semibold text-white">{sec.label}</span>
                          <span className="block text-[9px] uppercase tracking-wider font-mono text-gray-500">Row {idx + 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSectionEnabled(sec.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                            sec.enabled ? "bg-[#D4AF37]" : "bg-white/[0.08]"
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-[#0a0a0a] transition-transform duration-200 ${
                              sec.enabled ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: SERVICES & PRICES */}
            {activeStep === 3 && activeMobileTab !== 'theme' && (
              <div className="space-y-6 animate-fadeIn pb-10">
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Business Content Hub</span>
                  <p className="text-xs text-gray-400">Manage treatment menus, practitioners, and client testimonials in one place.</p>
                </div>

                <div className="space-y-8">
                  {/* SERVICES SUBSECTION */}
                  <div id="settings-services" className="space-y-6">
                    <ServicesManagementPanel 
                      services={siteConfig.services}
                      onUpdate={(newServices) => setSiteConfig(prev => ({ ...prev, services: newServices }))}
                      onNotify={notifyShort}
                    />
                  </div>

                  {/* TEAM SUBSECTION */}
                  <div id="settings-team" className="pt-6 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-1 bg-[#D4AF37] rounded-full" />
                      <h3 className="text-xs font-mono uppercase text-white font-bold">2. Master Specialists</h3>
                    </div>
                    <div className="space-y-3">
                      {siteConfig.team.map((stylist) => (
                        <div key={stylist.id} className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-3 relative group">
                          <button onClick={() => removeTeamMember(stylist.id)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                          <div className="flex gap-3">
                            <div className="w-14 h-14 rounded-lg bg-black border border-white/10 shrink-0 overflow-hidden relative cursor-pointer" onClick={() => teamImgInputRefs.current[stylist.id]?.click()}>
                              <input type="file" accept="image/*" ref={el => teamImgInputRefs.current[stylist.id] = el} onChange={(e) => handleTeamMemberUpload(stylist.id, e)} className="hidden" />
                              {stylist.img ? <img src={stylist.img} alt={stylist.name} className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 mx-auto mt-4 text-gray-600" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <input type="text" className="w-full bg-black border border-white/[0.08] text-xs text-white rounded px-2.5 py-1" value={stylist.name} onChange={e => updateTeamMember(stylist.id, "name", e.target.value)} placeholder="Specialist Name" />
                              <input type="text" className="w-full bg-black border border-white/[0.08] text-xs text-[#D4AF37] rounded px-2.5 py-1" value={stylist.role} onChange={e => updateTeamMember(stylist.id, "role", e.target.value)} placeholder="Specialist Role" />
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-500 uppercase mb-0.5">Experience</label>
                                  <input type="text" className="w-full bg-black border border-white/[0.08] text-xs text-white rounded px-2 py-1 font-mono" value={stylist.experience || ""} onChange={e => updateTeamMember(stylist.id, "experience", e.target.value)} placeholder="5 Years" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-mono text-gray-500 uppercase mb-0.5">Rating (1-5)</label>
                                  <input type="number" min="1" max="5" className="w-full bg-black border border-white/[0.08] text-xs text-yellow-500 rounded px-2 py-1 font-mono" value={stylist.rating || 5} onChange={e => updateTeamMember(stylist.id, "rating", parseInt(e.target.value) || 0)} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <textarea rows={2} className="w-full bg-black border border-white/[0.08] text-xs text-gray-300 rounded p-2" value={stylist.bio} onChange={e => updateTeamMember(stylist.id, "bio", e.target.value)} placeholder="Career Bio..." />
                        </div>
                      ))}
                      <button onClick={addTeamMember} className="w-full py-2 bg-white/[0.02] border border-dashed border-white/10 text-xs text-[#D4AF37] rounded hover:bg-white/[0.05]">+ Add Specialist</button>
                    </div>
                  </div>

                  {/* TESTIMONIALS SUBSECTION */}
                  <div id="settings-testimonials" className="pt-6 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-4 w-1 bg-[#D4AF37] rounded-full" />
                      <h3 className="text-xs font-mono uppercase text-white font-bold">3. Client Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {siteConfig.testimonials.map((testi) => (
                        <div key={testi.id} className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-3 relative group">
                          <button onClick={() => removeTestimonial(testi.id)} className="absolute top-3 right-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                          <input type="text" className="w-full bg-black border border-white/[0.08] text-xs text-white rounded px-2.5 py-1" value={testi.author} onChange={e => updateTestimonial(testi.id, "author", e.target.value)} placeholder="Client Name" />
                          <textarea rows={2} className="w-full bg-black border border-white/[0.08] text-xs text-gray-300 rounded p-2" value={testi.text} onChange={e => updateTestimonial(testi.id, "text", e.target.value)} placeholder="Review Text..." />
                        </div>
                      ))}
                      <button onClick={addTestimonial} className="w-full py-2 bg-white/[0.02] border border-dashed border-white/10 text-xs text-[#D4AF37] rounded hover:bg-white/[0.05]">+ Add Review</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BOOKING CALENDAR & SLOTS DEFINITION */}
            {activeStep === 3 && activeMobileTab !== 'theme' && (
              <div id="settings-booking" className="space-y-6 animate-fadeIn pb-10">
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-450 uppercase tracking-wider font-bold" style={{ color: siteConfig.primaryColor }}>Booking Calendar Config</span>
                  <p className="text-xs text-gray-300">Set booking intervals, enable scheduling days, block manually, and view client-side simulated book requests.</p>
                </div>

                <div className="space-y-6">
                  {/* SECTION 1: TIMING PATTERNS */}
                  <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                      <h3 className="text-xs font-mono uppercase text-white font-bold">1. Appointment Rules</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Time Slot Interval</label>
                        <select
                          className="w-full bg-black border border-white/[0.08] text-xs text-white rounded p-2 focus:border-[#D4AF37]/50 focus:outline-none"
                          value={siteConfig.bookingConfig?.interval || 30}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 30;
                            setSiteConfig(prev => ({
                              ...prev,
                              bookingConfig: {
                                ...(prev.bookingConfig || { startTime: "09:00", endTime: "18:00", enabledDays: [], blockedSlots: {} }),
                                interval: val
                              }
                            }));
                            notifyShort(`Booking interval set to ${val}-minute increments.`);
                          }}
                        >
                          <option value={15}>15-minute intervals (High density)</option>
                          <option value={30}>30-minute intervals (Standard)</option>
                          <option value={45}>45-minute intervals (Long Session)</option>
                          <option value={60}>60-minute intervals (Premium Block)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Start Hour</label>
                          <input
                            type="time"
                            className="w-full bg-black border border-white/[0.08] text-xs text-white rounded p-2 focus:border-[#D4AF37]/50 focus:outline-none"
                            value={siteConfig.bookingConfig?.startTime || "09:00"}
                            onChange={(e) => {
                              const val = e.target.value || "09:00";
                              setSiteConfig(prev => ({
                                ...prev,
                                bookingConfig: {
                                  ...(prev.bookingConfig || { interval: 30, endTime: "18:00", enabledDays: [], blockedSlots: {} }),
                                  startTime: val
                                }
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">End Hour</label>
                          <input
                            type="time"
                            className="w-full bg-black border border-white/[0.08] text-xs text-white rounded p-2 focus:border-[#D4AF37]/50 focus:outline-none"
                            value={siteConfig.bookingConfig?.endTime || "18:00"}
                            onChange={(e) => {
                              const val = e.target.value || "18:00";
                              setSiteConfig(prev => ({
                                ...prev,
                                bookingConfig: {
                                  ...(prev.bookingConfig || { interval: 30, startTime: "09:00", enabledDays: [], blockedSlots: {} }),
                                  endTime: val
                                }
                              }));
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-mono text-gray-400 uppercase mb-1.5">Enabled Booking Days</span>
                        <div className="grid grid-cols-3 gap-2">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                            const isEnabled = siteConfig.bookingConfig?.enabledDays?.includes(day) ?? true;
                            return (
                              <label key={day} className="flex items-center gap-1.5 p-1.5 bg-black border border-white/[0.03] rounded hover:border-white/10 cursor-pointer text-[10px] text-gray-300">
                                <input
                                  type="checkbox"
                                  className="accent-[#D4AF37]"
                                  checked={isEnabled}
                                  onChange={() => {
                                    const currentDays = siteConfig.bookingConfig?.enabledDays || [];
                                    const nextDays = currentDays.includes(day)
                                      ? currentDays.filter(d => d !== day)
                                      : [...currentDays, day];
                                    setSiteConfig(prev => ({
                                      ...prev,
                                      bookingConfig: {
                                        ...(prev.bookingConfig || { interval: 30, startTime: "09:00", endTime: "18:00", blockedSlots: {} }),
                                        enabledDays: nextDays
                                      }
                                    }));
                                  }}
                                />
                                <span className="truncate">{day.slice(0, 3)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1">Minimum Booking Notice</label>
                        <select
                          className="w-full bg-black border border-white/[0.08] text-xs text-white rounded p-2 focus:border-[#D4AF37]/50 focus:outline-none"
                          value={siteConfig.bookingConfig?.minimumNoticeHours !== undefined ? siteConfig.bookingConfig.minimumNoticeHours : 2}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setSiteConfig(prev => ({
                              ...prev,
                              bookingConfig: {
                                ...(prev.bookingConfig || { interval: 30, startTime: "09:00", endTime: "18:00", enabledDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], blockedSlots: {} }),
                                minimumNoticeHours: val
                              }
                            }));
                            notifyShort(`Minimum notice updated to ${val === 0 ? "none" : val + " hour" + (val > 1 ? "s" : "")}.`);
                          }}
                        >
                          <option value={0}>No notice (Allow instant bookings)</option>
                          <option value={1}>1 hour notice</option>
                          <option value={2}>2 hours notice (Recommended)</option>
                          <option value={4}>4 hours notice</option>
                          <option value={6}>6 hours notice</option>
                          <option value={12}>12 hours notice</option>
                          <option value={24}>24 hours notice (1 day)</option>
                          <option value={48}>48 hours notice (2 days)</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1 font-sans">
                          Prevent bookings on timeslots that occur sooner than this notice window. Keep clients from making sudden last-minute bookings.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: SLOTS & BLOCKOUT EDITOR */}
                  <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                        <h3 className="text-xs font-mono uppercase text-white font-bold">2. Manual Blockouts</h3>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400">Select a date to view generated slots and block specific hours for staff breaks or private workshops.</p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono text-[#D4AF37] uppercase mb-1 font-bold">Choose Simulator Date</label>
                        <input
                          type="date"
                          className="w-full bg-black border border-white/[0.1] text-xs text-white rounded p-2 focus:border-[#D4AF37] focus:outline-none font-mono"
                          value={settingsActiveDate}
                          onChange={(e) => setSettingsActiveDate(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {(() => {
                          const interval = siteConfig.bookingConfig?.interval || 30;
                          const startTime = siteConfig.bookingConfig?.startTime || "09:00";
                          const endTime = siteConfig.bookingConfig?.endTime || "18:00";
                          const allSlots = generateSlotsForDay(startTime, endTime, interval);
                          const dateBlocked = siteConfig.bookingConfig?.blockedSlots?.[settingsActiveDate] || [];
                          
                          // Check for booked appointments on this date
                          const dateAppointments = (siteConfig.appointments || []).filter(a => a.date === settingsActiveDate);

                          if (allSlots.length === 0) {
                            return <p className="text-[11px] italic text-gray-500 py-3 text-center">No hours configured.</p>;
                          }

                          return allSlots.map(slot => {
                            const noticeHours = siteConfig.bookingConfig?.minimumNoticeHours !== undefined ? siteConfig.bookingConfig.minimumNoticeHours : 2;
                            const isNoticeBlocked = isSlotWithinNoticePeriod(settingsActiveDate, slot, noticeHours);
                            const isBlocked = dateBlocked.includes(slot) || isNoticeBlocked;
                            const appt = dateAppointments.find(a => a.time === slot);
                            const isBooked = !!appt;

                            return (
                              <div
                                key={slot}
                                className={`flex items-center justify-between p-2 rounded text-xs border ${
                                  isBooked ? "bg-amber-500/10 border-amber-500/20 text-white" :
                                  isNoticeBlocked ? "bg-purple-950/20 border-purple-500/20 text-purple-300" :
                                  isBlocked ? "bg-red-500/10 border-red-500/20 text-gray-400" :
                                  "bg-black/40 border-white/[0.03] text-gray-300"
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs font-medium">{slot}</span>
                                  {isBooked && (
                                    <span className="text-[9px] text-[#D4AF37]">
                                      Booked: {appt.clientName} ({appt.serviceName})
                                    </span>
                                  )}
                                  {isNoticeBlocked && (
                                    <span className="text-[9px] text-purple-400 font-medium">
                                      Auto-blocked (Within {noticeHours}h notice)
                                    </span>
                                  )}
                                  {!isNoticeBlocked && isBlocked && <span className="text-[9px] text-red-400">Blocked out</span>}
                                  {!isBlocked && !isBooked && <span className="text-[9px] text-green-500/80">Available</span>}
                                </div>

                                <button
                                  type="button"
                                  disabled={isBooked || isNoticeBlocked}
                                  onClick={() => toggleBlockSlot(settingsActiveDate, slot)}
                                  className={`px-2 py-1 rounded text-[9px] font-mono uppercase transition-colors ${
                                    isBooked ? "opacity-30 cursor-not-allowed bg-transparent text-gray-500" :
                                    isNoticeBlocked ? "opacity-55 cursor-not-allowed bg-transparent text-purple-400/60" :
                                    isBlocked ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" :
                                    "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  }`}
                                >
                                  {isNoticeBlocked ? "Auto-Blocked" : isBlocked ? "Unblock" : "Block"}
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: SIMULATED APPOINTMENTS LOG */}
                  <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                        <h3 className="text-xs font-mono uppercase text-white font-bold">3. Client Bookings ({siteConfig.appointments?.length || 0})</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {(!siteConfig.appointments || siteConfig.appointments.length === 0) ? (
                        <p className="text-[11px] text-gray-500 italic text-center py-4">No reservations logged. Try booking via the website preview side!</p>
                      ) : (
                        siteConfig.appointments.map(appt => (
                          <div key={appt.id} className="p-3 bg-black border border-white/[0.04] rounded-lg text-xs space-y-2 relative group md:hover:border-white/10 transition-colors">
                            <button
                              onClick={() => cancelAppointment(appt.id)}
                              className="absolute top-2.5 right-2 text-gray-500 hover:text-red-400 transition-colors"
                              title="Cancel appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            
                            <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                              <span className="font-mono text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                {appt.date} @ {appt.time}
                              </span>
                              <span className="text-gray-400 font-medium">with {appt.staffName}</span>
                            </div>

                            <div className="border-t border-white/[0.03] pt-2 space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-white font-semibold">{appt.clientName}</span>
                                <span className="font-mono text-[10px] text-gray-400">{appt.clientPhone}</span>
                              </div>
                              <div className="text-[11px] text-[#D4AF37]">
                                <span className="text-gray-500">Service:</span> {appt.serviceName}
                              </div>
                              {appt.clientNotes && (
                                <p className="text-[10px] text-gray-400 italic bg-white/[0.01] p-1.5 rounded border border-white/[0.02]">
                                  "{appt.clientNotes}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTACT & SOCIALS & MAP */}
            {activeStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-3 bg-[#e2cc83]/5 border border-[#e2cc83]/25 rounded-xl space-y-1">
                  <span className="text-[10px] text-[#e2cc83] uppercase tracking-wider font-bold">Contact & Location</span>
                  <p className="text-xs text-gray-300">Link communication accounts & define localization targets for direct consumer interactions.</p>
                </div>

                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono uppercase text-[#D4AF37] border-b border-white/[0.04] pb-2">Direct Messaging (Indian Mobile UX)</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Phone Line</label>
                      <div className="flex rounded-lg overflow-hidden border border-white/[0.08] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/20 bg-black text-xs">
                        <span className="bg-[#121212] px-2.5 py-1.5 text-gray-400 font-mono text-[11px] flex items-center border-r border-white/[0.08] select-none font-bold">
                          +91
                        </span>
                        <input
                          type="text"
                          className="flex-1 bg-transparent px-3 py-1.5 text-white outline-none font-mono"
                          value={cleanAndFormatIndianNumber(siteConfig.phone)}
                          onChange={e => {
                            const formatted = cleanAndFormatIndianNumber(e.target.value);
                            setSiteConfig(prev => {
                              const newPhone = formatted;
                              const newWhatsapp = useSameNumber ? formatted : prev.whatsapp;
                              return { ...prev, phone: newPhone, whatsapp: newWhatsapp };
                            });
                          }}
                          placeholder="98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-mono uppercase text-gray-500">WhatsApp Chat</label>
                        <label className="flex items-center gap-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={useSameNumber}
                            onChange={e => {
                              const checked = e.target.checked;
                              setUseSameNumber(checked);
                              if (checked) {
                                setSiteConfig(prev => ({ ...prev, whatsapp: prev.phone }));
                              }
                            }}
                            className="rounded border-white/20 bg-black text-[#D4AF37] focus:ring-0 w-3 h-3 cursor-pointer"
                          />
                          <span className="text-[9px] font-mono text-[#D4AF37] uppercase">Use Same</span>
                        </label>
                      </div>
                      <div className="flex rounded-lg overflow-hidden border border-white/[0.08] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/20 bg-black text-xs">
                        <span className="bg-[#121212] px-2.5 py-1.5 text-gray-400 font-mono text-[11px] flex items-center border-r border-white/[0.08] select-none font-bold">
                          +91
                        </span>
                        <input
                          type="text"
                          disabled={useSameNumber}
                          className="flex-1 bg-transparent px-3 py-1.5 text-white outline-none font-mono disabled:opacity-40"
                          value={useSameNumber ? cleanAndFormatIndianNumber(siteConfig.phone) : cleanAndFormatIndianNumber(siteConfig.whatsapp)}
                          onChange={e => {
                            const formatted = cleanAndFormatIndianNumber(e.target.value);
                            setSiteConfig(prev => ({ ...prev, whatsapp: formatted }));
                          }}
                          placeholder="98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Boulevard Address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5 min-w-0"
                          value={siteConfig.address || ""}
                          onChange={e => setSiteConfig(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="e.g. 102, Link Road, Bandra West"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!siteConfig.address) {
                              notifyShort("No address entered to copy!");
                              return;
                            }
                            const fullAddr = siteConfig.address + (siteConfig.landmark ? `, Landmark: ${siteConfig.landmark}` : "");
                            navigator.clipboard.writeText(fullAddr).then(() => {
                              notifyShort("Address copied to clipboard!");
                            }).catch(() => {
                              try {
                                const input = document.createElement("input");
                                input.value = fullAddr;
                                document.body.appendChild(input);
                                input.select();
                                document.execCommand("copy");
                                document.body.removeChild(input);
                                notifyShort("Address copied!");
                              } catch (err) {
                                notifyShort("Copy failed. Please copy manually.");
                              }
                            });
                          }}
                          className="px-2.5 bg-white/[0.03] hover:bg-[#D4AF37] hover:text-black border border-white/[0.08] hover:border-transparent text-[10px] font-mono text-stone-300 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                          title="Copy address to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Address</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Landmark</label>
                      <input
                        type="text"
                        className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5"
                        value={siteConfig.landmark || ""}
                        onChange={e => setSiteConfig(prev => ({ ...prev, landmark: e.target.value }))}
                        placeholder="e.g. Near Grand Mall"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Map Anchor Link</label>
                    <input
                      type="text"
                      className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5 font-mono"
                      value={siteConfig.googleMapUrl || ""}
                      onChange={e => setSiteConfig(prev => ({ ...prev, googleMapUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                {/* SECTION: INDIAN BUSINESS QUICK ACTIONS */}
                <div className="bg-gradient-to-br from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/20 p-4 rounded-xl space-y-3 shadow-lg shadow-black/20">
                  <div className="border-b border-white/[0.05] pb-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">Indian Business Quick Actions</span>
                    <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">Simulation</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Instantly simulate customer actions targeting your local salon presence.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const tel = "tel:+91" + siteConfig.phone.replace(/\D/g, "");
                        window.open(tel, "_self");
                        notifyShort(`Simulating Dialing: +91 ${siteConfig.phone}`);
                      }}
                      className="py-2 px-3 bg-[#111] hover:bg-white/[0.04] text-xs text-stone-200 border border-white/[0.08] rounded-lg transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                      <span>Call Business</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const waNum = (useSameNumber ? siteConfig.phone : siteConfig.whatsapp).replace(/\D/g, "");
                        const waUrl = `https://wa.me/91${waNum}`;
                        window.open(waUrl, "_blank");
                        notifyShort(`Opening WhatsApp Chat: +91 ${waNum}`);
                      }}
                      className="py-2 px-3 bg-[#111] hover:bg-white/[0.04] text-xs text-stone-200 border border-white/[0.08] rounded-lg transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Open WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = siteConfig.googleMapUrl || "https://maps.google.com";
                        window.open(url, "_blank");
                        notifyShort("Opening Google Maps directions");
                      }}
                      className="py-2 px-3 bg-[#111] hover:bg-white/[0.04] text-xs text-stone-200 border border-white/[0.08] rounded-lg transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                      <span>Open Google Maps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const subdomainUrl = `https://${siteConfig.subdomain || "nexora"}.nexorasalonos.com`;
                        navigator.clipboard.writeText(subdomainUrl).then(() => {
                          notifyShort("Subdomain URL copied to clipboard!");
                        }).catch(() => {
                          notifyShort("Copy failed. Please copy manually.");
                        });
                      }}
                      className="py-2 px-3 bg-[#111] hover:bg-white/[0.04] text-xs text-stone-200 border border-white/[0.08] rounded-lg transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <Globe className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                      <span>Copy Website URL</span>
                    </button>
                  </div>
                </div>

                {/* Social media presence */}
                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-3">
                  <h3 className="text-xs font-mono uppercase text-gray-400 border-b border-white/[0.04] pb-2">Sociability Accounts</h3>
                  <p className="text-[10px] text-gray-500 mb-2">Enter your full URL or just your @handle. Handles will be automatically converted to links.</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'instagramUrl', label: 'Instagram', icon: <Instagram className="w-3 h-3 text-[#D4AF37]" />, domain: 'instagram.com' },
                      { id: 'facebookUrl', label: 'Facebook', icon: <Facebook className="w-3 h-3 text-[#D4AF37]" />, domain: 'facebook.com' },
                      { id: 'twitterUrl', label: 'Twitter / X', icon: <Twitter className="w-3 h-3 text-[#D4AF37]" />, domain: 'twitter.com' },
                      { id: 'youtubeUrl', label: 'YouTube', icon: <Youtube className="w-3 h-3 text-[#D4AF37]" />, domain: 'youtube.com' },
                      { id: 'tiktokUrl', label: 'TikTok', icon: <span className="text-[#D4AF37] font-bold text-[10px]">♪</span>, domain: 'tiktok.com/@' },
                      { id: 'pinterestUrl', label: 'Pinterest', icon: <span className="text-[#D4AF37] font-bold text-[10px]">P</span>, domain: 'pinterest.com' },
                    ].map((platform) => (
                      <div key={platform.id}>
                        <label className="block text-[9px] font-mono uppercase text-gray-500 mb-1 flex items-center gap-1">
                          {platform.icon} {platform.label}
                        </label>
                        <input
                          type="text"
                          placeholder={`@your${platform.label.toLowerCase().replace(/ \/ x/, '')}`}
                          className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5"
                          value={(siteConfig as any)[platform.id] || ''}
                          onChange={e => setSiteConfig(prev => ({ ...prev, [platform.id]: e.target.value }))}
                          onBlur={e => {
                            const val = e.target.value.trim();
                            if (val && !val.startsWith('http')) {
                              const handle = val.replace(/^@/, '');
                              setSiteConfig(prev => ({ ...prev, [platform.id]: `https://${platform.domain}/${handle}` }));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* BUSINESS HOURS EDITOR */}
                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <h3 className="text-xs font-mono uppercase text-gray-400">Business Hours</h3>
                    <span className="text-[10px] text-gray-500">Daily Schedule</span>
                  </div>
                  <div className="space-y-2">
                    {(siteConfig.businessHours || []).map((b, idx) => (
                      <div key={b.day} className="flex items-center justify-between gap-2 bg-black px-2.5 py-2 rounded-lg border border-white/[0.02]">
                        <span className="text-xs font-semibold text-gray-300 w-24">{b.day}</span>
                        
                        <div className="flex items-center gap-1.5">
                          {!b.closed ? (
                            <>
                              <input
                                type="time"
                                className="bg-[#111] border border-white/10 hover:border-[#D4AF37]/50 px-1.5 py-1 rounded text-[11px] text-white font-mono focus:outline-none"
                                value={b.openTime || "09:00"}
                                onChange={e => {
                                  const updatedHours = [...(siteConfig.businessHours || [])];
                                  updatedHours[idx] = { ...b, openTime: e.target.value };
                                  setSiteConfig(prev => ({ ...prev, businessHours: updatedHours }));
                                }}
                              />
                              <span className="text-gray-600 text-xs">-</span>
                              <input
                                type="time"
                                className="bg-[#111] border border-white/10 hover:border-[#D4AF37]/50 px-1.5 py-1 rounded text-[11px] text-white font-mono focus:outline-none"
                                value={b.closeTime || "18:00"}
                                onChange={e => {
                                  const updatedHours = [...(siteConfig.businessHours || [])];
                                  updatedHours[idx] = { ...b, closeTime: e.target.value };
                                  setSiteConfig(prev => ({ ...prev, businessHours: updatedHours }));
                                }}
                              />
                            </>
                          ) : (
                            <span className="text-xs text-red-500/80 font-mono tracking-wider font-semibold bg-red-950/20 px-4 py-1 rounded border border-red-900/10">CLOSED</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updatedHours = [...(siteConfig.businessHours || [])];
                            updatedHours[idx] = { ...b, closed: !b.closed };
                            setSiteConfig(prev => ({ ...prev, businessHours: updatedHours }));
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-mono tracking-tighter uppercase transition-all shrink-0 cursor-pointer ${
                            b.closed 
                              ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20 hover:bg-emerald-900/30' 
                              : 'bg-red-950/30 text-red-300 border border-red-900/25 hover:bg-red-900/30'
                          }`}
                        >
                          {b.closed ? "Set Open" : "Set Closed"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HOLIDAY CLOSURES EDITOR */}
                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-mono uppercase text-gray-400">Holiday Closures</h3>
                      <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/25 px-1.5 py-0.2 rounded font-mono text-center">Overrides Weekly</span>
                    </div>
                    <button
                      type="button"
                      onClick={addHolidayClosure}
                      className="text-xs text-[#D4AF37] hover:text-[#e4be4a] flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Holiday
                    </button>
                  </div>

                  {(siteConfig.holidayClosures || []).length === 0 ? (
                    <p className="text-[11px] text-gray-500 italic text-center py-2">No custom holiday closures configured.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {(siteConfig.holidayClosures || []).map((h) => (
                        <div key={h.id} className="bg-black p-3 rounded-lg border border-white/[0.03] space-y-2 relative group">
                          <button
                            type="button"
                            onClick={() => removeHolidayClosure(h.id)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                            title="Remove Holiday"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-1 gap-2 pr-6">
                            <div>
                              <label className="block text-[9px] font-mono text-gray-500 uppercase mb-0.5">Holiday Name</label>
                              <input
                                type="text"
                                className="w-full bg-[#111] border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2 py-1"
                                value={h.name}
                                onChange={e => updateHolidayClosure(h.id, "name", e.target.value)}
                                placeholder="Christmas, Independence Day"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-gray-500 uppercase mb-0.5">Closure Date</label>
                              <input
                                type="date"
                                className="w-full bg-[#111] border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2 py-1 font-mono outline-none"
                                value={h.date}
                                onChange={e => updateHolidayClosure(h.id, "date", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                                {/* PORTFOLIO NARRATIVE GENERATOR */}
                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <h3 className="text-xs font-mono uppercase text-[#D4AF37] flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" /> Portfolio Gallery Narrative
                    </h3>
                    <span className="text-[9px] bg-white/[0.05] text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">Gemini AI</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Introductory Narrative / Subtitle</label>
                    <textarea
                      rows={3}
                      className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded p-2.5 resize-none transition-all placeholder-gray-600 outline-none"
                      placeholder="E.g., A curation of our finest hair artistry and bespoke color styles..."
                      value={siteConfig.galleryNarrative || ""}
                      onChange={e => setSiteConfig(prev => ({ ...prev, galleryNarrative: e.target.value }))}
                    />
                  </div>

                  {/* MINI AI CONTROLS PANEL */}
                  <div className="p-3 bg-black/60 rounded-lg border border-white/[0.03] space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span>Tailor Narrative Tone:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-gray-500 block mb-1">Vibe/Highlight</span>
                        <input
                          type="text"
                          className="w-full bg-stone-900 border border-white/[0.04] text-[10px] text-white rounded px-2 py-1 outline-none"
                          placeholder="avant-garde, classic, bold color"
                          value={galleryNarrativeQuery}
                          onChange={e => setGalleryNarrativeQuery(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-gray-500 block mb-1">Design Tone</span>
                        <select
                          className="w-full bg-stone-900 border border-white/[0.04] text-[10px] text-white rounded px-2 py-1 outline-none h-[24px]"
                          value={galleryNarrativeStyle}
                          onChange={e => setGalleryNarrativeStyle(e.target.value)}
                        >
                          <option value="sophisticated & artistic">Sophisticated & Artistic</option>
                          <option value="editorial & luxury">Editorial & Luxury</option>
                          <option value="vibrant & contemporary">Vibrant & Contemporary</option>
                          <option value="warm & boutique">Warm & Boutique</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={generateGalleryNarrative}
                      disabled={aiLoading.galleryNarrative}
                      className="w-full h-8 bg-gradient-to-r from-stone-900 to-stone-850 hover:from-[#D4AF37] hover:to-[#bda03c] border border-[#D4AF37]/30 text-[11px] text-[#D4AF37] hover:text-black font-semibold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {aiLoading.galleryNarrative ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37] hover:text-black" />
                          <span>Generating Narrative...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Suggest Portfolio Narrative</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* PHOTO Style Portfolio Images DECK */}
                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <h3 className="text-xs font-mono uppercase text-gray-400 font-bold">Style Portfolio Images</h3>
                    <div className="flex items-center gap-3">
                      {siteConfig.gallery.length > 0 && (
                        <button
                          type="button"
                          onClick={generateAllImageAltCaptions}
                          disabled={aiLoading.bulk_alt_caption}
                          className="text-[10px] text-stone-400 hover:text-[#D4AF37] font-mono flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Generate missing alt text for all images"
                        >
                          {aiLoading.bulk_alt_caption ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          Generate All Alt Text
                        </button>
                      )}
                      <div className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          id="gallery-add-input"
                          className="hidden"
                          onChange={handleAddGalleryImage}
                        />
                        <label htmlFor="gallery-add-input" className="text-xs text-[#D4AF37] hover:text-white cursor-pointer font-bold flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" />
                          Add Salon Photo
                        </label>
                      </div>
                    </div>
                  </div>

                  {siteConfig.gallery.length === 0 ? (
                    <p className="text-[11px] text-stone-500 italic text-center py-4">No portfolio images loaded. Standard placeholders will be supplied below.</p>
                  ) : (
                    <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                      {siteConfig.gallery.map((imgUrl, i) => {
                        const metadata = siteConfig.galleryMetadata?.[imgUrl] || {};
                        const isImgAiLoading = !!aiLoading[`alt_caption-${imgUrl}`];

                        return (
                          <div key={i} className="bg-black/60 border border-white/[0.04] p-3 rounded-lg flex flex-col md:flex-row gap-3">
                            {/* Image area */}
                            <div className="w-full md:w-24 md:h-24 shrink-0 bg-stone-900 border border-white/10 rounded overflow-hidden relative group">
                              <img src={imgUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5">
                                  {/* Replace Button */}
                                  <label className="bg-white/10 hover:bg-[#D4AF37] hover:text-black text-white p-1.5 rounded cursor-pointer transition-colors" title="Replace Image">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReplaceGalleryImage(e, i)} />
                                    <Upload className="w-3.5 h-3.5" />
                                  </label>
                                  {/* Crop/Edit Button */}
                                  <button type="button" onClick={() => handleEditGalleryImage(imgUrl, i)} className="bg-white/10 hover:bg-[#D4AF37] hover:text-black text-white p-1.5 rounded cursor-pointer transition-colors" title="Crop / Adjust">
                                    <Crop className="w-3.5 h-3.5" />
                                  </button>
                                  {/* Delete Button */}
                                  <button type="button" onClick={() => removeGalleryImage(i)} className="bg-white/10 hover:bg-red-500 hover:text-white text-white p-1.5 rounded cursor-pointer transition-colors" title="Delete Image">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Meta edits & Gemini Tool */}
                            <div className="flex-1 flex flex-col justify-between space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[8px] font-mono uppercase text-gray-500 mb-0.5">Alt Text (Accessibility & SEO)</label>
                                  <input
                                    type="text"
                                    className="w-full bg-stone-950 border border-white/[0.06] focus:border-[#D4AF37] text-[10px] text-stone-200 rounded px-2.5 py-1.5 outline-none"
                                    placeholder="E.g., Honey blonde balayage framing..."
                                    value={metadata.alt || ""}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setSiteConfig(prev => {
                                        const meta = prev.galleryMetadata ? { ...prev.galleryMetadata } : {};
                                        meta[imgUrl] = { ...meta[imgUrl], alt: val };
                                        return { ...prev, galleryMetadata: meta };
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] font-mono uppercase text-gray-500 mb-0.5">Display Caption & Title</label>
                                  <input
                                    type="text"
                                    className="w-full bg-stone-950 border border-white/[0.06] focus:border-[#D4AF37] text-[10px] text-stone-200 rounded px-2.5 py-1.5 outline-none"
                                    placeholder="E.g., Gorgeous glazed beachy waves..."
                                    value={metadata.caption || ""}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setSiteConfig(prev => {
                                        const meta = prev.galleryMetadata ? { ...prev.galleryMetadata } : {};
                                        meta[imgUrl] = { ...meta[imgUrl], caption: val };
                                        return { ...prev, galleryMetadata: meta };
                                      });
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => generateImageAltCaption(imgUrl)}
                                  disabled={isImgAiLoading}
                                  className="px-2 py-0.5 bg-white/[0.02] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border border-white/[0.08] hover:border-[#D4AF37]/35 text-[9px] text-stone-400 rounded-md flex items-center gap-1 cursor-pointer select-none transition-all disabled:opacity-50 h-5"
                                >
                                  {isImgAiLoading ? (
                                    <>
                                      <Loader2 className="w-2.5 h-2.5 animate-spin text-[#D4AF37]" />
                                      <span>Gemini working...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                                      <span>Gemini Auto-Scribe</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SEARCH ENGINE OPTIMIZATION ASSIST PANEL */}
                <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <h3 className="text-xs font-mono uppercase text-gray-500">SEO Meta Tags</h3>
                    <span className="text-[9px] bg-white/[0.05] text-gray-400 px-1.5 py-0.5 rounded font-mono">Crawler Tags</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Homepage Header Title</label>
                      <input
                        type="text"
                        className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5"
                        value={siteConfig.metaTitle}
                        onChange={e => setSiteConfig(prev => ({ ...prev, metaTitle: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Index Meta Description Description</label>
                      <textarea
                        rows={2}
                        className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-gray-300 rounded p-2"
                        value={siteConfig.metaDescription}
                        onChange={e => setSiteConfig(prev => ({ ...prev, metaDescription: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Target Keywords</label>
                      <input
                        type="text"
                        className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5 font-mono"
                        value={siteConfig.keywords}
                        placeholder="haircuts, skin lounge, microcurrent"
                        onChange={e => setSiteConfig(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* OPEN GRAPH PREVIEW PANEL */}
                  <div className="bg-[#111] border border-white/[0.04] p-4 rounded-xl space-y-4 mt-6">
                    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                      <h3 className="text-xs font-mono uppercase text-gray-500">Open Graph (Social Preview)</h3>
                      <span className="text-[9px] bg-white/[0.05] text-gray-400 px-1.5 py-0.5 rounded font-mono">WhatsApp/FB</span>
                    </div>

                    <div className="border border-white/[0.1] rounded-lg overflow-hidden bg-[#1a1a1a]">
                      <div className="h-24 bg-stone-900 flex items-center justify-center overflow-hidden">
                        {siteConfig.ogImage ? (
                          <img src={siteConfig.ogImage} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="text-gray-600 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold text-white truncate">{siteConfig.ogTitle || "Website Title"}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{siteConfig.ogDescription || "Website description..."}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Sharing Title</label>
                        <input
                          type="text"
                          className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-white rounded px-2.5 py-1.5"
                          value={siteConfig.ogTitle || ""}
                          onChange={e => setSiteConfig(prev => ({ ...prev, ogTitle: e.target.value }))}
                          placeholder="My Awesome Website"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-gray-500 mb-1">Sharing Description</label>
                        <textarea
                          rows={2}
                          className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] text-xs text-gray-300 rounded p-2"
                          value={siteConfig.ogDescription || ""}
                          onChange={e => setSiteConfig(prev => ({ ...prev, ogDescription: e.target.value }))}
                          placeholder="Check out my website!"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="file" accept="image/*" id="og-image-input" className="hidden" onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                               setSiteConfig(prev => ({ ...prev, ogImage: reader.result as string }));
                             };
                             reader.readAsDataURL(file);
                           }
                         }} />
                         <label htmlFor="og-image-input" className="px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-xs font-bold cursor-pointer transition-all">Upload Social Image</label>
                      </div>
                    </div>
                  </div>

                  <div className="border border-dashed border-[#D4AF37]/35 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Gemini SEO Optimizer</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Specify local target keywords or neighborhood below:</p>

                    <input
                      type="text"
                      className="w-full bg-black border border-white/[0.08] focus:border-[#D4AF37] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600"
                      value={seoQuery}
                      onChange={e => setSeoQuery(e.target.value)}
                      placeholder="e.g. West Hollywood boutique, Beverly Hills elite stylists"
                    />

                    <button
                      type="button"
                      onClick={() => generateAICopy("seo")}
                      disabled={aiLoading["seo"]}
                      className="w-full py-2 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] disabled:opacity-50 text-black font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {aiLoading["seo"] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Draft SEO Optimizer Cards</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* STEP 4: PUBLISH */}
            {activeStep === 4 && activeMobileTab !== 'theme' && (
              <div className="space-y-6 animate-fadeIn pb-10">
                <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 mb-3">
                    <Check className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg text-[#D4AF37] tracking-wider font-bold">Ready to Publish</h3>
                  <p className="text-sm text-gray-300">Your salon's digital presence is styled and ready to welcome clients.</p>
                </div>

                <div className="bg-[#111] border border-white/[0.04] rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-mono uppercase text-gray-400 font-bold mb-3 border-b border-white/[0.04] pb-2">Publish Options</h4>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const liveUrl = `${window.location.origin}${window.location.pathname}?subdomain=${siteConfig.subdomain || "nexora-lounge"}`;
                        window.open(liveUrl, "_blank");
                        notifyShort("Launching live site over secure HTTPS...");
                      }}
                      className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-[0.98] transition-all text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md shadow-[#D4AF37]/10 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Launch Live Site</span>
                    </button>
                    
                    <button
                      id="share-draft-button"
                      onClick={handleShareDraft}
                      className="w-full py-3 px-4 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 border border-white/[0.08] hover:border-white/20 text-sm text-white font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow shadow-black/20"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Preview Link</span>
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-gray-500 leading-normal flex items-start gap-1 mt-4">
                    <Info className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>
                      Sharing the preview link will capture your current configuration. Launching the live site will open your simulated <code className="text-gray-400 font-mono bg-white/[0.05] px-1 py-0.5 rounded ml-0.5">.nexorasalonos.com</code> address.
                    </span>
                  </p>
                </div>
              </div>
            )}
            
            {/* WIZARD NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/[0.04]">
              <button
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
                className="px-4 py-2 bg-[#111] hover:bg-white/[0.04] text-xs text-stone-300 border border-white/[0.08] rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              
              <button
                onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                disabled={activeStep === 4}
                className="px-6 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-95 text-black text-xs font-bold rounded-lg transition-all shadow-lg shadow-[#D4AF37]/10 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

        {/* RIGHT COLUMN: THE MOCK INTERACTIVE VIEWPORT PREVIEW */}
        <section className={`flex-1 bg-[#101010] flex flex-col h-full min-w-0 z-10 overflow-hidden ${isCustomerOnlyMode ? "p-0" : "p-5"}`}>
          
          {/* DEVICE PREVIEW CONTROLLER */}
          {!isCustomerOnlyMode && (
            <div className="bg-[#161616]/75 border border-white/[0.05] p-3 rounded-2xl flex items-center justify-between mb-4 gap-4 shrink-0 shadow-lg shadow-black/25">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-3.5 h-3.5 inline-block rounded-full bg-red-500/20 text-red-500 border border-red-500/30 font-bold text-[8px] text-center leading-3">M</span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-white">Live Salon Customer Skin Preview</span>
              </div>

              {/* Viewport Width & Share Toggles */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShareDraft}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-95 text-black text-[10px] uppercase font-bold rounded-lg transition-all shadow-lg shadow-[#D4AF37]/10"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Draft</span>
                </button>

                <div className="flex bg-black p-1 rounded-lg border border-white/[0.06] divide-x divide-white/[0.06]">
                  {[
                    { id: "desktop", label: "Desktop View", icon: Monitor },
                    { id: "tablet", label: "Tablet Mode", icon: Tablet },
                    { id: "mobile", label: "Smartphone view", icon: Smartphone }
                  ].map(dev => {
                    const IconComponent = dev.icon;
                    return (
                      <button
                        key={dev.id}
                        onClick={() => setPreviewDevice(dev.id as any)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-2 cursor-pointer ${
                          previewDevice === dev.id
                            ? "bg-[#D4AF37] text-black shadow-lg"
                            : "text-gray-400 hover:text-white"
                        }`}
                        title={dev.label}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{dev.id.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  id="share-draft-button"
                  onClick={handleShareDraft}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-[#D4AF37] hover:to-[#bda03c] border border-white/[0.08] hover:border-transparent text-xs text-stone-200 hover:text-black font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow shadow-black/20 shrink-0 h-[32px]"
                  title="Copy shareable link with current configuration state to clipboard"
                >
                  <Share2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Share Draft</span>
                </button>
              </div>
            </div>
          )}

          {/* THE SIMULATED BROWSER / CUSTOMER EXPERIENCE VIEW */}
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
            <div
              className={`h-full overflow-hidden flex flex-col transition-all duration-300 ${
                isCustomerOnlyMode
                  ? "w-full h-full border-none rounded-none"
                  : `border border-white/[0.08] bg-[#0E0E0E] rounded-3xl shadow-2xl ${
                      previewDevice === "desktop"
                        ? "w-full h-full max-w-none"
                        : previewDevice === "tablet"
                        ? "w-[760px] max-w-full h-full mx-auto"
                        : "w-[385px] max-w-full h-full mx-auto"
                    }`
              }`}
            >
              
              {/* Browser Address Bar Mockup */}
              {!isCustomerOnlyMode && (
                <div className="bg-[#191919] px-4 py-2 flex items-center gap-2 border-b border-white/[0.05] shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                  </div>
                  <div 
                    onClick={() => {
                      const liveUrl = `${window.location.origin}${window.location.pathname}?subdomain=${siteConfig.subdomain || "nexora-lounge"}`;
                      window.open(liveUrl, "_blank");
                      notifyShort("Opening actual working live preview in a new tab...");
                    }}
                    className="flex-1 max-w-md mx-auto bg-black hover:bg-stone-900 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all cursor-pointer rounded-md py-1 px-3 text-[10px] text-gray-400 tracking-tight font-mono flex items-center justify-between gap-2 truncate group/address relative"
                    title="Click to open this site on an actual working URL!"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-green-500 font-semibold">🔒 HTTPS</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-[#D4AF37] font-semibold underline decoration-dotted decoration-[#D4AF37]/50">{siteConfig.subdomain || "nexora-lounge"}.nexorasalonos.com</span>
                    </div>
                    <span className="text-[9px] text-[#D4AF37]/90 font-sans font-medium flex items-center gap-1 shrink-0 bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20 group-hover/address:scale-105 transition-transform">
                      <ExternalLink className="w-2.5 h-2.5 text-[#D4AF37]" />
                      Launch Live
                    </span>
                  </div>
                  <div className="w-8" />
                </div>
              )}

              {/* CUSTOMER FRONTEND SIMULATOR BODY */}
              <div
                ref={previewContainerRef}
                className={`flex-1 overflow-y-auto customer-preview-container ${activeFontClass()} selection:bg-amber-100 selection:text-black ${
                  (siteConfig.animations as any)?.smoothScroll ? "scroll-smooth" : ""
                }`}
                style={{ backgroundColor: siteConfig.backgroundColor || siteConfig.secondaryColor, color: siteConfig.textColor || "#f3f4f6" }}
              >
                {previewDevice === 'mobile' && !isInteracted && (
                  <div className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center animate-pulse" onClick={() => setIsInteracted(true)}>
                    <Hand className="w-12 h-12 text-white mb-4 animate-bounce" />
                    <p className="text-white text-sm font-medium">Tap to Preview</p>
                  </div>
                )}
                {/* Custom typography rendering style injectors */}
                <style dangerouslySetInnerHTML={{ __html: `
                  .customer-preview-container h1, 
                  .customer-preview-container h2, 
                  .customer-preview-container h3, 
                  .customer-preview-container h4, 
                  .customer-preview-container h5, 
                  .customer-preview-container h6 {
                    font-family: '${siteConfig.headingFont || "Playfair Display"}', serif !important;
                  }
                  .customer-preview-container p, 
                  .customer-preview-container span:not(.font-mono), 
                  .customer-preview-container li, 
                  .customer-preview-container a, 
                  .customer-preview-container blockquote,
                  .customer-preview-container button {
                    font-family: '${siteConfig.bodyFont || "Inter"}', sans-serif !important;
                  }
                  
                  /* Dynamic Button Shape Overrides */
                  .customer-preview-container .customer-action-btn,
                  .customer-preview-container header a,
                  .customer-preview-container a.px-5,
                  .customer-preview-container a.px-4,
                  .customer-preview-container a.inline-block,
                  .customer-preview-container a.inline-flex,
                  .customer-preview-container button.customer-btn,
                  .customer-preview-container a[href*="maps"],
                  .customer-preview-container a[href^="tel:"],
                  .customer-preview-container a[href^="mailto:"] {
                    border-radius: ${
                      siteConfig.buttonStyle === "sharp" ? "0px" :
                      siteConfig.buttonStyle === "pill" ? "9999px" :
                      "8px"
                    } !important;
                    box-shadow: ${
                       siteConfig.animations?.glow ? `0 0 15px ${(siteConfig.buttonColor || "#D4AF37")}40` : "none"
                    };
                  }

                  /* Dynamic Card Style Overrides */
                  .customer-preview-container .rounded-xl,
                  .customer-preview-container .rounded-2xl,
                  .customer-preview-container .rounded-lg,
                  .customer-preview-container .rounded-2xl.bg-black\\/45,
                  .customer-preview-container div[style*="borderColor"] {
                    box-shadow: ${
                      siteConfig.cardStyle === "elevated" ? "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)" :
                      siteConfig.cardStyle === "luxury" ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 8px 24px -8px rgba(0, 0, 0, 0.4)" :
                      "none"
                    } !important;
                    backdrop-filter: ${
                      siteConfig.cardStyle === "glass" ? "blur(14px) saturate(160%)" : "none"
                    } !important;
                    background-color: ${
                      siteConfig.cardStyle === "glass" ? 
                       (siteConfig.themeMode === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)") : 
                      siteConfig.cardStyle === "flat" ? 
                       (siteConfig.themeMode === "light" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)") :
                      (siteConfig.themeMode === "light" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)")
                    } !important;
                    border-color: ${
                      siteConfig.cardStyle === "glass" ? 
                       (siteConfig.themeMode === "light" ? "rgba(0,0,0,0.12)" : "rgba(255, 255, 255, 0.12)") :
                       siteConfig.cardStyle === "luxury" ? "rgba(212, 175, 55, 0.15)" :
                       (siteConfig.themeMode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255, 255, 255, 0.05)")
                    } !important;
                    ${siteConfig.animations?.hoverEffects ? "transition: all 0.3s ease;" : ""}
                  }
                `}} />
                
                {/* DYNAMIC SALON FRONTEND RENDER BASE */}
                <div className={`space-y-0.5 min-h-full transition-colors duration-500 ${
                   siteConfig.themeMode === "light" ? "bg-white text-stone-900" : "bg-black text-gray-200"
                }`} style={{ 
                   backgroundColor: siteConfig.themeMode === "light" ? "#FFFFFF" : (siteConfig.backgroundColor || "#111111"),
                   color: siteConfig.themeMode === "light" ? "#1C1917" : (siteConfig.textColor || "#f3f4f6")
                }}>

                  {/* ANNOUNCEMENT BAR */}
                  {siteConfig.showAnnouncementBar && (
                    <div className="relative z-[21]">
                      {siteConfig.announcementRedirectUrl ? (
                        <a 
                          href={siteConfig.announcementRedirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2 px-4 text-center text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all duration-500 hover:brightness-110"
                          style={{ 
                            backgroundColor: siteConfig.primaryColor,
                            color: (siteConfig.primaryColor || "").toLowerCase() === "#d4af37" ? "#111" : "#fff" 
                          }}
                        >
                          {siteConfig.announcementText || "Special Promotion — Book Now"}
                        </a>
                      ) : (
                        <div 
                          className="w-full py-2 px-4 text-center text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all duration-500"
                          style={{ 
                            backgroundColor: siteConfig.primaryColor,
                            color: (siteConfig.primaryColor || "").toLowerCase() === "#d4af37" ? "#111" : "#fff" 
                          }}
                        >
                          {siteConfig.announcementText || "Special Promotion — Book Now"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* HEADER PREVIEW MODULE */}
                  <header 
                    className={`border-b border-white/[0.04] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 transition-all ${
                      siteConfig.menuStyle === "sticky" ? "sticky top-0 bg-opacity-95" :
                      siteConfig.menuStyle === "floating" ? "fixed top-4 left-4 right-4 rounded-2xl shadow-2xl border bg-opacity-90 mx-auto max-w-5xl" :
                      "relative bg-opacity-100"
                    }`} 
                    style={{ 
                      backgroundColor: siteConfig.secondaryColor,
                      backdropFilter: siteConfig.menuStyle !== "standard" ? "blur(12px)" : "none",
                      borderColor: siteConfig.menuStyle === "floating" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"
                    }}
                  >
                    <div className={`flex items-center gap-2.5 ${
                        siteConfig.headerLayout === "center" ? "order-1 sm:order-2" :
                        siteConfig.headerLayout === "split" ? "order-1" :
                        "order-1"
                    }`}>
                      {siteConfig.logo ? (
                        <img src={siteConfig.logo} alt="brand logo" className="h-8 max-w-[120px] object-contain" />
                      ) : (
                        <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-xs" style={{ color: siteConfig.accentColor || siteConfig.primaryColor }}>
                          N
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-bold tracking-tight text-white uppercase">{siteConfig.shopName}</span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-4 text-[11px] text-gray-300 font-medium ${
                        siteConfig.headerLayout === "center" ? "order-2 sm:order-1" :
                        siteConfig.headerLayout === "split" ? "order-2" :
                        "order-2"
                    }`}>
                      <span className="hover:opacity-80 transition-opacity cursor-pointer">Services</span>
                      <span className="hover:opacity-80 transition-opacity cursor-pointer">Team</span>
                      <span className="hover:opacity-80 transition-opacity cursor-pointer">Testimonials</span>
                      <span className="hover:opacity-80 transition-opacity cursor-pointer">Contact</span>
                    </div>

                    <div className={`hidden sm:block ${
                        siteConfig.headerLayout === "center" ? "order-3" :
                        siteConfig.headerLayout === "split" ? "order-3" :
                        "order-3"
                    }`}>
                      <button
                        onClick={() => {
                          setBookingSelectedServiceId("");
                          setBookingSelectedStaffId("any");
                          setBookingSelectedTime("");
                          setBookingClientName("");
                          setBookingClientPhone("");
                          setBookingClientNotes("");
                          setBookingSuccessMode(false);
                          setIsBookingModalOpen(true);
                        }}
                        className="px-4 py-1.5 text-[11px] font-bold rounded-full hover:opacity-90 transition-all text-center inline-block customer-btn cursor-pointer"
                        style={{ backgroundColor: siteConfig.buttonColor, color: (siteConfig.buttonColor || "").toLowerCase() === "#d4af37" ? "#111" : "#fff" }}
                      >
                        Book Now
                      </button>
                    </div>
                  </header>

                  {/* ACTIVE HOME ROWS */}
                  {siteConfig.sections.map((sec) => {
                    if (!sec.enabled) return null;

                    switch (sec.id) {
                      
                      // ROW: HERO BANNER
                      case "hero":
                        const layoutStyle = siteConfig.layoutStyle || "luxury";
                        return (
                          <motion.section
                            key="sec-hero"
                            id="sec-hero"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className={`relative flex flex-col justify-center overflow-hidden border-b border-white/[0.04] ${
                              layoutStyle === "luxury" ? "min-h-[340px] items-center text-center px-6 py-16" :
                              layoutStyle === "modern" ? "min-h-[380px] items-start text-left px-8 md:px-12 py-20" :
                              layoutStyle === "compact" ? "min-h-[280px] items-center text-center sm:text-left px-6 py-12" :
                              "min-h-[440px] items-center text-center px-4 py-24"
                            }`}
                          >
                            {/* Backdrop Image or subtle gradient if not specified */}
                            {siteConfig.banner ? (
                              <>
                                <img src={siteConfig.banner} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                <div className={`absolute inset-0 z-0 ${
                                  layoutStyle === "modern" ? "bg-gradient-to-r from-black via-black/70 to-transparent" :
                                  layoutStyle === "luxury" ? "bg-black/60 backdrop-blur-[1px]" :
                                  layoutStyle === "compact" ? "bg-black/80" :
                                  "bg-gradient-to-b from-black/30 via-black/50 to-black/90"
                                }`} />
                              </>
                            ) : (
                              <div className={`absolute inset-0 pointer-events-none ${
                                layoutStyle === "modern" ? "bg-gradient-to-r from-[#09090B] to-transparent" :
                                "bg-gradient-to-b from-black/40 via-black/80 to-[#121212]"
                              }`} />
                            )}

                            <motion.div 
                              variants={premiumItemVariants}
                              className={`relative z-10 w-full ${
                                layoutStyle === "luxury" ? "max-w-xl space-y-4" :
                                layoutStyle === "modern" ? "max-w-2xl space-y-5" :
                                layoutStyle === "compact" ? "max-w-4xl flex flex-col sm:flex-row items-center gap-8" :
                                "max-w-3xl space-y-7"
                              }`}
                            >
                              {layoutStyle === "compact" && siteConfig.logo && (
                                <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center p-4">
                                  <img src={siteConfig.logo} alt="logo" className="max-w-full max-h-full object-contain" />
                                </div>
                              )}

                              <div className={layoutStyle === "compact" ? "flex-1 space-y-3" : "space-y-4"}>
                                <span className={`inline-block text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded bg-black/80 border text-white ${
                                  layoutStyle === "showcase" ? "text-amber-400 border-amber-400/30" : ""
                                }`} style={{ borderColor: siteConfig.accentColor || siteConfig.primaryColor, color: siteConfig.accentColor || siteConfig.primaryColor }}>
                                  {layoutStyle === "compact" ? "Est. Premium Care" : "Welcome to Premium Artistry"}
                                </span>
                                
                                <h1 
                                  className={`font-semibold text-white leading-tight antialiased cursor-pointer hover:opacity-80 transition-opacity ${
                                    layoutStyle === "luxury" ? "text-3xl md:text-4xl" :
                                    layoutStyle === "modern" ? "text-4xl md:text-5xl" :
                                    layoutStyle === "compact" ? "text-2xl md:text-3xl" :
                                    "text-5xl md:text-6xl tracking-tighter"
                                  }`}
                                  onClick={(e) => {
                                    if (!isCustomerOnlyMode) {
                                      e.preventDefault();
                                      setActiveStep(2);
                                      setTimeout(() => document.getElementById("settings-hero")?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    }
                                  }}
                                  title={!isCustomerOnlyMode ? "Click to edit Hero Settings" : ""}
                                >
                                  {siteConfig.heroHeadline || siteConfig.shopName}
                                </h1>
                                
                                <p className={`text-gray-300 italic leading-relaxed ${
                                  layoutStyle === "luxury" ? "text-xs md:text-sm max-w-md mx-auto" :
                                  layoutStyle === "modern" ? "text-sm md:text-base max-w-lg" :
                                  layoutStyle === "compact" ? "text-xs max-w-sm" :
                                  "text-base md:text-lg max-w-2xl mx-auto opacity-90"
                                }`}>
                                  "{siteConfig.heroSubHeadline || siteConfig.tagline || 'Experience unmatched design and absolute luxury beauty rituals.'}"
                                </p>

                                <div className={`pt-2 flex flex-wrap gap-3 ${
                                  layoutStyle === "modern" ? "justify-start" : "justify-center sm:justify-start"
                                } ${layoutStyle !== "modern" && layoutStyle !== "compact" ? "sm:justify-center" : ""}`}>
                                  <button
                                    onClick={() => {
                                      setBookingSelectedServiceId("");
                                      setBookingSelectedStaffId("any");
                                      setBookingSelectedTime("");
                                      setBookingClientName("");
                                      setBookingClientPhone("");
                                      setBookingClientNotes("");
                                      setBookingSuccessMode(false);
                                      setIsBookingModalOpen(true);
                                    }}
                                    className={`px-5 py-2.5 text-xs text-center font-bold rounded-lg shadow-xl shadow-black/30 inline-block text-black customer-btn cursor-pointer ${
                                      siteConfig.animations?.hoverEffects ? "hover:scale-[1.02] transition-colors duration-300" : "transition-none"
                                    }`}
                                    style={{ backgroundColor: siteConfig.buttonColor, color: (siteConfig.buttonColor || "").toLowerCase() === "#d4af37" ? "#111" : "#fff" }}
                                  >
                                    {siteConfig.heroCtaText || "Book Appointment"}
                                  </button>
                                  <a
                                    href="#sec-services"
                                    className={`px-5 py-2.5 text-xs text-center font-bold text-white border inline-block customer-btn ${
                                      siteConfig.animations?.hoverEffects ? "hover:bg-white/10 transition-colors duration-300" : "transition-none"
                                    } ${
                                      layoutStyle === "showcase" 
                                        ? "bg-[#D4AF37]/10 border-[#D4AF37]/40" 
                                        : "border-white/20 rounded-lg bg-black/40"
                                    }`}
                                  >
                                    View Treatments
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          </motion.section>
                        );

                      // ROW: ABOUT NARRATIVE
                      case "about":
                        return (
                          <motion.section
                            key="sec-about"
                            id="sec-about"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className="py-16 px-6 max-w-4xl mx-auto space-y-8 border-b border-white/[0.04] text-center"
                          >
                            <motion.div variants={premiumItemVariants} className="space-y-4">
                              <span className="text-[10px] uppercase tracking-[0.3em] font-mono opacity-50 block" style={{ color: siteConfig.primaryColor }}>{siteConfig.shopName} Heritage</span>
                              <h2 
                                className="text-3xl md:text-4xl font-semibold text-white tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  if (!isCustomerOnlyMode) {
                                    e.preventDefault();
                                    setActiveStep(3);
                                    setTimeout(() => document.getElementById("settings-services")?.scrollIntoView({ behavior: 'smooth' }), 100);
                                  }
                                }}
                                title={!isCustomerOnlyMode ? "Click to edit Services & Content" : ""}
                              >{siteConfig.aboutTitle || "Our Story"}</h2>
                              <div className="w-16 h-0.5 bg-amber-500/20 mx-auto rounded" style={{ backgroundColor: `${siteConfig.primaryColor}40` }} />
                              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto italic">
                                {siteConfig.aboutDescription || "We provide unmatched quality and service."}
                              </p>
                            </motion.div>
                          </motion.section>
                        );
                      // ROW: SERVICES
                      case "services":
                        const sLayoutStyle = siteConfig.layoutStyle || "luxury";
                        return (
                          <motion.section
                              key="sec-services"
                              id="sec-services"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className={`py-14 px-6 mx-auto space-y-8 border-b border-white/[0.04] ${
                              sLayoutStyle === "luxury" ? "max-w-4xl" :
                              sLayoutStyle === "modern" ? "max-w-6xl" :
                              sLayoutStyle === "compact" ? "max-w-3xl" :
                              "max-w-5xl"
                            }`}
                          >
                            <motion.div variants={premiumItemVariants} className={`space-y-2 ${sLayoutStyle === "modern" ? "text-left" : "text-center"}`}>
                              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 block">Bespoke Ritual Catalog</span>
                              <h2 
                                className={`font-semibold text-white tracking-tight cursor-pointer hover:opacity-80 transition-opacity ${
                                  sLayoutStyle === "showcase" ? "text-4xl" : "text-2xl"
                                }`}
                                onClick={(e) => {
                                  if (!isCustomerOnlyMode) {
                                    e.preventDefault();
                                    setActiveStep(3);
                                    setTimeout(() => document.getElementById("settings-services")?.scrollIntoView({ behavior: 'smooth' }), 100);
                                  }
                                }}
                                title={!isCustomerOnlyMode ? "Click to edit Services" : ""}
                              >Boutique Treatments</h2>
                              <div className={`w-12 h-1 bg-amber-500/20 rounded ${sLayoutStyle === "modern" ? "mr-auto" : "mx-auto"}`} style={{ backgroundColor: `${siteConfig.primaryColor}30` }} />
                            </motion.div>

                            <div className={`grid gap-4 ${
                              sLayoutStyle === "luxury" ? "grid-cols-1 md:grid-cols-2" :
                              sLayoutStyle === "modern" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                              sLayoutStyle === "compact" ? "grid-cols-1" :
                              "grid-cols-1 sm:grid-cols-2"
                            }`}>
                              {siteConfig.services.length === 0 ? (
                                <p className="text-xs text-gray-500 italic text-center py-4 col-span-full">No services registered inside treatment studio.</p>
                              ) : (
                        siteConfig.services
                          .filter(s => !s.hidden)
                          .map((serv) => (
                            <motion.div
                              key={serv.id}
                              variants={premiumItemVariants}
                                    className={`p-5 border duration-300 transition-all bg-black/30 flex flex-col justify-between ${
                                      siteConfig.showServiceImages ? "gap-4" : ""
                                    } ${
                                      sLayoutStyle === "compact" ? "flex-row items-center gap-6 rounded-lg" : 
                                      sLayoutStyle === "showcase" ? "rounded-2xl p-8 hover:scale-[1.02]" :
                                      "rounded-xl hover:border-opacity-60"
                                    }`}
                                    style={{ borderColor: `${siteConfig.primaryColor}15` }}
                                  >
                                    {siteConfig.showServiceImages && serv.img && (
                                       <div className={`shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/10 ${
                                         sLayoutStyle === "compact" ? "w-16 h-16" : "w-full h-32 mb-1"
                                       }`}>
                                         <img src={serv.img} alt={serv.name} className="w-full h-full object-cover" />
                                       </div>
                                     )}
                                    
                                    <div className={sLayoutStyle === "compact" ? "flex-1" : ""}>
                                      <div className="flex justify-between items-start gap-4 mb-1">
                                        <div className="space-y-0.5">
                                          {serv.category && (
                                            <span className="text-[8px] uppercase tracking-tighter font-mono opacity-50 block">{serv.category}</span>
                                          )}
                                          <h3 className="text-sm font-semibold text-white tracking-tight">{serv.name}</h3>
                                        </div>
                                        {sLayoutStyle !== "compact" && siteConfig.showServicePrices && (
                                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]" style={{ color: siteConfig.primaryColor }}>
                                            {serv.price}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {siteConfig.showServiceDuration && serv.duration && (
                                        <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider mb-2 opacity-80" style={{ color: siteConfig.primaryColor }}>
                                          <span className="w-1 h-1 rounded-full bg-current" />
                                          {serv.duration}
                                        </div>
                                      )}

                                      <p className="text-[11px] text-gray-400 leading-relaxed font-light mt-1 line-clamp-3">
                                        {serv.desc}
                                      </p>
                                      
                                      {serv.onlineBooking !== false && (
                                        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center">
                                          <div className="inline-flex items-center bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-lg p-1 gap-1 transition-colors backdrop-blur-sm shadow-inner">
                                            <button
                                              onClick={() => {
                                                setBookingSelectedServiceId(serv.id);
                                                setBookingSelectedStaffId("any");
                                                setBookingSelectedTime("");
                                                setBookingClientName("");
                                                setBookingClientPhone("");
                                                setBookingClientNotes("");
                                                setBookingSuccessMode(false);
                                                setIsBookingModalOpen(true);
                                              }}
                                              className="customer-action-btn text-[9px] tracking-widest font-mono uppercase font-bold flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer text-left px-2.5 py-1.5 rounded"
                                              style={{ color: siteConfig.accentColor || siteConfig.primaryColor }}
                                            >
                                              <span>Book Treatment →</span>
                                            </button>

                                            <div className="w-[1px] h-3 bg-white/10 self-center" />

                                            <div className="relative flex items-center">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const details = `Bespoke Treatment: ${serv.name}
${serv.category ? `Category: ${serv.category}\n` : ""}${serv.duration ? `Duration: ${serv.duration}\n` : ""}${siteConfig.showServicePrices && serv.price ? `Fee: ${serv.price}\n` : ""}${serv.desc ? `Description: ${serv.desc}\n` : ""}`;
                                                  navigator.clipboard.writeText(details)
                                                    .then(() => {
                                                      setCopiedServiceId(serv.id);
                                                      setTimeout(() => {
                                                        setCopiedServiceId(null);
                                                      }, 2000);
                                                      notifyShort(`Copied "${serv.name}" details to clipboard!`);
                                                    })
                                                    .catch((err) => {
                                                      console.error("Clipboard error", err);
                                                      notifyShort("Copy failed. Please copy manually.");
                                                    });
                                                }}
                                                className="customer-action-btn text-[9px] tracking-widest font-mono uppercase font-bold flex items-center gap-1 hover:text-white transition-all cursor-pointer text-left opacity-75 hover:opacity-100 px-2 py-1.5 rounded"
                                                style={{ color: siteConfig.primaryColor }}
                                                title="Copy treatment details to clipboard"
                                              >
                                                {copiedServiceId === serv.id ? (
                                                  <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                                                ) : (
                                                  <Copy className="w-2.5 h-2.5 opacity-80" />
                                                )}
                                                <span>{copiedServiceId === serv.id ? "Copied!" : "Copy"}</span>
                                              </button>

                                              {/* Absolute-positioned micro-tooltip bubble */}
                                              {copiedServiceId === serv.id && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 bg-[#D4AF37] text-black text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-lg pointer-events-none z-50 flex items-center gap-1.5 whitespace-nowrap animate-bounce">
                                                  <Check className="w-2 h-2" strokeWidth={3} />
                                                  <span>Copied!</span>
                                                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-[#D4AF37]" />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {sLayoutStyle === "compact" && siteConfig.showServicePrices && (
                                      <div className="shrink-0 text-right">
                                        <span className="font-mono text-sm font-bold block" style={{ color: siteConfig.primaryColor }}>{serv.price}</span>
                                        <span className="text-[9px] uppercase text-gray-500 font-mono tracking-tighter">Treatment Fee</span>
                                      </div>
                                    )}
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </motion.section>
                        );

                      // ROW: TEAM COUTURE
                      case "team":
                        return (
                          <motion.section
                            key="sec-team"
                            id="sec-team"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className="py-14 px-6 max-w-4xl mx-auto space-y-8 border-b border-white/[0.04]"
                          >
                            <motion.div variants={premiumItemVariants} className="text-center space-y-2">
                              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 block">Our Specialized Personnel</span>
                              <h2 
                                className="text-2xl font-semibold text-white tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  if (!isCustomerOnlyMode) {
                                    e.preventDefault();
                                    setActiveStep(3);
                                    setTimeout(() => document.getElementById("settings-team")?.scrollIntoView({ behavior: 'smooth' }), 100);
                                  }
                                }}
                                title={!isCustomerOnlyMode ? "Click to edit Team" : ""}
                              >Savoir-Faire Specialists</h2>
                              <div className="w-12 h-1 bg-amber-500/20 mx-auto rounded" style={{ backgroundColor: `${siteConfig.primaryColor}30` }} />
                            </motion.div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                              {siteConfig.team.length === 0 ? (
                                <p className="text-xs text-gray-500 italic text-center py-4 col-span-2">No team specialists added yet.</p>
                              ) : (
                                siteConfig.team.map((stylist) => (
                                  <motion.div
                                    key={stylist.id}
                                    variants={premiumItemVariants}
                                    className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-xl duration-300 bg-black/30 ${siteConfig.animations?.hoverEffects ? "hover:scale-105 transition-transform duration-300" : ""}`}
                                    style={{ borderColor: `${siteConfig.primaryColor}15` }}
                                  >
                                    {siteConfig.showStaffPhotos && (
                                      <div className="w-20 h-20 bg-[#121212] border border-white/10 rounded-lg flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
                                        {stylist.img ? (
                                          <img src={stylist.img} alt={stylist.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-650" style={{ color: siteConfig.primaryColor }}>
                                            Staff Photo
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="space-y-1 text-center sm:text-left flex-1">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div>
                                          <h3 className="text-xs font-semibold text-white">{stylist.name}</h3>
                                          <p className="text-[10px] font-mono tracking-wide uppercase mt-0.5" style={{ color: siteConfig.primaryColor }}>
                                            {stylist.role}
                                          </p>
                                        </div>
                                        
                                        <div className="flex flex-col items-center sm:items-end gap-1">
                                          {siteConfig.showStaffExperience && stylist.experience && (
                                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Exp: {stylist.experience}</span>
                                          )}
                                          {siteConfig.showStaffRatings && stylist.rating && (
                                            <div className="flex gap-0.5">
                                              {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-2.5 h-2.5 ${i < (stylist.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`} />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <p className="text-[11px] text-gray-400 font-light leading-relaxed pt-1.5">
                                        {stylist.bio}
                                      </p>

                                      {/* Stylist Social & Portfolio URLs */}
                                      {(stylist.instagram || stylist.portfolioUrl) && (
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 select-none">
                                          {stylist.instagram && (
                                            <a
                                              href={`https://instagram.com/${stylist.instagram.replace(/^@/, "")}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1 px-1.5 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white rounded border border-white/[0.05] transition-all flex items-center gap-1.5 text-[9px] font-mono text-gray-400 cursor-pointer"
                                              title={`${stylist.name}'s Instagram`}
                                            >
                                              <Instagram className="w-3 h-3 text-pink-400/90" />
                                              <span>{stylist.instagram.startsWith("@") ? stylist.instagram : `@${stylist.instagram}`}</span>
                                            </a>
                                          )}
                                          {stylist.portfolioUrl && (
                                            <a
                                              href={stylist.portfolioUrl.startsWith("http") ? stylist.portfolioUrl : `https://${stylist.portfolioUrl}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1 px-1.5 bg-white/[0.03] hover:bg-white/[0.08] hover:text-white rounded border border-white/[0.05] transition-all flex items-center gap-1.5 text-[9px] font-mono text-gray-400 cursor-pointer"
                                              title={`${stylist.name}'s Portfolio`}
                                            >
                                              <Globe className="w-3 h-3" style={{ color: siteConfig.primaryColor }} />
                                              <span>Portfolio</span>
                                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                            </a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </motion.section>
                        );

                      // ROW: WHAT CLIENTS SAY
                      case "testimonials":
                        return (
                          <motion.section
                            key="sec-testimonials"
                            id="sec-testimonials"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className="py-14 px-6 max-w-4xl mx-auto space-y-8 border-b border-white/[0.04]"
                          >
                            <motion.div variants={premiumItemVariants} className="text-center space-y-2">
                              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 block">Authentic Client Experiences</span>
                              <h2 className="text-2xl font-semibold text-white tracking-tight">Luxury Review Hub</h2>
                              <div className="w-12 h-1 bg-amber-500/20 mx-auto rounded" style={{ backgroundColor: `${siteConfig.primaryColor}30` }} />
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {siteConfig.testimonials.length === 0 ? (
                                <p className="text-xs text-gray-500 italic text-center py-4 col-span-2">No recommendations registered.</p>
                              ) : (
                                siteConfig.testimonials.map((testi) => (
                                  <motion.div
                                    key={testi.id}
                                    variants={premiumItemVariants}
                                    className="p-5 p-r-8 border rounded-2xl bg-black/30 border-white/[0.04] space-y-3 relative overflow-hidden"
                                  >
                                    {/* Quote decoration */}
                                    <span className="absolute top-0 right-2 text-6xl text-white/[0.02] font-serif select-none pointer-events-none">“</span>
                                    
                                    {siteConfig.showReviewStars && (testi.rating || 5) && (
                                      <div className="flex gap-0.5 mb-1 relative z-10">
                                        {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-2.5 h-2.5 ${i < (testi.rating || 5) ? "fill-yellow-500 text-yellow-500" : "text-gray-700"}`} />
                                        ))}
                                      </div>
                                    )}

                                    <p className="text-[11px] text-gray-300 font-light italic leading-relaxed relative z-10">
                                      "{testi.text}"
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] relative z-10">
                                      <div className="flex items-center gap-2.5">
                                        {testi.avatarUrl ? (
                                          <img 
                                            src={testi.avatarUrl} 
                                            alt={testi.author} 
                                            className="w-6 h-6 rounded-full object-cover border border-white/[0.08]" 
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] font-mono font-medium text-gray-400">
                                            {testi.author ? testi.author.charAt(0).toUpperCase() : "?"}
                                          </div>
                                        )}
                                        {siteConfig.showReviewCustomerNames && (
                                          <span className="text-xs font-mono text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{testi.author}</span>
                                        )}
                                      </div>
                                      {siteConfig.showReviewDate && testi.date && (
                                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">{testi.date}</span>
                                      )}
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </motion.section>
                        );

                      // ROW: PORTFOLIO GALLERY
                      case "gallery":
                        return (
                          <motion.section
                            key="sec-gallery"
                            id="sec-gallery"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className="py-14 px-6 max-w-4xl mx-auto space-y-8 border-b border-white/[0.04]"
                          >
                            <motion.div variants={premiumItemVariants} className="text-center space-y-2">
                              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 block">Visual Portfolios</span>
                              <h2 
                                className="text-2xl font-semibold text-white tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  if (!isCustomerOnlyMode) {
                                    e.preventDefault();
                                    setActiveStep(2);
                                    setTimeout(() => document.getElementById("gallery-add-input")?.scrollIntoView({ behavior: 'smooth' }), 100);
                                  }
                                }}
                                title={!isCustomerOnlyMode ? "Click to edit Gallery" : ""}
                              >Our Style Creations</h2>
                              <div className="w-12 h-1 bg-amber-500/20 mx-auto rounded" style={{ backgroundColor: `${siteConfig.primaryColor}30` }} />
                              {siteConfig.galleryNarrative && (
                                <p className="text-xs text-stone-300 max-w-md mx-auto mt-3 font-light leading-relaxed antialiased">
                                  {siteConfig.galleryNarrative}
                                </p>
                              )}
                            </motion.div>

                            <div className={siteConfig.galleryLayout === "masonry" 
                              ? `columns-2 gap-3 pt-2 ${
                                  siteConfig.galleryImagesPerRow === 2 ? "md:columns-2" :
                                  siteConfig.galleryImagesPerRow === 3 ? "md:columns-3" : "md:columns-4"
                                }` 
                              : `grid grid-cols-2 gap-3 pt-2 ${
                                  siteConfig.galleryImagesPerRow === 2 ? "md:grid-cols-2" :
                                  siteConfig.galleryImagesPerRow === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
                                }`
                            }>
                              {siteConfig.gallery.length === 0 ? (
                                [
                                  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=250&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=250&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=250&auto=format&fit=crop&q=80",
                                  "https://images.unsplash.com/photo-1605497746444-17ddcc7e1276?w=250&auto=format&fit=crop&q=80"
                                ].map((imgUrl, idx) => (
                                  <motion.div key={idx} variants={premiumItemVariants} className={`${siteConfig.galleryLayout === "masonry" ? "mb-3 break-inside-avoid h-auto" : "aspect-[4/5]"} bg-black border border-white/10 rounded-lg overflow-hidden shrink-0`}>
                                    <img src={imgUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                  </motion.div>
                                ))
                              ) : (
                                siteConfig.gallery.map((imgUrl, idx) => {
                                  const metadata = siteConfig.galleryMetadata?.[imgUrl] || {};
                                  return (
                                    <motion.div key={idx} variants={premiumItemVariants} className={`${siteConfig.galleryLayout === "masonry" ? "mb-3 break-inside-avoid h-auto" : "aspect-[4/5]"} bg-[#1a1a1a] border border-white/15 rounded-lg overflow-hidden shrink-0 relative group cursor-pointer`}>
                                      <img 
                                        src={imgUrl} 
                                        alt={metadata.alt || `Nexora styled hair design creation ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform ease-out" 
                                      />
                                      
                                      {/* Absolute Positioned Custom Scribe Overlay */}
                                      {metadata.caption && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5">
                                          <span className="text-[8px] font-mono tracking-wider uppercase text-[#D4AF37] px-1 py-0.5 rounded bg-black/40 w-fit mb-1 border border-[#D4AF37]/15">
                                            Signature Look
                                          </span>
                                          <p className="text-[11px] text-white font-medium leading-snug line-clamp-2">
                                            {metadata.caption}
                                          </p>
                                        </div>
                                      )}
                                    </motion.div>
                                  );
                                })
                              )}
                            </div>
                          </motion.section>
                        );

                      // ROW: FIND & CONNECT (Contact, Map & Location)
                      case "contact":
                        return (
                          <motion.section
                            key="sec-contact"
                            id="sec-contact"
                            variants={premiumContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            className="py-14 px-6 max-w-4xl mx-auto space-y-8"
                          >
                            <motion.div variants={premiumItemVariants} className="text-center space-y-2">
                              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 block">Make an Appointment</span>
                              <h2 
                                className="text-2xl font-semibold text-white tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  if (!isCustomerOnlyMode) {
                                    e.preventDefault();
                                    setActiveStep(1);
                                    setTimeout(() => document.getElementById("settings-contact")?.scrollIntoView({ behavior: 'smooth' }), 100);
                                  }
                                }}
                                title={!isCustomerOnlyMode ? "Click to edit Contact Info" : ""}
                              >Location & Hours</h2>
                              <div className="w-12 h-1 bg-amber-500/20 mx-auto rounded" style={{ backgroundColor: `${siteConfig.primaryColor}30` }} />
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                              <motion.div variants={premiumItemVariants} className="space-y-4 bg-black/45 hover:bg-black/60 duration-300 p-6 rounded-2xl border border-white/[0.04]">
                                <h3 className="text-xs font-semibold text-white tracking-wide uppercase border-b border-white/[0.04] pb-2">Salon Concierge Desk</h3>
                                
                                <div className="space-y-3.5 text-xs text-gray-300">
                                  {siteConfig.showContactAddress && (
                                    <div className="flex items-start gap-2.5">
                                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" style={{ color: siteConfig.primaryColor }} />
                                      <div>
                                        <span className="block font-semibold text-white mb-0.5">Address & Landmark</span>
                                        <p className="text-gray-400 font-light leading-relaxed">{siteConfig.address || "102, Link Road, Bandra West"}</p>
                                        {siteConfig.landmark && (
                                          <p className="text-[#D4AF37] font-mono text-[10px] mt-1 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded px-1.5 py-0.5 inline-block">
                                            Landmark: {siteConfig.landmark}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {siteConfig.showContactPhone && (
                                    <div className="flex items-start gap-2.5">
                                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" style={{ color: siteConfig.primaryColor }} />
                                      <div>
                                        <span className="block font-semibold text-white mb-0.5">Voiceline Concierge</span>
                                        <p className="text-gray-400 font-mono text-[11px] mb-1.5">+91 {siteConfig.phone || "98765 43210"}</p>
                                        <a
                                          href={`tel:+91${siteConfig.phone}`}
                                          className="inline-flex items-center gap-1 text-[10px] bg-white/[0.06] hover:bg-[#D4AF37] hover:text-black transition-all px-2.5 py-1 rounded"
                                        >
                                          <Phone className="w-2.5 h-2.5" /> Call Line
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {siteConfig.showContactWhatsApp && (
                                    <div className="flex items-start gap-2.5">
                                      <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" style={{ color: siteConfig.primaryColor }} />
                                      <div>
                                        <span className="block font-semibold text-white mb-0.5">WhatsApp Booking</span>
                                        <p className="text-gray-400 font-mono text-[11px] mb-1.5">+91 {siteConfig.whatsapp || "98765 43210"}</p>
                                        <a
                                          href={`https://wa.me/91${siteConfig.whatsapp.replace(/\D/g, "")}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/20 text-emerald-300 border border-emerald-500/10 hover:bg-emerald-500 hover:text-black transition-all px-2.5 py-1 rounded"
                                        >
                                          <MessageSquare className="w-2.5 h-2.5" /> Chat Now
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-start gap-2.5 pt-1 border-t border-white/[0.04]">
                                    <Globe className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" style={{ color: siteConfig.primaryColor }} />
                                    <div>
                                      <span className="block font-semibold text-white mb-0.5">Website URL</span>
                                      <a
                                        href={`https://${siteConfig.subdomain || "nexora"}.nexorasalonos.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-stone-300 font-mono text-[11px] underline hover:text-[#D4AF37] break-all"
                                      >
                                        {siteConfig.subdomain || "nexora"}.nexorasalonos.com
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>

                              {/* OPERATING HOURS COLUMN */}
                              <motion.div variants={premiumItemVariants} className="space-y-4 bg-black/45 hover:bg-black/60 duration-300 p-6 rounded-2xl border border-white/[0.04]">
                                <h3 className="text-xs font-semibold text-white tracking-wide uppercase border-b border-white/[0.04] pb-2">Operating Hours</h3>
                                
                                <div className="space-y-2 text-xs">
                                  {(siteConfig.businessHours || []).map((b) => (
                                    <div key={b.day} className="flex justify-between items-center text-gray-300 py-0.5 font-mono border-b border-white/[0.02] last:border-b-0">
                                      <span className="font-light text-[11px]">{b.day}</span>
                                      {b.closed ? (
                                        <span className="text-red-400 font-bold text-[9px] uppercase bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/10 tracking-wider">Closed</span>
                                      ) : (
                                        <span className="text-gray-400 font-light text-[10px]">
                                          {b.openTime && b.closeTime ? `${b.openTime} - ${b.closeTime}` : "09:00 - 18:00"}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Dynamic Holiday Closures List */}
                                {siteConfig.holidayClosures && siteConfig.holidayClosures.length > 0 && (
                                  <div className="pt-3 border-t border-white/[0.04] space-y-1.5">
                                    <span className="block text-[10px] font-mono text-[#D4AF37]/90 font-bold tracking-wider uppercase">Holiday closures</span>
                                    <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                                      {siteConfig.holidayClosures.map((h) => {
                                        let formattedDate = h.date;
                                        try {
                                          if (h.date) {
                                            const d = new Date(h.date + "T00:00:00");
                                            formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                          }
                                        } catch (e) {}

                                        return (
                                          <div key={h.id} className="flex justify-between items-center text-[10px] font-mono text-gray-400 leading-normal">
                                            <span className="truncate pr-2 font-light">{h.name}</span>
                                            <span className="text-red-400/95 text-[9px] bg-red-950/15 px-1.5 py-0.2 rounded border border-red-900/10 font-bold shrink-0">{formattedDate}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Interactive Date Status Checker */}
                                <div className="pt-3 border-t border-white/[0.04] space-y-2">
                                  <span className="block text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider">Status Checker</span>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="date"
                                      id="preview-date-checker"
                                      className="bg-black/60 text-white text-[11px] font-mono px-2 py-1 rounded border border-white/[0.08] focus:border-[#D4AF37] focus:ring-0 outline-none w-full"
                                      defaultValue={new Date().toISOString().substring(0, 10)}
                                      onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        const statusEl = document.getElementById("preview-status-result");
                                        if (!selectedDate || !statusEl) return;
                                        
                                        // Check for holiday closure first
                                        const isHoliday = (siteConfig.holidayClosures || []).find(h => h.date === selectedDate);
                                        if (isHoliday) {
                                          statusEl.innerHTML = `<span class="text-red-400 font-bold uppercase text-[9px] bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/10 tracking-wider">Closed</span> <span class="text-stone-400 font-serif italic text-[10px] ml-1">(${isHoliday.name})</span>`;
                                          return;
                                        }

                                        // Otherwise check regular day
                                        try {
                                          const d = new Date(selectedDate + "T00:00:00");
                                          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                          const selectedDayName = days[d.getDay()];
                                          const regularHour = (siteConfig.businessHours || []).find(b => b.day === selectedDayName);
                                          
                                          if (!regularHour || regularHour.closed) {
                                            statusEl.innerHTML = `<span class="text-red-400 font-bold uppercase text-[9px] bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/10 tracking-wider">Closed</span> <span class="text-stone-500 font-mono text-[9px] ml-1">(${selectedDayName})</span>`;
                                          } else {
                                            statusEl.innerHTML = `<span class="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/10 tracking-wider">Open</span> <span class="text-stone-300 font-mono text-[9px] ml-1">(${regularHour.openTime}-${regularHour.closeTime})</span>`;
                                          }
                                        } catch (err) {
                                          statusEl.innerHTML = `<span class="text-gray-500">N/A</span>`;
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-300 font-mono pt-0.5">
                                    <span className="text-[10px] text-gray-500 shrink-0">Status:</span>
                                    <div id="preview-status-result" className="text-[11px] flex items-center flex-wrap gap-1 leading-none">
                                      {(() => {
                                        const d = new Date();
                                        const year = d.getFullYear();
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const currentDateStr = `${year}-${month}-${day}`;

                                        const isHoliday = (siteConfig.holidayClosures || []).find(h => h.date === currentDateStr);
                                        if (isHoliday) {
                                          return (
                                            <>
                                              <span className="text-red-400 font-bold uppercase text-[9px] bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/10 tracking-wider">Closed</span>
                                              <span className="text-stone-400 font-serif italic text-[10px] ml-1">({isHoliday.name})</span>
                                            </>
                                          );
                                        }
                                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                        const dDay = days[d.getDay()];
                                        const regularHour = (siteConfig.businessHours || []).find(b => b.day === dDay);
                                        if (!regularHour || regularHour.closed) {
                                          return (
                                            <>
                                              <span className="text-red-400 font-bold uppercase text-[9px] bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/10 tracking-wider">Closed</span>
                                              <span className="text-stone-500 font-mono text-[9px] ml-1">({dDay})</span>
                                            </>
                                          );
                                        }
                                        return (
                                          <>
                                            <span className="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/10 tracking-wider">Open Today</span>
                                            <span className="text-stone-300 font-mono text-[9px] ml-1">({regularHour.openTime} - {regularHour.closeTime})</span>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Realistic Google Map Embed Emulator */}
                              {siteConfig.showContactMaps && (
                                <motion.div variants={premiumItemVariants} className="bg-[#121212] border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col justify-center items-center p-4 text-center space-y-3 relative group">
                                  <div className="absolute inset-0 bg-[radial-gradient(#1e1e1e_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />
                                  
                                  <div className="relative z-10 space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20" style={{ color: siteConfig.primaryColor }}>
                                      <MapPin className="w-5 h-5 mx-auto" />
                                    </div>
                                    <h4 className="text-xs font-semibold text-white uppercase">Interactive Location Map</h4>
                                    <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">View real-time directions and geographical layouts.</p>
                                  </div>

                                  <a
                                    href={siteConfig.googleMapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative z-10 px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg border hover:bg-white/5 transition-all text-white flex items-center gap-1.5 mx-auto bg-black border-white/20"
                                  >
                                    <span>Open Google Maps</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </motion.div>
                              )}
                            </div>
                          </motion.section>
                        );

                      default:
                        return null;
                    }
                  })}

                  {/* HIGH-END FOOTER */}
                  <footer 
                    className={`border-t border-white/[0.04] py-12 px-6 space-y-6 transition-all ${
                        siteConfig.footerStyle === "luxury" ? "text-center md:text-left md:flex md:items-center md:justify-between space-y-0" :
                        siteConfig.footerStyle === "modern" ? "text-center grid grid-cols-1 md:grid-cols-3 gap-8" :
                        "text-center space-y-4"
                    }`} 
                    style={{ 
                        backgroundColor: siteConfig.footerBgColor || siteConfig.secondaryColor,
                        color: siteConfig.footerTextColor || "#FFFFFF"
                    }}
                  >
                    <div className="space-y-4">
                        <div className={`flex items-center gap-2.5 ${siteConfig.footerStyle === "luxury" ? "justify-start" : "justify-center"}`}>
                        <span className="text-xs uppercase font-serif tracking-widest" style={{ color: siteConfig.primaryColor }}>
                            {siteConfig.shopName}
                        </span>
                        </div>
                        {siteConfig.footerStyle === "modern" && (
                            <p className="text-[10px] opacity-60 leading-relaxed max-w-xs mx-auto">
                                Curating high-fashion hair architecture and elite botanical wellness rituals for the contemporary individual.
                            </p>
                        )}
                    </div>

                    <div className={`flex gap-3 ${siteConfig.footerStyle === "luxury" ? "justify-end" : "justify-center"}`}>
                      {siteConfig.instagramUrl && (
                        <a href={siteConfig.instagramUrl} className="p-2 border border-current opacity-30 hover:opacity-100 rounded-full transition-all" title="Instagram">
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {siteConfig.facebookUrl && (
                        <a href={siteConfig.facebookUrl} className="p-2 border border-current opacity-30 hover:opacity-100 rounded-full transition-all" title="Facebook">
                          <Facebook className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {siteConfig.twitterUrl && (
                        <a href={siteConfig.twitterUrl} className="p-2 border border-current opacity-30 hover:opacity-100 rounded-full transition-all flex items-center justify-center" title="Twitter / X">
                          <Twitter className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {siteConfig.youtubeUrl && (
                        <a href={siteConfig.youtubeUrl} className="p-2 border border-current opacity-30 hover:opacity-100 rounded-full transition-all" title="YouTube">
                          <Youtube className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {siteConfig.tiktokUrl && (
                        <a href={siteConfig.tiktokUrl} className="w-[34px] h-[34px] border border-current opacity-30 hover:opacity-100 rounded-full transition-all flex items-center justify-center" title="TikTok">
                          <span className="font-bold text-[13px] leading-none mb-0.5">♪</span>
                        </a>
                      )}
                      {siteConfig.pinterestUrl && (
                        <a href={siteConfig.pinterestUrl} className="w-[34px] h-[34px] border border-current opacity-30 hover:opacity-100 rounded-full transition-all flex items-center justify-center" title="Pinterest">
                          <span className="font-bold text-[13px] leading-none">P</span>
                        </a>
                      )}
                    </div>

                    <div className={`space-y-1 ${siteConfig.footerStyle === "modern" ? "md:text-right" : ""}`}>
                        <p className={`text-[10px] opacity-50 ${siteConfig.footerStyle === "luxury" ? "text-right" : ""}`}>
                        © {new Date().getFullYear()} {siteConfig.shopName}.
                        </p>
                        <span className="text-[8px] opacity-30 uppercase tracking-[0.2em]">Crafted via SalonOS</span>
                    </div>
                  </footer>

                  {/* INTERACTIVE BOOKING WIDGET MODAL */}
                  {isBookingModalOpen && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto">
                      <div className="bg-[#0e0e0e] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[90vh]">
                        {/* Header banner */}
                        <div className="border-b border-white/[0.05] p-4 flex items-center justify-between relative bg-black/40">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-mono opacity-50 block">Reservation Portal</span>
                            <span className="text-sm font-semibold tracking-tight uppercase" style={{ color: siteConfig.primaryColor }}>
                              Book Appointment
                            </span>
                          </div>
                          <button
                            onClick={() => setIsBookingModalOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Booking Success Stage */}
                        {bookingSuccessMode ? (
                          <div className="p-6 text-center space-y-6 flex-1 overflow-y-auto">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto scale-110 animate-pulse">
                              <Check className="w-7 h-7" strokeWidth={2.5} />
                            </div>

                            <div className="space-y-1.5">
                              <h3 className="text-base font-semibold text-white">Treatment Spot Confirmed!</h3>
                              <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                                Your simulated reservation has been logged successfully and synced instantly to the salon manager logs.
                              </p>
                            </div>

                            {/* Simulated Ticket design */}
                            <div className="bg-black/40 border border-white/[0.04] rounded-xl p-4 text-left text-xs space-y-2.5 relative overflow-hidden font-mono">
                              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-6 rounded-r-full bg-[#0e0e0e]" />
                              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-6 rounded-l-full bg-[#0e0e0e]" />
                              
                              <div className="border-b border-dashed border-white/10 pb-2 flex justify-between">
                                <span className="text-gray-500 uppercase text-[9px]">Ticket No.</span>
                                <span className="text-[#D4AF37] text-[10px] uppercase font-bold">NXS-{Math.floor(1000 + Math.random() * 9000)}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                <div className="col-span-2">
                                  <span className="text-gray-500 uppercase text-[8px] block">Client Name</span>
                                  <span className="text-white font-sans font-semibold">{bookingClientName}</span>
                                </div>
                                <div className="col-span-2 border-t border-white/[0.03] pt-2">
                                  <span className="text-gray-500 uppercase text-[8px] block">Service Reserved</span>
                                  <span className="text-white font-sans text-xs" style={{ color: siteConfig.primaryColor }}>
                                    {siteConfig.services.find(s => s.id === bookingSelectedServiceId)?.name || "Premium Haircare Service"}
                                  </span>
                                </div>
                                <div className="col-span-2 border-t border-white/[0.03] pt-2 grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-500 uppercase text-[8px] block">Specialist</span>
                                    <span className="text-white font-sans">
                                      {bookingSelectedStaffId === "all" || bookingSelectedStaffId === "any"
                                        ? "Any Specialist"
                                        : siteConfig.team.find(t => t.id === bookingSelectedStaffId)?.name || "Salon Expert"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 uppercase text-[8px] block">Schedule Lock</span>
                                    <span className="text-amber-500">{bookingSelectedDate} at {bookingSelectedTime}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setIsBookingModalOpen(false)}
                              className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                              Awesome, Done!
                            </button>
                          </div>
                        ) : (
                          <div className="p-5 overflow-y-auto space-y-4 flex-1">
                            {/* STEP 1: SERVICE SELECTOR */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">1. Select Service Menu</label>
                              <select
                                className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37]/50 focus:outline-none"
                                value={bookingSelectedServiceId}
                                onChange={(e) => setBookingSelectedServiceId(e.target.value)}
                              >
                                <option value="">-- Choose Treatment --</option>
                                {siteConfig.services.map(serv => (
                                  <option key={serv.id} value={serv.id}>
                                    {serv.name} ({serv.price ? `${serv.price}` : "Inquire Fee"})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* STEP 2: STAFF SELECTOR */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">2. Assign Specialist</label>
                              <select
                                className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37]/50 focus:outline-none"
                                value={bookingSelectedStaffId}
                                onChange={(e) => setBookingSelectedStaffId(e.target.value)}
                              >
                                <option value="any">Select first available specialist</option>
                                {siteConfig.team.map(stylist => (
                                  <option key={stylist.id} value={stylist.id}>
                                    {stylist.name} - {stylist.role}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* STEP 3: DATE SELECTOR AND SERVICE WINDOW CHECK */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">3. Schedule Date</label>
                              <input
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2.5 focus:border-[#D4AF37]/50 focus:outline-none"
                                value={bookingSelectedDate}
                                onChange={(e) => {
                                  setBookingSelectedDate(e.target.value);
                                  setBookingSelectedTime(""); // reset slot selection
                                }}
                              />
                            </div>

                            {/* STEP 4: TIME SLOT WRAPPER */}
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">4. Pick Available Timing</label>
                              
                              {(() => {
                                // Determine day of week to check weekly business schedules
                                let isHolidayClosure = false;
                                let isDayDisabled = false;
                                let closureName = "";
                                let dayOfWeekName = "";

                                try {
                                  if (bookingSelectedDate) {
                                    const d = new Date(bookingSelectedDate + "T00:00:00");
                                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                    dayOfWeekName = days[d.getDay()];

                                    // Check holiday list
                                    const holiday = (siteConfig.holidayClosures || []).find(h => h.date === bookingSelectedDate);
                                    if (holiday) {
                                      isHolidayClosure = true;
                                      closureName = holiday.name;
                                    }

                                    // Check weekly work schedule
                                    const configEnabledDays = siteConfig.bookingConfig?.enabledDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                    if (!configEnabledDays.includes(dayOfWeekName)) {
                                      isDayDisabled = true;
                                    }

                                    // Check if day is marked closed in business hours list
                                    const regularHour = (siteConfig.businessHours || []).find(b => b.day === dayOfWeekName);
                                    if (regularHour?.closed) {
                                      isDayDisabled = true;
                                    }
                                  }
                                } catch (e) {}

                                if (isHolidayClosure) {
                                  return (
                                    <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/25 p-2.5 rounded-lg text-center font-sans">
                                      Closed for Holiday: <strong>{closureName}</strong>
                                    </p>
                                  );
                                }

                                if (isDayDisabled) {
                                  return (
                                    <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/25 p-2.5 rounded-lg text-center font-sans">
                                      Closed on <strong>{dayOfWeekName || "this day"}s</strong>. Please pick active work day.
                                    </p>
                                  );
                                }

                                const interval = siteConfig.bookingConfig?.interval || 30;
                                const startTime = siteConfig.bookingConfig?.startTime || "09:00";
                                const endTime = siteConfig.bookingConfig?.endTime || "18:00";
                                const slots = generateSlotsForDay(startTime, endTime, interval);

                                const noticeHours = siteConfig.bookingConfig?.minimumNoticeHours !== undefined ? siteConfig.bookingConfig.minimumNoticeHours : 2;
                                const dateBlocked = siteConfig.bookingConfig?.blockedSlots?.[bookingSelectedDate] || [];
                                const dateAppointments = (siteConfig.appointments || []).filter(a => a.date === bookingSelectedDate);

                                if (slots.length === 0) {
                                  return <p className="text-xs text-gray-500 italic text-center py-2">No operating hours configured.</p>;
                                }

                                return (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                      {slots.map(slot => {
                                        const isNoticeBlocked = isSlotWithinNoticePeriod(bookingSelectedDate, slot, noticeHours);
                                        const isBlocked = dateBlocked.includes(slot) || isNoticeBlocked;
                                        const isBooked = dateAppointments.some(a => a.time === slot && (bookingSelectedStaffId === "all" || bookingSelectedStaffId === "any" || a.staffId === bookingSelectedStaffId));
                                        const isDisabled = isBlocked || isBooked;

                                        return (
                                          <button
                                            key={slot}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => setBookingSelectedTime(slot)}
                                            className={`py-2 px-1 text-[10px] font-mono rounded-md border text-center transition-all ${
                                              isDisabled ? "opacity-30 line-through bg-black border-white/5 text-gray-600 cursor-not-allowed" :
                                              bookingSelectedTime === slot ? "bg-[#D4AF37] border-[#D4AF37] text-black font-bold" :
                                              "bg-black hover:border-white/20 border-white/10 text-gray-300 cursor-pointer"
                                            }`}
                                            title={isNoticeBlocked ? `Requires at least ${noticeHours} hours notice` : undefined}
                                          >
                                            {slot.replace(" AM", "").replace(" PM", "")}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {noticeHours > 0 && (
                                      <p className="text-[9px] text-[#D4AF37]/75 italic leading-snug">
                                        * Online bookings require at least {noticeHours} {noticeHours === 1 ? "hour" : "hours"} advance notice.
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* STEP 5: CLIENT DETAILS */}
                            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                              <span className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">5. Client Details</span>
                              
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Your Full Name"
                                  className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2 focus:border-[#D4AF37]/50 focus:outline-none"
                                  value={bookingClientName}
                                  onChange={(e) => setBookingClientName(e.target.value)}
                                />
                                <input
                                  type="tel"
                                  placeholder="Phone Number (e.g., 98765-43210)"
                                  className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2 focus:border-[#D4AF37]/50 focus:outline-none font-mono"
                                  value={bookingClientPhone}
                                  onChange={(e) => setBookingClientPhone(e.target.value)}
                                />
                                <textarea
                                  placeholder="Special requests or styling history... (Optional)"
                                  rows={2}
                                  className="w-full bg-black border border-white/[0.08] text-xs text-white rounded-lg p-2 focus:border-[#D4AF37]/50 focus:outline-none"
                                  value={bookingClientNotes}
                                  onChange={(e) => setBookingClientNotes(e.target.value)}
                                />
                              </div>
                            </div>

                            {/* TRIGGER BOOK ACTION */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!bookingSelectedServiceId) {
                                  notifyShort("Please select a service menu item.");
                                  return;
                                }
                                if (!bookingSelectedDate) {
                                  notifyShort("Please pick a calendar date.");
                                  return;
                                }
                                if (!bookingSelectedTime) {
                                  notifyShort("Please select a timing slot.");
                                  return;
                                }

                                const noticeHours = siteConfig.bookingConfig?.minimumNoticeHours !== undefined ? siteConfig.bookingConfig.minimumNoticeHours : 2;
                                if (isSlotWithinNoticePeriod(bookingSelectedDate, bookingSelectedTime, noticeHours)) {
                                  notifyShort(`Sorry! Bookings require at least ${noticeHours} hours advance notice.`);
                                  return;
                                }

                                if (!bookingClientName.trim()) {
                                  notifyShort("Please specify your name.");
                                  return;
                                }
                                if (!bookingClientPhone.trim()) {
                                  notifyShort("Please input your phone number.");
                                  return;
                                }

                                const selectedService = siteConfig.services.find(s => s.id === bookingSelectedServiceId);
                                const selectedStaff = siteConfig.team.find(t => t.id === bookingSelectedStaffId);

                                const appointmentObj = {
                                  serviceId: bookingSelectedServiceId,
                                  serviceName: selectedService?.name || "Premium Treatment",
                                  staffId: bookingSelectedStaffId,
                                  staffName: selectedStaff?.name || "Expert Practitioner",
                                  date: bookingSelectedDate,
                                  time: bookingSelectedTime,
                                  clientName: bookingClientName,
                                  clientPhone: bookingClientPhone,
                                  clientNotes: bookingClientNotes || undefined
                                };

                                bookSimulatedAppointment(appointmentObj);
                                setBookingSuccessMode(true);
                                notifyShort("Appointment Scheduled Successfully!");
                              }}
                              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#bfa345] text-black font-bold uppercase tracking-widest text-[10px] rounded-xl active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg shadow-[#D4AF37]/10"
                            >
                              <Sparkles className="w-4 h-4" />
                              Book Treatment Session
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image Cropping Tool Modal */}
                  <ImageCropperModal
                    isOpen={cropperOpen}
                    imageSrc={cropperSrc}
                    imageType={cropperType}
                    onCrop={handleCropComplete}
                    onCancel={() => {
                      setCropperOpen(false);
                      setCropperSrc("");
                    }}
                    onDelete={() => {
                      if (cropperType === "gallery-edit") {
                        const targetIdx = parseInt(cropperTargetId);
                        if (!isNaN(targetIdx)) {
                          removeGalleryImage(targetIdx);
                        }
                      }
                      setCropperOpen(false);
                      setCropperSrc("");
                    }}
                    onReplace={(file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCropperSrc(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />

                </div>

              </div>

            </div>
          </div>

        </section>
        
      </main>

      {!isCustomerOnlyMode && (
        <MobileBottomNav activeTab={activeMobileTab} setActiveTab={setActiveMobileTab} />
      )}

      {/* FLOATING ADMIN TRIGGER IF CUSTOMER ONLY */}
      {isCustomerOnlyMode && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2">
          <button
            onClick={() => {
              setIsCustomerOnlyMode(false);
              const url = new URL(window.location.href);
              url.searchParams.delete("subdomain");
              url.searchParams.delete("site");
              window.history.replaceState({}, document.title, url.pathname + url.search);
              notifyShort("Welcome back to SalonOS Builder!");
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#bda03c] text-black font-semibold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs flex items-center gap-2 cursor-pointer border border-[#D4AF37]/50"
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Open SalonOS Builder</span>
          </button>
        </div>
      )}

    </div>
  );
}
