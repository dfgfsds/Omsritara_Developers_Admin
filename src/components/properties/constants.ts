import {
  Home,
  Layers,
  ImageIcon,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { PropertyFormData, Property } from "./types";

export const emptyFormData: PropertyFormData = {
  name: "",
  type: "",
  listing_type: "sale",
  description: "",
  address: "",
  area: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  area_size: "",
  area_unit: "sqft",
  price: "",
  price_per_sqft: "",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  floor_number: "",
  total_floors: "",
  furnishing: "",
  facing: "",
  construction_status: "",
  possession_date: "",
  property_age: "",
  parking: "",
  image_url: [],
  map_url: "",
  media_url: "",
  amenities_data: [],
  nearby_places: [],
  owner_name: "",
  developer_name: "",
  project_name: "",
  status: "available",
  isFeatured: false,
  isVerified: false,
};

export const NEARBY_PRESETS = [
  { label: "School", type: "School" },
  { label: "Hospital", type: "Hospital" },
  { label: "Metro", type: "Metro Station" },
  { label: "Mall", type: "Shopping Mall" },
  { label: "Airport", type: "Airport" },
  { label: "Park", type: "Park" },
];

export const formatIndianCurrency = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num === 0) return "₹ 0";
  if (!num || isNaN(num)) return "";
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${num.toLocaleString("en-IN")}`;
};

export const FORM_STEPS = [
  { id: "basic", label: "Basic & Location", shortLabel: "Basic", icon: Home, step: "1", desc: "Title & Address" },
  { id: "specs", label: "Pricing & Specs", shortLabel: "Specs", icon: Layers, step: "2", desc: "Valuation & Area" },
  { id: "media", label: "Media & Links", shortLabel: "Media", icon: ImageIcon, step: "3", desc: "Photos & Tours" },
  { id: "amenities", label: "Amenities & Places", shortLabel: "Amenities", icon: Sparkles, step: "4", desc: "Lifestyle Perks" },
  { id: "settings", label: "Ownership & Status", shortLabel: "Status", icon: ShieldCheck, step: "5", desc: "Attribution & Badges" },
];

// Curated high-resolution architectural photography fallbacks for properties without uploaded photos
export const VILLA_FALLBACKS = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&auto=format&fit=crop&q=85",
];

export const APARTMENT_FALLBACKS = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1600&auto=format&fit=crop&q=85",
];

export const PLOT_FALLBACKS = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1524813686514-a57563d77d61?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=85",
];

export const COMMERCIAL_FALLBACKS = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&auto=format&fit=crop&q=85",
];

export const getPropertyCoverInfo = (property: Property) => {
  const realImages = (property.image_url || []).filter(
    (url) => typeof url === "string" && url.trim().length > 0 && !url.includes("undefined")
  );

  if (realImages.length > 0) {
    return {
      url: realImages[0],
      isReal: true,
      count: realImages.length,
      badgeText: null,
    };
  }

  const typeName = (
    typeof property.type === "object"
      ? property.type?.name || ""
      : String(property.type || "")
  ).toLowerCase();

  const hash = (property._id || property.name || "0")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (typeName.includes("plot") || typeName.includes("land") || typeName.includes("farm")) {
    return {
      url: PLOT_FALLBACKS[hash % PLOT_FALLBACKS.length],
      isReal: false,
      count: 0,
      badgeText: "Verified Plot Concept",
    };
  }
  if (typeName.includes("commercial") || typeName.includes("office") || typeName.includes("shop")) {
    return {
      url: COMMERCIAL_FALLBACKS[hash % COMMERCIAL_FALLBACKS.length],
      isReal: false,
      count: 0,
      badgeText: "Commercial Visual",
    };
  }
  if (typeName.includes("apartment") || typeName.includes("flat")) {
    return {
      url: APARTMENT_FALLBACKS[hash % APARTMENT_FALLBACKS.length],
      isReal: false,
      count: 0,
      badgeText: "Architectural Visual",
    };
  }

  return {
    url: VILLA_FALLBACKS[hash % VILLA_FALLBACKS.length],
    isReal: false,
    count: 0,
    badgeText: "Architectural Visual",
  };
};

export const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case "available":
      return "bg-emerald-700 text-white font-black border-emerald-800 shadow-sm";
    case "sold":
      return "bg-rose-700 text-white font-black border-rose-800 shadow-sm";
    case "under_construction":
      return "bg-amber-600 text-white font-black border-amber-700 shadow-sm";
    case "draft":
      return "bg-purple-800 text-white font-black border-purple-950 shadow-sm";
    default:
      return "bg-slate-800 text-white font-black border-slate-900 shadow-sm";
  }
};
