import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// In-memory simple storage for published websites
const sitesDb: Record<string, any> = {
  "nexora-lounge": {
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
    themeMode: "dark",
    phone: "98765 43210",
    whatsapp: "98765 43210",
    address: "102, Link Road, Bandra West, Mumbai, Maharashtra 400050",
    landmark: "Near Grand Mall",
    googleMapUrl: "https://maps.google.com",
    facebookUrl: "https://facebook.com/nexorasalon",
    instagramUrl: "https://instagram.com/nexorasalon",
    youtubeUrl: "https://youtube.com/nexorasalon",
    metaTitle: "Nexora Hair & Lounge | West Hollywood Master Styling",
    metaDescription: "Experience bespoke color formulations, luxury balayage designs, and scalp detox treatments inside West Hollywood's premier botanical retreat.",
    keywords: "salon, hair stylist, balayage, botanical hair, west hollywood hair",
    heroHeadline: "The Art of Hair Architecture",
    heroSubHeadline: "Redefining contemporary luxury through bespoke botanical care and precision styling.",
    heroCtaText: "Book Appointment",
    aboutTitle: "Our Philosophical Narrative",
    aboutDescription: "We believe that hair is the purest form of wearable art. Our master artisans combine ancient botanical wisdom with modern chemical precision to ensure every strand thrives in both health and style.",
    status: "published",
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
        ratingCount: 142
      }
    ],
    testimonials: [
      {
        id: "1",
        author: "Genevieve K.",
        text: "The Balayage Elena gave me is truly breathtaking! I get endless compliments every day. Nexora Salon is pure magic."
      }
    ]
  },
  "royal-glow": {
    shopName: "Royal Glow Boutique",
    subdomain: "royal-glow",
    tagline: "Unveil Your Natural Radiance & Elegance",
    primaryColor: "#D4AF37",
    secondaryColor: "#1B1B1B",
    buttonColor: "#D4AF37",
    fontFamily: "serif",
    logo: "",
    banner: "",
    phone: "+1 (555) 321-7654",
    whatsapp: "+1 (555) 321-7654",
    address: "742 Luxe Blvd, Suite 100, Beverly Hills, CA",
    googleMapUrl: "https://maps.google.com",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
    metaTitle: "Royal Glow Boutique | Luxury Hair & Skin Treatments",
    metaDescription: "Step into our Beverly Hills sanctuary for elite styling, bespoke cuts, and glowing skincare treatments customized for you.",
    keywords: "hair salon, luxury skincare, beverly hills, balayage, facials",
    status: "published",
    sections: [
      { id: "hero", label: "Hero Banner", enabled: true },
      { id: "services", label: "Our Services", enabled: true },
      { id: "team", label: "Meet the Team", enabled: true },
      { id: "testimonials", label: "What Clients Say", enabled: true },
      { id: "gallery", label: "Style Portfolio", enabled: true },
      { id: "contact", label: "Find & Connect", enabled: true }
    ],
    services: [
      { id: "1", name: "Balayage Artistry & Blowout", price: "$240+", desc: "Custom dimensional hand-painted highlights, rich glaze, and high-shine blowout." },
      { id: "2", name: "Bespoke Sculpting Cut", price: "$110+", desc: "Includes absolute botanical detox wash, hydrating scalp massage, and precision designer cut." },
      { id: "3", name: "Ultimate Gold HydraFacial", price: "$180", desc: "A deluxe cleansing treatment paired with deep molecular hydration and 24k gold infusion mask." }
    ],
    team: [
      { id: "1", name: "Sophia Laurent", role: "Master Colorist & Stylist", bio: "With 12+ years of experience in couture styling and balayage artistry.", img: "" },
      { id: "2", name: "Liam Matthews", role: "Elite Skin Therapist", bio: "Passionate about high-tech botanical skincare and glow recovery treatments.", img: "" }
    ],
    testimonials: [
      { id: "1", author: "Genevieve K.", text: "The Balayage Sophia gave me is truly breathtaking! I get endless compliments every day. Nexora Salon is pure magic." },
      { id: "2", author: "Marcus D.", text: "A truly luxurious and relaxing experience. The service and the vibe are unmatched." }
    ],
    gallery: [],
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
    ]
  }
};

// API Route: AI Copywriting Generator
app.post("/api/ai/generate", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API Key is not configured on the server. Please add it to your secrets.",
    });
  }

  const { type, query, style, salonName } = req.body;

  try {
    let systemInstruction = "";
    let prompt = "";
    let responseSchema: any = undefined;
    let contents: any = "";

    if (type === "shopName") {
      systemInstruction = "You are a luxury branding expert. Generate a single, highly unique, and elegant name for a new luxury salon, spa, or beauty boutique.";
      prompt = `Generate a luxury salon brand name based on this description: ${query || "Luxury skincare and hair styling"}. Tone style: ${style || "elegant and modern"}. Output ONLY the name, nothing else.`;
      contents = prompt;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          shopName: { type: Type.STRING, description: "The beautiful generated luxury brand name." }
        },
        required: ["shopName"]
      };
    } else if (type === "tagline") {
      systemInstruction = "You are a luxury salon copywriter. Create beautiful, professional, and elegant tagline options for a high-end salon website. The tagline should be brief (1 sentence, max 10 words).";
      prompt = `Generate a salon tagline option for a salon named "${salonName || "Nexora"}". Vibe or description: ${query || "Luxury skincare and hair styling"}. Tone style: ${style || "elegant"}.`;
      contents = prompt;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          tagline: { type: Type.STRING, description: "The beautiful generated classy tagline." }
        },
        required: ["tagline"]
      };
    } else if (type === "about") {
      systemInstruction = "You are a professional brand voice copywriter. Write a compelling, elegant, and persuasive 'About Us' description for a luxury salon's website.";
      prompt = `Write an elegant 2-paragraph about bio for "${salonName || "Nexora Salon"}". Description/details: ${query || "high-end treatments with botanical products"}. Style tone: ${style || "luxury and warm"}.`;
      contents = prompt;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          aboutText: { type: Type.STRING, description: "The warm client-focused biography/about statement." }
        },
        required: ["aboutText"]
      };
    } else if (type === "services") {
      systemInstruction = "You are an elite beauty salon consultant. Provide a list of 3 premium services with luxurious names, standard high-end pricing, and detailed elegant descriptions.";
      prompt = `Generate a JSON list of exactly 3 signature services for "${salonName || "Nexora Salon"}" offering ${query || "premium hair and nail care"}. Ensure the prices reflect high-end luxury in USD. Style: ${style || "modern deluxe"}.`;
      contents = prompt;
      responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Luxurious beauty service title (e.g., 'Celestial Caviar Treatment')" },
            price: { type: Type.STRING, description: "High-end luxury pricing with currency symbol (e.g., '$130')" },
            desc: { type: Type.STRING, description: "An elegant, sensory sentence describing the service highlights and high quality benefits." }
          },
          required: ["name", "price", "desc"]
        }
      };
    } else if (type === "seo") {
      systemInstruction = "You are an expert SEO specialist for local luxury lifestyle brands.";
      prompt = `Generate highly professional SEO meta tag suggestions for the homepage of "${salonName || "Nexora Salon"}". Vibe: ${query || "top-tier medical spa and haircut sanctuary"}. Provide unique meta title (under 60 chars), meta description (under 160 chars), and relevant comma-separated keywords.`;
      contents = prompt;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          metaTitle: { type: Type.STRING, description: "Optimal SEO Title with the salon name." },
          metaDescription: { type: Type.STRING, description: "Persuasive meta description designed to maximize click-through rate." },
          keywords: { type: Type.STRING, description: "6-8 comma-separated optimized target keywords." }
        },
        required: ["metaTitle", "metaDescription", "keywords"]
      };
    } else if (type === "alt_caption") {
      const { imgUrl } = req.body;
      systemInstruction = "You are an elite local SEO and luxury lifestyle marketing copywriter. Analyze the beauty / hairstyle / nails / spa treatment shown in this image. Generate a crisp, descriptive, highly SEO-friendly 'altText' (max 12 words) focusing on relevant hair terms (e.g., 'Golden blonde balayage highlight with relaxed beach waves'), and a short, luxurious, elegant customer-facing 'caption' (max 20 words). Output must strictly follow the schema.";
      
      let imagePart: any = null;
      if (imgUrl) {
        if (imgUrl.startsWith("http")) {
          try {
            const fetchRes = await fetch(imgUrl);
            const arrayBuffer = await fetchRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            let mimeType = "image/jpeg";
            const contentType = fetchRes.headers.get("Content-Type");
            if (contentType) mimeType = contentType;
            imagePart = {
              inlineData: {
                mimeType,
                data: base64Data
              }
            };
          } catch (e) {
            console.error("Failed to fetch image from URL for Gemini:", e);
          }
        } else if (imgUrl.startsWith("data:")) {
          const matches = imgUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            imagePart = {
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            };
          }
        }
      }

      prompt = `Generate a gorgeous altText and caption for this style gallery photo at "${salonName || "Nexora Salon"}".`;
      if (imagePart) {
        contents = {
          parts: [imagePart, { text: prompt }]
        };
      } else {
        contents = prompt;
      }

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          altText: { type: Type.STRING, description: "Descriptive, keyword-optimized alt text (e.g. 'Short textured crop haircut' or 'Modern bronze balayage blowout')." },
          caption: { type: Type.STRING, description: "Luxurious, aesthetic customer-facing caption for the hair style." }
        },
        required: ["altText", "caption"]
      };
    } else if (type === "galleryNarrative") {
      systemInstruction = "You are a senior brand strategist for elite wellness & beauty salons. Write a highly sophisticated, inspiring, and evocative narrative paragraph (max 3 sentences, 35-45 words) that serves as the introductory subtitle or narrative for the salon's style creations and visual portfolios gallery. It should sound extremely premium, bespoke, and artistic.";
      prompt = `Write a signature gallery narrative paragraph for the hair and style studio of "${salonName || "Nexora Salon"}". The boutique vibe is described as: ${query || "Luxury hair artistry and couture styling"}. Style level: ${style || "Warm luxury"}.`;
      contents = prompt;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          narrative: { type: Type.STRING, description: "An artistically crafted luxury brand narrative for the portfolio gallery." }
        },
        required: ["narrative"]
      };
    } else {
      return res.status(400).json({ error: "Invalid request type." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("AI Generation error:", err);
    res.status(500).json({ error: err?.message || "Error generating copy from Gemini API." });
  }
});

// API Route: AI Voice-to-Text Parsing
app.post("/api/voice-to-text", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API Key is not configured on the server.",
    });
  }

  const { audioData, mimeType } = req.body;

  try {
    const audioPart = {
      inlineData: {
        mimeType,
        data: audioData,
      },
    };
    
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        audioPart,
        { text: "Transcribe this audio clip into text. Output ONLY the transcribed text." }
      ],
    });

    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.error("Voice-to-Text error:", err);
    res.status(500).json({ error: err?.message || "Error transcribing audio." });
  }
});

// API Route: CRUD Salon Website Configurations
app.get("/api/sites/:subdomain", (req, res) => {
  const { subdomain } = req.params;
  const site = sitesDb[subdomain];
  if (!site) {
    return res.status(404).json({ error: "Salon website not found." });
  }
  res.json({ success: true, site });
});

app.post("/api/sites", (req, res) => {
  const { subdomain, siteData } = req.body;
  if (!subdomain) {
    return res.status(400).json({ error: "Subdomain is required to publish or save your salon." });
  }
  
  // Save or update salon preset
  sitesDb[subdomain] = {
    ...siteData,
    subdomain,
    status: "published"
  };

  res.json({ success: true, site: sitesDb[subdomain] });
});

// List all subdomains created/available for showcase
app.get("/api/sites", (req, res) => {
  res.json({ success: true, sites: Object.values(sitesDb) });
});

// Serve Vite middleware or fallback static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexora SalonOS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
